import { useState } from "react";
import { TransportMode } from "../components/routes/RouteDirectionPanel";

export function useRoutingUI() {
  const [isRoutingUIVisible, setIsRoutingUIVisible] = useState(false);
  const [transportMode, setTransportMode] =
    useState<TransportMode>("motorbike");
  const [originLabel, setOriginLabel] = useState("Đường Trần Phú, Đà Nẵng");
  const [destinationText, setDestinationText] = useState("");

  const openRouting = () => setIsRoutingUIVisible(true);
  const closeRouting = () => setIsRoutingUIVisible(false);

  return {
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    originLabel,
    setOriginLabel,
    destinationText,
    setDestinationText,
  };
}
