const API_KEY = "AIzaSyAbrA75Zr5hrPGcRHko63K-mQyCut3O8CM";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const videoListItems = document.querySelector(".video-list__items");

const fetchTrendingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);

    url.searchParams.append("part", "contentDetails,id,snippet");
    url.searchParams.append("chart", "mostPopular");
    url.searchParams.append("regionCode", "RU");
    url.searchParams.append("maxResults", "12");
    url.searchParams.append("key", API_KEY);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("error: ", error);
  }
};

const dislayVideo = (videos) => {

  videoListItems.textContent = "";

  const listVideos = videos.items.map((video) => {
    const li = document.createElement("li");
    li.classList.add("video-list__item");
    console.log('video: ', video);

    li.innerHTML = `
      <article class="video-card">
        <a class="video-card__link" href="/video.html?id=${video.id}">
          <img
            class="video-card__thumbnail"
            src="${video.snippet.thumbnails.standard?.url || video.snippet.thumbnails.high?.url}"
            alt="Превью видео ${video.snippet.title}"
          />

          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          <p class="video-card__duration">${video.contentDetails.duration}</p>
        </a>
        <button
          class="video-card__favourite "
          type="button"
          aria-label="Добавить в избранное, ${video.snippet.title}"
        >
          <svg class="video-card__icon">
            <use class="star-o" xlink:href="./img/sprite.svg#star-ob"></use>
            <use class="star" xlink:href="./img/sprite.svg#star"></use>
          </svg>
        </button>
      </article>
    `;

    return li;
  });

  videoListItems.append(...listVideos)
};

fetchTrendingVideos().then(dislayVideo);
