import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar/AnnouncementBar";
import { Header } from "@/components/layout/Header/Header";
import { MobileNav } from "@/components/layout/MobileNav/MobileNav";
import { Footer } from "@/components/layout/Footer/Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer/CartDrawer";

/** Layout boutique : bandeau + header + contenu + footer, barre basse mobile (sitemap 1.2). */
export default function BoutiqueLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="contenu" className="pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
    </>
  );
}
