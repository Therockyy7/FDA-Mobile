import { NoteCategory } from '~/features/notes/types/enums';

export const PREDEFINED_CATEGORIES = [
  { value: NoteCategory.GENERAL, label: 'General', color: '#6b7280' },
  { value: NoteCategory.WORK, label: 'Work', color: '#3b82f6' },
  { value: NoteCategory.PERSONAL, label: 'Personal', color: '#10b981' },
  { value: NoteCategory.IDEAS, label: 'Ideas', color: '#f59e0b' },
  { value: NoteCategory.STUDY, label: 'Study', color: '#8b5cf6' },
  { value: NoteCategory.TRAVEL, label: 'Travel', color: '#06b6d4' },
  { value: NoteCategory.RECIPES, label: 'Recipes', color: '#ef4444' },
  { value: NoteCategory.HEALTH, label: 'Health', color: '#84cc16' },
];

export const getCategoryColor = (category: string): string => {
  const predefined = PREDEFINED_CATEGORIES.find(c => c.value === category);
  return predefined?.color || '#6b7280';
};

export const getCategoryLabel = (category: string): string => {
  const predefined = PREDEFINED_CATEGORIES.find(c => c.value === category);
  return predefined?.label || category;
};