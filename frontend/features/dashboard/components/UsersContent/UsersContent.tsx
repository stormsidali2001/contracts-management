import styles from './UserContent.module.css';
import {Button, FormControl, Input, InputLabel} from '@mui/material';
import FilterIcon from '../../../../icons/FilterIcon';
import TextField from '@mui/material/TextField';
import {SearchRounded } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';

const columns = [
    {
        field:"id",
        headerName:"id",
        width:78
    },
    {
        field:"firstName",
        headerName:"nom",
        width:78
    },
    {
        field:"lastName",
        headerName:"prenom",
        width:78
    },
    {
        field:"role",
        headerName:"role",
        width:100
    },
    {
        field:"email",
        headerName:"email",
        width:100
    },
]
const UsersContent = () => {
    const [pageState,setPageState] = useState({
        isLoading:false,
        data:[],
        total:0,
        page:1,
        pageSize:10,


    })
    const data = [
        {firstName:"assoul",lastName:"sidali",email:"assoulsidali@gmail.com"},
        {firstName:"assoul",lastName:"sidali",email:"assoulsidali@gmail.com"},
        {firstName:"assoul",lastName:"sidali",email:"assoulsidali@gmail.com"},
    ];
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
            <div>
            <DataGrid
                rows={pageState.data}
                rowCount={pageState.total}
                loading={pageState.isLoading}
                rowsPerPageOptions={[5]}
                pagination
                page={pageState.page}
                pageSize={pageState.pageSize}
                paginationMode="server"
                onPageChange={(newPage: number) => setPageState((old)=>({...old,page:newPage+1}))}
                onPageSizeChange={(newPageSize: number) => setPageState((old)=>({...old,pageSize:newPageSize}))}
                columns={columns}
            />
            </div>
            
        </div>
    </div>
  )
}

export default UsersContent