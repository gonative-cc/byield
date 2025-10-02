export default {
  settings: {
    tailwindcss: {
      // Attributes/props that could contain Tailwind CSS classes...
      // Optional, default values: ["class", "className", "ngClass", "@apply"]
      attributes: ["class"],
      // The absolute path pointing to you main Tailwind CSS v4 config file.
      // It must be a `.css` file (v4), not a `.js` file (v3)
      // REQUIRED, default value will not help
      cssConfigPath:
        dirname(fileURLToPath(import.meta.url)) + "/app/tailwind.css",
      // Functions/tagFunctions that will be parsed by the plugin.
      // Optional, default values: ["classnames", "clsx", "ctl", "cva", "tv", "tw"]
      functions: ["twClasses"],
    },
  },
};
