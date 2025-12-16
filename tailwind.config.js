/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['var(--font-classy-vogue)', 'Georgia', 'Times New Roman', 'serif'],
                body: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
                sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
            },
            colors: {
                // Trichomes Brand Colors
                trichomes: {
                    primary: '#528c35',
                    sage: '#e6e4c6',
                    sand: '#e9ddaa',
                    soft: '#fafaf7',
                    forest: '#1e3024',
                    gold: '#e0b44c',
                    'gold-hover': '#d4a43d',
                },
                // ShadCN UI Colors (CSS variable based)
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                popover: {
                    DEFAULT: 'var(--popover)',
                    foreground: 'var(--popover-foreground)',
                },
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                chart: {
                    1: 'var(--chart-1)',
                    2: 'var(--chart-2)',
                    3: 'var(--chart-3)',
                    4: 'var(--chart-4)',
                    5: 'var(--chart-5)',
                },
                sidebar: {
                    DEFAULT: 'var(--sidebar)',
                    foreground: 'var(--sidebar-foreground)',
                    primary: 'var(--sidebar-primary)',
                    'primary-foreground': 'var(--sidebar-primary-foreground)',
                    accent: 'var(--sidebar-accent)',
                    'accent-foreground': 'var(--sidebar-accent-foreground)',
                    border: 'var(--sidebar-border)',
                    ring: 'var(--sidebar-ring)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                fadeOut: {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
                slideInFromRight: {
                    from: { transform: 'translateX(100%)' },
                    to: { transform: 'translateX(0)' },
                },
                slideOutToRight: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(100%)' },
                },
                slideInFromLeft: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
                slideOutToLeft: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-100%)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                dropdownSlideIn: {
                    from: { opacity: '0', transform: 'translateY(-12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                sectionEntrance: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                pageFadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                staggerFadeIn: {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                dropdownFadeIn: {
                    from: { opacity: '0', transform: 'translateY(-8px) translateX(-50%)' },
                    to: { opacity: '1', transform: 'translateY(0) translateX(-50%)' },
                },
            },
            animation: {
                'fade-in': 'fadeIn 200ms ease-out',
                'fade-out': 'fadeOut 200ms ease-in',
                'slide-in-from-right': 'slideInFromRight 300ms ease-out',
                'slide-out-to-right': 'slideOutToRight 300ms ease-in',
                'slide-in-from-left': 'slideInFromLeft 300ms ease-out',
                'slide-out-to-left': 'slideOutToLeft 300ms ease-in',
                'dropdown-slide-in': 'dropdownSlideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                'section-entrance': 'sectionEntrance 600ms ease-out',
                'page-fade-in': 'pageFadeIn 600ms ease-out',
                'stagger-fade-in': 'staggerFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                'dropdown-fade-in': 'dropdownFadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [],
};
