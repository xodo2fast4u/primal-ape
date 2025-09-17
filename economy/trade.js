const eco = require("../../lib/economy");

module.exports = {
  name: "trade",
  category: "economy",
  run: async (ctx) => {
    const [target, key, qtyRaw] = ctx.args;
    if (!target || !key || !qtyRaw)
      return ctx.reply("usage: !trade <user> <itemKey> <qty>");

    const qty = parseInt(qtyRaw);
    if (isNaN(qty) || qty <= 0) return ctx.reply("invalid qty, genius.");

    const result = eco.tradeItem(ctx.jid, target, key.toLowerCase(), qty);
    if (!result.ok) {
      if (result.err === "no items")
        return ctx.reply("you own nothing. broke.");
      if (result.err === "not enough")
        return ctx.reply("you don’t have that many to trade.");
      return ctx.reply("trade failed, lmao.");
    }

    ctx.reply(
      `you gave ${result.qty}x **${result.item.name}** to ${target}. enjoy your poverty.`
    );
  },
};
