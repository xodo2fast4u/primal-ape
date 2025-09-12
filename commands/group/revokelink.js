module.exports = {
  name: "revokelink",
  category: "group",
  run: async (ctx) => {
    const code = await ctx.sock.groupRevokeInvite(ctx.chatId);
    await ctx.reply(
      `♻️ Link has been reset.\nNew Link: https://chat.whatsapp.com/${code}`
    );
  },
};
