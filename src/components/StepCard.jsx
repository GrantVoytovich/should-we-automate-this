/**
 * StepCard.jsx — one process step. Shows the verdict (colored pill), the one-line "why",
 * the time/effort stats, and an expandable editor form. All the step's fields are edited here.
 *
 * Presentation only: the recommendation, reasons, effort and impact are already computed by
 * the engine (analyzeStep) and passed in as `step`.
 */
import {
  RECOMMENDATION_META,
  WORK_TYPE_LABELS,
  INPUT_TYPE_LABELS,
  INFO_LOCATION_LABELS,
  RULE_CLARITY_LABELS,
  MISTAKE_COST_LABELS,
  NEEDED_LABELS,
} from '../scoring.js';
import { fmtHoursPerWeek, fmtHoursPerYear } from '../lib/format.js';

// Build an array of {value,label} options from a labels map for a <select>.
function options(labels) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function Select({ label, value, labels, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options(labels).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function StepCard({ step, index, isOpen, onToggle, onChange, onRemove }) {
  const meta = RECOMMENDATION_META[step.recommendation];
  const set = (patch) => onChange({ ...step, ...patch });

  return (
    <div className="step" style={{ borderLeftColor: meta.color }}>
      <div className="step-head">
        <div className="step-main">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="verdict" style={{ background: meta.color }}>
              <span className="dot" aria-hidden="true" />{meta.label}
            </span>
            <span className="step-meta">Step {index + 1}</span>
          </div>

          <div className={`step-desc ${step.description ? '' : 'empty'}`} style={{ marginTop: 6 }}>
            {step.description || 'Untitled step — click Edit to describe it'}
          </div>

          {/* The one-line "why" — the first reason from the engine, in plain English. */}
          <div className="why"><strong>Why:</strong> {step.reasons[0]}</div>
          {step.notes.map((n, i) => (
            <div className="note" key={i}>{n}</div>
          ))}

          <div className="step-stats">
            <span>⏱ <b>{step.minutesPerRun}</b> min × <b>{step.runsPerWeek}</b>/wk</span>
            {step.impact.yearlyHoursSaved > 0 ? (
              <>
                <span>💾 Saves <b>{fmtHoursPerWeek(step.impact.weeklyHoursSaved)}</b> ({fmtHoursPerYear(step.impact.yearlyHoursSaved)})</span>
                <span>🔧 Effort: <b>{step.effort}</b></span>
              </>
            ) : (
              <span>No time saved — stays with a person</span>
            )}
          </div>
        </div>

        <div className="step-actions no-print">
          <button className="btn btn-sm" onClick={onToggle} aria-expanded={isOpen}>
            {isOpen ? 'Done' : 'Edit'}
          </button>
          <button className="btn btn-sm btn-danger" onClick={onRemove} aria-label={`Remove step ${index + 1}`}>✕</button>
        </div>
      </div>

      {isOpen && (
        <div className="editor no-print">
          <div className="field full">
            <label>What happens in this step?</label>
            <textarea
              value={step.description}
              placeholder="e.g. Copy client details from the email into the spreadsheet"
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Minutes per run</label>
            <input type="number" min="0" step="1" value={step.minutesPerRun}
              onChange={(e) => set({ minutesPerRun: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Runs per week</label>
            <input type="number" min="0" step="1" value={step.runsPerWeek}
              onChange={(e) => set({ runsPerWeek: Number(e.target.value) })} />
          </div>

          <Select label="Type of work" value={step.workType} labels={WORK_TYPE_LABELS}
            onChange={(v) => set({ workType: v })} />
          <Select label="Input" value={step.inputType} labels={INPUT_TYPE_LABELS}
            onChange={(v) => set({ inputType: v })} />
          <Select label="Where the information lives" value={step.infoLocation} labels={INFO_LOCATION_LABELS}
            onChange={(v) => set({ infoLocation: v })} />
          <Select label="How clear are the rules?" value={step.ruleClarity} labels={RULE_CLARITY_LABELS}
            onChange={(v) => set({ ruleClarity: v })} />
          <Select label="Cost of a mistake" value={step.mistakeCost} labels={MISTAKE_COST_LABELS}
            onChange={(v) => set({ mistakeCost: v })} />
          <Select label="Is this step needed at all?" value={step.needed} labels={NEEDED_LABELS}
            onChange={(v) => set({ needed: v })} />
        </div>
      )}
    </div>
  );
}
