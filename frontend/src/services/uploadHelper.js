import api from './api';

/**
 * Creates FormData from menu item data and optional image file
 * @param {Object} menuData - Menu item data (name, description, price, etc.)
 * @param {File|null} imageFile - Image file to upload (optional)
 * @returns {FormData} FormData object ready for multipart upload
 */
export const createMenuItemFormData = (menuData, imageFile = null) => {
    const formData = new FormData();

    // Add basic fields
    formData.append('name', menuData.name);
    formData.append('description', menuData.description);
    formData.append('price', menuData.price);
    formData.append('category', menuData.category);
    formData.append('available', menuData.available);

    // Add dietary preferences (nested object)
    if (menuData.dietary) {
        formData.append('dietary[vegan]', menuData.dietary.vegan);
        formData.append('dietary[vegetarian]', menuData.dietary.vegetarian);
        formData.append('dietary[glutenFree]', menuData.dietary.glutenFree);
        formData.append('dietary[spicy]', menuData.dietary.spicy);
    }

    // Append ingredients as an array using bracket notation
    // This allows the backend to properly parse them as an array rather than individual fields
    if (menuData.ingredients && Array.isArray(menuData.ingredients)) {
        menuData.ingredients.forEach((ingredient, index) => {
            formData.append(`ingredients[${index}]`, ingredient);
        });
    }

    // Add image file if present
    if (imageFile) {
        formData.append('image', imageFile);
    }

    return formData;
};

/**
 * Uploads a new menu item with optional image
 * @param {Object} menuData - Menu item data
 * @param {File|null} imageFile - Image file (optional)
 * @returns {Promise} API response
 */
export const createMenuItemWithImage = async (menuData, imageFile = null) => {
    const formData = createMenuItemFormData(menuData, imageFile);

    return api.post('/menu', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * Updates an existing menu item with optional new image
 * @param {string} itemId - Menu item ID
 * @param {Object} menuData - Menu item data
 * @param {File|null} imageFile - Image file (optional)
 * @returns {Promise} API response
 */
export const updateMenuItemWithImage = async (itemId, menuData, imageFile = null) => {
    const formData = createMenuItemFormData(menuData, imageFile);

    return api.put(`/menu/${itemId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
