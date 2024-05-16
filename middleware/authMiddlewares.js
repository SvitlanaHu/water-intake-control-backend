
import HttpError from "../helpers/HttpError.js";
import User from "../models/User.js";
import { checkToken } from "../services/jwtService.js";
 
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer') && req.headers.authorization.split(" ")[1];

    const userId = checkToken(token);

    if (!userId) throw HttpError(401, "Unauthorized...");

    const currentUser = await User.findById(id);

    if (!currentUser) throw HttpError(401, "Unauthorized...");

    req.user = currentUser;

    next();

  } catch (error) {
    next(error);
  }
}
