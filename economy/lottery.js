const eco = require("../../lib/economy");

module.exports = {
  name: "lottery",
  category: "economy",
  run: async (ctx) => {
    const result = eco.lottery(ctx.sender);

    if (!result.ok) {
      if (result.err === "ticket already bought")
        return ctx.reply("you already bought a lottery ticket. chill.");
      if (result.cooldownMsLeft)
        return ctx.reply(
          `lottery draw soon. wait ${eco.fmtMs(result.cooldownMsLeft)}`
        );
      if (result.err === "insufficient funds")
        return ctx.reply("you’re too broke for a lottery ticket.");
      return ctx.reply("lottery machine exploded. no tickets for you.");
    }

    if (result.winner) {
      return ctx.reply(
        `🎉 ${result.winner.split("@")[0]} won the lottery of ${
          eco.CURRENCY_EMOJI
        } ${result.jackpot}!\nnew balance: ${eco.CURRENCY_EMOJI} ${
          result.balance
        }`
      );
    }

    await ctx.reply(
      `you bought a lottery ticket for ${eco.CURRENCY_EMOJI} ${result.cost}. jackpot is currently ${eco.CURRENCY_EMOJI} ${result.jackpot}`
    );
  },
};
