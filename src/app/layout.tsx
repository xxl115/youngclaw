import type { Metadata, Viewport } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "SwarmClaw",
  description: "AI agent orchestration dashboard with multi-provider support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SwarmClaw",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#6366F1",
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var themeMode = localStorage.getItem('sc_theme_mode') || 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(themeMode);
                  document.documentElement.setAttribute('data-theme', themeMode);
                } catch(e) {}
              })();

              if (!crypto.randomUUID) {
                crypto.randomUUID = function() {
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                };
              }
            `,
          }}
        />
      </head>
      <body className="antialiased" cz-shortcut-listen="true">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
