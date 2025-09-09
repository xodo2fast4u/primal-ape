module.exports = {
  name: "setstatus",
  category: "profile",
  run: async (ctx) => {
    const newStatus = ctx.text;
    if (!newStatus) {
      return ctx.reply(
        "> ❌ Please provide a new status.\nUsage: !setstatus Feeling good!"
      );
    }

    try {
      await ctx.sock.updateProfileStatus(newStatus);
      await ctx.reply(`✅ Status updated to: "${newStatus}"`);
    } catch (e) {
      await ctx.reply("❌ Failed to update status.");
    }
  },
};
