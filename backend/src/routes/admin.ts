import { Router } from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { adminRateLimit } from "../middleware/security.js";
import * as adminController from "../controllers/adminController.js";
import { uploadImage, uploadMiddleware } from "../controllers/uploadController.js";

const router = Router();

router.use(adminRateLimit);
router.use(requireAdmin);

router.post("/upload", uploadMiddleware, uploadImage);

router.get("/products", adminController.listProducts);
router.post("/products", adminController.createProduct);
router.patch("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

router.get("/orders", adminController.listOrders);
router.patch("/orders/:id", adminController.updateOrderStatus);

export default router;
