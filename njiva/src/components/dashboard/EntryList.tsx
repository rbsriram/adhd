'use client';

import { useState, useEffect } from 'react';
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

  // Sync editedEntries with the entries prop whenever it changes
  useEffect(() => {
    setEditedEntries(entries);
  }, [entries]);

  const handleEditChange = (id: string, content: string) => {
    setEditedEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, content } : entry))
    );
  };

  const handleSaveChanges = async () => {
    for (const entry of editedEntries) {
      try {
        if (entry.content.trim() !== '') {
          await onEdit(entry.id, entry.content);
        }
      } catch (error) {
        console.error(`[EntryList] Failed to edit entry with ID: ${entry.id}`, error);
      }
    }
    setIsEditing(false);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error(`[EntryList] Failed to delete entry with ID: ${id}`, error);
    }
  };

  return (
      <div className="max-w-3xl mx-auto py-4 space-y-2"> {/* Reduced vertical spacing */}
        {!isEditing && entries.length > 0 && (
          <div className="sticky top-0 bg-gray-900 z-10 flex justify-end py-2 flex justify-end">
            <Button variant="ghost" onClick={() => {
              setEditedEntries(entries);
              setIsEditing(true);
            }}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
    
        {/* Edit actions */}
        {isEditing && (
          <div className="flex justify-end gap-2 mb-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
    
        <div className="space-y-2 mb-16"> {/* Added bottom margin for mobile */}
          {editedEntries.length > 0 ? (
            editedEntries.map((entry) => (
              <div key={entry.id} className="group">
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
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-background/50"> {/* Adjusted padding */}
                    <pre className="font-sans text-sm whitespace-pre-wrap">{entry.content}</pre>
                    <div className="mt-1"> {/* Reduced margin */}
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-foreground/50">No entries available</div>
          )}
        </div>
      </div>
    );
}
