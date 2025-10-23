const FIRST = [
  "Liam",
  "Noah",
  "Oliver",
  "Elijah",
  "James",
  "William",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
  "Olivia",
  "Emma",
  "Ava",
  "Sophia",
  "Isabella",
  "Mia",
  "Amelia",
  "Harper",
  "Evelyn",
  "Abigail",
];
const LAST = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
];

function pick(a) {
  return a[Math.floor(Math.random() * a.length)];
}

module.exports = {
  name: "name",
  category: "tools",
  run: async (ctx) => {
    const n = parseInt(ctx.args[0]) || 1;
    const out = [];
    for (let i = 0; i < Math.min(n, 20); i++)
      out.push(pick(FIRST) + " " + pick(LAST));
    await ctx.reply(out.join("\n"));
  },
};
