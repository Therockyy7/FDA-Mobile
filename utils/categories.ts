export const PREDEFINED_CATEGORIES = [
  { value: 'general', label: 'General', color: '#6b7280' },
  { value: 'work', label: 'Work', color: '#3b82f6' },
  { value: 'personal', label: 'Personal', color: '#10b981' },
  { value: 'ideas', label: 'Ideas', color: '#f59e0b' },
  { value: 'study', label: 'Study', color: '#8b5cf6' },
  { value: 'travel', label: 'Travel', color: '#06b6d4' },
  { value: 'recipes', label: 'Recipes', color: '#ef4444' },
  { value: 'health', label: 'Health', color: '#84cc16' },
];

export const getCategoryColor = (category: string): string => {
  const predefined = PREDEFINED_CATEGORIES.find(c => c.value === category);
  return predefined?.color || '#6b7280';
};

export const getCategoryLabel = (category: string): string => {
  const predefined = PREDEFINED_CATEGORIES.find(c => c.value === category);
  return predefined?.label || category;
};