/**
 * Legend.jsx — explains the six recommendation types and how savings are estimated.
 * It reads directly from RECOMMENDATION_META so it can never drift from the engine.
 */
import { RECOMMENDATIONS, RECOMMENDATION_META } from '../scoring.js';

// The order we present them in (most aggressive change -> keep as-is).
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
            <span className="legend-swatch" style={{ background: meta.color }} aria-hidden="true" />
            <div>
              <div className="legend-name">{meta.label}</div>
              <div className="legend-desc">{meta.short}</div>
            </div>
          </div>
        );
      })}
      <p className="hint" style={{ marginTop: 14 }}>
        <strong>How savings are estimated:</strong> each verdict assumes it removes a set share of a
        step's hands-on time — Eliminate 100%, AI agent 75%, Simple automation 80%, Build a simple app 70%,
        AI assist 40% (a person still reviews), Keep human 0%. These shares are assumptions, shown here on
        purpose. Yearly figures use your editable hourly cost and working-weeks-per-year.
      </p>
    </div>
  );
}
