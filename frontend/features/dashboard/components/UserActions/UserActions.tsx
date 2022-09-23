import styles from './UserActions.module.css'
import {Box,Fab,CircularProgress} from '@mui/material';
import {useState} from 'react';
import Check from '@mui/icons-material/Check';
import { Save } from '@mui/icons-material';
import axios from 'axios';
const UserActions = ({params,rowId,setRowId}:any) => {
    const [loading,setLoading] = useState(false);
    const [success,setSuccess] = useState(false);

    const handleSubmit = async ()=>{
        const {id,role,active} = params.row;
            axios.put("http://localhost:8080/api/users",{
                    
            })
            .then(res=>{
                setSuccess(true)
                setRowId(null)
            })
            .catch(err=>{
                console.error(err);
                setLoading(false)
            })
       
    }
  return (
    <Box  
        className={styles.container}
        sx={{
            m:1,
            position:'relative'
        }}
    >
        {
            success?(
                <Fab
                color="secondary"
                sx={{
                    width:25,
                    height:25,
                 
                }}
                >
                    <Check/>
                </Fab>
            ):(
                <Fab
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
            </Fab>
            )

        }

        { 
              loading && (
                <CircularProgress
                    size={45}
                    sx={{
                        position:"absolute",
                        top:-5,
                        left:-6,
                        zIndex:1
                    }}
                />
            )
         }
    </Box>
  )
}

export default UserActions