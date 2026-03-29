import express from 'express';
import bodyParser from 'body-parser';
import layouts from 'express-ejs-layouts';
import path from 'path';
import env from 'dotenv';
import { fileURLToPath } from 'url';
import prismaPkg from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
env.config();

const { PrismaClient } = prismaPkg;
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;  
const DEFAULT_CATEGORIES = [
  { slug: 'technology' + '-' + crypto.randomUUID().slice(0, 8), name: 'Technology' },
  { slug: 'design' + '-' + crypto.randomUUID().slice(0, 8), name: 'Design' },
  { slug: 'productivity' + '-' + crypto.randomUUID().slice(0, 8), name: 'Productivity' },
  { slug: 'life' + '-' + crypto.randomUUID().slice(0, 8), name: 'Life' },
];

const DEFAULT_AUTHOR = {
  email: 'admin@blog.local',
  name: 'Blog Admin',
  password: 'temporary-password-change-me',
};

function formatCategoryName(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      })
    )
  );
}

async function ensureDefaultAuthor() {
  return prisma.user.upsert({
    where: { email: DEFAULT_AUTHOR.email },
    update: {},
    create: DEFAULT_AUTHOR,
  });
}
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

app.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
      author: true,
    },
    orderBy: {
      id: 'desc',
    },
  });
  console.log('Fetched posts:', posts);
  res.render('posts', {
    layout: 'layouts/blog',
    title: 'Posts Page',
    posts,
  });
});

app.get('/create-post', async (req, res) => {
  await ensureDefaultCategories();
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  res.render('create-post', {
    layout: 'layouts/post',
    title: 'Create Post Page',
    categories,
  });
});

app.post('/create-post', async (req, res) => {
  const { title, content, category_id, status } = req.body;

  if (!title || !category_id) {
    return res.status(400).send('Title and category are required.');
  }

  const author = await ensureDefaultAuthor();

  await prisma.category.upsert({
    where: { slug: category_id },
    update: {},
    create: {
      slug: category_id,
      name: formatCategoryName(category_id),
    },
  });

  await prisma.post.create({
    data: {
      title,
      content: content?.trim() || null,
      published: status === 'published',
      authorId: author.id,
      category_id,
    },
  });

  return res.redirect('/posts');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});