// Centralized exports for profile types  
export * from './entities';
export * from './dtos';
export * from './enums';

// Legacy aliases for backward compatibility
export type {
  CreateActivityDto as CreateActivityData,
  UpdateUserProfileDto as UpdateUserProfileData,
  UserStatsDto as UserStats
} from './dtos';