"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react"; // Import useState and useEffect

// Import your Sanity client and urlFor utility
import { client, urlFor } from "@/lib/client"; // Adjust this path to your actual client file

type SanityImage = {
  _id: string;
  image: { asset: Record<string, unknown> }; // or use a more specific type if you have one
};


export default function AboutPage() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const images: SanityImage[] = await client.fetch(
          `*[_type == "aboutUsImages"]{_id, image{asset}}`
        );
        const urls = images
          .filter(image => image.image && image.image.asset)
          .map(image => urlFor(image.image.asset).url());
        setGalleryImages(urls);
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
        setError("Impossible de charger les images de la galerie."); // Translated error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          À propos de nous
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Votre destination privilégiée pour la location de robes de créateurs. Nous apportons la mode de luxe à vos occasions spéciales.
        </motion.p>
      </div>

      {/* Story Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 gap-12 items-center mb-16"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Wahiba Bridal World est l&apos;endroit où la romance moderne rencontre l&apos;élégance intemporelle. Nous proposons une collection soignée de robes de mariée et d&apos;accessoires exquis, conçus pour que chaque mariée se sente belle, confiante et absolument unique le jour de son mariage.
          </p>
          <p className="text-gray-600">
            Notre équipe sympathique et compétente est là pour vous offrir une expérience fluide et joyeuse, de votre première consultation à la découverte de &quot;la bonne&quot;. Laissez-nous vous aider à commencer votre éternité avec style.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold mb-2 text-gray-700">Notre histoire</span>
          <div className="relative aspect-[4/5] w-full max-w-xs md:max-w-sm lg:max-w-md rounded-lg overflow-hidden shadow-lg mx-auto">
            {/* If this image is always visible when the page loads, consider using `priority` here.
                Otherwise, keep it as an `<img>` tag or `Next/Image` without `priority` for lazy loading. */}
            <img
              src="./about-1.jpeg" // Keeping this as a local asset for now, or you can fetch it from Sanity too
              alt="Notre histoire"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Mission & Values */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Notre mission & valeurs</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Donner confiance et élégance à chaque mariée.</h3>
            <p className="text-gray-600">
              Nous croyons que trouver la robe de mariée parfaite est une expérience transformatrice. 
              Notre mission est de sélectionner avec soin une collection de tenues de mariage qui reflète à la fois les dernières tendances et les styles intemporels, tout en permettant à chaque mariée de se sentir la plus belle, confiante et authentique le jour de son mariage. Nous nous engageons à réaliser sa vision la plus radieuse.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Un accompagnement personnalisé et un soutien sans faille.</h3>
            <p className="text-gray-600">
              Nous comprenons l&apos;importance de ce moment. 
              Notre engagement est d&apos;offrir une expérience intime, sans stress et hautement personnalisée. 
              De la première consultation au dernier essayage, notre équipe experte offre une attention dédiée, des conseils empathiques et un soutien constant, pour que chaque mariée se sente choyée, écoutée et totalement à l&apos;aise tout au long de son parcours avec nous.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Un savoir-faire exquis & une qualité intemporelle.</h3>
            <p className="text-gray-600">
              Nous sommes passionnés par l&apos;artisanat derrière chaque robe. 
              Nous promettons une sélection caractérisée par un savoir-faire exceptionnel, des tissus luxueux et une attention aux détails. Notre valeur réside dans l&apos;offre de tenues de mariage de la plus haute qualité, non seulement magnifiques mais aussi durables, devenant ainsi un souvenir précieux du plus beau jour de la vie d&apos;une mariée.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Gallery Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Galerie de moments inoubliables</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-center">
          Découvrez quelques souvenirs et instants précieux capturés dans notre showroom et lors de nos événements. Chaque photo reflète l&apos;élégance, la joie et la passion qui animent Wahiba Bridal World.
        </p>

        {isLoading && (
          <p className="text-center text-gray-500">Chargement des images...</p> // Translated loading message
        )}
        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}
        {!isLoading && !error && galleryImages.length === 0 && (
          <p className="text-center text-gray-500">Aucune image disponible pour la galerie.</p> // Translated no images message
        )}

        {!isLoading && !error && galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <motion.div
                key={idx} // Use _key from Sanity if available, otherwise idx
                className="relative overflow-hidden rounded-lg group aspect-[3/4] shadow-md"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
              >
                <Image
                  src={img} // Use urlFor to get the image URL from Sanity asset
                  alt={`Galerie Wahiba Bridal ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 rounded-lg"
                  priority={idx < 3} // Priority for the first 3 images, adjust as needed
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}