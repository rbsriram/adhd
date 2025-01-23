// components/sections/DoSection.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Entry } from '@/lib/types/entry'

export default function DoSection() {
 const [entries, setEntries] = useState<Entry[]>([])

 useEffect(() => {
   fetchEntries()
 }, [])

 async function fetchEntries() {
   const response = await fetch('/api/entries/organized?type=do')
   if (response.ok) {
     const data = await response.json()
     setEntries(data)
   }
 }

 return (
   <div className="space-y-4">
     <h2 className="text-2xl font-bold">Tasks & To-dos</h2>
     {entries.map(entry => (
       <div key={entry.id} className="p-4 border rounded-lg">
         <p>{entry.content}</p>
         {entry.date && (
           <p className="text-sm text-gray-500">Due: {entry.date}</p>
         )}
       </div>
     ))}
   </div>
 )
}
