# contracts-management
## installation
###  clone the repository
```
git clone https://github.com/stormsidali2001/contracts-management
```

### database setup
If you have Docker installed, you can spin up the required MySQL database by running:
```
docker compose up -d
```

### install the packages
Run pnpm install at the root:
```
pnpm install
```
### filling the backend .env file with credentials
> create a .env file in the `apps/api` directory 
> use the .env-example template or copy paste the following code
```.env
### mysql database connection credentials
MYSQL_USERNAME =user1   
MYSQL_PASSWORD =password
MYSQL_DATABASE_HOST =localhost
MYSQL_DATABASE_PORT =3306
MYSQL_DATABASE_NAME =contracts_management

### jwt configuration variables
JWT_ACCESS_TOKEN_SECRET = super_secret_access_token
JWT_ACCESS_TOKEN_EXPIRES_IN = 10000

JWT_REFRESH_TOKEN_SECRET = super_secret_refresh_token
JWT_REFRESH_TOKEN_EXPIRES_IN = 100000000

### frontend port
CLIENT_PORT = 3000

### email service configuration
ethereal_user = xxxxxxx@xxxx.com
ethereal_password = password
```

### filling the fake data generator .env file with credentials
> create a .env file in the `apps/data-generator` directory 
> use the .env-example template or copy paste the following code
```.env
### mysql database connection credentials
MYSQL_USERNAME =user1   
MYSQL_PASSWORD =password
MYSQL_DATABASE_HOST =localhost
MYSQL_DATABASE_PORT =3306
MYSQL_DATABASE_NAME =contracts_management
```

### launching the backend & frontend processes
To start both the backend and frontend simultaneously using Turborepo:
```
pnpm dev
```
This will run `next dev` for the frontend and `nest start --watch` for the backend.

### other commands
* **Build all projects:** `pnpm build`
* **Lint all projects:** `pnpm lint`
* **Format code:** `pnpm format`

###  generate fake data 
You can generate fake data using the following commands from the root directory:

1. **Generate directions:**
```
pnpm generate:directions
```

2. **Generate users:**
```
pnpm generate:users -- 200
```
*(directions step is required first)*

3. **Generate vendors:**
```
pnpm generate:vendors -- 300
```

4. **Generate agreements:**
```
pnpm generate:agreements -- 500
```

5. **Create testing accounts:**
```
pnpm generate:accounts
```

Alternatively, you can go to the fake data generator folder:
```
cd apps/data-generator
```
 > then you will get an account foreach user role to use in your exploring journey
 ```javascript
 {
  username: 'storm.sidali',
  firstName: 'sidali',
  lastName: 'assoul',
  email: 'assoulsidali@gmail.com',
  role: 'EMPLOYEE',
  departementId: '58911004-4120-4c38-b55e-0013c99726cf',
  directionId: '6f4f175a-752d-4d9e-9e5d-6ff4e9a78686',
  password: '123456'
}
{
  username: 'admin.admin',
  firstName: 'admin',
  lastName: 'admin',
  email: 'admin@gmail.com',
  role: 'ADMIN',
  password: '123456'
}
{
  username: 'admin1.admin1',
  firstName: 'admin1',
  lastName: 'admin1',
  email: 'admin1@gmail.com',
  role: 'ADMIN',
  password: '123456'
}

{
  username: 'juridical.adala',
  firstName: 'juridical',
  lastName: 'adala',
  email: 'juridical@gmail.com',
  role: 'JURIDICAL',
  password: '123456'
}


 ```



