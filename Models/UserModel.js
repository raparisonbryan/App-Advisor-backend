const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name est requis"] },
    email: { type: String, required: [true, "email est requis"] },
    password: { type: String, required: [true, "password est requis"] },
    Admin: {
      type: Boolean,
      required: [true, "user is an admin "],
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
  },
  { versionKey: false }
);

userSchema.pre("findOneAndDelete", async function () {
  const userId = this.getQuery()._id;
  await mongoose.model("Avis").deleteMany({ user: userId });
});

const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;
