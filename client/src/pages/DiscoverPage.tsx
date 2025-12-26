import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopRatedItem, PhotoItem } from '@bitelogs/shared';
import { discoveryService } from '../services';
import { StarRating, LoadingSpinner } from '../components/ui';

const DiscoverPage = () => {
  const [topRated, setTopRated] = useState<TopRatedItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const [rated, photoItems] = await Promise.all([
          discoveryService.getTopRated(12),
          discoveryService.getPhotos(12),
        ]);
        if (!controller.signal.aborted) {
          setTopRated(rated);
          setPhotos(photoItems);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch discovery data:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Discover</h1>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Top Rated Dishes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRated.map((item) => (
            <Link
              key={item.id}
              to={`/menu-items/${item.id}`}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍴</div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.restaurant.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={item.avgRating} size="sm" />
                <span className="text-sm text-gray-600">({item.reviewCount})</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Recent Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              to={`/menu-items/${photo.menuItem.id}`}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img src={photo.imageUrl} alt={photo.menuItem.name} className="w-full h-full object-cover" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverPage;
