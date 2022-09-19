import { ValidatorFn } from "./models/validatorFn.interface";

export const validateCompanyName:ValidatorFn = (text:string):boolean=>{
    const regex = /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9âêîôûàèù ]{2,25}$/g;
    return  regex.test(text);
}