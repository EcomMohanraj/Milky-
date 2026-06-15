"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const product_controller_1 = require("../controllers/product.controller");
const review_controller_1 = require("../controllers/review.controller");
const blog_controller_1 = require("../controllers/blog.controller");
const address_controller_1 = require("../controllers/address.controller");
const order_controller_1 = require("../controllers/order.controller");
const customer_controller_1 = require("../controllers/customer.controller");
const analytics_controller_1 = require("../controllers/analytics.controller");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Auth routes
router.post("/auth/login", auth_controller_1.authController.login);
router.post("/auth/register", auth_controller_1.authController.register);
router.post("/auth/logout", auth_controller_1.authController.logout);
router.get("/auth/session", auth_1.authMiddleware, auth_controller_1.authController.getSession);
router.put("/auth/session", auth_1.authMiddleware, auth_controller_1.authController.updateProfile);
// Products routes
router.get("/products", product_controller_1.productController.list);
router.get("/products/:slug", product_controller_1.productController.getBySlug);
router.post("/products", auth_1.authMiddleware, auth_1.adminMiddleware, product_controller_1.productController.create);
router.put("/products/:id", auth_1.authMiddleware, product_controller_1.productController.update);
router.delete("/products/:id", auth_1.authMiddleware, auth_1.adminMiddleware, product_controller_1.productController.delete);
// Reviews routes
router.get("/reviews", review_controller_1.reviewController.list);
router.post("/reviews", auth_1.authMiddleware, review_controller_1.reviewController.create);
// Blog routes
router.get("/blogs", blog_controller_1.blogController.list);
router.get("/blogs/:slug", blog_controller_1.blogController.getBySlug);
router.post("/blogs", auth_1.authMiddleware, auth_1.adminMiddleware, blog_controller_1.blogController.create);
router.delete("/blogs/:id", auth_1.authMiddleware, auth_1.adminMiddleware, blog_controller_1.blogController.delete);
// Address routes
router.get("/addresses", auth_1.authMiddleware, address_controller_1.addressController.list);
router.post("/addresses", auth_1.authMiddleware, address_controller_1.addressController.create);
router.delete("/addresses/:id", auth_1.authMiddleware, address_controller_1.addressController.delete);
// Order routes
router.get("/orders/track/:id", order_controller_1.orderController.track); // Public track endpoint
router.get("/orders", auth_1.authMiddleware, order_controller_1.orderController.list);
router.post("/orders", auth_1.authMiddleware, order_controller_1.orderController.create);
router.put("/orders/:id", auth_1.authMiddleware, order_controller_1.orderController.update);
// Customer routes (admin only)
router.get("/customers", auth_1.authMiddleware, auth_1.adminMiddleware, customer_controller_1.customerController.list);
router.get("/customers/:id", auth_1.authMiddleware, auth_1.adminMiddleware, customer_controller_1.customerController.getById);
// Analytics routes (admin only)
router.get("/analytics", auth_1.authMiddleware, auth_1.adminMiddleware, analytics_controller_1.analyticsController.getSummary);
// Store Settings routes
router.get("/settings", settings_controller_1.settingsController.get);
router.put("/settings", auth_1.authMiddleware, auth_1.adminMiddleware, settings_controller_1.settingsController.update);
exports.default = router;
