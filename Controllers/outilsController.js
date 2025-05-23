const outilsModel = require("../Models/Outil");
const Categorie = require("../Models/Categorie");
const {startSession} = require("mongoose");

const getManyOutils = async (request, response) => {
  try {
    const result = await outilsModel
      .find()
      .populate("categories", "name imageURL")
      .populate("avis", "difficulte performance flexibilite");
    response.send(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const getByIdOutils = async (request, response) => {
  try {
    const result = await outilsModel
      .findById(request.params.id)
      .populate("categories", "name imageURL")
      .populate("avis", "difficulte performance flexibilite");
    response.send(result);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: error.message });
  }
};

const getOutilCategories = async (req, res) => {
  try {
    const outilId = req.params.id;
    const outil = await outilsModel
        .findById(outilId)
        .populate("categories", "name imageURL");

    if (!outil) return res.status(404).json({ error: "Outil non trouvé" });

    res.send(outil.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const postOutils = async (req, res) => {
  try {
    const input = req.body;
    const outil = new outilsModel(input);
    const savedOutil = await outil.save();
    
    if (input.categories && input.categories.length > 0) {
      await Categorie.updateMany(
        { _id: { $in: input.categories } },
        { $push: { outils: savedOutil._id } }
      );
    }

    res.status(201).send(savedOutil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOutilsById = async (request, response) => {
  try {
    const input = request.body;
    const oldOutil = await outilsModel.findById(request.params.id);
    
    const result = await outilsModel
      .findByIdAndUpdate(request.params.id, input, { new: true })
      .populate("categories", "name imageURL");
    
    if (input.categories) {
      if (oldOutil.categories && oldOutil.categories.length > 0) {
        await Categorie.updateMany(
          { _id: { $in: oldOutil.categories } },
          { $pull: { outils: request.params.id } }
        );
      }
      
      if (input.categories.length > 0) {
        await Categorie.updateMany(
          { _id: { $in: input.categories } },
          { $addToSet: { outils: request.params.id } }
        );
      }
    }

    response.send(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateOutilCategories = async (req, res) => {
  const outilId = req.params.id;
  const newCategoryIds = req.body.categories;

  const session = await startSession();
  session.startTransaction();

  try {
    const outil = await outilsModel.findById(outilId).session(session);
    if (!outil) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ error: "Outil non trouvé" });
    }

    const oldCategoryIds = outil.categories || [];
    
    await Categorie.updateMany(
        { _id: { $in: oldCategoryIds } },
        { $pull: { outils: outilId } },
        { session }
    );
    
    await Categorie.updateMany(
        { _id: { $in: newCategoryIds } },
        { $addToSet: { outils: outilId } },
        { session }
    );
    
    outil.categories = newCategoryIds;
    await outil.save({ session });

    await session.commitTransaction();
    res.status(200).json({ success: true, outil });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    await session.endSession();
  }
};


const deleteByIdOutils = async (request, response) => {
  try {
    const outil = await outilsModel.findById(request.params.id);
    
    if (outil.categories && outil.categories.length > 0) {
      await Categorie.updateMany(
        { _id: { $in: outil.categories } },
        { $pull: { outils: request.params.id } }
      );
    }

    const result = await outilsModel.findByIdAndDelete(request.params.id);
    response.send(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const outils = {
  getManyOutils,
  getByIdOutils,
  getOutilCategories,
  postOutils,
  updateOutilsById,
  updateOutilCategories,
  deleteByIdOutils,
};

module.exports = outils;
