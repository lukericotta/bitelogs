import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Restaurant, MenuItem } from '@bitelogs/shared';
// FIX: Corrected import paths
import { restaurantService, menuItemService } from '../services';
import { StarRating, LoadingSpinner } from '../components/ui';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [restaurantRes, itemsRes] = await Promise.all([
          restaurantService.getById(parseInt(id, 10)),
          menuItemService.getByRestaurant(parseInt(id, 10)),
        ]);
        
        if (!controller.signal.aborted) {
          setRestaurant(restaurantRes.restaurant);
          setMenuItems(itemsRes.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch restaurant:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
        <Link to="/restaurants" className="btn-primary">Back to Restaurants</Link>
      </div>
    );
  }

  const priceRangeDisplay = (range: number) => '$'.repeat(range);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card overflow-hidden">
        <div className="h-64 bg-gray-100">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-gray-600">{restaurant.cuisine} • {priceRangeDisplay(restaurant.priceRange)}</p>
            </div>
            <Link to={`/restaurants/${id}/add-item`} className="btn-primary">
              Add Menu Item
            </Link>
          </div>
          
          <div className="text-gray-600 mb-6">
            <p>{restaurant.address}</p>
            <p>{restaurant.city}, {restaurant.state} {restaurant.zipCode}</p>
            {restaurant.phone && <p>📞 {restaurant.phone}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Menu Items</h2>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8 card">
            <p className="text-gray-600 mb-4">No menu items yet</p>
            <Link to={`/restaurants/${id}/add-item`} className="btn-primary">
              Add the first item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
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
                <p className="text-sm text-gray-500">{item.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-green-600 font-medium">${item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={item.avgRating} size="sm" />
                    <span className="text-sm text-gray-600">({item.reviewCount})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
