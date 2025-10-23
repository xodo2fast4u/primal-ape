module.exports = {
  name: "recover",
  category: "tools",
  run: async (ctx) => {
    try {
      const { getMessage, getStore } = global.__messageStore;
      const jid =
        ctx.jid || (ctx.update && ctx.update.key && ctx.update.key.remoteJid);

      if (!jid) return ctx.reply("❌ Could not determine chat id for recover.");

      const count = parseInt((ctx.args && ctx.args[0]) || "1", 10);

      if (isNaN(count) || count <= 0) {
        return ctx.reply("❌ Usage: !recover <number>");
      }

      const store = getStore() || {};
      const messages = Object.values(store[jid] || {});
      const deleted = messages.filter(
        (m) => m && (m.deleted === true || m.message === null)
      );

      if (deleted.length === 0) {
        return ctx.reply("❌ No deleted messages found in this chat.");
      }

      const targets = deleted.slice(-count);

      for (const d of targets) {
        const original = getMessage(d.key.remoteJid, d.key.id) || d;

        const who = d.key.participant || jid;
        const ts = new Date(
          (original.messageTimestamp || Date.now() / 1000) * 1000
        ).toLocaleString();

        if (original.message && typeof original.message === "object") {
          const type = Object.keys(original.message)[0];
          try {
            switch (type) {
              case "conversation": {
                const text = original.message.conversation;
                await ctx.reply(
                  `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: ${text}`
                );
                break;
              }
              case "extendedTextMessage": {
                const text = original.message.extendedTextMessage?.text || "";
                await ctx.reply(
                  `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: ${text}`
                );
                break;
              }
              case "imageMessage": {
                const quoted = original;
                if (
                  ctx.sock &&
                  typeof ctx.sock.downloadMediaMessage === "function"
                ) {
                  const buffer = await ctx.sock.downloadMediaMessage(quoted);
                  await ctx.send({
                    image: buffer,
                    caption: original.message.imageMessage.caption || "",
                  });
                } else {
                  await ctx.reply(
                    `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: 🖼️ [Deleted Image]`
                  );
                }
                break;
              }
              case "videoMessage": {
                const quoted = original;
                if (
                  ctx.sock &&
                  typeof ctx.sock.downloadMediaMessage === "function"
                ) {
                  const buffer = await ctx.sock.downloadMediaMessage(quoted);
                  await ctx.send({
                    video: buffer,
                    caption: original.message.videoMessage.caption || "",
                  });
                } else {
                  await ctx.reply(
                    `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: 🎥 [Deleted Video]`
                  );
                }
                break;
              }
              case "audioMessage": {
                const quoted = original;
                if (
                  ctx.sock &&
                  typeof ctx.sock.downloadMediaMessage === "function"
                ) {
                  const buffer = await ctx.sock.downloadMediaMessage(quoted);
                  const ptt = !!original.message.audioMessage?.ptt;
                  await ctx.send({ audio: buffer, ptt });
                } else {
                  await ctx.reply(
                    `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: 🎵 [Deleted Audio]`
                  );
                }
                break;
              }
              case "documentMessage": {
                const quoted = original;
                if (
                  ctx.sock &&
                  typeof ctx.sock.downloadMediaMessage === "function"
                ) {
                  const buffer = await ctx.sock.downloadMediaMessage(quoted);
                  const mime =
                    original.message.documentMessage?.mimetype || undefined;
                  const fileName =
                    original.message.documentMessage?.fileName || "file";
                  await ctx.send({
                    document: buffer,
                    mimetype: mime,
                    fileName,
                  });
                } else {
                  await ctx.reply(
                    `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: 📄 [Deleted Document]`
                  );
                }
                break;
              }
              case "stickerMessage": {
                const quoted = original;
                if (
                  ctx.sock &&
                  typeof ctx.sock.downloadMediaMessage === "function"
                ) {
                  const buffer = await ctx.sock.downloadMediaMessage(quoted);
                  await ctx.send({ sticker: buffer });
                } else {
                  await ctx.reply(
                    `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: 🔖 [Deleted Sticker]`
                  );
                }
                break;
              }
              default: {
                await ctx.reply(
                  `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: [Deleted ${type}]`
                );
              }
            }
          } catch (err) {
            console.error("recover media resend error:", err?.message || err);
            await ctx.reply(
              `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: [Deleted ${type} — unable to re-send]`
            );
          }
        } else {
          await ctx.reply(
            `♻️ *Recovered Deleted Message*\n👤 From: ${who}\n🕒 At: ${ts}\n💬 Content: [Message deleted — original content not cached]`
          );
        }
      }
    } catch (err) {
      console.error("Recover error:", err?.message || err);
    }
  },
};
