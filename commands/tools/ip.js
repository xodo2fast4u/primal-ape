module.exports = {
  name: "ip",
  category: "tools",
  run: async (ctx) => {
    const ip = (ctx.text || "").trim();
    if (!ip) return ctx.reply("> usage: ip <address>");
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
      const j = await res.json();
      if (!j.success) return ctx.reply("> invalid ip");
      const lines = [
        `IP: ${j.ip}`,
        `Location: ${j.city}, ${j.region}, ${j.country}`,
        `Lat/Lon: ${j.latitude}, ${j.longitude}`,
        `ISP: ${j.connection?.isp || "?"}`,
      ];
      await ctx.reply(lines.join("\n"));
    } catch (e) {
      await ctx.reply("> ip error");
    }
  },
};
