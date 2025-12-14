import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return res.status(400).json({
          success: false,
          message: firstError?.message || 'Validation error',
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const menuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.preprocess(
      (val) => typeof val === 'string' ? parseFloat(val) : val,
      z.number().min(0, 'Price must be positive')
    ),
    category: z.enum(['appetizer', 'main-course', 'dessert', 'beverage', 'salad', 'soup']),
    dietary: z.object({
      vegan: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()
      ).optional(),
      vegetarian: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()
      ).optional(),
      glutenFree: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()
      ).optional(),
      spicy: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()
      ).optional()
    }).optional(),
    ingredients: z.array(z.string()).optional(),
    available: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional()
    ).optional()
  })
});

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      menuItem: z.string().min(1, 'Menu item ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be positive')
    })).min(1, 'At least one item is required'),
    deliveryAddress: z.string().optional(),
    phone: z.string().optional(),
    specialInstructions: z.string().optional()
  })
});

export const reservationSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()),
    time: z.string().min(1, 'Time is required'),
    guests: z.number().min(1).max(20),
    specialRequests: z.string().optional(),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    contactEmail: z.string().email('Invalid email address')
  })
});

export const feedbackSchema = z.object({
  body: z.object({
    order: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1, 'Comment is required')
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
  }),
  params: z.object({
    id: z.string()
  })
});
