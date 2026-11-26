/**
 * DoFirst.jsx — the ranked "do these first" list. The ranking (payoff per effort) is
 * computed in scoring.js (analyzeProcess -> doFirst); this component only presents it.
 */
import { RECOMMENDATION_META } from '../scoring.js';
import { fmtHours } from '../lib/format.js';

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
            <div className="rank">{String(i + 1).padStart(2, '0')}</div>
            <div className="dofirst-main">
              <div className="dofirst-title">{s.description || 'Untitled step'}</div>
              <div className="dofirst-meta">
                <span className="dofirst-verdict" style={{ color: meta.color }}>{meta.label}</span>
                <span className="sep" aria-hidden="true" />
                <span>{fmtHours(s.impact.yearlyHoursSaved)} hrs/yr</span>
                <span className="sep" aria-hidden="true" />
                <span>{s.effort} effort</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
