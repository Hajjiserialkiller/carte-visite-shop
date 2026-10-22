import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import { orderRateLimit } from "../middleware/security.js";

const router = Router();

router.post("/", orderRateLimit, orderController.createOrder);
router.get("/:reference", orderController.getOrder);
router.get("/:reference/verify", orderController.verifyOrder);
router.get("/:reference/cancel", orderController.cancelOrder);

export default router;
