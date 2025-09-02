// commands/info/speed.js
module.exports = {
  name: "speed",
  category: "info",
  run: async (ctx) => {
    const start = Date.now();
    await ctx.reply("Measuring speed...");
    const end = Date.now();
    const latency = end - start;

    await ctx.reply(`Response latency: ${latency}ms`);
  },
};
