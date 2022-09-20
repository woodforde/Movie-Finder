// API Key: dba29d20
// https://www.omdbapi.com/?s=[title value]&apikey=dba29d20
// https://www.omdbapi.com/?i=[imdb id]&apikey=dba29d20

// API values : Title, year, imdb id, type, poster
// API values : Poster, Title, Relased, Runtime, Genre, imdbRating

const movieListEl = document.querySelector(".movies");
const sliderOneEl = document.querySelector(".rating__slider-1");
const sliderTwoEl = document.querySelector(".rating__slider-2")
const sliderMinValueEl = document.querySelector(".rating__slider--min-value");
const sliderMaxValueEl = document.querySelector(".rating__slider--max-value");
const searchBar = document.querySelector(".search__bar");
const searchInputDisplayEl = document.querySelector(".search--input-display");

loadMovies('fast');
setSliderValue((parseFloat(sliderOneEl.value)), (parseFloat(sliderTwoEl.value)))

function openMenu() {
    document.body.classList += " menu--open";
}
function closeMenu() {
    document.body.classList.remove('menu--open');
}

sliderOneEl.addEventListener('input', () => {
    setSliderValue(parseFloat(sliderOneEl.value), parseFloat(sliderTwoEl.value));
}, false);

sliderTwoEl.addEventListener('input', () => {
    setSliderValue(parseFloat(sliderOneEl.value), parseFloat(sliderTwoEl.value));
}, false);

function setSliderValue(sliderOneValue, sliderTwoValue) {
    if (sliderOneValue < sliderTwoValue) {
        sliderMinValueEl.innerHTML = (sliderOneValue / 10).toFixed(1);
        sliderMaxValueEl.innerHTML = (sliderTwoValue / 10).toFixed(1);
    } else {
        sliderMinValueEl.innerHTML = (sliderTwoValue / 10).toFixed(1);
        sliderMaxValueEl.innerHTML = (sliderOneValue / 10).toFixed(1);
    }
}

sliderOneEl.addEventListener('change', () => {
    searchMovies();
}, false);
sliderTwoEl.addEventListener('change', () => {
    searchMovies();
}, false);

function searchMovies() {
    let searchString = searchBar.value.toString().replace(' ', '-');
    loadMovies(searchString);
}

async function loadMovies(filter) {
    searchInputDisplayEl.innerHTML = filter || "";
    movieListEl.classList += ' movies__loading';
    movieListEl.innerHTML = `<i class="fas fa-spinner movies__loading--spinner"></i>`;

    const movieSearch = await fetch(`https://www.omdbapi.com/?s=${filter}&type=movie&apikey=dba29d20`);
    const movieSearchData = await movieSearch.json();

    console.log(movieSearchData)

    if (movieSearchData.Response === "False") {
        renderNoResult();
    } else {
        renderMovies(movieSearchData);
    }

    movieListEl.classList.remove('movies__loading');
}

function renderNoResult() {
    movieListEl.innerHTML = `
        <div class="movies__no-result">
            <img class="movies__no-result--img" src="./assets/undraw_not_found_re_44w9.svg" alt="">
            <h2 class="search--title">Could not find any matches related to your search</h2>
            <p class="movies__no-result--para">Please change your search input and/or rating range</p>
        </div>
    `;
}

async function renderMovies(movieSearchData) {
    const movieSearchDataExtended = await Promise.all(
        movieSearchData.Search
            .map(movie => fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=dba29d20`)
                .then(res => res.json())
            )
    );

    const movieInfo = movieSearchDataExtended.filter((movie) => {
        if (parseFloat(movie.imdbRating) >= parseFloat(sliderMinValueEl.innerHTML)
            && (parseFloat(movie.imdbRating) <= parseFloat(sliderMaxValueEl.innerHTML))) {
            return true;
        }
        return false;
    });

    const movieInfoSorted = movieInfo.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating)).slice(0, 6);
    if (movieInfoSorted.length === 0) {
        renderNoResult();
    } else {
        movieListEl.innerHTML = movieInfoSorted.map(movie => movieHTML(movie)).join("");
    }

}

function movieHTML(movie) {
    if (movie.Poster === "N/A") { movie.Poster = "./assets/default-image.jpg" }
    return `
    <div class="movie">
        <figure class="movie__poster">
            <img class="movie__poster--img" src="${movie.Poster}" alt="">
            <div class="movie__more-info">
                <div class="movie__more-info--bg"></div>
                <span class="movie__more-info--text">More info <i class="fas fa-arrow-right"></i></span>
            </div>
        </figure>
        <div class="movie__information">
            <div class="movie--title"><span class="movie--title-scroll">${movie.Title}</span></div>
            <div class="movie__feature">
                <div class="movie__feature--icon">
                    <i class="fas fa-calendar"></i>
                </div>
                <p class="movie__feature--description">${movie.Released}</p>
            </div>
            <div class="movie__feature">
                <div class="movie__feature--icon">
                    <i class="fas fa-clock"></i>
                </div>
                <p class="movie__feature--description">${movie.Runtime}</p>
            </div>
            <div class="movie__feature">
                <div class="movie__feature--icon">
                    <i class="fas fa-video"></i>
                </div>
                <p class="movie__feature--description">${movie.Genre}</p>
            </div>
            <div class="movie__rating">
                <div class="movie__rating--icon">
                    <i class="fas fa-star"></i>
                </div>
                <h4 class="movie__feature--primary">${movie.imdbRating}/10</h4>
            </div>
        </div>
    </div>
    `;
}

