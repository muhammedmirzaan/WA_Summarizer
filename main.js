  /* ══════════════════════════════════════
     MODEL CATALOG  (OpenRouter model IDs)
     cost: free | cheap | mid | pricey
     price: shown in UI, per ~1K tokens input
  ══════════════════════════════════════ */
  const MODELS = {
    claude: [
      { id: 'anthropic/claude-haiku-4-5',   label: 'Claude Haiku 4.5',   cost: 'cheap',  price: '~$0.001/1K' },
      { id: 'anthropic/claude-sonnet-4-5',  label: 'Claude Sonnet 4.5',  cost: 'mid',    price: '~$0.003/1K' },
      { id: 'anthropic/claude-opus-4',      label: 'Claude Opus 4',      cost: 'pricey', price: '~$0.015/1K' },
    ],
    openai: [
      { id: 'openai/gpt-4o-mini',  label: 'GPT-4o Mini',  cost: 'cheap',  price: '~$0.00015/1K' },
      { id: 'openai/gpt-4o',       label: 'GPT-4o',       cost: 'mid',    price: '~$0.005/1K'   },
      { id: 'openai/o3-mini',      label: 'o3 Mini',      cost: 'mid',    price: '~$0.0011/1K'  },
    ],
    oss: [
      { id: 'qwen/qwen3.6-plus:free',                label: 'Qwen 3.6 Plus',     cost: 'free',  price: 'FREE'},
      { id: 'meta-llama/llama-3.2-3b-instruct:free', label: 'LLaMA 3.2 3B',cost: 'free',  price: 'FREE'},
      { id: 'openai/gpt-oss-20b:free',               label: 'GPT-OSS 20B',        cost: 'free',  price: 'FREE'},
      { id: 'openai/gpt-oss-120b:free',              label: 'GPT-OSS 120B',       cost: 'free',  price: 'FREE'},
      { id: 'google/gemma-3n-e2b-it:free',           label: 'Gemma 3n',           cost: 'free',  price: 'FREE'},
      { id: 'google/gemma-3n-e4b-it:free',           label: 'Gemma 3n-e4b',       cost: 'free',  price: 'FREE'},
      { id: 'google/gemma-3-4b-it:free',             label: 'Gemma 3 4B',         cost: 'free',  price: 'FREE'},
      { id: 'google/gemma-3-12b-it:free',            label: 'Gemma 3 12B',        cost: 'free',  price: 'FREE'},
      { id: 'google/gemma-3-27b-it:free',            label: 'Gemma 3 27B',        cost: 'free',  price: 'FREE'}
    ],
  };

  const CHAR_LIMIT_DEFAULT = 40000;

  /* ── Elements ── */
  const fileInput        = document.getElementById('fileInput');
  const uploadZone       = document.getElementById('uploadZone');
  const filePill         = document.getElementById('filePill');
  const fileNameEl       = document.getElementById('fileName');
  const removeFileBtn    = document.getElementById('removeFile');
  const summarizeBtn     = document.getElementById('summarizeBtn');
  const clearBtn         = document.getElementById('clearBtn');
  const outputText       = document.getElementById('outputText');
  const outputLabel      = document.getElementById('outputLabel');
  const outputModelTag   = document.getElementById('outputModelTag');
  const statsEl          = document.getElementById('stats');
  const apiKeyInput      = document.getElementById('apiKeyInput');
  const toggleKey        = document.getElementById('toggleKey');
  const keyDot           = document.getElementById('keyDot');
  const noKeyNotice      = document.getElementById('noKeyNotice');
  const modelSelect      = document.getElementById('modelSelect');
  const costPill         = document.getElementById('costPill');
  const providerTabs     = document.getElementById('providerTabs');
  const orInfo           = document.getElementById('orInfo');
  const dateFromInput    = document.getElementById('dateFromInput');
  const dateToInput      = document.getElementById('dateToInput');
  const charLimitInput   = document.getElementById('charLimit');
  const charLimitDisplay = document.getElementById('charLimitDisplay');
  const charLimitInfo    = document.getElementById('charLimitInfo');

  let currentProvider = 'oss';
  let charLimitValue  = CHAR_LIMIT_DEFAULT;

  /* ── Provider tabs ── */
  providerTabs.addEventListener('click', e => {
    const tab = e.target.closest('.provider-tab');
    if (!tab) return;
    document.querySelectorAll('.provider-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentProvider = tab.dataset.provider;
    populateModels();
  });

  function populateModels() {
    const list = MODELS[currentProvider];
    modelSelect.innerHTML = '';
    list.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.label}  (${m.price})`;
      modelSelect.appendChild(opt);
    });
    updateCostPill();
  }

  modelSelect.addEventListener('change', updateCostPill);

  function updateCostPill() {
    const list = MODELS[currentProvider];
    const found = list.find(m => m.id === modelSelect.value) || list[0];
    costPill.textContent = found.price;
    costPill.className = `cost-pill ${found.cost}`;
  }

  populateModels(); // init

  /* ── API Key ── */
  apiKeyInput.addEventListener('input', updateKeyState);

  function updateKeyState() {
    const hasKey = apiKeyInput.value.trim().length > 10;
    keyDot.classList.toggle('active', hasKey);
    keyDot.title = hasKey ? 'Key set ✓' : 'No key';
    noKeyNotice.classList.toggle('show', !hasKey);
    orInfo.style.display = hasKey ? 'none' : '';
    summarizeBtn.textContent = hasKey ? 'Summarize' : 'Clean Only';
  }
  updateKeyState();

  toggleKey.addEventListener('click', () => {
    const hidden = apiKeyInput.type === 'password';
    apiKeyInput.type = hidden ? 'text' : 'password';
    toggleKey.textContent = hidden ? '🙈' : '👁';
  });

  /* ── Character limit ── */
  charLimitInput.addEventListener('input', () => {
    charLimitValue = parseInt(charLimitInput.value);
    charLimitDisplay.textContent = charLimitValue.toLocaleString();
    charLimitInfo.textContent = `Max ${(charLimitValue / 1000).toFixed(1)}K characters`;
  });
  charLimitInput.dispatchEvent(new Event('input')); // init display

  /* ── File handling ── */
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) showFile(fileInput.files[0]);
  });

  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.txt')) showFile(file);
    else outputText.textContent = '⚠️ Please drop a .txt file.';
  });

  function showFile(file) {
    fileNameEl.textContent = file.name;
    filePill.classList.add('show');
    uploadZone.style.display = 'none';
  }

  removeFileBtn.addEventListener('click', resetFile);
  function resetFile() {
    fileInput.value = '';
    filePill.classList.remove('show');
    uploadZone.style.display = '';
  }

  /* ── Date & Message Filtering ── */
  function parseWhatsAppDate(dateStr) {
    // Matches formats like: [6/4/2026, 10:30:45 AM] or [6/4/26, 10:30 AM] or similar
    const match = dateStr.match(/\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!match) return null;
    let [, day, month, year] = match;
    year = parseInt(year);
    // Handle 2-digit years
    if (year < 100) year += year > 50 ? 1900 : 2000;
    return new Date(year, parseInt(month) - 1, parseInt(day));
  }

  function filterMessagesByDateRange(lines, fromStr, toStr) {
    let fromDate = null, toDate = null;
    
    if (fromStr.trim()) {
      const parts = fromStr.trim().split('/');
      if (parts.length === 3) {
        fromDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    
    if (toStr.trim()) {
      const parts = toStr.trim().split('/');
      if (parts.length === 3) {
        toDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        toDate.setHours(23, 59, 59, 999); // Include entire day
      }
    }

    return lines.filter(line => {
      const msgDate = parseWhatsAppDate(line);
      if (!msgDate) return true; // Keep lines without dates (like continuation messages)
      if (fromDate && msgDate < fromDate) return false;
      if (toDate && msgDate > toDate) return false;
      return true;
    });
  }

  /* ── Main action ── */
  summarizeBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) { outputText.textContent = '⚠️ Upload a .txt file first.'; return; }

    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      const raw = target.result;
      const lines = raw.split('\n');
      
      // Apply date filtering
      let filtered = filterMessagesByDateRange(lines, dateFromInput.value, dateToInput.value);
      
      // Remove media lines and empty lines
      const cleaned = filtered.filter(l =>
        !/<media omitted>/i.test(l) && l.trim() !== ''
      );
      const removed = lines.length - cleaned.length;
      let text = cleaned.join('\n');
      
      // Apply character limit
      if (text.length > charLimitValue) text = text.slice(0, charLimitValue);

      const key = apiKeyInput.value.trim();

      /* Clean-only mode */
      if (!key) {
        outputText.textContent = text || '(Nothing left after cleaning)';
        outputLabel.textContent = 'Cleaned Chat';
        outputModelTag.style.display = 'none';
        statsEl.textContent = `${cleaned.length} lines kept · ${removed} media lines removed`;
        statsEl.style.display = 'block';
        clearBtn.style.display = 'inline-block';
        return;
      }

      /* AI summary via OpenRouter */
      const modelList = MODELS[currentProvider];
      const modelMeta = modelList.find(m => m.id === modelSelect.value) || modelList[0];

      summarizeBtn.disabled = true;
      summarizeBtn.innerHTML = '<div class="spinner"></div> Summarizing…';
      clearBtn.style.display = 'none';
      outputLabel.textContent = 'Summary';
      outputModelTag.style.display = 'none';
      outputText.textContent = `Sending to ${modelMeta.label}…`;

      try {
        let res;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`,
              'HTTP-Referer': window.location.href,
              'X-Title': 'WA Summarizer',
            },
            body: JSON.stringify({
              model: modelSelect.value,
              max_tokens: 1024,
              messages: [{
                role: 'user',
                content: `Summarize this WhatsApp chat. Cover: main topics discussed, decisions or plans made, and overall tone. Be concise and clear.\n\n---\n${text}`
              }]
            })
          });

          // If we got a 429, wait and retry
          if (res.status === 429 && retries < maxRetries - 1) {
            const waitTime = Math.pow(2, retries) * 2000; // 2s, 4s, 8s
            outputText.textContent = `⏳ Rate limited. Retrying in ${waitTime / 1000}s... (Attempt ${retries + 1}/${maxRetries})`;
            retries++;
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }

          break; // Success or non-retryable error
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error?.message || `HTTP ${res.status}`;
          if (res.status === 401) outputText.textContent = `❌ Invalid OpenRouter key.\n\n${msg}`;
          else if (res.status === 402) outputText.textContent = `❌ No credits left on your OpenRouter account.\nTop up at openrouter.ai/credits\n\n${msg}`;
          else if (res.status === 429) outputText.textContent = `❌ Rate limited. All retry attempts exhausted. Please wait before trying again.\n\n${msg}`;
          else outputText.textContent = `❌ Error: ${msg}`;
          return;
        }

        const data = await res.json();
        const result = data?.choices?.[0]?.message?.content || 'No response.';
        const usage  = data?.usage;

        outputText.textContent = result;
        outputModelTag.textContent = modelMeta.label;
        outputModelTag.style.display = 'block';

        let statLine = `${cleaned.length} lines · model: ${modelMeta.label}`;
        if (usage) statLine += ` · ${usage.prompt_tokens} in / ${usage.completion_tokens} out tokens`;
        statsEl.textContent = statLine;
        statsEl.style.display = 'block';
        clearBtn.style.display = 'inline-block';

      } catch (err) {
        outputText.textContent = `❌ Network error.\n\n${err.message}`;
      } finally {
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'Summarize';
      }
    };

    reader.onerror = () => { outputText.textContent = '❌ Error reading file.'; };
    reader.readAsText(file);
  });

  /* ── Clear ── */
  clearBtn.addEventListener('click', () => {
    resetFile();
    dateFromInput.value = '';
    dateToInput.value = '';
    outputText.textContent = 'Your summary will appear here…';
    outputLabel.textContent = 'Output';
    outputModelTag.style.display = 'none';
    statsEl.style.display = 'none';
    clearBtn.style.display = 'none';
    updateKeyState();
  });
