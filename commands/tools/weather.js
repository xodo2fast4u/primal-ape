module.exports = {
  name: "weather",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("Usage: !weather <location>");
      return;
    }

    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(q)}?format=%l:+%C+%t+%w+%h+%p+%D`
    ).catch(() => null);

    if (!res || !res.ok) {
      await ctx.reply("> Failed to fetch weather data.");
      return;
    }

    const data = await res.text().catch(() => null);
    if (!data) {
      await ctx.reply("> No weather data found for the specified location.");
      return;
    }

    const parts = data.split(/[:+]/);
    const location = parts[0].trim();
    const condition = parts[1].trim();
    const temp = parts[2].trim();
    const wind = parts[3].trim();
    const humidity = parts[4].trim();
    const precipitation = parts[5].trim();
    const detailedDesc = parts[6] ? parts[6].trim() : "N/A";

    let caption = "";
    caption += `> Location: ${location}\n`;
    caption += `> Condition: ${condition}\n`;
    caption += `> Temperature: ${temp}\n`;
    caption += `> Wind: ${wind}\n`;
    caption += `> Humidity: ${humidity}\n`;
    caption += `> Precipitation: ${precipitation}\n`;
    caption += `> Description: ${detailedDesc}`;

    await ctx.reply(caption);
  },
};
