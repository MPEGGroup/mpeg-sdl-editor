import bunPluginTailwind from "bun-plugin-tailwind";

await Bun.build({
  entrypoints: ["html/index.html"],
  outdir: "dist",
  minify: true,
  plugins: [bunPluginTailwind],
});
