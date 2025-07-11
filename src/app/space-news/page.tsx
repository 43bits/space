'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Telescope } from 'lucide-react';

type ApodResponse = {
  title: string;
  explanation: string;
  url: string;
  date: string;
  media_type: 'image' | 'video';
};

type NewsItem = {
  title: string;
  description: string;
  date_created: string;
  nasa_id: string;
  thumbnail: string;
};

export default function SpaceNewsPage() {
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingApod, setLoadingApod] = useState(true);

  // Fetch APOD
  useEffect(() => {
    const fetchApod = async () => {
      try {
        const res = await axios.get(
          `https://api.nasa.gov/planetary/apod?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`
        );
        setApod(res.data);
      } catch (err) {
        console.error('Error fetching APOD:', err);
      } finally {
        setLoadingApod(false);
      }
    };

    fetchApod();
  }, []);

  // Fetch recent NASA images
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('https://images-api.nasa.gov/search', {
          params: {
            q: 'space',
            media_type: 'image',
            year_start: '2023',
            year_end: '2025',
            page_size: 100,
          },
        });

        const items = res.data.collection.items;

        const formattedNews: NewsItem[] = items
  .map((item: any): NewsItem => ({
    title: item.data?.[0]?.title ?? '',
    description: item.data?.[0]?.description ?? '',
    date_created: item.data?.[0]?.date_created ?? '',
    nasa_id: item.data?.[0]?.nasa_id ?? '',
    thumbnail: item.links?.[0]?.href ?? '',
  }))
  .filter((item: NewsItem) => 
    item.thumbnail && item.description && item.nasa_id && item.date_created
  )
  .sort(
    (a: NewsItem, b: NewsItem) =>
      new Date(b.date_created).getTime() -
      new Date(a.date_created).getTime()
  )
  .slice(0, 12);


        setNews(formattedNews);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
    
      <div className="flex items-center gap-2 mb-6">
        <Telescope className="text-blue-500 w-6 h-6" />
        <h1 className="text-3xl font-bold text-blue-600">Space News & Daily Astronomy</h1>
      </div>

     
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Astronomy Picture of the Day</h2>
        {loadingApod ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : apod ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{apod.title}</h3>
            <p className="text-sm text-gray-500">{apod.date}</p>
            {apod.media_type === 'image' ? (
              <img
                src={apod.url}
                alt={apod.title}
                className="rounded-lg shadow-md w-full max-h-[500px] object-contain"
              />
            ) : (
              <iframe
                src={apod.url}
                title={apod.title}
                className="w-full aspect-video rounded-lg shadow"
                allowFullScreen
              />
            )}
            <p className="text-muted-foreground">{apod.explanation}</p>
          </div>
        ) : (
          <p className="text-red-500">Failed to load Astronomy Picture of the Day.</p>
        )}
      </section>

     
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent NASA Highlights</h2>
        {loadingNews ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : news.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <a
                href={`https://images.nasa.gov/details-${item.nasa_id}`}
                target="_blank"
                rel="noopener noreferrer"
                key={item.nasa_id}
                className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-md hover:scale-[1.015] hover:shadow-lg transition-transform duration-300 flex flex-col"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="rounded-lg h-48 object-cover mb-3"
                />
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{new Date(item.date_created).toDateString()}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-red-500">No news found.</p>
        )}
      </section>
    </div>
  );
}
