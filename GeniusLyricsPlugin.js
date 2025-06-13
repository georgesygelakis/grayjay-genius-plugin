export default {
  name: "Genius Lyrics",
  version: "1.0",

  async getHome() {
    const track = await this.getCurrentActivity("spotify");
    if (!track || !track.title || !track.artists?.[0]?.name) {
      return { type: "message", message: "No Spotify track is currently playing." };
    }

    const query = `${track.title} ${track.artists[0].name}`;
    const proxyUrl = `https://grayjay-genius-plugin.georgsyge.workers.dev?q=${encodeURIComponent(query)}`;

    const res = await this.http.get(proxyUrl);
    if (!res || !res.response?.hits?.length) {
      return { type: "message", message: "Lyrics not found on Genius." };
    }

    const song = res.response.hits[0].result;
    const pageHtml = await this.http.get(song.url);
    const match = pageHtml.match(/<div[^>]*data-lyrics-container[^>]*>(.*?)<\/div>/gs);
    const html = match?.join("\n") ?? "";
    const lyrics = html.replace(/<[^>]+>/g, "").trim();

    return {
      type: "list",
      title: song.full_title,
      items: [{
        title: "Lyrics",
        description: lyrics || "Lyrics could not be extracted."
      }]
    };
  }
}
