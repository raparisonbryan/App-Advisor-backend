const express = require("express");
const axios = require("axios");
const router = express.Router();

const PYTHON_API_URL = process.env.CHAT_API_URL ;

router.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(PYTHON_API_URL, {
            prompt,
        });

        res.json(response.data);
    } catch (err) {
        console.error("Erreur AI:", err.message);
        res.status(500).json({ error: "Erreur génération IA" });
    }
});

module.exports = router;
