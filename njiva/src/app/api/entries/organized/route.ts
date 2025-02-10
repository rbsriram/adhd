// app/api/entries/organized/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserFromSession() {
  const cookieStore = await cookies(); // ✅ Await cookies()
  const sessionToken = cookieStore.get('njiva-session')?.value;
  if (!sessionToken) return { error: 'Unauthorized', status: 401 };

  const tokenParts = sessionToken.split('-');
  if (tokenParts.length < 5) return { error: 'Invalid session', status: 401 };

  const userId = `${tokenParts[3]}-${tokenParts[4]}-${tokenParts[5]}-${tokenParts[6]}-${tokenParts[7]}`;

  const { data: user, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (error || !user) return { error: 'Unauthorized', status: 401 };

  return { userId };
}


export async function POST(request: Request) {
  const { userId, error, status } = await getUserFromSession();
  if (error) return NextResponse.json({ error }, { status });

  const { content, type, date, time, recurrence } = await request.json();

  try {
    const { data, error } = await supabase
      .from('organized_entries')
      .insert([
        {
          content,
          type,
          date,
          time,
          recurrence,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create organized entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId, error, status } = await getUserFromSession();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let query = supabase
      .from('organized_entries')
      .select()
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type).order('completed').order('date', { ascending: true });
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch organized entries' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId, error, status } = await getUserFromSession();
  if (error) return NextResponse.json({ error }, { status });

  const { id, content, type, date, time, recurrence, completed } = await request.json();

  try {
    const { data, error } = await supabase
      .from('organized_entries')
      .update({ content, type, date, time, recurrence, completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update organized entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId, error, status } = await getUserFromSession();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await request.json();

  try {
    const { error } = await supabase.from('organized_entries').delete().eq('id', id).eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete organized entry' }, { status: 500 });
  }
}
