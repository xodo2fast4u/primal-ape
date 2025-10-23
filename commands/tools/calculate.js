const ALLOWED = new Set([
  "abs",
  "acos",
  "acosh",
  "asin",
  "asinh",
  "atan",
  "atan2",
  "atanh",
  "cbrt",
  "ceil",
  "clz32",
  "cos",
  "cosh",
  "exp",
  "expm1",
  "floor",
  "fround",
  "hypot",
  "imul",
  "log",
  "log10",
  "log1p",
  "log2",
  "max",
  "min",
  "pow",
  "round",
  "sign",
  "sin",
  "sinh",
  "sqrt",
  "tan",
  "tanh",
  "trunc",
  "E",
  "LN2",
  "LN10",
  "LOG2E",
  "LOG10E",
  "PI",
  "SQRT1_2",
  "SQRT2",
  "rad",
  "deg",
]);

const CTX = Object.freeze({
  ...Object.fromEntries([...ALLOWED].map((k) => [k, Math[k] ?? undefined])),
  rad: (x) => (x * Math.PI) / 180,
  deg: (x) => (x * 180) / Math.PI,
});

function validate(expr) {
  if (expr.length > 2000) throw new Error("too long");
  if (/[`'"=;{}[\]\\]/.test(expr)) throw new Error("bad chars");
  const ids = expr.match(/[A-Za-z_]\w*/g) || [];
  for (const id of ids)
    if (!ALLOWED.has(id)) throw new Error("id not allowed: " + id);
}

function evaluate(expr) {
  validate(expr);
  const fn = new Function("ctx", `with(ctx){return(${expr})}`);
  return fn(CTX);
}

module.exports = {
  name: "calculate",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !calculate <expression>");
    try {
      const val = evaluate(ctx.text);
      await ctx.reply(`= ${val}`);
    } catch (e) {
      await ctx.reply("> error: " + e.message);
    }
  },
};
