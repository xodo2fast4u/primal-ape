const eco = require("../../lib/economy");

module.exports = {
  name: "dice",
  category: "economy",
  run: async (ctx) => {
    const bet = parseInt(ctx.args[0]);
    if (isNaN(bet) || bet <= 0) {
      return ctx.reply("put some real money on the line, not pocket lint.");
    }

    const profile = eco.getProfile(ctx.sender);
    if (!profile || profile.bits < bet) {
      return ctx.reply("you’re broke. can’t bet what you don’t have.");
    }

    const userRoll = 1 + Math.floor(Math.random() * 6);
    const botRoll = 1 + Math.floor(Math.random() * 6);

    let win = false;
    let payout = bet;

    if (userRoll > botRoll) {
      eco.addBits(ctx.sender, bet);
      win = true;
    } else if (userRoll < botRoll) {
      eco.addBits(ctx.sender, -bet);
      win = false;
    } else {
      payout = 0;
    }

    const newProfile = eco.getProfile(ctx.sender);

    await ctx.reply(
      `you rolled a **${userRoll}** vs bot’s **${botRoll}**\n` +
        (payout === 0
          ? "it’s a tie! nobody wins or loses."
          : win
          ? `you win! earned ${eco.CURRENCY_EMOJI} ${payout}`
          : `you lose! lost ${eco.CURRENCY_EMOJI} ${payout}`) +
        `\nnew balance: ${eco.CURRENCY_EMOJI} ${newProfile.bits}`
    );
  },
};
