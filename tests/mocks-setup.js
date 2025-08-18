jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

jest.mock("../Models/UserModel", () => {
  const UserModel = jest.fn();
  UserModel.find = jest.fn().mockReturnThis();
  UserModel.findById = jest.fn().mockReturnThis();
  UserModel.findOne = jest.fn().mockReturnThis();
  UserModel.create = jest.fn();
  UserModel.save = jest.fn();
  UserModel.populate = jest.fn().mockReturnThis();
  UserModel.exec = jest.fn();
  UserModel.select = jest.fn().mockReturnThis();
  UserModel.findByIdAndUpdate = jest.fn();
  UserModel.findByIdAndDelete = jest.fn();
  UserModel.updateMany = jest.fn();
  UserModel.deleteMany = jest.fn();
  UserModel.sort = jest.fn().mockReturnThis();
  UserModel.limit = jest.fn().mockReturnThis();
  UserModel.skip = jest.fn().mockReturnThis();
  UserModel.countDocuments = jest.fn();
  return UserModel;
});

jest.mock("../Models/Avis", () => {
  const AvisModel = jest.fn();
  AvisModel.find = jest.fn().mockReturnThis();
  AvisModel.findById = jest.fn().mockReturnThis();
  AvisModel.findOne = jest.fn().mockReturnThis();
  AvisModel.create = jest.fn();
  AvisModel.save = jest.fn();
  AvisModel.populate = jest.fn().mockReturnThis();
  AvisModel.exec = jest.fn();
  AvisModel.select = jest.fn().mockReturnThis();
  AvisModel.findByIdAndUpdate = jest.fn();
  AvisModel.findByIdAndDelete = jest.fn();
  AvisModel.updateMany = jest.fn();
  AvisModel.deleteMany = jest.fn();
  AvisModel.sort = jest.fn().mockReturnThis();
  AvisModel.limit = jest.fn().mockReturnThis();
  AvisModel.skip = jest.fn().mockReturnThis();
  AvisModel.countDocuments = jest.fn();
  return AvisModel;
});

jest.mock("../Models/Outil", () => {
  const OutilModel = jest.fn();
  OutilModel.find = jest.fn().mockReturnThis();
  OutilModel.findById = jest.fn().mockReturnThis();
  OutilModel.findOne = jest.fn().mockReturnThis();
  OutilModel.create = jest.fn();
  OutilModel.save = jest.fn();
  OutilModel.populate = jest.fn().mockReturnThis();
  OutilModel.exec = jest.fn();
  OutilModel.select = jest.fn().mockReturnThis();
  OutilModel.findByIdAndUpdate = jest.fn();
  OutilModel.findByIdAndDelete = jest.fn();
  OutilModel.updateMany = jest.fn();
  OutilModel.deleteMany = jest.fn();
  OutilModel.sort = jest.fn().mockReturnThis();
  OutilModel.limit = jest.fn().mockReturnThis();
  OutilModel.skip = jest.fn().mockReturnThis();
  OutilModel.countDocuments = jest.fn();
  return OutilModel;
});

jest.mock("../Models/Categorie", () => {
  const CategorieModel = jest.fn();
  CategorieModel.find = jest.fn().mockReturnThis();
  CategorieModel.findById = jest.fn().mockReturnThis();
  CategorieModel.findOne = jest.fn().mockReturnThis();
  CategorieModel.create = jest.fn();
  CategorieModel.save = jest.fn();
  CategorieModel.populate = jest.fn().mockReturnThis();
  CategorieModel.exec = jest.fn();
  CategorieModel.select = jest.fn().mockReturnThis();
  CategorieModel.findByIdAndUpdate = jest.fn();
  CategorieModel.findByIdAndDelete = jest.fn();
  CategorieModel.updateMany = jest.fn();
  CategorieModel.deleteMany = jest.fn();
  CategorieModel.sort = jest.fn().mockReturnThis();
  CategorieModel.limit = jest.fn().mockReturnThis();
  CategorieModel.skip = jest.fn().mockReturnThis();
  CategorieModel.countDocuments = jest.fn();
  return CategorieModel;
});

jest.mock("../utils/statistiques", () => ({
  calculerMoyennesOutil: jest.fn(),
}));
