module.exports = {
  name: "remind",
  category: "tools",
  run: async (ctx) => {
    const [d, ...rest] = ctx.args;
    const note = rest.join(" ");
    if (!d || !note)
      return ctx.reply("> usage: remind <duration(e.g.,10m)> <text>");

    const ms = parseDuration(d);
    if (!ms || ms < 1000) return ctx.reply("> invalid duration");
    const max = 6 * 60 * 60 * 1000;
    if (ms > max) return ctx.reply("> max duration is 6h");

    await ctx.reply(`⏰ reminder set for ${formatMs(ms)}`);
    setTimeout(() => {
      ctx.reply(`⏰ reminder: ${note}`);
    }, ms);
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
