module.exports = {
  name: "unfollow",
  category: "newsletter",
  run: async (ctx) => {
    const [jid] = ctx.args;
    if (!jid) return ctx.reply("❌ Usage: unfollow <jid>");

    await ctx.sock.newsletterUnfollow(jid);
    await ctx.reply(`❌ Unfollowed newsletter: ${jid}`);
  },
};
