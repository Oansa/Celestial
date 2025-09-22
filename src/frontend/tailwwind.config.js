import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                success: {
                    DEFAULT: 'oklch(var(--success) / <alpha-value>)',
                    foreground: 'oklch(98% 0.01 120)'
                },
                warning: {
                    DEFAULT: 'oklch(var(--warning) / <alpha-value>)',
                    foreground: 'oklch(15% 0.02 140)'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                // Nature-inspired color palette
                forest: {
                    50: 'oklch(95% 0.02 140)',
                    100: 'oklch(90% 0.04 140)',
                    200: 'oklch(85% 0.06 140)',
                    300: 'oklch(75% 0.08 140)',
                    400: 'oklch(65% 0.12 140)',
                    500: 'oklch(55% 0.18 140)',
                    600: 'oklch(45% 0.15 140)',
                    700: 'oklch(35% 0.12 140)',
                    800: 'oklch(25% 0.08 140)',
                    900: 'oklch(15% 0.04 140)',
                },
                ocean: {
                    50: 'oklch(95% 0.02 200)',
                    100: 'oklch(90% 0.04 200)',
                    200: 'oklch(85% 0.06 200)',
                    300: 'oklch(75% 0.08 200)',
                    400: 'oklch(65% 0.12 200)',
                    500: 'oklch(55% 0.15 200)',
                    600: 'oklch(45% 0.12 200)',
                    700: 'oklch(35% 0.10 200)',
                    800: 'oklch(25% 0.06 200)',
                    900: 'oklch(15% 0.04 200)',
                },
                earth: {
                    50: 'oklch(95% 0.02 80)',
                    100: 'oklch(90% 0.04 80)',
                    200: 'oklch(85% 0.06 80)',
                    300: 'oklch(75% 0.08 80)',
                    400: 'oklch(65% 0.12 80)',
                    500: 'oklch(55% 0.15 80)',
                    600: 'oklch(45% 0.12 80)',
                    700: 'oklch(35% 0.10 80)',
                    800: 'oklch(25% 0.06 80)',
                    900: 'oklch(15% 0.04 80)',
                },
                sky: {
                    50: 'oklch(98% 0.01 180)',
                    100: 'oklch(95% 0.02 180)',
                    200: 'oklch(90% 0.04 180)',
                    300: 'oklch(85% 0.06 180)',
                    400: 'oklch(75% 0.08 180)',
                    500: 'oklch(65% 0.10 180)',
                    600: 'oklch(55% 0.12 180)',
                    700: 'oklch(45% 0.10 180)',
                    800: 'oklch(35% 0.08 180)',
                    900: 'oklch(25% 0.06 180)',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                nature: '0 4px 6px -1px rgba(52, 211, 153, 0.1), 0 2px 4px -1px rgba(52, 211, 153, 0.06)',
                'nature-lg': '0 10px 15px -3px rgba(52, 211, 153, 0.1), 0 4px 6px -2px rgba(52, 211, 153, 0.05)',
                glow: '0 0 20px rgba(52, 211, 153, 0.3)',
                'glow-lg': '0 0 40px rgba(52, 211, 153, 0.4)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-4px)' }
                },
                'leaf-sway': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(2deg)' },
                    '75%': { transform: 'rotate(-2deg)' }
                },
                'ripple': {
                    '0%': { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2.4)', opacity: '0' }
                },
                'fade-in-up': {
                    from: {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'slide-in-right': {
                    from: {
                        opacity: '0',
                        transform: 'translateX(20px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateX(0)'
                    }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(52, 211, 153, 0.3)' },
                    '50%': { boxShadow: '0 0 20px rgba(52, 211, 153, 0.6)' }
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
                'leaf-sway': 'leaf-sway 3s ease-in-out infinite',
                'ripple': 'ripple 0.6s ease-out',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 2s ease infinite',
                'float': 'float 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s ease-in-out infinite'
            },
            backgroundImage: {
                'gradient-forest': 'var(--gradient-forest)',
                'gradient-ocean': 'var(--gradient-ocean)',
                'gradient-sky': 'var(--gradient-sky)',
                'gradient-earth': 'var(--gradient-earth)',
                'nature-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
            },
            transitionTimingFunction: {
                'nature': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            },
            transitionDuration: {
                '400': '400ms',
                '600': '600ms'
            }
        }
    },
    plugins: [
        typography, 
        containerQueries, 
        animate,
        // Custom plugin for nature-themed utilities
        function({ addUtilities }) {
            const newUtilities = {
                '.transition-all-smooth': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '.transition-transform-smooth': {
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '.transition-colors-smooth': {
                    transition: 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease'
                },
                '.hover-lift': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }
                },
                '.hover-scale': {
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.05)'
                    }
                },
                '.hover-glow': {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)'
                    }
                }
            }
            addUtilities(newUtilities)
        }
    ]
};
