const axios = require("axios")
const faker = require("@faker-js/faker").faker;
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
faker.locale = 'fr';
 


const randomElemenetFromArray = (arr)=>arr[Math.floor(Math.random()*(arr.length - 1))]
const ROLES = ['JURIDICAL','EMPLOYEE','ADMIN',];
function createRandomUser(directionId,departementId) {
    return {
      username: faker.internet.userName(),
      firstName:faker.name.firstName(),
      lastName:faker.name.lastName(),
      email: faker.internet.email(),
      role:randomElemenetFromArray(ROLES),
      departementId,
      directionId,
      password: '123456',
    };
  }
 
 
async function generateUsers(directions){
    if(directions.length === 0 ) return ;
    const arr = [];
   
    for(let i=0;i<5;i++){
        const randomDirection = randomElemenetFromArray(directions)
        if(randomDirection.departements.length ===0) continue;
        const randomDepartement = randomElemenetFromArray(randomDirection.departements);
        const user = createRandomUser(randomDirection.id,randomDepartement.id)
        console.log(user)
        arr.push(axios.post("http://localhost:8080/api/auth/register",{...user},{headers:{'Content-Type':'application/json'}}))
    }
    try{

        await Promise.all(arr)
    }catch(err){
        console.error(err.message);    
    }
}
 




//run
(async function  main(){
    try{
        const connection = await mysql.createConnection({
            host:'localhost',
            user:'root',
            database:'contracts_management',
            password:'123456',
            Promise:bluebird
        });

        //i ignored the n+1 problem just because of the absence of an orm to ajust the entities
        const [directions] = await connection.execute(`select * from directions`,[])
        for(direction of directions ){
            const [departements] = await connection.execute("select * from departements  where directionId = ?",[direction.id])
            direction.departements = departements;

            
        }
         generateUsers(directions)
       
    }catch(err){
        console.error(err)
    }
     
})()