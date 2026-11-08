(() => {
  const form = document.getElementById('route-vote-form');
  const status = document.getElementById('route-vote-status');
  if (!form || !status) return;

  const storageKey = 'tdl-2027-vote-v1';
  const choices = Array.from(form.querySelectorAll('input[name="variant"]'));
  const submitButton = form.querySelector('button[type="submit"]');

  function lockVote(variant) {
    choices.forEach((choice) => {
      choice.disabled = true;
      choice.checked = choice.value === variant;
    });
    submitButton.disabled = true;
    status.textContent = `Deine Stimme für VAR ${variant} ist auf diesem Browser gespeichert.`;
  }

  try {
    const savedVote = localStorage.getItem(storageKey);
    if (['A', 'B', 'C', 'D'].includes(savedVote)) {
      lockVote(savedVote);
    }
  } catch (error) {
    status.setAttribute('role', 'alert');
    status.textContent = 'Die Abstimmung ist nicht verfügbar, weil dein Browser die lokale Speicherung blockiert.';
    choices.forEach((choice) => {
      choice.disabled = true;
    });
    submitButton.disabled = true;
    console.error('Die Abstimmungs-Auswahl konnte nicht aus dem Browser geladen werden.', error);
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="variant"]:checked');
    if (!selected) {
      status.textContent = 'Bitte wähle zuerst eine Variante aus.';
      return;
    }

    try {
      localStorage.setItem(storageKey, selected.value);
    } catch (error) {
      status.setAttribute('role', 'alert');
      status.textContent = 'Deine Stimme konnte nicht gespeichert werden. Bitte prüfe die Speichereinstellungen deines Browsers.';
      console.error('Die Abstimmungs-Auswahl konnte nicht im Browser gespeichert werden.', error);
      return;
    }

    lockVote(selected.value);
  });
})();
