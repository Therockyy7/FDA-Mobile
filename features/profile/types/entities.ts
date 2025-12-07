// Database entities for profile domain

export interface ActivityEntity {
  id: string;
  title: string;
  description?: string;
  type: string; // We'll use enum for this
  icon: string;
  icon_color: string;
  created_at: string;
  user_id: string;
  related_id?: string;
}

export interface UserProfileEntity {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// Domain models
export interface Activity extends ActivityEntity {
  // Add computed properties if needed
}

export interface UserProfile extends UserProfileEntity {
  // Add computed properties if needed  
}