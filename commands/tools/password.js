const crypto = require("crypto");
const chars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()-_=+[]{};:,.<>/?";

function gen(len = 30) {
  let out = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

module.exports = {
  name: "password",
  run: async (ctx) => {
    const len = parseInt(ctx.args[0]) || 30;
    await ctx.reply(gen(len));
  },
};
