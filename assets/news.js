(() => {
  const endpoint = 'https://dwwrxhhwumwzhksauqzz.supabase.co/rest/v1/tdl_news';
  const publicKey = 'sb_publishable_0KqfqZSDwnpec7sw4f5u_g_eCKE4UIZ';
  const headers = { apikey: publicKey };
  const form = document.getElementById('news-form');
  const author = document.getElementById('news-author');
  const message = document.getElementById('news-message');
  const formStatus = document.getElementById('news-form-status');
  const listStatus = document.getElementById('news-list-status');
  const posts = document.getElementById('news-posts');
  const more = document.getElementById('news-more');
  const submit = form.querySelector('button[type="submit"]');
  const pageSize = 20;
  let offset = 0;

  function renderPost(post) {
    const article = document.createElement('article');
    article.className = 'news-post';
    const heading = document.createElement('h3');
    heading.textContent = post.author;
    const time = document.createElement('time');
    time.dateTime = post.created_at;
    time.textContent = new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeZone: 'Europe/Berlin'
    }).format(new Date(post.created_at));
    const content = document.createElement('p');
    content.textContent = post.message;
    article.append(heading, time, content);
    return article;
  }

  async function loadPosts(reset = false) {
    more.disabled = true;
    listStatus.textContent = 'Beiträge werden geladen …';
    const nextOffset = reset ? 0 : offset;
    const url = new URL(endpoint);
    url.searchParams.set('select', 'id,author,message,created_at');
    url.searchParams.set('order', 'created_at.desc,id.desc');
    url.searchParams.set('limit', String(pageSize + 1));
    url.searchParams.set('offset', String(nextOffset));

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const visible = data.slice(0, pageSize);
      if (reset) posts.replaceChildren();
      posts.append(...visible.map(renderPost));
      offset = nextOffset + visible.length;
      more.hidden = data.length <= pageSize;
      listStatus.textContent = offset === 0 ? 'Noch keine neuen Beiträge.' : '';
    } catch (error) {
      listStatus.textContent = 'Beiträge konnten nicht geladen werden. Bitte lade die Seite erneut.';
      console.error('News-Beiträge konnten nicht geladen werden:', error);
    } finally {
      more.disabled = false;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = author.value.trim();
    const text = message.value.trim();
    if (!name || !text) {
      formStatus.textContent = 'Bitte gib deinen Namen und einen Beitrag ein.';
      return;
    }
    submit.disabled = true;
    formStatus.textContent = 'Beitrag wird veröffentlicht …';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ author: name, message: text })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      message.value = '';
      formStatus.textContent = 'Dein Beitrag wurde veröffentlicht.';
      await loadPosts(true);
    } catch (error) {
      formStatus.textContent = 'Dein Beitrag konnte nicht veröffentlicht werden. Bitte versuche es erneut.';
      console.error('News-Beitrag konnte nicht veröffentlicht werden:', error);
    } finally {
      submit.disabled = false;
    }
  });

  more.addEventListener('click', () => loadPosts());
  loadPosts();
})();
