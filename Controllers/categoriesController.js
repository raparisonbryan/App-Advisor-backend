const categoriesModel = require("../Models/Categorie");
const outilsModel = require("../Models/Outil");
const {startSession} = require("mongoose");

const getManyCategories = async (request, response) => {
  try {
    const result = await categoriesModel
      .find()
      .populate("outils", "name description imageURL");
    response.send(result);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

const getByIdCategories = async (request, response) => {
  try {
    const result = await categoriesModel
        .findById(request.params.id)
        .populate("outils", "name description imageURL");
    if (!result) {
      return response.status(404).json({ error: "Catégorie non trouvée" });
    }
    response.send(result);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

const postCategories = async (request, response) => {
  try {
    const input = request.body;
    const category = new categoriesModel(input);
    const savedCategory = await category.save();
    response.status(201).send(savedCategory);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

const updateCategoriesById = async (request, response) => {
  try {
    const input = request.body;
    const result = await categoriesModel
        .findByIdAndUpdate(request.params.id, input, { new: true })
        .populate("outils", "name description imageURL");
    if (!result) {
      return response.status(404).json({ error: "Catégorie non trouvée" });
    }
    response.send(result);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

const updateCategorieOutils = async (req, res) => {
  const categorieId = req.params.id;
  const newOutilsIds = req.body.outils;

  const session = await startSession();
  session.startTransaction();

  try {
    const categorie = await categoriesModel.findById(categorieId).session(session);
    if (!categorie) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ error: "Catégorie non trouvé" });
    }

    const oldOutilsIds = categorie.outils || [];

    await outilsModel.updateMany(
        { _id: { $in: oldOutilsIds } },
        { $pull: { categories: categorieId } },
        { session }
    );

    await outilsModel.updateMany(
        { _id: { $in: newOutilsIds } },
        { $addToSet: { categories: categorieId } },
        { session }
    );

    await categoriesModel.updateOne(
        { _id: categorieId },
        { $set: { outils: newOutilsIds } },
        { session }
    );

    await session.commitTransaction();

    const updatedCategorie = await categoriesModel.findById(categorieId)
        .populate("outils", "name description imageURL");

    res.status(200).json({ success: true, categorie: updatedCategorie });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    await session.endSession();
  }
};

const deleteByIdCategories = async (request, response) => {
  try {
    const result = await categoriesModel.findByIdAndDelete(request.params.id);
    if (!result) {
      return response.status(404).json({ error: "Catégorie non trouvée" });
    }
    response.send(result);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

let categories = {
  getManyCategories,
  getByIdCategories,
  postCategories,
  updateCategoriesById,
  updateCategorieOutils,
  deleteByIdCategories,
};

module.exports = categories;
