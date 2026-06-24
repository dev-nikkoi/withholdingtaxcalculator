const taxTables = {
  daily: {
    label: 'Daily',
    rows: [
      { max: 685, base: 0, over: 0, rate: 0, range: '₱685 and below' },
      { max: 1095, base: 0, over: 685, rate: 0.15, range: '₱685 – ₱1,095' },
      { max: 2191, base: 61.65, over: 1096, rate: 0.20, range: '₱1,096 – ₱2,191' },
      { max: 5478, base: 280.85, over: 2192, rate: 0.25, range: '₱2,192 – ₱5,478' },
      { max: 21917, base: 1102.60, over: 5479, rate: 0.30, range: '₱5,479 – ₱21,917' },
      { max: Infinity, base: 6034.00, over: 21918, rate: 0.35, range: '₱21,918 and above' },
    ],
  },
  weekly: {
    label: 'Weekly',
    rows: [
      { max: 4808, base: 0, over: 0, rate: 0, range: '₱4,808 and below' },
      { max: 7691, base: 0, over: 4808, rate: 0.15, range: '₱4,808 – ₱7,691' },
      { max: 15384, base: 432.60, over: 7692, rate: 0.20, range: '₱7,692 – ₱15,384' },
      { max: 38461, base: 1971.20, over: 15385, rate: 0.25, range: '₱15,385 – ₱38,461' },
      { max: 153845, base: 7740.45, over: 38462, rate: 0.30, range: '₱38,462 – ₱153,845' },
      { max: Infinity, base: 42355.65, over: 153846, rate: 0.35, range: '₱153,846 and above' },
    ],
  },
  semiMonthly: {
    label: 'Semi-monthly',
    rows: [
      { max: 10417, base: 0, over: 0, rate: 0, range: '₱10,417 and below' },
      { max: 16666, base: 0, over: 10417, rate: 0.15, range: '₱10,417 – ₱16,666' },
      { max: 33332, base: 937.50, over: 16667, rate: 0.20, range: '₱16,667 – ₱33,332' },
      { max: 83332, base: 4270.70, over: 33333, rate: 0.25, range: '₱33,333 – ₱83,332' },
      { max: 333332, base: 16770.70, over: 83333, rate: 0.30, range: '₱83,333 – ₱333,332' },
      { max: Infinity, base: 91770.70, over: 333333, rate: 0.35, range: '₱333,333 and above' },
    ],
  },
  monthly: {
    label: 'Monthly',
    rows: [
      { max: 20833, base: 0, over: 0, rate: 0, range: '₱20,833 and below' },
      { max: 33332, base: 0, over: 20833, rate: 0.15, range: '₱20,833 – ₱33,332' },
      { max: 66666, base: 1875.00, over: 33333, rate: 0.20, range: '₱33,333 – ₱66,666' },
      { max: 166666, base: 8541.80, over: 66667, rate: 0.25, range: '₱66,667 – ₱166,666' },
      { max: 666666, base: 33541.80, over: 166667, rate: 0.30, range: '₱166,667 – ₱666,666' },
      { max: Infinity, base: 183541.80, over: 666667, rate: 0.35, range: '₱666,667 and above' },
    ],
  },
};

const elements = {
  form: document.querySelector('#taxForm'),
  tabs: document.querySelectorAll('.tab'),
  panels: {
    compensation: document.querySelector('#compensationPanel'),
    expanded: document.querySelector('#expandedPanel'),
  },
  heroMode: document.querySelector('#heroMode'),
  formTitle: document.querySelector('#formTitle'),
  formHelp: document.querySelector('#formHelp'),
  taxResult: document.querySelector('#taxResult'),
  summaryList: document.querySelector('#summaryList'),
  breakdownBox: document.querySelector('#breakdownBox'),
  tablePeriod: document.querySelector('#tablePeriod'),
  taxTableBody: document.querySelector('#taxTableBody'),
  ewtRate: document.querySelector('#ewtRate'),
  customRateField: document.querySelector('#customRateField'),
  customRate: document.querySelector('#customRate'),
  toast: document.querySelector('#toast'),
  historyList: document.querySelector('#historyList'),
};

let activeMode = 'compensation';
let latestResult = null;

function pesos(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function percent(value) {
  return `${(value * 100).toFixed(value % 0.01 === 0 ? 0 : 2)}%`;
}

function inputNumber(id) {
  const value = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function calculateCompensationTax(taxableIncome, period) {
  const table = taxTables[period] || taxTables.monthly;
  const bracketIndex = table.rows.findIndex((row) => taxableIncome <= row.max);
  const bracket = table.rows[bracketIndex] || table.rows.at(-1);
  const excess = Math.max(0, taxableIncome - bracket.over);
  const tax = bracket.base + excess * bracket.rate;

  return {
    period,
    tableLabel: table.label,
    bracketNumber: bracketIndex + 1,
    bracket,
    taxableIncome,
    excess,
    tax: Math.max(0, tax),
    effectiveRate: taxableIncome > 0 ? Math.max(0, tax) / taxableIncome : 0,
  };
}

function updateSummary(items) {
  elements.summaryList.innerHTML = items
    .map((item) => `<div><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');
}

function calculateCompensation() {
  const period = document.querySelector('#payPeriod').value;
  const basic = inputNumber('basicPay');
  const overtime = inputNumber('overtimePay');
  const allowances = inputNumber('allowances');
  const taxableBenefits = inputNumber('taxableBenefits');
  const deductions = inputNumber('deductions');
  const gross = basic + overtime + allowances + taxableBenefits;
  const taxableIncome = Math.max(0, gross - deductions);
  const result = calculateCompensationTax(taxableIncome, period);
  const netAfterWithholding = Math.max(0, gross - deductions - result.tax);

  latestResult = {
    mode: 'Compensation',
    title: `${result.tableLabel} compensation`,
    tax: result.tax,
    taxableBase: taxableIncome,
    net: netAfterWithholding,
    timestamp: new Date().toISOString(),
    details: result,
  };

  elements.taxResult.textContent = pesos(result.tax);
  updateSummary([
    { label: 'Gross compensation', value: pesos(gross) },
    { label: 'Taxable compensation', value: pesos(taxableIncome) },
    { label: 'Bracket / marginal rate', value: `Bracket ${result.bracketNumber} • ${percent(result.bracket.rate)}` },
    { label: 'Effective tax rate', value: percent(result.effectiveRate) },
    { label: 'Estimated net after withholding', value: pesos(netAfterWithholding) },
  ]);

  elements.breakdownBox.innerHTML = `
    <h3>Computation breakdown</h3>
    <p><code>Gross pay</code> = ${pesos(basic)} + ${pesos(overtime)} + ${pesos(allowances)} + ${pesos(taxableBenefits)} = <strong>${pesos(gross)}</strong></p>
    <p><code>Taxable compensation</code> = ${pesos(gross)} - ${pesos(deductions)} = <strong>${pesos(taxableIncome)}</strong></p>
    <p><code>Withholding tax</code> = ${pesos(result.bracket.base)} + (${pesos(result.excess)} × ${percent(result.bracket.rate)}) = <strong>${pesos(result.tax)}</strong></p>
    <p>Applied table: <strong>${result.tableLabel}</strong>, range <strong>${result.bracket.range}</strong>.</p>
  `;
}

function calculateExpanded() {
  const amount = inputNumber('paymentAmount');
  const selectedRate = elements.ewtRate.value;
  const customRate = inputNumber('customRate') / 100;
  const rate = selectedRate === 'custom' ? customRate : Number(selectedRate);
  const label = document.querySelector('#transactionLabel').value.trim() || 'Income payment';
  const tax = amount * rate;
  const net = Math.max(0, amount - tax);

  latestResult = {
    mode: 'Expanded',
    title: label,
    tax,
    taxableBase: amount,
    net,
    timestamp: new Date().toISOString(),
    details: { amount, rate, label },
  };

  elements.taxResult.textContent = pesos(tax);
  updateSummary([
    { label: 'Payment amount', value: pesos(amount) },
    { label: 'Withholding rate', value: percent(rate) },
    { label: 'Net payable after withholding', value: pesos(net) },
  ]);

  elements.breakdownBox.innerHTML = `
    <h3>Computation breakdown</h3>
    <p><code>${label}</code> subject to withholding = <strong>${pesos(amount)}</strong></p>
    <p><code>Tax to withhold</code> = ${pesos(amount)} × ${percent(rate)} = <strong>${pesos(tax)}</strong></p>
    <p><code>Net payout</code> = ${pesos(amount)} - ${pesos(tax)} = <strong>${pesos(net)}</strong></p>
  `;
}

function setMode(mode) {
  activeMode = mode;
  elements.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  Object.entries(elements.panels).forEach(([key, panel]) => panel.classList.toggle('active', key === mode));

  const isCompensation = mode === 'compensation';
  elements.heroMode.textContent = isCompensation ? 'Compensation' : 'Expanded W-Tax';
  elements.formTitle.textContent = isCompensation ? 'Compensation withholding tax' : 'Expanded withholding tax';
  elements.formHelp.textContent = isCompensation
    ? 'Enter the taxable payroll components for one pay period.'
    : 'Enter the income payment and applicable withholding rate.';

  latestResult = null;
  elements.taxResult.textContent = pesos(0);
  updateSummary([
    { label: isCompensation ? 'Taxable base' : 'Payment amount', value: pesos(0) },
    { label: isCompensation ? 'Tax bracket / rate' : 'Withholding rate', value: '—' },
    { label: isCompensation ? 'Estimated net after withholding' : 'Net payable after withholding', value: pesos(0) },
  ]);
  elements.breakdownBox.innerHTML = '<h3>Computation breakdown</h3><p>Enter values and click <strong>Compute tax</strong> to view the formula.</p>';
}

function renderTaxTable(period = 'monthly') {
  const table = taxTables[period] || taxTables.monthly;
  elements.taxTableBody.innerHTML = table.rows
    .map((row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.range}</td>
        <td>${pesos(row.base)}</td>
        <td>${percent(row.rate)}</td>
        <td>${row.over === 0 ? '—' : pesos(row.over)}</td>
      </tr>
    `)
    .join('');
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 2400);
}

function getSavedScenarios() {
  try {
    return JSON.parse(localStorage.getItem('pastel-taxdesk-history') || '[]');
  } catch {
    return [];
  }
}

function setSavedScenarios(items) {
  localStorage.setItem('pastel-taxdesk-history', JSON.stringify(items));
}

function renderHistory() {
  const scenarios = getSavedScenarios();
  if (!scenarios.length) {
    elements.historyList.className = 'history-list empty-state';
    elements.historyList.textContent = 'No saved scenarios yet.';
    return;
  }

  elements.historyList.className = 'history-list';
  elements.historyList.innerHTML = scenarios
    .map((item) => {
      const date = new Date(item.timestamp).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
      return `
        <article class="history-item">
          <strong>${item.title}</strong>
          <div class="history-meta">${item.mode} • ${date}</div>
          <div class="history-grid">
            <p><span>Taxable base</span>${pesos(item.taxableBase)}</p>
            <p><span>Tax withheld</span>${pesos(item.tax)}</p>
            <p><span>Net amount</span>${pesos(item.net)}</p>
          </div>
        </article>
      `;
    })
    .join('');
}

function resetForm() {
  elements.form.reset();
  elements.ewtRate.value = '0.02';
  elements.customRateField.classList.add('hidden');
  setMode(activeMode);
  renderTaxTable(elements.tablePeriod.value);
  showToast('Form reset.');
}

function loadSampleData() {
  setMode('compensation');
  document.querySelector('#payPeriod').value = 'monthly';
  document.querySelector('#basicPay').value = 45000;
  document.querySelector('#overtimePay').value = 2500;
  document.querySelector('#allowances').value = 3000;
  document.querySelector('#taxableBenefits').value = 0;
  document.querySelector('#deductions').value = 2800;
  elements.tablePeriod.value = 'monthly';
  renderTaxTable('monthly');
  calculateCompensation();
  showToast('Sample monthly payroll loaded.');
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (activeMode === 'compensation') {
    calculateCompensation();
  } else {
    calculateExpanded();
  }
});

elements.tabs.forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

elements.tablePeriod.addEventListener('change', (event) => renderTaxTable(event.target.value));

elements.ewtRate.addEventListener('change', () => {
  elements.customRateField.classList.toggle('hidden', elements.ewtRate.value !== 'custom');
});

document.querySelector('#resetBtn').addEventListener('click', resetForm);
document.querySelector('#loadSampleBtn').addEventListener('click', loadSampleData);

document.querySelector('#copyBtn').addEventListener('click', async () => {
  if (!latestResult) {
    showToast('Compute first before copying.');
    return;
  }

  const text = [
    `Mode: ${latestResult.mode}`,
    `Title: ${latestResult.title}`,
    `Taxable base: ${pesos(latestResult.taxableBase)}`,
    `Tax to withhold: ${pesos(latestResult.tax)}`,
    `Net amount: ${pesos(latestResult.net)}`,
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard.');
  } catch {
    showToast('Copy failed. Your browser may block clipboard access.');
  }
});

document.querySelector('#saveBtn').addEventListener('click', () => {
  if (!latestResult) {
    showToast('Compute first before saving.');
    return;
  }

  const scenarios = getSavedScenarios();
  scenarios.unshift(latestResult);
  setSavedScenarios(scenarios.slice(0, 8));
  renderHistory();
  showToast('Scenario saved locally.');
});

document.querySelector('#clearHistoryBtn').addEventListener('click', () => {
  setSavedScenarios([]);
  renderHistory();
  showToast('Saved scenarios cleared.');
});

renderTaxTable('monthly');
renderHistory();
