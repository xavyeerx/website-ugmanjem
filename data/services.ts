import type { Service, ServiceTab } from "@/types";

export const serviceTabs: ServiceTab[] = [
  { id: "all", name: "All" },
  { id: "anjem", name: "Anjem" },
  { id: "jastip", name: "Jastip" },
  { id: "survei", name: "Survei Kost" },
  { id: "berkas", name: "Urus Berkas" },
];

export const services: Service[] = [
  {
    id: 1,
    title: "Antar Jemput",
    image: "/images/service-anjem.jpg",
    rating: 5,
    trips: "40.000+",
    price: "RP 5K",
    category: "anjem",
  },
  {
    id: 2,
    title: "Jasa Titip",
    image: "/images/service-jastip.jpg",
    rating: 5,
    trips: "12.000+",
    price: "RP 6k",
    category: "jastip",
  },
  {
    id: 3,
    title: "Survei Kost",
    image: "/images/service-survei.jpg",
    rating: 5,
    trips: "50+",
    price: "RP 15k",
    category: "survei",
  },
  {
    id: 4,
    title: "Urus Berkas Kampus",
    image: "/images/service-berkas.jpg",
    rating: 5,
    trips: "200+",
    price: "RP 15k",
    category: "berkas",
  },
];

export const serviceDescriptions: Record<string, string> = {
  "antar-jemput":
    "Butuh dianter atau dijemput ke kampus? Kamu bisa pesan driver buat antar sampai tujuan kok!",
  jastip:
    "Mager keluar tapi pengen sesuatu? Kamu bisa titip driver buat beliin lhoo!",
};

