'use client';

import { useState } from 'react';
import { ArrowLeft, Edit2, Trash, CheckCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import { formatDateTime } from '@/lib/utils/dateTimeUtils';
import { useEntries } from '@/lib/services/viewService';

interface DoViewProps {
  onBack: () => void;
}

export default function DoView({ onBack }: DoViewProps) {
  const { entries, updateEntry, deleteEntry, toggleComplete } = useEntries('do');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editTime, setEditTime] = useState<string | null>(null);

  const startEditing = (entry: any) => {
    setEditContent(entry.content);
    setEditDate(entry.date);
    setEditTime(entry.time);
    setIsEditing(entry.id);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) {
      setIsEditing(null);
      return;
    }
    await updateEntry(id, { content: editContent.trim(), date: editDate, time: editTime });
    setIsEditing(null);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 bg-background/95 backdrop-blur z-10 px-4 py-3 border-b border-border/40">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <h2 className="text-lg font-medium">Do</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`group relative flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/5 transition-all duration-200 ${
                isEditing ? 'opacity-0' : ''
              } ${entry.id === isEditing ? 'opacity-100 z-30' : ''}`}
            >
              <button
                onClick={() => toggleComplete(entry.id, entry.completed)}
                className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                  entry.completed ? 'border-green-500' : 'border-gray-500 hover:border-green-500'
                }`}
              >
                {entry.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-all ${
                  entry.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {entry.content}
                </p>
                {(entry.date || entry.time) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">
                      {formatDateTime(entry.date, entry.time)?.date}
                      {entry.time && ` · ${formatDateTime(entry.date, entry.time)?.time}`}
                    </span>
                  </p>
                )}
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
                    <div className="flex flex-col">
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <input
                          type="date"
                          value={editDate || ''}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-background border rounded px-2 text-sm text-foreground [color-scheme:dark]"
                        />
                        <input
                          type="time"
                          value={editTime || ''}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="bg-background border rounded px-2 text-sm text-foreground [color-scheme:dark]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleEdit(entry.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
