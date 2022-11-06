
const axios = require("axios")
const faker = require("@faker-js/faker").faker;
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
faker.locale = 'fr';

const DIRECTIONS = [
    {title:'direction generale',abriviation:"DRG"},
    {title:'direction de marketing',abriviation:'DMK'},
    {title:'direction de finance',abriviation:'DFN'},
    {title:"direction de production",abriviation:'DPR'}
]
async function generateDirections(){
    const arr = [];
    for(let direction of DIRECTIONS){
        direction.departements = new Array(Math.floor(Math.random()*(5-1) + 1)).fill(0).map((_,index)=>({title:`departement ${index+1}`,abriviation:`DP${index+1}`}))
        console.log(direction)
        arr.push(axios.post("http://localhost:8080/api/directions/test",{...direction},{headers:{'Content-Type':'application/json'}}))
    }
    try{

        await Promise.all(arr)
    }catch(err){
        console.error(err.message)    
    }
}

generateDirections()