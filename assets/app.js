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
  function decode(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => { image.src = ''; reject(new Error('Image decoding timed out.')); }, 20000);
      image.onload = () => { clearTimeout(timer); resolve(image); };
      image.onerror = () => { clearTimeout(timer); reject(new Error('Cannot decode this image. It may be corrupt or unsupported by your browser.')); };
      image.src = url;
    });
  }
  async function convert(item, options) {
    const image = await decode(item.preview);
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Image exceeds the 40 megapixel limit or has invalid dimensions.');
    const ratio = options.max ? Math.min(1, options.max / Math.max(image.naturalWidth, image.naturalHeight)) : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    try {
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser could not create an image canvas.');
      if (options.mime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image encoding failed. Try smaller dimensions.')), options.mime, options.quality));
      if (blob.type !== options.mime) throw new Error('Selected output format is unsupported by this browser. Try PNG or JPEG.');
      const extension = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[blob.type];
      const base = item.file.name.replace(/\.[^.]+$/, '').replace(/[\\/\x00-\x1f:*?"<>|]/g, '_').slice(0, 160) || 'image';
      return { blob, name: `${base}-compressed-${item.id}.${extension}`, width: canvas.width, height: canvas.height, url: URL.createObjectURL(blob) };
    } finally { canvas.width = canvas.height = 0; }
  }
  ui.browse.addEventListener('click', () => ui.files.click());
  ui.files.addEventListener('change', () => addFiles(ui.files.files));
  ['dragenter','dragover'].forEach(event => ui.dropzone.addEventListener(event, e => { e.preventDefault(); if (!busy) ui.dropzone.classList.add('dragover'); }));
  ui.dropzone.addEventListener('dragleave', e => { if (!ui.dropzone.contains(e.relatedTarget)) ui.dropzone.classList.remove('dragover'); });
  ui.dropzone.addEventListener('drop', e => { e.preventDefault(); ui.dropzone.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
  // Prevent dropped files outside the dropzone from navigating away from the app.
  ['dragover','drop'].forEach(event => window.addEventListener(event, e => e.preventDefault()));
  ui.clear.addEventListener('click', () => { items.forEach(release); items = []; ui.progress.hidden = true; render(); status('All images cleared.'); });
  ui.compress.addEventListener('click', async () => {
    if (busy || !items.length) return;
    busy = true; const options = { mime: ui.format.value, quality: Number(ui.quality.value) / 100, max: Number(ui.maxSize.value) };
    ui.progress.hidden = false; ui.progress.value = 0; render();
    let failed = 0;
    try {
      for (let index = 0; index < items.length; index++) {
        const item = items[index]; status(`Compressing ${index + 1} of ${items.length}…`);
        if (item.result) URL.revokeObjectURL(item.result.url); item.result = null; item.error = '';
        try { item.result = await convert(item, options); } catch (error) { item.error = error.message; failed++; }
        ui.progress.value = (index + 1) / items.length * 100; render();
      }
      status(`${items.length - failed} image(s) ready to download.${failed ? ` ${failed} failed; see details above.` : ''}`);
    } finally { busy = false; render(); }
  });
  render();
})();
