/**
 * SavingsPanel.jsx — the hero figure, presented like the headline stat in an analyst report:
 * a large serif number on a quiet panel, three supporting figures beneath a rule, and the
 * assumptions written as an editable sentence (the two numbers are inline inputs). Everything
 * is clearly framed as an estimate.
 */
import { fmtHours, fmtMoney } from '../lib/format.js';

export default function SavingsPanel({ totals, assumptions, onChange }) {
  return (
    <section className="savings" aria-label="Estimated savings">
      <div className="eyebrow">Estimated savings</div>

      <div className="big">
        {fmtMoney(totals.yearlyDollarsSaved)}<span className="per">/ year</span>
      </div>
      <div className="big-sub">if you make every recommended change</div>

      <div className="savings-stats">
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.weeklyHoursSaved)}</div>
          <div className="u">hrs / week<br />saved</div>
        </div>
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.yearlyHoursSaved)}</div>
          <div className="u">hrs / year<br />saved</div>
        </div>
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.weeklyHoursTotal)}</div>
          <div className="u">hrs / week<br />spent today</div>
        </div>
      </div>

      <div className="assume">
        <span>Based on</span>
        <span>
          $
          <input
            className="assume-input" type="number" min="0" step="1"
            aria-label="Hourly cost"
            value={assumptions.hourlyCost}
            onChange={(e) => onChange({ ...assumptions, hourlyCost: Number(e.target.value) })}
          />
          / hour
        </span>
        <span>over</span>
        <input
          className="assume-input" type="number" min="1" max="52" step="1"
          aria-label="Working weeks per year"
          value={assumptions.weeksPerYear}
          onChange={(e) => onChange({ ...assumptions, weeksPerYear: Number(e.target.value) })}
        />
        <span>working weeks.</span>
        <span className="tag">Estimate</span>
      </div>
    </section>
  );
}
