import mongoose from "mongoose";
import moment from "moment-timezone";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: function (email) {
        return emailRegex.test(email);
      }, message: props => `${props.value} is not a valid email!`
    }
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
  }, refreshToken: {
    type: String,
    default: null,
  },
  avatarURL: String,
  avatarPublicId: String, // Add this field to store Cloudinary public ID
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
    default: 'UTC', // Додати поле часового поясу зі значенням за замовчуванням 'UTC'
    validate: {
      validator: function (timezone) {
        return moment.tz.zone(timezone) !== null;
      },
      message: props => `${props.value} is not a valid time zone!`
    }
  },
  nickname: {
    type: String,
  },
  gender: {
    type: String,
    default: null,
  },
  weight: {
    type: Number,
    default: 0,
  },
  activeTime: {
    type: Number,
    default: 0,
  },
  dailyWaterIntake: {
    type: Number,
    default: 0,
  },
  resetToken: String,
  resetTokenExpiration: Date,
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
