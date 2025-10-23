const tinycolor = require("tinycolor2");

module.exports = {
  name: "color",
  category: "tools",
  run: async (ctx) => {
    // usage: !color <hex|name>
    const q = (ctx.text || "").trim();
    if (!q) return ctx.reply("usage: !color <hex|name>");

    try {
      const c = tinycolor(q);
      if (!c.isValid()) return ctx.reply("invalid color");
      const hex = c.toHexString();
      const rgb = c.toRgb();
      await ctx.reply(`hex: ${hex}\nrgb: ${rgb.r}, ${rgb.g}, ${rgb.b}`);
    } catch (e) {
      await ctx.reply("color error");
    }
  },
};
