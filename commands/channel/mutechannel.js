module.exports = {
  name: "mutechannel",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: mutechannel <jid>");

    await ctx.sock.newsletterMute(jid);
    await ctx.reply(`🔕 Muted newsletter: ${jid}`);
  },
};
