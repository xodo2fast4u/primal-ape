const fs = require("fs");
const path = require("path");

function normalizeId(jid) {
  if (!jid) return null;

  if (jid.endsWith("@g.us")) return null;

  if (jid.includes("@lid")) {
    return jid.replace(/@lid$/, "@s.whatsapp.net");
  }

  return jid;
}

function sellItem(jid, itemKey, qty = 1, ratio = 0.5) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);
  const item = SHOP_ITEMS.find((i) => i.key === itemKey);
  if (!item) return { ok: false, err: "invalid item" };
  if (qty < 1) return { ok: false, err: "invalid quantity" };

  const owned = u.inventory[item.key] || 0;
  if (owned < qty) return { ok: false, err: "not enough items" };

  const payout = Math.floor(item.price * ratio) * qty;
  u.inventory[item.key] = owned - qty;
  if (u.inventory[item.key] <= 0) delete u.inventory[item.key];
  u.bits += payout;
  save(db);
  return {
    ok: true,
    item,
    qty,
    payout,
    balance: u.bits,
    inventory: u.inventory,
  };
}

function accrueBank(u, now = Date.now()) {
  const last = u.bank.lastInterestTs || 0;
  if (u.bank.balance <= 0) {
    u.bank.lastInterestTs = now;
    return;
  }
  const days = Math.floor((now - last) / DAY_MS);
  if (days > 0) {
    const factor = Math.pow(1 + BANK_INTEREST_DAILY, days);
    u.bank.balance = Math.floor(u.bank.balance * factor);
    u.bank.lastInterestTs = last + days * DAY_MS;
  }
}

function accrueLoan(u, now = Date.now()) {
  const last = u.bank.loan.lastAccrueTs || 0;
  if (u.bank.loan.balance <= 0) {
    u.bank.loan.lastAccrueTs = now;
    return;
  }
  const days = Math.floor((now - last) / DAY_MS);
  if (days > 0) {
    const factor = Math.pow(1 + LOAN_INTEREST_DAILY, days);
    u.bank.loan.balance = Math.floor(u.bank.loan.balance * factor);
    u.bank.loan.lastAccrueTs = last + days * DAY_MS;
  }
}

function getBank(jid) {
  jid = normalizeId(jid);
  if (!jid) return null;
  const db = load();
  const u = getUser(db, jid);
  const now = Date.now();
  accrueBank(u, now);
  accrueLoan(u, now);
  save(db);
  return {
    balance: u.bank.balance,
    loan: u.bank.loan.balance,
    rateDaily: BANK_INTEREST_DAILY,
    loanRateDaily: LOAN_INTEREST_DAILY,
  };
}

function deposit(jid, amount) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };
  amount = Math.floor(Number(amount));
  if (!(amount > 0)) return { ok: false, err: "invalid amount" };
  const db = load();
  const u = getUser(db, jid);
  accrueBank(u);
  if (u.bits < amount) return { ok: false, err: "insufficient funds" };
  u.bits -= amount;
  u.bank.balance += amount;
  save(db);
  return { ok: true, amount, balance: u.bits, bank: u.bank.balance };
}

function withdraw(jid, amount) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };
  amount = Math.floor(Number(amount));
  if (!(amount > 0)) return { ok: false, err: "invalid amount" };
  const db = load();
  const u = getUser(db, jid);
  accrueBank(u);
  if (u.bank.balance < amount)
    return { ok: false, err: "insufficient bank funds" };
  u.bank.balance -= amount;
  u.bits += amount;
  save(db);
  return { ok: true, amount, balance: u.bits, bank: u.bank.balance };
}

function loanRequest(jid, amount) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };
  amount = Math.floor(Number(amount));
  if (!(amount > 0)) return { ok: false, err: "invalid amount" };
  const db = load();
  const u = getUser(db, jid);
  accrueLoan(u);
  const maxLoan = u.level * 2000;
  const available = Math.max(0, maxLoan - u.bank.loan.balance);
  if (amount > available)
    return { ok: false, err: `max available loan is ${available}` };
  u.bank.loan.balance += amount;
  u.bits += amount;
  save(db);
  return { ok: true, amount, loan: u.bank.loan.balance, balance: u.bits };
}

function repayLoan(jid, amount) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };
  amount = Math.floor(Number(amount));
  if (!(amount > 0)) return { ok: false, err: "invalid amount" };
  const db = load();
  const u = getUser(db, jid);
  accrueLoan(u);
  const pay = Math.min(amount, u.bits, u.bank.loan.balance);
  if (pay <= 0) return { ok: false, err: "nothing to repay" };
  u.bits -= pay;
  u.bank.loan.balance -= pay;
  save(db);
  return { ok: true, paid: pay, loan: u.bank.loan.balance, balance: u.bits };
}

const DATA_DIR = path.join(process.cwd(), "data");
const ECON_PATH = path.join(DATA_DIR, "economy.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ECON_PATH))
  fs.writeFileSync(ECON_PATH, JSON.stringify({ users: {} }, null, 2));

const CURRENCY_NAME = "ApeBits";
const CURRENCY_EMOJI = "🍌";
const DAY_MS = 24 * 60 * 60 * 1000;
const BANK_INTEREST_DAILY = 0.001;
const LOAN_INTEREST_DAILY = 0.0025;

const JOBS = [
  { key: "dj", name: "DJ", min: 45, max: 120 },
  { key: "barista", name: "Barista", min: 30, max: 90 },
  { key: "dev", name: "Bug-Fixing Dev", min: 60, max: 150 },
  { key: "meme", name: "Meme Curator", min: 25, max: 80 },
  { key: "guard", name: "Night Guard", min: 40, max: 110 },
  { key: "magician", name: "Street Magician", min: 20, max: 70 },
  { key: "courier", name: "Bike Courier", min: 35, max: 95 },
  { key: "walker", name: "Dog Walker", min: 20, max: 60 },
  { key: "streamer", name: "Streamer", min: 10, max: 140 },
  // New jobs
  { key: "chef", name: "Chef", min: 50, max: 130 },
  { key: "pilot", name: "Pilot", min: 120, max: 300 },
  { key: "teacher", name: "Teacher", min: 40, max: 100 },
  { key: "doctor", name: "Doctor", min: 150, max: 400 },
  { key: "artist", name: "Street Artist", min: 30, max: 90 },
  { key: "youtuber", name: "YouTuber", min: 20, max: 200 },
  { key: "miner", name: "Gold Miner", min: 60, max: 180 },
  { key: "farmer", name: "Banana Farmer", min: 25, max: 85 },
  { key: "clown", name: "Circus Clown", min: 15, max: 70 },
  { key: "detective", name: "Detective", min: 80, max: 220 },
  { key: "hacker", name: "Hacker", min: 100, max: 250 },
  { key: "astronaut", name: "Astronaut", min: 200, max: 500 },
  { key: "zookeeper", name: "Zookeeper", min: 35, max: 100 },
  { key: "fisher", name: "Fisherman", min: 20, max: 75 },
  { key: "firefighter", name: "Firefighter", min: 60, max: 160 },
  { key: "nurse", name: "Nurse", min: 60, max: 120 },
  { key: "engineer", name: "Engineer", min: 80, max: 200 },
  { key: "gamer", name: "Pro Gamer", min: 30, max: 150 },
  { key: "singer", name: "Singer", min: 25, max: 120 },
  { key: "waiter", name: "Waiter", min: 15, max: 60 },
  { key: "driver", name: "Taxi Driver", min: 20, max: 80 },
  { key: "gardener", name: "Gardener", min: 20, max: 70 },
  { key: "scientist", name: "Scientist", min: 100, max: 300 },
  { key: "programmer", name: "Programmer", min: 80, max: 220 },
  { key: "baker", name: "Baker", min: 25, max: 90 },
  { key: "photographer", name: "Photographer", min: 30, max: 110 },
  { key: "mechanic", name: "Mechanic", min: 40, max: 120 },
  { key: "tailor", name: "Tailor", min: 20, max: 70 },
  { key: "blacksmith", name: "Blacksmith", min: 50, max: 150 },
  { key: "dancer", name: "Dancer", min: 20, max: 100 },
  { key: "vlogger", name: "Vlogger", min: 20, max: 120 },
  { key: "influencer", name: "Influencer", min: 30, max: 180 },
  { key: "pilot", name: "Drone Pilot", min: 40, max: 130 },
  { key: "chef", name: "Sushi Chef", min: 60, max: 160 },
];

const CLAIMS = [
  {
    key: "daily",
    name: "Daily",
    cooldownMs: 24 * 60 * 60 * 1000,
    base: 120,
    levelReq: 1,
  },
  {
    key: "weekly",
    name: "Weekly",
    cooldownMs: 7 * 24 * 60 * 60 * 1000,
    base: 900,
    levelReq: 5,
  },
  {
    key: "monthly",
    name: "Monthly",
    cooldownMs: 30 * 24 * 60 * 60 * 1000,
    base: 3800,
    levelReq: 10,
  },
  {
    key: "yearly",
    name: "Yearly",
    cooldownMs: 365 * 24 * 60 * 60 * 1000,
    base: 60000,
    levelReq: 20,
  },
];

const TITLES = [
  { level: 1, title: "fresh banana" },
  { level: 2, title: "banana peeler" },
  { level: 3, title: "tree climber" },
  { level: 4, title: "jungle rookie" },
  { level: 5, title: "bronze ape" },
  { level: 7, title: "silverback" },
  { level: 10, title: "silver ape" },
  { level: 12, title: "ape king" },
  { level: 15, title: "golden gorilla" },
  { level: 18, title: "platinum orangutan" },
  { level: 20, title: "diamond chimp" },
  { level: 22, title: "banana merchant" },
  { level: 25, title: "emerald baboon" },
  { level: 28, title: "banana tycoon" },
  { level: 30, title: "primal legend" },
  { level: 33, title: "cosmic ape" },
  { level: 36, title: "galactic gorilla" },
  { level: 40, title: "banana oracle" },
  { level: 45, title: "stellar simian" },
  { level: 50, title: "banana god" },
  { level: 55, title: "universal ape" },
  { level: 60, title: "banana emperor" },
  { level: 65, title: "infinite orangutan" },
  { level: 70, title: "banana overlord" },
  { level: 75, title: "ape of ages" },
  { level: 80, title: "banana immortal" },
  { level: 85, title: "timeless gorilla" },
  { level: 90, title: "banana avatar" },
  { level: 95, title: "eternal chimp" },
  { level: 100, title: "primal deity" },
];

const LEVEL_REWARDS = [
  { level: 2, bits: 100 },
  { level: 3, bits: 250, title: "tree climber" },
  { level: 4, bits: 400 },
  { level: 5, bits: 600, title: "bronze ape" },
  { level: 6, bits: 800 },
  { level: 7, bits: 900, title: "silverback" },
  { level: 8, bits: 1100 },
  { level: 9, bits: 1300 },
  { level: 10, bits: 2000, title: "silver ape" },
  { level: 11, bits: 2200 },
  { level: 12, bits: 3000, title: "ape king" },
  { level: 13, bits: 3500 },
  { level: 14, bits: 4000 },
  { level: 15, bits: 5000, title: "golden gorilla" },
  { level: 16, bits: 5500 },
  { level: 17, bits: 6000 },
  { level: 18, bits: 7000, title: "platinum orangutan" },
  { level: 19, bits: 9000 },
  { level: 20, bits: 12000, title: "diamond chimp" },
  { level: 22, bits: 14000, title: "banana merchant" },
  { level: 25, bits: 20000, title: "emerald baboon" },
  { level: 28, bits: 25000, title: "banana tycoon" },
  { level: 30, bits: 35000, title: "primal legend" },
  { level: 33, bits: 40000, title: "cosmic ape" },
  { level: 36, bits: 50000, title: "galactic gorilla" },
  { level: 40, bits: 60000, title: "banana oracle" },
  { level: 45, bits: 70000, title: "stellar simian" },
  { level: 50, bits: 150000, title: "banana god" },
  { level: 55, bits: 200000, title: "universal ape" },
  { level: 60, bits: 250000, title: "banana emperor" },
  { level: 65, bits: 300000, title: "infinite orangutan" },
  { level: 70, bits: 350000, title: "banana overlord" },
  { level: 75, bits: 400000, title: "ape of ages" },
  { level: 80, bits: 500000, title: "banana immortal" },
  { level: 85, bits: 600000, title: "timeless gorilla" },
  { level: 90, bits: 700000, title: "banana avatar" },
  { level: 95, bits: 800000, title: "eternal chimp" },
  { level: 100, bits: 1000000, title: "primal deity" },
];

const xpNeededFor = (level) => 100 + (level - 1) * 75;

function load() {
  try {
    return JSON.parse(fs.readFileSync(ECON_PATH, "utf8"));
  } catch {
    return { users: {} };
  }
}
function save(db) {
  fs.writeFileSync(ECON_PATH, JSON.stringify(db, null, 2));
}

function getUser(db, jid) {
  jid = normalizeId(jid);
  if (!jid) return null;

  if (!db.users[jid]) {
    db.users[jid] = {
      bits: 0,
      xp: 0,
      level: 1,
      title: TITLES[0].title,
      lastClaims: {},
      jobCooldown: 0,
      unlockedRewards: {},
      stats: { commands: 0, jobs: 0 },
      inventory: {},
      bank: {
        balance: 0,
        lastInterestTs: 0,
        loan: {
          balance: 0,
          lastAccrueTs: 0,
        },
      },
    };
  }
  return db.users[jid];
}

const SHOP_ITEMS = [
  { key: "toothpaste", name: "Toothpaste", price: 25 },
  { key: "soap", name: "Soap", price: 30 },
  { key: "bread", name: "Bread", price: 15 },
  { key: "soda", name: "Soda", price: 20 },
  { key: "phone", name: "Phone", price: 2000 },
  { key: "banana", name: "Banana", price: 10 },
  { key: "energy", name: "Energy Drink", price: 50 },
  { key: "laptop", name: "Laptop", price: 2500 },
  { key: "camera", name: "Camera", price: 1200 },
  { key: "ticket", name: "Lottery Ticket", price: 100 },
  { key: "hat", name: "Cool Hat", price: 80 },
  { key: "watch", name: "Wrist Watch", price: 300 },
  { key: "ring", name: "Gold Ring", price: 500 },
  { key: "car", name: "Car", price: 10000 },
  { key: "bike", name: "Bike", price: 800 },
  { key: "book", name: "Book", price: 60 },
  { key: "backpack", name: "Backpack", price: 150 },
  { key: "umbrella", name: "Umbrella", price: 40 },
  { key: "shoes", name: "Running Shoes", price: 120 },
  { key: "ticket_vip", name: "VIP Ticket", price: 5000 },
  { key: "tablet", name: "Tablet", price: 1800 },
  { key: "headphones", name: "Headphones", price: 400 },
  { key: "pet", name: "Pet Monkey", price: 25000 },
  { key: "banana_suit", name: "Banana Suit", price: 3000 },
  { key: "diamond", name: "Diamond", price: 100000 },
];

function getShop() {
  return SHOP_ITEMS.map((i) => ({ ...i }));
}

function buyItem(jid, itemKey, qty = 1) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);
  const item = SHOP_ITEMS.find((i) => i.key === itemKey);
  if (!item) return { ok: false, err: "invalid item" };
  if (qty < 1) return { ok: false, err: "invalid quantity" };

  const total = item.price * qty;
  if (u.bits < total) return { ok: false, err: "not enough bits" };

  u.bits -= total;
  u.inventory[item.key] = (u.inventory[item.key] || 0) + qty;
  save(db);

  return { ok: true, item, qty, balance: u.bits, inventory: u.inventory };
}

function getInventory(jid) {
  jid = normalizeId(jid);
  if (!jid) return null;
  const db = load();
  const u = getUser(db, jid);
  return { ...u.inventory };
}

function tradeItem(fromJid, toJid, itemKey, qty = 1) {
  fromJid = normalizeId(fromJid);
  toJid = normalizeId(toJid);
  if (!fromJid || !toJid) return { ok: false, err: "invalid users" };

  const db = load();
  const from = getUser(db, fromJid);
  const to = getUser(db, toJid);

  if (!from.inventory[itemKey] || from.inventory[itemKey] < qty) {
    return { ok: false, err: "not enough items" };
  }

  from.inventory[itemKey] -= qty;
  if (from.inventory[itemKey] <= 0) delete from.inventory[itemKey];
  to.inventory[itemKey] = (to.inventory[itemKey] || 0) + qty;

  save(db);
  return {
    ok: true,
    itemKey,
    qty,
    fromInv: from.inventory,
    toInv: to.inventory,
  };
}

function consumeItem(jid, itemKey, qty = 1) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);

  if (!u.inventory[itemKey] || u.inventory[itemKey] < qty) {
    return { ok: false, err: "not enough items" };
  }

  u.inventory[itemKey] -= qty;
  if (u.inventory[itemKey] <= 0) delete u.inventory[itemKey];
  save(db);

  return { ok: true, itemKey, qty, inventory: u.inventory };
}

function addBits(jid, amount) {
  jid = normalizeId(jid);
  if (!jid) return 0;

  const db = load();
  const u = getUser(db, jid);
  if (!u) return 0;

  u.bits = Math.max(0, Math.floor(u.bits + amount));
  save(db);
  return u.bits;
}

function addXpForCommand(jid, base = 8) {
  jid = normalizeId(jid);
  if (!jid) return { level: 0, xp: 0, gain: 0, leveledUp: false, rewards: [] };

  const db = load();
  const u = getUser(db, jid);
  const gain = Math.max(1, base + Math.floor(Math.random() * 5));
  u.xp += gain;
  u.stats.commands += 1;

  let leveledUp = false;
  let rewards = [];
  while (u.xp >= xpNeededFor(u.level)) {
    u.xp -= xpNeededFor(u.level);
    u.level += 1;
    leveledUp = true;

    const reward = LEVEL_REWARDS.find((r) => r.level === u.level);
    if (reward && !u.unlockedRewards[String(reward.level)]) {
      if (reward.bits) u.bits += reward.bits;
      if (reward.title) u.title = reward.title;
      u.unlockedRewards[String(reward.level)] = true;
      rewards.push(reward);
    }

    const title = [...TITLES].reverse().find((t) => u.level >= t.level);
    if (title) u.title = title.title;
  }

  save(db);
  return {
    level: u.level,
    xp: u.xp,
    gain,
    leveledUp,
    rewards,
    bits: u.bits,
    title: u.title,
  };
}

function beg(jid, cooldownMs = 5 * 60 * 1000) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);

  const now = Date.now();
  const last = u.lastClaims?.beg || 0;
  const left = Math.max(0, last + cooldownMs - now);
  if (left > 0) return { ok: false, cooldownMsLeft: left };

  const payout = Math.floor(5 + Math.random() * 200);
  u.bits += payout;
  u.lastClaims.beg = now;
  save(db);

  return { ok: true, payout, balance: u.bits };
}

function getProfile(jid) {
  jid = normalizeId(jid);
  if (!jid) return null;

  const db = load();
  const u = getUser(db, jid);
  save(db);
  return { ...u };
}

function getJobs() {
  return JOBS.map((j) => ({ ...j }));
}

function canWork(jid, cooldownMs = 10 * 60 * 1000) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, msLeft: cooldownMs };

  const db = load();
  const u = getUser(db, jid);
  const now = Date.now();
  const left = Math.max(0, u.jobCooldown + cooldownMs - now);
  return { ok: left === 0, msLeft: left };
}

function crime(jid, cooldownMs = 10 * 60 * 1000) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);

  const now = Date.now();
  const last = u.lastClaims?.crime || 0;
  const left = Math.max(0, last + cooldownMs - now);
  if (left > 0) return { ok: false, cooldownMsLeft: left };

  const success = Math.random() < 0.5;

  let payout = 0;
  let busted = false;

  if (success) {
    payout = Math.floor(50 + Math.random() * 500);
    u.bits += payout;
  } else {
    payout = Math.min(u.bits, Math.floor(20 + Math.random() * 600));
    u.bits -= payout;
    busted = true;
  }

  u.lastClaims.crime = now;
  save(db);

  return { ok: true, payout, balance: u.bits, busted };
}

function lottery(jid, cost = 100, cooldownMs = 60 * 60 * 1000) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);

  if (!db.lottery) {
    db.lottery = {
      tickets: {},
      jackpot: 0,
      lastDraw: 0,
    };
  }

  const now = Date.now();
  const { tickets, jackpot, lastDraw } = db.lottery;

  if (now - lastDraw >= cooldownMs && Object.keys(tickets).length > 0) {
    const participants = Object.keys(tickets);
    const winner =
      participants[Math.floor(Math.random() * participants.length)];
    const prize = jackpot;

    const w = getUser(db, winner);
    w.bits += prize;

    db.lottery = { tickets: {}, jackpot: 0, lastDraw: now };
    save(db);

    return {
      ok: true,
      winner,
      jackpot: prize,
      balance: w.bits,
      cost: 0,
    };
  }

  if (tickets[jid]) {
    const left = cooldownMs - (now - lastDraw);
    return { ok: false, err: "ticket already bought", cooldownMsLeft: left };
  }

  if (u.bits < cost) {
    return { ok: false, err: "insufficient funds" };
  }

  u.bits -= cost;
  db.lottery.tickets[jid] = true;
  db.lottery.jackpot += cost;
  save(db);

  return {
    ok: true,
    winner: null,
    jackpot: db.lottery.jackpot,
    cost,
  };
}

function jackpot(jid, bet, cooldownMs = 30 * 60 * 1000) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);

  if (!db.jackpot) {
    db.jackpot = {
      entries: {},
      pot: 0,
      lastDraw: 0,
    };
  }

  const now = Date.now();
  const { entries, pot, lastDraw } = db.jackpot;

  if (now - lastDraw >= cooldownMs && Object.keys(entries).length > 0) {
    const tickets = [];
    for (const [user, wager] of Object.entries(entries)) {
      for (let i = 0; i < wager; i++) tickets.push(user);
    }
    const winner = tickets[Math.floor(Math.random() * tickets.length)];
    const prize = pot;

    const w = getUser(db, winner);
    w.bits += prize;

    db.jackpot = { entries: {}, pot: 0, lastDraw: now };
    save(db);

    return {
      ok: true,
      winner,
      pot: prize,
      balance: w.bits,
    };
  }

  if (u.bits < bet) {
    return { ok: false, err: "insufficient funds" };
  }

  u.bits -= bet;
  db.jackpot.entries[jid] = (db.jackpot.entries[jid] || 0) + bet;
  db.jackpot.pot += bet;
  save(db);

  return {
    ok: true,
    winner: null,
    pot: db.jackpot.pot,
    balance: u.bits,
  };
}

function work(jid, jobKey) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);
  const job = jobKey
    ? JOBS.find((j) => j.key === jobKey.toLowerCase())
    : JOBS[Math.floor(Math.random() * JOBS.length)];

  if (!job) return { ok: false, err: "invalid job" };

  const { ok, msLeft } = canWork(jid);
  if (!ok) return { ok: false, cooldownMsLeft: msLeft };

  const base = job.min + Math.floor(Math.random() * (job.max - job.min + 1));
  const bonus = Math.floor(base * Math.min(0.5, (u.level - 1) * 0.03));
  const payout = base + bonus;

  u.bits += payout;
  u.stats.jobs += 1;
  u.jobCooldown = Date.now();
  save(db);

  return { ok: true, job, payout, balance: u.bits, bonus };
}

function claim(jid, claimKey) {
  jid = normalizeId(jid);
  if (!jid) return { ok: false, err: "invalid user" };

  const db = load();
  const u = getUser(db, jid);
  const def = CLAIMS.find((c) => c.key === claimKey);
  if (!def) return { ok: false, err: "invalid claim type" };
  if (u.level < def.levelReq)
    return { ok: false, err: `requires level ${def.levelReq}` };

  const now = Date.now();
  const last = u.lastClaims[def.key] || 0;
  const left = Math.max(0, last + def.cooldownMs - now);
  if (left > 0) return { ok: false, cooldownMsLeft: left };

  const mult = 1 + Math.min(1.0, (u.level - 1) * 0.04);
  const reward = Math.floor(def.base * mult);

  u.bits += reward;
  u.lastClaims[def.key] = now;
  save(db);

  return { ok: true, def, reward, balance: u.bits };
}

function getClaims() {
  return CLAIMS.map((c) => ({ ...c }));
}

function fmtMs(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

module.exports = {
  CURRENCY_NAME,
  CURRENCY_EMOJI,
  xpNeededFor,
  addXpForCommand,
  getProfile,
  addBits,
  getJobs,
  work,
  canWork,
  getClaims,
  claim,
  fmtMs,
  getShop,
  buyItem,
  getInventory,
  tradeItem,
  sellItem,
  beg,
  crime,
  lottery,
  jackpot,
  getBank,
  deposit,
  withdraw,
  loanRequest,
  repayLoan,
};
