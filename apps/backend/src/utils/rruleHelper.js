const { RRule, RRuleSet, rrulestr } = require('rrule');

/**
 * Validates RRULE string
 */
const validateRRule = (rruleString) => {
  try {
    rrulestr(rruleString);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Get occurrences from RRULE
 */
const getOccurrences = (rruleString, startDate, endDate, limit = 100) => {
  try {
    const rule = rrulestr(rruleString);
    const occurrences = rule.between(new Date(startDate), new Date(endDate), true, limit);
    return occurrences;
  } catch (error) {
    return [];
  }
};

/**
 * Check if two batches have schedule conflicts
 */
const hasScheduleConflict = (batch1, batch2) => {
  // Simple overlap check for date ranges
  const start1 = new Date(batch1.startDate);
  const end1 = new Date(batch1.endDate);
  const start2 = new Date(batch2.startDate);
  const end2 = new Date(batch2.endDate);

  // Check if date ranges overlap
  if (start1 > end2 || start2 > end1) {
    return false; // No overlap
  }

  // If both have RRULE, check for schedule conflicts
  if (batch1.rrule && batch2.rrule) {
    const occurrences1 = getOccurrences(batch1.rrule, start1, end1);
    const occurrences2 = getOccurrences(batch2.rrule, start2, end2);

    // Simple check: if any occurrence dates match, there's a conflict
    for (const occ1 of occurrences1) {
      for (const occ2 of occurrences2) {
        if (occ1.toDateString() === occ2.toDateString()) {
          return true;
        }
      }
    }
  }

  return true; // Assume conflict if overlapping and no specific RRULE check
};

module.exports = {
  validateRRule,
  getOccurrences,
  hasScheduleConflict,
};

