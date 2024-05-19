import HttpError from "../helpers/HttpError.js";

const checkKey = (req, res, next) => {
    const key = req.headers['x-custom-key'] || req.body.key;
    if (!key || key !== process.env.SUBSCRIPTION_UPDATE_KEY) {
        throw HttpError(403, "Forbidden: Invalid or missing key");
    }
    next();
};

export default checkKey;