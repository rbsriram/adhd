export type Category = 'Do' | 'Plan' | 'Think' | 'Shopping List' | 'Important Dates/Events';

export const CATEGORIES: Record<Category, string> = {
  'Do': 'Actions to complete (tasks, to-dos, reminders) - EXCEPT shopping items',
  'Plan': 'Things to research, learn, explore, or prepare',
  'Think': 'Ideas, reflections, concepts, creative thoughts',
  'Shopping List': 'Any items to buy or purchase',
  'Important Dates/Events': 'Birthdays, anniversaries, deadlines'
};