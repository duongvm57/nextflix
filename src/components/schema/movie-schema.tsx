'use client';

import { MovieDetail } from '@/types';
import { DOMAIN } from '@/lib/constants';
import Script from 'next/script';

interface MovieSchemaProps {
  movie: MovieDetail;
}

export function MovieSchema({ movie }: MovieSchemaProps) {
  // Tạo dữ liệu có cấu trúc cho phim
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.name,
    alternateName: movie.origin_name,
    description: movie.content,
    image: movie.poster_url || movie.thumb_url,
    datePublished: movie.year?.toString(),
    duration: movie.time || movie.duration,
    contentRating: movie.quality,
    inLanguage: movie.lang,
    genre: movie.genres?.map(genre => genre.name) || [],
    director:
      movie.directors?.map(director => ({
        '@type': 'Person',
        name: director,
      })) || [],
    actor:
      movie.actors?.map(actor => ({
        '@type': 'Person',
        name: actor,
      })) || [],
    countryOfOrigin:
      movie.country?.map(country => ({
        '@type': 'Country',
        name: country.name,
      })) || [],
    url: `${DOMAIN}/watch/${movie.slug}`,
  };

  return (
    <Script id="movie-schema" type="application/ld+json">
      {JSON.stringify(schemaData)}
    </Script>
  );
}
