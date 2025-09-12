module.exports = {
  name: "kick",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("❌ Group only command.");
    if (!ctx.mentionedJid.length)
      return ctx.reply("⚠️ Tag the user you want to kick.");

    await ctx.sock.groupParticipantsUpdate(
      ctx.chatId,
      ctx.mentionedJid,
      "remove"
    );
    await ctx.reply(
      `🚪 Removed: ${ctx.mentionedJid
        .map((j) => "@" + j.split("@")[0])
        .join(", ")}`,
      {
        mentions: ctx.mentionedJid,
      }
    );
  },
};
