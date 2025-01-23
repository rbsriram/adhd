// components/dashboard/EntryList.tsx
'use client';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';

interface Entry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, updatedContent: string) => Promise<void>;
}

export default function EntryList({ entries, onDelete, onEdit }: EntryListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntries, setEditedEntries] = useState(entries);

  const handleEditChange = (id: string, content: string) => {
    setEditedEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, content } : entry))
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {!isEditing && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setEditedEntries(entries); // Initialize edited entries
              setIsEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              for (const entry of editedEntries) {
                await onEdit(entry.id, entry.content); // Call the edit handler
              }
              setIsEditing(false);
            }}
          >
            Save Changes
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {editedEntries.map((entry) => (
          <div key={entry.id} className="group relative">
            {isEditing ? (
              <div className="relative">
                <TextArea
                  value={entry.content}
                  onChange={(e) => handleEditChange(entry.id, e.target.value)}
                  autoResize
                />
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-foreground/10">
                <pre className="font-sans whitespace-pre-wrap text-foreground">
                  {entry.content}
                </pre>
                <div className="mt-2">
                  <span className="text-sm text-foreground/50">
                    {new Date(entry.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
