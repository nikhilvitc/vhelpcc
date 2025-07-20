import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createLostAndFoundItem,
  getLostAndFoundItems,
  getUserLostAndFoundItems,
  updateLostAndFoundItem,
  deleteLostAndFoundItem,
} from '../controllers/lostAndFoundController';

const router = Router();

// Validation rules for creating a lost and found item
const createLostAndFoundValidation = [
  body('item_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Item name is required and must be less than 255 characters'),
  
  body('category')
    .isIn(['lost', 'found'])
    .withMessage('Category must be either "lost" or "found"'),
  
  body('place')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Place is required and must be less than 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('contact_phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Contact phone must be less than 20 characters')
    .matches(/^[\d\s\-\+\(\)]*$/)
    .withMessage('Contact phone contains invalid characters'),
  
  body('item_image_url')
    .optional()
    .isURL()
    .withMessage('Item image URL must be a valid URL'),
];

// Validation rules for updating a lost and found item
const updateLostAndFoundValidation = [
  body('item_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Item name must be less than 255 characters'),
  
  body('category')
    .optional()
    .isIn(['lost', 'found'])
    .withMessage('Category must be either "lost" or "found"'),
  
  body('place')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Place must be less than 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('contact_phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Contact phone must be less than 20 characters')
    .matches(/^[\d\s\-\+\(\)]*$/)
    .withMessage('Contact phone contains invalid characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'cancelled'])
    .withMessage('Status must be "active", "resolved", or "cancelled"'),
  
  body('item_image_url')
    .optional()
    .isURL()
    .withMessage('Item image URL must be a valid URL'),
];

// Validation rules for query parameters
const getLostAndFoundValidation = [
  query('category')
    .optional()
    .isIn(['lost', 'found', 'all'])
    .withMessage('Category must be "lost", "found", or "all"'),
  
  query('status')
    .optional()
    .isIn(['active', 'resolved', 'cancelled', 'all'])
    .withMessage('Status must be "active", "resolved", "cancelled", or "all"'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// Test route for lost and found endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lost and Found API is working',
    endpoints: {
      'GET /items': 'Get all lost and found items (public)',
      'POST /items': 'Create a new lost and found item (authenticated)',
      'GET /items/user': 'Get user\'s lost and found items (authenticated)',
      'PUT /items/:id': 'Update a lost and found item (authenticated)',
      'DELETE /items/:id': 'Delete a lost and found item (authenticated)',
    }
  });
});

// Routes
// Get all lost and found items (public - for browse section)
router.get('/items', getLostAndFoundValidation, validateRequest, getLostAndFoundItems);

// Create a new lost and found item (authenticated)
router.post('/items', authenticateToken, createLostAndFoundValidation, validateRequest, createLostAndFoundItem);

// Get user's lost and found items (authenticated)
router.get('/items/user', authenticateToken, getUserLostAndFoundItems);

// Update a lost and found item (authenticated)
router.put('/items/:id', authenticateToken, updateLostAndFoundValidation, validateRequest, updateLostAndFoundItem);

// Delete a lost and found item (authenticated)
router.delete('/items/:id', authenticateToken, deleteLostAndFoundItem);

export default router;
