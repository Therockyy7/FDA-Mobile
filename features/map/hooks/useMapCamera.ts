import { useRef, useState, useCallback } from "react";
import MapView, { Camera, Region } from "react-native-maps";
import { DANANG_CENTER, FloodRoute, FloodZone } from "../constants/map-data";
import { getRouteMidPoint, getZoneCenter } from "../services/geometry";

export function useMapCamera() {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(DANANG_CENTER);
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [camera, setCamera] = useState<Camera>({
    center: {
      latitude: DANANG_CENTER.latitude,
      longitude: DANANG_CENTER.longitude,
    },
    pitch: 0,
    heading: 0,
    altitude: 5000,
    zoom: 13,
  });

  const onRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const toggle3DView = useCallback(() => {
    const newCamera: Camera = {
      center: {
        latitude: region.latitude,
        longitude: region.longitude,
      },
      pitch: is3DEnabled ? 0 : 50,
      heading: is3DEnabled ? 0 : camera.heading,
      altitude: is3DEnabled ? 5000 : 3000,
      zoom: is3DEnabled ? 13 : 15,
    };

    mapRef.current?.animateCamera(newCamera, { duration: 800 });
    setCamera(newCamera);
    setIs3DEnabled(!is3DEnabled);
  }, [camera, is3DEnabled, region]);

  const rotateCamera = useCallback(
    (direction: "left" | "right") => {
      if (!is3DEnabled) return;

      const headingChange = direction === "left" ? -45 : 45;
      const newCamera: Camera = {
        ...camera,
        heading: (camera.heading + headingChange + 360) % 360,
      };

      mapRef.current?.animateCamera(newCamera, { duration: 500 });
      setCamera(newCamera);
    },
    [camera, is3DEnabled]
  );

  const zoomIn = useCallback(() => {
    if (is3DEnabled) {
      const newCamera: Camera = {
        ...camera,
        altitude: Math.max(camera.altitude * 0.7, 1000),
        zoom: Math.min(camera.zoom + 1, 20),
      };
      mapRef.current?.animateCamera(newCamera, { duration: 300 });
      setCamera(newCamera);
    } else {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      };
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  }, [camera, is3DEnabled, region]);

  const zoomOut = useCallback(() => {
    if (is3DEnabled) {
      const newCamera: Camera = {
        ...camera,
        altitude: Math.min(camera.altitude * 1.5, 10000),
        zoom: Math.max(camera.zoom - 1, 10),
      };
      mapRef.current?.animateCamera(newCamera, { duration: 300 });
      setCamera(newCamera);
    } else {
      const newRegion = {
        ...region,
        latitudeDelta: Math.min(region.latitudeDelta * 1.5, 0.5),
        longitudeDelta: Math.min(region.longitudeDelta * 1.5, 0.5),
      };
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  }, [camera, is3DEnabled, region]);

  const goToMyLocation = useCallback(() => {
    if (is3DEnabled) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: DANANG_CENTER.latitude,
            longitude: DANANG_CENTER.longitude,
          },
          pitch: 50,
          heading: 0,
          altitude: 3000,
          zoom: 14,
        },
        { duration: 800 }
      );
    } else {
      mapRef.current?.animateToRegion(DANANG_CENTER, 600);
    }
  }, [is3DEnabled]);

  const focusOnZone = useCallback(
    (zone: FloodZone) => {
      const center = getZoneCenter(zone);

      if (is3DEnabled) {
        mapRef.current?.animateCamera(
          {
            center,
            pitch: 50,
            heading: camera.heading,
            altitude: 2500,
            zoom: 15,
          },
          { duration: 800 }
        );
      } else {
        mapRef.current?.animateToRegion(
          {
            ...center,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          500
        );
      }
    },
    [camera.heading, is3DEnabled]
  );

  const focusOnRoute = useCallback(
    (route: FloodRoute) => {
        const midPoint = getRouteMidPoint(route);


      if (is3DEnabled) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: midPoint.latitude,
            longitude: midPoint.longitude,
          },
          pitch: 50,
          heading: camera.heading,
          altitude: 2000,
          zoom: 16,
        },
        { duration: 800 }
      );
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude: midPoint.latitude,
          longitude: midPoint.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        },
        500
      );
    }
    },
    [camera.heading, is3DEnabled]
  );

  return {
    mapRef,
    region,
    is3DEnabled,
    camera,
    onRegionChangeComplete,
    toggle3DView,
    rotateCamera,
    zoomIn,
    zoomOut,
    goToMyLocation,
    setRegion, 
    focusOnZone,
    focusOnRoute,
  };
}
