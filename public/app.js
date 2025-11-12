async function loadPackage(name) {
  const res = await fetch('/api/npm?name=' + encodeURIComponent(name));
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

function linkify(meta) {
  const links = [];
  if (meta.homepage) links.push('<a href="' + meta.homepage + '" target="_blank" rel="noreferrer">homepage</a>');
  if (meta.repository && meta.repository.url) {
    const url = meta.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
    links.push('<a href="' + url + '" target="_blank" rel="noreferrer">repository</a>');
  }
  links.push('<a href="https://www.npmjs.com/package/' + encodeURIComponent(meta.name) + '" target="_blank" rel="noreferrer">npm</a>');
  return links.join(' · ');
}

function shieldsName(name) {
  return name.replace(/\//g, '%2F');
}

function badges(name, hasTypes) {
  const n = shieldsName(name);
  const version = '<img alt="npm version" src="https://img.shields.io/npm/v/' + n + '?label=version">';
  const downloads = '<img alt="weekly downloads" src="https://img.shields.io/npm/dw/' + n + '">';
  const license = '<img alt="license" src="https://img.shields.io/npm/l/' + n + '">';
  const types = hasTypes ? '<img alt="types included" src="https://img.shields.io/badge/types-included-blue?logo=typescript">' : '';
  return [version, downloads, license, types].filter(Boolean).join('\n');
}

(async () => {
  try {
    const msg = await loadPackage('@waelio/messaging');
    document.getElementById('msg-desc').textContent = msg.description || '—';
    document.getElementById('msg-ver').textContent = msg.version || '—';
    document.getElementById('msg-dl').textContent = new Intl.NumberFormat().format(msg.downloads_week || 0);
    document.getElementById('msg-links').innerHTML = linkify(msg);
    document.getElementById('msg-badges').innerHTML = badges(msg.name, !!msg.has_types);
    if (Array.isArray(msg.keywords) && msg.keywords.length) {
      document.getElementById('msg-tags').innerHTML = '<span class="chips">' + msg.keywords.map(k => '<span class="chip">' + k + '</span>').join('') + '</span>';
    }
  } catch (e) {
    document.getElementById('msg-error').textContent = e.message || String(e);
  }

  try {
    const ust = await loadPackage('@waelio/ustore');
    document.getElementById('ust-desc').textContent = ust.description || '—';
    document.getElementById('ust-ver').textContent = ust.version || '—';
    document.getElementById('ust-dl').textContent = new Intl.NumberFormat().format(ust.downloads_week || 0);
    document.getElementById('ust-links').innerHTML = linkify(ust);
    document.getElementById('ust-badges').innerHTML = badges(ust.name, !!ust.has_types);
    if (Array.isArray(ust.keywords) && ust.keywords.length) {
      document.getElementById('ust-tags').innerHTML = '<span class="chips">' + ust.keywords.map(k => '<span class="chip">' + k + '</span>').join('') + '</span>';
    }
  } catch (e) {
    document.getElementById('ust-error').textContent = e.message || String(e);
  }

  try {
    // Try unscoped first; then scoped fallbacks
    let util = null;
    try { util = await loadPackage('waelio-utils'); } catch (_) {}
    if (!util) { try { util = await loadPackage('@waelio/utils'); } catch (_) {} }
    if (!util) { try { util = await loadPackage('@waelio/waelio-utils'); } catch (_) {} }

    if (util) {
      document.getElementById('util-desc').textContent = util.description || '—';
      document.getElementById('util-ver').textContent = util.version || '—';
      document.getElementById('util-dl').textContent = new Intl.NumberFormat().format(util.downloads_week || 0);
      document.getElementById('util-links').innerHTML = linkify(util);
      document.getElementById('util-badges').innerHTML = badges(util.name, !!util.has_types);
      if (Array.isArray(util.keywords) && util.keywords.length) {
        document.getElementById('util-tags').innerHTML = '<span class="chips">' + util.keywords.map(k => '<span class="chip">' + k + '</span>').join('') + '</span>';
      }
    } else {
      document.getElementById('util-error').textContent = 'Package not found on npm';
    }
  } catch (e) {
    document.getElementById('util-error').textContent = e.message || String(e);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
