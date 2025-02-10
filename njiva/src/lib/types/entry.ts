// lib/types/entry.ts
export type Category = 'Do' | 'Plan' | 'Think' | 'Shopping List' | 'Important Dates/Events';

export interface Entry {
  id: string
  user_id: string
  content: string
  type?: Category
  date?: string
  time?: string
  recurrence?: string
  completed?: boolean
  created_at: Date
  updated_at: Date
}

export interface ProcessedEntries {
    Do: Entry[];
    Plan: Entry[];
    Think: Entry[];
    'Shopping List': Entry[];
    'Important Dates/Events': Entry[];
  }

export interface DateTimeConfig {
  timezone: string;
  currentDate: string;
}

   
   // Also creating type for pending entries
   export interface PendingEntry {
    id: string
    user_id: string
    content: string
    created_at: Date
    updated_at: Date
   }
   
   // And historic entries
   export interface HistoricEntry {
    id: string
    user_id: string
    content: string
    created_at: Date
    updated_at: Date
   }