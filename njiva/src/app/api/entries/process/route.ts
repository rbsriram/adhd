// api/entries/process/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { EntryProcessor } from '@/lib/services/entryProcessor';
import { toUTC } from '@/lib/utils/dateTimeUtils';

interface ProcessedItem {
 item: string;
 date: string | null;
 time: string | null;
 recurrence: string | null;
 completed: boolean;
}

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const parseSessionToken = (token: string) => {
 const tokenParts = token.split('-');
 if (tokenParts.length < 10 || tokenParts[0] !== 'custom' || tokenParts[1] !== 'session' || tokenParts[2] !== 'token') {
   return { error: 'Invalid token format' };
 }
 const userId = `${tokenParts[3]}-${tokenParts[4]}-${tokenParts[5]}-${tokenParts[6]}-${tokenParts[7]}`;
 return userId ? { userId } : { error: 'Invalid user ID' };
};

async function validateSessionToken() {
 const cookieStore = await cookies();
 const sessionToken = cookieStore.get('njiva-session')?.value;
 if (!sessionToken) return { error: 'No session token found' };

 const { userId, error } = parseSessionToken(sessionToken);
 if (error) return { error };

 const { data: user, error: dbError } = await supabase
   .from('users')
   .select('user_id')
   .eq('user_id', userId)
   .single();

 if (dbError || !user) return { error: 'Unauthorized' };
 return { userId };
}

export async function POST(request: Request) {
 const { userId, error } = await validateSessionToken();
 if (error) return NextResponse.json({ error }, { status: 401 });
 if (!userId) return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });

 const { userLocalDate } = await request.json();
 if (!userLocalDate) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

 try {
   await supabase.rpc('begin_transaction');

   const { data: pendingEntries } = await supabase
     .from('pending_entries')
     .select('content')
     .eq('user_id', userId);

   if (!pendingEntries?.length) {
     await supabase.rpc('rollback_transaction');
     return NextResponse.json({ error: 'No entries found' }, { status: 404 });
   }

   const content = pendingEntries.map(e => e.content).join('\n');
   const processedEntries = await EntryProcessor.process(content, userLocalDate, userId);

   if (!processedEntries) {
     await supabase.rpc('rollback_transaction');
     throw new Error('Failed to process entries');
   }

   const { error: insertError } = await supabase.from('organized_entries').insert(
     Object.entries(processedEntries).flatMap(([type, items]) =>
       items.map((item: ProcessedItem) => ({
         user_id: userId,
         content: item.item,
         type: type.toLowerCase(),
         date: item.date,
         time: toUTC(item.date, item.time),
        //  time: item.time ? new Date(`${item.date}T${item.time}:00`).toISOString().split('T')[1].slice(0, 5) : null,
         recurrence: item.recurrence,
         completed: item.completed
       }))
     )
   );

   if (insertError) {
     await supabase.rpc('rollback_transaction');
     throw insertError;
   }

   const { error: historicError } = await supabase.from('historic_entries').insert(
     pendingEntries.map(e => ({ user_id: userId, content: e.content }))
   );

   if (historicError) {
     await supabase.rpc('rollback_transaction');
     throw historicError;
   }

   const { error: deleteError } = await supabase
     .from('pending_entries')
     .delete()
     .eq('user_id', userId);

   if (deleteError) {
     await supabase.rpc('rollback_transaction');
     throw deleteError;
   }

   await supabase.rpc('commit_transaction');
   return NextResponse.json(processedEntries);

 } catch (error) {
   await supabase.rpc('rollback_transaction');
   console.error('Processing error:', error);
   return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
 }
}