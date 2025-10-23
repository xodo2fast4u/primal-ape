const os = require("os");

module.exports = {
  name: "uptime",
  category: "info",
  run: async (ctx) => {
    const formatTime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}♄ ${m}ᗰ ${s}∫`;
    };

    const botUptime = formatTime(Math.floor(process.uptime()));
    const osUptime = formatTime(Math.floor(os.uptime()));

    const output =
      `> uptime information\n` +
      `> =================\n` +
      `> primal ape uptime: ${botUptime}\n` +
      `> primal ape system uptime: ${osUptime}`;

    await ctx.reply(output);
  },
};
