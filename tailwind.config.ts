const tailwindConfig: import("tailwindcss").Config & { daisyui?: any } = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
};

export default tailwindConfig;
