const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const Route = require('./route/Route');

const app = express();


app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', Route);

mongoose.connect(config.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Database Connected"))
.catch(err => console.log("Database Connection Failed:", err));

// ✅ Render PORT fix
const PORT = process.env.PORT || config.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
