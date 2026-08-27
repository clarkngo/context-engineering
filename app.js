function renderPatternCard(pattern) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.setProperty('--card-accent', pattern.accent);

  const tags = (pattern.tags || [])
    .map((t) => `<span class="tag">${t}</span>`)
    .join('');

  card.innerHTML = `
    <div class="card-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${pattern.icon}</svg>
    </div>
    <div class="card-body">
      <h3 class="card-title">${pattern.title}</h3>
      <p class="card-label">Problem</p>
      <p class="card-text">${pattern.problem}</p>
      <p class="card-label">Tradeoff</p>
      <p class="card-text">${pattern.tradeoff}</p>
      <div class="tag-row">${tags}</div>
    </div>
  `;
  return card;
}

function renderAntipatternCard(item) {
  const card = document.createElement('article');
  card.className = 'card card-warn';

  card.innerHTML = `
    <div class="card-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
    </div>
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-text">${item.description}</p>
    </div>
  `;
  return card;
}

function formatTokens(n) {
  return n.toLocaleString('en-US');
}

function renderBudget(budget) {
  const tabsEl = document.getElementById('scenario-tabs');
  const readoutEl = document.getElementById('budget-readout');
  const barEl = document.getElementById('budget-bar');
  const legendEl = document.getElementById('budget-legend');
  const noteEl = document.getElementById('budget-note');
  if (!tabsEl) return;

  function paint(scenario) {
    const used = budget.segments.reduce((sum, seg) => sum + (scenario.values[seg.key] || 0), 0);
    const free = Math.max(budget.window - used, 0);
    const pct = Math.round((used / budget.window) * 100);

    readoutEl.innerHTML = `<span><strong>${formatTokens(used)}</strong> / ${formatTokens(budget.window)} tokens used</span><span>${pct}% of window</span>`;

    barEl.setAttribute('aria-label', `${scenario.label}: ${pct}% of the ${formatTokens(budget.window)}-token window in use.`);
    barEl.innerHTML = budget.segments
      .map((seg) => {
        const tokens = scenario.values[seg.key] || 0;
        const width = (tokens / budget.window) * 100;
        if (width <= 0) return '';
        return `<div class="budget-seg" style="width:${width}%; background:${seg.color};" title="${seg.label}: ${formatTokens(tokens)} tokens"></div>`;
      })
      .join('') + `<div class="budget-seg is-free" style="width:${(free / budget.window) * 100}%;" title="Free: ${formatTokens(free)} tokens"></div>`;

    legendEl.innerHTML = budget.segments
      .map((seg) => {
        const tokens = scenario.values[seg.key] || 0;
        return `<span class="legend-item"><span class="legend-swatch" style="background:${seg.color};"></span>${seg.label}: <strong>${formatTokens(tokens)}</strong></span>`;
      })
      .join('') + `<span class="legend-item"><span class="legend-swatch is-free"></span>Free: <strong>${formatTokens(free)}</strong></span>`;

    noteEl.textContent = scenario.note;
  }

  budget.scenarios.forEach((scenario, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scenario-tab';
    btn.textContent = scenario.label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.scenario-tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      paint(scenario);
    });
    tabsEl.appendChild(btn);
  });

  paint(budget.scenarios[0]);
}

function currentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function paint(theme) {
    btn.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  paint(currentTheme());

  btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* localStorage unavailable — theme just won't persist */
    }
    paint(next);
  });
}

async function init() {
  initThemeToggle();

  const patternsGrid = document.getElementById('patterns-grid');
  const antipatternsGrid = document.getElementById('antipatterns-grid');

  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    const data = await res.json();

    if (data.budget) renderBudget(data.budget);
    data.patterns.forEach((p) => patternsGrid.appendChild(renderPatternCard(p)));
    data.antipatterns.forEach((a) => antipatternsGrid.appendChild(renderAntipatternCard(a)));
  } catch (err) {
    const msg = '<p class="load-error">Couldn\'t load the pattern catalog. Try refreshing.</p>';
    patternsGrid.innerHTML = msg;
    console.error('Failed to load content.json', err);
  }
}

init();
