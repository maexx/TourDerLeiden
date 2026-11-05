(function () {
  const mapElement = document.getElementById('year-route-map');
  const controlsElement = document.getElementById('year-map-controls');
  const statusElement = document.getElementById('year-map-status');
  if (!mapElement || !controlsElement || !statusElement) return;

  const variants = [
    { name: 'VAR A', color: '#1769aa' },
    { name: 'VAR B', color: '#c62828' },
    { name: 'VAR C', color: '#27823b' },
    { name: 'VAR D', color: '#7b3fa1' },
  ];

  function getRouteSegments(xml) {
    const trackSegments = Array.from(xml.getElementsByTagNameNS('*', 'trkseg'));
    if (trackSegments.length > 0) {
      return trackSegments.map((segment) => Array.from(segment.getElementsByTagNameNS('*', 'trkpt')));
    }

    const routes = Array.from(xml.getElementsByTagNameNS('*', 'rte'));
    if (routes.length > 0) {
      return routes.map((route) => Array.from(route.getElementsByTagNameNS('*', 'rtept')));
    }

    const points = Array.from(xml.getElementsByTagNameNS('*', 'trkpt'));
    return points.length > 0 ? [points] : [];
  }

  function parseCoordinates(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (xml.getElementsByTagName('parsererror').length > 0) {
      throw new Error('GPX-Datei ist nicht lesbares XML.');
    }

    return getRouteSegments(xml)
      .map((segment) => segment
        .map((point) => [Number(point.getAttribute('lat')), Number(point.getAttribute('lon'))])
        .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon)
          && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180))
      .filter((segment) => segment.length > 1);
  }

  function createVariantControl(variant, layer, hasRoutes, map) {
    const label = document.createElement('label');
    label.className = 'year-map-variant';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = hasRoutes;
    checkbox.disabled = !hasRoutes;
    checkbox.setAttribute('aria-label', hasRoutes
      ? `${variant.name} auf der Karte anzeigen`
      : `${variant.name}: keine GPX-Dateien vorhanden`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });

    const swatch = document.createElement('span');
    swatch.className = 'year-map-swatch';
    swatch.style.backgroundColor = variant.color;
    swatch.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = hasRoutes ? variant.name : `${variant.name} (keine GPX-Dateien)`;

    label.append(checkbox, swatch, text);
    controlsElement.appendChild(label);
  }

  async function loadMap() {
    if (typeof L === 'undefined') {
      statusElement.textContent = 'Die Kartenbibliothek konnte nicht geladen werden.';
      return;
    }

    const map = L.map(mapElement, { scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const groups = variants.map((variant) => {
      const card = Array.from(document.querySelectorAll('.year-variant'))
        .find((element) => element.querySelector('h3')?.textContent.trim() === variant.name);
      const links = card ? Array.from(card.querySelectorAll('.year-file-list a')) : [];
      return { ...variant, links, layer: L.featureGroup() };
    });

    const requests = groups.flatMap((group) => group.links.map(async (link) => {
      const response = await fetch(link.href);
      if (!response.ok) {
        throw new Error(`${link.textContent}: HTTP ${response.status}`);
      }

      const coordinates = parseCoordinates(await response.text());
      if (coordinates.length === 0) {
        throw new Error(`${link.textContent}: keine gültigen Trackpunkte gefunden.`);
      }

      return { group, filename: link.textContent, coordinates };
    }));

    const results = await Promise.allSettled(requests);
    const bounds = [];
    const failures = [];
    let routeCount = 0;

    for (const result of results) {
      if (result.status === 'rejected') {
        failures.push(result.reason.message || 'Eine GPX-Datei konnte nicht geladen werden.');
        continue;
      }

      const { group, filename, coordinates } = result.value;
      for (const segment of coordinates) {
        group.layer.addLayer(L.polyline(segment, {
          color: group.color,
          weight: 4,
          opacity: 0.85,
          lineJoin: 'round',
        }).bindTooltip(filename));
        bounds.push(...segment);
      }
      routeCount += 1;
    }

    for (const group of groups) {
      const hasRoutes = group.layer.getLayers().length > 0;
      if (hasRoutes) group.layer.addTo(map);
      createVariantControl(group, group.layer, hasRoutes, map);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [28, 28] });
    } else {
      map.setView([47.5, 9.5], 5);
      statusElement.textContent = 'Für die Karte konnten keine GPX-Routen geladen werden.';
    }

    if (failures.length > 0) {
      statusElement.textContent = `${failures.length} GPX-Datei(en) konnten nicht auf der Karte dargestellt werden.`;
      console.error('Einige 2027-GPX-Routen konnten nicht geladen werden:', failures);
    } else if (routeCount > 0) {
      statusElement.textContent = `${routeCount} Etappen geladen.`;
    }
  }

  loadMap().catch((error) => {
    statusElement.textContent = 'Die GPX-Karte konnte nicht geladen werden.';
    console.error('2027-GPX-Karte konnte nicht geladen werden:', error);
  });
})();
