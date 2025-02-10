'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Sidebar from '@/components/dashboard/Sidebar';
import TextArea from '@/components/ui/TextArea';
import EntryList from '@/components/dashboard/EntryList';
import Button from '@/components/ui/Button';
import { getUserLocalDateTime } from '@/lib/utils/dateTimeUtils';
import { SectionType } from '@/components/dashboard/Sidebar';

import DoView from '@/components/views/DoView';
import PlanView from '@/components/views/PlanView';
import ThinkView from '@/components/views/ThinkView';
import DatesView from '@/components/views/DatesView';
import ShopView from '@/components/views/ShopView';

interface Entry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  console.log('[DashboardPage] Component is rendering...');

  const [entries, setEntries] = useState<Entry[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrganizeButton, setShowOrganizeButton] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('do');
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<SectionType>('main');
  const router = useRouter();

  useEffect(() => {
    console.log('[DashboardPage] Validating session...');
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      const response = await fetch('/api/auth/get-session-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        router.push('/');
        return;
      }

      const { token } = await response.json();
      setSessionToken(token);

      const validationResponse = await fetch('/api/auth/validate-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (validationResponse.ok) {
        const data = await validationResponse.json();
        setFirstName(data.firstName);
        fetchEntries();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('[DashboardPage] Error validating session:', error);
      router.push('/');
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Entries count: ${data.length}, Show Organize: ${data.length >= 3}`);
        setEntries(data);
        setShowOrganizeButton(data.length >= 3);
      }
    } catch (error) {
      console.error('[DashboardPage] Error fetching entries:', error);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: inputText.trim() }),
      });

      if (response.ok) {
        setInputText('');
        fetchEntries();
      }
    } catch (error) {
      console.error('[DashboardPage] Error submitting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async (id: string) => {
    console.log(`[DashboardPage] Attempting to delete entry: ${id}`);
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });


      if (response.ok) {
        console.log(`[DashboardPage] Entry deleted successfully: ${id}`);
        fetchEntries();
      } else {
        console.warn(`[DashboardPage] Failed to delete entry: ${id}`);
      }
    } catch (error) {
      console.error(`[DashboardPage] Error deleting entry: ${id}`, error);
    }
  };


  const handleEdit = async (id: string, updatedContent: string) => {
    console.log(`[DashboardPage] Attempting to edit entry: ${id}`);
    try {
      const response = await fetch('/api/entries/pending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ id, content: updatedContent }),
      });

        


      if (response.ok) {
        console.log(`[DashboardPage] Entry updated successfully: ${id}`);
        fetchEntries();
      } else {
        console.warn(`[DashboardPage] Failed to update entry: ${id}`);
      }
    } catch (error) {
      console.error(`[DashboardPage] Error editing entry: ${id}`, error);
    }
  };
  
  const handleOrganize = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/entries/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          userLocalDate: new Date().toISOString() 
        })
      });
  
      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleLogout = async () => {
    console.log('[DashboardPage] Logging out user...');
    try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          document.cookie = "njiva-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          router.push('/');
        } catch (error) {
        console.error('[DashboardPage] Logout failed:', error);
        }
  };    


  if (!sessionToken || firstName === null) {
    return <div className="flex justify-center items-center h-screen text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 cursor-default select-none">
      <header className="border-b border-gray-800 bg-gray-900 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" className="cursor-default pointer-events-none" />
          <div className="relative flex items-center gap-4">
          {showOrganizeButton && (
              <Button 
                onClick={handleOrganize} 
                disabled={isProcessing} 
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isProcessing ? "Processing..." : "Organize"}
              </Button>
            )}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <span className="cursor-default">{firstName}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-10 w-48 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-gray-700 text-red-500">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar activeSection={activeSection} onSectionChange={(section) => {
          setActiveSection(section);
          setCurrentView(section);
        }} />
        <main className="flex-1 flex flex-col">
          {currentView === 'main' ? (
            <>
              <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8">
                <EntryList entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
              </div>
              <div className="sticky bottom-0 p-4 md:bottom-4 border-t border-gray-800 bg-gray-900 mb-16 md:mb-0">
                <div className="max-w-3xl mx-auto relative">
                  <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your thoughts..."
                    autoResize
                    className="pr-12 max-h-16"
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
            </>
          ) : currentView === 'do' ? (
            <DoView onBack={() => setCurrentView('main')} />
          ) : currentView === 'plan' ? (
            <PlanView onBack={() => setCurrentView('main')} />
          ) : currentView === 'think' ? (
            <ThinkView onBack={() => setCurrentView('main')} />
          ) : currentView === 'dates' ? (
            <DatesView onBack={() => setCurrentView('main')} />
          ) : currentView === 'shop' ? (
            <ShopView onBack={() => setCurrentView('main')} />
          ) : null}
        </main>
      </div>
    </div>
   );
}
