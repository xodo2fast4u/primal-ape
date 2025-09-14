module.exports = {
  name: "reactmsg",
  category: "newsletter",
  run: async (ctx) => {
    const [jid, msgId, reaction] = ctx.args;
    if (!jid || !msgId)
      return ctx.reply("❌ Usage: reactmsg <jid> <msgId> <emoji?>");

    await ctx.sock.newsletterReactMessage(jid, msgId, reaction);
    await ctx.reply(
      `✅ Reaction ${reaction || "removed"} on message ${msgId} in ${jid}`
    );
  },
};
