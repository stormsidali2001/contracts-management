import { LengthOptions } from "./models/options/length";
import { ValidatorFn } from "./models/validatorFn.interface";

const _validateLength:ValidatorFn = (text:string , options?:LengthOptions):boolean =>{
    const textLength = text.trim().length;
    if(options?.min && textLength < options?.min) return false;
    if(options?.max && textLength > options?.max) return false;
    return true;
};

export const validatePasswordLength:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:6 , max:25})
}
export const validateUsernameLength:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:2 })
}

export const validateDepartementTitleLength:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:5,max:25 })
}

export const validateDepartementAbriviationLength:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:2 ,max:5 })
}

export const validateFirstName:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:3 })
}
export const validateLastName:ValidatorFn = (text:string):boolean=>{
    return _validateLength(text,{ min:3 })
}