import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { menuItemService } from '../services';
import { useAuth } from '../context';

const AddMenuItemPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please log in to add a menu item</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    
    setError('');
    setLoading(true);

    try {
      const result = await menuItemService.create({
        restaurantId: parseInt(restaurantId, 10),
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
      });
      navigate(`/menu-items/${result.menuItem.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Add Menu Item</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className="input-field" placeholder="Appetizers, Mains, Desserts, etc." required />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="input-field" step="0.01" min="0" required />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="input-field h-24" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create Menu Item'}
        </button>
      </form>
    </div>
  );
};

export default AddMenuItemPage;
