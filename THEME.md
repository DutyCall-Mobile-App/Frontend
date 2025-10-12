# Theme Implementation Guide

## Overview

The app now supports a system-wide dark mode toggle that can be controlled from the Settings screen. The theme state is persisted across app restarts using AsyncStorage.

## Usage

### Accessing Theme in Components

```jsx
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../utils/theme";

function YourComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Your Content</Text>
    </View>
  );
}
```

### Theme Colors

The theme provides the following colors:

- background: Main background color
- surface: Surface/card background color
- text: Primary text color
- textSecondary: Secondary text color
- primary: Primary brand color
- border: Border color
- error: Error state color
- success: Success state color
- card: Card background color
- inputBackground: Input field background
- messageBubbleUser: User message bubble background
- messageBubbleOther: Other user message bubble background
- messageBubbleUserText: User message text color
- messageBubbleOtherText: Other user message text color

### Toggling Theme

The theme can be toggled from the Settings screen or programmatically using the `toggleTheme` function from the theme context.

## Implementation Details

- Theme state is managed by ThemeContext
- Theme preferences are persisted in AsyncStorage
- Colors are defined in theme.js
- The theme is provided at the root level in \_layout.jsx
