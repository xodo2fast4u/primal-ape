module.exports = {
  name: "ocr",
  category: "tools",
  run: async (ctx) => {
    const u = (ctx.text || "").trim();
    if (!u) return ctx.reply("> usage: ocr <image-url>");
    try {
      const api = `https://api.ocr.space/parse/imageurl?apikey=helloworld&url=${encodeURIComponent(
        u
      )}`;
      const res = await fetch(api);
      const json = await res.json();
      const text = json?.ParsedResults?.[0]?.ParsedText || "";
      if (!text) return ctx.reply("> no text detected");
      const trimmed = text.trim().slice(0, 3500);
      await ctx.reply(trimmed);
    } catch (e) {
      await ctx.reply("> ocr error");
    }
  },
};
