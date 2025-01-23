// app/api/entries/historic/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { user_id, content } = await request.json()

 try {
   const { data, error } = await supabase
     .from('historic_entries')
     .insert([{ user_id, content }])
     .select()

   if (error) throw error
   return NextResponse.json(data[0])
 } catch (error) {
   return NextResponse.json({ error: 'Failed to create historic entry' }, { status: 500 })
 }
}

export async function GET(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { searchParams } = new URL(request.url)
 const userId = searchParams.get('userId')

 try {
   const { data, error } = await supabase
     .from('historic_entries')
     .select()
     .eq('user_id', userId)
     .order('created_at', { ascending: false })

   if (error) throw error
   return NextResponse.json(data)
 } catch (error) {
   return NextResponse.json({ error: 'Failed to fetch historic entries' }, { status: 500 })
 }
}