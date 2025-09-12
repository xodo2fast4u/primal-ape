module.exports = {
  name: "setgpp",
  category: "group",
  run: async (ctx) => {
    const quoted = ctx.msg.message?.imageMessage ? ctx.msg : ctx.msg.quoted;

    if (!quoted?.message?.imageMessage) {
      return ctx.reply("> ❌ Please reply to an image with `!setgpp`.");
    }

    try {
      const buffer = await ctx.sock.downloadMediaMessage(quoted);
      await ctx.sock.updateProfilePicture(ctx.jid, buffer);
      await ctx.reply("✅ Group profile picture updated.");
    } catch (e) {
      await ctx.reply(
        "❌ Failed to update group profile picture. Make sure you're an admin."
      );
    }
  },
};
