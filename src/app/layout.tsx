import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { TabsProvider } from "@/contexts/TabsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

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
        <AuthProvider>
          <TabsProvider>
            {/* Sidebar - Navigation Vertical Principal (NVP) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-[60px]">
              {/* TopBar - Site ID and User Info */}
              <Suspense fallback={
                <div className="fixed top-0 left-[60px] right-0 h-16 bg-white border-b border-gray-200 z-40">
                  <div className="h-full px-4 flex items-center justify-between">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                </div>
              }>
                <TopBar />
              </Suspense>
              
              {/* Content Area - padding top dinámico para TopBar + Tabs */}
              <main className="pt-16 min-h-screen bg-gray-50">
                <div className="max-w-[calc(100vw-60px)] overflow-x-hidden">
                  {children}
                </div>
              </main>
            </div>
            
            {/* Toaster for notifications */}
            <Toaster position="top-right" richColors />
          </TabsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
