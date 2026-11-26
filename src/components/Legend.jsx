/**
 * Legend.jsx — the key to the six recommendation types, plus how savings are estimated.
 * Reads directly from RECOMMENDATION_META so it can never drift from the engine.
 */
import { RECOMMENDATIONS, RECOMMENDATION_META } from '../scoring.js';

const ORDER = [
  RECOMMENDATIONS.ELIMINATE,
  RECOMMENDATIONS.SIMPLE_AUTOMATION,
  RECOMMENDATIONS.BUILD_APP,
  RECOMMENDATIONS.AI_ASSIST,
  RECOMMENDATIONS.AI_AGENT,
  RECOMMENDATIONS.KEEP_HUMAN,
];

export default function Legend() {
  return (
    <div>
      {ORDER.map((key) => {
        const meta = RECOMMENDATION_META[key];
        return (
          <div className="legend-item" key={key}>
            <span className="legend-dot" style={{ background: meta.color }} aria-hidden="true" />
            <div>
              <div className="legend-name">{meta.label}</div>
              <div className="legend-desc">{meta.short}</div>
            </div>
          </div>
        );
      })}
      <p className="legend-foot">
        <strong>How savings are estimated.</strong> Each verdict assumes it removes a set share of a
        step's hands-on time — Eliminate 100%, Simple automation 80%, AI agent 75%, Build a simple app 70%,
        AI assist 40% (a person still reviews), Keep human 0%. These shares are shown on purpose, not hidden.
        Yearly figures use the hourly cost and working weeks you set above.
      </p>
    </div>
  );
}
