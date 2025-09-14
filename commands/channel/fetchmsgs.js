module.exports = {
  name: "fetchmsgs",
  category: "newsletter",
  run: async (ctx) => {
    const [jid, count] = ctx.args;
    if (!jid || !count) return ctx.reply("❌ Usage: fetchmsgs <jid> <count>");

    const result = await ctx.sock.newsletterFetchMessages(
      jid,
      parseInt(count),
      0,
      0
    );
    await ctx.reply(
      `📨 Fetched ${count} messages from ${jid}.\n\n${JSON.stringify(
        result,
        null,
        2
      )}`
    );
  },
};
