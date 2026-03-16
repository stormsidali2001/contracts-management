import {useState} from 'react';
interface Debounce {
   
    debounce:(fn:()=>void,delay?:number)=>void
}
export const useDebounce = ():Debounce=>{
    const [timeoutId,setTimeOutId] = useState<NodeJS.Timeout | string>('')

    function debounce(fn:()=>void,delay:number = 1000):void{
        clearTimeout(timeoutId);
        const id = setTimeout(()=>fn(),delay);
        setTimeOutId(id);
    }

    return {debounce};
}