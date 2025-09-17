const eco = require("../../lib/economy");

const symbols = ["🍌", "🍒", "🍇", "💎", "7️⃣"];

module.exports = {
  name: "slots",
  category: "economy",
  run: async (ctx) => {
    const bet = parseInt(ctx.args[0]);
    if (isNaN(bet) || bet <= 0) return ctx.reply("usage: !slots <bet>");

    const profile = eco.getProfile(ctx.sender); // 👈 fixed
    if (!profile || profile.bits < bet) {
      return ctx.reply("you don’t have enough ApeBits.");
    }

    const spin = [0, 0, 0].map(
      () => symbols[Math.floor(Math.random() * symbols.length)]
    );
    const line = spin.join(" | ");

    if (new Set(spin).size === 1) {
      const win = bet * 5;
      eco.addBits(ctx.sender, win);
      return ctx.reply(
        `🎰 ${line}\nJACKPOT! you won ${eco.CURRENCY_EMOJI} ${win}.`
      );
    } else if (new Set(spin).size === 2) {
      const win = bet * 2;
      eco.addBits(ctx.sender, win);
      return ctx.reply(
        `🎰 ${line}\nnot bad, you won ${eco.CURRENCY_EMOJI} ${win}.`
      );
    } else {
      eco.addBits(ctx.sender, -bet);
      return ctx.reply(
        `🎰 ${line}\nyou lost ${eco.CURRENCY_EMOJI} ${bet}. house always wins.`
      );
    }
  },
};
