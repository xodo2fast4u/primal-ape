module.exports = {
  name: "demote",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("❌ Group only command.");
    if (!ctx.mentionedJid.length)
      return ctx.reply("⚠️ Tag the user you want to demote.");

    await ctx.sock.groupParticipantsUpdate(
      ctx.chatId,
      ctx.mentionedJid,
      "demote"
    );
    await ctx.reply(
      `✅ Demoted: ${ctx.mentionedJid
        .map((j) => "@" + j.split("@")[0])
        .join(", ")}`,
      {
        mentions: ctx.mentionedJid,
      }
    );
  },
};
