const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const Route = require('./route/Route');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', Route);

mongoose.connect(config.DB_URL)
.then(() => console.log("Database Connected"))
.catch(err => console.log("Database Connection Failed:", err));

app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
