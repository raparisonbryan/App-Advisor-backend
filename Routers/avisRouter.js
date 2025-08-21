const express = require("express");
const router = express.Router();
const avis = require("../Controllers/avisController");
const verifyToken = require("../middleware/authJwt");
const { generalLimiter } = require("../middleware/rateLimiter");

router.use(generalLimiter);

/**
 * @swagger
 * /avis:
 *   get:
 *     summary: Utilisé pour obtenir la liste des avis
 *     tags: [Avis]
 *     responses:
 *       200:
 *         description: Retourne la liste des avis
 */
router.get("/", avis.getManyAvis);

/**
 * @swagger
 * /avis/{id}:
 *   get:
 *     summary: Utilisé pour obtenir un avis par son id
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis à récupérer
 *     responses:
 *       200:
 *         description: Retourne un avis
 */
router.get("/:id", avis.getByIdAvis);

/**
 * @swagger
 * /avis/outil/{id}:
 *   get:
 *     summary: Utilisé pour obtenir les avis d'un outil par son id
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'outil dont on souhaite récupérer les avis
 *     responses:
 *       200:
 *         description: Retourne les avis d'un outil
 */
router.get("/outil/:id", avis.getAvisByOutilId);

/**
 * @swagger
 * /avis:
 *   post:
 *     summary: Utilisé pour ajouter un avis selon l'utilisateur connecté et l'outil sélectionné
 *     tags: [Avis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               note:
 *                 type: number
 *               difficulte:
 *                 type: number
 *               performance:
 *                 type: number
 *               flexibilite:
 *                 type: number
 *               outilId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retourne un message de confirmation
 */
router.post("/", verifyToken.verifyToken, avis.postAvis);

/**
 * @swagger
 * /avis/{id}:
 *   put:
 *     summary: Utilisé pour modifier un avis par son id
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               note:
 *                 type: number
 *               difficulte:
 *                 type: number
 *               performance:
 *                 type: number
 *               flexibilite:
 *                 type: number
 *     responses:
 *       200:
 *         description: Retourne l'avis modifié
 */
router.put("/:id", avis.putAvisById);

/**
 * @swagger
 * /avis:
 *   delete:
 *     summary: Utilisé pour supprimer tous les avis
 *     tags: [Avis]
 *     responses:
 *       200:
 *         description: Retourne un message de confirmation de suppression
 */
router.delete("/", avis.deleteManyAvis);

/**
 * @swagger
 * /avis/{id}:
 *   delete:
 *     summary: Utilisé pour supprimer un avis par son id
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'avis à supprimer
 *     responses:
 *       200:
 *         description: Retourne un message de confirmation de suppression
 */
router.delete("/:id", avis.deleteByIdAvis);

module.exports = router;
