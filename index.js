import express from 'express';
import bodyParser from 'body-parser';
import layouts from 'express-ejs-layouts';
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

//use express-ejs-layouts for layout support
app.use(layouts);
app.set('layout', 'layouts/main'); // Set the default layout


app.get('/', (req, res) => {
  res.render('home', {
        title: 'Home Page',
    });
});

app.get('/posts', (req, res) => {
  res.render('posts', {
        layout: 'layouts/blog',
        title: 'Posts Page',
    });
});

app.get('/create-post', (req, res) => {
  res.render('create-post', {
        layout: 'layouts/post',
        title: 'Create Post Page',
    });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});