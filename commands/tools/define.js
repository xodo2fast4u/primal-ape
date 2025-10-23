module.exports = {
  name: "define",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("Usage: !define <word>");
      return;
    }

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`
    ).catch(() => null);

    if (!res || !res.ok) {
      await ctx.reply("> No definition found for the specified word.");
      return;
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.length) {
      await ctx.reply("> No definition found for the specified word.");
      return;
    }

    const entry = data[0];
    const { word, phonetics, meanings } = entry;

    let caption = "";
    caption += `> Word: ${word}\n`;

    if (phonetics && phonetics.length > 0) {
      const phoneticText = phonetics.find((p) => p.text)?.text || "N/A";
      caption += `> Phonetic: ${phoneticText}\n`;
    }

    meanings.forEach((meaning, i) => {
      caption += `\n> Part of Speech: ${meaning.partOfSpeech}\n`;
      caption += `> Definitions:\n`;
      meaning.definitions.forEach((def, j) => {
        caption += `  ${j + 1}. ${def.definition}\n`;
        if (def.example) {
          caption += `     Example: "${def.example}"\n`;
        }
      });
      if (meaning.synonyms && meaning.synonyms.length > 0) {
        caption += `> Synonyms: ${meaning.synonyms.slice(0, 5).join(", ")}\n`;
      }
      if (meaning.antonyms && meaning.antonyms.length > 0) {
        caption += `> Antonyms: ${meaning.antonyms.slice(0, 5).join(", ")}\n`;
      }
    });

    await ctx.reply(caption);
  },
};
