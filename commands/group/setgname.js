module.exports = {
  name: "setgname",
  category: "group",
  run: async (ctx) => {
    if (!ctx.text) {
      return ctx.reply(
        "> ❌ Please provide a new group name.\nUsage: !setgname My Group"
      );
    }

    try {
      await ctx.sock.groupUpdateSubject(ctx.jid, ctx.text);
      await ctx.reply(`✅ Group name updated to: *${ctx.text}*`);
    } catch (e) {
      await ctx.reply(
        "❌ Failed to update group name. Make sure you're an admin."
      );
    }
  },
};
