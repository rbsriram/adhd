'use client';

import { useState } from 'react';
import { ArrowLeft, Edit2, Trash, Calendar, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import { useEntries } from '@/lib/services/viewService';
import { formatDateTime } from '@/lib/utils/dateTimeUtils';

interface DatesViewProps {
  onBack: () => void;
}

export default function DatesView({ onBack }: DatesViewProps) {
  const { entries, updateEntry, deleteEntry } = useEntries('important dates');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<string | null>(null);

  const startEditing = (entry: any) => {
    setEditContent(entry.content);
    setEditDate(entry.date);
    setIsEditing(entry.id);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) {
      setIsEditing(null);
      return;
    }
    await updateEntry(id, { content: editContent.trim(), date: editDate });
    setIsEditing(null);
  };

  // Filter entries: Show upcoming events (within next 30 days), move past events below
  const currentDate = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setDate(currentDate.getDate() + 30);

  const upcomingEvents = entries.filter(
    (entry) => entry.date && new Date(entry.date) >= currentDate && new Date(entry.date) <= oneMonthLater
  );
  const pastEvents = entries.filter((entry) => entry.date && new Date(entry.date) < currentDate);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 bg-background/95 backdrop-blur z-10 px-4 py-3 border-b border-border/40">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <h2 className="text-lg font-medium">Important Dates</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-1">
          {upcomingEvents.map((entry) => (
            <div
              key={entry.id}
              className={`group relative flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/5 transition-all duration-200 ${
                isEditing ? 'opacity-0' : ''
              } ${entry.id === isEditing ? 'opacity-100 z-30' : ''}`}
            >
              <Calendar className="h-5 w-5 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.content}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.date, null)?.date}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditing(entry)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => deleteEntry(entry.id)}>
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>

              {isEditing === entry.id && (
                <>
                  <div className="fixed inset-0 bg-background/80 z-10" />
                  <div className="absolute inset-0 bg-background p-2 rounded-lg shadow-lg z-20">
                    <TextArea 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)} 
                      className="w-full text-sm" 
                      autoFocus 
                    />
                    <input 
                      type="date" 
                      value={editDate || ''} 
                      onChange={(e) => setEditDate(e.target.value)} 
                      className="bg-background border rounded px-2 text-sm mt-2 text-foreground [color-scheme:dark]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleEdit(entry.id)}>Save</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {pastEvents.length > 0 && (
            <div className="mt-6 opacity-60">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Past Events</h3>
              {pastEvents.map((entry) => (
                <div key={entry.id} className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/5 transition-all duration-200">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.content}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.date, null)?.date}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditing(entry)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => deleteEntry(entry.id)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
