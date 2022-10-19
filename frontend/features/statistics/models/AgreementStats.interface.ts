export interface AgreementStatus{
    status:{
        executed:number;
        executed_with_delay:number;
        in_execution:number;
        in_execution_with_delay:number;
        not_executed:number;
    }
}