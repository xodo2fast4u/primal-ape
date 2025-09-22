const eco = require("../../lib/economy");

module.exports = {
  name: "coinflip",
  category: "economy",
  run: async (ctx) => {
    const side = (ctx.args[0] || "").toLowerCase();
    const bet = parseInt(ctx.args[1]);

    if (!["heads", "tails"].includes(side)) {
      return ctx.reply("usage: !coinflip <heads|tails> <amount>");
    }
    if (isNaN(bet) || bet <= 0) return ctx.reply("invalid bet.");

    const profile = eco.getProfile(ctx.sender); // 👈 fixed
    if (!profile || profile.bits < bet) {
      return ctx.reply("you don’t have enough ApeBits.");
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    if (result === side) {
      eco.addBits(ctx.sender, bet);
      return ctx.reply(
        `🪙 it landed on *${result}*! you won ${eco.CURRENCY_EMOJI} ${bet}.`
      );
    } else {
      eco.addBits(ctx.sender, -bet);
      return ctx.reply(
        `🪙 unlucky, it was *${result}*. you lost ${eco.CURRENCY_EMOJI} ${bet}.`
      );
    }
  },
};
