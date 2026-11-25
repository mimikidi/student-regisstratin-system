
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllStudents,
  getAllRegistrations,
  updateRegistrationStatus
} = require("../controllers/adminController");

const {
  authenticateToken,
  authorizeRole
} = require("../middleware/authMiddleware");

// Protect all admin APIs
router.use(authenticateToken, authorizeRole("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard management APIs
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin permission required
 */
router.get("/dashboard", getDashboardStats);

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all registered students
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get("/students", getAllStudents);

/**
 * @swagger
 * /api/admin/registrations:
 *   get:
 *     summary: Get all course registrations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 */
router.get("/registrations", getAllRegistrations);

/**
 * @swagger
 * /api/admin/registrations/{id}/status:
 *   put:
 *     summary: Approve or reject a student registration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration status updated
 *       400:
 *         description: Invalid status or missing rejection reason
 *       404:
 *         description: Registration not found
 */
router.put(
  "/registrations/:id/status",
  updateRegistrationStatus
);

module.exports = router;
