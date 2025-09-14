module.exports = {
  name: "follow",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: follow <jid>");

    await ctx.sock.newsletterFollow(jid);
    await ctx.reply(`✅ Now following newsletter: ${jid}`);
  },
};
