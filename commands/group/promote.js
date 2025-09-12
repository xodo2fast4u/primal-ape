module.exports = {
  name: "promote",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("❌ Group only command.");
    if (!ctx.mentionedJid.length)
      return ctx.reply("⚠️ Tag the user you want to promote.");

    await ctx.sock.groupParticipantsUpdate(
      ctx.chatId,
      ctx.mentionedJid,
      "promote"
    );
    await ctx.reply(
      `✅ Promoted: ${ctx.mentionedJid
        .map((j) => "@" + j.split("@")[0])
        .join(", ")}`,
      {
        mentions: ctx.mentionedJid,
      }
    );
  },
};
