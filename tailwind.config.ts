
import type {Config} from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', ...fontFamily.sans],
        headline: ['var(--font-noto-serif)', ...fontFamily.serif],
        scripture: ['var(--font-eb-garamond)', ...fontFamily.serif],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        'fade-in-up': {
          '0%': {
              opacity: '0',
              transform: 'translateY(20px)'
          },
          '100%': {
              opacity: '1',
              transform: 'translateY(0)'
          },
        },
        'dissolve': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(0.5) rotate(90deg)', opacity: 0 },
        },
        'logo-fade': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0, transform: 'scale(0.8)' },
        },
        'text-fade': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        ping: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'dissolve': 'dissolve 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'logo-fade': 'logo-fade 2.5s ease-in-out infinite',
        'text-fade': 'text-fade 2.5s ease-in-out infinite',
      },
      typography: (theme: (arg0: string) => any) => ({
        DEFAULT: {
            css: {
                '--tw-prose-body': theme('colors.foreground / 0.8'),
                '--tw-prose-headings': theme('colors.primary.DEFAULT'),
                '--tw-prose-lead': theme('colors.foreground'),
                '--tw-prose-links': theme('colors.primary.DEFAULT'),
                '--tw-prose-bold': theme('colors.foreground'),
                '--tw-prose-counters': theme('colors.muted.foreground'),
                '--tw-prose-bullets': theme('colors.muted.foreground'),
                '--tw-prose-hr': theme('colors.border'),
                '--tw-prose-quotes': theme('colors.muted.foreground'),
                '--tw-prose-quote-borders': theme('colors.primary.DEFAULT'),
                '--tw-prose-captions': theme('colors.muted.foreground'),
                '--tw-prose-code': theme('colors.primary.DEFAULT'),
                '--tw-prose-pre-code': theme('colors.primary.foreground'),
                '--tw-prose-pre-bg': theme('colors.primary.DEFAULT / 0.1'),
                '--tw-prose-th-borders': theme('colors.border'),
                '--tw-prose-td-borders': theme('colors.border'),
            }
        },
        invert: {
          css: {
             '--tw-prose-body': theme('colors.foreground / 0.8'),
                '--tw-prose-headings': theme('colors.primary.DEFAULT'),
                '--tw-prose-lead': theme('colors.foreground'),
                '--tw-prose-links': theme('colors.primary.DEFAULT'),
                '--tw-prose-bold': theme('colors.foreground'),
                '--tw-prose-counters': theme('colors.muted.foreground'),
                '--tw-prose-bullets': theme('colors.muted.foreground'),
                '--tw-prose-hr': theme('colors.border'),
                '--tw-prose-quotes': theme('colors.muted.foreground'),
                '--tw-prose-quote-borders': theme('colors.primary.DEFAULT'),
                '--tw-prose-captions': theme('colors.muted.foreground'),
                '--tw-prose-code': theme('colors.primary.DEFAULT'),
                '--tw-prose-pre-code': theme('colors.primary.foreground'),
                '--tw-prose-pre-bg': theme('colors.primary.DEFAULT / 0.1'),
                '--tw-prose-th-borders': theme('colors.border'),
                '--tw-prose-td-borders': theme('colors.border'),
          }
        }
      })
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
