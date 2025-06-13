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

// Main function to get lyrics for current playing song
function getLyrics(songTitle, artistName) {
  try {
    const query = `${songTitle} ${artistName}`
    console.log("Getting lyrics for: " + query)

    const searchUrl = `https://genius.com/api/search/multi?per_page=1&q=${encodeURIComponent(query)}`
    const response = http.GET(searchUrl, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    if (!response.isOk) {
      return { error: "Failed to search for lyrics" }
    }

    const data = JSON.parse(response.body)

    if (data.response && data.response.sections) {
      for (const section of data.response.sections) {
        if (section.type === "song" && section.hits && section.hits.length > 0) {
          const song = section.hits[0].result
          if (song && song.url) {
            return getLyricsFromUrl(song.url)
          }
        }
      }
    }

    return { error: "No lyrics found" }
  } catch (ex) {
    return { error: "Error fetching lyrics: " + ex.message }
  }
}

function getLyricsFromUrl(url) {
  try {
    const response = http.GET(url, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    if (!response.isOk) {
      return { error: "Failed to fetch lyrics page" }
    }

    const html = response.body
    const lyricsMatch = html.match(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/)

    if (lyricsMatch) {
      const lyrics = lyricsMatch[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim()

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/)
      const title = titleMatch ? titleMatch[1].replace(" Lyrics | Genius", "") : "Unknown Song"

      return {
        title: title,
        lyrics: lyrics,
        url: url,
      }
    }

    return { error: "Lyrics not found on page" }
  } catch (ex) {
    return { error: "Error parsing lyrics: " + ex.message }
  }
}

function search(query, type, order, filters) {
  try {
    const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`
    const response = http.GET(searchUrl, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    if (!response.isOk) {
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
    return new SearchPager([], false)
  }
}

function isContentDetailsUrl(url) {
  return url.includes("genius.com")
}

function getContentDetails(url) {
  const result = getLyricsFromUrl(url)

  if (result.error) {
    throw new ScriptException(result.error)
  }

  return new PlatformContentDetails({
    contentType: Type.Content.Media,
    name: result.title,
    thumbnails: [],
    author: new PlatformAuthorLink(0, "Genius", "https://genius.com", ""),
    datetime: 0,
    url: url,
    isLive: false,
    description: result.lyrics,
    rating: new RatingLikes(0),
    textType: Type.Text.Plain,
  })
}

function getComments(url) {
  return new CommentPager([], false, "")
}

// Action handler for media player integration
function handleAction(action, context) {
  if (action === "getLyrics" && context.currentTrack) {
    return getLyrics(context.currentTrack.title, context.currentTrack.artist)
  }
  return { error: "Unsupported action or missing context" }
}

const ContentPager = {}
const Type = {}
const http = {}
const SearchPager = {}
const PlatformContent = {}
const Thumbnail = {}
const PlatformAuthorLink = {}
const PlatformContentDetails = {}
const RatingLikes = {}
const CommentPager = {}
const ScriptException = {}
