const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return res.status(400).json({ message });
    }
    next();
  };
};

export default validateQuery;
