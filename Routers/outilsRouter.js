const express = require("express");
const router = express.Router();
const outils = require("../Controllers/outilsController");
const upload = require("../middleware/upload");
const authJwt = require("../middleware/authJwt");
const { generalLimiter } = require("../middleware/rateLimiter");

router.use(generalLimiter);

/**
 * @swagger
 * /outils:
 *   get:
 *     summary: Liste tous les outils
 *     tags: [Outils]
 *     responses:
 *       200:
 *         description: Une liste de tous les outils
 */
router.get("/", outils.getManyOutils);

/**
 * @swagger
 * /outils/search:
 *   get:
 *     summary: Recherche des outils par nom ou description
 *     tags: [Outils]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Liste des outils correspondant à la recherche
 *       400:
 *         description: Paramètre de recherche manquant
 */
router.get("/search", outils.searchOutils);

/**
 * @swagger
 * /outils/{id}:
 *   get:
 *     summary: Obtient un outil par son ID
 *     tags: [Outils]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'outil à obtenir
 *     responses:
 *       200:
 *         description: Un outil spécifique
 */
router.get("/:id", outils.getByIdOutils);

/**
 * @swagger
 * /outils/{id}/categories:
 *  get:
 *    summary: Liste toutes les catégories d'un outil
 *    tags: [Outils]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: L'ID de l'outil
 *    responses:
 *      200:
 *        description: Une liste de toutes les catégories de l'outil
 */
router.get("/:id/categories", outils.getOutilCategories);

/**
 * @swagger
 * /outils:
 *   post:
 *     summary: Ajoute un nouvel outil
 *     tags: [Outils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              name:
 *                  type: string
 *              description:
 *                  type: string
 *              imageURL:
 *                  type: string
 *              avis:
 *                  type: string
 *              categories:
 *                  type: string
 *     responses:
 *       200:
 *         description: L'outil a été créé
 */
router.post(
  "/",
  authJwt.verifyToken,
  authJwt.isAdmin,
  upload.single("image"),
  outils.postOutils
);

/**
 * @swagger
 * /outils/many:
 *   post:
 *     summary: Ajoute plusieurs outils
 *     tags: [Outils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imageURL:
 *                   type: string
 *                 avis:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Les outils ont été créés
 */
router.post(
  "/many",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.postManyOutils
);

/**
 * @swagger
 * /outils/sync-avis:
 *   post:
 *     summary: Synchronise les avis avec les outils
 *     tags: [Outils]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token d'authentification de l'utilisateur
 *     responses:
 *       200:
 *         description: Les avis ont été synchronisés avec succès
 */
router.post(
  "/sync-avis",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.syncAvisToOutils
);

/**
 * @swagger
 * /outils/sync-moyennes:
 *   post:
 *     summary: Migration pour ajouter les moyennes aux outils existants
 *     tags: [Outils]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token d'authentification de l'utilisateur
 *     responses:
 *       200:
 *         description: Migration des moyennes terminée avec succès
 */
router.post(
  "/sync-moyennes",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.syncMoyennes
);

/**
 * @swagger
 * /outils/cleanup:
 *   post:
 *     summary: Nettoie les données orphelines (avis sans outils)
 *     tags: [Outils]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token d'authentification de l'utilisateur
 *     responses:
 *       200:
 *         description: Nettoyage terminé avec succès
 */
router.post(
  "/cleanup",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.cleanupData
);

/**
 * @swagger
 * /outils/{id}:
 *   put:
 *     summary: Modifie un outil existant par son ID
 *     tags: [Outils]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'outil à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              name:
 *                  type: string
 *              description:
 *                  type: string
 *              imageURL:
 *                  type: string
 *              avis:
 *                  type: string
 *              categories:
 *                  type: string
 *     responses:
 *       200:
 *         description: L'outil a été mis à jour
 */
router.put(
  "/:id",
  authJwt.verifyToken,
  authJwt.isAdmin,
  upload.single("image"),
  outils.updateOutilsById
);

/**
 * @swagger
 * /outils/{id}/categories:
 *  put:
 *    summary: Ajoute une catégorie à un outil
 *    tags: [Outils]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: L'ID de l'outil
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              categories:
 *                type: array
 *                items:
 *                  type: string
 *                description: Liste des IDs des catégories à associer
 *    responses:
 *      200:
 *        description: Les catégories associées à l'outil ont été mises à jour
 */
router.put(
  "/:id/categories",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.updateOutilCategories
);

/**
 * @swagger
 * /outils/{id}:
 *   delete:
 *     summary: Supprime un outil par son ID
 *     tags: [Outils]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'outil à supprimer
 *     responses:
 *       200:
 *         description: L'outil a été supprimé
 */
router.delete(
  "/:id",
  authJwt.verifyToken,
  authJwt.isAdmin,
  outils.deleteByIdOutils
);

module.exports = router;
