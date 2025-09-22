const eco = require("../../lib/economy");
const fs = require("fs");
const path = require("path");

const ECON_PATH = path.join(process.cwd(), "data", "economy.json");

module.exports = {
  name: "leaderboard",
  category: "economy",
  run: async (ctx) => {
    const db = JSON.parse(fs.readFileSync(ECON_PATH, "utf8"));
    const users = Object.entries(db.users || {})
      .filter(
        ([jid]) => jid.includes("@s.whatsapp.net") || jid.includes("@lid")
      )
      .map(([jid, u]) => ({
        jid,
        bits: u.bits,
        level: u.level,
        title: u.title,
      }))
      .sort((a, b) => b.bits - a.bits)
      .slice(0, 10);

    if (!users.length) return ctx.reply("nobody has any ApeBits yet. tragic.");

    const board = users
      .map(
        (u, i) =>
          `${i + 1}. ${u.jid.split("@")[0]} — ${eco.CURRENCY_EMOJI} ${
            u.bits
          } (${u.title} L${u.level})`
      )
      .join("\n");

    await ctx.reply(`🏆 ApeBits leaderboard:\n${board}`);
  },
};
