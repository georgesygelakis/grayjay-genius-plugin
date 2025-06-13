// Grayjay Plugin for Genius Lyrics
// Don't declare 'source' - it's already provided by Grayjay

function enable(conf, settings, savedState) {
  console.log("Genius Lyrics Plugin enabled")
}

function getHome() {
  return new ContentPager([], false)
}

function searchSuggestions(query) {
  return []
}

function getSearchCapabilities() {
  return {
    types: [Type.Streams.Mixed],
    sorts: [Type.Order.Chronological],
    filters: [],
  }
}

function search(query, type, order, filters) {
  console.log("Searching for: " + query)
  try {
    const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`

    const response = http.GET(searchUrl, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    if (!response.isOk) {
      console.log("Search failed with status: " + response.code)
      return new SearchPager([], false)
    }

    const data = JSON.parse(response.body)
    const results = []

    if (data.response && data.response.sections) {
      for (const section of data.response.sections) {
        if (section.type === "song" && section.hits) {
          for (const hit of section.hits) {
            const song = hit.result
            if (song && song.url) {
              results.push(
                new PlatformContent({
                  contentType: Type.Content.Media,
                  name: song.full_title || song.title,
                  thumbnails: song.song_art_image_url ? [new Thumbnail(song.song_art_image_url, 300)] : [],
                  author: new PlatformAuthorLink(
                    song.primary_artist ? song.primary_artist.id : 0,
                    song.primary_artist ? song.primary_artist.name : "Unknown",
                    song.primary_artist ? song.primary_artist.url : "",
                    song.primary_artist && song.primary_artist.image_url ? song.primary_artist.image_url : "",
                  ),
                  datetime: 0,
                  url: song.url,
                  isLive: false,
                }),
              )
            }
          }
        }
      }
    }

    return new SearchPager(results, false)
  } catch (ex) {
    console.log("Error searching lyrics: " + ex.message)
    return new SearchPager([], false)
  }
}

function isContentDetailsUrl(url) {
  return url.includes("genius.com")
}

function getContentDetails(url) {
  console.log("Getting content details for: " + url)
  try {
    const response = http.GET(url, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    if (!response.isOk) {
      throw new ScriptException("Failed to fetch lyrics page")
    }

    const html = response.body

    // Extract lyrics from the HTML
    const lyricsMatch = html.match(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/)
    let lyrics = "Lyrics not found"

    if (lyricsMatch) {
      lyrics = lyricsMatch[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim()
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1].replace(" Lyrics | Genius", "") : "Unknown Song"

    return new PlatformContentDetails({
      contentType: Type.Content.Media,
      name: title,
      thumbnails: [],
      author: new PlatformAuthorLink(0, "Genius", "https://genius.com", ""),
      datetime: 0,
      url: url,
      isLive: false,
      description: lyrics,
      rating: new RatingLikes(0),
      textType: Type.Text.Plain,
    })
  } catch (ex) {
    console.log("Error getting content details: " + ex.message)
    throw new ScriptException("Failed to get lyrics: " + ex.message)
  }
}

function getComments(url) {
  return new CommentPager([], false, "")
}

console.log("Genius Lyrics Plugin loaded")
