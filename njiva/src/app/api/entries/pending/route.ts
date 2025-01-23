import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function validateSessionToken() {
  const cookieStore = await cookies(); // Await the cookies() function
  const sessionToken = cookieStore.get('njiva-session')?.value;

  if (!sessionToken) return null;

  const userId = sessionToken.split('-')[3];
  const { data: user } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  return user?.user_id;
}

export async function GET(request: Request) {
  const userId = await validateSessionToken();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('pending_entries')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  console.log('[POST] Received request to add entry')
  const userId = await validateSessionToken();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await request.json();
  const entry = {
    content,
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const { data, error } = await supabase
    .from('pending_entries')
    .insert([entry])
    .select();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PUT(request: Request) {
  const userId = await validateSessionToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, content } = await request.json();
  const { error } = await supabase
    .from('pending_entries')
    .update({
      content,
      updated_at: new Date(),
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const userId = await validateSessionToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase
    .from('pending_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}
