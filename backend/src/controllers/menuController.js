import MenuItem from '../models/MenuItem.js';
import cloudinary from '../config/cloudinaryConfig.js';

/**
 * Sanitizes user input for regex queries to prevent ReDoS (Regular Expression Denial of Service) attacks.
 * Escapes special regex characters so they're treated as literal strings in search queries.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Uploads an image buffer to Cloudinary storage.
 * Uses streaming upload to handle files efficiently without writing to disk.
 * 
 * @param {Buffer} fileBuffer - The image file buffer from multer
 * @returns {Promise<Object>} Cloudinary upload result with secure_url and public_id
 */
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'menu-items',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Removes an image from Cloudinary storage.
 * Silently fails if the image doesn't exist to avoid breaking the request flow.
 * 
 * @param {string} publicId - The Cloudinary public ID of the image to delete
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

/**
 * Retrieves menu items with optional filtering and search capabilities.
 * Supports filtering by category, dietary preferences, price range, and text search.
 * Results are sorted by popularity (descending) then by creation date.
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, vegan, vegetarian, glutenFree, spicy, minPrice, maxPrice, search, available } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    if (vegan === 'true') filter['dietary.vegan'] = true;
    if (vegetarian === 'true') filter['dietary.vegetarian'] = true;
    if (glutenFree === 'true') filter['dietary.glutenFree'] = true;
    if (spicy === 'true') filter['dietary.spicy'] = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const sanitizedSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { ingredients: { $in: [new RegExp(sanitizedSearch, 'i')] } }
      ];
    }

    const menuItems = await MenuItem.find(filter).sort({ popularity: -1, createdAt: -1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single menu item by its ID.
 * Returns 404 if the item doesn't exist.
 */
export const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ success: true, data: menuItem });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new menu item with optional image upload.
 * If an image file is provided via multer middleware, it's uploaded to Cloudinary
 * and the secure URL is stored with the menu item.
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const menuData = { ...req.body };

    // Upload image to Cloudinary if provided, storing both URL and public_id for future deletion
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      menuData.image = result.secure_url;
      menuData.cloudinaryId = result.public_id;
    }

    const menuItem = await MenuItem.create(menuData);
    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing menu item, optionally replacing its image.
 * When a new image is uploaded, the old image is automatically removed from Cloudinary
 * to prevent orphaned files and manage storage costs.
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const updateData = { ...req.body };

    // Replace existing image if a new one is provided
    if (req.file) {
      // Clean up old image to avoid orphaned files in Cloudinary storage
      if (menuItem.cloudinaryId) {
        await deleteFromCloudinary(menuItem.cloudinaryId);
      }

      // Upload and link the new image
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
      updateData.cloudinaryId = result.public_id;
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedMenuItem });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a menu item and its associated image from storage.
 * Performs cleanup of the Cloudinary image before removing the database record
 * to maintain consistency between database and storage.
 */
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Clean up associated image from cloud storage before deleting the record
    if (menuItem.cloudinaryId) {
      await deleteFromCloudinary(menuItem.cloudinaryId);
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};


