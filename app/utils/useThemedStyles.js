import { useTheme } from "../context/ThemeContext";
import { getTheme } from "./theme";

export const useThemedStyles = (styleCreator) => {
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  return styleCreator(colors);
};
