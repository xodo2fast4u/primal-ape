module.exports = {
  name: "crypto",
  category: "tools",
  run: async (ctx) => {
    const raw = (ctx.text || "bitcoin").toLowerCase();
    const tokens = raw
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 6);
    const map = {
      btc: "bitcoin",
      eth: "ethereum",
      sol: "solana",
      doge: "dogecoin",
      ada: "cardano",
      xrp: "ripple",
      bnb: "binancecoin",
      matic: "matic-network",
    };
    const ids = tokens.map((t) => map[t] || t).join(",");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await res.json();
      const lines = Object.keys(data).map((k) => {
        const v = data[k];
        const ch =
          typeof v.usd_24h_change === "number"
            ? v.usd_24h_change.toFixed(2)
            : "?";
        return `${k}: $${v.usd} (${ch}% 24h)`;
      });
      if (!lines.length) return ctx.reply("> no data");
      await ctx.reply(lines.join("\n"));
    } catch (e) {
      await ctx.reply("> crypto error");
    }
  },
};
