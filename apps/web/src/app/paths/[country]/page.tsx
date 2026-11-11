import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { careerGraphData } from "@careerproof/sample-data";
import { countryOptions, PathsPage } from "@/components/paths/paths-page";

const options = countryOptions(careerGraphData.locations);
const find = (code: string) => options.find((c) => c.code === code.toUpperCase());

export function generateStaticParams() {
  return [{ country: "ug" }, { country: "ke" }, { country: "za" }, { country: "gb" }, { country: "us" }];
}

export async function generateMetadata({ params }: PageProps<"/paths/[country]">): Promise<Metadata> {
  const { country } = await params;
  const c = find(country);
  return {
    title: c ? `Career path planner: ${c.name}` : "Career path planner",
    description: c ? `Plan a route to any career in ${c.name}, with official pay by occupation group and the qualifications in between.` : undefined,
    alternates: { canonical: c ? `/paths/${c.code.toLowerCase()}` : "/paths" },
  };
}

async function Content({ params }: Pick<PageProps<"/paths/[country]">, "params">) {
  const { country } = await params;
  const c = find(country);
  if (!c) notFound();
  return <PathsPage country={c.code} countries={options} />;
}

export default function Page({ params }: PageProps<"/paths/[country]">) {
  return <Suspense><Content params={params} /></Suspense>;
}
