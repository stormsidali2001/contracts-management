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
function createRandomAgreement(directionId,departementId,vendorId) {
    const now = new Date();
    return {
        number:`${randomChar()}${randomChar()}${new Array(8).fill(0).map(()=>(Math.floor(Math.random()*9)))}`,
        type: Math.random() > 0.5 ? 'contract':'convension',
        amount:Math.floor(Math.random()*1000 + 200),
        signature_date:format(now),
        expiration_date: format(addMonth(now,2)),
        status:'not_executed',
        url:'2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
        object:"un champ reservee pour l'object",
        directionId,
        departementId,
        vendorId
    };
  }
 
 
async function generateAgreements(directions,vendorIds){
    if(directions.length === 0 ) return ;
    const arr = [];
    const randomElemenetFromArray = (arr)=>arr[Math.floor(Math.random()*(arr.length - 1))]
    for(let i=0;i<500;i++){
        const randomVendorId = randomElemenetFromArray(vendorIds)
        const randomDirection = randomElemenetFromArray(directions)
        if(randomDirection.departements.length ===0) continue;
        const randomDepartement = randomElemenetFromArray(randomDirection.departements);
        const agreement = createRandomAgreement(randomDirection.id,randomDepartement.id,randomVendorId)
        console.log(agreement)
        arr.push(axios.post("http://localhost:8080/api/Agreements",{...agreement},{headers:{'Content-Type':'application/json'}}))
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
            password:'12345678',
            Promise:bluebird
        });

        //i ignored the n+1 problem just because of the absence of an orm to ajust the entities
        const [directions] = await connection.execute(`select * from directions`,[])
        for(direction of directions ){
            const [departements] = await connection.execute("select * from departements  where directionId = ?",[direction.id])
            direction.departements = departements;
            
        }
        const [vendors] = await connection.execute('select id from vendors',[])
         generateAgreements(directions,vendors.map(el=>(el.id)))
       
    }catch(err){
        console.error(err)
    }
     
})()