import express from 'express';
import { Client } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'db-postgresql-syd1-35143-do-user-19064962-0.f.db.ondigitalocean.com',
  port: parseInt(process.env.DB_PORT) || 25060,
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'doadmin',
  password: process.env.DB_PASSWORD || 'YOUR_DO_PASSWORD',
  ssl: {
    rejectUnauthorized: false
  }
};

let dbClient = null;

// Initialize database connection
async function initDatabase() {
  try {
    dbClient = new Client(dbConfig);
    await dbClient.connect();
    console.log('✅ Connected to DigitalOcean database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// API Routes

// Test connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT version()');
    res.json({ success: true, version: result.rows[0].version });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
app.get('/api/clients/:id', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, business_name, email, phone, status, pic, total_sales, total_collection, balance, tags } = req.body;
    const result = await dbClient.query(`
      INSERT INTO clients (name, business_name, email, phone, status, pic, total_sales, total_collection, balance, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [name, business_name, email, phone, status || 'Pending', pic || null, total_sales || 0, total_collection || 0, balance || 0, tags || []]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, business_name, email, phone, status, pic, total_sales, total_collection, balance, tags } = req.body;
    const result = await dbClient.query(`
      UPDATE clients
      SET name = COALESCE($1, name),
          business_name = COALESCE($2, business_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          status = COALESCE($5, status),
          pic = COALESCE($6, pic),
          total_sales = COALESCE($7, total_sales),
          total_collection = COALESCE($8, total_collection),
          balance = COALESCE($9, balance),
          tags = COALESCE($10, tags),
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [name, business_name, email, phone, status, pic, total_sales, total_collection, balance, tags, req.params.id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await dbClient.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const userCheck = await dbClient.query(
      'SELECT id, email, name, role, client_id, permissions, status FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Account not found' });
    }
    
    const userRecord = userCheck.rows[0];
    
    if (userRecord.status !== 'Active') {
      return res.status(401).json({ error: 'Account is not active' });
    }
    
    // Check password
    const authResult = await dbClient.query(
      'SELECT id, email, name, role, client_id, permissions, status FROM users WHERE email = $1 AND password = crypt($2, password)',
      [email, password]
    );
    
    if (authResult.rows.length > 0) {
      const user = authResult.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.client_id,
          permissions: user.permissions || []
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all calendar events
app.get('/api/calendar-events', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM calendar_events ORDER BY event_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all components
app.get('/api/components', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM components ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all progress steps
app.get('/api/progress-steps', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM progress_steps ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all chats
app.get('/api/chats', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT * FROM chats ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Database API server running on port ${PORT}`);
    console.log(`📊 Database: ${dbConfig.host}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error); 