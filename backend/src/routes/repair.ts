import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createRepairOrder,
  getUserRepairOrders,
  getRepairOrder,
  updateRepairOrderStatus,
} from '../controllers/repairController';

const router = Router();

// Validation rules for creating a repair order
const createRepairOrderValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  
  body('phoneNumber')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number contains invalid characters'),
  
  body('alternateContact')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Alternate contact must be less than 20 characters')
    .matches(/^[\d\s\-\+\(\)]*$/)
    .withMessage('Alternate contact contains invalid characters'),
  
  body('deviceModel')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Device model is required and must be less than 200 characters'),
  
  body('problemDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Problem description must be between 10 and 1000 characters'),
  
  body('serviceType')
    .isIn(['phone', 'laptop'])
    .withMessage('Service type must be either "phone" or "laptop"'),
];

// Validation rules for updating repair order status
const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
];

// Routes

/**
 * @route   POST /api/repair/orders
 * @desc    Create a new repair order
 * @access  Private (requires authentication)
 */
router.post(
  '/orders',
  authenticateToken,
  createRepairOrderValidation,
  validateRequest,
  createRepairOrder
);

/**
 * @route   GET /api/repair/orders
 * @desc    Get all repair orders for the authenticated user
 * @access  Private (requires authentication)
 */
router.get(
  '/orders',
  authenticateToken,
  getUserRepairOrders
);

/**
 * @route   GET /api/repair/orders/:id
 * @desc    Get a specific repair order by ID
 * @access  Private (requires authentication)
 */
router.get(
  '/orders/:id',
  authenticateToken,
  getRepairOrder
);

/**
 * @route   PUT /api/repair/orders/:id/status
 * @desc    Update repair order status (admin only - for future use)
 * @access  Private (requires authentication)
 */
router.put(
  '/orders/:id/status',
  authenticateToken,
  updateStatusValidation,
  validateRequest,
  updateRepairOrderStatus
);

export default router;
