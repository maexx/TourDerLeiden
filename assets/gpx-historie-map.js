(() => {
  const mapElement = document.getElementById('history-route-map');
  const controlsElement = document.getElementById('history-map-controls');
  const statusElement = document.getElementById('history-map-status');

  if (!mapElement || !controlsElement || !statusElement) return;

  if (typeof L === 'undefined') {
    statusElement.textContent = 'Die Karte konnte nicht geladen werden. Leaflet wurde nicht gefunden.';
    return;
  }

  const yearColors = {
    2013: '#0072b2',
    2014: '#e69f00',
    2015: '#009e73',
    2016: '#d55e00',
    2017: '#cc79a7',
    2018: '#56b4e9',
    2019: '#7a5195',
    2020: '#332288',
    2021: '#88ccee',
    2022: '#44aa99',
    2023: '#117733',
    2024: '#a67500',
    2025: '#aa4499'
  };
  const yearLayers = {};
  const map = L.map(mapElement, { scrollWheelZoom: false, preferCanvas: true });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  Object.entries(yearColors).forEach(([year, color]) => {
    const layer = L.geoJSON(null, {
      style: {
        color,
        weight: 4,
        opacity: 0.85
      },
      onEachFeature(feature, routeLayer) {
        const popup = document.createElement('div');
        const title = document.createElement('strong');
        const download = document.createElement('a');

        title.textContent = feature.properties.label;
        download.href = feature.properties.file;
        download.download = '';
        download.textContent = 'GPX herunterladen';
        popup.append(title, document.createElement('br'), download);
        routeLayer.bindPopup(popup);
      }
    }).addTo(map);

    yearLayers[year] = layer;

    const control = document.createElement('label');
    const checkbox = document.createElement('input');
    const swatch = document.createElement('span');

    control.className = 'year-map-variant';
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.setAttribute('aria-label', `Routen ${year} anzeigen`);
    swatch.className = 'year-map-swatch history-map-swatch';
    swatch.style.backgroundColor = color;
    control.append(checkbox, swatch, document.createTextNode(year));
    controlsElement.append(control);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });
  });

  fetch('assets/gpx-historie-tracks.geojson')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Routendaten konnten nicht geladen werden (HTTP ${response.status}).`);
      }
      return response.json();
    })
    .then((routeData) => {
      if (!routeData.features || !routeData.features.length) {
        throw new Error('Die Routendatei enthält keine Strecken.');
      }

      routeData.features.forEach((feature) => {
        const layer = yearLayers[feature.properties.year];
        if (layer) layer.addData(feature);
      });

      const bounds = L.latLngBounds([]);
      Object.values(yearLayers).forEach((layer) => {
        if (layer.getLayers().length) bounds.extend(layer.getBounds());
      });

      if (!bounds.isValid()) {
        throw new Error('Für die Karte wurden keine gültigen Strecken gefunden.');
      }

      map.fitBounds(bounds, { padding: [24, 24] });
      statusElement.textContent = `${routeData.features.length} Routen aus ${Object.keys(yearLayers).join(', ')}.`;
    })
    .catch((error) => {
      console.error('Historische GPX-Karte konnte nicht geladen werden:', error);
      statusElement.textContent = 'Die Routenkarte konnte nicht geladen werden. Bitte lade die Seite erneut.';
    });
})();
