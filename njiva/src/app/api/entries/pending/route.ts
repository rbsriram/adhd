import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const parseSessionToken = (token: string) => {
  const tokenParts = token.split('-');
  if (
    tokenParts.length < 10 ||
    tokenParts[0] !== 'custom' ||
    tokenParts[1] !== 'session' ||
    tokenParts[2] !== 'token'
  ) {
    return { error: 'Invalid token format' };
  }

  const userId = `${tokenParts[3]}-${tokenParts[4]}-${tokenParts[5]}-${tokenParts[6]}-${tokenParts[7]}`;
  const firstName = tokenParts[8];
  return { userId, firstName };
};

async function validateSessionToken() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('njiva-session')?.value;

  if (!sessionToken) {
    return { error: 'No session token found' };
  }

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

export async function GET() {
  const { userId, error } = await validateSessionToken();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { data, error: fetchError } = await supabase
    .from('pending_entries')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (fetchError) return NextResponse.json({ error: fetchError }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { userId, error } = await validateSessionToken();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { content } = await request.json();
  const entry = {
    content,
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const { data, error: insertError } = await supabase
    .from('pending_entries')
    .insert([entry])
    .select();

  if (insertError) return NextResponse.json({ error: insertError }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PUT(request: Request) {
  const { userId, error } = await validateSessionToken();

  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id, content } = await request.json();
  const { error: updateError } = await supabase
    .from('pending_entries')
    .update({
      content,
      updated_at: new Date(),
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (updateError) return NextResponse.json({ error: updateError }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { userId, error } = await validateSessionToken();

  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id } = await request.json();
  const { error: deleteError } = await supabase
    .from('pending_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (deleteError) return NextResponse.json({ error: deleteError }, { status: 500 });
  return NextResponse.json({ success: true });
}
