/**
 * SummaryReport.jsx — the one-page view. It's designed to be printed to PDF (the browser's
 * "Save as PDF") or copied as plain text. The @media print rules in index.css hide the
 * interactive chrome so only this report prints.
 */
import { RECOMMENDATION_META } from '../scoring.js';
import { fmtHours, fmtMoney } from '../lib/format.js';

// Build a plain-text version for the "Copy as text" button.
export function buildReportText(processName, analyzed, totals, assumptions) {
  const lines = [];
  lines.push(`SHOULD WE AUTOMATE THIS? — ${processName || 'Untitled process'}`);
  lines.push('(All time and money figures are estimates.)');
  lines.push('');
  lines.push(`Total estimated savings: ${fmtMoney(totals.yearlyDollarsSaved)}/year  |  ${fmtHours(totals.yearlyHoursSaved)} hrs/year  |  ${fmtHours(totals.weeklyHoursSaved)} hrs/week`);
  lines.push(`Assumptions: $${assumptions.hourlyCost}/hr, ${assumptions.weeksPerYear} working weeks/year`);
  lines.push('');
  lines.push('STEPS:');
  analyzed.forEach((s, i) => {
    const meta = RECOMMENDATION_META[s.recommendation];
    lines.push(`${i + 1}. ${s.description || 'Untitled step'}`);
    lines.push(`   Verdict: ${meta.label} (${s.effort} effort) — saves ${fmtHours(s.impact.yearlyHoursSaved)} hrs/yr`);
    lines.push(`   Why: ${s.reasons.join(' ')}`);
  });
  return lines.join('\n');
}

export default function SummaryReport({ processName, analyzed, totals, assumptions }) {
  return (
    <div className="report">
      <div className="report-section">
        <h2 style={{ fontSize: '1.3rem' }}>{processName || 'Untitled process'}</h2>
        <p className="hint">Automation assessment · all time and money figures are estimates.</p>
      </div>

      <div className="report-section">
        <table>
          <tbody>
            <tr>
              <td><strong>{fmtMoney(totals.yearlyDollarsSaved)}</strong><div className="dofirst-meta">estimated / year</div></td>
              <td><strong>{fmtHours(totals.yearlyHoursSaved)} hrs</strong><div className="dofirst-meta">saved / year</div></td>
              <td><strong>{fmtHours(totals.weeklyHoursSaved)} hrs</strong><div className="dofirst-meta">saved / week</div></td>
              <td><strong>${assumptions.hourlyCost}/hr · {assumptions.weeksPerYear} wks</strong><div className="dofirst-meta">assumptions</div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Step</th><th>Verdict</th><th>Why</th><th>Effort</th><th>Hrs/yr</th>
            </tr>
          </thead>
          <tbody>
            {analyzed.map((s, i) => {
              const meta = RECOMMENDATION_META[s.recommendation];
              return (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.description || 'Untitled step'}</td>
                  <td><span className="tag" style={{ background: meta.color }}>{meta.label}</span></td>
                  <td>{s.reasons.join(' ')}</td>
                  <td>{s.effort}</td>
                  <td>{s.impact.yearlyHoursSaved > 0 ? fmtHours(s.impact.yearlyHoursSaved) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
