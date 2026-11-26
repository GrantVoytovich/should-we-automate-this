/**
 * scoring.js — the decision engine for "Should We Automate This?"
 * =================================================================
 *
 * This is the one file to read if you want to understand how every recommendation
 * is made. There is NO machine learning and NO hidden model here. It is a small set
 * of transparent, ordered rules that mirror how a process consultant actually reasons
 * about a task. Every recommendation comes back with the exact reasons that produced it,
 * so the UI can always answer the question "why?".
 *
 * The flow for a single step is:
 *   1. Normalize the raw inputs into a few named "signals" (e.g. isScattered, isHighRisk).
 *   2. Run an ordered list of rules. The FIRST rule that matches wins (like triage).
 *   3. Estimate how much of the step's time that recommendation could remove.
 *   4. Estimate how hard the change would be (effort).
 *
 * Keeping it ordered and first-match-wins is a deliberate design choice: it makes the
 * logic easy to read top-to-bottom and easy to defend ("we check elimination first,
 * then the scattered-information case, then the human-judgment cases, then the
 * automatable cases"). A weighted score would be harder to explain line by line.
 */

// ---------------------------------------------------------------------------
// The six possible recommendations. Using constants (not loose strings) means a
// typo becomes an immediate error instead of a silently-wrong result.
// ---------------------------------------------------------------------------
export const RECOMMENDATIONS = {
  ELIMINATE: 'eliminate',
  SIMPLE_AUTOMATION: 'simpleAutomation',
  BUILD_APP: 'buildApp',
  AI_ASSIST: 'aiAssist',
  AI_AGENT: 'aiAgent',
  KEEP_HUMAN: 'keepHuman',
};

// Human-friendly metadata for each recommendation type. The UI reads labels, colors,
// and the short "what it means" copy from here so there is a single source of truth.
// Colors are chosen to be distinguishable for common colorblindness (deuteranopia/
// protanopia): we avoid relying on a red/green pair alone and pair each hue with a
// clearly different lightness, plus every verdict always ships with its text label.
export const RECOMMENDATION_META = {
  [RECOMMENDATIONS.ELIMINATE]: {
    label: 'Eliminate',
    color: '#6B7280', // slate grey — intentionally muted: "stop doing this"
    short: 'This step may not need to exist.',
    potential: 1.0, // if removed, 100% of the step's time disappears
  },
  [RECOMMENDATIONS.SIMPLE_AUTOMATION]: {
    label: 'Simple automation',
    color: '#0EA5E9', // sky blue
    short: 'A rule, formula, form, or a tool like Zapier / Power Automate can do this.',
    potential: 0.8, // most of the hands-on time goes away; some oversight remains
  },
  [RECOMMENDATIONS.BUILD_APP]: {
    label: 'Build a simple app',
    color: '#7C3AED', // violet
    short: 'The real problem is that there is no system — a small shared tool would fix it.',
    potential: 0.7,
  },
  [RECOMMENDATIONS.AI_ASSIST]: {
    label: 'AI assist',
    color: '#F5B700', // amber (the product accent) — AI drafts, a person reviews
    short: 'AI produces a draft; a person checks and finishes it.',
    potential: 0.4, // review time is real, so only part of the time is saved
  },
  [RECOMMENDATIONS.AI_AGENT]: {
    label: 'AI agent',
    color: '#EC4899', // pink/magenta
    short: 'AI handles the step end-to-end; a person spot-checks the output.',
    potential: 0.75,
  },
  [RECOMMENDATIONS.KEEP_HUMAN]: {
    label: 'Keep human',
    color: '#059669', // green — a deliberately "good as-is" signal
    short: 'Judgment, relationships, or risk make this a job for a person.',
    potential: 0.0, // no time saved — and that is the correct answer sometimes
  },
};

// Allowed values for each field. Exported so the UI dropdowns and the tests both
// read from the same place (no drift between the form and the engine).
export const WORK_TYPES = {
  DATA_ENTRY: 'dataEntry',
  COPY_PASTE: 'copyPaste',
  LOOKUP: 'lookup',
  WRITING: 'writing',
  READING_SORTING: 'readingSorting',
  JUDGMENT: 'judgment',
  APPROVING: 'approving',
  CUSTOMER_TALK: 'customerTalk',
};

export const WORK_TYPE_LABELS = {
  [WORK_TYPES.DATA_ENTRY]: 'Data entry',
  [WORK_TYPES.COPY_PASTE]: 'Copy-paste between tools',
  [WORK_TYPES.LOOKUP]: 'Looking something up',
  [WORK_TYPES.WRITING]: 'Writing / drafting',
  [WORK_TYPES.READING_SORTING]: 'Reading & sorting',
  [WORK_TYPES.JUDGMENT]: 'Making a judgment call',
  [WORK_TYPES.APPROVING]: 'Approving',
  [WORK_TYPES.CUSTOMER_TALK]: 'Talking to a customer',
};

export const INPUT_TYPES = { STRUCTURED: 'structured', MESSY: 'messy' };
export const INPUT_TYPE_LABELS = {
  [INPUT_TYPES.STRUCTURED]: 'Structured (forms, spreadsheets)',
  [INPUT_TYPES.MESSY]: 'Messy (emails, PDFs, free text)',
};

export const INFO_LOCATIONS = { ONE: 'one', FEW: 'few', SCATTERED: 'scattered' };
export const INFO_LOCATION_LABELS = {
  [INFO_LOCATIONS.ONE]: 'One system',
  [INFO_LOCATIONS.FEW]: 'A few tools',
  [INFO_LOCATIONS.SCATTERED]: 'Scattered across email, texts & spreadsheets',
};

export const RULE_CLARITY = { ALWAYS: 'always', MOSTLY: 'mostly', DEPENDS: 'depends' };
export const RULE_CLARITY_LABELS = {
  [RULE_CLARITY.ALWAYS]: 'Always the same',
  [RULE_CLARITY.MOSTLY]: 'Mostly the same',
  [RULE_CLARITY.DEPENDS]: 'It depends',
};

export const MISTAKE_COST = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
export const MISTAKE_COST_LABELS = {
  [MISTAKE_COST.LOW]: 'Low',
  [MISTAKE_COST.MEDIUM]: 'Medium',
  [MISTAKE_COST.HIGH]: 'High',
};

export const NEEDED = { YES: 'yes', UNSURE: 'unsure', NO: 'no' };
export const NEEDED_LABELS = {
  [NEEDED.YES]: 'Yes',
  [NEEDED.UNSURE]: 'Not sure',
  [NEEDED.NO]: 'No',
};

export const EFFORT = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };

// A blank step with sensible defaults, used when the user adds a new step.
export function makeEmptyStep(id) {
  return {
    id,
    description: '',
    minutesPerRun: 10,
    runsPerWeek: 5,
    workType: WORK_TYPES.DATA_ENTRY,
    inputType: INPUT_TYPES.STRUCTURED,
    infoLocation: INFO_LOCATIONS.ONE,
    ruleClarity: RULE_CLARITY.MOSTLY,
    mistakeCost: MISTAKE_COST.LOW,
    needed: NEEDED.YES,
  };
}

// ---------------------------------------------------------------------------
// STEP 1 — turn raw inputs into named signals.
// Giving each condition a name makes the rules below read like plain English.
// ---------------------------------------------------------------------------
function deriveSignals(step) {
  const isDeterministic =
    step.ruleClarity === RULE_CLARITY.ALWAYS || step.ruleClarity === RULE_CLARITY.MOSTLY;
  return {
    isDeterministic, // are the rules clear enough to write down?
    isStructured: step.inputType === INPUT_TYPES.STRUCTURED,
    isMessy: step.inputType === INPUT_TYPES.MESSY,
    isScattered: step.infoLocation === INFO_LOCATIONS.SCATTERED,
    isMultiSystem: step.infoLocation !== INFO_LOCATIONS.ONE, // few OR scattered
    isHighRisk: step.mistakeCost === MISTAKE_COST.HIGH,
    isLowRisk: step.mistakeCost === MISTAKE_COST.LOW,
    isReentry:
      step.workType === WORK_TYPES.DATA_ENTRY || step.workType === WORK_TYPES.COPY_PASTE,
    isRelational: step.workType === WORK_TYPES.CUSTOMER_TALK,
    isJudgment: step.workType === WORK_TYPES.JUDGMENT,
    isApproving: step.workType === WORK_TYPES.APPROVING,
    isWriting: step.workType === WORK_TYPES.WRITING,
    isReadingSorting: step.workType === WORK_TYPES.READING_SORTING,
    isLookup: step.workType === WORK_TYPES.LOOKUP,
  };
}

// ---------------------------------------------------------------------------
// STEP 2 — the ordered rules. Each rule is a function that either returns a
// { recommendation, reasons } object (a match) or null (keep going). They run
// top to bottom and the first match wins. The order itself encodes priorities:
//   eliminate > fix-the-system > protect-humans > automate.
// ---------------------------------------------------------------------------
const RULES = [
  // 1. If the user says the step isn't needed, nothing else matters — remove it.
  //    (An "unsure" answer does NOT trigger this; it only adds a caution note later.)
  function eliminate(step) {
    if (step.needed === NEEDED.NO) {
      return {
        recommendation: RECOMMENDATIONS.ELIMINATE,
        reasons: ['You marked this step as not needed.'],
      };
    }
    return null;
  },

  // 2. The "no system" case. When information is scattered across emails, texts and
  //    spreadsheets AND the step is people re-keying or copy-pasting that data, the
  //    root cause isn't a slow task — it's the missing shared system. A small app or
  //    shared database removes the re-entry entirely. (This is the rule the brief
  //    specifically calls out: scattered info + repeated re-entry -> build a simple app.)
  function buildApp(step, s) {
    if (s.isScattered && s.isReentry) {
      return {
        recommendation: RECOMMENDATIONS.BUILD_APP,
        reasons: [
          'Information is scattered across several places and people re-enter it by hand.',
          'The real fix is a single shared system, not a faster version of the manual step.',
        ],
      };
    }
    return null;
  },

  // 3. Relationships belong to people. Talking to a customer is kept human regardless
  //    of how repetitive it looks on paper.
  function keepHumanRelational(step, s) {
    if (s.isRelational) {
      return {
        recommendation: RECOMMENDATIONS.KEEP_HUMAN,
        reasons: ['This step is a direct conversation with a customer — relationships stay human.'],
      };
    }
    return null;
  },

  // 4. High-stakes judgment stays human. If it's a judgment call and either the rules
  //    are fuzzy ("it depends") or a mistake is costly, a person should own it.
  function keepHumanJudgment(step, s) {
    if (s.isJudgment && (step.ruleClarity === RULE_CLARITY.DEPENDS || s.isHighRisk)) {
      return {
        recommendation: RECOMMENDATIONS.KEEP_HUMAN,
        reasons: [
          'This is a judgment call where the rules vary or a mistake is costly.',
          'AI can gather the inputs, but the decision should stay with a person.',
        ],
      };
    }
    return null;
  },

  // 5. Anything high-risk with unclear rules stays human. You can't safely automate
  //    what you can't reliably specify when the downside is large.
  function keepHumanRisky(step, s) {
    if (s.isHighRisk && !s.isDeterministic) {
      return {
        recommendation: RECOMMENDATIONS.KEEP_HUMAN,
        reasons: ['A mistake here is costly and the rules are not consistent enough to trust to automation.'],
      };
    }
    return null;
  },

  // 6. A clear, structured, mechanical step is the textbook case for SIMPLE AUTOMATION:
  //    deterministic rules + structured input + a data-moving/approving task that isn't
  //    high-risk. This is a formula, a form, a Zap, or a Power Automate flow — no AI needed.
  function simpleAutomation(step, s) {
    const mechanical =
      s.isReentry || s.isLookup || s.isApproving; // the "move/check data" family
    if (mechanical && s.isStructured && s.isDeterministic && !s.isHighRisk) {
      return {
        recommendation: RECOMMENDATIONS.SIMPLE_AUTOMATION,
        reasons: [
          'The input is structured and the rules are consistent, so a plain rule or formula can do it.',
          'No AI required — a form, spreadsheet formula, or a tool like Zapier / Power Automate fits.',
        ],
      };
    }
    return null;
  },

  // 7. AI AGENT: the step is a good fit for AI to run end-to-end with only spot-checks.
  //    We require clear rules AND low risk before handing the whole step to an agent.
  //    This covers messy-but-predictable reading/sorting/lookup/writing where a wrong
  //    answer is cheap to catch and fix.
  function aiAgent(step, s) {
    const aiFriendlyTask =
      s.isReadingSorting || s.isLookup || s.isWriting || s.isReentry;
    if (aiFriendlyTask && s.isDeterministic && s.isLowRisk) {
      return {
        recommendation: RECOMMENDATIONS.AI_AGENT,
        reasons: [
          'The task is repetitive with clear rules and a low cost if it is occasionally wrong.',
          'AI can handle it end-to-end while a person spot-checks the results.',
        ],
      };
    }
    return null;
  },

  // 8. AI ASSIST: messy input or writing/reading work where the stakes are high enough
  //    that a person must review every output. AI drafts; the human approves. This is the
  //    safe default for language-heavy work that we don't fully trust to an agent yet.
  function aiAssist(step, s) {
    const languageWork = s.isWriting || s.isReadingSorting || s.isLookup || s.isJudgment;
    if (languageWork && (s.isMessy || !s.isLowRisk)) {
      return {
        recommendation: RECOMMENDATIONS.AI_ASSIST,
        reasons: [
          'The work involves messy input or language where a mistake matters.',
          'AI can produce a strong first draft, but a person should review it before it goes out.',
        ],
      };
    }
    return null;
  },
];

// A catch-all so every step always gets an answer. If none of the specific rules fired,
// we fall back to the most conservative useful option: let AI assist, person reviews.
function fallbackRule(step) {
  return {
    recommendation: RECOMMENDATIONS.AI_ASSIST,
    reasons: ["This step doesn't fit a clear automation pattern, so start with AI drafting and a person reviewing."],
  };
}

// ---------------------------------------------------------------------------
// STEP 3 — effort estimate. How hard would the recommended change be to build?
// We start from a base effort per recommendation type, then nudge it up for things
// that genuinely add work: scattered systems, messy input, and high stakes (which
// demand more testing/guardrails). Returns 'low' | 'medium' | 'high'.
// ---------------------------------------------------------------------------
export function estimateEffort(step, recommendation) {
  const s = deriveSignals(step);

  // Base effort points per recommendation type.
  const base = {
    [RECOMMENDATIONS.ELIMINATE]: 0, // just stop doing it
    [RECOMMENDATIONS.SIMPLE_AUTOMATION]: 1,
    [RECOMMENDATIONS.AI_ASSIST]: 2,
    [RECOMMENDATIONS.AI_AGENT]: 3,
    [RECOMMENDATIONS.BUILD_APP]: 4,
    [RECOMMENDATIONS.KEEP_HUMAN]: 0, // no change to build
  }[recommendation];

  let points = base;
  if (s.isScattered) points += 1; // wiring many sources together is work
  if (s.isMessy) points += 1; // parsing messy input is work
  if (s.isHighRisk) points += 1; // high stakes means more testing & guardrails

  // Eliminate and Keep-human never require a build, so they stay low regardless.
  if (recommendation === RECOMMENDATIONS.ELIMINATE || recommendation === RECOMMENDATIONS.KEEP_HUMAN) {
    return EFFORT.LOW;
  }
  if (points <= 1) return EFFORT.LOW;
  if (points <= 3) return EFFORT.MEDIUM;
  return EFFORT.HIGH;
}

// ---------------------------------------------------------------------------
// STEP 4 — time & money impact.
// weeklyMinutesSaved = minutes * runs/week * the fraction of time the recommendation removes.
// The "fraction removed" is RECOMMENDATION_META[...].potential — a documented assumption,
// shown to the user in the legend, not a hidden number.
// ---------------------------------------------------------------------------
export function estimateImpact(step, recommendation, assumptions) {
  const weeksPerYear = assumptions?.weeksPerYear ?? 50; // default: 50 working weeks/year
  const hourlyCost = assumptions?.hourlyCost ?? 40; // default fully-loaded cost per hour

  const potential = RECOMMENDATION_META[recommendation].potential;
  const minutes = Number(step.minutesPerRun) || 0;
  const runs = Number(step.runsPerWeek) || 0;

  const weeklyMinutesTotal = minutes * runs; // all the time this step costs today
  const weeklyMinutesSaved = weeklyMinutesTotal * potential; // the part the change removes

  const weeklyHoursSaved = weeklyMinutesSaved / 60;
  const yearlyHoursSaved = weeklyHoursSaved * weeksPerYear;
  const yearlyDollarsSaved = yearlyHoursSaved * hourlyCost;

  return {
    potential, // the assumed fraction removed (for transparency in the UI)
    weeklyMinutesTotal,
    weeklyHoursSaved,
    yearlyHoursSaved,
    yearlyDollarsSaved,
  };
}

// ---------------------------------------------------------------------------
// Put it together: analyze ONE step. Returns the step plus its full verdict.
// ---------------------------------------------------------------------------
export function analyzeStep(step, assumptions) {
  const signals = deriveSignals(step);

  // Run the ordered rules; take the first match, else the fallback.
  let result = null;
  for (const rule of RULES) {
    result = rule(step, signals);
    if (result) break;
  }
  if (!result) result = fallbackRule(step, signals);

  // If the user is unsure whether the step is needed, add a caution. This doesn't
  // change the recommendation, but it flags something worth confirming first.
  const notes = [];
  if (step.needed === NEEDED.UNSURE) {
    notes.push("You're not sure this step is needed — confirm it's required before investing in it.");
  }

  const effort = estimateEffort(step, result.recommendation);
  const impact = estimateImpact(step, result.recommendation, assumptions);

  return {
    ...step,
    recommendation: result.recommendation,
    reasons: result.reasons,
    notes,
    effort,
    impact,
  };
}

// ---------------------------------------------------------------------------
// Analyze a whole process (a list of steps) and produce totals + a ranked
// "do these first" list by payoff-per-effort.
// ---------------------------------------------------------------------------

// Map effort to a numeric weight so we can rank "best bang for the buck".
// Lower weight = easier. Eliminate/keep-human are treated as effort 1 so they
// don't get an unfair infinite score.
const EFFORT_WEIGHT = { [EFFORT.LOW]: 1, [EFFORT.MEDIUM]: 2, [EFFORT.HIGH]: 4 };

export function analyzeProcess(steps, assumptions) {
  const analyzed = steps.map((step) => analyzeStep(step, assumptions));

  // Totals across every step.
  const totals = analyzed.reduce(
    (acc, s) => {
      acc.weeklyHoursSaved += s.impact.weeklyHoursSaved;
      acc.yearlyHoursSaved += s.impact.yearlyHoursSaved;
      acc.yearlyDollarsSaved += s.impact.yearlyDollarsSaved;
      acc.weeklyHoursTotal += s.impact.weeklyMinutesTotal / 60;
      return acc;
    },
    { weeklyHoursSaved: 0, yearlyHoursSaved: 0, yearlyDollarsSaved: 0, weeklyHoursTotal: 0 }
  );

  // "Do these first": rank by yearly hours saved divided by effort weight, so quick,
  // high-payoff wins float to the top. Steps that save nothing (keep-human) are excluded.
  const doFirst = analyzed
    .filter((s) => s.impact.yearlyHoursSaved > 0)
    .map((s) => ({
      ...s,
      payoffPerEffort: s.impact.yearlyHoursSaved / EFFORT_WEIGHT[s.effort],
    }))
    .sort((a, b) => b.payoffPerEffort - a.payoffPerEffort);

  return { analyzed, totals, doFirst };
}

// Numeric x/y position for the impact-vs-effort chart, so the chart component and any
// test can share the same mapping. x = effort (1..3), y = yearly hours saved.
export function effortToX(effort) {
  return { [EFFORT.LOW]: 1, [EFFORT.MEDIUM]: 2, [EFFORT.HIGH]: 3 }[effort];
}
