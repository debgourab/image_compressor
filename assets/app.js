/* Image Compressor — Deb Gourab Biswas. All image processing stays local. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = Object.fromEntries(['files','browse','dropzone','settings','format','quality','qualityValue','qualityHint','maxSize','count','summary','clear','list','compress','zip','progress','status'].map(id => [id, $(id)]));
  const MAX_FILE = 25 * 1024 ** 2, MAX_BATCH = 100 * 1024 ** 2;
  let items = [], busy = false, sequence = 0;
  const size = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  const status = message => { ui.status.textContent = message; };
  function release(item) {
    URL.revokeObjectURL(item.preview);
    if (item.result) URL.revokeObjectURL(item.result.url);
  }
  function controls() {
    ui.settings.disabled = busy; ui.browse.disabled = busy; ui.files.disabled = busy;
    ui.clear.disabled = busy || !items.length; ui.compress.disabled = busy || !items.length;
    ui.zip.disabled = busy || !items.some(item => item.result);
    ui.quality.disabled = busy || ui.format.value === 'image/png';
    ui.qualityHint.textContent = ui.format.value === 'image/png' ? 'PNG ignores quality; resize to reduce size.' : 'Lower quality makes smaller files.';
    ui.qualityValue.textContent = `${ui.quality.value}%`;
  }
  function render() {
    ui.list.replaceChildren();
    items.forEach(item => {
      const li = document.createElement('li'); li.className = 'file-row';
      const img = document.createElement('img'); img.className = 'thumbnail'; img.src = item.preview; img.alt = ''; img.loading = 'lazy';
      const info = document.createElement('div'); info.className = 'file-info';
      const title = document.createElement('strong'); title.textContent = item.file.name;
      const detail = document.createElement('p');
      detail.textContent = item.error || (item.result ? `${size(item.file.size)} → ${size(item.result.blob.size)} · ${item.result.width} × ${item.result.height} · ${item.result.blob.size <= item.file.size ? `${((1 - item.result.blob.size / item.file.size) * 100).toFixed(1)}% smaller` : `${((item.result.blob.size / item.file.size - 1) * 100).toFixed(1)}% larger`}` : `${size(item.file.size)} · Ready to compress`);
      if (item.error) detail.className = 'error';
      info.append(title, detail);
      const actions = document.createElement('div'); actions.className = 'row-actions';
      if (item.result) { const a = document.createElement('a'); a.href = item.result.url; a.download = item.result.name; a.textContent = 'Download ↓'; a.className = 'download'; actions.append(a); }
      const remove = document.createElement('button'); remove.textContent = '×'; remove.className = 'remove'; remove.disabled = busy; remove.setAttribute('aria-label', `Remove ${item.file.name}`);
      remove.addEventListener('click', () => { release(item); items = items.filter(entry => entry !== item); render(); status('Image removed.'); });
      actions.append(remove); li.append(img, info, actions); ui.list.append(li);
    });
    ui.count.textContent = items.length ? `${items.length} image${items.length === 1 ? '' : 's'} selected` : 'No images selected';
    const ready = items.filter(item => item.result);
    ui.summary.textContent = items.length ? `${size(items.reduce((sum, item) => sum + item.file.size, 0))} original${ready.length ? ` · ${ready.length} ready · ${size(ready.reduce((sum, item) => sum + item.result.blob.size, 0))} output` : ''}` : 'Add images to get started.';
    controls();
  }
  function addFiles(files) {
    if (busy) return;
    let added = 0; const errors = [];
    for (const file of files) {
      if (!/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name) && !/^image\/(jpeg|png|webp|gif|bmp|avif)$/.test(file.type)) { errors.push(`${file.name}: unsupported format`); continue; }
      if (!file.size || file.size > MAX_FILE) { errors.push(`${file.name}: empty or over 25 MB`); continue; }
      if (items.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) { errors.push(`${file.name}: already added`); continue; }
      if (items.length >= 30 || items.reduce((sum, item) => sum + item.file.size, 0) + file.size > MAX_BATCH) { errors.push('Batch limit reached (30 files / 100 MB)'); break; }
      items.push({ id: ++sequence, file, preview: URL.createObjectURL(file), result: null, error: '' }); added++;
    }
    ui.files.value = ''; render(); status(`${added} image(s) added.${errors.length ? ` ${errors.join('; ')}.` : ''}`);
  }
  ui.browse.addEventListener('click', () => ui.files.click());
  ui.files.addEventListener('change', () => addFiles(ui.files.files));
  ui.clear.addEventListener('click', () => { items.forEach(release); items = []; ui.progress.hidden = true; render(); status('All images cleared.'); });
  render();
})();
