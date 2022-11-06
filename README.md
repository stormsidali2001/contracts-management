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

###  generate fake data 
1. go to the fake data generator folder
```
cd 'fake data generator'
```
2. generate some directions with their inner departements for testing .
```
node directions.js
```
> your output should be something like this
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
....
```
3. generate random users (directions step is required)
```
node users.js 200
```
> adding 200 random user

4. generate random vendors (suppliers)
```
node vendor.js 300
```
> adding 200 random vendor

5. generate random contracts or convensions
```
node agreements.js 500
```
> adding 500 random contracts or convensions



