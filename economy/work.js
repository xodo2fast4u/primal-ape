const eco = require("../../lib/economy");

module.exports = {
  name: "work",
  category: "economy",
  run: async (ctx) => {
    const jobKey = (ctx.args[0] || "").toLowerCase();
    const result = eco.work(ctx.sender, jobKey || undefined);

    if (!result.ok) {
      if (result.err === "invalid job") {
        const names = eco
          .getJobs()
          .map((j) => j.key)
          .join(", ");
        return ctx.reply(`bro… that's not a job. try one of: ${names}`);
      }
      if (result.cooldownMsLeft) {
        return ctx.reply(
          `take a breath, hustle boy. cooldown: ${eco.fmtMs(
            result.cooldownMsLeft
          )}`
        );
      }
      return ctx.reply(
        "somehow you managed to fail a pretend job. impressive."
      );
    }

    const { job, payout, bonus, balance } = result;
    await ctx.reply(
      `you worked **${job.name}** and earned ${eco.CURRENCY_EMOJI} ${payout} ${eco.CURRENCY_NAME}` +
        (bonus ? ` (incl. ${eco.CURRENCY_EMOJI} +${bonus} level bonus)` : "") +
        `\nnew balance: ${eco.CURRENCY_EMOJI} ${balance} ${eco.CURRENCY_NAME}`
    );
  },
};
