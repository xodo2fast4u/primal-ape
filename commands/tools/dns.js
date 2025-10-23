module.exports = {
  name: "dns",
  category: "tools",
  run: async (ctx) => {
    const domain = (ctx.args[0] || "").toLowerCase();
    const type = (ctx.args[1] || "A").toUpperCase();
    if (!domain)
      return ctx.reply("> usage: dns <domain> [type] (A,AAAA,MX,TXT,CNAME)");
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(
          domain
        )}&type=${encodeURIComponent(type)}`
      );
      const j = await res.json();
      const ans = j?.Answer || [];
      if (!ans.length) return ctx.reply("> no records");
      const lines = ans.map((a) => `${a.name} ${a.type} ${a.TTL} ${a.data}`);
      await ctx.reply(lines.slice(0, 15).join("\n"));
    } catch (e) {
      await ctx.reply("> dns error");
    }
  },
};
