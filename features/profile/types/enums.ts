// Enums and constants for profile domain

export enum ActivityType {
  NOTE_CREATED = 'note_created',
  NOTE_UPDATED = 'note_updated', 
  NOTE_DELETED = 'note_deleted',
  NOTE_SHARED = 'note_shared',
  USER_ACTION = 'user_action',
}

export enum ActivityIcon {
  PLUS_CIRCLE = 'plus-circle',
  EDIT = 'edit',
  TRASH = 'trash-2', 
  SHARE = 'share',
  ACTIVITY = 'activity',
}

export enum ActivityColor {
  GREEN = 'bg-green-500',
  ORANGE = 'bg-orange-500',
  RED = 'bg-red-500',
  BLUE = 'bg-blue-500', 
  GRAY = 'bg-gray-500',
}

// Activity type to icon/color mappings
export const ACTIVITY_CONFIG = {
  [ActivityType.NOTE_CREATED]: {
    icon: ActivityIcon.PLUS_CIRCLE,
    color: ActivityColor.GREEN,
  },
  [ActivityType.NOTE_UPDATED]: {
    icon: ActivityIcon.EDIT,
    color: ActivityColor.ORANGE,
  },
  [ActivityType.NOTE_DELETED]: {
    icon: ActivityIcon.TRASH,
    color: ActivityColor.RED,
  },
  [ActivityType.NOTE_SHARED]: {
    icon: ActivityIcon.SHARE,
    color: ActivityColor.BLUE,
  },
  [ActivityType.USER_ACTION]: {
    icon: ActivityIcon.ACTIVITY,
    color: ActivityColor.GRAY,
  },
} as const;

// Constants
export const ACTIVITY_LIMITS = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;