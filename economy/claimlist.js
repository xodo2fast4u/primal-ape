const eco = require("../../lib/economy");

module.exports = {
  name: "claimlist",
  category: "economy",
  run: async (ctx) => {
    const claims = eco
      .getClaims()
      .map(
        (c) =>
          `• ${c.name.toLowerCase()} — base ${eco.CURRENCY_EMOJI} ${
            c.base
          }, unlock: L${c.levelReq}`
      )
      .join("\n");
    await ctx.reply(
      `claim types:\n${claims}\n\ntip: rewards scale slightly with your level.`
    );
  },
};
