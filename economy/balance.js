const eco = require("../../lib/economy");

module.exports = {
  name: "balance",
  category: "economy",
  run: async (ctx) => {
    let targetJid = ctx.sender;

    if (
      ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
    ) {
      targetJid =
        ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }

    const profile = eco.getProfile(targetJid);

    if (!profile) {
      return ctx.reply("❌ Cannot fetch balance for this user.");
    }

    await ctx.reply(
      `💰 balance for ${targetJid.split("@")[0]}:\n` +
        `${eco.CURRENCY_EMOJI} ${profile.bits} ${eco.CURRENCY_NAME}\n` +
        `title: ${profile.title} (L${profile.level})`
    );
  },
};
