module.exports = {
  name: "unmutechannel",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: unmutechannel <jid>");

    await ctx.sock.newsletterUnmute(jid);
    await ctx.reply(`🔔 Unmuted newsletter: ${jid}`);
  },
};
