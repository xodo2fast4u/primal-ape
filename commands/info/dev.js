module.exports = {
  name: "dev",
  category: "info",
  run: async (ctx) => {
    const output =
      `> Developer Info\n` +
      `> ==============\n` +
      `> Developed by: Ryan(aka xodobyte)\n` +
      `> GitHub: https://github.com/ryanfront\n` +
      `> Portfolio: https://realryan.vercel.app\n` +
      `> Specializes in modular bot design, immersive frontend layouts, and genre-flexible vocal chains.`;

    await ctx.reply(output);
  },
};
