const APIKEY = '48aa722f';
const url_parameter = new URLSearchParams(window.location.search);
const id = url_parameter.get('id');
const type = url_parameter.get('type');
const VIDSRC_URL = `https://vidsrc.to/embed/`;
var output = '';

if (type === 'movie') {
    output = `
        <div class="vid-player">
            <iframe allowfullscreen frameborder='0' 
                src=https://vidsrc.me/embed/movie/${id}/>
            </iframe>
        </div>`;
} else {
    output = `
        <div class="vid-player">
            <iframe allowfullscreen frameborder='0' 
                src=https://vidsrc.me/embed/tv/${id}/>
            </iframe>
        </div>`;
}

document.querySelector('.main').innerHTML = output;

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


fetch(`https://www.omdbapi.com/?i=${id}&apikey=${APIKEY}`)
    .then(res => res.json())
    .then(data => generateMovieDescription(data))
    .catch(error => console.error('Error fetching movie data: ', error));

function generateMovieDescription(movie) {
    const movie_poster_img = (movie.Poster !== 'N/A') ? movie.Poster : 'images/unknown_movie_poster.webp';
    const output = `
                <div class="movie-title"> 
                    <h1>${movie.Title}</h1>
                </div>
                <div class="movie-ratings">
                    <span class="rating">${movie.imdbRating}</span>
                    <span class="rated">${movie.Rated}</span>
                    <span class="runtime">${movie.Runtime}</span>
                    <span class="year">${movie.Year}</span>
                </div>
                <div class="plot">
                    <p>${movie.Plot}</p>
                </div>
                <div class="movie-data">
                    <div class="movie-standalone-poster">
                        <img src=${movie_poster_img}>
                    </div>
                    <div class="movie-data-box">
                        <div class="label">
                            <span>Type: </span>
                            <span>Country: </span>
                            <span>Genre: </span>
                            <span>Release: </span>
                            <span>Director: </span>
                            <span>Production: </span>
                            <span>Cast: </span>
                        </div>

                        <div class="value">
                            <span>${movie.Type}</span>
                            <span>${movie.Country}</span>
                            <span>${movie.Genre}</span>
                            <span>${movie.Released}</span>
                            <span>${movie.Director}</span>
                            <span>${movie.Production}</span>
                            <span>${movie.Actors}</span>
                        </div>
                    </div>
                </div>
`;
    document.querySelector('.info-movie').innerHTML = output;
    document.title = movie.Title;
}
