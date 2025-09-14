module.exports = {
  name: "liveupdates",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: liveupdates <jid>");

    const result = await ctx.sock.subscribeNewsletterUpdates(jid);
    await ctx.reply(
      result
        ? `📡 Live updates subscribed for ${result.duration}`
        : "⚠️ Failed to subscribe."
    );
  },
};
