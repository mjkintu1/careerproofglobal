/**
 * ILLUSTRATIVE SAMPLE DATA, for demos and tests only.
 * Rule values follow the published structure of each system but are NOT
 * verified. Programme codes (DEMO-*) and every cut-off are made up.
 * Never present these as official admission figures.
 */
import type { Programme, RuleSet } from "@careerproof/rules-engine";
import keProgrammes from "./ke-programmes.json";
import keRules from "./ke-rules.json";
import ugProgrammes from "./ug-programmes.json";
import ugRules from "./ug-rules.json";

export interface CountryDataset {
  region: string;
  name: string;
  ruleSet: RuleSet;
  programmes: Programme[];
}

export const datasets: CountryDataset[] = [
  { region: "UG", name: "Uganda", ruleSet: ugRules as RuleSet, programmes: ugProgrammes as Programme[] },
  { region: "KE", name: "Kenya", ruleSet: keRules as RuleSet, programmes: keProgrammes as Programme[] },
];

export function datasetFor(region: string): CountryDataset | undefined {
  return datasets.find((d) => d.region === region);
}

export { careerGraphData, subjectRules, type SubjectRules } from "./careers";
