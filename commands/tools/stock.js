module.exports = {
  name: "stock",
  category: "tools",
  run: async (ctx) => {
    const symbols = (ctx.text || "AAPL")
      .toUpperCase()
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 6)
      .join(",");
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`
      );
      const json = await res.json();
      const items = json?.quoteResponse?.result || [];
      if (!items.length) return ctx.reply("> no results");
      const lines = items.map((q) => {
        const ch = (q.regularMarketChangePercent || 0).toFixed(2);
        return `${q.symbol}: $${q.regularMarketPrice} (${ch}%)`;
      });
      await ctx.reply(lines.join("\n"));
    } catch (e) {
      await ctx.reply("> stock error");
    }
  },
};
