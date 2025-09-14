module.exports = {
  name: "deletenewsletter",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: deletenewsletter <jid>");

    await ctx.sock.newsletterDelete(jid);
    await ctx.reply(`🗑️ Newsletter ${jid} deleted.`);
  },
};
