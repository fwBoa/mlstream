import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | MLstream",
    default: "MLstream — Deploy AI as Web Apps. Instantly.",
  },
  description:
    "MLstream is a zero-friction SaaS platform that lets you deploy any AI model into an elegant, shareable web interface in minutes. No infrastructure needed.",
  keywords: ["AI", "machine learning", "deploy", "web app", "SaaS", "MLstream"],
  openGraph: {
    title: "MLstream — Deploy AI as Web Apps. Instantly.",
    description:
      "Deploy any AI model into an elegant, shareable web interface in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
