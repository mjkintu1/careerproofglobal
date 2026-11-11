import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { Simulator } from "@/components/simulator/simulator";

export const metadata: Metadata = seo("/simulator", {
  title: "Admission simulator",
  description: "Enter your results to see your points, which programmes are open to you, and how your points compare with past cut-offs.",
});

export default function SimulatorPage() {
  return (
    <>
      <PageBand kicker="Career tools" title="Admission simulator"
        intro="Enter your results to see your points, which programmes are open to you, and how you compare with past cut-off points." />
      <Container className="py-10">
        <Simulator />
      </Container>
    </>
  );
}
