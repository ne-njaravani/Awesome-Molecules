(() => {

  'use strict';

  const $ = id => document.getElementById(id);

  const MODEL_NAMES = { gpt: 'GPT', claude: 'Claude', gemini: 'Gemini', deepseek: 'DeepSeek' };
  const ROUTING_PROFILES = {
    gpt: { fit: { writing: 4, analysis: 5, research: 4, strategy: 5 }, quality: 5, cost: 2, speed: 4 },
    claude: { fit: { writing: 5, analysis: 4, research: 4, strategy: 4 }, quality: 5, cost: 3, speed: 3 },
    gemini: { fit: { writing: 3, analysis: 4, research: 5, strategy: 4 }, quality: 4, cost: 4, speed: 5 },
    deepseek: { fit: { writing: 3, analysis: 4, research: 3, strategy: 3 }, quality: 3, cost: 5, speed: 4 }
  };
  const ROUTING_WEIGHTS = {
    balanced: { fit: .45, quality: .20, cost: .25, speed: .10 },
    quality: { fit: .45, quality: .45, cost: .05, speed: .05 },
    cost: { fit: .30, quality: .05, cost: .50, speed: .15 },
    speed: { fit: .28, quality: .12, cost: .10, speed: .50 }
  };
  const CONNECTIONS_KEY = 'lubs3991-workspace-connections-v1';
  const CONNECTIONS = [
    ['openai', 'OpenAI', 'AI provider', 16, 23],
    ['anthropic', 'Anthropic', 'AI provider', 84, 23],
    ['google', 'Google Gemini', 'AI provider', 8, 67],
    ['microsoft', 'Microsoft 365 / Copilot', 'Work platform', 92, 67],
    ['slack', 'Slack', 'Work platform', 28, 89],
    ['notion', 'Notion', 'Work platform', 72, 89]
  ];

  const THREAD_KEY = 'lubs3991-workspace-threads-v2';

  const USAGE_KEY = 'lubs3991-workspace-usage-v2';

  const LEGACY_KEY = 'lubs3991-unified-ai-demo-v1';

  const SAMPLE_CSV = 'Channel,Spend,Clicks,Leads,Revenue\nSearch,1200,800,40,4500\nSocial,900,1200,18,1900\nEmail,200,400,32,2800\nReferrals,100,180,24,3600\n';

  const DEMO_ASSISTANT = 'This is a fictional Demo example, not a live AI-generated answer. The figures shown are illustrative and are not provider usage or a billable cost.';

  const DEMO_THREADS = [

    ['Campaign launch ideas', 'Write three launch posts for our analytics service.', 'Here are three concise launch angles: lead with a customer problem, show a practical outcome, and finish with one clear call to action.'],

    ['Weekly campaign review', 'What should we review in this week’s campaign?', 'Start with spend, leads and cost per lead by channel. Compare equivalent periods, check tracking quality, then choose one focused change to test.'],

    ['Improve LinkedIn copy', 'Rewrite this headline for a B2B audience.', 'Make the customer outcome explicit: “Turn campaign data into your next best marketing decision.”'],

    ['Budget planning', 'How can a small team prioritise its marketing budget?', 'Protect the channels with strong evidence, reserve a small test budget, and review lead quality rather than clicks alone.'],

    ['Customer research plan', 'Give me a simple customer research plan.', 'Interview five recent customers, group recurring needs, compare competitor claims, and record observed evidence separately from assumptions.'],

    ['Quarterly priorities', 'Create priorities for the next quarter.', 'Choose one growth objective, one retention objective and one operational improvement. Assign an owner and measurable result to each.'],

    ['Email nurture sequence', 'Suggest a short nurture sequence.', 'Use three emails: useful insight, practical example, and a low-friction invitation to talk. Keep each email focused on one action.'],

    ['Social channel review', 'Which social metrics matter most?', 'Track qualified enquiries, conversion rate and cost per qualified lead. Reach and clicks are useful context but not the final decision metric.'],

    ['Reporting improvements', 'How do we make our reporting more useful?', 'Use a consistent weekly view with objective, result, change from last period, explanation to investigate and next action.'],

    ['New service positioning', 'Help position a new analytics service.', 'Position it around turning confusing campaign data into a short, prioritised action brief for time-poor SME teams.']
    ,['Supplier payment check', 'Which supplier invoices need action this week?', 'Prioritise the two unpaid invoices by due date, confirm the totals, and keep the already-paid invoice for the audit trail.']
    ,['Bakery launch checklist', 'Create a checklist for launching a new seasonal loaf.', 'Confirm the recipe, price, allergen information, photography, launch date, staff briefing and one measurable promotion.']
    ,['Customer feedback themes', 'Summarise the main themes in recent customer feedback.', 'Group feedback into product quality, service speed, availability and value. Separate repeated evidence from one-off comments.']
    ,['Weekly team update', 'Draft a short update for the bakery team.', 'Share this week’s wins, next week’s priorities, one customer insight and one operational issue that needs an owner.']
    ,['Competitor scan', 'Plan a lightweight competitor review.', 'Compare three local competitors on offer, pricing, opening hours, customer promise and visible evidence. Record the date of each observation.']
    ,['Cash flow questions', 'What should we ask before approving a new AI subscription?', 'Check the monthly cost, duplicate capability, expected time saved, data handling, cancellation terms and a 30-day success measure.']
    ,['Content calendar', 'Create a simple four-week content calendar.', 'Use three content pillars, two posts per week, one customer story and one clear call to action per week.']
    ,['Staff training note', 'Write a five-minute guide for using the AI workspace safely.', 'Explain what information not to paste, how to check outputs, when to use Agent mode and how to report a concern.']
    ,['Monthly review', 'Prepare a monthly AI usage review.', 'Summarise usage, spend, time saved, output quality, adoption and risks, then recommend one thing to continue and one thing to stop.']
    ,['Promotion experiment', 'Design a small promotion experiment for next week.', 'Define the audience, offer, channel, budget, success metric, owner and review date before launch.']
  ];

  const DEMO_TASKS = [

    'Analyse campaign performance by channel',

    'Draft a LinkedIn launch sequence',

    'Create a one-week marketing action brief',

    'Review customer acquisition priorities',

    'Summarise the fictional campaign results',

    'Plan an email nurture experiment',

    'Compare channel efficiency',

    'Create a quarterly KPI checklist',

    'Suggest a reporting workflow',

    'Prepare a stakeholder update',
    'Identify marketing test ideas',
    'Build a simple content calendar',
    'Review supplier payment dates',
    'Create a seasonal product launch checklist',
    'Summarise customer feedback themes',
    'Draft a weekly staff update',
    'Compare three local competitors',
    'Review a new AI subscription',
    'Create a four-week content calendar',
    'Write a safe-use training note',
    'Prepare a monthly AI usage review',
    'Design a promotion experiment',
    'Check campaign tracking quality',
    'Plan a customer retention test',
    'Create a simple stock update',
    'Prepare a pricing review',
    'Build a reusable prompt library',
    'Review team adoption barriers',
    'Create a risk-control checklist',
    'Summarise quarterly priorities'
  ];

  const EXAMPLES = {

    campaign: { mode: 'ask', prompt: 'Write three short LinkedIn posts for a small B2B consultancy launching an analytics service. Use clear UK English, and include one call to action in each post.' },

    analysis: { mode: 'agent', prompt: 'Analyse this campaign data, identify channels to review, and create a practical marketing action brief for next week.', sample: true },

    strategy: { mode: 'agent', prompt: 'Create a practical one-week marketing plan for a small UK consultancy with limited staff time and budget.' },

    audit: { mode: 'agent', prompt: 'Run an AI Audit: compare current AI tool spend, ROI, staff adoption and recommend improvements with five-minute lessons and 30/90-day tracking.' },

    tracker: { mode: 'agent', prompt: 'Review the AI Audit ROI tracker and explain the 30-day and 90-day KPI checkpoints.' },

    risks: { mode: 'agent', prompt: 'Review the AI Audit risk register for contracts, data handling and over-reliance on key staff.' }

  };

  const TASK_EXAMPLES = {

    newsletter: { title: 'Weekly email newsletter', prompt: 'Write a newsletter about our new bread.', mode: 'ask', sample: 'The new sourdough is baked overnight and available for a Monday free-sample offer.' },

    'customer-emails': { title: 'Reply to customer emails', prompt: 'Draft a friendly reply to a customer asking about our opening hours.', mode: 'ask', sample: 'We are open Monday to Saturday, 8am–4pm. We would be happy to help with your order.' },

    instagram: { title: 'Instagram posts', prompt: 'Plan three Instagram posts for this week about our bakery.', mode: 'ask', sample: 'Monday: behind the bake. Wednesday: meet the team. Friday: weekend favourites.' },

    invoices: { title: 'Supplier invoice summary', prompt: 'Summarise the key totals and due dates in our supplier invoices.', mode: 'agent', fileName: 'supplier_invoices.csv', fileText: 'Supplier,Invoice,DueDate,Amount,Status\nFlour Mill,INV-1042,2026-11-21,420.00,To pay\nLocal Dairy,INV-883,2026-11-24,185.50,To pay\nPackaging Co,INV-771,2026-11-30,96.00,Paid\n' },

    products: { title: 'Product descriptions', prompt: 'Write a concise product description for our new sourdough loaf.', mode: 'ask', sample: 'A slow-fermented sourdough with a crisp crust, open crumb and gentle tang, baked fresh each morning.' }

  };

  const humanCost = value => typeof value === 'number' && Number.isFinite(value) ? '$' + (value >= 0.01 ? value.toFixed(3) : value.toFixed(5)) : 'Not priced';

  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  const create = (tag, className = '', text = '') => { const el = document.createElement(tag); if (className) el.className = className; if (text) el.textContent = text; return el; };

  const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);

  const saved = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };

  const threads = Array.isArray(saved(THREAD_KEY, [])) ? saved(THREAD_KEY, []).filter(x => x && typeof x.id === 'string' && Array.isArray(x.messages)).slice(0, 30) : [];

  const usage = Array.isArray(saved(USAGE_KEY, [])) ? saved(USAGE_KEY, []).filter(x => x && typeof x.mode === 'string').slice(0, 100) : [];

  const legacy = Array.isArray(saved(LEGACY_KEY, [])) ? saved(LEGACY_KEY, []).filter(x => x && typeof x.task === 'string').slice(0, 80) : [];

const savedConnections = saved(CONNECTIONS_KEY, {});
const connections = savedConnections && typeof savedConnections === 'object' && !Array.isArray(savedConnections) ? savedConnections : {};
  const state = { currentId: threads[0]?.id || null, page: 'workspace', mode: 'ask', environment: 'demo', goal: 'balanced', scope: 'demo', provider: 'auto', adapter: 'gpt', attachment: null, busy: false, controller: null, liveStatus: { liveEnabled: false, providers: [] }, lastReport: null, promptCoach: null, pendingSubmission: null };

  let toastTimeout;



  function persist() {

    try {

      localStorage.setItem(THREAD_KEY, JSON.stringify(threads.slice(0, 30).map(t => ({ ...t, messages: t.messages.slice(-36) }))));

      localStorage.setItem(USAGE_KEY, JSON.stringify(usage.slice(0, 100)));

    } catch { toast('Browser storage is full. New history may not be saved.'); }

  }

  const currentThread = () => threads.find(t => t.id === state.currentId);

  function ensureThread(firstMessage) {

    if (currentThread()) return currentThread();

    const thread = { id: uid(), title: firstMessage.slice(0, 42).trim() || 'New conversation', createdAt: new Date().toISOString(), messages: [] };

    threads.unshift(thread); state.currentId = thread.id; persist(); renderHistory(); return thread;

  }

  function newChat() {

    if (state.busy) { toast('Stop the running request before starting another chat.'); return; }

    state.currentId = null; state.pendingSubmission = null; state.attachment = null; hidePromptCoach(); $('composer-input').value = ''; $('file-input').value = ''; $('file-tray').classList.add('hidden');

    showPage('workspace'); renderHistory(); renderMessages(); $('composer-input').focus();

  }

  function demoDate(daysAgo, hour = 10) {

    const date = new Date();

    date.setDate(date.getDate() - daysAgo);

    date.setHours(hour, 15, 0, 0);

    return date.toISOString();

  }

  function loadDemoWorkspace() {

    if (state.busy) return toast('Finish the running task before loading demo data.');

    if (threads.length || usage.length) {

      if (!confirm('Add fictional demo chats and insights to the current browser data?')) return;

    }

    const seededThreads = DEMO_THREADS.map(([title, prompt, answer], index) => {

      const createdAt = demoDate(index + 1, 9 + (index % 5));

      return {

        id: `demo-thread-${index + 1}`,

        title,

        createdAt,

        messages: [

          { id: `demo-user-${index + 1}`, role: 'user', content: prompt, fileName: null },

          { id: `demo-assistant-${index + 1}`, role: 'assistant', content: `${answer}\n\n${DEMO_ASSISTANT}`, mode: 'demo', providerId: ['gpt', 'claude', 'gemini', 'deepseek'][index % 4], model: 'Example profile', usage: null, estimatedCostUsd: null, routing: { basis: 'Fictional seeded Demo record.' }, report: null, steps: null }

        ]

      };

    });

    const existingIds = new Set(threads.map(thread => thread.id));

    for (const thread of seededThreads.reverse()) if (!existingIds.has(thread.id)) threads.unshift(thread);

    const seededUsage = DEMO_TASKS.map((task, index) => ({

      id: `demo-usage-${index + 1}`,

      mode: 'demo',

      task,

      kind: index % 3 === 0 ? 'agent' : 'ask',

      providerId: ['gpt', 'claude', 'gemini', 'deepseek'][index % 4],

      model: 'Example profile',

      usage: null,

      cost: null,

      at: demoDate(index + 1, 8 + (index % 8))

    }));

    const existingUsage = new Set(usage.map(item => item.id));

    for (const item of seededUsage) if (!existingUsage.has(item.id)) usage.push(item);

    state.currentId = threads[0]?.id || null;

    persist(); renderHistory(); renderMessages(); renderInsights();

    $('settings-dialog').close();

    toast('Fictional Demo workspace loaded. No API calls were made.');

  }

  function renderHistory() {

    const list = $('history-list'); list.replaceChildren();

    if (!threads.length) { list.append(create('p', 'history-empty', 'Your conversations will appear here.')); return; }

    for (const t of threads) {

      const btn = create('button', 'history-item' + (t.id === state.currentId ? ' current' : ''), t.title || 'Conversation');

      btn.type = 'button'; btn.title = t.title; btn.addEventListener('click', () => {

        if (state.busy) return toast('Finish or cancel the running task first.');

        state.currentId = t.id; showPage('workspace'); renderHistory(); renderMessages();

      }); list.append(btn);

    }

  }

  function showPage(page) {

    state.page = page;

    $('workspace-page').classList.toggle('hidden', page !== 'workspace');
    $('insights-page').classList.toggle('hidden', page !== 'insights');
    $('recommendations-page').classList.toggle('hidden', page !== 'recommendations');
    $('connections-page').classList.toggle('hidden', page !== 'connections');

    $('nav-workspace').classList.toggle('active', page === 'workspace');

    $('nav-insights').classList.toggle('active', page === 'insights');

    $('nav-recommendations').classList.toggle('active', page === 'recommendations');
    $('nav-connections').classList.toggle('active', page === 'connections');
    $('topbar-title').textContent = page === 'workspace' ? 'Workspace' : page === 'insights' ? 'Insights' : page === 'connections' ? 'Connect AI / platforms' : 'Recommendation Log';

    const visiblePage = $(`${page === 'workspace' ? 'workspace' : page}-page`);

    visiblePage.classList.remove('page-enter');

    requestAnimationFrame(() => visiblePage.classList.add('page-enter'));

    if (page === 'insights') renderInsights();
    if (page === 'connections') renderConnections();

  }

  function toast(message) {

    const target = $('toast'); target.textContent = message; target.classList.add('visible'); clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => target.classList.remove('visible'), 3000);

  }

  function setMode(mode) {

    if (state.busy || !['ask', 'agent'].includes(mode)) return;

    state.mode = mode;

    document.querySelectorAll('.work-mode').forEach(btn => { const active = btn.dataset.mode === mode; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active)); });

    $('composer-input').placeholder = mode === 'agent' ? 'Describe a task for your Agent…' : 'Ask a question or describe a task…';

    $('composer-hint').textContent = mode === 'agent' ? 'Agent can analyse CSV/TSV/TXT and create an action brief.' : 'Ask: direct AI answers · Agent: multi-step work';

  }

  function setEnvironment(env) {

    if (state.busy) return;

    if (env === 'live' && !state.liveStatus.liveEnabled) return toast('Live API requires a configured provider key. Demo is ready.');

    state.environment = env;

    document.querySelectorAll('.env-option').forEach(btn => btn.classList.toggle('active', btn.dataset.env === env));

    $('privacy-hint').textContent = env === 'demo' ? 'Demo outputs are illustrative, not AI-generated.' : 'Live provider calls may incur charges.';

  }

  function setBusy(flag) {

    state.busy = flag; $('send-button').disabled = flag; $('composer-input').disabled = flag;

    $('attach-button').disabled = flag; document.querySelectorAll('.work-mode,.env-option').forEach(el => el.disabled = flag || (el.dataset.env === 'live' && !state.liveStatus.liveEnabled));

    $('send-button').textContent = flag ? '·' : '↑';

  }

  function renderAttachment() {

    const target = $('file-tray'); target.replaceChildren(); target.classList.toggle('hidden', !state.attachment);

    if (!state.attachment) return;

    const chip = create('div', 'file-chip'); chip.append(create('span', '', '▤ ' + state.attachment.name));

    chip.append(create('span', 'file-size', (state.attachment.size / 1024).toFixed(1) + ' KB'));

    const remove = create('button', '', '×'); remove.type = 'button'; remove.title = 'Remove attachment';

    remove.addEventListener('click', () => { state.attachment = null; $('file-input').value = ''; renderAttachment(); });

    chip.append(remove); target.append(chip);

  }

  function attachFile(file) {

    if (!file) return;

    if (!/\.(csv|tsv|txt)$/i.test(file.name)) return toast('This version supports CSV, TSV and TXT files.');

    if (file.size > 80_000) return toast('Please choose a text file under 80 KB for this prototype.');

    state.attachment = file; renderAttachment(); toast('File ready to analyse.');

  }

  function applySuggestion(kind) {

    const item = EXAMPLES[kind]; if (!item || state.busy) return;

    setMode(item.mode); $('composer-input').value = item.prompt;

    if (item.sample) attachFile(new File([SAMPLE_CSV], 'campaign_data.csv', { type: 'text/csv' }));

    $('composer-input').focus();

  }

  function improvePrompt(prompt) {

    const trimmed = prompt.trim();

    if (/newsletter/i.test(trimmed)) return 'Write a 150-word friendly newsletter for regular customers about our new bread, with a clear Monday free-sample offer.';

    if (trimmed.length < 65) return `Please ${trimmed.replace(/[.!?]+$/, '')}, including the target audience, tone, format and desired length.`;

    return `Improve this task by making the audience, tone, format and success criteria explicit: ${trimmed}`;

  }

  function showPromptCoach(prompt, thread, userMessage) {

    state.promptCoach = { improved: improvePrompt(prompt), thread, userMessage };

    $('prompt-coach-text').textContent = `Add who it's for, the tone and the length. Try: "${state.promptCoach.improved}"`;

    $('prompt-coach').classList.remove('hidden');

  }

  function hidePromptCoach() {

    state.promptCoach = null;

    $('prompt-coach').classList.add('hidden');

  }

  function selectTask(taskId) {

    if (state.busy) return toast('Finish or cancel the running task first.');

    const task = TASK_EXAMPLES[taskId];

    if (!task) return;
    state.pendingSubmission = null;

    document.querySelectorAll('.rail-task').forEach(button => button.classList.toggle('active', button.dataset.task === taskId));

    state.currentId = null;

    renderHistory();

    renderMessages();

    document.querySelector('.workspace-heading h1').textContent = task.title;

    setMode(task.mode);

    $('composer-input').value = task.prompt;

    state.attachment = null;

    $('file-input').value = '';

    if (task.fileText) {

      state.attachment = new File([task.fileText], task.fileName, { type: 'text/csv' });

    }

    renderAttachment();

    hidePromptCoach();

    $('composer-input').focus();

  }



  function appendMessage(target, message) {

    const wrapper = create('article', 'message ' + message.role);

    wrapper.append(create('div', 'message-label', message.role === 'user' ? 'YOU' : 'AI WORKSPACE'));

    if (message.role === 'user') {

      wrapper.append(create('div', 'message-bubble', message.content));

      if (message.fileName) wrapper.append(create('div', 'message-attachments', '▤ ' + message.fileName));

    } else {

      if (message.error) wrapper.append(create('div', 'message-bubble', 'Request failed: ' + message.error));

      else {

        if (message.steps?.length) wrapper.append(agentCard(message.steps));

        wrapper.append(create('div', 'message-bubble', message.content));

        if (message.report) wrapper.append(reportCard(message.report));

      }

      const actions = create('div', 'message-details');

      const descriptor = message.mode === 'demo' ? 'DEMO · template / calculated tools' : `${MODEL_NAMES[message.providerId] || 'Live AI'} · LIVE`;

      actions.append(create('span', '', descriptor));

      if (message.mode === 'live') actions.append(create('span', '', humanCost(message.estimatedCostUsd)));

      const copy = create('button', 'copy-button', 'Copy'); copy.type = 'button'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(message.content); toast('Copied to clipboard.'); } catch { toast('Clipboard is unavailable.'); } }); actions.append(copy);

      if (message.routing) {

        const details = create('details'); details.className = 'message-routing';

        const summary = create('summary', '', 'Routing details'); const pre = create('pre', '', JSON.stringify({ selectedProvider: message.providerId, model: message.model, usage: message.usage, estimatedCostUsd: message.estimatedCostUsd, routing: message.routing }, null, 2));

        details.append(summary, pre); actions.append(details);

      }

      wrapper.append(actions);

    }

    target.append(wrapper);

  }

  function renderMessages() {

    const thread = currentThread(); const output = $('messages'); output.replaceChildren();

    const hasMessages = Boolean(thread?.messages?.length);

    $('welcome').classList.toggle('hidden', hasMessages);

    if (thread) for (const m of thread.messages) appendMessage(output, m);

    scrollToBottom();

  }

  function scrollToBottom() { const scroll = $('chat-scroll'); requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; }); }

  function pendingMessage(prompt, workMode, providerId) {
    const wrapper = create('article', 'message assistant pending-message'); wrapper.append(create('div', 'message-label', 'AI WORKSPACE'));
    const stateBox = create('div', 'status-inline'); stateBox.append(create('span', 'spinner'), create('span', '', workMode === 'agent' ? 'Planning and executing task' : 'AI is thinking'), create('span', 'thinking-dots', '…'));
    wrapper.append(stateBox);
    const ranked = providerId === 'auto' ? rankedModels(prompt, state.goal) : [{ id: providerId, score: 0, type: promptRoutingType(prompt) }];
    const selected = ranked[0];
    const choice = create('div', 'pending-routing');
    choice.append(create('span', '', providerId === 'auto' ? 'AUTO MODEL' : 'SELECTED MODEL'));
    choice.append(create('strong', '', MODEL_NAMES[selected.id] || selected.id));
    choice.append(create('small', '', providerId === 'auto' ? `Best illustrative match for this ${selected.type} task` : 'Manual model selection'));
    if (state.environment === 'demo') choice.append(create('small', '', 'Demo simulation · no provider connection or API call'));
    wrapper.append(choice);

    if (workMode === 'agent') {

      const cancel = create('button', 'link-button', 'Cancel task'); cancel.type = 'button';

      cancel.addEventListener('click', () => state.controller?.abort()); wrapper.append(cancel);

    }

    $('messages').append(wrapper); scrollToBottom(); return wrapper;
  }

  function waitForDemoThinking(environment, signal) {
    if (environment !== 'demo') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 900);
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    });
  }

  function agentCard(steps) {

    const box = create('section', 'agent-card'); const head = create('div', 'agent-card-header');

    head.append(create('strong', '', 'Agent task'), create('span', 'message-label', 'COMPLETED')); box.append(head);

    const list = create('ol', 'step-list');

    for (const step of steps) {

      const li = create('li'); li.append(create('span', 'step-symbol done', '✓'));

      const text = create('div'); text.append(create('strong', '', step.name), create('small', '', step.detail)); li.append(text); list.append(li);

    }

    box.append(list);

    const footer = create('div', 'agent-card-footer'); footer.append(create('span', '', `${steps.length} tool / planning steps recorded`)); box.append(footer);

    return box;

  }

  function reportCard(report) {

    const card = create('section', 'report-card'); const header = create('div', 'report-card-header');

    header.append(create('h3', '', '▤ ' + report.title)); card.append(header);

    card.append(create('p', '', 'A reusable action brief generated from your task and the available data.'));

    const actions = create('div', 'report-buttons');

    const download = create('button', '', '↓ Download PDF'); download.type = 'button'; download.addEventListener('click', () => downloadPdf(report));

    const preview = create('button', '', 'Preview report'); preview.type = 'button';

    actions.append(download, preview); card.append(actions);

    const panel = create('div', 'report-preview hidden'); panel.innerHTML = reportHtml(report, false);

    preview.addEventListener('click', () => { const visible = panel.classList.toggle('hidden'); preview.textContent = visible ? 'Preview report' : 'Hide preview'; });

    card.append(panel); return card;

  }

  function reportHtml(report, complete = true) {

    const header = `<h1>${safe(report.title)}</h1><p><b>Objective:</b> ${safe(report.objective)}</p><h2>Observations</h2><ul>${(report.observations || []).map(x => `<li>${safe(x)}</li>`).join('')}</ul>`;

    const analysis = report.analysis;

    const audit = report.audit;

    const auditSection = audit ? `<h2>AI audit snapshot</h2><p><b>Current monthly spend:</b> ${safe(audit.currentMonthlySpend)} · <b>Recommended:</b> ${safe(audit.recommendedMonthlySpend)} · <b>Potential monthly saving:</b> ${safe(audit.potentialMonthlySaving)}</p><p><b>Estimated monthly time recovered:</b> ${safe(audit.timeRecovered)} · <b>Adoption baseline:</b> ${safe(audit.adoptionBaseline)}</p><h3>KPI scorecard</h3><table><thead><tr><th>Metric</th><th>Baseline</th><th>Target</th><th>Day 30</th><th>Day 90</th></tr></thead><tbody>${audit.scorecard.map(x => `<tr><td>${safe(x.metric)}</td><td>${safe(x.baseline)}</td><td>${safe(x.target)}</td><td>${safe(x.day30)}</td><td>${safe(x.day90)}</td></tr>`).join('')}</tbody></table><h3>Recommended tools</h3><ul>${audit.recommendations.map(x => `<li><b>${safe(x.process)}</b> — ${safe(x.tool)}: ${safe(x.reason)}</li>`).join('')}</ul><h3>Five-minute lessons</h3><ol>${audit.lessons.map(x => `<li><b>${safe(x.tool)}</b>: ${safe(x.lesson)} <i>(human check: ${safe(x.humanCheck)})</i></li>`).join('')}</ol><h3>ROI checkpoints</h3><ul><li>30 days: ${safe(audit.checkpoints[0])}</li><li>90 days: ${safe(audit.checkpoints[1])}</li></ul><h3>Risk controls</h3><ul>${audit.risks.map(x => `<li><b>${safe(x.risk)}</b> — ${safe(x.control)}</li>`).join('')}</ul>` : '';

    const table = analysis ? `<h2>Campaign metrics</h2><p>${analysis.rowsRead} source rows. Currency values as provided, assumed GBP for this UK demo.</p><table><thead><tr><th>Channel</th>${[...analysis.metrics, ...(analysis.total.cpl !== undefined ? ['cpl'] : []), ...(analysis.total.roas !== undefined ? ['roas'] : [])].map(x => `<th>${safe(x.toUpperCase())}</th>`).join('')}</tr></thead><tbody>${analysis.channels.map(row => `<tr><td>${safe(row.channel)}</td>${[...analysis.metrics, ...(analysis.total.cpl !== undefined ? ['cpl'] : []), ...(analysis.total.roas !== undefined ? ['roas'] : [])].map(key => `<td>${safe(row[key] ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';

    const plan = `<h2>Action plan</h2><ol>${(report.plan || []).map(p => `<li><b>${safe(p.period)}</b> — ${safe(p.action)} <i>(${safe(p.measure)})</i></li>`).join('')}</ol>`;

    const advice = report.aiAdvice ? `<h2>AI recommendations</h2><p>${safe(report.aiAdvice).replace(/\n/g, '<br>')}</p>` : '';

    const foot = `<p class="report-disclaimer">${safe(report.disclaimer || '')}</p>`;

    return header + auditSection + table + plan + advice + foot;

  }



  // Dependency-free PDF writer. It produces real, selectable-text PDF pages for

  // the English student demo; no third-party upload or PDF service is involved.

  function pdfForReport(report) {

    const raw = [report.title, '', 'Objective: ' + report.objective, '', 'OBSERVATIONS', ...(report.observations || []).map(x => '- ' + x), '', 'CAMPAIGN METRICS'];

    if (report.analysis) {

      raw.push('Source: ' + report.analysis.filename, 'Rows analysed: ' + report.analysis.rowsRead);

      for (const c of report.analysis.channels) raw.push(`${c.channel}: ` + report.analysis.metrics.map(k => `${k} ${c[k]}`).join(' | ') + (c.cpl != null ? ` | CPL ${c.cpl}` : ''));

    } else raw.push('No numeric dataset attached.');

    raw.push('', 'WEEKLY ACTION PLAN');

    for (const p of (report.plan || [])) raw.push(`${p.period}: ${p.action}`, 'Measure: ' + p.measure, '');

    if (report.aiAdvice) raw.push('AI RECOMMENDATIONS', ...report.aiAdvice.split('\n'));

    raw.push('', report.disclaimer || '');

    const lines = [];

    for (let item of raw) {

      item = String(item).normalize('NFKD').replace(/[^\x20-\x7e]/g, '?');

      if (!item) { lines.push(''); continue; }

      while (item.length > 94) { let idx = item.lastIndexOf(' ', 94); if (idx < 25) idx = 94; lines.push(item.slice(0, idx)); item = item.slice(idx).trimStart(); }

      lines.push(item);

    }

    const pages = [];

    while (lines.length) pages.push(lines.splice(0, 56));

    const objects = ['']; const put = body => { objects.push(body); return objects.length - 1; };

    const root = put(''); const pagesRoot = put(''); const font = put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const pageRefs = [];

    for (const pageLines of pages) {

      const escapePdf = str => str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

      const content = ['BT', '/F1 11 Tf', '45 798 Td', '14 TL', ...pageLines.map((line, i) => `(${escapePdf(line)}) Tj${i < pageLines.length - 1 ? ' T*' : ''}`), 'ET'].join('\n');

      const contentId = put(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

      const pageId = put(`<< /Type /Page /Parent ${pagesRoot} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentId} 0 R >>`);

      pageRefs.push(pageId);

    }

    objects[pagesRoot] = `<< /Type /Pages /Kids [${pageRefs.map(id => `${id} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`;

    objects[root] = `<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`;

    let pdf = '%PDF-1.4\n'; const offsets = [0];

    objects.slice(1).forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });

    const xrefStart = pdf.length;

    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

    for (const off of offsets.slice(1)) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;

    pdf += `trailer\n<< /Size ${objects.length} /Root ${root} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });

  }

  function downloadPdf(report) {

    const blob = pdfForReport(report); const url = URL.createObjectURL(blob);

    const link = create('a'); link.href = url; link.download = 'SME_Marketing_Action_Brief.pdf'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 20_000);

  }



  function recordUsage(result, task, workMode) {

    const event = { id: uid(), mode: result.mode, task: task.slice(0, 70), kind: workMode, providerId: result.providerId, model: result.model, usage: result.usage, cost: result.estimatedCostUsd, at: new Date().toISOString() };

    usage.unshift(event); if (usage.length > 100) usage.length = 100;

  }

  async function executeSubmission(submission) {
    const { prompt, attachment, workMode, env, thread } = submission;
    $('composer-input').value = '';
    setBusy(true); const pending = pendingMessage(prompt, workMode, $('model-select').value);
    const abort = new AbortController(); state.controller = abort;
    try {
      const fileText = attachment ? await attachment.text() : '';
      if (abort.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      await waitForDemoThinking(env, abort.signal);
      let path, body;

      if (workMode === 'agent') {

        path = '/api/agent';

        body = { mode: env, goal: state.goal, providerId: $('model-select').value, prompt, filename: attachment?.name || '', fileText };

      } else {

        path = '/api/chat';

        const messages = thread.messages.filter(m => ['assistant', 'user'].includes(m.role) && !m.error).slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 4300) }));

        if (fileText) messages[messages.length - 1].content = `${prompt}\n\nAttached file (${attachment.name}):\n${fileText.slice(0, 3500)}`;

        body = { mode: env, goal: state.goal, providerId: $('model-select').value, messages };

      }

      const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: abort.signal });

      let result; try { result = await response.json(); } catch { throw new Error('The gateway returned an unreadable response.'); }

      if (!response.ok) throw new Error(result.error || `Request failed (HTTP ${response.status}).`);

      const assistant = { id: uid(), role: 'assistant', content: result.output, mode: result.mode, providerId: result.providerId, model: result.model, usage: result.usage, estimatedCostUsd: result.estimatedCostUsd, routing: result.routing, report: result.report || null, steps: result.steps || null };

      thread.messages.push(assistant); recordUsage(result, prompt, workMode);

      persist(); renderHistory(); renderMessages();

    } catch (error) {

      pending.remove();

      const aborted = error?.name === 'AbortError';

      thread.messages.push({ id: uid(), role: 'assistant', mode: env, error: aborted ? 'Stopped waiting for the response. A live provider call may still be charged.' : error.message, content: '' });

      persist(); renderMessages();

    } finally { state.controller = null; setBusy(false); $('composer-input').focus(); }
  }

  async function submit(event) {
    event?.preventDefault();
    if (state.busy || state.promptCoach || state.pendingSubmission) return;
    const prompt = $('composer-input').value.trim();
    if (!prompt) return toast('Type a question or task first.');
    if (prompt.length > 3000) return toast('Please shorten your task description.');
    const attachment = state.attachment, workMode = state.mode, env = state.environment;
    const thread = ensureThread(prompt);
    const userMessage = { id: uid(), role: 'user', content: prompt, fileName: attachment?.name || null };
    thread.messages.push(userMessage); persist(); renderHistory(); renderMessages();
    state.pendingSubmission = { prompt, attachment, workMode, env, thread };
    showPromptCoach(prompt, thread, userMessage);
    $('composer-input').value = ''; state.attachment = null; $('file-input').value = ''; renderAttachment();
  }



  async function checkStatus() {

    try {

      const response = await fetch('/api/status', { cache: 'no-store' }); if (!response.ok) throw new Error('Connection unavailable');

      const data = await response.json(); state.liveStatus = { liveEnabled: Boolean(data.liveEnabled), providers: Array.isArray(data.providers) ? data.providers : [] };

      $('connection-state').textContent = state.liveStatus.liveEnabled ? `${data.providers.length} provider(s) ready` : 'Demo ready';

      $('settings-api-status').textContent = state.liveStatus.liveEnabled ? `${data.providers.map(p => p.provider).join(', ')} connected. Live calls may incur charges.` : 'No live provider configured. Demo remains available.';

    } catch { $('connection-state').textContent = 'Offline demo'; $('settings-api-status').textContent = 'Gateway status unavailable.'; }

    document.querySelector('[data-env="live"]').disabled = !state.liveStatus.liveEnabled;

  }

  function updateEsgPeriod(period) {
    const weekly = period === 'weekly';
    const values = weekly ? [82, 67, 74, 91] : [78, 54, 28, 70, 63, 46, 58];
    const names = weekly ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chart = $('esg-bars'); chart.replaceChildren();
    values.forEach((value, index) => {
      const column = create('div');
      const bar = create('i'); bar.style.height = `${value}%`;
      column.append(bar, create('span', '', names[index])); chart.append(column);
    });
    $('esg-chart-label').textContent = weekly ? 'Energy by week' : 'Energy by day';
    chart.setAttribute('aria-label', weekly ? 'Energy usage by week' : 'Energy usage by day');
  }

  function promptRoutingType(prompt) {
    const text = prompt.toLowerCase();
    if (/write|rewrite|post|caption|copy|headline|blog|email|script|content|advert|linkedin/.test(text)) return 'writing';
    if (/analys|metric|conversion|kpi|data|spreadsheet|trend|dashboard|forecast|revenue|lead quality|statistics/.test(text)) return 'analysis';
    if (/research|competitor|market|summari|survey|industry|customer interview|explore/.test(text)) return 'research';
    return 'strategy';
  }

  function rankedModels(prompt, goal) {
    const weights = ROUTING_WEIGHTS[goal] || ROUTING_WEIGHTS.balanced;
    const type = ['writing', 'analysis', 'research', 'strategy'].includes(prompt) ? prompt : promptRoutingType(prompt);
    return Object.entries(ROUTING_PROFILES).map(([id, profile]) => ({
      id,
      type,
      score: weights.fit * profile.fit[type] + weights.quality * profile.quality + weights.cost * profile.cost + weights.speed * profile.speed
    })).sort((a, b) => b.score - a.score);
  }

  function renderConnections() {
    const list = $('connection-list'); list.replaceChildren();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'graph-lines');
    for (const [id, , , x, y] of CONNECTIONS) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '50'); line.setAttribute('y1', '50'); line.setAttribute('x2', String(x)); line.setAttribute('y2', String(y));
      line.classList.toggle('connected', Boolean(connections[id])); svg.append(line);
    }
    list.append(svg);
    const centre = create('div', 'graph-centre'); centre.append(create('strong', '', 'AI Audit'), create('small', '', 'Demo workspace')); list.append(centre);
    for (const [id, name, type, x, y] of CONNECTIONS) {
      const item = create('div', 'graph-node' + (connections[id] ? ' connected' : ''));
      item.style.left = `${x}%`; item.style.top = `${y}%`;
const button = create('button', 'connection-button' + (connections[id] ? ' connected' : ''), connections[id] ? 'Demo active' : 'Use in demo');
      button.type = 'button'; button.dataset.connection = id; button.setAttribute('aria-pressed', String(Boolean(connections[id])));
      item.append(create('strong', '', name), create('small', '', `${type} · demo`), button); list.append(item);
    }
    list.append(create('p', 'graph-note', 'Demo graph only — no accounts or usage data are connected.'));
  }

  function renderInsights() {

    const selected = usage.filter(x => x.mode === state.scope);

    const old = legacy.filter(x => x.mode === state.scope).map(x => ({ task: x.task, mode: 'legacy-demo', providerId: x.modelId, usage: null, cost: null, at: x.at }));

    const list = state.scope === 'demo' ? [...selected, ...old] : selected;

    const liveWithUsage = selected.filter(x => x.usage && Number.isFinite(x.usage.inputTokens) && Number.isFinite(x.usage.outputTokens));

    const tokens = liveWithUsage.reduce((s, x) => s + x.usage.inputTokens + x.usage.outputTokens, 0);

    const priced = selected.filter(x => Number.isFinite(x.cost));

    $('stat-count').textContent = String(list.length);

    $('stat-tokens').textContent = state.scope === 'demo' ? '7' : (!liveWithUsage.length ? 'N/A' : tokens.toLocaleString());

    $('stat-tokens-note').textContent = state.scope === 'demo' ? 'this week' : 'Provider-reported tokens only';

    $('stat-cost').textContent = state.scope === 'demo' || !priced.length ? 'N/A' : humanCost(priced.reduce((s, x) => s + x.cost, 0));

    const grouped = Object.keys(MODEL_NAMES).map(id => ({ id, count: list.filter(x => x.providerId === id).length }));

    const max = Math.max(1, ...grouped.map(x => x.count));

    const bars = $('provider-bars'); bars.replaceChildren();

    for (const g of grouped) {

      const line = create('div', 'provider-bar'); line.append(create('span', '', MODEL_NAMES[g.id]));

      const track = create('div', 'bar-track'); const fill = create('div', 'bar-fill'); fill.style.width = 100 * g.count / max + '%'; track.append(fill);

      line.append(track, create('strong', '', String(g.count))); bars.append(line);

    }

    const table = $('activity-rows'); table.replaceChildren();

    if (!list.length) { const row = create('tr'); const cell = create('td', '', 'No tasks recorded in this view.'); cell.colSpan = 5; row.append(cell); table.append(row); }

    for (const x of list.slice(0, 25)) {

      const row = create('tr'); const cells = [x.task || 'Task', x.mode === 'legacy-demo' ? 'Legacy demo' : x.mode.toUpperCase(), MODEL_NAMES[x.providerId] || 'Tools only', x.mode === 'live' && x.usage ? `${x.usage.inputTokens ?? 'N/A'} / ${x.usage.outputTokens ?? 'N/A'}` : 'N/A', x.mode === 'live' ? humanCost(x.cost) : 'Not billed'];

      for (const c of cells) row.append(create('td', '', c)); table.append(row);

    }
  }



  function renderAdapter() {

    const key = state.adapter, prompt = $('adapter-prompt').value.trim() || 'Write a short marketing announcement.';

    const models = { gpt: 'gpt-4.1-mini', claude: 'claude-sonnet-4-5', gemini: 'gemini-2.5-flash', deepseek: 'deepseek-chat' };

    const model = models[key]; let endpoint, headers, body;

    if (key === 'gpt' || key === 'deepseek') {

      endpoint = key === 'gpt' ? 'POST /v1/chat/completions' : 'POST /chat/completions';

      headers = { Authorization: 'Bearer [SERVER SECRET]', 'Content-Type': 'application/json' };

      body = { model, messages: [{ role: 'system', content: 'Practical SME advice.' }, { role: 'user', content: prompt }], stream: false };

      body[key === 'gpt' ? 'max_completion_tokens' : 'max_tokens'] = 512;

    } else if (key === 'claude') {

      endpoint = 'POST /v1/messages'; headers = { 'x-api-key': '[SERVER SECRET]', 'anthropic-version': '2023-06-01' };

      body = { model, max_tokens: 512, system: 'Practical SME advice.', messages: [{ role: 'user', content: prompt }] };

    } else {

      endpoint = `POST /v1beta/models/${model}:generateContent`; headers = { 'x-goog-api-key': '[SERVER SECRET]' };

      body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 512 } };

    }

    $('adapter-input').textContent = JSON.stringify({ prompt, goal: state.goal, providerId: 'auto' }, null, 2);

    $('adapter-request').textContent = JSON.stringify({ endpoint, headers, body }, null, 2);

    $('adapter-request-label').textContent = '02 · ' + MODEL_NAMES[key].toUpperCase() + ' REQUEST';

    $('adapter-output').textContent = JSON.stringify({ providerId: key, model, output: '[provider response]', usage: { inputTokens: '[reported]', outputTokens: '[reported]' }, estimatedCostUsd: null }, null, 2);

    document.querySelectorAll('.adapter-option').forEach(btn => btn.classList.toggle('active', btn.dataset.provider === key));

  }

  function openModal(id) { $(id).showModal(); if (id === 'adapter-dialog') renderAdapter(); }

  function initialise() {

    $('new-chat').addEventListener('click', newChat);

    document.querySelectorAll('.rail-task').forEach(button => button.addEventListener('click', () => selectTask(button.dataset.task)));

    $('nav-workspace').addEventListener('click', () => showPage('workspace'));

    $('nav-insights').addEventListener('click', () => showPage('insights'));
    $('nav-recommendations').addEventListener('click', () => showPage('recommendations'));
    $('nav-connections').addEventListener('click', () => showPage('connections'));

    $('insights-recommendations-link').addEventListener('click', e => { e.preventDefault(); showPage('recommendations'); });

    $('nav-adapter').addEventListener('click', () => openModal('adapter-dialog'));

    $('inspect-from-insights').addEventListener('click', () => openModal('adapter-dialog'));

    $('open-about').addEventListener('click', () => openModal('about-dialog'));

    $('open-settings').addEventListener('click', () => openModal('settings-dialog'));

    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => $(btn.dataset.close).close()));

    document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }));

    document.querySelectorAll('[data-suggestion]').forEach(btn => btn.addEventListener('click', () => applySuggestion(btn.dataset.suggestion)));

    document.querySelectorAll('.work-mode').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

    document.querySelectorAll('.env-option').forEach(btn => btn.addEventListener('click', () => setEnvironment(btn.dataset.env)));

    document.querySelectorAll('.source-choice').forEach(btn => btn.addEventListener('click', () => { state.scope = btn.dataset.scope; document.querySelectorAll('.source-choice').forEach(el => el.classList.toggle('active', el === btn)); renderInsights(); }));

    document.querySelectorAll('.adapter-option').forEach(btn => btn.addEventListener('click', () => { state.adapter = btn.dataset.provider; renderAdapter(); }));

    $('adapter-prompt').addEventListener('input', renderAdapter);

    $('goal-select').addEventListener('change', e => { state.goal = e.target.value; toast('Routing preference updated.'); });

    $('model-select').addEventListener('change', e => { state.provider = e.target.value; });
    $('esg-period').addEventListener('change', e => updateEsgPeriod(e.target.value));
    $('task-select').addEventListener('change', e => {
      const task = TASK_EXAMPLES[e.target.value];
      if (!task || state.busy) return;
      document.querySelector('.workspace-heading h1').textContent = task.title;
      toast(`Viewing ${task.title} demo data.`);
    });
    $('connection-list').addEventListener('click', e => {
      const button = e.target.closest('[data-connection]');
      if (!button) return;
      const id = button.dataset.connection;
      connections[id] = !connections[id];
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
      renderConnections();
toast(connections[id] ? 'Demo platform enabled locally. No account was connected.' : 'Demo platform disabled locally.');
    });

    $('attach-button').addEventListener('click', () => $('file-input').click());

    $('file-input').addEventListener('change', e => attachFile(e.target.files?.[0]));

    $('composer-form').addEventListener('submit', submit);

    $('prompt-accept').addEventListener('click', () => {

      const coach = state.promptCoach;

      if (!coach) return;

      coach.userMessage.content = coach.improved;
      $('composer-input').value = coach.improved;
      const submission = state.pendingSubmission;
      if (submission) submission.prompt = coach.improved;
      persist(); renderMessages(); hidePromptCoach();
      state.pendingSubmission = null;
      if (submission) void executeSubmission(submission);

    });

    $('prompt-dismiss').addEventListener('click', () => {
      const submission = state.pendingSubmission;
      hidePromptCoach();
      state.pendingSubmission = null;
      if (submission) void executeSubmission(submission);
    });

    $('composer-input').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('composer-form').requestSubmit(); } });

    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); newChat(); } });

    $('clear-history').addEventListener('click', () => { if (!confirm('Clear this browser’s new chat history and usage records? Earlier legacy records will remain.')) return; threads.length = 0; usage.length = 0; state.currentId = null; persist(); $('settings-dialog').close(); renderHistory(); renderMessages(); renderInsights(); toast('Local conversations cleared.'); });

    $('load-demo-data').addEventListener('click', loadDemoWorkspace);

    renderHistory(); renderMessages(); renderInsights(); updateEsgPeriod('daily'); checkStatus();

  }

  initialise();

})();
