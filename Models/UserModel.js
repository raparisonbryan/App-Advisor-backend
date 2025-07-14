const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  email: { type: String, required: [true, "email is required"] },
  password: { type: String, required: [true, "password is required"] },
  Admin : {type : Boolean , required : [true , "user is an admin "] , default : false} ,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { versionKey: false });

userSchema.pre('findOneAndDelete', async function() {
  const userId = this.getQuery()._id;
  await mongoose.model('Avis').deleteMany({ user: userId });
});

const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;