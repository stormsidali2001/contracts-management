import { ValidatorFn } from "./models/validatorFn.interface";

export const validateHomePhoneNumber:ValidatorFn = (text:string):boolean=>{
    const regex = /^(00213|\+213|0)([0-489])[0-9]{8}$/;
    return  regex.test(text);
}