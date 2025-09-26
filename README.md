# Utility Selfcare Platform

A modern, white-label selfcare portal for utility companies to provide their customers with online account management, billing, and consumption analytics.

## Overview

This platform enables utility companies (electricity, gas, water, heating) to offer their customers:
- 📊 Real-time consumption monitoring and analytics
- 💳 Online invoice viewing and payment
- 📱 Multi-platform access (web and mobile-ready)
- 🌐 Multi-language support
- 🔐 Secure authentication with multiple login methods

## Features

### Customer Portal
- **Dashboard** - Overview of current balance, consumption trends, and quick actions
- **Invoice Management** - View, download, and pay invoices online
- **Consumption Analytics** - Interactive charts comparing usage over time
- **Payment Processing** - Secure payment gateway integration
- **Account Management** - Manage multiple utility meters/accounts
- **Notifications** - Email and SMS alerts for bills and usage

### Admin Portal
- **User Management** - Monitor and manage customer accounts
- **System Configuration** - Configure payment gateways, API keys, and settings
- **Translation Management** - Add and manage language translations
- **Analytics Dashboard** - Business metrics and reporting
- **Audit Logs** - Track all system activities

### Integration Capabilities
- **ERP Systems** - Seamless integration with existing ERP systems (ERPNext, SAP, Oracle)
- **Payment Gateways** - Support for multiple payment providers
- **SMS/Email Services** - Automated notifications and alerts
- **Document Processing** - OCR for invoice verification

## Technology Stack

### Backend
- Laravel 12 (PHP 8.4+)
- PostgreSQL 18
- Redis 8.2+
- RESTful API with JWT authentication

### Frontend
- React 19 with TypeScript
- Vite build tool
- TailwindCSS for styling
- Mobile-responsive design

### Infrastructure
- Docker containerization
- GitHub Actions CI/CD
- Horizontal scaling ready

## Getting Started

### Prerequisites
- PHP 8.4+
- Node.js 20+
- PostgreSQL 18
- Redis 8.2+
- Composer

### Installation

1. Clone the repository
```bash
git clone git@github.com:agonk/utility-selfcare.git
cd utility-selfcare
```

2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Configuration

Create a `.env` file in the backend directory with your configuration:

```env
APP_NAME="Utility Selfcare"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=selfcare
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## API Documentation

API documentation is available at `/api/documentation` when running in development mode.

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Main Endpoints
- `GET /api/invoices` - List invoices
- `GET /api/consumption` - Consumption data
- `POST /api/payments` - Process payment
- `GET /api/user/profile` - User profile

## Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

## Deployment

### Production Build
```bash
# Backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
npm run build
```

### Environment Variables
Ensure all required environment variables are set in production:
- Database credentials
- Redis connection
- API keys for integrations
- Payment gateway credentials
- SMTP settings

## Multi-Tenant Configuration

The platform supports multiple utility companies with customizable:
- Branding (logo, colors, fonts)
- Languages
- Payment methods
- Features and modules
- Pricing structures

## Security

- 🔒 JWT-based authentication
- 🛡️ Rate limiting on all endpoints
- 🔐 Encrypted sensitive data
- 📝 Comprehensive audit logging
- ✅ GDPR compliant
- 🚫 SQL injection protection
- 🔑 Environment-based secrets

## Performance

- ⚡ Response time < 200ms for API calls
- 📦 Optimized database queries with indexing
- 🚀 Redis caching for frequently accessed data
- 📊 Horizontal scaling support
- 🔄 Queue-based background processing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch from `main`
2. Implement your feature with tests
3. Ensure all tests pass
4. Submit a pull request

## Support

For technical support or questions:
- Create an issue in the GitHub repository
- Contact the development team

## License

Proprietary software. All rights reserved.

## Acknowledgments

Built with modern open-source technologies and best practices for scalability, security, and maintainability.

---

**Current Implementation**: Termokos (District Heating Company)
**Version**: 1.0.0
**Status**: Active Development