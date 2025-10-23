module.exports = {
  name: "base",
  category: "tools",
  run: async (ctx) => {
    // usage: !base encode|decode <base> <text>
    const [action, baseStr, ...rest] = ctx.args;
    if (!action || !baseStr || !rest.length)
      return ctx.reply("usage: !base encode|decode <base> <text>");

    const b = parseInt(baseStr);
    if (isNaN(b) || b < 2 || b > 36)
      return ctx.reply("base must be between 2 and 36");

    const text = rest.join(" ");
    if (action === "encode") {
      try {
        const num = BigInt("0x" + Buffer.from(text, "utf8").toString("hex"));
        // convert to base b
        let out = "";
        let n = num;
        if (n === 0n) out = "0";
        while (n > 0n) {
          const rem = Number(n % BigInt(b));
          out = rem.toString(b) + out;
          n = n / BigInt(b);
        }
        return ctx.reply(out);
      } catch (e) {
        return ctx.reply("encode error");
      }
    }

    if (action === "decode") {
      try {
        const digits = text.trim();
        let n = 0n;
        for (const ch of digits) {
          const val = parseInt(ch, b);
          if (isNaN(val)) return ctx.reply("invalid digit for base");
          n = n * BigInt(b) + BigInt(val);
        }
        // convert n back to utf8 string
        let hex = n.toString(16);
        if (hex.length % 2) hex = "0" + hex;
        const buf = Buffer.from(hex, "hex");
        return ctx.reply(buf.toString("utf8"));
      } catch (e) {
        return ctx.reply("decode error");
      }
    }

    return ctx.reply("unknown action: encode|decode");
  },
};
