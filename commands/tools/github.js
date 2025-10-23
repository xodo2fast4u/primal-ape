module.exports = {
  name: "github",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !github <username>");
    try {
      const res = await fetch(`https://api.github.com/users/${ctx.text}`);
      if (!res.ok) return ctx.reply("> user not found");
      const data = await res.json();
      await ctx.reply(
        `> 👤 ${data.login}\n` +
          `> 📝 ${data.bio || "no bio"}\n` +
          `> 📂 Public Repos: ${data.public_repos}\n` +
          `> 👥 Followers: ${data.followers}\n` +
          `> 🔗 ${data.html_url}`
      );
    } catch {
      ctx.reply("> failed to fetch");
    }
  },
};
