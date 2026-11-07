import type { RuleSet } from "./types";

export class UnknownGradeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownGradeError";
  }
}

/** Points for one subject result, using the subject grade scale from the rule set. */
export function gradePoints(ruleSet: RuleSet, subjectCode: string, grade: string): number {
  const subject = ruleSet.subjects[subjectCode];
  if (!subject) {
    throw new UnknownGradeError(`Subject "${subjectCode}" is not defined in ${ruleSet.framework}`);
  }
  const scale = ruleSet.grades[subject.scale];
  const points = scale?.[grade];
  if (points === undefined) {
    throw new UnknownGradeError(
      `Grade "${grade}" is not valid for ${subject.name} in ${ruleSet.framework}`,
    );
  }
  return points;
}

/** Points for a grade label on a named scale (used for minimum-grade checks). */
export function scalePoints(ruleSet: RuleSet, scaleName: string, grade: string): number {
  const points = ruleSet.grades[scaleName]?.[grade];
  if (points === undefined) {
    throw new UnknownGradeError(`Grade "${grade}" is not on scale "${scaleName}"`);
  }
  return points;
}
