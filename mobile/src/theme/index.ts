// Artha mobile — design tokens (dark navy + green accent)

export const Colors = {
  // Backgrounds
  bg: '#0d1117',          // page background
  card: '#161b22',        // card surface
  cardBorder: '#21262d',  // card border
  input: '#1c2128',       // input field background
  inputBorder: '#30363d', // input border

  // Brand / accent
  primary: '#22c55e',     // green CTA
  primaryDark: '#16a34a', // pressed state
  primaryMuted: '#166534', // subtle tint

  // Semantic
  danger: '#f85149',
  warning: '#e3b341',
  info: '#388bfd',

  // Text
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',
  textInverse: '#0d1117',

  // Tab bar
  tabBar: '#0d1117',
  tabBarBorder: '#21262d',
  tabActive: '#22c55e',
  tabInactive: '#6e7681',

  // Stat card accent strips
  accentSales: '#22c55e',
  accentPurchases: '#388bfd',
  accentProfit: '#a371f7',
  accentCash: '#e3b341',
  accentReceivable: '#3fb950',
  accentPayable: '#f85149',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};