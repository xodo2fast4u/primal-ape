const { randomBytes } = require("crypto");

function shortId(len = 8) {
  const bytes = randomBytes(len);
  return [...bytes].map((b) => (b % 36).toString(36)).join("");
}

module.exports = {
  name: "shortid",
  category: "tools",
  run: async (ctx) => {
    const len = parseInt(ctx.args[0]) || 8;
    await ctx.reply(shortId(Math.max(4, Math.min(32, len))));
  },
};
