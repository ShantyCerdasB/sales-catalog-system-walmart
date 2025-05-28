import { Router } from 'express';
import healthController  from '../controllers/healthController';
import authController    from '../controllers/authController';
import productController from '../controllers/productController';
import clientController  from '../controllers/clientController';
import discountController from '../controllers/discountController';
import saleController    from '../controllers/saleController';
import reportController  from '../controllers/reportController';

/* Public – no auth needed */
const publicRoutes = Router();
publicRoutes.use(healthController);
publicRoutes.use('/auth', authController);

/* Protected – behind jwtAuth */
const protectedRoutes = Router();
protectedRoutes.use('/products',  productController);
protectedRoutes.use('/clients',   clientController);
protectedRoutes.use('/discounts', discountController);
protectedRoutes.use('/sales',     saleController);
protectedRoutes.use('/reports',   reportController);

// Export both sets of routes
const routes: { public: Router; protected: Router } = { public: publicRoutes, protected: protectedRoutes };

export default routes;
