module.exports = {
  name: "tts",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("Usage: !tts <text>");
      return;
    }

    const text = encodeURIComponent(q);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=en&client=tw-ob`;

    try {
      await ctx.reply({ audio: ttsUrl });
    } catch (e) {
      await ctx.reply("> Failed to generate speech. Try again later.");
    }
  },
};
