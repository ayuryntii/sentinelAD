/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        defense: {
          bg: "#0B0F19",       // Deep Tactical Dark
          surface: "#111827",  // Dark Slate
          card: "#161F30",     // Elevated Card
          border: "#1E293B",   // Subtle Matrix Border
          primary: "#10B981",  // Tactical Radar Emerald
          accent: "#3B82F6",   // Command Cyan/Blue
          warning: "#F59E0B",  // Alert Amber
          danger: "#EF4444",   // Red Threat Alarm
          army: "#4D7C0F",     // Indonesian Army Olive
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
}
