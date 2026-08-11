import type { Config } from "tailwindcss";

/**
 * DESIGN TOKENS — LinkEarn Platform
 * Hướng thiết kế: "Private banking / obsidian & champagne"
 * - Nền tối obsidian (không phải đen thuần, không phải navy phổ thông)
 * - Điểm nhấn champagne-gold: cảm giác quý phái, đẳng cấp, KHÔNG dùng neon
 * - Chữ hiển thị: hình học, rộng rãi, trừu tượng-thương mại (Space Grotesk)
 * - Chữ nội dung: Inter — trung tính, dễ đọc ở data-heavy dashboard
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#0A0B0E",
          900: "#101218",
          800: "#171A22",
          700: "#20242F",
          600: "#2C3140",
          500: "#3A4053",
        },
        champagne: {
          400: "#E4C989",
          500: "#C9A961",
          600: "#B08D45",
          700: "#8F7136",
        },
        mist: {
          100: "#F5F6F8",
          300: "#C7CBD4",
          400: "#9BA1AF",
          500: "#6E7585",
        },
        emerald: { DEFAULT: "#3FAE7C" },
        ruby: { DEFAULT: "#D9534F" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,169,97,0.25), 0 8px 30px -8px rgba(201,169,97,0.25)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E4C989 0%, #C9A961 45%, #8F7136 100%)",
        "obsidian-radial": "radial-gradient(120% 120% at 10% 0%, #171A22 0%, #0A0B0E 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
