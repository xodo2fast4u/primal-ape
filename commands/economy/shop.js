const eco = require("../../lib/economy");

module.exports = {
  name: "shop",
  category: "economy",
  run: async (ctx) => {
    if (!ctx.args.length) {
      const items = eco.getShop();
      const list = items
        .map((i) => `• ${i.key} — ${i.name} (${eco.CURRENCY_EMOJI} ${i.price})`)
        .join("\n");
      return ctx.reply(
        `shop items:\n${list}\n\nusage: !shop buy <itemKey> <qty>`
      );
    }

    const [action, key, qtyRaw] = ctx.args;
    if (action.toLowerCase() !== "buy" || !key)
      return ctx.reply("usage: !shop buy <itemKey> <qty>");

    const qty = parseInt(qtyRaw) || 1;
    const res = eco.buyItem(ctx.jid, key.toLowerCase(), qty);

    if (!res.ok) return ctx.reply(`nope: ${res.err}`);

    ctx.reply(
      `you bought ${qty}x **${res.item.name}** for ${eco.CURRENCY_EMOJI} ${
        res.item.price * qty
      }. 
       new balance: ${eco.CURRENCY_EMOJI} ${res.balance}`
    );
  },
};
