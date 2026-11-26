/**
 * ImpactEffortChart.jsx — a hand-drawn SVG scatter of impact (hours saved per year) vs effort.
 * No chart library: it's a small amount of SVG, so there are no dependencies and the math is
 * visible. Quick wins sit in the top-left (high impact, low effort); a faint guide marks that
 * quadrant. Dots use the muted verdict colors so the chart reads as part of the same system.
 */
import { RECOMMENDATION_META, effortToX } from '../scoring.js';
import { fmtHours } from '../lib/format.js';

export default function ImpactEffortChart({ steps }) {
  const points = steps.filter((s) => s.impact.yearlyHoursSaved > 0);

  const W = 440, H = 300;
  const pad = { left: 44, right: 16, top: 22, bottom: 42 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxHours = Math.max(10, ...points.map((p) => p.impact.yearlyHoursSaved));

  const xFor = (effort) => pad.left + ((effortToX(effort) - 1) / 2) * (plotW - 30) + 15;
  const yFor = (hours) => pad.top + plotH - (hours / maxHours) * plotH;

  if (points.length === 0) {
    return <p className="empty-state">Add steps that can be improved to see the impact-vs-effort map.</p>;
  }

  const midX = pad.left + plotW / 2;
  const midY = pad.top + plotH / 2;

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Scatter plot of yearly hours saved versus effort for each step. Quick wins appear in the upper-left.">
        {/* Faint quick-wins quadrant (upper-left) */}
        <rect x={pad.left} y={pad.top} width={plotW / 2} height={plotH / 2} fill="#2f6b53" opacity="0.05" />
        <line x1={midX} y1={pad.top} x2={midX} y2={pad.top + plotH} stroke="#e6e3db" strokeDasharray="3 4" />
        <line x1={pad.left} y1={midY} x2={pad.left + plotW} y2={midY} stroke="#e6e3db" strokeDasharray="3 4" />

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#d8d4c9" />
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#d8d4c9" />

        {/* X labels (effort) */}
        {['low', 'medium', 'high'].map((e) => (
          <text key={e} x={xFor(e)} y={pad.top + plotH + 20} textAnchor="middle" fontSize="10.5" fill="#8c897f" fontFamily="Inter, sans-serif">
            {e[0].toUpperCase() + e.slice(1)}
          </text>
        ))}
        <text x={pad.left + plotW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#55534c" fontFamily="Inter, sans-serif" letterSpacing="0.08em">
          EFFORT TO BUILD →
        </text>
        <text transform={`translate(13 ${pad.top + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize="10" fill="#55534c" fontFamily="Inter, sans-serif" letterSpacing="0.08em">
          HOURS SAVED / YEAR →
        </text>
        <text x={pad.left - 6} y={yFor(maxHours) + 4} textAnchor="end" fontSize="9.5" fill="#a9a59b" fontFamily="Inter, sans-serif">{fmtHours(maxHours)}</text>

        {/* Quick-wins label */}
        <text x={pad.left + 8} y={pad.top + 13} fontSize="9.5" fill="#2f6b53" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="0.06em">
          QUICK WINS
        </text>

        {/* One dot per step, colored by its recommendation, lightly jittered when sharing a column. */}
        {points.map((p, i) => {
          const meta = RECOMMENDATION_META[p.recommendation];
          const jitter = ((i % 3) - 1) * 9;
          const cx = xFor(p.effort) + jitter;
          const cy = yFor(p.impact.yearlyHoursSaved);
          return (
            <circle key={p.id} cx={cx} cy={cy} r="6" fill={meta.color} stroke="#faf9f6" strokeWidth="1.5">
              <title>{`${p.description || 'Untitled step'} — ${meta.label}: ${fmtHours(p.impact.yearlyHoursSaved)} hrs/yr, ${p.effort} effort`}</title>
            </circle>
          );
        })}
      </svg>
      <p className="chart-legend-line">Each dot is a step. Up = more time saved; left = easier to build.</p>
    </div>
  );
}
