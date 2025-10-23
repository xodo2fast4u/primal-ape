module.exports = {
  name: "time",
  category: "tools",
  run: async (ctx) => {
    const arg = (ctx.args[0] || "").toLowerCase();
    const now = Date.now();

    if (!arg) {
      const d = new Date(now);
      return ctx.reply(`now: ${d.toUTCString()} (${d.toString()})`);
    }

    if (arg === "unix") {
      return ctx.reply(String(Math.floor(now / 1000)));
    }

    if (arg === "from") {
      const ts = parseInt(ctx.args[1]);
      if (!ts) return ctx.reply("usage: !time from <unix_seconds>");
      return ctx.reply(new Date(ts * 1000).toString());
    }

    ctx.reply("unknown subcommand. supported: unix, from");
  },
};
