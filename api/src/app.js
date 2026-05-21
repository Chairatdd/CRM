require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const dashboardRoutes    = require('./routes/dashboard');
const customersRoutes    = require('./routes/customers');
const segmentsRoutes     = require('./routes/segments');
const interactionsRoutes = require('./routes/interactions');
const ordersRoutes       = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/customers',    customersRoutes);
app.use('/api/segments',     segmentsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/orders',       ordersRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'crm-node-api' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`CRM Node.js API running at http://localhost:${PORT}`);
});
