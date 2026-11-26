/**
 * icons.jsx — a small, consistent set of inline line icons.
 *
 * Why hand-rolled SVGs instead of emoji or an icon library: emoji render differently on
 * every OS and look incidental; an icon dependency is weight we don't need. These share one
 * grid (24×24), one stroke weight (1.6), round caps/joins, and inherit `currentColor`, so they
 * read as a single designed family. Each takes an optional size.
 */

function Svg({ size = 16, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

// Clock — time per run.
export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
);

// Downward trend — time saved (less time spent).
export const SaveTimeIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 7l6.2 6.2 3-3L20.5 17" />
    <path d="M20.5 12.5V17h-4.5" />
  </Svg>
);

// Gauge — build effort.
export const EffortIcon = (p) => (
  <Svg {...p}>
    <path d="M4 15a8 8 0 0 1 16 0" />
    <path d="M12 15l4-3.5" />
    <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

// Arrow right — "do first" / navigation.
export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

// Plus — add step.
export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

// Pencil — edit.
export const EditIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 5.5l4 4L8 20l-4.5 1 1-4.5L14.5 5.5z" />
    <path d="M13 7l4 4" />
  </Svg>
);

// X — remove / close.
export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

// Document — summary report.
export const ReportIcon = (p) => (
  <Svg {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 15.5h6M9 8.5h2" />
  </Svg>
);

// Copy — copy as text.
export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
  </Svg>
);

// Printer — print / save as PDF.
export const PrintIcon = (p) => (
  <Svg {...p}>
    <path d="M7 9V4h10v5" />
    <path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M7 14h10v6H7z" />
  </Svg>
);
