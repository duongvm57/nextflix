'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getNewMovies, getMovieDetail, getCategories, getCountries } from '@/services/phimapi';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<
    Array<{
      _id: string;
      name: string;
      origin_name: string;
      thumb_url: string;
      year: number;
      quality: string;
      lang: string;
      slug: string;
    }>
  >([]);
  const [movieDetail, setMovieDetail] = useState<{
    _id: string;
    name: string;
    origin_name: string;
    thumb_url: string;
    content: string;
    year: number;
    quality: string;
    lang: string;
    time: string;
    episodes?: Array<{
      server_name: string;
      items: Array<{
        name: string;
      }>;
    }>;
  } | null>(null);
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [countries, setCountries] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch new movies
        const moviesResponse = await getNewMovies(1);
        setMovies(moviesResponse.data);

        // Fetch movie detail if we have movies
        if (moviesResponse.data.length > 0) {
          const movieDetailResponse = await getMovieDetail(moviesResponse.data[0].slug);
          setMovieDetail(movieDetailResponse);
        }

        // Fetch categories and countries
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse);

        const countriesResponse = await getCountries();
        setCountries(countriesResponse);

        setLoading(false);
      } catch (err) {
        setError('Error fetching data: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">API Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">API Test</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">New Movies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {movies.slice(0, 4).map(movie => (
            <div key={movie._id} className="border rounded p-2">
              <div className="w-full h-40 mb-2 relative">
                <Image src={movie.thumb_url} alt={movie.name} fill className="object-cover" />
              </div>
              <h3 className="font-bold">{movie.name}</h3>
              <p className="text-sm text-gray-500">{movie.origin_name}</p>
              <p className="text-xs">Year: {movie.year}</p>
              <p className="text-xs">Quality: {movie.quality}</p>
              <p className="text-xs">Lang: {movie.lang}</p>
            </div>
          ))}
        </div>
      </div>

      {movieDetail && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Movie Detail</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4 relative aspect-[2/3]">
              <Image
                src={movieDetail.thumb_url}
                alt={movieDetail.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{movieDetail.name}</h3>
              <p className="text-gray-500">{movieDetail.origin_name}</p>
              <p className="my-2">{movieDetail.content}</p>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <span className="font-bold">Year:</span> {movieDetail.year}
                </p>
                <p>
                  <span className="font-bold">Quality:</span> {movieDetail.quality}
                </p>
                <p>
                  <span className="font-bold">Language:</span> {movieDetail.lang}
                </p>
                <p>
                  <span className="font-bold">Duration:</span> {movieDetail.time}
                </p>
              </div>

              {movieDetail.episodes && movieDetail.episodes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold">Episodes</h4>
                  <div>
                    {movieDetail.episodes.map((server, index) => (
                      <div key={index} className="mb-2">
                        <p className="font-semibold">{server.server_name}</p>
                        <div className="flex flex-wrap gap-2">
                          {server.items.slice(0, 5).map((episode, episodeIndex) => (
                            <span
                              key={episodeIndex}
                              className="bg-gray-200 text-black px-2 py-1 rounded text-sm"
                            >
                              {episode.name}
                            </span>
                          ))}
                          {server.items.length > 5 && <span>...</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-2">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <span key={category.id} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                {category.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Countries</h2>
          <div className="flex flex-wrap gap-2">
            {countries.map(country => (
              <span key={country.id} className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                {country.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
