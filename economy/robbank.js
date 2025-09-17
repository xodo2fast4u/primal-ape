const eco = require("../../lib/economy");

module.exports = {
  name: "robbank",
  category: "economy",
  run: async (ctx) => {
    try {
      const user = ctx.sender;
      const profile = eco.getProfile(user);

      if (!profile) {
        return ctx.reply("❌ Could not fetch your profile.");
      }

      const MIN_REQUIRED = 500;
      if (profile.bits < MIN_REQUIRED) {
        return ctx.reply(
          `You need at least ${eco.CURRENCY_EMOJI} ${MIN_REQUIRED} to attempt a major bank job.`
        );
      }

      const successChance = 0.3;
      const payoutMin = 2000;
      const payoutMax = 10000;

      const bustedLossMin = 500;
      const bustedLossMax = 5000;

      const roll = Math.random();

      if (roll < successChance) {
        const payout =
          payoutMin + Math.floor(Math.random() * (payoutMax - payoutMin + 1));
        eco.addBits(user, payout);
        try {
          eco.addXpForCommand(user, 20);
        } catch {}

        return ctx.reply(
          `💥 HEIST SUCCESS!\nYou hit a major bank and grabbed ${eco.CURRENCY_EMOJI} ${payout}!\n` +
            `New balance: ${eco.CURRENCY_EMOJI} ${eco.getProfile(user).bits}`
        );
      } else {
        const loss =
          bustedLossMin +
          Math.floor(Math.random() * (bustedLossMax - bustedLossMin + 1));
        const actualLoss = Math.min(profile.bits, loss);
        eco.addBits(user, -actualLoss);

        return ctx.reply(
          `🚨 BUSTED! The alarms screamed and the cops took ${eco.CURRENCY_EMOJI} ${actualLoss}.\n` +
            `New balance: ${eco.CURRENCY_EMOJI} ${eco.getProfile(user).bits}`
        );
      }
    } catch (e) {
      console.error("robbanl crashed:", e);
      return ctx.reply("❌ something went wrong trying to rob a bank.");
    }
  },
};
