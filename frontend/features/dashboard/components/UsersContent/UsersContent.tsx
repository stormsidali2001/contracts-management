import styles from './UserContent.module.css';
import {Button, FormControl, Input, InputLabel} from '@mui/material';
import FilterIcon from '../../../../icons/FilterIcon';
import TextField from '@mui/material/TextField';
import {SearchRounded } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PaginationResponse } from '../../models/paginationResponse.interface';
import { DisplayUser } from '../../../auth/models/DisplayUser.interface';

const columns:GridColumns<any> = [
    {
        field:"id",
        headerName:"id",
        flex:1,
        
    },
    {
        field:"firstName",
        headerName:"nom",
        flex:1
    },
    {
        field:"lastName",
        headerName:"prenom",
        flex:1
    },
    {
        field:"role",
        headerName:"role",
        flex:1
    },
    {
        field:"email",
        headerName:"email",
        flex:1
    },
]
const UsersContent = () => {
    const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


    })
 
    useEffect( ()=>{
        
        setPageState((old:any)=>({...old,isLoading:true}))
             axios.get(`http://localhost:8080/api/users?offset=${pageState.page}&limit=${pageState.pageSize}`)
            .then((res:any)=>{
                const {data:d} = res;
                console.log(1,d)
                setPageState((old:any)=>({...old,data:d?.data,total:d?.total,isLoading:false}))
            })
            .catch(err=>{
                console.error(err);
            })
       
    },[pageState?.page,pageState?.pageSize])
    const obj = <InputAdornment position="start">
    <SearchRounded />
    </InputAdornment>;
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>
            <div className={styles.searchContainer}>
                <Button 
                    startIcon ={<FilterIcon/>}  
                    size='small' 
                    color='secondary' 
                    variant="contained" 
                    className={styles.advancedButton}>Avancée</Button>
              
          
                <TextField 
                    placeholder='mot clé...' color='secondary' 
                    size='small' 
                    fullWidth type='search' 
                    
                   InputProps={{

                                startAdornment:obj
                                
                                ,
                                className: styles.input,

                                }}
                />
                
            </div>
            <div className={styles.tableContainer}>
            <DataGrid
                autoHeight
                rows={pageState.data}
                rowCount={pageState.total}
                loading={pageState.isLoading}
                rowsPerPageOptions={[5,10,20]}
                pagination
                page={pageState.page}
                pageSize={pageState.pageSize}
                paginationMode="server"
                onPageChange={(newPage: number) => setPageState((old:any)=>({...old,page:newPage}))}
                onPageSizeChange={(newPageSize: number) => setPageState((old:any)=>({...old,pageSize:newPageSize}))}
                columns={columns}
                disableColumnFilter
                disableColumnMenu 
                
            />
            </div>
            
        </div>
    </div>
  )
}

export default UsersContent