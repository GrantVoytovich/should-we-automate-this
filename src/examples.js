/**
 * examples.js — three ready-made processes the user can load in one click.
 * Each is a realistic small-business process. They are deliberately varied so the
 * recommendations span all six verdict types (eliminate, simple automation, build app,
 * AI assist, AI agent, keep human), which makes the tool easy to demo.
 */
import {
  WORK_TYPES,
  INPUT_TYPES,
  INFO_LOCATIONS,
  RULE_CLARITY,
  MISTAKE_COST,
  NEEDED,
} from './scoring.js';

let idCounter = 0;
const uid = () => `ex-${Date.now()}-${idCounter++}`;

// Small helper so each example step below reads cleanly.
function s(fields) {
  return { id: uid(), ...fields };
}

export const EXAMPLES = [
  {
    key: 'intake',
    name: 'New-client intake (home organizing business)',
    blurb: 'From first enquiry to a booked, prepped first session.',
    steps: [
      s({
        description: 'Reply to the enquiry email and answer the same starter questions',
        minutesPerRun: 10, runsPerWeek: 12,
        workType: WORK_TYPES.WRITING, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Copy client name, address and notes from email into the spreadsheet and calendar',
        minutesPerRun: 8, runsPerWeek: 12,
        workType: WORK_TYPES.COPY_PASTE, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.SCATTERED, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.MEDIUM, needed: NEEDED.YES,
      }),
      s({
        description: 'Send the intake form and wait for the client to fill it in',
        minutesPerRun: 5, runsPerWeek: 12,
        workType: WORK_TYPES.DATA_ENTRY, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Phone call to understand the space and what the client actually wants',
        minutesPerRun: 25, runsPerWeek: 10,
        workType: WORK_TYPES.CUSTOMER_TALK, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.DEPENDS,
        mistakeCost: MISTAKE_COST.MEDIUM, needed: NEEDED.YES,
      }),
      s({
        description: 'Re-type a "welcome packet" cover note that is basically the same every time',
        minutesPerRun: 12, runsPerWeek: 10,
        workType: WORK_TYPES.WRITING, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Print the intake form to file in a paper binder nobody reads',
        minutesPerRun: 4, runsPerWeek: 10,
        workType: WORK_TYPES.DATA_ENTRY, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.NO,
      }),
    ],
  },

  {
    key: 'invoices',
    name: 'Processing vendor invoices',
    blurb: 'From an invoice landing in the inbox to a scheduled payment.',
    steps: [
      s({
        description: 'Read each invoice email and pull out vendor, amount, due date and PO number',
        minutesPerRun: 6, runsPerWeek: 40,
        workType: WORK_TYPES.READING_SORTING, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Type those invoice details into the accounting system',
        minutesPerRun: 5, runsPerWeek: 40,
        workType: WORK_TYPES.DATA_ENTRY, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.MEDIUM, needed: NEEDED.YES,
      }),
      s({
        description: 'Match each invoice to its purchase order and flag any mismatch',
        minutesPerRun: 7, runsPerWeek: 40,
        workType: WORK_TYPES.LOOKUP, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.FEW, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Approve payment for anything under $500 that matches its PO',
        minutesPerRun: 3, runsPerWeek: 30,
        workType: WORK_TYPES.APPROVING, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.ALWAYS,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Decide whether to approve large or unusual invoices',
        minutesPerRun: 10, runsPerWeek: 8,
        workType: WORK_TYPES.JUDGMENT, inputType: INPUT_TYPES.STRUCTURED,
        infoLocation: INFO_LOCATIONS.FEW, ruleClarity: RULE_CLARITY.DEPENDS,
        mistakeCost: MISTAKE_COST.HIGH, needed: NEEDED.YES,
      }),
    ],
  },

  {
    key: 'applications',
    name: 'Tracking job applications',
    blurb: 'A personal job search run out of email, texts and a messy spreadsheet.',
    steps: [
      s({
        description: 'Copy job title, company and link from the posting into a spreadsheet',
        minutesPerRun: 6, runsPerWeek: 15,
        workType: WORK_TYPES.COPY_PASTE, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.SCATTERED, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Tailor the cover letter for each role',
        minutesPerRun: 20, runsPerWeek: 10,
        workType: WORK_TYPES.WRITING, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.MEDIUM, needed: NEEDED.YES,
      }),
      s({
        description: 'Update the status (applied / replied / interview) across spreadsheet, email flags and phone notes',
        minutesPerRun: 5, runsPerWeek: 20,
        workType: WORK_TYPES.DATA_ENTRY, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.SCATTERED, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Sort new emails into "recruiter", "rejection", "needs reply"',
        minutesPerRun: 4, runsPerWeek: 25,
        workType: WORK_TYPES.READING_SORTING, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.MOSTLY,
        mistakeCost: MISTAKE_COST.LOW, needed: NEEDED.YES,
      }),
      s({
        description: 'Prepare for and attend interviews',
        minutesPerRun: 60, runsPerWeek: 2,
        workType: WORK_TYPES.CUSTOMER_TALK, inputType: INPUT_TYPES.MESSY,
        infoLocation: INFO_LOCATIONS.ONE, ruleClarity: RULE_CLARITY.DEPENDS,
        mistakeCost: MISTAKE_COST.HIGH, needed: NEEDED.YES,
      }),
    ],
  },
];
