module.exports = {
  name: "getpp",
  category: "profile",
  run: async (ctx) => {
    const target = ctx.args[0] || ctx.jid;

    try {
      const url = await ctx.sock.profilePictureUrl(target, "image");
      if (!url) {
        return ctx.reply("❌ No profile picture found.");
      }
      await ctx.send({
        image: { url },
        caption: `> Profile picture of ${target}`,
      });
    } catch (e) {
      await ctx.reply("❌ Failed to fetch profile picture.");
    }
  },
};
