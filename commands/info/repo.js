module.exports = {
  name: "repo",
  category: "info",
  run: async (ctx) => {
    const repoUrl = "https://github.com/ryanfront/primal-ape";
    await ctx.reply(`> Source code:\n> ${repoUrl}`);
  },
};
