import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://world-cup-26-bracket-gamma.vercel.app"),
  title: "Road to the Final | FIFA World Cup 26",
  description: "Explore the FIFA World Cup 26 knockout bracket, trace every team’s route, and inspect match results in an interactive radial view.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FIFA World Cup 26",
    title: "Road to the Final | FIFA World Cup 26",
    description: "Trace every team’s route through the FIFA World Cup 26 knockout bracket.",
    images: [
      {
        url: "/og-world-cup-bracket.png",
        width: 1200,
        height: 630,
        alt: "FIFA World Cup trophy surrounded by a radial knockout bracket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Road to the Final | FIFA World Cup 26",
    description: "Trace every team’s route through the FIFA World Cup 26 knockout bracket.",
    images: ["/og-world-cup-bracket.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={caveat.variable}>{children}</body>
    </html>
  );
}
