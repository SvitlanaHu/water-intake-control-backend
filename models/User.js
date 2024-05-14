import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
  timezone: {
    type: String,
    default: 'UTC' // Додати поле часового поясу зі значенням за замовчуванням 'UTC'
  },
});

// Middleware, яке динамічно змінює валідацію verificationToken
userSchema.pre("validate", function (next) {
  if (this.verify) {
    // Якщо користувач верифікований, зніміть вимогу до verificationToken
    this.constructor.schema.path("verificationToken").required(false);
  } else {
    // Якщо користувач не верифікований, залиште verificationToken як обов'язкове поле
    this.constructor.schema.path("verificationToken").required(true);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
