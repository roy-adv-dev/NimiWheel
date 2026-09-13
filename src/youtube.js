// מודול ניתוח והטמעת סרטוני YouTube במודאל הזכייה

export class YouTubeHelper {
  /**
   * מחלץ את מזהה הסרטון (Video ID) מתוך סוגים שונים של קישורי YouTube
   */
  static extractVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
  }

  /**
   * בונה אלמנט DOM / HTML של נגן YouTube רספונסיבי במודאל
   */
  static renderEmbedContainer(urlOrId) {
    const videoId = this.extractVideoId(urlOrId);
    if (!videoId) return '';

    return `
      <div class="youtube-wrapper">
        <div class="youtube-aspect-ratio">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }
}
