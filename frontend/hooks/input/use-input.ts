import { ChangeEvent, useReducer } from "react";
import { Action } from "../../shared/models/action.interface";
import { ValidatorFn } from "../../shared/utils/validation/models/validatorFn.interface";
import { InputActionType, INPUT_ACTION_BLUR, INPUT_ACTION_CHANGE, INPUT_ACTION_CLEAR } from "./models/input-action-type";
import { InputState } from "./models/input-state.interface";

export const initialInputState:InputState = {
    text:'',
    hasBeenTouched:false
}

export const inputReducer = (state:InputState,action:Action<InputActionType>):InputState=>{
        const {type , value = ''} = action;
        switch (type) {
            case INPUT_ACTION_CHANGE:
                return {...state,text:value }
        
            case INPUT_ACTION_BLUR:
                return {...state,hasBeenTouched:true}
            case INPUT_ACTION_CLEAR:
                return {text:"",hasBeenTouched:false}
            default:
                return {...state};
        }
}

const useInput = (validatorFn?:ValidatorFn)=>{
    const [{text , hasBeenTouched},dispatch] = useReducer(inputReducer,initialInputState);
    let shouldDisplayError;
    if(validatorFn){
        const isValid = validatorFn(text);
        shouldDisplayError = !isValid && hasBeenTouched; 
    }
    const textChangeHandler = (e:ChangeEvent<HTMLInputElement>)=>{
        dispatch({
            type:INPUT_ACTION_CHANGE,
            value:e.target.value
        })
    }
    const inputBlurHandler = ()=>{
        dispatch({type:INPUT_ACTION_BLUR,})
    }

    const inputClearHandler = ()=>{
        dispatch({type:INPUT_ACTION_CLEAR});
    }

    return {text , hasBeenTouched , textChangeHandler , inputBlurHandler,inputClearHandler , shouldDisplayError};

}

export default useInput;