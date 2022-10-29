const axios = require("axios")
const faker = require("@faker-js/faker").faker;
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
faker.locale = 'fr';


function randomChar(){
    const randomCharCodeLowerCase = ()=>Math.floor(Math.random()*('Z'.charCodeAt(0) -'A'.charCodeAt(0)) +'A'.charCodeAt(0) );
    const randomChar = Math.random() > 0.5 ?String.fromCharCode(randomCharCodeLowerCase()):String.fromCharCode(randomCharCodeLowerCase()).toUpperCase();

    return randomChar;

}
function addMonth(d,months){
    const date = new Date(d)
    const day = date.getDate();
    date.setMonth(date.getMonth() + +months)
    if(day!== date.getDate()){
        date.setDate(0)
    }
    return date;
}
const format = (d)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}
function createRandomVendor() {
    const generateNif = ()=>{
        const nif = randomChar()+new Array(7).fill(0).map(()=>(Math.floor(Math.random()*9))).join('') +randomChar();

        return nif;
    }
    
    const date = addMonth(new Date(),-2);
    const afterOnMonthDate =new Date() ;
    console.log(`date between ${format(date.toISOString())} -----> ${format(afterOnMonthDate.toISOString())}`)
    const vendor = {
        nif:generateNif(),
        company_name:faker.company.name(),
        nrc:new Array(10).fill(0).map(()=>randomChar()).join(''),
        num:new Array(10).fill(0).map(()=>randomChar()).join(''),
        address:faker.address.country()+faker.address.state()+faker.address.city(),
        mobile_phone_number:faker.phone.number('06########'),
        home_phone_number:faker.phone.number('03########'),
         createdAt:format(faker.date.between(date.toISOString(), afterOnMonthDate.toISOString()))
        // createdAt:format(new Date())

    }

    return vendor;
}

async function generateVendors(num){
    const arr = [];
    for(let i=0;i<num;i++){
        const vendor = createRandomVendor()
        console.log(vendor)
        arr.push(axios.post("http://localhost:8080/api/vendors",{...vendor},{headers:{'Content-Type':'application/json'}}))
    }
    try{

        await Promise.all(arr)
    }catch(err){
        console.error(err.message);    
    }
}
console.log(process.argv[2])
generateVendors(process.argv.at(2) ?? 1)