// app/api/entries/organized/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { content, type, date, time, recurrence } = await request.json()
 const { data: { session } } = await supabase.auth.getSession()

 if (!session) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 try {
   const { data, error } = await supabase
     .from('organized_entries')
     .insert([{ 
       content,
       type,
       date,
       time,
       recurrence,
       user_id: session.user.id 
     }])
     .select()

   if (error) throw error
   return NextResponse.json(data[0])
 } catch (error) {
   return NextResponse.json(
     { error: 'Failed to create organized entry' }, 
     { status: 500 }
   )
 }
}

export async function GET(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { searchParams } = new URL(request.url)
 const type = searchParams.get('type')
 const { data: { session } } = await supabase.auth.getSession()

 if (!session) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 try {
   let query = supabase
     .from('organized_entries')
     .select()
     .eq('user_id', session.user.id)

   if (type) {
     query = query.eq('type', type)
   }

   const { data, error } = await query.order('created_at', { ascending: true })

   if (error) throw error
   return NextResponse.json(data)
 } catch (error) {
   return NextResponse.json(
     { error: 'Failed to fetch organized entries' },
     { status: 500 }
   )
 }
}

export async function PUT(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { id, content, type, date, time, recurrence, completed } = await request.json()
 const { data: { session } } = await supabase.auth.getSession()

 if (!session) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 try {
   const { data, error } = await supabase
     .from('organized_entries')
     .update({ 
       content, 
       type, 
       date, 
       time, 
       recurrence,
       completed
     })
     .eq('id', id)
     .eq('user_id', session.user.id)
     .select()

   if (error) throw error
   return NextResponse.json(data[0])
 } catch (error) {
   return NextResponse.json(
     { error: 'Failed to update organized entry' },
     { status: 500 }
   )
 }
}

export async function DELETE(request: Request) {
 const supabase = createRouteHandlerClient({ cookies })
 const { id } = await request.json()
 const { data: { session } } = await supabase.auth.getSession()

 if (!session) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 try {
   const { error } = await supabase
     .from('organized_entries')
     .delete()
     .eq('id', id)
     .eq('user_id', session.user.id)

   if (error) throw error
   return NextResponse.json({ success: true })
 } catch (error) {
   return NextResponse.json(
     { error: 'Failed to delete organized entry' },
     { status: 500 }
   )
 }
}