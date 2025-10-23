const os = require("os");
const process = require("process");

module.exports = {
  name: "system",
  category: "info",
  run: async (ctx) => {
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const cpuSpeed = cpus[0]?.speed ? `${cpus[0].speed} MHz` : "Unknown";
    const cpuCores = cpus.length;

    const load = os.loadavg().map((n) => n.toFixed(2));
    const usage = process.cpuUsage();
    const cpuUsageMs = ((usage.user + usage.system) / 1000).toFixed(2);

    const toGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const info = {
      "Operating System": `${os.type()} ${os.release()} (${os.platform()})`,
      "Kernel Version": os.version?.() || "N/A",
      Architecture: os.arch(),
      Hostname: os.hostname(),
      Uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor(
        (os.uptime() % 3600) / 60
      )}m`,
      User: os.userInfo().username,
      "Home Directory": os.homedir(),
      "Temp Directory": os.tmpdir(),

      "CPU Model": cpuModel,
      "CPU Speed": cpuSpeed,
      "CPU Cores": cpuCores,
      "Load Average (1m, 5m, 15m)": load.join(", "),
      "Bot CPU Time": `${cpuUsageMs} ms`,

      "Total Memory": `${toGB(totalMem)} GB`,
      "Free Memory": `${toGB(freeMem)} GB`,
      "Used Memory": `${toGB(totalMem - freeMem)} GB`,

      "Node.js Version": process.version,
      "V8 Version": process.versions.v8,
      "OpenSSL Version": process.versions.openssl,
      "OS Release": os.release(),
    };

    let output = `> System Information\n` + `> ==================\n`;

    for (const [key, value] of Object.entries(info)) {
      output += `> ${key}: ${value}\n`;
    }

    await ctx.reply(output.trim());
  },
};
