import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: (id) => {
        // Exclude Node.js modules from bundle
        return id === "form-data" || id.startsWith("node:");
      },
      output: {
        manualChunks: undefined,
        globals: {
          "form-data": "FormData"
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  },
  resolve: {
    conditions: ["browser", "module", "import"],
    mainFields: ["browser", "module", "main"]
  },
  optimizeDeps: {
    include: ["axios"],
    exclude: ["form-data"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    global: "globalThis"
  }
});


