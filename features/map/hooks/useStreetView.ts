
import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";

type LatLng = { latitude: number; longitude: number };

export function useStreetView() {
  const [streetViewLocation, setStreetViewLocation] = useState<LatLng | null>(
    null
  );

  const openStreetView = useCallback((latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `comgooglemaps://?center=${latitude},${longitude}&mapmode=streetview`,
      android: `google.streetview:cbll=${latitude},${longitude}&cbp=0,0,0,0,0`,
      default: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        const webUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
        Linking.openURL(webUrl);
      }
    });
  }, []);

  const handleMapLongPress = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setStreetViewLocation({ latitude, longitude });
  }, []);

  return {
    streetViewLocation,
    setStreetViewLocation,
    openStreetView,
    handleMapLongPress,
  };
}
