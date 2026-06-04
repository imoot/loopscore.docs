const WEB3FORMS_ACCESS_KEY = '8bc11913-89ec-4f96-9017-37a8ac4ad539';

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/Mac/.test(ua) && !/iPhone|iPad/.test(ua)) return 'macos';
  return 'windows';
}

function activateTab(container, tabName) {
  const btn = container.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const panel = container.querySelector(`.tab-panel[data-tab="${tabName}"]`);
  if (!btn || !panel) return;
  container.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  container.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
  btn.classList.add('active');
  panel.classList.add('active');
}

function initTabs(container, defaultTab) {
  const buttons = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`.tab-panel[data-tab="${target}"]`).classList.add('active');
    });
  });

  if (defaultTab) activateTab(container, defaultTab);
}

function handleFormSubmit(formId, subject) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = form.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));
    data.access_key = WEB3FORMS_ACCESS_KEY;
    data.subject = subject;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const msg = document.createElement('p');
        msg.className = 'form-success';
        msg.textContent = 'Thank you — your submission has been received.';
        form.replaceWith(msg);
      } else {
        throw new Error(json.message || 'Submission failed.');
      }
    } catch (err) {
      const el = form.querySelector('.form-error');
      if (el) el.textContent = err.message || 'Something went wrong. Please try again.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const platform = detectPlatform();
  initTabs(document.getElementById('install-tabs'), platform);
  initTabs(document.getElementById('feedback-tabs'));

  const osSelect = document.getElementById('issue-os');
  if (osSelect) osSelect.value = platform === 'macos' ? 'macOS' : 'Windows';

  handleFormSubmit('issue-form', 'LoopScore Issue Report');
  handleFormSubmit('feature-form', 'LoopScore Feature Request');
});
