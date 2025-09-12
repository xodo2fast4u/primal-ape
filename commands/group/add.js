module.exports = {
  name: "add",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("❌ Group only command.");
    if (!ctx.args[0])
      return ctx.reply(
        "⚠️ Provide a number to add.\nExample: `.add 1234567890`"
      );

    const number = ctx.args[0].replace(/[^0-9]/g, "");
    const jid = number + "@s.whatsapp.net";

    await ctx.sock.groupParticipantsUpdate(ctx.chatId, [jid], "add");
    await ctx.reply(`✅ Invited @${number}`, { mentions: [jid] });
  },
};
