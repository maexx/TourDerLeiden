(() => {
  const accessKey = document.currentScript.dataset.accessKey || 'tdl-access-granted';
  const accessCode = document.currentScript.dataset.accessCode || '110469';

  try {
    if (sessionStorage.getItem(accessKey) === 'true') {
      document.documentElement.classList.remove('access-locked');
      return;
    }
  } catch (error) {
    console.warn('Der Seitenzugang kann in diesem Browser nicht gespeichert werden:', error);
  }

  const overlay = document.createElement('div');
  overlay.className = 'access-gate';

  const panel = document.createElement('section');
  panel.className = 'access-gate-panel';
  panel.setAttribute('aria-labelledby', 'access-gate-title');

  const heading = document.createElement('h1');
  heading.id = 'access-gate-title';
  heading.textContent = 'Geschützter Seitenzugang';

  const description = document.createElement('p');
  description.textContent = 'Bitte gib den Zahlencode ein, um die Seite zu öffnen.';

  const form = document.createElement('form');
  const label = document.createElement('label');
  label.htmlFor = 'access-gate-code';
  label.textContent = 'Zahlencode';

  const input = document.createElement('input');
  input.id = 'access-gate-code';
  input.name = 'code';
  input.type = 'password';
  input.inputMode = 'numeric';
  input.pattern = '[0-9]*';
  input.autocomplete = 'off';
  input.required = true;

  const errorMessage = document.createElement('p');
  errorMessage.className = 'access-gate-error';
  errorMessage.id = 'access-gate-error';
  errorMessage.setAttribute('role', 'alert');
  input.setAttribute('aria-describedby', errorMessage.id);

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Seite öffnen';

  form.append(label, input, button, errorMessage);
  panel.append(heading, description, form);
  overlay.append(panel);
  document.body.append(overlay);
  input.focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (input.value !== accessCode) {
      errorMessage.textContent = 'Der Zahlencode ist nicht korrekt. Bitte versuche es erneut.';
      input.select();
      return;
    }

    try {
      sessionStorage.setItem(accessKey, 'true');
    } catch (error) {
      console.warn('Die Freigabe kann in diesem Browser nicht gespeichert werden:', error);
    }

    document.documentElement.classList.remove('access-locked');
    overlay.remove();
  });
})();
