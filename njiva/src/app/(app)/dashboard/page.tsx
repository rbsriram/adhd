'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Sidebar from '@/components/dashboard/Sidebar';
import TextArea from '@/components/ui/TextArea';
import EntryList from '@/components/dashboard/EntryList';
import Button from '@/components/ui/Button';

interface Entry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]); // Define Entry type
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('do');
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const router = useRouter();

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
  
      if (response.ok) {
        const data = await response.json()
        console.log('[DashboardPage] Fetched entries:', data) // Log API response
        setEntries(data)
      } else {
        console.warn('[DashboardPage] Failed to fetch entries')
      }
    } catch (error) {
      console.error('[DashboardPage] Error fetching entries:', error)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('njiva-session='))
        ?.split('=')[1];

      if (!sessionToken) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-session', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (!response.ok) {
          router.push('/');
          return;
        }

        const { firstName } = await response.json();
        setFirstName(firstName);
        await fetchEntries();
      } catch (error) {
        router.push('/');
      }
    };

    fetchUserData();
  }, [router]);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      console.warn('[DashboardPage] Attempted to submit empty input')
      return;
    }
    console.log('[DashboardPage] Submitting input:', inputText) // Log the input
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });

      if (response.ok) {
        setInputText('');
        await fetchEntries();
      }
    } catch (error) {
      console.error('[DashboardPage] Error submitting input:', error);
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    document.cookie = 'njiva-session=; Max-Age=0; path=/;';
    router.push('/');
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchEntries();
      }
    } catch (error) {
      console.error('[DashboardPage] Error deleting entry:', error);
    }
  };

  const handleEdit = async (id: string, updatedContent: string) => {
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: updatedContent }),
      });

      if (response.ok) {
        await fetchEntries();
      }
    } catch (error) {
      console.error('[DashboardPage] Error editing entry:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <span className="font-medium">{firstName}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-background border border-foreground/10 rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)]">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => setActiveSection(section)}
        />
        <main className="flex-1 flex flex-col pb-16 md:pb-0">
          <div className="flex-1 overflow-auto px-4">
            <EntryList
              entries={entries}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
          <div className="p-4 border-t">
            <div className="max-w-3xl mx-auto relative">
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your thoughts..."
                autoResize
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              {inputText.trim() && (
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
