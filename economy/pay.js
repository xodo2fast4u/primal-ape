const eco = require("../../lib/economy");

module.exports = {
  name: "pay",
  category: "economy",
  run: async (ctx) => {
    let targetJid = null;

    if (
      ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
    ) {
      targetJid =
        ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else {
      targetJid = ctx.args[0];
    }

    if (!targetJid) return ctx.reply("tag someone or provide a jid to pay.");

    const amount = parseInt(ctx.args[1]);
    if (isNaN(amount) || amount <= 0) return ctx.reply("invalid amount.");

    const sender = eco.getProfile(ctx.jid);
    if (sender.bits < amount)
      return ctx.reply("you’re too broke for that transfer.");

    eco.addBits(ctx.jid, -amount);
    eco.addBits(targetJid, amount);

    return ctx.reply(
      `💸 transferred ${eco.CURRENCY_EMOJI} ${amount} ${eco.CURRENCY_NAME} → ${targetJid}\n` +
        `new balance: ${eco.CURRENCY_EMOJI} ${eco.getProfile(ctx.jid).bits}`
    );
  },
};
