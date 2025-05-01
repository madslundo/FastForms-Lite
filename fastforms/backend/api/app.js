const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const formTemplateRoutes = require('./routes/formTemplateRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const optionsRoutes = require("./routes/optionsRoutes");
const ruleProcessor = require('./routes/ruleProcessor');

const app = express();

app.use(cors())
app.use(express.json());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/forms', formTemplateRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/options', optionsRoutes);
app.use('/api', ruleProcessor);

app.use(express.static("build"));
app.use(express.static("build/static"));

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

  
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
