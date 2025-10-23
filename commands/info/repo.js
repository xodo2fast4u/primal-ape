module.exports = {
  name: "repo",
  category: "info",
  run: async (ctx) => {
    const repoUrl = "https://github.com/xodo2fast4u/primal-ape";
    await ctx.reply(`> source code:\n> ${repoUrl}`);
  },
};
