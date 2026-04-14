import { useEffect, useState } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const avatarVariants = cva(
  "rounded-full items-center justify-center overflow-hidden bg-primary",
  {
    variants: {
      size: {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-10 h-10",
        xl: "w-14 h-14",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const initialsTextClass: Record<string, string> = {
  sm: "text-[8px] font-semibold text-white",
  md: "text-[10px] font-semibold text-white",
  lg: "text-[12px] font-semibold text-white",
  xl: "text-base font-semibold text-white",
};

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  source?: ImageSourcePropType;
  initials?: string;
  testID?: string;
  className?: string;
}

export function Avatar({ size: sizeProp, source, initials, testID, className }: AvatarProps) {
  const size = sizeProp ?? "md";
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [source]);

  const showImage = !!source && !imageError;
  return (
    <View testID={testID} className={cn(avatarVariants({ size }), className)}>
      {showImage ? (
        <Image
          source={source}
          className="w-full h-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text className={initialsTextClass[size] ?? initialsTextClass.md}>
          {initials ? initials.slice(0, 2).toUpperCase() : "?"}
        </Text>
      )}
    </View>
  );
}
