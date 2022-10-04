const axios = require("axios")
const faker = require("@faker-js/faker").faker;
 
function randomChar(){
    const randomCharCodeLowerCase = ()=>Math.floor(Math.random()*('Z'.charCodeAt(0) -'A'.charCodeAt(0)) +'A'.charCodeAt(0) );
    const randomChar = Math.random() > 0.5 ?String.fromCharCode(randomCharCodeLowerCase()):String.fromCharCode(randomCharCodeLowerCase()).toUpperCase();

    return randomChar;

}
function addMonth(d,months){
    const day = d.getDate();
    d.setMonth(d.getMonth() + +months)
    if(day!== d.getDate()){
        d.setDate(0)
    }
    return d;
}
const format = (d)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}
function createVendor() {
    const generateNif = ()=>{
        const nif = randomChar()+new Array(7).fill(0).map(()=>(Math.floor(Math.random()*9))).join('') +randomChar();

        return nif;
    }
    
    const date = new Date();
    const afterOnMonthDate = addMonth(date,2);
    const vendor = {
        nif:generateNif(),
        company_name:faker.company.name(),
        nrc:new Array(10).fill(0).map(()=>randomChar()).join(''),
        num:new Array(10).fill(0).map(()=>randomChar()).join(''),
        address:faker.address.country()+faker.address.state()+faker.address.city(),
        mobile_phone_number:faker.phone.number('06########'),
        home_phone_number:faker.phone.number('03########'),
        createdAt:format(faker.date.between(date.toISOString(), afterOnMonthDate.toISOString()))

    }
}
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
 
async function generateUsers(){
    const arr = [];
    for(let i=0;i<500;i++){
        const user = createRandomUser("a7f5efa3-a163-41cf-9607-3b613e8f1554","5d31c451-bd3d-47cf-b612-8d020eb452f0")
        console.log(user)
        arr.push(axios.post("http://localhost:8080/api/auth/register",{...user},{headers:{'Authorization':'application/json'}}))
    }
    try{

        await Promise.all(arr)
    }catch(err){
        console.error(err.message);    
    }
}
 
generate()

async function generateDirections(){
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