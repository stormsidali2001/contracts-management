export interface CreateAgreement{
    number:string;
    object:string;
    amount:number;
    directionId:string;
    departementId:string;
    vendorId:string;
    url:string;
    signature_date:string;
    expiration_date:string;
    type:"contract"|"convension";


}