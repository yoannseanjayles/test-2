import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar/AnnouncementBar";
import { Header } from "@/components/layout/Header/Header";
import { MobileNav } from "@/components/layout/MobileNav/MobileNav";
import { Footer } from "@/components/layout/Footer/Footer";
import { animalCategories } from "@/lib/navigation";
import { illustrations } from "@/lib/media";

/** 404 enrichie (sitemap 1.2 §2.7) : illustration M-ILL-02, recherche et catégories populaires. */
export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="contenu" className="pb-16 lg:pb-0">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-20">
          <div>
            <p className="text-label text-bark-700">Erreur 404</p>
            <h1 className="font-display mt-2 text-h1 font-[560] text-bark-900">
              Quelqu'un a caché cette page.
            </h1>
            <p className="mt-4 max-w-lg text-body text-bark-700">
              La page que vous cherchez n'existe pas ou n'existe plus. Reprenez
              par la recherche, ou repartez d'un univers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/recherche"
                className="text-label inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-white transition duration-150 hover:bg-action-hover"
              >
                Rechercher un produit
              </Link>
              {animalCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="text-label inline-flex min-h-11 items-center rounded-md border-[1.5px] border-action px-5 py-3 text-action transition duration-150 hover:bg-pine-50"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
          <Image
            src={illustrations.notFound}
            alt=""
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="mx-auto h-auto w-full max-w-md rounded-lg"
          />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
