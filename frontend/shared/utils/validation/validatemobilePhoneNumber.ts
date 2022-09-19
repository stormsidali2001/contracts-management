import { ValidatorFn } from "./models/validatorFn.interface";

export const validateMobilePhoneNumber:ValidatorFn = (text:string):boolean=>{
    const regex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;
    return  regex.test(text);
}