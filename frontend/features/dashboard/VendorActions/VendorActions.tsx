import styles from './VendorActions.module.css';
import {Box,CircularProgress, Button} from '@mui/material';
import {useState} from 'react';
import Check from '@mui/icons-material/Check';
import { Save } from '@mui/icons-material';
import axios from 'axios';
import {useEffect} from 'react';
const VendorActions = ({params,rowId,setRowId}:any) => {
    const [loading,setLoading] = useState(false);
    const [success,setSuccess] = useState(false);

    const handleSubmit = async ()=>{
        const {id,...others} = params.row;
            setLoading(true)
            axios.put(`http://localhost:8080/api/vendors/${id}`,{
                ...others
            })
            .then(res=>{
                setSuccess(true)
                setRowId(null)
                setLoading(false)
            })
            .catch(err=>{
                console.error(err);
                setLoading(false)
            })
       
    }
    useEffect(()=>{
        if(params.id === rowId && success){
            setSuccess(false)
        }
    },[rowId])
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
                disabled={params.id !== rowId || loading}
                onClick={handleSubmit}
                >
                    <Save
                        sx={{
                            boxShadow:"none"
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

export default VendorActions