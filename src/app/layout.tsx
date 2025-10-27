import type { Metadata } from "next";
import "./globals.css";
import { TabsProvider } from "@/contexts/TabsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import ConditionalLayout from "@/components/ConditionalLayout";

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
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            
            {/* Toaster for notifications */}
            <Toaster position="top-right" richColors />
          </TabsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
