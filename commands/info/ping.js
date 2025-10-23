module.exports = {
  name: "ping",
  category: "info",
  run: async (ctx) => {
    await ctx.reply("> pong");
  },
};
