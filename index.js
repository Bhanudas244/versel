// [index.js] with server app export.

const express = require("express");

const port = process.env.PORT || 4000;
const app = express();
var path = require('path');

  app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    
    res. sendFile(path. join(__dirname, 'public', 'home.html'));
  });
app.get('/about', (request, response) => {
  response.send('<h1>About</h1>');
});
app.get('/contact', (request, response) => {
    response.send('Contact to us');
  });

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Export the Express API
module.exports = app;
