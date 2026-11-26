/**
 * DoFirst.jsx — the ranked "do these first" list. The ranking (payoff per effort) is
 * computed in scoring.js (analyzeProcess -> doFirst); this component only presents it.
 */
import { RECOMMENDATION_META } from '../scoring.js';
import { fmtHoursPerYear } from '../lib/format.js';

export default function DoFirst({ doFirst }) {
  if (doFirst.length === 0) {
    return <p className="empty-state">No time-saving opportunities yet — add some steps.</p>;
  }
  return (
    <div>
      {doFirst.slice(0, 6).map((s, i) => {
        const meta = RECOMMENDATION_META[s.recommendation];
        return (
          <div className="dofirst-item" key={s.id}>
            <div className="rank">{i + 1}</div>
            <div className="dofirst-main">
              <div className="dofirst-title">{s.description || 'Untitled step'}</div>
              <div className="dofirst-meta">
                <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                {' · '}{fmtHoursPerYear(s.impact.yearlyHoursSaved)} · {s.effort} effort
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
