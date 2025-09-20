module.exports = {
  name: "groupinfo",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("❌ Group only command.");

    const metadata = await ctx.sock.groupMetadata(ctx.jid);
    const info = [
      `📌 *Group Info*`,
      `• ID: ${metadata.id}`,
      `• Name: ${metadata.subject}`,
      `• Owner: ${metadata.owner || "N/A"}`,
      `• Size: ${metadata.participants.length}`,
      `• Created: ${new Date(metadata.creation * 1000).toLocaleString()}`,
      `• Desc: ${metadata.desc || "None"}`,
    ].join("\n");

    await ctx.reply(info);
  },
};
