const mongoose = require("mongoose");

const outilSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "name est requis"] },
        description: { type: String, required: [true, "description est requis"] },
        imageURL: { type: String, required: true },
        avis: [{ type: mongoose.Schema.Types.ObjectId, ref: "Avis" }],
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categorie" }],
        moyenneNote: { type: Number, default: 0 },
        moyenneDifficulte: { type: Number, default: 0 },
        moyennePerformance: { type: Number, default: 0 },
        moyenneFlexibilite: { type: Number, default: 0 },
        nombreAvis: { type: Number, default: 0 }
    },
    { versionKey: false }
);

const Outil = mongoose.model("Outil", outilSchema);
module.exports = Outil;