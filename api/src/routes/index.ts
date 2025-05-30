import { Router } from 'express';
import healthController    from '../controllers/healthController';
import authController      from '../controllers/authController';
import productController   from '../controllers/productController';
import clientController    from '../controllers/clientController';
import discountController  from '../controllers/discountController';
import saleController      from '../controllers/saleController';
import reportController    from '../controllers/reportController';
import saleItemController  from '../controllers/saleItemController';
import userController from '../controllers/userController';
import { jwtAuth } from '../middleware/jwtAuth';

/* Public routers: no JWT required */
const publicRouter = Router();
publicRouter.use('/health', healthController);
publicRouter.use('/auth',   authController);


/* Protected routers: mounted after jwtAuth() */
const protectedRouter = Router();
protectedRouter.use(jwtAuth())
protectedRouter.use('/products',  productController);
protectedRouter.use('/clients',   clientController);
protectedRouter.use('/discounts', discountController);
protectedRouter.use('/sales',     saleController);
protectedRouter.use('/reports',   reportController);
protectedRouter.use('/saleItems', saleItemController);
protectedRouter.use('/users', userController);


/* Export both */
export default {
  public:    publicRouter,
  protected: protectedRouter,
};
