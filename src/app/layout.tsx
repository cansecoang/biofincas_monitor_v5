import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { TabsProvider } from "@/contexts/TabsContext";

export const metadata: Metadata = {
  title: "Biofincas - Product Report",
  description: "Product Report MVP - Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <TabsProvider>
          {/* Sidebar - Navigation Vertical Principal (NVP) */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="ml-[60px]">
            {/* TopBar - Site ID and User Info */}
            <TopBar />
            
            {/* Content Area - padding top dinámico para TopBar + Tabs */}
            <main className="pt-16 min-h-screen bg-gray-50">
              {children}
            </main>
          </div>
        </TabsProvider>
      </body>
    </html>
  );
}
