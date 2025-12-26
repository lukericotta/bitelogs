import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MenuItemWithRestaurant, ReviewWithUser } from '@bitelogs/shared';
// FIX: Corrected import paths
import { menuItemService, reviewService } from '../services';
import { useAuth } from '../context';
import { StarRating, LoadingSpinner } from '../components/ui';

const MenuItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [menuItem, setMenuItem] = useState<MenuItemWithRestaurant | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [itemRes, reviewsRes] = await Promise.all([
          menuItemService.getById(parseInt(id, 10)),
          menuItemService.getReviews(parseInt(id, 10)),
        ]);
        
        if (!controller.signal.aborted) {
          setMenuItem(itemRes.menuItem);
          setReviews(reviewsRes.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch menu item:', error);
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || rating === 0) return;
    
    setSubmitting(true);
    try {
      await reviewService.create({
        menuItemId: parseInt(id, 10),
        rating,
        comment: comment || undefined,
      });
      
      // Refresh reviews
      const reviewsRes = await menuItemService.getReviews(parseInt(id, 10));
      setReviews(reviewsRes.data);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  }

  if (!menuItem) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Menu item not found</h1>
        <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card overflow-hidden">
        <div className="h-64 bg-gray-100">
          {menuItem.imageUrl ? (
            <img src={menuItem.imageUrl} alt={menuItem.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍴</div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">{menuItem.name}</h1>
              <Link
                to={`/restaurants/${menuItem.restaurantId}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {menuItem.restaurant.name}
              </Link>
            </div>
            <span className="text-2xl font-bold text-green-600">${menuItem.price.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <StarRating rating={menuItem.avgRating} size="lg" showValue />
            <span className="text-gray-600">({menuItem.reviewCount} reviews)</span>
          </div>
          
          {menuItem.description && (
            <p className="text-gray-600">{menuItem.description}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
        
        {user && (
          <form onSubmit={handleSubmitReview} className="card p-6 mb-6">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field h-24"
                placeholder="Share your thoughts..."
              />
            </div>
            <button type="submit" disabled={rating === 0 || submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {review.user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{review.user.displayName}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailPage;
