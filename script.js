'use strict';

class App {
  #map;
  #mapZoomLevel = 12;
  #markerLayer;
  #movies = [];

  constructor() {
    this._getPosition();
    this._getJson();
    this._renderMovieMenu();
  }

  _getJson() {
    let request = new XMLHttpRequest();
    request.open('GET', 'locations.json', false);
    request.send(null);
    let json = JSON.parse(request.responseText);
    this.#movies = json.movies;
  }

  _getPosition() {
    if (navigator.geolocation);
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),

      function () {
        alert('Could not get your position');
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    (this.#map = L.map('map').setView(coords, this.#mapZoomLevel)),
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

    this.#markerLayer = L.layerGroup().addTo(this.#map);
  }

  _renderMovieMenu() {
    this.#movies.forEach(movie => {
      const html = `<li>
        <ul class="movie">
          <li><h2 class="movie__title">${movie.title}</h2></li>
          <li><ul class="movie__locations"></ul></li>
        </ul>
      </li>`;

      const moviesList = document.querySelector('.movies');
      moviesList.insertAdjacentHTML('beforeend', html);
    });

    const movieTitles = document.querySelectorAll('.movie__title');
    movieTitles.forEach(title =>
      title.addEventListener('click', this._toggleActive.bind(this))
    );
  }

  _toggleActive(e) {
    this._removeMovieSubMenus();
    this._clearMarkers();

    const clickedMovie = e.target.closest('.movie');
    if (!clickedMovie) return;

    this._renderMovieSubMenu(clickedMovie);
  }

  _removeMovieSubMenus() {
    const AllMoviesLocations = document.querySelectorAll('.movie__location');
    AllMoviesLocations.forEach(location => location.remove());
  }

  _clearMarkers() {
    this.#markerLayer.clearLayers();
  }

  _renderMovieSubMenu(clickedMovie) {
    const clickedTitle = clickedMovie.childNodes[1].innerText;
    const clickedLocationsList = clickedMovie.childNodes[3].childNodes[0];
    const clickedMovieObj = this.#movies.find(
      movie => movie.title === clickedTitle
    );

    clickedMovieObj.location.forEach(location => {
      let subMenu = `<li class="movie__location">${location.name}</li>`;
      clickedLocationsList.insertAdjacentHTML('beforeend', subMenu);

      this._renderLocationMarker(location);
    });

    clickedLocationsList.addEventListener(
      'click',
      this._moveToPopup.bind(this)
    );
  }

  _renderLocationMarker(location) {
    L.marker(location.coords)
      .addTo(this.#markerLayer)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `${location.name}<img class="movie__img" src="${location.img}"/>`
      )
      .openPopup();
  }

  _moveToPopup(e) {
    const location = e.target.closest('.movie__location');
    if (!location) return;

    const locationName = location.innerHTML;
    const locationsArr = [];
    this.#movies.forEach(movie =>
      movie.location.forEach(location => locationsArr.push(location))
    );

    const locationObj = locationsArr.find(
      location => location.name === locationName
    );
    const currentZoom = this.#map.getZoom();

    this.#map.setView(locationObj.coords, currentZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
