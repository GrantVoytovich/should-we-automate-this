/**
 * scoring.test.js — unit tests for the decision engine.
 *
 * These tests are written so that each one documents a RULE in scoring.js. If you change
 * the rules, these tests tell you exactly which behavior changed. Run them with `npm test`.
 *
 * In an interview you can open this file next to scoring.js and say: "here is every rule,
 * and here is the test that proves it fires on the case it's meant for."
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeStep,
  analyzeProcess,
  estimateEffort,
  estimateImpact,
  makeEmptyStep,
  RECOMMENDATIONS,
  WORK_TYPES,
  INPUT_TYPES,
  INFO_LOCATIONS,
  RULE_CLARITY,
  MISTAKE_COST,
  NEEDED,
  EFFORT,
} from './scoring.js';

// Helper: start from a valid empty step and override just the fields a test cares about.
function step(overrides) {
  return { ...makeEmptyStep('t'), ...overrides };
}

describe('Rule 1 — Eliminate', () => {
  it('recommends Eliminate when the step is marked not needed', () => {
    const r = analyzeStep(step({ needed: NEEDED.NO }));
    expect(r.recommendation).toBe(RECOMMENDATIONS.ELIMINATE);
  });

  it('elimination wins even over an otherwise automatable step', () => {
    const r = analyzeStep(
      step({
        needed: NEEDED.NO,
        workType: WORK_TYPES.DATA_ENTRY,
        inputType: INPUT_TYPES.STRUCTURED,
        ruleClarity: RULE_CLARITY.ALWAYS,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.ELIMINATE);
  });
});

describe('Rule 2 — Build a simple app (scattered info + re-entry)', () => {
  it('recommends Build a simple app when info is scattered and people re-enter it', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.DATA_ENTRY,
        infoLocation: INFO_LOCATIONS.SCATTERED,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.BUILD_APP);
  });

  it('also fires for copy-paste work across scattered sources', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.COPY_PASTE,
        infoLocation: INFO_LOCATIONS.SCATTERED,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.BUILD_APP);
  });

  it('does NOT fire when the same re-entry happens in a single system (that is simple automation)', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.DATA_ENTRY,
        infoLocation: INFO_LOCATIONS.ONE,
        inputType: INPUT_TYPES.STRUCTURED,
        ruleClarity: RULE_CLARITY.MOSTLY,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.SIMPLE_AUTOMATION);
  });
});

describe('Rules 3-5 — Keep human', () => {
  it('keeps customer conversations human', () => {
    const r = analyzeStep(step({ workType: WORK_TYPES.CUSTOMER_TALK }));
    expect(r.recommendation).toBe(RECOMMENDATIONS.KEEP_HUMAN);
  });

  it('keeps high-risk judgment calls human', () => {
    const r = analyzeStep(
      step({ workType: WORK_TYPES.JUDGMENT, mistakeCost: MISTAKE_COST.HIGH })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.KEEP_HUMAN);
  });

  it('keeps judgment calls human when the rules "depend"', () => {
    const r = analyzeStep(
      step({ workType: WORK_TYPES.JUDGMENT, ruleClarity: RULE_CLARITY.DEPENDS })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.KEEP_HUMAN);
  });

  it('keeps high-risk work with inconsistent rules human', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.READING_SORTING,
        mistakeCost: MISTAKE_COST.HIGH,
        ruleClarity: RULE_CLARITY.DEPENDS,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.KEEP_HUMAN);
  });
});

describe('Rule 6 — Simple automation', () => {
  it('recommends simple automation for structured, rule-clear, low-risk data entry', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.DATA_ENTRY,
        inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.FEW,
        ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.LOW,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.SIMPLE_AUTOMATION);
  });

  it('treats a structured approval with clear rules as simple automation', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.APPROVING,
        inputType: INPUT_TYPES.STRUCTURED,
        ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.MEDIUM,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.SIMPLE_AUTOMATION);
  });
});

describe('Rule 7 — AI agent', () => {
  it('recommends an AI agent for repetitive, clear-rule, low-risk reading & sorting', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.READING_SORTING,
        inputType: INPUT_TYPES.MESSY,
        ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.AI_AGENT);
  });
});

describe('Rule 8 — AI assist', () => {
  it('recommends AI assist for drafting where a mistake matters', () => {
    const r = analyzeStep(
      step({
        workType: WORK_TYPES.WRITING,
        inputType: INPUT_TYPES.MESSY,
        ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.MEDIUM,
      })
    );
    expect(r.recommendation).toBe(RECOMMENDATIONS.AI_ASSIST);
  });
});

describe('Caution note for "not sure if needed"', () => {
  it('adds a note but still returns a recommendation', () => {
    const r = analyzeStep(step({ needed: NEEDED.UNSURE, workType: WORK_TYPES.CUSTOMER_TALK }));
    expect(r.recommendation).toBe(RECOMMENDATIONS.KEEP_HUMAN);
    expect(r.notes.length).toBeGreaterThan(0);
  });
});

describe('Effort estimates', () => {
  it('treats eliminate and keep-human as low effort (no build)', () => {
    expect(estimateEffort(step({}), RECOMMENDATIONS.ELIMINATE)).toBe(EFFORT.LOW);
    expect(estimateEffort(step({}), RECOMMENDATIONS.KEEP_HUMAN)).toBe(EFFORT.LOW);
  });

  it('rates building an app with scattered, messy, high-risk inputs as high effort', () => {
    const effort = estimateEffort(
      step({
        infoLocation: INFO_LOCATIONS.SCATTERED,
        inputType: INPUT_TYPES.MESSY,
        mistakeCost: MISTAKE_COST.HIGH,
      }),
      RECOMMENDATIONS.BUILD_APP
    );
    expect(effort).toBe(EFFORT.HIGH);
  });
});

describe('Impact estimates', () => {
  it('computes weekly/yearly hours and dollars from the editable assumptions', () => {
    // 30 min * 10 runs/week = 300 min/week. Simple automation removes 80% = 240 min = 4 hrs/week.
    const s = step({ minutesPerRun: 30, runsPerWeek: 10 });
    const impact = estimateImpact(s, RECOMMENDATIONS.SIMPLE_AUTOMATION, {
      weeksPerYear: 50,
      hourlyCost: 40,
    });
    expect(impact.weeklyHoursSaved).toBeCloseTo(4, 5);
    expect(impact.yearlyHoursSaved).toBeCloseTo(200, 5); // 4 * 50
    expect(impact.yearlyDollarsSaved).toBeCloseTo(8000, 5); // 200 * 40
  });

  it('keep-human saves zero time (potential 0)', () => {
    const impact = estimateImpact(step({}), RECOMMENDATIONS.KEEP_HUMAN, {});
    expect(impact.yearlyHoursSaved).toBe(0);
  });
});

describe('Whole-process analysis', () => {
  const steps = [
    step({ id: 'a', minutesPerRun: 30, runsPerWeek: 10, workType: WORK_TYPES.DATA_ENTRY, inputType: INPUT_TYPES.STRUCTURED, ruleClarity: RULE_CLARITY.ALWAYS }),
    step({ id: 'b', workType: WORK_TYPES.CUSTOMER_TALK }), // keep human, saves nothing
    step({ id: 'c', needed: NEEDED.NO, minutesPerRun: 15, runsPerWeek: 4 }), // eliminate
  ];

  it('sums totals across steps', () => {
    const { totals } = analyzeProcess(steps, { weeksPerYear: 50, hourlyCost: 40 });
    expect(totals.yearlyHoursSaved).toBeGreaterThan(0);
  });

  it('excludes keep-human steps from the "do these first" list', () => {
    const { doFirst } = analyzeProcess(steps, {});
    expect(doFirst.every((s) => s.recommendation !== RECOMMENDATIONS.KEEP_HUMAN)).toBe(true);
  });

  it('ranks by payoff-per-effort (best win first)', () => {
    const { doFirst } = analyzeProcess(steps, {});
    for (let i = 1; i < doFirst.length; i++) {
      expect(doFirst[i - 1].payoffPerEffort).toBeGreaterThanOrEqual(doFirst[i].payoffPerEffort);
    }
  });
});
