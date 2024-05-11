const Water = require("../src/models/Water");

exports.getWaters = async (req, res) => {
    try {
        const waters = await Water.find();
        res.json(waters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addWater = async (req, res) => {
    const water = new Water({
        amount: req.body.amount,
    });
    try {
        const newWater = await water.save();
        res.status(201).json(newWater);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};