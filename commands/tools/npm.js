async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

module.exports = {
  name: "npm",
  category: "tools",
  run: async (ctx) => {
    const args = ctx.args;
    const sub = (args[0] || "").toLowerCase();
    const rest = args.slice(1).join(" ");

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
    }

    if (sub === "info") {
      if (!rest) return ctx.reply("> usage: !npm info <package>");
      return showInfo(ctx, rest);
    }

    if (sub) {
      return showInfo(ctx, args.join(" "));
    }

    return ctx.reply("> usage: !npm <search|info|package>");
  },
};

async function showInfo(ctx, pkgName) {
  try {
    const d = await getJson(
      "https://registry.npmjs.org/" + encodeURIComponent(pkgName)
    );
    const latest = d["dist-tags"]?.latest;
    const v = d.versions[latest];
    if (!v) return ctx.reply("> package not found");

    let downloads = "N/A";
    try {
      const stats = await getJson(
        `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(
          pkgName
        )}`
      );
      downloads = stats.downloads?.toLocaleString() || "N/A";
    } catch {}

    const name = `${d.name}@${latest}`;
    const desc = v.description || "No description";
    const homepage = v.homepage || "";
    const license = v.license || "N/A";
    const author =
      typeof v.author === "string" ? v.author : v.author?.name || "N/A";
    const repo =
      v.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") || "";

    const lines = [];
    lines.push(`📦 **${name}**`);
    lines.push(`📝 ${desc}`);
    lines.push("");
    lines.push(`• License: ${license}`);
    lines.push(`• Author: ${author}`);
    lines.push(`• Weekly Downloads: ${downloads}`);
    if (repo) lines.push(`• Repository: ${repo}`);
    if (homepage) lines.push(`• Homepage: ${homepage}`);

    return ctx.reply(lines.join("\n"));
  } catch (e) {
    return ctx.reply("> failed to fetch package info");
  }
}
