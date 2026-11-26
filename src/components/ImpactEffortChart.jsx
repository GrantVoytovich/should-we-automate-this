/**
 * ImpactEffortChart.jsx — a hand-drawn SVG scatter plot of impact (hours saved per year)
 * vs effort (low/medium/high). No chart library: it's a small amount of SVG so there are
 * no dependencies to explain and the math is fully visible. Quick wins sit in the
 * top-left (high impact, low effort).
 */
import { RECOMMENDATION_META, effortToX } from '../scoring.js';
import { fmtHours } from '../lib/format.js';

export default function ImpactEffortChart({ steps }) {
  // Only plot steps that actually save time (keep-human/zero-impact steps have no point).
  const points = steps.filter((s) => s.impact.yearlyHoursSaved > 0);

  // SVG coordinate space. We draw in a fixed viewBox and let CSS scale it responsively.
  const W = 440, H = 300;
  const pad = { left: 46, right: 18, top: 18, bottom: 42 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxHours = Math.max(10, ...points.map((p) => p.impact.yearlyHoursSaved));

  // x: effort 1..3 mapped across the plot width (with a little inset so dots aren't on the axis).
  const xFor = (effort) => pad.left + ((effortToX(effort) - 1) / 2) * (plotW - 30) + 15;
  // y: hours saved, inverted (more hours = higher up).
  const yFor = (hours) => pad.top + plotH - (hours / maxHours) * plotH;

  if (points.length === 0) {
    return <p className="empty-state">Add steps that can be improved to see the impact-vs-effort map.</p>;
  }

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Scatter plot of yearly hours saved versus effort for each step. Quick wins appear in the upper-left.">
        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#d4dae6" />
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#d4dae6" />

        {/* X labels (effort) */}
        {['low', 'medium', 'high'].map((e) => (
          <text key={e} x={xFor(e)} y={pad.top + plotH + 20} textAnchor="middle" fontSize="11" fill="#8a93a6">
            {e[0].toUpperCase() + e.slice(1)}
          </text>
        ))}
        <text x={pad.left + plotW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#475069" fontWeight="600">
          Effort to build →
        </text>

        {/* Y axis caption */}
        <text transform={`translate(14 ${pad.top + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="#475069" fontWeight="600">
          Hours saved / year →
        </text>
        <text x={pad.left - 6} y={yFor(maxHours) + 4} textAnchor="end" fontSize="10" fill="#9aa3b5">{fmtHours(maxHours)}</text>
        <text x={pad.left - 6} y={yFor(0)} textAnchor="end" fontSize="10" fill="#9aa3b5">0</text>

        {/* "Quick wins" hint in the upper-left quadrant */}
        <text x={xFor('low')} y={pad.top + 12} textAnchor="middle" fontSize="10" fill="#059669" fontWeight="700">
          ★ quick wins
        </text>

        {/* One dot per step, colored by its recommendation. Dots are jittered slightly on x
            when they share an effort column so they don't overlap perfectly. */}
        {points.map((p, i) => {
          const meta = RECOMMENDATION_META[p.recommendation];
          const jitter = ((i % 3) - 1) * 9; // -9, 0, +9
          const cx = xFor(p.effort) + jitter;
          const cy = yFor(p.impact.yearlyHoursSaved);
          return (
            <g key={p.id}>
              <circle cx={cx} cy={cy} r="8" fill={meta.color} stroke="#fff" strokeWidth="1.5">
                <title>{`${p.description || 'Untitled step'} — ${meta.label}: ${fmtHours(p.impact.yearlyHoursSaved)} hrs/yr, ${p.effort} effort`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <p className="chart-legend-line">Each dot is a step, colored by its recommendation. Up = more time saved; left = easier to build.</p>
    </div>
  );
}
