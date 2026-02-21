const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Paths ───
const DATA_DIR = path.join(__dirname, 'data');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const EXPERIENCES_FILE = path.join(DATA_DIR, 'experiences.json');
const IMAGES_DIR = path.join(__dirname, 'assets/images');

// Ensure directories exist
[DATA_DIR, IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Middleware ───
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic auth for admin routes
const adminAuth = basicAuth({
    users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'changeme' },
    challenge: true,
    realm: 'YOLO Admin'
});

// ─── Multer config ───
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Support sub-folders for property images
        const subfolder = req.params.property || '';
        const uploadPath = subfolder
            ? path.join(IMAGES_DIR, subfolder)
            : IMAGES_DIR;
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const basename = path.basename(file.originalname, path.extname(file.originalname));
        const safeName = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${safeName}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedExt = /\.(jpe?g|png|webp|gif|svg)$/i;
        const allowedMime = /^image\/(jpeg|png|webp|gif|svg\+xml)$/;
        if (allowedExt.test(path.extname(file.originalname)) && allowedMime.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.'));
    }
});

// ─── Helpers ───
function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return [];
    }
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getNextId(items) {
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.id)) + 1;
}

// ─── Static files ───
app.use(express.static(__dirname));

// ════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════════════════

app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Legacy upload page redirect
app.get('/admin/upload', adminAuth, (req, res) => {
    res.redirect('/admin');
});

// ════════════════════════════════════════════════════════
//  BLOG API
// ════════════════════════════════════════════════════════

// GET all blogs (public)
app.get('/api/blogs', (req, res) => {
    const blogs = readJSON(BLOGS_FILE);
    res.json(blogs);
});

// GET single blog (public)
app.get('/api/blogs/:id', (req, res) => {
    const blogs = readJSON(BLOGS_FILE);
    const blog = blogs.find(b => b.id === parseInt(req.params.id));
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
});

// POST create blog (admin)
app.post('/api/blogs', adminAuth, upload.single('image'), (req, res) => {
    const blogs = readJSON(BLOGS_FILE);
    const newBlog = {
        id: getNextId(blogs),
        featured: req.body.featured === 'true',
        category: req.body.category || '',
        tag: req.body.tag || '',
        date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: req.body.readTime || '5 min read',
        title: req.body.title || '',
        excerpt: req.body.excerpt || '',
        image: req.file ? `assets/images/${req.file.filename}` : (req.body.image || ''),
        imageAlt: req.body.imageAlt || '',
        url: req.body.url || '',
        body: req.body.body ? (typeof req.body.body === 'string' ? JSON.parse(req.body.body) : req.body.body) : []
    };
    blogs.push(newBlog);
    writeJSON(BLOGS_FILE, blogs);
    res.status(201).json(newBlog);
});

// PUT update blog (admin)
app.put('/api/blogs/:id', adminAuth, upload.single('image'), (req, res) => {
    const blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Blog not found' });

    const existing = blogs[index];
    blogs[index] = {
        ...existing,
        featured: req.body.featured !== undefined ? req.body.featured === 'true' : existing.featured,
        category: req.body.category || existing.category,
        tag: req.body.tag || existing.tag,
        date: req.body.date || existing.date,
        readTime: req.body.readTime || existing.readTime,
        title: req.body.title || existing.title,
        excerpt: req.body.excerpt || existing.excerpt,
        image: req.file ? `assets/images/${req.file.filename}` : (req.body.image || existing.image),
        imageAlt: req.body.imageAlt !== undefined ? req.body.imageAlt : existing.imageAlt,
        url: req.body.url !== undefined ? req.body.url : existing.url,
        body: req.body.body ? (typeof req.body.body === 'string' ? JSON.parse(req.body.body) : req.body.body) : existing.body
    };
    writeJSON(BLOGS_FILE, blogs);
    res.json(blogs[index]);
});

// DELETE blog (admin)
app.delete('/api/blogs/:id', adminAuth, (req, res) => {
    let blogs = readJSON(BLOGS_FILE);
    const index = blogs.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Blog not found' });
    const deleted = blogs.splice(index, 1)[0];
    writeJSON(BLOGS_FILE, blogs);
    res.json({ message: 'Blog deleted', blog: deleted });
});

// ════════════════════════════════════════════════════════
//  EXPERIENCE API
// ════════════════════════════════════════════════════════

// GET all experiences (public)
app.get('/api/experiences', (req, res) => {
    const experiences = readJSON(EXPERIENCES_FILE);
    res.json(experiences);
});

// GET single experience (public)
app.get('/api/experiences/:id', (req, res) => {
    const experiences = readJSON(EXPERIENCES_FILE);
    const exp = experiences.find(e => e.id === parseInt(req.params.id));
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json(exp);
});

// POST create experience (admin)
app.post('/api/experiences', adminAuth, upload.single('image'), (req, res) => {
    const experiences = readJSON(EXPERIENCES_FILE);
    const newExp = {
        id: getNextId(experiences),
        category: req.body.category || '',
        filterTag: req.body.filterTag || req.body.category || '',
        badge: req.body.badge || '',
        meta: req.body.meta || '',
        title: req.body.title || '',
        excerpt: req.body.excerpt || '',
        image: req.file ? `assets/images/${req.file.filename}` : (req.body.image || ''),
        link: req.body.link || '#',
        featured: req.body.featured === 'true',
        wide: req.body.wide === 'true'
    };
    experiences.push(newExp);
    writeJSON(EXPERIENCES_FILE, experiences);
    res.status(201).json(newExp);
});

// PUT update experience (admin)
app.put('/api/experiences/:id', adminAuth, upload.single('image'), (req, res) => {
    const experiences = readJSON(EXPERIENCES_FILE);
    const index = experiences.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Experience not found' });

    const existing = experiences[index];
    experiences[index] = {
        ...existing,
        category: req.body.category || existing.category,
        filterTag: req.body.filterTag || existing.filterTag,
        badge: req.body.badge || existing.badge,
        meta: req.body.meta || existing.meta,
        title: req.body.title || existing.title,
        excerpt: req.body.excerpt || existing.excerpt,
        image: req.file ? `assets/images/${req.file.filename}` : (req.body.image || existing.image),
        link: req.body.link || existing.link,
        featured: req.body.featured !== undefined ? req.body.featured === 'true' : existing.featured,
        wide: req.body.wide !== undefined ? req.body.wide === 'true' : existing.wide
    };
    writeJSON(EXPERIENCES_FILE, experiences);
    res.json(experiences[index]);
});

// DELETE experience (admin)
app.delete('/api/experiences/:id', adminAuth, (req, res) => {
    let experiences = readJSON(EXPERIENCES_FILE);
    const index = experiences.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Experience not found' });
    const deleted = experiences.splice(index, 1)[0];
    writeJSON(EXPERIENCES_FILE, experiences);
    res.json({ message: 'Experience deleted', experience: deleted });
});

// ════════════════════════════════════════════════════════
//  PROPERTY IMAGES API
// ════════════════════════════════════════════════════════

const PROPERTIES = ['manali', 'kasol', 'jispa', 'general'];

// GET list properties and their images
app.get('/api/properties', (req, res) => {
    const result = {};
    PROPERTIES.forEach(prop => {
        const propDir = prop === 'general' ? IMAGES_DIR : path.join(IMAGES_DIR, prop);
        if (fs.existsSync(propDir)) {
            result[prop] = fs.readdirSync(propDir)
                .filter(f => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
                .map(f => ({
                    filename: f,
                    path: prop === 'general' ? `assets/images/${f}` : `assets/images/${prop}/${f}`,
                    size: fs.statSync(path.join(propDir, f)).size
                }));
        } else {
            result[prop] = [];
        }
    });
    res.json(result);
});

// POST upload image to a property
app.post('/api/properties/:property/images', adminAuth, upload.single('image'), (req, res) => {
    if (!PROPERTIES.includes(req.params.property)) {
        return res.status(400).json({ error: `Invalid property. Options: ${PROPERTIES.join(', ')}` });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = req.params.property === 'general'
        ? `assets/images/${req.file.filename}`
        : `assets/images/${req.params.property}/${req.file.filename}`;
    res.status(201).json({
        message: 'Image uploaded',
        filename: req.file.filename,
        path: relativePath
    });
});

// DELETE property image
app.delete('/api/properties/:property/images/:filename', adminAuth, (req, res) => {
    if (!PROPERTIES.includes(req.params.property)) {
        return res.status(400).json({ error: 'Invalid property' });
    }
    const safeName = path.basename(req.params.filename);
    const filePath = req.params.property === 'general'
        ? path.join(IMAGES_DIR, safeName)
        : path.join(IMAGES_DIR, req.params.property, safeName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    fs.unlinkSync(filePath);
    res.json({ message: 'Image deleted', filename: safeName });
});

// ─── Legacy upload route (redirect) ───
app.post('/upload', adminAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.send(`File uploaded: ${req.file.filename}. <a href="/admin">Back to Admin</a>`);
});

// ─── Error handling ───
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 The YOLO Collective server running at http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
});
