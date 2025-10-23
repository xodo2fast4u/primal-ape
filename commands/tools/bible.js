async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

module.exports = {
  name: "bible",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) {
      return ctx.reply(
        `> 📖 *Bible Command Usage*\n\n` +
          `• \`!bible random\` → Get a random verse\n` +
          `• \`!bible John 3:16\` → Get a specific verse\n\n` +
          `Example: \`!bible Matthew 5:9\``
      );
    }

    try {
      if (ctx.text.toLowerCase() === "random") {
        const d = await getJson(
          "https://labs.bible.org/api/?passage=random&type=json"
        );
        const v = d[0];
        return ctx.reply(
          `📖 *Random Verse*\n${v.bookname} ${v.chapter}:${
            v.verse
          } — ${v.text.trim()}`
        );
      } else {
        const d = await getJson(
          "https://bible-api.com/" + encodeURIComponent(ctx.text)
        );
        const lines = d.verses
          .map(
            (v) => `${v.book_name} ${v.chapter}:${v.verse} — ${v.text.trim()}`
          )
          .join("\n");
        return ctx.reply(`📖 *Search Result*\n${lines}`);
      }
    } catch (e) {
      return ctx.reply("> ❌ error: " + e.message);
    }
  },
};
