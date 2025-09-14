module.exports = {
  name: "createnewsletter",
  category: "newsletter",
  run: async (ctx) => {
    const [name, ...descParts] = ctx.args;
    if (!name)
      return ctx.reply("❌ Usage: createnewsletter <name> | <description>");

    const description = descParts.join(" ") || null;
    const result = await ctx.sock.newsletterCreate(name, description);

    await ctx.reply(
      `✅ Newsletter Created!\n\n📛 Name: ${result.name}\n📝 Desc: ${result.description}\n👥 Subs: ${result.subscribers}\n🆔 ID: ${result.id}`
    );
  },
};
