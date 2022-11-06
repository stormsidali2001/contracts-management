# contracts-management
## installation
###  clone the repository
```
git clone https://github.com/stormsidali2001/contracts-management
```
### install the packages
1. open each folder of the 3 main folders: **fake data generator** , **backend** , **frontend** and type on the cli:
```
npm install
```
> or if you have yarn installed
```
yarn
```
2. optional
>to install yarn type
```
npm install --global yarn
```
### filling the .env file with credentials
> create a .env file in the backend directory 
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

### launching the backend & frontend processes
#### frontend process:
* in the main directory type
```
cd frontend
```
1. with yarn
```
yarn run dev
```
2. with npm
```
npm run dev
```
#### frontend process:
* in the main directory type
```
cd backend
```
1. with yarn
```
yarn start:dev
```
2. with npm
```
npm start:dev
```


###  generate fake data 
1. go to the fake data generator folder
```
cd 'fake data generator'
```
2. generate some directions with their inner departements for testing .
```
node directions.js
```

```javascript
{
  title: 'direction generale',
  abriviation: 'DRG',
  departements: [
    { title: 'departement 1', abriviation: 'DP1' },
    { title: 'departement 2', abriviation: 'DP2' },
    { title: 'departement 3', abriviation: 'DP3' }
  ]
}
...
```
> your output should be something like this

3. generate random users (directions step is required)
```
node users.js 200
```
> adding 200 random user

```javascript
{
  username: 'Théodose.Thomas',
  firstName: 'Corentin',
  lastName: 'Roche',
  email: 'Bernard_Breton59@yahoo.fr',
  role: 'EMPLOYEE',
  departementId: '65bcb45a-02e8-4fad-8f63-4dffcc076800',
  directionId: '34aad234-c03a-4b0d-900b-f5bf347303b9',
  password: '123456'
}
...
```
> your output should be something like this

4. generate random vendors (suppliers)
```
node vendor.js 300
```
> adding 200 random vendor
```javascript
{
  nif: 'R4021357B',
  company_name: 'Roger SAS',
  nrc: 'IKPGXWVPGP',
  num: 'RYMOTWMKYJ',
  address: 'MarocÎle-de-FranceBoulogne-Billancourt',
  mobile_phone_number: '0647556550',
  home_phone_number: '0396324966',
  createdAt: '2022-11-01'
}
...
```
> your output should be something like this

5. generate random contracts or convensions
```
node agreements.js 500
```
> adding 500 random contracts or convensions

```javascript
{
  number: 'VF6,5,1,7,4,8,2,8',
  type: 'contract',
  amount: 976,
  signature_date: '2022-11-06',
  expiration_date: '2023-01-06',
  status: 'not_executed',
  url: '2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
  object: "un champ reservee pour l'object",
  directionId: '1e64be81-10d4-4d78-bc8b-e5ce458d2e38',
  departementId: '4ad0cd65-b5a4-4a40-852f-e2b400b4dced',
  vendorId: '819c3f29-4634-46e3-8c8a-962dd3e2f7be'
}
{
  number: 'BY5,5,0,2,1,1,8,7',
  type: 'convension',
  amount: 1180,
  signature_date: '2022-11-06',
  expiration_date: '2023-01-06',
  status: 'not_executed',
  url: '2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
  object: "un champ reservee pour l'object",
  directionId: '6f4f175a-752d-4d9e-9e5d-6ff4e9a78686',
  departementId: '58911004-4120-4c38-b55e-0013c99726cf',
  vendorId: 'de3b8ee5-43ef-4d05-a5cc-152673f828e1'
}
....
```
> your output should be something like this

### Create the testing accounts
 ```
 cd 'fake data generator'
 node testing-accounts
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
  username: 'juridical.adala',
  firstName: 'juridical',
  lastName: 'adala',
  email: 'juridical@gmail.com',
  role: 'ADMIN',
  password: '123456'
}

 ```



