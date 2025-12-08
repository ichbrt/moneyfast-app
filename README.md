
✅ **Batch Management**
- Create batches from CSV files or JSON API
- Real-time status tracking
- Automatic retry for failed transactions
- Webhook callbacks from providers

✅ **Web Interface**
- User authentication with JWT
- Dashboard with batch list
- CSV upload with drag-and-drop
- Transaction details view

✅ **ERP Integration**
- REST API for C# or other systems
- JSON-based batch creation
- Status polling

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: MTN MoMo, Airtel Money

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+

### Installation

1. **Clone or navigate to project directory**
   ```bash
   cd bulk-payment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   
   Create a PostgreSQL database:
   ```bash
   createdb bulk_payments
   ```

   Run the schema:
   ```bash
   psql -U postgres -d bulk_payments -f sql/schema.sql
   ```

4. **Configure environment**

   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

   Update these critical values:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Random secret key
   - MTN credentials (from MTN Developer Portal)
   - Airtel credentials (from Airtel Developer Portal)

5. **Start the server**

   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

6. **Access the application**
   - Web UI: http://localhost:3000
   - API: http://localhost:3000/api

### Default Login

- **Email**: admin@smsconstruction.com
- **Password**: admin123

⚠️ **Change this password in production!**

## Project Structure

```
bulk-payment-system/
├── sql/
│   └── schema.sql              # Database schema
├── src/
│   ├── config/
│   │   └── db.js               # Database connection
│   ├── models/
│   │   ├── userModel.js        # User database operations
│   │   ├── batchModel.js       # Batch database operations
│   │   └── itemModel.js        # Item database operations
│   ├── providers/
│   │   ├── mtn.js              # MTN MoMo API integration
│   │   ├── airtel.js           # Airtel Money API integration
│   │   └── payout.js           # Unified payout service
│   ├── services/
│   │   ├── csvService.js       # CSV parsing
│   │   ├── batchService.js     # Batch business logic
│   │   └── payoutService.js    # Payout worker
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Authentication & authorization
│   │   └── errorMiddleware.js  # Error handling
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── batchRoutes.js      # Batch endpoints
│   │   ├── webhookRoutes.js    # Webhook endpoints
│   │   └── cronRoutes.js       # Admin/cron endpoints
│   ├── utils/
│   │   ├── phoneUtils.js       # Phone number utilities
│   │   └── validation.js       # Validation functions
│   ├── app.js                  # Express app setup
│   └── server.js               # HTTP server
├── public/
│   ├── css/
│   │   └── style.css           # Styles
│   ├── js/
│   │   └── app.js              # Frontend JavaScript
│   ├── index.html              # Login page
│   ├── dashboard.html          # Dashboard
│   ├── upload.html             # CSV upload
│   └── batch-details.html      # Batch details
├── .env.example                # Environment template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Batches

- `POST /api/batches` - Create batch from JSON
- `POST /api/batches/upload-csv` - Create batch from CSV
- `GET /api/batches/:id` - Get batch details
- `GET /api/batches` - List batches
- `GET /api/batches/template/csv` - Download CSV template

### Webhooks

- `POST /api/webhooks/mtn` - MTN callback
- `POST /api/webhooks/airtel` - Airtel callback

### Admin

- `POST /api/cron/run-payouts` - Trigger payout processing
- `GET /api/cron/status` - System status

## CSV Format

```csv
phone_number,amount,reference,description
0772123456,450000,DEC-2025-001,Site foreman salary
0783987654,1200000,DEC-2025-002,Engineer salary
0751234567,800000,DEC-2025-003,Store keeper salary
```

## Phone Number Prefixes (Uganda)

- **MTN**: 077, 078, 076
- **Airtel**: 070, 075

## Getting MTN & Airtel Credentials

### MTN MoMo Sandbox

1. Go to https://momodeveloper.mtn.com/
2. Sign up and create a subscription for **Disbursements**
3. Generate API User and API Key
4. Get your subscription key

### Airtel Sandbox

1. Go to https://developers.airtel.africa/
2. Sign up and create an app
3. Select **Disbursements** product
4. Get Client ID and Client Secret

## Production Deployment

1. **Environment**
   - Use production credentials from MTN & Airtel
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`

2. **Database**
   - Use managed PostgreSQL (AWS RDS, Digital Ocean, etc.)
   - Enable SSL
   - Regular backups

3. **Server**
   - Use PM2 or systemd for process management
   - Configure Nginx as reverse proxy
   - Enable HTTPS with Let's Encrypt

4. **Security**
   - IP whitelist for webhooks
   - Rate limiting
   - Regular security updates

## Worker Process

The payout worker can be triggered:
1. **Manually** via admin endpoint: `POST /api/cron/run-payouts`
2. **Automatically** with a cron job (every minute):
   ```bash
   * * * * * curl -X POST http://localhost:3000/api/cron/run-payouts -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

## Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### MTN/Airtel API Errors
- Verify credentials in `.env`
- Check sandbox/production URL
- Review API logs in console

### Login Issues
- Default password is `admin123`
- Check database has user record
- Verify JWT_SECRET is set

## License

ISC

## Support

For issues and questions, contact your system administrator or SMS Construction IT department.
