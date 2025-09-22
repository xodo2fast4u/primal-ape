const eco = require("../../lib/economy");

module.exports = {
  name: "jackpot",
  category: "economy",
  run: async (ctx) => {
    const bet = parseInt(ctx.args[0]);
    if (isNaN(bet) || bet <= 0)
      return ctx.reply("throw in a valid amount, clown.");

    const result = eco.jackpot(ctx.sender, bet); // 👈 use sender

    if (!result.ok) {
      if (result.err === "insufficient funds")
        return ctx.reply("you can’t enter jackpot with monopoly money.");
      if (result.cooldownMsLeft)
        return ctx.reply(
          `relax, jackpot draw is in progress. wait ${eco.fmtMs(
            result.cooldownMsLeft
          )}`
        );
      return ctx.reply("jackpot system had a meltdown. skill issue.");
    }

    if (result.winner) {
      return ctx.reply(
        `🎉 ${result.winner.split("@")[0]} won the jackpot of ${
          eco.CURRENCY_EMOJI
        } ${result.pot}!\nnew balance: ${eco.CURRENCY_EMOJI} ${result.balance}`
      );
    }

    await ctx.reply(
      `you entered the jackpot with ${eco.CURRENCY_EMOJI} ${bet}. current pot: ${eco.CURRENCY_EMOJI} ${result.pot}`
    );
  },
};
