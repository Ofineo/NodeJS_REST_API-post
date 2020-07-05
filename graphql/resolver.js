const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  createUser: async function ({ userInput }, req) {
    // const email = args.userInput.email;
    //validation code
    const errors = [];
    if (!validator.isEmail(userInput.email))
      errors.push({ message: "Email is invalid." });
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "password empty or too short!" });
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("this email is assigned to a user already");
      error.statusCode = 401;
      throw error;
    }
    if(errors.length>0){
        const error = new Error('invalid input.');
        error.data = errors;
        error.code =422;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const newUser = await user.save();
    return { ...newUser._doc, _id: newUser._id.toString() };
  },
};
