const express = require("express");
const router = express.Router();
const categories = require("../Controllers/categoriesController");
const authJwt = require("../middleware/authJwt");
const { generalLimiter } = require("../middleware/rateLimiter");

router.use(generalLimiter);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Liste toutes les catégories avec leurs outils
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Une liste de toutes les catégories avec leurs outils associés
 */
router.get("/", categories.getManyCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtient une catégorie par son ID avec ses outils
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la catégorie à obtenir
 *     responses:
 *       200:
 *         description: Une catégorie spécifique avec ses outils
 */
router.get("/:id", categories.getByIdCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Ajoute une nouvelle catégorie
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               imageURL:
 *                 type: string
 *               outils:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des outils à associer
 *     responses:
 *       201:
 *         description: La catégorie a été créée
 */
router.post(
  "/",
  authJwt.verifyToken,
  authJwt.isAdmin,
  categories.postCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Modifie une catégorie existante
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la catégorie à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               imageURL:
 *                 type: string
 *               outils:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des outils à associer
 *     responses:
 *       200:
 *         description: La catégorie a été mise à jour
 */
router.put(
  "/:id",
  authJwt.verifyToken,
  authJwt.isAdmin,
  categories.updateCategoriesById
);

/**
 * @swagger
 * /categories/{id}/outils:
 *   put:
 *     summary: Met à jour les outils associés à une catégorie
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outils:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des outils à associer
 *     responses:
 *       200:
 *         description: Les outils associés à la catégorie ont été mis à jour
 */
router.put(
  "/:id/outils",
  authJwt.verifyToken,
  authJwt.isAdmin,
  categories.updateCategorieOutils
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de la catégorie à supprimer
 *     responses:
 *       200:
 *         description: La catégorie a été supprimée
 */
router.delete(
  "/:id",
  authJwt.verifyToken,
  authJwt.isAdmin,
  categories.deleteByIdCategories
);

module.exports = router;
