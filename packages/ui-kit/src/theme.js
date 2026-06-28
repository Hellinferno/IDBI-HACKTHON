const COLORS = {
  primary: '#1A73E8',
  secondary: '#5F6368',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  error: '#D93025',
  success: '#1E8E3E',
  warning: '#F9AB00',
  text: {
    primary: '#202124',
    secondary: '#5F6368',
    disabled: '#9AA0A6',
    inverse: '#FFFFFF',
  },
  border: '#DADCE0',
  card: {
    nudge: '#FFF3E0',
    recommendation: '#E8F5E9',
    goal: '#E3F2FD',
    chart: '#F3E5F5',
    explainer: '#FFFDE7',
    insight: '#E0F7FA',
  },
  orb: {
    idle: '#4FC3F7',
    listening: '#81C784',
    thinking: '#FFB74D',
    speaking: '#64B5F6',
    alert: '#FF8A65',
    celebrate: '#FFD54F',
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

const SHADOW = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
};

const THEME = { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW };

module.exports = { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, THEME };
