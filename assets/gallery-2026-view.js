    let allLightboxSrcs = [];
    let lightboxIndex = 0;
    let slideshowTimer = null;

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const playBtn = lightbox.querySelector('.lightbox-play');

    function showLightboxImage(index) {
      if (!allLightboxSrcs.length) return;
      lightboxIndex = (index + allLightboxSrcs.length) % allLightboxSrcs.length;
      const { src, label } = allLightboxSrcs[lightboxIndex];
      lightboxImage.src = src;
      lightboxImage.alt = label;
      lightboxCaption.textContent = label;
      lightboxCounter.textContent = `${lightboxIndex + 1} / ${allLightboxSrcs.length}`;
    }

    function openLightbox(index) {
      showLightboxImage(index);
      lightbox.hidden = false;
    }

    function closeLightbox() {
      lightbox.hidden = true;
      stopSlideshow();
    }

    function stopSlideshow() {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
      playBtn.textContent = '▶ Diashow';
    }

    function toggleSlideshow() {
      if (slideshowTimer) {
        stopSlideshow();
      } else {
        slideshowTimer = setInterval(() => showLightboxImage(lightboxIndex + 1), 3000);
        playBtn.textContent = '⏸ Stopp';
      }
    }

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showLightboxImage(lightboxIndex - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => showLightboxImage(lightboxIndex + 1));
    playBtn.addEventListener('click', toggleSlideshow);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxImage(lightboxIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(lightboxIndex + 1);
      if (e.key === ' ') { e.preventDefault(); toggleSlideshow(); }
    });

    function renderRoutePhotos() {
      allLightboxSrcs = [];

      document.querySelectorAll('.route-photos').forEach((container) => {
        const images = routePhotoMap[container.dataset.route] || [];
        if (!images.length) {
          container.innerHTML = '<span class="route-note">noch keine Fotos vorhanden</span>';
          return;
        }

        const startIndex = allLightboxSrcs.length;
        images.forEach((file) => {
          const label = file.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
          allLightboxSrcs.push({ src: `assets/gallery-web/${file}`, label });
        });

        container.innerHTML = images
          .map((file, i) => {
            const label = file.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
            const globalIndex = startIndex + i;
            return `
              <button type="button" class="route-photo-card" data-lightbox-index="${globalIndex}">
                <img src="assets/gallery-web/${file}" alt="${label}" loading="lazy" decoding="async">
              </button>
            `;
          })
          .join('');

        container.querySelectorAll('.route-photo-card').forEach((card) => {
          card.addEventListener('click', () => openLightbox(Number(card.dataset.lightboxIndex)));
        });
      });
    }
