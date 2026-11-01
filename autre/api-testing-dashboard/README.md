# 🚀 API Testing Dashboard

## Description
Comprehensive testing dashboard for microservices backend with Feign communication tracking and transaction reporting.

## Features
- ✅ Test all 9 microservices endpoints
- ✅ Track Feign client communications between services
- ✅ Run complex transaction scenarios
- ✅ Generate HTML and JSON reports
- ✅ Real-time service status monitoring
- ✅ Beautiful glassmorphism UI

## Services Monitored
1. **Eureka Server** (8761) - Service Discovery
2. **Gateway Service** (9055) - API Gateway
3. **Notification Service** (9000) - Notifications
4. **Product Service** (8031) - Product Management
5. **Payment Service** (8035) - Payment Processing
6. **Purchase Order Service** (8033) - Purchase Orders
7. **Sales Order Service** (8032) - Sales Orders
8. **Security Service** (8081) - Authentication & Authorization
9. **Supplier Client Service** (8034) - Supplier Management

## How to Use

### 1. Start All Services
Make sure all backend microservices are running:
```powershell
# Start Eureka Server first
cd c:\Users\pc\projet\my-app-mainPublic-6\Eureka-Server
.\mvnw.cmd spring-boot:run

# Start Gateway Service
cd c:\Users\pc\projet\my-app-mainPublic-6\Gateway-Service
.\mvnw.cmd spring-boot:run

# Start other services...
```

### 2. Open Dashboard
Simply open `index.html` in your web browser:
```powershell
cd c:\Users\pc\projet\api-testing-dashboard
start index.html
```

### 3. Test Services
- Click **"🔄 Refresh Status"** to check all services
- Click **"🧪 Test All Services"** to test all endpoints
- Click **"Test Service"** on individual cards to test specific services
- Run **transaction scenarios** to test Feign communications

### 4. Generate Reports
- Click **"📄 Export HTML Report"** for a formatted HTML report
- Click **"📊 Export JSON Report"** for raw JSON data

## Transaction Scenarios

### Sales Order Flow
Tests the complete sales order creation process:
1. Create sales order
2. Check product stock via Feign
3. Process payment via Feign
4. Verify supplier via Feign

### Purchase Order Flow
Tests the complete purchase order creation process:
1. Create purchase order
2. Update product stock via Feign
3. Record payment via Feign
4. Link supplier via Feign

## File Structure
```
api-testing-dashboard/
├── index.html              # Main dashboard interface
├── css/
│   └── styles.css          # Modern glassmorphism styles
├── js/
│   ├── config.js           # Service configurations
│   ├── api-tester.js       # API testing engine
│   ├── feign-tracker.js    # Feign communication tracker
│   ├── report-generator.js # Report generation
│   └── app.js              # Main application logic
└── reports/                # Generated reports folder
```

## Technologies Used
- HTML5
- Vanilla CSS (Glassmorphism design)
- Vanilla JavaScript (No frameworks)
- Fetch API for HTTP requests

## Notes
- All services must be running for full functionality
- CORS must be enabled on backend services
- Reports are generated client-side and can be downloaded
- Dashboard works offline once loaded (except for API calls)

## Troubleshooting

### Services showing offline?
- Check if the service is actually running
- Verify the port numbers in `js/config.js`
- Check CORS settings on backend

### Tests failing?
- Ensure all services are healthy
- Check network connectivity
- Verify endpoint paths in configuration

### Feign tracking not working?
- This tracks simulated Feign calls
- For real tracking, backend logging is needed

## Future Enhancements
- Real-time WebSocket updates
- Historical test data storage
- Performance metrics graphs
- Automated scheduled testing
- Email notifications for failures
