import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/theme.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        page: { name: "Page (cream-100)", value: "#f5f1ea" },
        surface: { name: "Surface (cream-50)", value: "#fdfbf7" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "page" },
  },
};

export default preview;
