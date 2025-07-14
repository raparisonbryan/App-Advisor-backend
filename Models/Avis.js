const mongoose = require("mongoose")

const avisSchema = new mongoose.Schema({
    message: { type: String, required: [true, "message est requis"] },
    note: {
        type: Number,
        required: [true, "note est requis"],
        min: [0, "La note doit être supérieure ou égale à 0"],
        max: [20, "La note doit être inférieure ou égale à 20"]
    },
    difficulte: {
        type: Number,
        required: [true, "difficulte est requis"],
        min: [0, "La difficulté doit être supérieure ou égale à 0"],
        max: [20, "La difficulté doit être inférieure ou égale à 20"]
    },
    performance: {
        type: Number,
        required: [true, "performance est requis"],
        min: [0, "La performance doit être supérieure ou égale à 0"],
        max: [20, "La performance doit être inférieure ou égale à 20"]
    },
    flexibilite: {
        type: Number,
        required: [true, "flexibilite est requis"],
        min: [0, "La flexibilité doit être supérieure ou égale à 0"],
        max: [20, "La flexibilité doit être inférieure ou égale à 20"]
    },
    outils: { type: mongoose.Schema.Types.ObjectId, ref: "Outil" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }
}, { versionKey: false });

const Avis = mongoose.model("Avis", avisSchema);
module.exports = Avis;