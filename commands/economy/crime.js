const eco = require("../../lib/economy");

module.exports = {
  name: "crime",
  category: "economy",
  run: async (ctx) => {
    const result = eco.crime(ctx.sender); // 👈 sender, not group jid

    if (!result.ok) {
      if (result.cooldownMsLeft) {
        return ctx.reply(
          `you just got outta jail and you’re already back at it? cooldown: ${eco.fmtMs(
            result.cooldownMsLeft
          )}`
        );
      }
      return ctx.reply(
        "caught red-handed. cops smacked you and took your money."
      );
    }

    const { payout, balance, busted } = result;
    if (busted) {
      return ctx.reply(
        `the crime went south. you lost ${eco.CURRENCY_EMOJI} ${payout} ${eco.CURRENCY_NAME}\nnew balance: ${eco.CURRENCY_EMOJI} ${balance} ${eco.CURRENCY_NAME}`
      );
    }

    await ctx.reply(
      `you pulled off the crime and got ${eco.CURRENCY_EMOJI} ${payout} ${eco.CURRENCY_NAME}\nnew balance: ${eco.CURRENCY_EMOJI} ${balance} ${eco.CURRENCY_NAME}`
    );
  },
};
