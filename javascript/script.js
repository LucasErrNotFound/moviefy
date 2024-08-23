const APIKEY = '48aa722f';
var searchInput = document.getElementById('searchQueryInput');
searchInput.addEventListener('input', findAndDisplayMovies());

async function fetchMoviesAndTVShows(query, page_number) {
    const movieResponse = await fetch(`https://www.omdbapi.com/?apikey=${APIKEY}&s=${query}&page=${page_number}&type=movie`);
    const movieData = await movieResponse.json();

    const tvResponse = await fetch(`https://www.omdbapi.com/?apikey=${APIKEY}&s=${query}&page=${page_number}&type=series`);
    const tvData = await tvResponse.json();

    const combinedResults = {
        movies: movieData.Search || [],
        tvShows: tvData.Search || [],
    };
    return combinedResults;
}

async function fetchMovieOrTVRuntime(imdbID, type) {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${APIKEY}&i=${imdbID}&type=${type}`);
    return response.json();
}

async function findAndDisplayMovies() {
    const url_parameter = new URLSearchParams(window.location.search);
    const query = url_parameter.get('query');
    const output = [];

    if (!query) return;

    try {
        const pages = [1];
        const fetchPromises = pages.map(page_number => fetchMoviesAndTVShows(query, page_number));
        const results = await Promise.all(fetchPromises);

        const allResults = [];
        results.forEach(result => {
            allResults.push(...result.movies, ...result.tvShows);
        });
        const resultsWithPosters = allResults.filter(movie => movie.Poster !== 'N/A');

        if (resultsWithPosters.length > 0) {
            const detailedMovies = await fetchMovieDetailsConcurrently(resultsWithPosters);

            detailedMovies.forEach(movie => {
                output.push(generateMovieHTML(movie));
            });
            document.querySelector('.movie-container').innerHTML = output.join('');
            console.log({moviesList: detailedMovies});
        } else {
            console.error("No movies or TV show found or an error has occurred.");
        }
    } catch (error) {
        console.log(error);
    }
}

async function fetchMovieDetailsConcurrently(movies, limit = 5) {
    const movieChunks = [];
    for (let i = 0; i < movies.length; i += limit) {
        movieChunks.push(movies.slice(i, i + limit));
    }

    const detailedMovies = [];
    for (const chunk of movieChunks) {
        const detailsPromises = chunk.map(movie => fetchMovieOrTVRuntime(movie.imdbID, movie.Type));
        const chunkDetails = await Promise.all(detailsPromises);
        detailedMovies.push(...chunkDetails);
    }
    return detailedMovies;
}

function generateMovieHTML(movie) {
    const movie_poster_img = (movie.Poster !== 'N/A') ? movie.Poster : 'images/unknown_movie_poster.webp';
    return `
        <article class="movie-card">
            <div class="movie-cover-box">
                <div class="movie-poster">
                    <a href="movie.html?id=${movie.imdbID}&type=${movie.Type}"><img src="${movie_poster_img}"></a>
                </div>
            </div>
            <div class="movie-scroll-box">
                <div class="movie-info-box">
                    <h3>${movie.Title}</h3>
                    <div class="movie-details">
                        <div class="movie-details-box">
                            <span class="year">${movie.Year}</span>
                            <span class="type">${movie.Type}</span>
                            <span class="runtime">${movie.Runtime}</span>
                        </div>
                    </div>
                    <p class="director">by
                        <a href="">${movie.Director}</a>
                    </p>
                    <p class="description" title="">${movie.Plot}</p>
                    <ul class="movie-genres">
                        <li title="">
                            <a href="">${movie.Genre}</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="movie-top-box">
                <div class="movie-strip">
                    <div class="title">
                        <h3>${movie.Title}</h3>
                    </div>
                </div>
            </div>
        </article>
`;
}

function handleSearch() {
    const query = document.getElementById('searchQueryInput').value.trim();
    if (!query) return;

    window.location.href = `movieResults.html?query=${encodeURIComponent(query)}`;
}

document.getElementById('searchQueryInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
