import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Kalp Library | Books, Cinema and More",
  description: "A sanctuary for your books, movies, and TV shows. AI research, mood-based recommendations, thought journaling, and an ever-growing bookshelf.",
  icons: {
    icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsCB3GajvxoqOQ5bTApddi2GKZR7wELSD6GHk9ig_xXkjvKDgY1_TAaJTU0n3YsGsaXdWpbRTl6_61rJJZHh911TWNEfGOxsVpkY7PaCALedHiXRz8FuF_9AKPDmWAdiV9tRxGfQ1coOwrprK2lRomOi0OJ12rJNAzBIQm-41mKlEBELIFJYa_iuqnJ-ZWRveyYVCYIE-EqUB5vNUF5XH8vqPSLWaThkaS_3S8_vfNRmyl-pBiQNrJ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              var saved = localStorage.getItem('kalp_theme');
              var isDark = saved ? saved === 'dark' : true;
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-brand-secondary/30 selection:text-brand-primary">
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

