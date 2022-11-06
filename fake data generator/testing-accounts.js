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
      role:randomElemenetFromArray(ROLES.sort(()=>Math.random() > 0.5)),
      departementId,
      directionId,
      password: '123456',
    };
  }
 
 
async function generateUsers(directions){
    if(directions.length === 0 ) return ;
    const arr = [];
   
    for(let i=0;i<(process.argv.at(2) ?? 1);i++){
        const randomDirection = randomElemenetFromArray(directions)
        if(randomDirection.departements.length ===0) continue;
        const randomDepartement = randomElemenetFromArray(randomDirection.departements);
        const user1 = {
                        username: "storm.sidali",
                        firstName:"sidali",
                        lastName:"assoul",
                        email: "assoulsidali@gmail.com",
                        role:"EMPLOYEE",
                        departementId:randomDepartement.id,
                        directionId:randomDirection.id,
                        password: '123456',
                    }
        const user2 = {
                        username: "admin.admin",
                        firstName:"admin",
                        lastName:"admin",
                        email: "admin@gmail.com",
                        role:"ADMIN",
                        password: '123456',
        }
        const user3 = {
                        username: "juridical.adala",
                        firstName:"juridical",
                        lastName:"adala",
                        email: "juridical@gmail.com",
                        role:"ADMIN",
                        password: '123456',
        }
        console.log(user1)
        console.log(user2)
        console.log(user3)
        arr.push(axios.post("http://localhost:8080/api/auth/register/test",{...user1},{headers:{'Content-Type':'application/json'}}))
        arr.push(axios.post("http://localhost:8080/api/auth/register/test",{...user2},{headers:{'Content-Type':'application/json'}}))
        arr.push(axios.post("http://localhost:8080/api/auth/register/test",{...user3},{headers:{'Content-Type':'application/json'}}))
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