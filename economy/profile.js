const eco = require("../../lib/economy");

module.exports = {
  name: "profile",
  category: "economy",
  run: async (ctx) => {
    const profile = eco.getProfile(ctx.sender);
    const need = eco.xpNeededFor(profile.level);

    await ctx.reply(
      `👤 profile for ${ctx.jid.split("@")[0]}\n` +
        `title: ${profile.title}\n` +
        `level: ${profile.level} (${profile.xp}/${need} xp)\n` +
        `balance: ${eco.CURRENCY_EMOJI} ${profile.bits} ${eco.CURRENCY_NAME}\n` +
        `commands used: ${profile.stats.commands}, jobs worked: ${profile.stats.jobs}`
    );
  },
};
