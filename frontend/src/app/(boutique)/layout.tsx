import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BottomBar } from "@/components/layout/BottomBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Layout boutique (D-048) : header/footer complets.
 * Le tunnel (panier/checkout) et le compte auront leurs propres layouts.
 */
export default function BoutiqueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-heading focus:text-sm"
      >
        Aller au contenu
      </a>
      <AnnouncementBar />
      <Header />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
      <BottomBar />
    </>
  );
}
