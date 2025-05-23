import { Router } from 'express';

import healthController from '../controllers/healthController';
import authController  from '../controllers/authController';
import productController from '../controllers/productController';
import clientController  from '../controllers/clientController';
import discountController from '../controllers/discountController';
import saleController     from '../controllers/saleController';
import reportController   from '../controllers/reportController';

const router: Router = Router();

/**
 * Public routes (no authentication required):
 *  • GET /health
 *  • GET /metrics
 *  • POST /auth/signup
 *  • POST /auth/login
 *  • GET  /auth/azure/callback
 */
router.use(healthController);
router.use('/auth', authController);

/**
 * Protected routes (authentication via jwtAuth):
 *  • /products
 *  • /clients
 *  • /discounts
 *  • /sales
 *  • /reports
 */
router.use('/products', productController);
router.use('/clients',  clientController);
router.use('/discounts', discountController);
router.use('/sales',     saleController);
router.use('/reports',   reportController);

export default router;
