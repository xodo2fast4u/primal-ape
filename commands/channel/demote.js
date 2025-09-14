module.exports = {
  name: "demote",
  category: "newsletter",
  run: async (ctx) => {
    const [jid, user] = ctx.args;
    if (!jid || !user) return ctx.reply("❌ Usage: demote <jid> <userJid>");

    await ctx.sock.newsletterDemote(jid, user);
    await ctx.reply(`❌ User ${user} demoted in ${jid}`);
  },
};
