const express = require("express");
const router = express.Router();
const user = require("../Controllers/userController");
const verifySignUp = require("../middleware/verifySignUp");
const passwordReset = require("../middleware/passwordReset");
const authJwt = require("../middleware/authJwt");
const { generalLimiter, authLimiter } = require("../middleware/rateLimiter");

router.use(generalLimiter);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profil utilisateur avec statut admin
 */
router.get("/me", authJwt.verifyToken, user.getCurrentUser);

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur connecté
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
 *         description: Profil utilisateur mis à jour avec succès
 *       403:
 *         description: Accès refusé
 */
router.put("/me", authJwt.verifyToken, user.updateOwnProfile);

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
router.post(
  "/signup",
  authLimiter,
  verifySignUp.validateEmail,
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
router.post("/signin", authLimiter, user.signin);

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
router.post(
  "/forgot-password",
  verifySignUp.validateEmail,
  passwordReset.forgotPassword
);

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
router.post(
  "/reset-password/:token",
  verifySignUp.validatePassword,
  passwordReset.resetPassword
);

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Rafraîchit le token d'accès à partir du refresh token
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Nouveau token d'accès généré
 */
router.post("/refresh-token", user.refreshToken);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Déconnecte l'utilisateur et supprime le refresh token
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/logout", user.logout);

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
router.get("/", authJwt.verifyToken, authJwt.isAdmin, user.getManyUser);

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
router.post("/", authJwt.verifyToken, authJwt.isAdmin, user.postUser);

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
router.get("/:id", user.getByIdUser);

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
router.put(
  "/:id",
  authJwt.verifyToken,
  authJwt.isOwnerOrAdmin,
  user.putUserById
);

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
router.delete(
  "/:id",
  authJwt.verifyToken,
  authJwt.isAdmin,
  user.deleteByIdUser
);

module.exports = router;
