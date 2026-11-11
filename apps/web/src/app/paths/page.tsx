import type { Metadata } from "next";
import { careerGraphData } from "@careerproof/sample-data";
import { countryOptions, PathsPage } from "@/components/paths/paths-page";

export const metadata: Metadata = {
  title: "Career path planner",
  description: "Plan a route from school or any career to any other, with every alternative route, the qualifications in between and official pay by country.",
  alternates: { canonical: "/paths" },
};

export default function Page() {
  return <PathsPage country={null} countries={countryOptions(careerGraphData.locations)} />;
}
