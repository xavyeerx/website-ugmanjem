import HomePage from "@/components/home-page";
import { getAllWebsiteData } from "@/lib/data-source";

export const revalidate = 3600;

export default async function Home() {
  const data = await getAllWebsiteData();

  return <HomePage data={data} />;
}
