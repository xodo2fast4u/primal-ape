module.exports = {
  name: "setpp",
  category: "profile",
  run: async (ctx) => {
    const quoted = ctx.msg.message?.imageMessage ? ctx.msg : ctx.msg.quoted;

    if (!quoted?.message?.imageMessage) {
      return ctx.reply("> ❌ Please reply to an image with `!setpp`.");
    }

    try {
      const buffer = await ctx.sock.downloadMediaMessage(quoted);
      await ctx.sock.updateProfilePicture(ctx.jid, buffer);
      await ctx.reply("✅ Profile picture updated.");
    } catch (e) {
      await ctx.reply("❌ Failed to update profile picture.");
    }
  },
};
