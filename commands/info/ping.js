module.exports = {
  name: "ping",
  run: async (ctx) => {
    await ctx.reply("> pong");
  },
};
