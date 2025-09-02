module.exports = {
  name: "speed",
  category: "info",
  run: async (ctx) => {
    const start = Date.now();
    await ctx.reply("> Measuring latency...");
    const latency = Date.now() - start;

    await ctx.reply(
      `> Speed Test\n` + `> ==========\n` + `> Response latency: ${latency}ms`
    );
  },
};
