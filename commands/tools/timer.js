module.exports = {
  name: "timer",
  category: "tools",
  run: async (ctx) => {
    const d = (ctx.args[0] || "").trim();
    if (!d) return ctx.reply("> usage: timer <duration(e.g.,30s,5m)>");
    const ms = parseDuration(d);
    if (!ms || ms < 1000) return ctx.reply("> invalid duration");
    await ctx.reply(`⏳ timer started for ${formatMs(ms)}`);
    setTimeout(() => ctx.reply("⌛ time's up!"), ms);
  },
};

function parseDuration(s) {
  const re = /(\d+)([smhd])/gi;
  let m,
    total = 0;
  while ((m = re.exec(s))) {
    const n = parseInt(m[1]);
    const u = m[2].toLowerCase();
    if (u === "s") total += n * 1000;
    if (u === "m") total += n * 60 * 1000;
    if (u === "h") total += n * 60 * 60 * 1000;
    if (u === "d") total += n * 24 * 60 * 60 * 1000;
  }
  return total;
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}
