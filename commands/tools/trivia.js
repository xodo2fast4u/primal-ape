module.exports = {
  name: "trivia",
  category: "tools",
  run: async (ctx) => {
    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );
      const data = await res.json();
      const q = data?.results?.[0];
      if (!q) return ctx.reply("> couldn't fetch trivia");
      const decode = (s) =>
        String(s)
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");

      const opts = [...q.incorrect_answers, q.correct_answer].map(decode);
      // shuffle
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      const ans = decode(q.correct_answer);
      const lines = [
        `❓ ${decode(q.question)}`,
        ...opts.map((o, i) => `${i + 1}. ${o}`),
        `\nAnswer: ${ans}`,
      ];
      await ctx.reply(lines.join("\n"));
    } catch (e) {
      await ctx.reply("> trivia error");
    }
  },
};
