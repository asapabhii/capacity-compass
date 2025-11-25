import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacity Compass - Workload Risk Forecaster",
  description: "Forecast your workload risk and optimize task allocation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className="bg-[#0f1117] text-gray-100 antialiased">{children}</body>
    </html>
  );
}
