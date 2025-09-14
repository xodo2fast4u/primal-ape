module.exports = {
  name: "newsletterinfo",
  category: "newsletter",
  run: async (ctx) => {
    const [type, key] = ctx.args;
    if (!type || !key)
      return ctx.reply("❌ Usage: newsletterinfo <jid|invite> <value>");

    const data = await ctx.sock.newsletterMetadata(type, key);
    if (!data) return ctx.reply("⚠️ Newsletter not found.");

    await ctx.reply(
      `📢 Newsletter Info:\n\n🆔 ID: ${data.id}\n📛 Name: ${
        data.name
      }\n📝 Desc: ${data.description}\n👥 Subs: ${
        data.subscribers
      }\n✔️ Verified: ${data.verification}\n📸 Picture: ${
        data.picture?.directPath || "None"
      }`
    );
  },
};
