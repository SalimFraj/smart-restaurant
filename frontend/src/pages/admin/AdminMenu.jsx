import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { createMenuItemWithImage, updateMenuItemWithImage } from '../../services/uploadHelper';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null, itemName: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizer',
    dietary: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      spicy: false
    },
    ingredients: '',
    available: true
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
      };

      if (editingItem) {
        await updateMenuItemWithImage(editingItem._id, data, imageFile);
        toast.success('Menu item updated');
      } else {
        await createMenuItemWithImage(data, imageFile);
        toast.success('Menu item created');
      }

      setShowForm(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'appetizer',
        dietary: {
          vegan: false,
          vegetarian: false,
          glutenFree: false,
          spicy: false
        },
        ingredients: '',
        available: true
      });
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      dietary: item.dietary,
      ingredients: item.ingredients.join(', '),
      available: item.available
    });
    // Set existing image preview if available
    if (item.image) {
      setImagePreview(item.image);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowForm(true);
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = (item) => {
    setDeleteModal({ isOpen: true, itemId: item._id, itemName: item.name });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/menu/${deleteModal.itemId}`);
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link to="/admin" className="btn btn-ghost gap-2 mb-6 hover:bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>

      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t('admin.menu')}</h1>
        <button onClick={() => {
          setShowForm(!showForm);
          setEditingItem(null);
          setImageFile(null);
          setImagePreview(null);
          setFormData({
            name: '',
            description: '',
            price: '',
            category: 'appetizer',
            dietary: { vegan: false, vegetarian: false, glutenFree: false, spicy: false },
            ingredients: '',
            available: true
          });
        }} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Description *</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Image</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full"
                  />
                  {imagePreview && (
                    <div className="mt-4 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main-course">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                    <option value="salad">Salad</option>
                    <option value="soup">Soup</option>
                  </select>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Ingredients (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="e.g., Tomato, Basil, Mozzarella"
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Vegan</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.dietary.vegan}
                      onChange={(e) => setFormData({
                        ...formData,
                        dietary: { ...formData.dietary, vegan: e.target.checked }
                      })}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Vegetarian</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.dietary.vegetarian}
                      onChange={(e) => setFormData({
                        ...formData,
                        dietary: { ...formData.dietary, vegetarian: e.target.checked }
                      })}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Gluten Free</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.dietary.glutenFree}
                      onChange={(e) => setFormData({
                        ...formData,
                        dietary: { ...formData.dietary, glutenFree: e.target.checked }
                      })}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Spicy</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.dietary.spicy}
                      onChange={(e) => setFormData({
                        ...formData,
                        dietary: { ...formData.dietary, spicy: e.target.checked }
                      })}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Available</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                  </label>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.image || '/placeholder-food.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => { e.target.src = '/placeholder-food.png'; }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>${item.price}</td>
                <td>{item.available ? '✅' : '❌'}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="btn btn-sm btn-primary">Edit</button>
                    <button onClick={() => handleDelete(item)} className="btn btn-sm btn-error">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteModal.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        icon="🗑️"
      />
    </div>
  );
}

