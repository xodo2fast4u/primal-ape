const fs = require("fs");
const path = require("path");

const MODE_PATH = path.join(process.cwd(), "data", "mode.json");
if (!fs.existsSync(path.dirname(MODE_PATH))) {
  fs.mkdirSync(path.dirname(MODE_PATH), { recursive: true });
}
if (!fs.existsSync(MODE_PATH)) {
  fs.writeFileSync(MODE_PATH, JSON.stringify({ mode: "public" }, null, 2));
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(MODE_PATH, "utf8"));
  } catch {
    return { mode: "public" };
  }
}

function save(m) {
  fs.writeFileSync(MODE_PATH, JSON.stringify({ mode: m }, null, 2));
}

function getMode() {
  return load().mode;
}

function setMode(m) {
  save(m);
}

module.exports = { getMode, setMode };
