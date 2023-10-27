const API_KEY = "AIzaSyAbrA75Zr5hrPGcRHko63K-mQyCut3O8CM";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const favouriteIds = JSON.parse(localStorage.getItem("favouriteYT") || "[]");
console.log("favouriteIds: ", favouriteIds);

const videoListItems = document.querySelector(".video-list__items");
// изменение формата вывода времени видеоролика
const convertISOToReadbleDuration = (isoDuration) => {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secundsMatch = isoDuration.match(/(\d+)S/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const secunds = secundsMatch ? parseInt(secundsMatch[1]) : 0;

  let result = "";

  if (hours > 0) {
    result += `${hours} ч. `;
  }
  if (minutes > 0) {
    result += `${minutes} мин. `;
  }
  if (secunds > 0) {
    result += `${secunds} сек.`;
  }

  return result.trim();
};

const formatDate = (isoString) => {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return formatter.format(date);
};

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

const fetchFavouriteVideos = async () => {
  try {
    if (favouriteIds.lenght === 0) {
      return { items: [] };
    }
    const url = new URL(VIDEOS_URL);

    url.searchParams.append("part", "contentDetails,id,snippet");
    url.searchParams.append("maxResults", "12");
    url.searchParams.append("id", favouriteIds.join(","));
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

const fetchVideoData = async (id) => {
  try {
    const url = new URL(VIDEOS_URL);

    url.searchParams.append("part", "snippet,statistics");
    url.searchParams.append("id", id);
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

const displayListVideo = (videos) => {
  videoListItems.textContent = "";

  const listVideos = videos.items.map((video) => {
    const li = document.createElement("li");
    li.classList.add("video-list__item");
    // console.log("video: ", video);

    li.innerHTML = `
      <article class="video-card">
        <a class="video-card__link" href="/video.html?id=${video.id}">
          <img
            class="video-card__thumbnail"
            src="${
              video.snippet.thumbnails.standard?.url ||
              video.snippet.thumbnails.high?.url
            }"
            alt="Превью видео ${video.snippet.title}"
          />

          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          <p class="video-card__duration">${convertISOToReadbleDuration(
            video.contentDetails.duration
          )}</p>
        </a>
        <button
          class="video-card__favourite favourite 
          ${favouriteIds.includes(video.id) ? "active" : ""} "
          type="button"
          aria-label="Добавить в избранное, ${video.snippet.title}"
          data-video-id="${video.id}"
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

  videoListItems.append(...listVideos);
};

const displayVideo = ({ items: [video] }) => {
  const videoElem = document.querySelector(".video");

  videoElem.innerHTML = `
    <div class="container">
      <div class="video__player">
        <iframe
          class="video__iframe"              
          src="https://www.youtube.com/embed/${video.id}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>

      <div class="video__container">
        <div class="video__content">
          <h2 class="video__title">${video.snippet.title}</h2>

          <p class="video__channel">${video.snippet.channelTitle}</p>
          
          <p class="video__info">
            <span class="video__views">${parseInt(
              video.statistics.viewCount
            ).toLocaleString()} просмотр </span>
            <span class="video__date">Дата премьеры: ${formatDate(
              video.snippet.publishedAt
            )}</span>
          </p>

          <p class="video__description">
            ${video.snippet.description}
          </p>
        </div>

        <button class="video__link favourite
          ${favouriteIds.includes(video.id) ? "active" : ""}" 
          href="/favourite.html">
          <span class="video__no-favourite">Избранное</span>
          <span class="video__favourite">В избранном</span>
          <svg class="video__icon">
            <use xlink:href="./img/sprite.svg#star-ob"></use>
          </svg>
        </button>
      </div>

      <button class="video__favourite" type="button"></button>
    </div>
  `;
};

const init = () => {
  const currentPage = location.pathname.split("/").pop();
  // console.log('currentPage: ', currentPage);

  const urlSearchParams = new URLSearchParams(location.search);
  const videoId = urlSearchParams.get("id");
  const searchQuery = urlSearchParams.get("q");

  if (currentPage === "index.html" || currentPage === "") {
    fetchTrendingVideos().then(displayListVideo);
  } else if (currentPage === "video.html" && videoId) {
    // console.log(videoId);
    fetchVideoData(videoId).then(displayVideo);
  } else if (currentPage === "favourite.html") {
    fetchFavouriteVideos().then(displayListVideo);
  } else if (currentPage === "search.html" && searchQuery) {
    console.log(currentPage);
  }

  document.body.addEventListener("click", ({ target }) => {
    const itemFavorit = target.closest(".favourite");

    if (itemFavorit) {
      const videoId = itemFavorit.dataset.videoId;

      if (favouriteIds.includes(videoId)) {
        favouriteIds.splice(favouriteIds.indexOf(videoId), 1);
        localStorage.setItem("favouriteYT", JSON.stringify(favouriteIds));
        itemFavorit.classList.remove("active");
      } else {
        favouriteIds.push(videoId);
        localStorage.setItem("favouriteYT", JSON.stringify(favouriteIds));
        itemFavorit.classList.add("active");
      }
    }
  });
};

init();
