import { z } from "zod";

/** One stage of a career path, as written by the AI model. */
const Stage = z.object({
  title: z.string().describe("Stage name, e.g. 'University (years 1-2)' or 'Analyst'"),
  yearsMin: z.number().describe("Typical minimum years spent in this stage"),
  yearsMax: z.number().describe("Typical maximum years spent in this stage"),
  study: z.array(z.string()).describe("What to study or learn at this stage"),
  experience: z.array(z.string()).describe("Experience to gain at this stage"),
  certifications: z.array(z.string()).describe("Certifications, licences or exams at this stage, with the awarding body"),
  payEstimate: z.string().describe("Typical pay at this stage in the country's currency, e.g. 'about UGX 1.5M-2.5M a month'. Empty string if unknown"),
});

/** A side branch of the tree: another way in, or a common move out. */
const Branch = z.object({
  afterStage: z.number().describe("Index (0-based) of the stage this branch leaves from or joins at"),
  kind: z.enum(["alternative-entry", "exit"]),
  title: z.string(),
  detail: z.string(),
});

/** Structured output requested from the model; validated before it is shown. */
export const AiPathSchema = z.object({
  recognised: z.boolean().describe("False when the request is not about a career or study path"),
  message: z.string().describe("When recognised is false: one short, friendly sentence explaining what the tool can do. Otherwise empty"),
  career: z.string().describe("The goal career's usual name"),
  country: z.string().describe("Country the path is for, or 'Global'"),
  summary: z.string().describe("Two sentences: what the work is and how long the path usually takes"),
  isco: z.string().describe("ISCO-08 four-digit unit group code for the goal career, e.g. '2413'. Empty string if unsure"),
  stages: z.array(Stage),
  branches: z.array(Branch),
  bodiesToCheck: z.array(z.string()).describe("Official regulators, professional bodies and exam boards in the country to confirm requirements with"),
  caveats: z.array(z.string()).describe("Short notes on what varies or is uncertain"),
});

export type AiPath = z.infer<typeof AiPathSchema>;
