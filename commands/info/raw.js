module.exports = {
  name: "raw",
  category: "info",
  run: async (ctx) => {
    await ctx.reply(JSON.stringify(ctx, null, 2));
  },
};
