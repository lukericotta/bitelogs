import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '@bitelogs/shared';
// FIX: Corrected import paths
import { restaurantService } from '../services';
import { LoadingSpinner } from '../components/ui';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchRestaurants = async () => {
      try {
        const result = await restaurantService.getAll({ search: search || undefined });
        if (!controller.signal.aborted) {
          setRestaurants(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch restaurants:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const debounce = setTimeout(fetchRestaurants, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [search]);

  const priceRangeDisplay = (range: number) => '$'.repeat(range);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Restaurants
        </h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="input-field w-64"
          />
          <Link to="/restaurants/add" className="btn-primary">
            Add Restaurant
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[50vh]" />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">No restaurants found</p>
          <Link to="/restaurants/add" className="btn-primary">
            Add the first restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant: Restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurants/${restaurant.id}`}
              className="card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-100">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-lg text-gray-900">{restaurant.name}</h2>
                  <span className="text-green-600 font-medium">
                    {priceRangeDisplay(restaurant.priceRange)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine}</p>
                <p className="text-sm text-gray-500">
                  {restaurant.city}, {restaurant.state}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
