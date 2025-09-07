const { exec } = require("child_process");

module.exports = {
  name: "traceroute",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !traceroute <host>");
    exec(`traceroute ${ctx.text}`, (err, stdout) => {
      if (err) return ctx.reply("> failed to trace");
      ctx.reply("```" + stdout + "```");
    });
  },
};
