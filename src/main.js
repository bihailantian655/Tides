const { invoke } = window.__TAURI__.core;

function sanitizeUrl(input) {
  input = input.trim();
  if (/^https?:\/\//i.test(input)) return input;
  if (/^[\w-]+(\.[\w-]+)+/.test(input)) return 'https://' + input;
  return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}

document.querySelectorAll('.url').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const id = parseInt(input.dataset.id);
      navigate(id, input.value);
    }
  });
});

document.querySelectorAll('.btn.go').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    const input = document.querySelector(`.url[data-id="${id}"]`);
    navigate(id, input.value);
  });
});

document.querySelectorAll('.btn.nav').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'back') invoke('go_back', { panelId: id });
    else if (action === 'forward') invoke('go_forward', { panelId: id });
    else if (action === 'reload') invoke('reload_page', { panelId: id });
  });
});

document.querySelectorAll('.btn.close').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    invoke('close_panel', { panelId: id });
    const row = btn.closest('.panel-row');
    row.style.opacity = '0.3';
    row.style.pointerEvents = 'none';
    updateStatus();
  });
});

async function navigate(id, rawUrl) {
  if (!rawUrl.trim()) return;
  const url = sanitizeUrl(rawUrl);
  try {
    await invoke('navigate_panel', { panelId: id, url });
    document.getElementById('status').textContent = `Panel ${id + 1}: navigating...`;
  } catch (e) {
    document.getElementById('status').textContent = `Error: ${e}`;
  }
}

function updateStatus() {
  const active = document.querySelectorAll('.panel-row:not([style*="pointer-events: none"])').length;
  document.getElementById('status').textContent = `${active} panel${active !== 1 ? 's' : ''} active`;
}
