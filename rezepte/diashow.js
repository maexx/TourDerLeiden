(() => {
  const image = document.getElementById("hero-slideshow-image");
  const button = document.getElementById("hero-slideshow-control");
  const total = 39;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 1;
  let timer = null;
  let playing = false;

  function stop() {
    window.clearInterval(timer);
    timer = null;
    playing = false;
    button.textContent = "▶";
    button.setAttribute("aria-label", "Diashow abspielen");
    button.title = "Diashow abspielen";
  }

  function start() {
    if (timer !== null) return;
    playing = true;
    button.textContent = "❚❚";
    button.setAttribute("aria-label", "Diashow pausieren");
    button.title = "Diashow pausieren";
    timer = window.setInterval(() => {
      index = index % total + 1;
      image.src = `diashow/foto-${String(index).padStart(2, "0")}.jpg`;
      image.alt = `Erinnerungsfoto ${index} von ${total}`;
    }, 2000);
  }

  image.addEventListener("error", () => {
    console.error("Diashow-Bild konnte nicht geladen werden:", image.src);
    stop();
    button.setAttribute("aria-label", "Diashow erneut starten");
    button.title = "Diashow erneut starten";
  });
  button.addEventListener("click", () => {
    if (playing) stop();
    else start();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stop();
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches && playing) stop();
  });
  button.hidden = false;
  if (!reducedMotion.matches) start();
})();
