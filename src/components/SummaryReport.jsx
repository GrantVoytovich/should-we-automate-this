/**
 * SummaryReport.jsx — the one-page view, styled like the summary sheet of an analyst report.
 * Designed to be printed to PDF (the browser's "Save as PDF") or copied as plain text. The
 * @media print rules in index.css hide the interactive chrome so only this report prints.
 */
import { RECOMMENDATION_META } from '../scoring.js';
import { fmtHours, fmtMoney } from '../lib/format.js';

// Plain-text version for the "Copy as text" button.
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
      <div className="eyebrow">Automation assessment</div>
      <h2 className="report-title">{processName || 'Untitled process'}</h2>
      <p className="report-sub">All time and money figures are estimates · ${assumptions.hourlyCost}/hr over {assumptions.weeksPerYear} working weeks.</p>

      <div className="report-totals">
        <div className="report-total"><div className="n">{fmtMoney(totals.yearlyDollarsSaved)}</div><div className="l">estimated / year</div></div>
        <div className="report-total"><div className="n">{fmtHours(totals.yearlyHoursSaved)} hrs</div><div className="l">saved / year</div></div>
        <div className="report-total"><div className="n">{fmtHours(totals.weeklyHoursSaved)} hrs</div><div className="l">saved / week</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: '24px' }}>#</th><th>Step</th><th>Verdict</th><th>Why</th><th>Effort</th><th>Hrs/yr</th>
          </tr>
        </thead>
        <tbody>
          {analyzed.map((s, i) => {
            const meta = RECOMMENDATION_META[s.recommendation];
            return (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.description || 'Untitled step'}</td>
                <td><span className="vcell" style={{ color: meta.color }}><span className="dot" style={{ background: meta.color }} />{meta.label}</span></td>
                <td style={{ color: 'var(--ink-70)' }}>{s.reasons.join(' ')}</td>
                <td>{s.effort}</td>
                <td>{s.impact.yearlyHoursSaved > 0 ? fmtHours(s.impact.yearlyHoursSaved) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
