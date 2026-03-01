/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				surface: {
					DEFAULT: '#080810',
					card: '#0f0f20',
					elevated: '#161628'
				},
				accent: {
					green: '#00E676',
					pink: '#FF4D8D',
					purple: '#9B5DE5',
					blue: '#4DAAFF',
					yellow: '#FFD60A',
					orange: '#FF6B35',
					teal: '#00BFA5',
					red: '#FF4444'
				}
			},
			fontFamily: {
				display: ['Space Grotesk', 'system-ui', 'sans-serif'],
				body: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Courier New', 'monospace']
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'countdown': 'countdown 1s ease-in-out',
				'fade-in': 'fadeIn 0.5s ease-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'flash': 'flash 0.3s ease-out'
			},
			keyframes: {
				countdown: {
					'0%': { transform: 'scale(1.5)', opacity: '0' },
					'20%': { opacity: '1' },
					'80%': { opacity: '1' },
					'100%': { transform: 'scale(0.8)', opacity: '0' }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				flash: {
					'0%': { opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0' }
				}
			}
		}
	},
	plugins: []
};
