import type { Metadata } from "next"
import { HomeHero } from "@/components/home/HomeHero"
import { HomeCategories } from "@/components/home/HomeCategories"
import {
  HomeBestSellers,
  HomeNewArrivals,
  HomeBestOffers,
} from "@/components/home/HomeProductSections"
import { HomePromoBanner } from "@/components/home/HomePromoBanner"
import { HomeBrands } from "@/components/home/HomeBrands"
import { HomeReviews } from "@/components/home/HomeReviews"
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip"
import { HomeNewsletter } from "@/components/home/HomeNewsletter"
import {
  getRootCategories,
  getBestsellerProducts,
  getNewArrivalProducts,
  getBestOfferProducts,
  getBrands,
  getHeroSlides,
  getPromoTiles,
  getApprovedReviews,
} from "@/lib/supabase/queries"

export const metadata: Metadata = {
  title: "ProExcel — Librairie & Papeterie Premium au Maroc",
  description:
    "Achetez vos livres scolaires, papeterie de marque, fournitures et kits scolaires au Maroc. Livraison rapide à domicile, paiement à la livraison.",
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [
    categories,
    bestSellers,
    newArrivals,
    brands,
    heroSlides,
    promoTiles,
    reviews,
  ] = await Promise.all([
    getRootCategories(),
    getBestsellerProducts(8),
    getNewArrivalProducts(8),
    getBrands(),
    getHeroSlides(),
    getPromoTiles(),
    getApprovedReviews(6),
  ])

  // Avoid unnecessary duplicate products between bestsellers and best offers
  const bestsellerIds = bestSellers.map((p) => p.id)
  const bestOffers = await getBestOfferProducts(bestsellerIds, 8)

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <HomeHero slides={heroSlides} promoTiles={promoTiles} />

      {/* 2. Main Categories Grid */}
      <HomeCategories categories={categories} />

      {/* 3. Featured Products: Best Sellers */}
      <HomeBestSellers products={bestSellers} />

      {/* 4. Promotional Banner */}
      <HomePromoBanner />

      {/* 5. Featured Products: New Arrivals */}
      <HomeNewArrivals products={newArrivals} />

      {/* 6. Featured Products: Best Offers */}
      <HomeBestOffers products={bestOffers} />

      {/* 7. Partner Brands Strip */}
      <HomeBrands brands={brands} />

      {/* 8. Customer Reviews / Social Proof */}
      <HomeReviews reviews={reviews} />

      {/* 9. Trust & Guarantees Strip */}
      <HomeTrustStrip />

      {/* 10. Newsletter Subscription */}
      <HomeNewsletter />
    </div>
  )
}
