module.exports = {
  name: "translate",
  category: "tools",
  run: async (ctx) => {
    const lang = (ctx.args[0] || "").toLowerCase();
    const text = (ctx.args.slice(1).join(" ") || "").trim();
    if (!lang || !text) return ctx.reply("> usage: translate <lang> <text>");

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        lang
      )}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      const parts = Array.isArray(data?.[0]) ? data[0] : [];
      const translated = parts
        .map((p) => (Array.isArray(p) ? p[0] : ""))
        .join("");
      if (!translated) return ctx.reply("> translation failed");
      await ctx.reply(`> ${translated}`);
    } catch (e) {
      await ctx.reply("> translate error");
    }
  },
};
