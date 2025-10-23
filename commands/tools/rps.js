module.exports = {
  name: "rps",
  category: "tools",
  run: async (ctx) => {
    const pick = (ctx.args[0] || "").toLowerCase();
    const choices = ["rock", "paper", "scissors"];
    if (!choices.includes(pick))
      return ctx.reply("> usage: rps <rock|paper|scissors>");
    const bot = choices[Math.floor(Math.random() * choices.length)];
    const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
    let res = "draw";
    if (beats[pick] === bot) res = "you win";
    else if (beats[bot] === pick) res = "you lose";
    await ctx.reply(`you: ${pick}\nbot: ${bot}\nresult: ${res}`);
  },
};
