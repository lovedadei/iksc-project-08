
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced nature-inspired colors
				'bloom-pink': 'hsl(var(--bloom-pink))',
				'nature-green': 'hsl(var(--nature-green))',
				'sky-blue': 'hsl(var(--sky-blue))',
				'fresh-mint': 'hsl(var(--fresh-mint))',
				'forest-green': 'hsl(var(--forest-green))',
				'leaf-green': 'hsl(var(--leaf-green))',
				'earth-brown': 'hsl(var(--earth-brown))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			backgroundImage: {
				'nature-gradient': 'linear-gradient(135deg, hsl(var(--forest-green)) 0%, hsl(var(--leaf-green)) 50%, hsl(var(--fresh-mint)) 100%)',
				'fresh-gradient': 'linear-gradient(135deg, hsl(var(--sky-blue)) 0%, hsl(var(--fresh-mint)) 50%, hsl(var(--nature-green)) 100%)',
				'bloom-gradient': 'linear-gradient(135deg, hsl(var(--bloom-pink)) 0%, hsl(var(--sky-blue)) 100%)',
				'earth-gradient': 'linear-gradient(135deg, hsl(var(--earth-brown)) 0%, hsl(var(--forest-green)) 50%, hsl(var(--leaf-green)) 100%)',
				'organic-texture': 'radial-gradient(circle at 25% 25%, hsla(120, 60%, 25%, 0.1) 0%, transparent 25%), radial-gradient(circle at 75% 75%, hsla(150, 50%, 60%, 0.1) 0%, transparent 25%)'
			},
			boxShadow: {
				'nature': '0 20px 50px rgba(34, 139, 34, 0.15)',
				'organic': '0 25px 60px rgba(46, 125, 50, 0.2)',
				'leaf': '0 15px 40px rgba(76, 175, 80, 0.25)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
