
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const web = require('./routes/web');
const cors = require('cors');

const port = process.env.PORT || 3000


app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

app.use(cors())
// Set EJS as templating engine
app.set('view engine', 'ejs');
app.use('/',web)




app.listen(port,()=>{
    console.log(`server running on ${port}`);
})