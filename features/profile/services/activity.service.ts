import { supabase } from '~/lib/supabase';
import type { ApiListResponse } from '~/types/api';
import type {
  Activity,
  CreateActivityDto,
} from '../types';
import { ACTIVITY_CONFIG, ActivityType } from '../types/enums';

export class ActivityService {
  private static tableName = 'activities';

  // Get recent activities for the current user
  static async getRecentActivities(limit: number = 10): Promise<ApiListResponse<Activity>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: 'User not authenticated' };
      }

      const { data: activities, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get activities error:', error);
        return { data: [], error: error.message };
      }

      return { data: activities || [], error: null };
    } catch (error) {
      console.error('Get activities error:', error);
      return { data: [], error: 'Failed to fetch activities' };
    }
  }

  // Create a new activity
  static async createActivity(data: CreateActivityDto): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const config = ACTIVITY_CONFIG[data.type];

      await supabase
        .from(this.tableName)
        .insert({
          title: data.title,
          description: data.description,
          type: data.type,
          icon: data.icon || config.icon,
          icon_color: data.icon_color || config.color,
          user_id: user.id,
          related_id: data.related_id,
        });
    } catch (error) {
      console.error('Create activity error:', error);
    }
  }
}