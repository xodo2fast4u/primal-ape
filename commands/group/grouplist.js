module.exports = {
  name: "grouplist",
  category: "group",
  run: async (ctx) => {
    const groups = await ctx.sock.groupFetchAllParticipating();
    const list = Object.values(groups)
      .map((g, i) => `${i + 1}. ${g.subject} (${g.id}) [${g.size} members]`)
      .join("\n");

    await ctx.reply(`📂 *Your Groups:*\n\n${list}`);
  },
};
