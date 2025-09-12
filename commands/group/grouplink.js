module.exports = {
  name: "grouplink",
  category: "group",
  run: async (ctx) => {
    const code = await ctx.sock.groupInviteCode(ctx.chatId);
    await ctx.reply(`🔗 Group Link:\nhttps://chat.whatsapp.com/${code}`);
  },
};
