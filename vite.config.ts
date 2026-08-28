import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@admin": path.resolve(__dirname, "./src/admin"),
      "@modules": path.resolve(__dirname, "./src/modules"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:7000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("chart.js") ||
              id.includes("vue-chartjs") ||
              id.includes("apexcharts") ||
              id.includes("vue3-apexcharts")
            ) {
              return "admin-charts";
            }

            if (id.includes("@tanstack/vue-table")) {
              return "admin-tables";
            }

            if (id.includes("lucide-vue-next")) {
              return "admin-icons";
            }

            if (id.includes("@headlessui/vue")) {
              return "admin-ui";
            }

            if (
              id.includes("vue-router") ||
              id.includes("pinia") ||
              id.includes("/vue/")
            ) {
              return "admin-vendor";
            }
          }

          return undefined;
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        // Tailwind CSS v4 doesn't need a separate postcss config file
        // but you can keep this for other plugins
      ],
    },
  },
});
