import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { unlinkSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
type ValidFileExtension = 'pdf';
type ValidMimeType = `application/${ValidFileExtension}`;
import {v4 as uuidv4} from 'uuid';
const   FileType  = require('file-type') ;

const validExtensions:ValidFileExtension[] = ['pdf'];
const validMimeTypes:ValidMimeType[] = ['application/pdf'];

export const agreementStorageConfig:MulterOptions = {
    storage:diskStorage({
        destination:"./upload/documents",
        filename:(req,file,cb)=>{
            const fileExtension:string = extname(file.originalname);
            const fileName:string = uuidv4() + fileExtension;
            cb(null,fileName)
        },
    }),
    fileFilter:(req,file,cb)=>{
        validMimeTypes.includes(file.mimetype as ValidMimeType)?cb(null,true):cb(null,false);
    }
}

export const isFileExtensionSafe = async (path):Promise<boolean>=>{
    const fileExtAndMimeType = await FileType.fromFile(path);

    if(!fileExtAndMimeType) return false;
    const {ext,mime} = fileExtAndMimeType;
    return validExtensions.includes(ext as ValidFileExtension) && validMimeTypes.includes(mime as ValidMimeType) ;
}

export const removeFile = (path):void=>{
    try{
        unlinkSync(path)
    }catch(err){
        console.error(err);
    }
}