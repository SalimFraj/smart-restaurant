import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const DIETARY_OPTIONS = [
    { value: 'vegetarian', label: '🥬 Vegetarian', emoji: '🥬' },
    { value: 'vegan', label: '🌱 Vegan', emoji: '🌱' },
    { value: 'gluten-free', label: '🌾 Gluten-Free', emoji: '🌾' },
    { value: 'dairy-free', label: '🥛 Dairy-Free', emoji: '🥛' },
    { value: 'nut-free', label: '🥜 Nut-Free', emoji: '🥜' },
    { value: 'halal', label: '☪️ Halal', emoji: '☪️' },
    { value: 'kosher', label: '✡️ Kosher', emoji: '✡️' },
    { value: 'low-sodium', label: '🧂 Low Sodium', emoji: '🧂' },
    { value: 'spicy', label: '🌶️ Loves Spicy', emoji: '🌶️' },
];

const ALLERGY_OPTIONS = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'
];

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        dietaryPreferences: {
            allergies: [],
            preferences: [],
            notes: ''
        }
    });

    // Fetch full profile data
    const { data: profileData, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get('/profile');
            return response.data.data;
        },
        enabled: !!user
    });

    // Update form when profile loads
    useEffect(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                dietaryPreferences: {
                    allergies: profileData.dietaryPreferences?.allergies || [],
                    preferences: profileData.dietaryPreferences?.preferences || [],
                    notes: profileData.dietaryPreferences?.notes || ''
                }
            });
        }
    }, [profileData]);

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put('/profile', data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries(['profile']);
            if (updateUser) updateUser(data.data);
            setIsEditing(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    });

    // Remove favorite mutation
    const removeFavoriteMutation = useMutation({
        mutationFn: async (menuItemId) => {
            const response = await api.delete(`/profile/favorites/${menuItemId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Removed from favorites');
            queryClient.invalidateQueries(['profile']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const togglePreference = (pref) => {
        setFormData(prev => ({
            ...prev,
            dietaryPreferences: {
                ...prev.dietaryPreferences,
                preferences: prev.dietaryPreferences.preferences.includes(pref)
                    ? prev.dietaryPreferences.preferences.filter(p => p !== pref)
                    : [...prev.dietaryPreferences.preferences, pref]
            }
        }));
    };

    const toggleAllergy = (allergy) => {
        setFormData(prev => ({
            ...prev,
            dietaryPreferences: {
                ...prev.dietaryPreferences,
                allergies: prev.dietaryPreferences.allergies.includes(allergy)
                    ? prev.dietaryPreferences.allergies.filter(a => a !== allergy)
                    : [...prev.dietaryPreferences.allergies, allergy]
            }
        }));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="text-center">
                    <span className="text-8xl mb-6 block">🔒</span>
                    <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                    <p className="text-base-content/70 mb-6">You need to be logged in to view your profile</p>
                    <Link to="/login" className="btn btn-primary">Login</Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-base-200 py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <span className="text-5xl">{profileData?.name?.[0]?.toUpperCase() || '👤'}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{profileData?.name}</h1>
                    <p className="text-base-content/70">{profileData?.email}</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body p-4 text-center">
                            <span className="text-3xl mb-2">📦</span>
                            <div className="text-2xl font-bold text-primary">{profileData?.orderStats?.totalOrders || 0}</div>
                            <div className="text-xs text-base-content/70">Orders</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body p-4 text-center">
                            <span className="text-3xl mb-2">💰</span>
                            <div className="text-2xl font-bold text-primary">${profileData?.orderStats?.totalSpent?.toFixed(0) || 0}</div>
                            <div className="text-xs text-base-content/70">Spent</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body p-4 text-center">
                            <span className="text-3xl mb-2">❤️</span>
                            <div className="text-2xl font-bold text-primary">{profileData?.favorites?.length || 0}</div>
                            <div className="text-xs text-base-content/70">Favorites</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body p-4 text-center">
                            <span className="text-3xl mb-2">📅</span>
                            <div className="text-2xl font-bold text-primary">
                                {new Date(profileData?.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </div>
                            <div className="text-xs text-base-content/70">Member Since</div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <motion.div
                    className="card bg-base-100 shadow-xl mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title text-xl">
                                <span>👤</span> Personal Information
                            </h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="btn btn-ghost btn-sm"
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Full Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input input-bordered"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Phone</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input input-bordered"
                                        placeholder="+1 (555) 000-0000"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Delivery Address</span>
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="textarea textarea-bordered"
                                    placeholder="Enter your default delivery address"
                                    rows={2}
                                    disabled={!isEditing}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <><span className="loading loading-spinner loading-sm"></span> Saving...</>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Dietary Preferences */}
                <motion.div
                    className="card bg-base-100 shadow-xl mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <span>🥗</span> Dietary Preferences
                        </h2>

                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text font-medium">Your Diet</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => togglePreference(option.value)}
                                        className={`btn btn-sm ${formData.dietaryPreferences.preferences.includes(option.value)
                                                ? 'btn-primary'
                                                : 'btn-outline'
                                            }`}
                                    >
                                        {option.emoji} {option.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text font-medium">⚠️ Allergies</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ALLERGY_OPTIONS.map(allergy => (
                                    <button
                                        key={allergy}
                                        type="button"
                                        onClick={() => toggleAllergy(allergy)}
                                        className={`btn btn-sm ${formData.dietaryPreferences.allergies.includes(allergy)
                                                ? 'btn-error'
                                                : 'btn-outline btn-error'
                                            }`}
                                    >
                                        {allergy}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Additional Notes</span>
                            </label>
                            <textarea
                                value={formData.dietaryPreferences.notes}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    dietaryPreferences: { ...formData.dietaryPreferences, notes: e.target.value }
                                })}
                                className="textarea textarea-bordered"
                                placeholder="Any other dietary notes or restrictions..."
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => updateProfileMutation.mutate(formData)}
                                className="btn btn-primary btn-sm"
                                disabled={updateProfileMutation.isPending}
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Favorites */}
                <motion.div
                    className="card bg-base-100 shadow-xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <span>❤️</span> My Favorites
                        </h2>

                        {profileData?.favorites?.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-6xl mb-4 block">💔</span>
                                <p className="text-base-content/70 mb-4">No favorites yet</p>
                                <Link to="/menu" className="btn btn-primary btn-sm">Browse Menu</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profileData?.favorites?.map(item => (
                                    <div key={item._id} className="card card-compact bg-base-200">
                                        <figure className="h-32">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </figure>
                                        <div className="card-body">
                                            <h3 className="card-title text-sm">{item.name}</h3>
                                            <p className="text-primary font-bold">${item.price?.toFixed(2)}</p>
                                            <div className="card-actions justify-end">
                                                <button
                                                    onClick={() => removeFavoriteMutation.mutate(item._id)}
                                                    className="btn btn-ghost btn-xs text-error"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
