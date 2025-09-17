const eco = require("../../lib/economy");

module.exports = {
  name: "beg",
  category: "economy",
  run: async (ctx) => {
    const result = eco.beg(ctx.sender);

    if (!result.ok) {
      if (result.cooldownMsLeft) {
        return ctx.reply(
          `you already begged, beggar. try again in ${eco.fmtMs(
            result.cooldownMsLeft
          )}`
        );
      }
      return ctx.reply("nobody wants to help you. touch grass.");
    }

    const { payout, balance } = result;
    await ctx.reply(
      `some stranger took pity and gave you ${eco.CURRENCY_EMOJI} ${payout}\nnew balance: ${eco.CURRENCY_EMOJI} ${balance}`
    );
  },
};
