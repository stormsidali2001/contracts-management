import { validateEmail } from "./email";
import { ValidatorFn } from "./models/validatorFn.interface";
import { validateUsername } from "./validateUsername";


export const validateEmailOrUsername:ValidatorFn = (text:string)=>{
    
    const isEmail =  validateEmail(text);
    const isUsername = validateUsername(text);

    return isEmail || !isEmail && isUsername;
}