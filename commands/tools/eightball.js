module.exports = {
  name: "8ball",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) return ctx.reply("> usage: 8ball <question>");
    const ans = [
      "It is certain.",
      "Without a doubt.",
      "You may rely on it.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Don't count on it.",
      "My reply is no.",
      "Very doubtful.",
    ];
    const pick = ans[Math.floor(Math.random() * ans.length)];
    await ctx.reply(`🎱 ${pick}`);
  },
};
