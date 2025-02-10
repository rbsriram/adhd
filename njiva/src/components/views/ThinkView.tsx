'use client';

import { useState } from 'react';
import { ArrowLeft, Edit2, Trash } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import { useEntries } from '@/lib/services/viewService';

interface ThinkViewProps {
  onBack: () => void;
}

export default function ThinkView({ onBack }: ThinkViewProps) {
  const { entries, updateEntry, deleteEntry } = useEntries('think');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEditing = (entry: any) => {
    setEditContent(entry.content);
    setIsEditing(entry.id);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) {
      setIsEditing(null);
      return;
    }
    await updateEntry(id, { content: editContent.trim() });
    setIsEditing(null);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 bg-background/95 backdrop-blur z-10 px-4 py-3 border-b border-border/40">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <h2 className="text-lg font-medium">Thoughts & Ideas</h2>
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.content}</p>
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
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleEdit(entry.id)}>Save</Button>
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
