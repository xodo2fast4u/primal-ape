const eco = require("../../lib/economy");

module.exports = {
  name: "rob",
  category: "economy",
  run: async (ctx) => {
    const target =
      ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return ctx.reply("tag someone to rob, coward.");

    if (target === ctx.jid) return ctx.reply("you can’t rob yourself, genius.");

    const thief = eco.getProfile(ctx.jid);
    const victim = eco.getProfile(target);

    if (victim.bits < 50) return ctx.reply("target is too broke to rob.");

    if (Math.random() < 0.5) {
      const stolen = Math.floor(Math.random() * (victim.bits * 0.3)) + 20;
      eco.addBits(target, -stolen);
      eco.addBits(ctx.jid, stolen);
      return ctx.reply(
        `🦹 you robbed ${target.split("@")[0]} and stole ${
          eco.CURRENCY_EMOJI
        } ${stolen}!`
      );
    } else {
      const fine = Math.floor(thief.bits * 0.1);
      eco.addBits(ctx.jid, -fine);
      return ctx.reply(
        `🚨 robbery failed! you got fined ${eco.CURRENCY_EMOJI} ${fine}.`
      );
    }
  },
};
