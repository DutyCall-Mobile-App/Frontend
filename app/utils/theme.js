export const lightTheme = {
  background: "#f5f7fb",
  surface: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#777777",
  primary: "#1877F2",
  border: "#eeeeee",
  error: "#E53935",
  success: "#4CAF50",
  card: "#ffffff",
  inputBackground: "#fafafa",
  messageBubbleUser: "#1877F2",
  messageBubbleOther: "#E9ECEF",
  messageBubbleUserText: "#ffffff",
  messageBubbleOtherText: "#111111",
};

export const darkTheme = {
  background: "#121212",
  surface: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  primary: "#1877F2",
  border: "#2d2d2d",
  error: "#cf6679",
  success: "#4CAF50",
  card: "#242424",
  inputBackground: "#2d2d2d",
  messageBubbleUser: "#1877F2",
  messageBubbleOther: "#2d2d2d",
  messageBubbleUserText: "#ffffff",
  messageBubbleOtherText: "#ffffff",
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
