module.exports = {
  name: "songrecommendation",
  category: "tools",
  run: async (ctx) => {
    const songs = [
      { title: "Blinding Lights", artist: "The Weeknd" },
      { title: "Bad Guy", artist: "Billie Eilish" },
      { title: "Shape of You", artist: "Ed Sheeran" },
      { title: "Levitating", artist: "Dua Lipa" },
      { title: "Numb", artist: "Linkin Park" },
      { title: "Smells Like Teen Spirit", artist: "Nirvana" },
    ];
    const pick = songs[Math.floor(Math.random() * songs.length)];

    await ctx.reply(
      `🎵 you should check out: **${pick.title}** by *${pick.artist}*`
    );
  },
};
