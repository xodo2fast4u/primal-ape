const eco = require("../../lib/economy");

module.exports = {
  name: "dailycheck",
  category: "economy",
  run: async (ctx) => {
    const claims = eco.getClaims();
    const profile = eco.getProfile(ctx.jid);
    let msg = "⏱ claim status:\n";

    for (const c of claims) {
      const last = profile.lastClaims[c.key] || 0;
      const left = Math.max(0, last + c.cooldownMs - Date.now());
      if (profile.level < c.levelReq) {
        msg += `• ${c.name}: 🔒 requires level ${c.levelReq}\n`;
      } else if (left > 0) {
        msg += `• ${c.name}: on cooldown (${eco.fmtMs(left)} left)\n`;
      } else {
        msg += `• ${c.name}: ✅ ready to claim\n`;
      }
    }

    await ctx.reply(msg);
  },
};
