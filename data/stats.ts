import type { Stat, Feature, TutorialStep } from "@/types";

export const stats: Stat[] = [
  { value: "13", label: "Driver Active" },
  { value: "2", label: "WA Group" },
  { value: "1000+", label: "Order Complete" },
  { value: "1000+", label: "Members Group" },
];

export const features: Feature[] = [
  {
    title: "Driver Mahasiswa",
    description:
      "Driver kami 100% mahasiswa UGM, jadi lebih paham wilayah dalam kampus, bonus dapet relasi deh..",
  },
  {
    title: "Aman, Satset, Fleksibel",
    description:
      "Tinggal chat grup, kami bisa bantuin segala kebutuhanmu, penolong banget buat anak perantauan.",
  },
  {
    title: "Terjangkau & Mudah Diakses",
    description:
      "Bantu kamu lebih irit di perantauan dengan tarif yang terjangkau.",
  },
];

export const tutorialSteps: TutorialStep[] = [
  {
    step: 1,
    title: "Join WA Group",
    description:
      "Join WA Group komunitas UGM Anjem bareng mahasiswa UGM lainnya dengan",
    link: {
      text: "klik disini",
      url: "http://wa.me/6282123035583?text=Halo%20Min,%20mau%20link%20grup%20Anjem%20UGM%20dong",
    },
  },
  {
    step: 2,
    title: "Chat Order via Group",
    description:
      'Kirim pesan di group untuk dapat terhubung dengan driver ready dengan menyebutkan kebutuhanmu. Example: "Mau anjem dari FEB ke kos dong"',
  },
  {
    step: 3,
    title: "Driver Akan Take Order",
    description:
      "Driver ready akan membales pesananmu via Personal Chat (PC) dan melanjutkan detail pemesanan via PC.",
  },
  {
    step: 4,
    title: "OTW! Bayar Langsung ke Driver",
    description:
      "Shareloc dan driver kami siap menjemput, bayar dengan tunai atau QRIS.",
  },
];

export const driverRequirements: string[] = [
  "Mahasiswa UGM",
  "Memiliki kendaraan bersurat lengkap",
  "Komitmen dan banyak waktu luang",
];
