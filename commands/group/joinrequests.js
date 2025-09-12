module.exports = {
  name: "joinrequests",
  category: "group",
  run: async (ctx) => {
    const requests = await ctx.sock.groupRequestParticipantsList(ctx.chatId);
    if (!requests.length) return ctx.reply("✅ No pending join requests.");

    const list = requests
      .map((r, i) => `${i + 1}. ${r.jid} (${r.common_name || "Unknown"})`)
      .join("\n");
    await ctx.reply(`📥 *Pending Join Requests:*\n\n${list}`);
  },
};
