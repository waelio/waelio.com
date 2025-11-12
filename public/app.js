async function loadPackage(name) {
  // Fetch npm registry metadata and weekly downloads directly (static-friendly)
  const [meta, dl] = await Promise.all([
    fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`).then(r => {
      if (!r.ok) throw new Error(`registry: ${r.status}`);
      return r.json();
    }),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`).then(r => {
      if (!r.ok) throw new Error(`downloads: ${r.status}`);
      return r.json();
    }).catch(() => ({ downloads: 0 }))
  ]);

  const distTags = meta["dist-tags"] || {};
  const latest = distTags.latest || Object.keys(meta.versions || {}).pop() || '';
  const v = (meta.versions && meta.versions[latest]) || {};
  const hasTypes = Boolean(v.types || v.typings);
  const license = v.license || meta.license || '';
  const homepage = v.homepage || meta.homepage || '';
  let repository = v.repository || meta.repository || null;
  if (typeof repository === 'string') repository = { url: repository };

  return {
    name: meta.name || name,
    description: v.description || meta.description || '',
    version: latest,
    homepage,
    repository,
    downloads_week: Number(dl.downloads || 0),
    keywords: Array.isArray(v.keywords) ? v.keywords : (Array.isArray(meta.keywords) ? meta.keywords : []),
    license,
    has_types: hasTypes
  };
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
  try { util = await loadPackage('waelio-utils'); } catch (_) { /* ignore */ }
  if (!util) { try { util = await loadPackage('@waelio/utils'); } catch (_) { /* ignore */ } }
  if (!util) { try { util = await loadPackage('@waelio/waelio-utils'); } catch (_) { /* ignore */ } }

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
    self.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
