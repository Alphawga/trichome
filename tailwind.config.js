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
                // ShadCN UI Colors (CSS variable based). --x variables in
                // globals.css are bare "H S% L%" triplets, so they must be
                // wrapped in hsl(...) here to be valid colors — used directly
                // as `var(--x)` they're invalid CSS and silently dropped,
                // which is why shadcn primitives (Slider, etc.) that rely on
                // bg-primary/bg-muted render with no visible color at all.
                // The <alpha-value> placeholder enables opacity modifiers
                // (e.g. bg-primary/90); border/input/sidebar-border already
                // embed their own alpha via a "/ x%" suffix in dark mode, so
                // they're wrapped without it to avoid a double alpha.
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                    foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                chart: {
                    1: 'hsl(var(--chart-1) / <alpha-value>)',
                    2: 'hsl(var(--chart-2) / <alpha-value>)',
                    3: 'hsl(var(--chart-3) / <alpha-value>)',
                    4: 'hsl(var(--chart-4) / <alpha-value>)',
                    5: 'hsl(var(--chart-5) / <alpha-value>)',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
                    foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
                    primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
                    accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring) / <alpha-value>)',
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
