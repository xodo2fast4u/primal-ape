const eco = require("../../lib/economy");

module.exports = {
  name: "claim",
  category: "economy",
  run: async (ctx) => {
    const key = (ctx.args[0] || "").toLowerCase();
    if (!key) {
      return ctx.reply(
        `usage: !claim <daily|weekly|monthly|yearly>  (try !claimlist for details)`
      );
    }

    const r = eco.claim(ctx.jid, key);
    if (!r.ok) {
      if (r.err && r.err.startsWith("requires level")) {
        return ctx.reply(`maybe level up first, champ → ${r.err}`);
      }
      if (r.cooldownMsLeft) {
        return ctx.reply(
          `already grabbed that. next in ${eco.fmtMs(r.cooldownMsLeft)}`
        );
      }
      return ctx.reply(
        `invalid claim type. did your keyboard slip? try !claimlist`
      );
    }

    await ctx.reply(
      `${r.def.name} reward claimed: ${eco.CURRENCY_EMOJI} ${r.reward} ${eco.CURRENCY_NAME}\n` +
        `new balance: ${eco.CURRENCY_EMOJI} ${r.balance} ${eco.CURRENCY_NAME}`
    );
  },
};
