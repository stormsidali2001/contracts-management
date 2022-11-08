import styles from './DeleteVendorAction.module.css'
import {Box,CircularProgress, Button} from '@mui/material';
import {useState} from 'react';
import Check from '@mui/icons-material/Check';
import { DeleteForever, Save } from '@mui/icons-material';
import { useAppDispatch } from '../../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../../ui/UiSlice';
import useAxiosPrivate from '../../../../../hooks/auth/useAxiosPrivate';
const DeleteVendorAction = ({params,deleteRow}:any) => {
    const [loading,setLoading] = useState(false);
    const [success,setSuccess] = useState(false);
    const disptach = useAppDispatch();
    const axiosPrivate = useAxiosPrivate();

    const handleSubmit =  ()=>{
        const {id} = params.row;
            setLoading(true)
          
            axiosPrivate.delete(`http://localhost:8080/api/vendors/${id}`)
            .then(res=>{
                setSuccess(true)
                setLoading(false)
                disptach(showSnackbar({message:"le vendor a eté supprimé avec success",severty:"success"}))
                deleteRow(id);
            })
            .catch(err=>{
                console.error(err);
                setSuccess(false)
                setLoading(false)
                disptach(showSnackbar({message:err?.response?.data?.error ?? "erreur inconnu",severty:"error"}))
            })
       
    }
   
  return (
    <Box  
        className={styles.container}
        sx={{
            m:1,
            position:'relative',
        }}
    >
        {
            success?(
              
                    <Check
                          color="secondary"
                          sx={{
                              width:25,
                              height:25,
                           
                          }}
                    />
             
            ):(
                <Button
                color="primary"
                sx={{
                    width:30,
                    height:30,
                    boxShadow:"none"
                }}
                onClick={()=>handleSubmit()}
                >
                    <DeleteForever
                        sx={{
                            boxShadow:"none",
                            width:"36px"
                        }}
                    />
            </Button>
            )

        }

        { 
              loading && (
                <CircularProgress
                    size={30}
                    sx={{
                        position:"absolute",
                        top:"0",
                        left:"15px",
                        transform:"translate(-50%,-50%)",
                        zIndex:1
                    }}
                />
            )
         }
    </Box>
  )
}

export default DeleteVendorAction