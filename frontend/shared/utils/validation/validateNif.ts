import { ValidatorFn } from "./models/validatorFn.interface";
// 1 charactere 7 numero 1 charactere
export const validateNif:ValidatorFn = (text:string):boolean=>{
    const regex = /^(([a-z]|[A-Z]|[0-9])[0-9]{7}([a-z]|[A-Z]|[0-9]))$/
    return  regex.test(text);
}