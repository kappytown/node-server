# Node.js Rest API with MVC Architecture

A professional, production-ready REST API built with pure Node.js (no Express), featuring MVC architecture, custom exception handling, MySQL database, and token authentication.

## Features
- **Pure Node.js** - No Express framework dependency
- **MVC Architecture** - Clean separation of concerns
- **Custom Exception Handling** - Professional error management
- **Request/Response Classes** - Centralized request parsing and response formatting
- **Database Factory Class** - Easily swap database connection
- **MySQL Integration** - Default database integration
- **Token Authentication** - Secure token-based auth with bcrypt password hashing and http-only cookie
- **RESTful API design** - Standard HTTP methods and status codes
- **Input Sanitization** - Built-in input sanitization and validation
- **Type-safe request handling** - Casts to the data type you expect
- **CORS Support** - Cross-origin resource sharing enabled

## Project Structure
```bash
server/
├── server.js                     # Main server file with routing
├── package.json                  # Dependencies and scripts
├── database.sql                  # Database schema
├── .env                          # Environment variables
├── conf/
│   ├── config.json               # Configuration file
├── lib/
│   ├── InputSanitizer.js         # Provides comprehensive input sanitization and validation to prevent SQL injection, XSS, and other injection attacks.
│   ├── Request.js                # Request parsing and validation
│   ├── Response.js               # Response helper methods
│   └── Router.js                 # Router used to match endpoints to controllers e.g., this.router.post('/api/v1/user', 'UserController', 'create') routes to UserController / create()
├── database/
│   ├── Database.js               # Base database class
│   └── DatabaseFactory.js        # Factory class for instantiating database
│   └── MySQLDatabase.js          # MySQL database class
├── exceptions/
│   ├── ApiException.js           # Base exception class
│   └── CustomExceptions.js       # All custom exceptions
├── controllers/
│   ├── BaseController.js         # Base controller class (All controllers should extend this base class)
│   ├── AuthController.js         # Used for authenticating the user
│   ├── ReportController.js       # Report resource CRUD
│   └── UserController.js         # User resource CRUD
└── models/
    ├── BaseModel.js              # Base model class
    ├── AuthModel.js              # Auth operations
    ├── ReportModel.js            # Report database operations
    └── UserModel.js              # User database operations
```

## API Endpoints
**Authentication Routes**
| Method   | Endpoint               | Description |
| :------- | :--------------------- | :---------- |
| GET    | `/api/v1/auth/session` | `Authenticate user` | 
| DELETE | `/api/v1/auth/session` | `Remove session` |

**Auth Routes**
| Method   | Endpoint              | Description |
| :------- | :-------------------- | :---------- |
| POST   | `/api/v1/auth/login`  | Login user (creates session) |
| POST   | `/api/v1/auth/logout` | Logout user (removes session) |

**User Routes**
| Method   | Endpoint                | Description |
| :------- | :---------------------- | :---------- |
| POST   | `/api/v1/user`          | Creates a new user |
| GET    | `/api/v1/user/:userId`  | Gets the user by id |
| PUT    | `/api/v1/user/:userId`  | Updates the user |
| DELETE | `/api/v1/user/:userId`  | Removes the user |
| POST   | `/api/v1/user/sendMail` | Sends email |

**Product Routes**
| Method   | Endpoint                          | Description |
| :------- | :-------------------------------- | :---------- |
| GET    | `/api/v1/products/categories`     | Gets all product categories |
| GET    | `/api/v1/products/category/:name` | Gets all products by category name |
| GET    | `/api/v1/products`                | Gets all products |
| GET    | `/api/v1/products/:id`            | Gets the product by id |
| PUT    | `/api/v1/products/:id`            | Updates the product |
| DELETE | `/api/v1/products/:id`            | Removes the product |

**Order Routes**
| Method   | Endpoint                      | Description |
| :------- | :---------------------------- | :---------- |
| GET    | `/api/v1/orders/statuses`     | Gets all the order statuses |
| GET    | `/api/v1/orders/status/:name` | Gets all the orders by status name |
| GET    | `/api/v1/orders`              | Gets all orders |
| GET    | `/api/v1/orders/:id`          | Gets the order by id |

**Report Routes**
| Method   | Endpoint                   | Description |
| :------- | :------------------------- | :---------- |
| GET    | `/api/v1/report/:reportId` | Gets the report by reportId |


## Flow
**Login Request**
1. Server successfully logs user in
2. Server creates session cookie with token (stored in sessions table)
3. Server sends secure httponly cookie back to browser
4. Browser stores cookie for subsequent requests/authentication

**Subsequent Requests**
1. Browser sends cookie to server
2. Server matches route to controller
3. Controller authenticates the request token (if authentication is required for the route)<br />**Note:** If authentication fails, the controller will send back a 401 response code.
4. Model retrieves the data and sends it back to the Controller
5. Controller sends response back to browser

## Installation
1. **Clone the repository**
```bash
git clone https://github.com/kappytown/node-server.git
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Edit .env with your database credentials
```

4. **Set up the database:**
```bash
mysql -u root -p < database.sql
```

5. **Update database credentials in `.env`:**
```bash
#.env
DB_TYPE='mysql'
DB_HOST='localhost'
DB_PORT=3306
DB_USER='your_username'
DB_PASSWORD='your_password'
DB_NAME='api_db'
```

6. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## Exception Types
The API includes comprehensive exception handling:

- **ApiException** (500) - Base exception class
- **AuthenticationException** (401) - Authentication failed
- **MethodNotAllowedException** (405) - HTTP method not supported
- **MethodNotFoundException** (404) - Controller method not found
- **MissingParametersException** (400) - Required parameters missing
- **NotFoundException** (404) - Resource not found
- **ValidationException** (422) - Request validation failed

## Input Sanitization
The Request class automatically sanitizes all input to prevent SQL injection:

- Escapes single quotes
- Escapes backslashes
- Removes null bytes
- Trims whitespace
- Supports arrays and objects

## Type Safety
Request class provides type-safe input methods:

```javascript
request.input('field')         // Sanitized string
request.int('field')           // Integer
request.float('field')         // Float
request.boolean('field')       // Boolean
request.all()                  // All input data

// Provide default value
request.input('field', 'defaultValue');

// Cast to float with default value
request.float('input', 0.00);

// Get sanitized value from querystring
request.input('field', 'defaultValue|null', 'query');

// Get sanitized value from enpoint params
request.input('field', 'defaultValue|null', 'params');
```

## Validation Rules
The Request class supports these validation rules:

- `email` - Field must be valid email format
- `password` - Field must be valid password format
- `min` - Minimum value
- `max` - Maximum value
- `minLength` - Minimum character length
- `maxLength` - Maximum character length

```javascript
// Examples
request.input('email', null, 'email');
request.getSanitizedInput('numItems', 0, 'int', { min:0, max: 100 });
request.getSanitizedInput('message', '', 'string', { minimum: 10, maximum:255 });
```
## Database Abstraction
The factory pattern allows easy database switching:

```javascript
// Change database type in .env
DB_TYPE=mysql  // or postgres, mongodb, etc.

// Use .env
const db = DatabaseFactory.fromEnv();
// Or use config (conf/config.json)
const db = DatabaseFactory.getInstance('postgres', config.database);
```

## Adding a New Database Class
1. Create new database class in `database/`
2. Extend `Database` class
3. Implement required methods
4. Register in `DatabaseFactory`

## License
**node-server** is licensed under the [GNU General Public License v3.0](LICENSE).