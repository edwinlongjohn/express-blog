import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;  
//set EJS as the view engine
app.set('view engine', 'ejs');
//import body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
//serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//set the directory for EJS templates
app.set('views', path.join(__dirname, 'views'));




app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});