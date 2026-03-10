import HomePage from "@/components/home-page";
import { getAllWebsiteData } from "@/lib/data-source";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getAllWebsiteData();

  return <HomePage data={data} />;
}
