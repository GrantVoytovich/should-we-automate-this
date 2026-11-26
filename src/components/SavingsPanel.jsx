/**
 * SavingsPanel.jsx — the dark "savings" card. Shows total yearly dollars saved big,
 * weekly/yearly hours beneath, and the two editable assumptions (hourly cost, weeks/year).
 * Everything is clearly labeled as an estimate.
 */
import { fmtHours, fmtMoney } from '../lib/format.js';

export default function SavingsPanel({ totals, assumptions, onChange }) {
  return (
    <section className="savings" aria-label="Estimated savings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <h2>Estimated savings</h2>
        <span className="estimate-tag">Estimate</span>
      </div>

      <div className="big">{fmtMoney(totals.yearlyDollarsSaved)}</div>
      <div className="big-sub">per year, if you make every recommended change</div>

      <div className="savings-row">
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.weeklyHoursSaved)} hrs</div>
          <div className="l">saved per week</div>
        </div>
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.yearlyHoursSaved)} hrs</div>
          <div className="l">saved per year</div>
        </div>
        <div className="savings-stat">
          <div className="n">{fmtHours(totals.weeklyHoursTotal)} hrs</div>
          <div className="l">this process costs now / week</div>
        </div>
      </div>

      <div className="assumptions">
        <div className="field">
          <label htmlFor="hourlyCost">Hourly cost (fully loaded)</label>
          <input
            id="hourlyCost" type="number" min="0" step="1"
            value={assumptions.hourlyCost}
            onChange={(e) => onChange({ ...assumptions, hourlyCost: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label htmlFor="weeksPerYear">Working weeks / year</label>
          <input
            id="weeksPerYear" type="number" min="1" max="52" step="1"
            value={assumptions.weeksPerYear}
            onChange={(e) => onChange({ ...assumptions, weeksPerYear: Number(e.target.value) })}
          />
        </div>
      </div>
    </section>
  );
}
