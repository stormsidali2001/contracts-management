import { ValidatorFn } from "./models/validatorFn.interface";
// 1 charactere 7 numero 1 charactere
export const validateNrc:ValidatorFn = (text:string):boolean=>{
    const regex = /^\w+((\-?| ?)\w+)? [a-bA-B] (\d{9}|((\d{3} ){2}\d{3}))$/gm
    return  regex.test(text);
}