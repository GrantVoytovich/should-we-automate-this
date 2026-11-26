/**
 * App.jsx — top-level component. Owns the state (process name, steps, assumptions), runs the
 * engine on every change (analyzeProcess), persists to localStorage, and lays out the two
 * columns: the process ledger on the left, the analysis on the right.
 *
 * All decision logic lives in scoring.js. This file is only state + layout, so the two
 * concerns can be reasoned about independently.
 */
import { useState, useEffect, useMemo } from 'react';
import { analyzeProcess, makeEmptyStep } from './scoring.js';
import { EXAMPLES } from './examples.js';
import { loadState, saveState } from './lib/storage.js';
import StepCard from './components/StepCard.jsx';
import SavingsPanel from './components/SavingsPanel.jsx';
import ImpactEffortChart from './components/ImpactEffortChart.jsx';
import DoFirst from './components/DoFirst.jsx';
import Legend from './components/Legend.jsx';
import SummaryReport, { buildReportText } from './components/SummaryReport.jsx';
import { PlusIcon, ReportIcon, ArrowRightIcon, CopyIcon, PrintIcon } from './components/icons.jsx';

const DEFAULT_ASSUMPTIONS = { hourlyCost: 40, weeksPerYear: 50 };
const newId = () => `step-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

export default function App() {
  const saved = loadState();
  const [processName, setProcessName] = useState(saved?.processName ?? 'My process');
  const [steps, setSteps] = useState(saved?.steps ?? []);
  const [assumptions, setAssumptions] = useState(saved?.assumptions ?? DEFAULT_ASSUMPTIONS);
  const [openStepId, setOpenStepId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveState({ processName, steps, assumptions });
  }, [processName, steps, assumptions]);

  const { analyzed, totals, doFirst } = useMemo(
    () => analyzeProcess(steps, assumptions),
    [steps, assumptions]
  );

  function addStep() {
    const s = makeEmptyStep(newId());
    setSteps((prev) => [...prev, s]);
    setOpenStepId(s.id);
  }
  function updateStep(updated) {
    setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }
  function removeStep(id) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }
  function loadExample(example) {
    setProcessName(example.name);
    setSteps(example.steps.map((s) => ({ ...s, id: newId() })));
    setOpenStepId(null);
    setShowReport(false);
  }
  function clearAll() {
    if (!confirm('Clear the whole process and start over?')) return;
    setProcessName('My process');
    setSteps([]);
    setOpenStepId(null);
  }

  async function copyReport() {
    const text = buildReportText(processName, analyzed, totals, assumptions);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy the report text below:', text);
    }
  }

  return (
    <div className="app">
      {/* ---------------------------------------------------------- Masthead */}
      <header className="masthead">
        <div className="masthead-left">
          <div className="eyebrow">Process automation assessment</div>
          <h1 className="app-title">Should we <em>automate</em> this?</h1>
          <p className="app-subtitle">
            Describe a process step by step. You'll get a clear verdict on each step — what to fix and how,
            what to leave to people, and roughly how much time it would save — with the reasoning shown for every call.
          </p>
        </div>
        <div className="no-print">
          <button className="btn" onClick={() => setShowReport((v) => !v)}>
            {showReport ? <><ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} /> Back to builder</> : <><ReportIcon size={16} /> Summary report</>}
          </button>
        </div>
      </header>
      <hr className="masthead-rule" />

      {/* Examples */}
      <div className="examples no-print">
        <span className="eyebrow">Try an example</span>
        {EXAMPLES.map((ex) => (
          <button key={ex.key} className="chip" onClick={() => loadExample(ex)} title={ex.blurb}>
            {ex.name}
          </button>
        ))}
      </div>

      {showReport ? (
        /* -------------------------------------------------- Summary report view */
        <div>
          <div className="report-bar no-print">
            <span className="eyebrow">One-page summary</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={copyReport}><CopyIcon size={15} />{copied ? 'Copied' : 'Copy as text'}</button>
              <button className="btn btn-sm" onClick={() => window.print()}><PrintIcon size={15} />Print / Save as PDF</button>
            </span>
          </div>
          {steps.length === 0 ? (
            <p className="empty-state">Add some steps first, then come back for the summary.</p>
          ) : (
            <SummaryReport processName={processName} analyzed={analyzed} totals={totals} assumptions={assumptions} />
          )}
        </div>
      ) : (
        /* -------------------------------------------------- Builder + analysis */
        <div className="grid">
          {/* LEFT: the process ledger */}
          <div>
            <div className="process-head">
              <input
                className="process-name-input"
                value={processName}
                aria-label="Process name"
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Name this process"
              />
            </div>
            <p className="process-sub">Add each step, then read its verdict and the savings on the right.</p>

            {steps.length === 0 ? (
              <div className="empty-state">
                No steps yet. Add your first step, or load an example above.
              </div>
            ) : (
              <div className="steps">
                {analyzed.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={i}
                    isOpen={openStepId === step.id}
                    onToggle={() => setOpenStepId((cur) => (cur === step.id ? null : step.id))}
                    onChange={updateStep}
                    onRemove={() => removeStep(step.id)}
                  />
                ))}
              </div>
            )}

            <div className="add-row no-print">
              <button className="btn btn-primary" onClick={addStep}><PlusIcon size={16} /> Add step</button>
              {steps.length > 0 && <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>}
            </div>
          </div>

          {/* RIGHT: the analysis */}
          <div className="right-col">
            <SavingsPanel totals={totals} assumptions={assumptions} onChange={setAssumptions} />

            <div className="section">
              <div className="section-head"><h2 className="section-title">Impact vs effort</h2></div>
              <p className="section-note">Quick wins sit high and to the left.</p>
              <ImpactEffortChart steps={analyzed} />
            </div>

            <div className="section">
              <div className="section-head"><h2 className="section-title">Do these first</h2></div>
              <p className="section-note">Ranked by the best time saved for the least effort.</p>
              <DoFirst doFirst={doFirst} />
            </div>

            <div className="section">
              <div className="section-head"><h2 className="section-title">The six verdicts</h2></div>
              <p className="section-note">What each recommendation means, and how savings are estimated.</p>
              <Legend />
            </div>
          </div>
        </div>
      )}

      <footer className="no-print" style={{ marginTop: 56, paddingTop: 20, borderTop: '1px solid var(--rule)', textAlign: 'center', color: 'var(--ink-45)', fontSize: '0.82rem' }}>
        Runs entirely in your browser · your work is saved locally · all figures are estimates you can change.
      </footer>
    </div>
  );
}
