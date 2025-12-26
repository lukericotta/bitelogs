import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopRatedItem, RecentReview } from '@bitelogs/shared';
// FIX: Corrected import paths - using '../services' not '../../services'
import { discoveryService } from '../services';
// FIX: Corrected import paths - using '../components/ui' not '../ui'
import { StarRating, LoadingSpinner } from '../components/ui';

const HomePage = () => {
  const [topRated, setTopRated] = useState<TopRatedItem[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const [rated, recent] = await Promise.all([
          discoveryService.getTopRated(6),
          discoveryService.getRecent(4),
        ]);
        if (!controller.signal.aborted) {
          setTopRated(rated);
          setRecentReviews(recent);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch home data:', error);
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
    <div>
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Discover Your Next Favorite Bite
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Explore menu items, read honest reviews, and share your culinary adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/restaurants" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Browse Restaurants
            </Link>
            <Link to="/discover" className="btn-outline border-white text-white hover:bg-white/10">
              Discover Dishes
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Top Rated Dishes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRated.map((item) => (
              <Link
                key={item.id}
                to={`/menu-items/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍴</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.restaurant.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={item.avgRating} size="sm" />
                    <span className="text-sm text-gray-600">({item.reviewCount})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Recent Reviews
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold">
                      {review.user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{review.user.displayName}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <Link 
                      to={`/menu-items/${review.menuItem.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {review.menuItem.name} at {review.menuItem.restaurant.name}
                    </Link>
                    {review.comment && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
