module.exports = {
  name: "subscribers",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: subscribers <jid>");

    const data = await ctx.sock.newsletterSubscribers(jid);
    await ctx.reply(`👥 Subscribers: ${data.subscribers}`);
  },
};
