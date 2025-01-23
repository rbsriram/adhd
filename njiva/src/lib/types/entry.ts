// lib/types/entry.ts
export interface Entry {
    id: string
    user_id: string
    content: string
    type?: 'do' | 'plan' | 'think' | 'dates' | 'shop'
    date?: string
    time?: string
    recurrence?: string
    completed?: boolean
    created_at: Date
    updated_at: Date
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