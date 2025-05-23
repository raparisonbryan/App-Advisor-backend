const mongoose = require("mongoose");

const outilSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is required"] },
    description: { type: String, required: [true, "description is required"] },
    imageURL: { type: String, required: true },
    avis: { type: mongoose.Schema.Types.ObjectId, ref: "Avis" },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categorie" }],
  },
  { versionKey: false }
);

const Outil = mongoose.model("Outil", outilSchema);
module.exports = Outil;