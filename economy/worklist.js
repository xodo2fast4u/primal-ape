const eco = require("../../lib/economy");

module.exports = {
  name: "worklist",
  category: "economy",
  run: async (ctx) => {
    const jobs = eco
      .getJobs()
      .map(
        (j) =>
          `• ${j.name} (${j.key}) — pays ${eco.CURRENCY_EMOJI} ${j.min}-${j.max}`
      )
      .join("\n");
    await ctx.reply(
      `available jobs:\n${jobs}\n\nusage: !work <jobKey>  e.g. !work dj`
    );
  },
};
