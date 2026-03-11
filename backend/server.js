require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const sociosRoutes = require('./routes/socios');
const projectsRoutes = require('./routes/projects');
const inscriptionsRoutes = require('./routes/inscriptions');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/socios', sociosRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
