// components/dashboard/Sidebar.tsx

import { ListTodo, Layout, Brain, Calendar, ShoppingBag } from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
 }
 
const SECTIONS = [
  { id: 'do', icon: ListTodo, label: 'Do' },
  { id: 'plan', icon: Layout, label: 'Plans' },
  { id: 'think', icon: Brain, label: 'Ideas' },
  { id: 'dates', icon: Calendar, label: 'Dates' },
  { id: 'shop', icon: ShoppingBag, label: 'Shop' }
]

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 border-r border-foreground/10 p-4">
        {SECTIONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2
              ${activeSection === id 
                ? 'bg-foreground/10 text-foreground' 
                : 'text-foreground/70 hover:bg-foreground/5'
              }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-foreground/10">
        <div className="flex justify-around py-2">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`flex flex-col items-center p-2
                ${activeSection === id 
                  ? 'text-foreground' 
                  : 'text-foreground/70'
                }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}