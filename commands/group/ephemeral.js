module.exports = {
  name: "ephemeral",
  category: "group",
  run: async (ctx) => {
    if (!ctx.args[0])
      return ctx.reply(
        "⚠️ Provide duration in seconds, or `off` to disable.\nExample: `.ephemeral 86400`"
      );

    if (ctx.args[0] === "off") {
      await ctx.sock.groupToggleEphemeral(ctx.chatId, 0);
      return ctx.reply("⏳ Ephemeral messages *disabled*.");
    }

    const seconds = parseInt(ctx.args[0]);
    await ctx.sock.groupToggleEphemeral(ctx.chatId, seconds);
    await ctx.reply(`⏳ Ephemeral messages set to ${seconds} seconds.`);
  },
};
