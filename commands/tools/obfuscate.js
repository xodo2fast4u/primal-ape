const crypto = require("crypto");
const path = require("path");

function xor(buf, k) {
  let o = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) o[i] = buf[i] ^ k;
  return o;
}

function obf(src) {
  const key = crypto.randomBytes(1)[0] | 1;
  const data = xor(Buffer.from(src, "utf8"), key).toString("base64");
  return `(function(){const k=${key};const d="${data}";const b=Buffer.from(d,"base64");for(let i=0;i<b.length;i++)b[i]^=k;console.log(b.toString())})()`;
}

module.exports = {
  name: "obfuscate",
  run: async (ctx) => {
    let source;

    if (ctx.text) {
      source = ctx.text;
    }
    else if (ctx.message?.documentMessage) {
      const fileName = ctx.message.documentMessage.fileName || "input.js";
      if (!fileName.endsWith(".js")) {
        return ctx.reply("> Please upload a `.js` file.");
      }

      try {
        const buffer = await ctx.downloadMediaMessage(ctx);
        source = buffer.toString("utf8");
      } catch (e) {
        console.error("File download error:", e);
        return ctx.reply("> Failed to read the file.");
      }
    }

    if (!source)
      return ctx.reply("> usage: !obfuscate <text> or upload a .js file");

    const out = obf(source);

    if (out.length > 3000) {
      await ctx.send({
        document: Buffer.from(out),
        fileName: "obfuscated.js",
        mimetype: "application/javascript",
      });
    } else {
      await ctx.reply("```js\n" + out + "\n```");
    }
  },
};
