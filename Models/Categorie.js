const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
    {
    name: { type: String, required: [true, "name est requis "] },
    imageURL: { type: String, required: true },
    outils: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outil" }],
  },
  { versionKey: false }
);

const Categorie = mongoose.model("Categorie", categoriesSchema);
module.exports = Categorie;