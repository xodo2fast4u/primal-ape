module.exports = {
  name: "lock",
  category: "group",
  run: async (ctx) => {
    await ctx.sock.groupSettingUpdate(ctx.chatId, "announcement");
    await ctx.reply("🔒 Group is now *announcement only*.");
  },
};
