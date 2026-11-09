import { redirect } from "next/navigation";
import { GLOBAL } from "@/lib/careers";

export default function CareersIndex() {
  redirect(`/careers/${GLOBAL}`);
}
