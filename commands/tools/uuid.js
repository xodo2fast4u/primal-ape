const { randomBytes } = require("crypto");

function uuidv4() {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const s = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${s.substr(0, 8)}-${s.substr(8, 4)}-${s.substr(12, 4)}-${s.substr(
    16,
    4
  )}-${s.substr(20, 12)}`;
}

module.exports = {
  name: "uuid",
  category: "tools",
  run: async (ctx) => {
    await ctx.reply(uuidv4());
  },
};
