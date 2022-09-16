const axios = require("axios")
const faker = require("@faker-js/faker").faker;

function createRandomUser(directionId,departementId) {
    return {
      username: faker.internet.userName(),
      firstName:faker.name.firstName(),
      lastName:faker.name.lastName(),
      email: faker.internet.email(),
      departementId,
      directionId,
      password: '123456',
    };
  }
  faker.locale = 'fr';
 
async function generate(){
    const arr = [];
    for(let i=0;i<500;i++){
        const user = createRandomUser("a7f5efa3-a163-41cf-9607-3b613e8f1554","5d31c451-bd3d-47cf-b612-8d020eb452f0")
        console.log(user)
        arr.push(axios.post("http://localhost:8080/api/auth/register",{...user},{headers:{'Authorization':'application/json'}}))
    }
    try{

        await Promise.all(arr)
    }catch(err){
        console.error(err.message)    
    }
}
 
generate()