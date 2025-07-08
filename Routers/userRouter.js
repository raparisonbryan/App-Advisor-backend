const express = require("express");
const router = express.Router();
const user = require("../Controllers/userController");
const verifySignUp = require("../middleware/verifySignUp");
const passwordReset = require("../middleware/passwordReset");

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Inscrit un nouvel utilisateur à l'aide d'un middleware
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: L'utilisateur a été inscrit
 */
router.post("/signup",
    verifySignUp.validatePassword,
    verifySignUp.checkDuplicateUsernameOrEmail,
    user.signup
);

/**
 * @swagger
 * /user/signin:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: L'utilisateur est connecté
 */
router.post("/signin", user.signin);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé
 */
router.post("/forgot-password", passwordReset.forgotPassword);

/**
 * @swagger
 * /user/reset-password/{token}:
 *   post:
 *     summary: Réinitialise le mot de passe avec le token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 */
router.post("/reset-password/:token",
    verifySignUp.validatePassword,
    passwordReset.resetPassword
);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Une liste de tous les utilisateurs
 */
router.get("/", user.getManyuser);

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Ajoute un nouvel utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *             name:
 *              type: string
 *             email:
 *              type: string
 *             password:
 *              type: string
 *             isAdmin:
 *              type: boolean
 *     responses:
 *       200:
 *         description: L'utilisateur a été créé
 */
router.post("/", user.postUser);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Obtient un utilisateur par son ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur à obtenir
 *     responses:
 *       200:
 *         description: Un utilisateur spécifique
 */
router.get("/:id", user.getByIduser);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Modifie un utilisateur existant par son ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur à modifier
 *     responses:
 *       200:
 *         description: L'utilisateur a été mis à jour
 */
router.put("/:id", user.putUserById);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Supprime un utilisateur par son ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: L'utilisateur a été supprimé
 */
router.delete("/:id", user.deleteByIduser);

module.exports = router;