const outilsModel = require("../Models/Outil");
const Categorie = require("../Models/Categorie");
const {startSession} = require("mongoose");
const { cloudinary } = require("../utils/cloudinary");

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

    console.log("INPUT:", input);
    console.log("FILE:", req.file);

    if (req.file) {
      input.imageURL = req.file.path;
    }

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
    console.error("Erreur Cloudinary/Post:", error);
    res.status(500).json({ error: error.message || error });
  }
};


const postManyOutils = async (req, res) => {
  try {
    const input = req.body;
    const result = [];

    if (Array.isArray(input)) {
      for (const outilData of input) {
        const outil = new outilsModel(outilData);
        const savedOutil = await outil.save();

        if (outilData.categories && outilData.categories.length > 0) {
          const categoryIds = outilData.categories.map(cat =>
              typeof cat === 'object' ? cat._id : cat
          );

          await Categorie.updateMany(
              { _id: { $in: categoryIds } },
              { $push: { outils: savedOutil._id } }
          );
        }

        result.push(savedOutil);
      }
      res.status(201).send(result);
    } else {
      if (req.file) {
        input.imageURL = req.file.path;
      }

      const outil = new outilsModel(input);
      const savedOutil = await outil.save();

      if (input.categories && input.categories.length > 0) {
        const categoryIds = input.categories.map(cat =>
            typeof cat === 'object' ? cat._id : cat
        );

        await Categorie.updateMany(
            { _id: { $in: categoryIds } },
            { $push: { outils: savedOutil._id } }
        );
      }

      res.status(201).send(savedOutil);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOutilsById = async (request, response) => {
  try {
    const input = request.body;
    const oldOutil = await outilsModel.findById(request.params.id);

    if (request.file) {
      if (oldOutil.imageURL) {
        const publicId = oldOutil.imageURL.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`outils/${publicId}`);
      }
      input.imageURL = request.file.path;
    }

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

    if (outil.imageURL) {
      const publicId = outil.imageURL.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`outils/${publicId}`);
    }

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
  postManyOutils,
  updateOutilsById,
  updateOutilCategories,
  deleteByIdOutils,
};

module.exports = outils;