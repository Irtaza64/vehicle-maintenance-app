export const DarkColors = {
    primary: '#2E67F8', // Vibrant Blue
    secondary: '#1C1C1E', // Dark Gray
    background: '#000000', // Pure Black
    surface: '#121212', // Slightly lighter black for cards
    text: '#FFFFFF',
    textSecondary: '#A1A1A9',
    accent: '#34D399', // Mint/Success
    danger: '#EF4444', // Red/Error
    border: '#27272A',
    tint: '#2E67F8',
};

export const LightColors = {
    primary: '#2E67F8', // Vibrant Blue
    secondary: '#F2F2F7', // Light Gray
    background: '#FFFFFF', // Pure White
    surface: '#FFFFFF', // White for cards (with shadow/border)
    text: '#000000',
    textSecondary: '#6B7280',
    accent: '#10B981', // Darker Mint
    danger: '#DC2626', // Red
    border: '#E5E7EB',
    tint: '#2E67F8',
};

// Default export can be Dark for backward compatibility in imports not yet updated, 
// but we really want to switch to hooks.
export const Colors = DarkColors;

export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
};

export const Typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
};
