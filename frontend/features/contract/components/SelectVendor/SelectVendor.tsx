import styles from './SelectVendor.module.css'
import {  Button, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, TextField, Typography ,Modal,Stack} from '@mui/material';
import FilterIcon from '../../../../icons/FilterIcon';
import {useState,useEffect} from 'react';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const columns:GridColumns<any> = [

    {
        field:"num",
        headerName:"numero",
        flex:1
    },
    {
        field:"company_name",
        headerName:"raison sociale",
        flex:1
    },
    {
        field:"nif",
        headerName:"nif",
        flex:1
    },
    {
        field:"address",
        headerName:"adresse",
        flex:1
    },
    {
        field:"mobile_phone_number",
        headerName:"mobile",
        flex:1
    },
    {
        field:"home_phone_number",
        headerName:"fixe",
        flex:1
    },
  ]
const SelectVendor = () => {
    const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


    });
    const [searchQuery,setSearchQuery] = useState('');
    const {debounce} = useDebounce();
    const [queryOptions, setQueryOptions] = useState<{ sortModel:GridSortItem[] | null}>({sortModel:null});
    const handleSearch = (e:any)=>{
        const {value} = e.target;
        debounce(()=>setSearchQuery(value),1000)
    }
    const handleSortModelChange = (sortModel: GridSortModel)=> {
        // Here you save the data you need from the sort model
        if(sortModel){
    
          setQueryOptions({ sortModel: [...sortModel] });
        }
      }
  return (
    <div className={styles.container}>
        <form>
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
                        onChange={handleSearch}
                       InputProps={{
    
                                    // startAdornment:obj
                                    
                                    
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
                    onSortModelChange={handleSortModelChange}
                    
                />
                </div>
             
            </div>

        </form>
    </div>
  )
}

export default SelectVendor