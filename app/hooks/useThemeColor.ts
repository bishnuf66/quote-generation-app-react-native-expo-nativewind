import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const theme = useColorScheme();
  if (theme === 'dark') {
    return props.dark ?? colorName;
  }
  return props.light ?? colorName;
}
