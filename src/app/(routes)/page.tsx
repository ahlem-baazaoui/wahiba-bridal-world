"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";
import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDresses, Dress } from "@/lib/data/dresses";
import { urlFor, client } from "@/lib/client"; // Make sure sanityClient is exported from your client file
import Testimonials, { GoogleReview } from "@/components/Testimonials";

// Update the Banner type to avoid 'any'
type Banner = {
  _id: string;
  image: { asset: Record<string, unknown> }; // or use a more specific type if you have one
};

export default function Home() {
  const [startDate, setStartDate] = useState<Date>();
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const router = useRouter();

  // Google reviews state (example, replace with real fetch)
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const googleUrl = "https://www.google.com/search?client=safari&sca_esv=873f597c83ac3191&rls=en&biw=1680&bih=945&sxsrf=AE3TifPuwWd78NTKuRbAeRScF61i5nfobg:1751887260132&si=AMgyJEvkVjFQtirYNBhM3ZJIRTaSJ6PxY6y1_6WZHGInbzDnMS7JaUILf1qIvvQq4DBhJ0lJ4FiODak0Ts2hFn7Sk6lIk9Ny3aJgzN2qIWWdgK54uO-H6ZwIjTVKuG4ZU2XGH5gvEdiaQgIX0ibccIp2IWoHConaYQ%3D%3D&q=Espace+Wahiba+show+room+Avis&sa=X&ved=2ahUKEwjToM7O0KqOAxVVVKQEHQ1fIm4Q0bkNegQIHRAD";

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isBannerLoading, setIsBannerLoading] = useState(true);

  useEffect(() => {
    fetchDresses().then(setDresses);
  }, []);

  // Fetch banner images from Sanity
  useEffect(() => {
    async function fetchBannerImages() {
      // Query for banners with a single image field
      const banners: Banner[] = await client.fetch(
        `*[_type == "banner"]{_id, image{asset}}`
      );
      // Map each banner's image to a URL
      const urls = banners
        .filter(banner => banner.image && banner.image.asset)
        .map(banner => urlFor(banner.image.asset).url());
      setCarouselImages(urls.length > 0 ? urls : [
        // fallback images if none in sanity
        "https://images.zen.com.tn/stypes/2_1_6cea126b3b.jpg",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      ]);
    }
    fetchBannerImages();
  }, []);

  // Wait for all banner images to load before showing the carousel
  useEffect(() => {
    if (carouselImages.length === 0) return;
    let loaded = 0;
    setIsBannerLoading(true);
    carouselImages.forEach((src) => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === carouselImages.length) setIsBannerLoading(false);
      };
      img.src = src;
    });
  }, [carouselImages]);

  useEffect(() => {
    setReviews([
      {
        author_name: "Amal Nafouti",
        profile_photo_url: "https://i0.wp.com/methodolodys.ch/wp-content/uploads/2017/04/LETTRE-A.jpg?resize=510%2C382&ssl=1",
        rating: 5,
        relative_time_description: "il y a 3 mois",
        text: "centre wahida Tunis  ♥️  Un immense merci à toute l’équipe ♥️🥰 avec une mention spéciale pour Sonia ( Bismelleh machallah Ala ydayetha) w syessa w lsen lahlou ♥️ Votre professionnalisme, votre bienveillance et votre sourire font toute la différence.  🥰 Je suis plus que satisfaite du résultat chaari ifata9  🥰♥️ Bravo et encore merci pour votre superbe travail ♥️",
      },
      {
        author_name: "Maissa Hajmabrouk",
        profile_photo_url: "https://i0.wp.com/methodolodys.ch/wp-content/uploads/2017/04/LETTRE-M.jpg?resize=510%2C382&ssl=1",
        rating: 5,
        relative_time_description: "il y a 1 mois",
        text: "Un grand merci à toute l’équipe du Centre de coiffure Espace Wahiba pour leur accueil chaleureux et leur excellent service ! Le maquillage était magnifique, parfaitement réalisé pour chacune d’entre nous. Merci pour votre professionnalisme et votre gentillesse, on reviendra avec plaisir !",
      },
      {
        author_name: "Anaghim Ben Souissi",
        profile_photo_url: "https://lh3.googleusercontent.com/a-/ALV-UjU_HTk_4ncPjwuLDOGe_G_9z2kPuiwRq7fmgtg3rtsC3pTOu5-o=w72-h72-p-rp-mo-br100",
        rating: 5,
        relative_time_description: "il y a 3 semaines",
        text: "Aujourd’hui, j’ai réalisé un balayage chez Wahiba Centre et je tiens à remercier Sihem, la coiffeuse qui s’est occupée de moi 💗 Elle est très professionnelle, gentille et aimable. Grâce à son savoir-faire, mes cheveux sont devenus sublimes ! Je suis vraiment ravie du résultat. Un grand merci à elle pour son excellent travail 💕",
      },
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const handleBrowseDresses = () => {
    if (startDate) {
      router.push(`/dresses?date=${startDate.toISOString()}`);
    } else {
      router.push('/dresses');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        {isBannerLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#bdbdbd] to-[#d2c8a3] z-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-[#bfa76a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#bfa76a" strokeWidth="4"></circle>
                <path className="opacity-75" fill="#bfa76a" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-[#bfa76a] text-lg font-medium">Chargement...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Sliding images in a flex row */}
              <div
                className="flex h-full w-full transition-transform duration-1000"
                style={{
                  width: `${carouselImages.length * 100}%`,
                  transform: `translateX(-${carouselIndex * (100 / carouselImages.length)}%)`,
                }}
              >
                {carouselImages.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`carousel-${idx}`}
                    className="w-full h-full object-cover flex-shrink-0"
                    style={{ width: `${100 / carouselImages.length}%` }}
                    data-carousel={idx}
                  />
                ))}
              </div>
              {/* Blurred dark overlay for readability */}
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.2px] pointer-events-none" />
              {/* Optional: stronger shadow at the bottom for text */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 100%)",
                }}
              />
              {/* Optional: subtle top shadow for text */}
              <div
                className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)",
                  filter: "blur(1px)",
                }}
              />
            </div>

            <div className="relative z-10 text-center text-white space-y-8">
              <AnimatedWrapper>
                <h1 className="text-5xl font-bold">
                  Trouvez votre robe parfaite
                </h1>
              </AnimatedWrapper>
              
              <AnimatedWrapper delay={0.2}>
                <p className="text-xl max-w-2xl mx-auto">
                  Louez de magnifiques robes pour toutes les occasions. Du décontracté au formel, nous avons la robe parfaite pour vous.
                </p>
              </AnimatedWrapper>
              
              <AnimatedWrapper delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <Button size="lg" onClick={handleBrowseDresses} className="w-auto">
                    Voir les robes
                  </Button>
                </div>
              </AnimatedWrapper>
            </div>
          </>
        )}
      </section>

      <section className="container mx-auto py-16 px-4">
        <AnimatedWrapper>
          <h2 className="text-3xl font-bold text-center mb-12">
            Robes en vedette
          </h2>
        </AnimatedWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dresses
            .filter(dress => 
              dress.colors && 
              dress.colors.length > 0 && 
              dress.colors[0].images && 
              dress.colors[0].images.length > 0 && 
              dress.colors[0].images[0].asset
            )
            .slice(0, 3)
            .map((dress, index) => (
            <AnimatedWrapper key={dress._id} delay={0.2 * index}>
              <Link
                href={`/dress/${dress._id}`}
                className="group block relative"
              >
                {/* Discount badge */}
                {(dress.isRentOnDiscount || dress.isSellOnDiscount) && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow">
                    Promo
                  </span>
                )}
                <div className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={urlFor(dress.colors[0].images[0].asset).url()}
                      alt={dress.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{dress.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {/* Rental price */}
                      {dress.isRentOnDiscount && dress.newPricePerDay ? (
                        <div>
                          <span className="line-through text-gray-400">{dress.pricePerDay} TND/jour</span>
                          <span className="text-red-600 font-bold ml-2">{dress.newPricePerDay} TND/jour</span>
                        </div>
                      ) : (
                        <div>
                          <span>{dress.pricePerDay} TND/jour</span>
                        </div>
                      )}
                      {/* Sale price */}
                      {dress.isForSale &&
                        (dress.isSellOnDiscount && dress.newBuyPrice ? (
                          <div>
                            <span className="line-through text-gray-400">{dress.buyPrice} TND à acheter</span>
                            <span className="text-red-600 font-bold ml-2">{dress.newBuyPrice} TND à acheter</span>
                          </div>
                        ) : (
                          <div>
                            <span>{dress.buyPrice} TND à acheter</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedWrapper>
          ))}
        </div>
      </section>
      {/* Testimonials Section */}
      <Testimonials reviews={reviews} googleUrl={googleUrl} />
    </div>
  );
}
