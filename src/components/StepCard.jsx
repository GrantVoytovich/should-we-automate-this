/**
 * StepCard.jsx — one process step, laid out as a row in a ledger rather than a floating card.
 * A thin rail in the verdict color anchors it; the verdict chip, title, "why", and a meta row
 * (time · savings · effort) sit to the right. The editor form expands inline.
 *
 * Presentation only: recommendation, reasons, effort and impact are computed by the engine
 * (analyzeStep) and passed in as `step`.
 */
import {
  RECOMMENDATION_META,
  WORK_TYPE_LABELS,
  INPUT_TYPE_LABELS,
  INFO_LOCATION_LABELS,
  RULE_CLARITY_LABELS,
  MISTAKE_COST_LABELS,
  NEEDED_LABELS,
  EFFORT,
} from '../scoring.js';
import { fmtHours } from '../lib/format.js';
import { ClockIcon, SaveTimeIcon, EffortIcon, EditIcon, CloseIcon } from './icons.jsx';

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

// Segmented effort meter: fills 1/2/3 bars for low/medium/high.
function EffortMeter({ effort }) {
  const filled = { [EFFORT.LOW]: 1, [EFFORT.MEDIUM]: 2, [EFFORT.HIGH]: 3 }[effort];
  return (
    <span className="effort-meter">
      <span className="effort-bars" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} className={i <= filled ? 'on' : ''} />
        ))}
      </span>
      <span className="effort-label"><EffortIcon size={15} /> <b>{effort}</b> effort</span>
    </span>
  );
}

export default function StepCard({ step, index, isOpen, onToggle, onChange, onRemove }) {
  const meta = RECOMMENDATION_META[step.recommendation];
  const set = (patch) => onChange({ ...step, ...patch });
  const saves = step.impact.yearlyHoursSaved > 0;

  return (
    <div className="step" style={{ '--c': meta.color }}>
      <div className="step-rail" aria-hidden="true" />
      <div className="step-body">
        <div className="step-top">
          <span className="verdict"><span className="dot" aria-hidden="true" />{meta.label}</span>
          <span className="step-index">Step {index + 1}</span>
          <span className="step-actions no-print">
            <button className="icon-btn" onClick={onToggle} aria-expanded={isOpen} aria-label={isOpen ? 'Close editor' : 'Edit step'}>
              <EditIcon size={16} />
            </button>
            <button className="icon-btn" onClick={onRemove} aria-label={`Remove step ${index + 1}`}>
              <CloseIcon size={16} />
            </button>
          </span>
        </div>

        <h3 className={`step-title ${step.description ? '' : 'empty'}`}>
          {step.description || 'Untitled step — edit to describe it'}
        </h3>

        <p className="why"><span className="why-k">Why</span>&nbsp;&nbsp;{step.reasons[0]}</p>
        {step.notes.map((n, i) => (
          <div className="note" key={i}>{n}</div>
        ))}

        <div className="step-meta">
          <span className="m"><ClockIcon size={15} /><b>{step.minutesPerRun}</b> min × <b>{step.runsPerWeek}</b>/wk</span>
          <span className="sep" aria-hidden="true" />
          {saves ? (
            <>
              <span className="m"><SaveTimeIcon size={15} />Saves <b>{fmtHours(step.impact.weeklyHoursSaved)}</b> hrs/wk · <b>{fmtHours(step.impact.yearlyHoursSaved)}</b> hrs/yr</span>
              <span className="sep" aria-hidden="true" />
              <EffortMeter effort={step.effort} />
            </>
          ) : (
            <span className="m">No time saved — stays with a person</span>
          )}
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
    </div>
  );
}
