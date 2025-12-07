import React from "react";
import { FontAwesome, AntDesign } from "@expo/vector-icons";

export const GoogleLogo = ({ size = 24 }: { size?: number }) => (
  <AntDesign name="google" size={size} color="#DB4437" />
);

export const FacebookLogo = ({ size = 24 }: { size?: number }) => (
  <FontAwesome name="facebook" size={size} color="#1877F2" />
);

