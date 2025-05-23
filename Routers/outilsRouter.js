const express = require("express");
const router = express.Router();
const outils = require("../Controllers/outilsController");

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
router.get("/" , outils.getManyOutils);

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
router.get("/:id" , outils.getByIdOutils);

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
router.get("/:id/categories" , outils.getOutilCategories);

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
router.post("/" , outils.postOutils); 

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
router.put("/:id" , outils.updateOutilsById);

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
router.put("/:id/categories", outils.updateOutilCategories);

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
router.delete("/:id" , outils.deleteByIdOutils);

module.exports = router ;