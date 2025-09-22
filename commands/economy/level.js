const eco = require("../../lib/economy");

module.exports = {
  name: "level",
  category: "economy",
  run: async (ctx) => {
    const p = eco.getProfile(ctx.sender);
    if (!p) {
      return ctx.reply("❌ couldn’t fetch your profile.");
    }

    const need = eco.xpNeededFor(p.level);
    await ctx.reply(
      `L${p.level} • ${p.title}\n` +
        `xp: ${p.xp}/${need}\n` +
        `balance: ${eco.CURRENCY_EMOJI} ${p.bits} ${eco.CURRENCY_NAME}\n` +
        `stats: ${p.stats.commands} cmds, ${p.stats.jobs} jobs`
    );
  },
};
