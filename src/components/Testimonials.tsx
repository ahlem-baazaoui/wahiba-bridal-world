import React from "react";
import { Button } from "@/components/ui/button";

export type GoogleReview = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
};

export default function Testimonials({ reviews, googleUrl }: { reviews: GoogleReview[]; googleUrl: string }) {
  if (!reviews || reviews.length === 0) return null;
  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-center mb-8">Avis de nos clients</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 3).map((review, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={review.profile_photo_url} alt={review.author_name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{review.author_name}</div>
                <div className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="text-xs text-gray-400">{review.relative_time_description}</div>
              </div>
            </div>
            <div className="text-gray-700">{review.text}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="link">
            Voir tous les avis sur Google
          </Button>
        </a>
      </div>
    </section>
  );
}
