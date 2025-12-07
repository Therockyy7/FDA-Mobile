import { ActivityType } from './enums';

// Data Transfer Objects for profile domain

export interface CreateActivityDto {
  title: string;
  description?: string;
  type: ActivityType;
  icon?: string;
  icon_color?: string;
  related_id?: string;
}

export interface UpdateUserProfileDto {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserStatsDto {
  notes_count: number;
  favorite_notes_count: number;
  categories_count: number;
  recent_activities_count: number;
}