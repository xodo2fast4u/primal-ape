const eco = require("../../lib/economy");

module.exports = {
  name: "inventory",
  category: "economy",
  run: async (ctx) => {
    const inv = eco.getInventory(ctx.jid);
    if (!inv.length)
      return ctx.reply("your inventory is emptier than your brain.");

    const list = inv.map((i) => `• ${i.name} (x${i.qty})`).join("\n");
    ctx.reply(`your items:\n${list}`);
  },
};
