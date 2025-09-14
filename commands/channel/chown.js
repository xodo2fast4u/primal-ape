module.exports = {
  name: "chown",
  category: "newsletter",
  run: async (ctx) => {
    const [jid, newOwner] = ctx.args;
    if (!jid || !newOwner)
      return ctx.reply("❌ Usage: chown <jid> <newOwnerJid>");

    await ctx.sock.newsletterChangeOwner(jid, newOwner);
    await ctx.reply(`✅ Ownership of ${jid} transferred to ${newOwner}`);
  },
};
