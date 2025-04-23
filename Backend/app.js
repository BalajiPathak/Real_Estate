const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const userRoutes = require('./routes/user');
const propertyRoutes = require('./routes/property');
<<<<<<< Updated upstream
const homeRoutes= require('./routes/home');
const navbarRoutes =require('./routes/navbar');
const companyInfoRoutes =require('./routes/companyInfo');


=======
>>>>>>> Stashed changes
const app = express();

// Add debug logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files middleware with proper MIME types
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
  const upload = multer({ storage });

// Configure static middleware for assets
// app.use('/assets', express.static(path.join(__dirname, 'assets'), {
//     setHeaders: (res, filePath) => {
//         if (filePath.endsWith('.css')) {
//             res.setHeader('Content-Type', 'text/css');
//         } else if (filePath.endsWith('.js')) {
//             res.setHeader('Content-Type', 'application/javascript');
//         } else if (filePath.endsWith('.woff')) {
//             res.setHeader('Content-Type', 'application/font-woff');
//         } else if (filePath.endsWith('.woff2')) {
//             res.setHeader('Content-Type', 'application/font-woff2');
//         } else if (filePath.endsWith('.ttf')) {
//             res.setHeader('Content-Type', 'font/ttf');
//         } else if (filePath.endsWith('.eot')) {
//             res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
//         } else if (filePath.endsWith('.svg')) {
//             res.setHeader('Content-Type', 'image/svg+xml');
//         }
//     }
// }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Node modules static routes
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Specific package routes
app.use('/slick', express.static(path.join(__dirname, 'node_modules/slick-carousel/slick')));
app.use('/lightbox', express.static(path.join(__dirname, 'node_modules/lightbox2/dist')));
app.use('/jquery-ui', express.static(path.join(__dirname, 'node_modules/jquery-ui/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use('/font-awesome', express.static(path.join(__dirname, 'node_modules/font-awesome'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/font-awesome', express.static(path.join(__dirname, 'node_modules/font-awesome')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://balajipathak:pUo5vnHtW84bZTej@cluster0.himqpss.mongodb.net/realEstate')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use(homeRoutes); 
app.use(userRoutes);  // Removed duplicate userRoutes
app.use(navbarRoutes);
app.use(companyInfoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: err.message 
    });
});

//property routes
app.use('/property', propertyRoutes);

//property routes
app.use('/property', propertyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});