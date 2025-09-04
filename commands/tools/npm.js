async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

module.exports = {
  name: "npm",
  run: async (ctx) => {
    const sub = (ctx.args[0] || "").toLowerCase();
    const rest = ctx.args.slice(1).join(" ");
    if (sub === "search") {
      if (!rest) return ctx.reply("> usage: !npm search <query>");
      const d = await getJson(
        "https://registry.npmjs.org/-/v1/search?text=" +
          encodeURIComponent(rest) +
          "&size=5"
      );
      if (!d.objects.length) return ctx.reply("> no results");
      const lines = d.objects.map(
        (o) =>
          `${o.package.name}@${o.package.version}\n${
            o.package.description || ""
          }`
      );
      return ctx.reply(lines.join("\n\n"));
    } else if (sub === "info") {
      if (!rest) return ctx.reply("> usage: !npm info <package>");
      const d = await getJson(
        "https://registry.npmjs.org/" + encodeURIComponent(rest)
      );
      const latest = d["dist-tags"]?.latest;
      const v = d.versions[latest];
      return ctx.reply(
        `${d.name}@${latest}\n${v?.description || ""}\n${v?.homepage || ""}`
      );
    } else {
      return ctx.reply("> usage: !npm <search|info>");
    }
  },
};
