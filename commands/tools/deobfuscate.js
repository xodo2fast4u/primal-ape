module.exports = {
  name: "deobfuscate",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !deobfuscate <obfuscated-code>");
    const m = ctx.text.match(/const k=(\d+);const d="([^"]+)"/);
    if (!m) return ctx.reply("> cannot deobfuscate");
    const key = parseInt(m[1]);
    const data = Buffer.from(m[2], "base64");
    for (let i = 0; i < data.length; i++) data[i] ^= key;
    await ctx.reply(data.toString());
  },
};
