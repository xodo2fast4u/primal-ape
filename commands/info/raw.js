function safeStringify(obj, indent = 2) {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    },
    indent
  );
}

module.exports = {
  name: "raw",
  category: "info",
  run: async (ctx) => {
    await ctx.reply(safeStringify(ctx));
  },
};
