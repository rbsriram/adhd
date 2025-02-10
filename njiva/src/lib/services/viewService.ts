// lib/services/viewService.ts
import { useState, useEffect } from 'react';

interface Entry {
 id: string;
 content: string;
 date: string | null;
 time: string | null;
 recurrence: string | null;
 completed: boolean;
}

type EntryType = 'do' | 'plan' | 'think' | 'dates' | 'shopping' | 'important dates';

export function useEntries(type: EntryType) {
 const [entries, setEntries] = useState<Entry[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   fetchEntries();
 }, [type]);

 const fetchEntries = async () => {
   setIsLoading(true);
   setError(null);
   try {
     const response = await fetch(`/api/entries/organized?type=${type}`);
     if (response.ok) {
       const data = await response.json();
       setEntries(data.sort((a: Entry, b: Entry) => {
         if (a.completed !== b.completed) return a.completed ? 1 : -1;
         if (!a.date || !b.date) return 0;
         return new Date(a.date).getTime() - new Date(b.date).getTime();
       }));
     }
   } catch (err) {
     setError('Failed to fetch entries');
     console.error(err);
   } finally {
     setIsLoading(false);
   }
 };

 const updateEntry = async (id: string, updates: Partial<Entry>) => {
   try {
     const response = await fetch('/api/entries/organized', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ id, ...updates })
     });
     
     if (response.ok) {
       setEntries(prev => prev.map(entry => 
         entry.id === id ? { ...entry, ...updates } : entry
       ));
       return true;
     }
     return false;
   } catch (error) {
     console.error('Error updating entry:', error);
     return false;
   }
 };

 const deleteEntry = async (id: string) => {
   try {
     const response = await fetch('/api/entries/organized', {
       method: 'DELETE',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ id })
     });
     
     if (response.ok) {
       setEntries(prev => prev.filter(entry => entry.id !== id));
       return true;
     }
     return false;
   } catch (error) {
     console.error('Error deleting entry:', error);
     return false;
   }
 };

 const toggleComplete = async (id: string, currentStatus: boolean) => {
   return await updateEntry(id, { completed: !currentStatus });
 };

 return {
   entries,
   isLoading,
   error,
   fetchEntries,
   updateEntry,
   deleteEntry,
   toggleComplete
 };
}