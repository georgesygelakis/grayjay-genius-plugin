// Minimal Grayjay Plugin for Genius Lyrics
var source = {
  enable: (conf, settings, savedState) => {
    console.log("Genius Lyrics Plugin enabled")
  },

  getHome: () => new ContentPager([], false),

  searchSuggestions: (query) => [],

  getSearchCapabilities: () => ({
    types: [Type.Streams.Mixed],
    sorts: [Type.Order.Chronological],
    filters: [],
  }),

  search: (query, type, order, filters) => {
    console.log("Searching for: " + query)
    return new SearchPager([], false)
  },

  isContentDetailsUrl: (url) => url.includes("genius.com"),

  getContentDetails: (url) => {
    console.log("Getting content details for: " + url)
    return new PlatformContentDetails({
      contentType: Type.Content.Media,
      name: "Test Song",
      thumbnails: [],
      author: new PlatformAuthorLink(0, "Test Artist", "", ""),
      datetime: 0,
      url: url,
      isLive: false,
      description: "Test lyrics content",
      rating: new RatingLikes(0),
      textType: Type.Text.Plain,
    })
  },

  getComments: (url) => new CommentPager([], false, ""),
}

console.log("Genius Lyrics Plugin loaded")

// Declare the variables to fix the linting errors
var ContentPager = function (items, hasMore) {
  this.items = items
  this.hasMore = hasMore
}

var Type = {
  Streams: { Mixed: "mixed" },
  Order: { Chronological: "chronological" },
  Content: { Media: "media" },
  Text: { Plain: "plain" },
}

var SearchPager = function (items, hasMore) {
  this.items = items
  this.hasMore = hasMore
}

var PlatformContentDetails = function (details) {
  this.contentType = details.contentType
  this.name = details.name
  this.thumbnails = details.thumbnails
  this.author = details.author
  this.datetime = details.datetime
  this.url = details.url
  this.isLive = details.isLive
  this.description = details.description
  this.rating = details.rating
  this.textType = details.textType
}

var PlatformAuthorLink = function (id, name, url, avatar) {
  this.id = id
  this.name = name
  this.url = url
  this.avatar = avatar
}

var RatingLikes = function (likes) {
  this.likes = likes
}

var CommentPager = function (comments, hasMore, nextPageUrl) {
  this.comments = comments
  this.hasMore = hasMore
  this.nextPageUrl = nextPageUrl
}
