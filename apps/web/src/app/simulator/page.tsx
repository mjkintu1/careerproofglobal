import type { Metadata } from "next";
import { Simulator } from "@/components/simulator/simulator";

export const metadata: Metadata = {
  title: "Admission simulator",
  description:
    "Enter your results to see your points, which programmes are open to you, and how your points compare with past cut-offs.",
};

export default function SimulatorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold leading-tight">Admission simulator</h1>
        <p className="max-w-prose text-lg text-ink-muted">
          Enter your results to see your points, which programmes are open to
          you, and how you compare with past cut-off points.
        </p>
      </div>
      <Simulator />
    </div>
  );
}
