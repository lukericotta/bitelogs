import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../services';
import { useAuth } from '../context';

const AddRestaurantPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    cuisine: '',
    priceRange: 2 as 1 | 2 | 3 | 4,
  });

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please log in to add a restaurant</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await restaurantService.create(formData);
      navigate(`/restaurants/${result.restaurant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priceRange' ? parseInt(value, 10) : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Add Restaurant</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">Cuisine *</label>
          <input type="text" id="cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} className="input-field" placeholder="Italian, Japanese, etc." required />
        </div>

        <div>
          <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">Price Range *</label>
          <select id="priceRange" name="priceRange" value={formData.priceRange} onChange={handleChange} className="input-field">
            <option value={1}>$ - Budget</option>
            <option value={2}>$$ - Moderate</option>
            <option value={3}>$$$ - Upscale</option>
            <option value={4}>$$$$ - Fine Dining</option>
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="input-field" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
          <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} className="input-field" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create Restaurant'}
        </button>
      </form>
    </div>
  );
};

export default AddRestaurantPage;
