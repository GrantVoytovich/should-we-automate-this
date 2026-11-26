/**
 * App.jsx — top-level component. It owns the state (process name, steps, assumptions),
 * runs the engine on every change (analyzeProcess), persists to localStorage, and lays out
 * the two columns: the process builder on the left, the analysis on the right.
 *
 * Note the clean separation: ALL decision logic lives in scoring.js. This file is only
 * state + layout, so you can reason about the two concerns independently.
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

const DEFAULT_ASSUMPTIONS = { hourlyCost: 40, weeksPerYear: 50 };

// Generate a reasonably-unique id for a new step.
const newId = () => `step-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

export default function App() {
  // ---- State, hydrated from localStorage on first render (so a refresh keeps your work).
  const saved = loadState();
  const [processName, setProcessName] = useState(saved?.processName ?? 'My process');
  const [steps, setSteps] = useState(saved?.steps ?? []);
  const [assumptions, setAssumptions] = useState(saved?.assumptions ?? DEFAULT_ASSUMPTIONS);
  const [openStepId, setOpenStepId] = useState(null); // which step's editor is expanded
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);

  // ---- Persist on every meaningful change.
  useEffect(() => {
    saveState({ processName, steps, assumptions });
  }, [processName, steps, assumptions]);

  // ---- Run the engine. useMemo so we only recompute when inputs change.
  const { analyzed, totals, doFirst } = useMemo(
    () => analyzeProcess(steps, assumptions),
    [steps, assumptions]
  );

  // ---- Step operations
  function addStep() {
    const s = makeEmptyStep(newId());
    setSteps((prev) => [...prev, s]);
    setOpenStepId(s.id); // open the editor for the new step immediately
  }
  function updateStep(updated) {
    setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }
  function removeStep(id) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }
  function loadExample(example) {
    // Deep-clone so editing the loaded copy never mutates the shared example data.
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
      // Clipboard can be blocked; fall back to a prompt the user can copy from.
      window.prompt('Copy the report text below:', text);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Should We <span className="accent">Automate</span> This?</h1>
          <p className="app-subtitle">
            Describe a process step by step. The tool tells you which steps to fix and how,
            what to leave to people, and roughly how much time it would save — and always shows <em>why</em>.
          </p>
        </div>
        <div className="toolbar no-print">
          <button className="btn" onClick={() => setShowReport((v) => !v)}>
            {showReport ? '← Back to builder' : 'Summary report'}
          </button>
        </div>
      </header>

      {/* Examples row */}
      <div className="toolbar no-print" style={{ marginTop: 8 }}>
        <span className="hint" style={{ marginRight: 2 }}>Load an example:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex.key} className="btn btn-sm" onClick={() => loadExample(ex)} title={ex.blurb}>
            {ex.name}
          </button>
        ))}
      </div>

      {showReport ? (
        /* -------------------------------------------------- Summary report view */
        <div className="card" style={{ marginTop: 20 }}>
          <div className="toolbar no-print" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-sm" onClick={copyReport}>{copied ? 'Copied!' : 'Copy as text'}</button>
            <button className="btn btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
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
          {/* LEFT: process builder */}
          <div>
            <div className="card">
              <input
                className="process-name-input"
                value={processName}
                aria-label="Process name"
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Name this process"
              />
              <p className="hint">Add each step of the process, then read the verdict and savings on the right.</p>

              {steps.length === 0 ? (
                <div className="empty-state">
                  No steps yet. Click <strong>Add step</strong> below, or load an example above.
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

              <div className="toolbar no-print" style={{ marginTop: 16 }}>
                <button className="btn btn-primary" onClick={addStep}>+ Add step</button>
                {steps.length > 0 && <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>}
              </div>
            </div>
          </div>

          {/* RIGHT: analysis */}
          <div className="right-col">
            <SavingsPanel totals={totals} assumptions={assumptions} onChange={setAssumptions} />

            <div className="card">
              <h2>Impact vs effort</h2>
              <p className="hint">Quick wins are high up and to the left.</p>
              <ImpactEffortChart steps={analyzed} />
            </div>

            <div className="card">
              <h2>Do these first</h2>
              <p className="hint">Ranked by the best time saved for the least effort.</p>
              <DoFirst doFirst={doFirst} />
            </div>

            <div className="card">
              <h2>How to read the verdicts</h2>
              <Legend />
            </div>
          </div>
        </div>
      )}

      <footer className="hint no-print" style={{ marginTop: 40, textAlign: 'center' }}>
        Runs entirely in your browser · your work is saved locally · all figures are estimates you can change.
      </footer>
    </div>
  );
}
