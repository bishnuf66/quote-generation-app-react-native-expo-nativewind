/**
 * Consistent theme configuration for the entire app
 */

export const AppTheme = {
  colors: {
    primary: {
      gradient: ["#667eea", "#764ba2"],
      solid: "#667eea",
    },
    secondary: {
      gradient: ["#f093fb", "#f5576c"],
      solid: "#f093fb",
    },
    accent: {
      gradient: ["#4facfe", "#00f2fe"],
      solid: "#4facfe",
    },
    success: {
      gradient: ["#11998e", "#38ef7d"],
      solid: "#11998e",
    },
    warning: {
      gradient: ["#ff7e5f", "#feb47b"],
      solid: "#ff7e5f",
    },
    info: {
      gradient: ["#667eea", "#764ba2"],
      solid: "#667eea",
    },
  },

  backgrounds: {
    light: {
      primary: ["#ffffff", "#f8fafc"],
      secondary: ["#f8fafc", "#e2e8f0"],
    },
    dark: {
      primary: ["#0f0f23", "#1a1a2e"],
      secondary: ["#1a1a2e", "#16213e"],
    },
  },

  text: {
    light: {
      primary: "#1a202c",
      secondary: "#718096",
      muted: "#a0aec0",
    },
    dark: {
      primary: "#ffffff",
      secondary: "#e2e8f0",
      muted: "#9ca3af",
    },
  },

  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 16,
    },
  },

  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    round: 50,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    hero: {
      fontSize: 48,
      fontWeight: "900" as const,
      letterSpacing: -1,
    },
    display: {
      fontSize: 36,
      fontWeight: "800" as const,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold" as const,
    },
    subtitle: {
      fontSize: 24,
      fontWeight: "600" as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontStyle: "italic" as const,
    },
  },
};

export const getThemeColors = (colorScheme: "light" | "dark") => ({
  background: AppTheme.backgrounds[colorScheme].primary,
  backgroundSecondary: AppTheme.backgrounds[colorScheme].secondary,
  text: AppTheme.text[colorScheme].primary,
  textSecondary: AppTheme.text[colorScheme].secondary,
  textMuted: AppTheme.text[colorScheme].muted,
});

export const commonGradients = {
  primary: AppTheme.colors.primary.gradient,
  secondary: AppTheme.colors.secondary.gradient,
  accent: AppTheme.colors.accent.gradient,
  success: AppTheme.colors.success.gradient,
  warning: AppTheme.colors.warning.gradient,
  info: AppTheme.colors.info.gradient,
};
