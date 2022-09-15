import { ValidatorFn } from "./models/validatorFn.interface"

export const validateUsername:ValidatorFn = (text:string):boolean=>{
    const regex = /^[A-Za-z][A-Za-z0-9_]{3,29}$/g;
    return  regex.test(text)
}