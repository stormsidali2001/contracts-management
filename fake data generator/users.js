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
    if(Object.keys(directions).length === 0 ) return ;
    const arr = [];
   
    for(let i=0;i<(process.argv.at(2) ?? 1);i++){
        const randomDirection = randomElemenetFromArray(Object.keys(directions))
        if(directions[randomDirection]?.length === 0) continue;
        const randomDepartement = randomElemenetFromArray(directions[randomDirection]);
        const user = createRandomUser(randomDirection,randomDepartement)
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
        const [directionsRaw] = await connection.execute(`
            select 
            dr.id as directionId,
            dp.id as departementId

            from directions dr inner join departements dp 
            where dp.directionId = dr.id;
        `,[])
        console.log(directionsRaw)
        const directions = {}
        for( directionRaw of directionsRaw){
           const {directionId,departementId}= directionRaw;
           if(directions[directionId] === undefined) directions[directionId] = [departementId]
           else directions[directionId].push(departementId)
           
        }
      
        generateUsers(directions)
       
    }catch(err){
        console.error(err)
    }
     
})()


function getDirectionEntities(directionsRaw){

}
