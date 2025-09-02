// commands/info/repo.js
module.exports = {
  name: "repo",
  category: "info",
  run: async (ctx) => {
    const repoUrl = "https://github.com/ryanfront/primal-ape"; // Replace with actual repo link
    await ctx.reply(`Source code:\n> ${repoUrl}`);
  },
};
