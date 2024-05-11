const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello from Express server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});