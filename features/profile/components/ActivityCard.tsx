import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "../types";

interface ActivityCardProps {
  activity: Activity;
  variant?: 'default' | 'compact';
}

export function ActivityCard({ activity, variant = 'default' }: ActivityCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 ${activity.icon_color} rounded-full items-center justify-center mr-3`}
          >
            <Feather name={activity.icon as any} size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-medium mb-1">
              {activity.title}
            </Text>
            {activity.description && variant === 'default' && (
              <Text className="text-sm text-muted-foreground mb-1">
                {activity.description}
              </Text>
            )}
            <Text className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}