module.exports = {
  name: "speed",
  category: "info",
  run: async (ctx) => {
    const start = Date.now();

    const sentMsg = await ctx.sock.sendMessage(
      ctx.jid,
      { text: "> measuring speed..." },
      { quoted: ctx.m }
    );

    const latency = Date.now() - start;

    await ctx.sock.sendMessage(
      ctx.jid,
      {
        text: `> ⚡ speed: ${latency}ms`,
        edit: sentMsg.key,
      },
      { quoted: ctx.m }
    );
  },
};
