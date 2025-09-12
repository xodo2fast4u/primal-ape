module.exports = {
  name: "setgdesc",
  category: "group",
  run: async (ctx) => {
    if (!ctx.text) {
      return ctx.reply(
        "> ❌ Please provide a new group description.\nUsage: !setgdesc Welcome to our group!"
      );
    }

    try {
      await ctx.sock.groupUpdateDescription(ctx.jid, ctx.text);
      await ctx.reply("✅ Group description updated.");
    } catch (e) {
      await ctx.reply(
        "❌ Failed to update group description. Make sure you're an admin."
      );
    }
  },
};
