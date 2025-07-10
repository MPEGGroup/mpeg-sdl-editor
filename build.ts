import bunPluginTailwind from "bun-plugin-tailwind";

await Bun.build({
  entrypoints: ["html/index.html", "html/mpeg.svg"],
  outdir: "dist",
  minify: true,
  plugins: [bunPluginTailwind],
});
