module.exports = {
  name: "setname",
  category: "profile",
  run: async (ctx) => {
    const newName = ctx.text;
    if (!newName) {
      return ctx.reply(
        "> ❌ Please provide a new name.\nUsage: !setname YourName"
      );
    }

    try {
      await ctx.sock.updateProfileName(newName);
      await ctx.reply(`✅ Profile name updated to: *${newName}*`);
    } catch (e) {
      await ctx.reply("❌ Failed to update profile name.");
    }
  },
};
