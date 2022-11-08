import styles from './SelectVendor.module.css'
import {  Button, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, TextField, Typography ,Modal,Stack} from '@mui/material';
import {useState,useEffect} from 'react';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import axios from 'axios';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';

const columns:GridColumns<any> = [

    {
        field:"num",
        headerName:"numero",
        width:150
    },
    {
        field:"company_name",
        headerName:"raison sociale",
        width:125
    },
    {
        field:"nif",
        headerName:"nif",
        width:150
    },
    {
        field:"address",
        headerName:"adresse",
        width:150
    },
    {
        field:"mobile_phone_number",
        headerName:"mobile",
        width:130
    },
    {
        field:"home_phone_number",
        headerName:"fixe",
        width:130
    },
  ]

interface PropType{
    handleClose:()=>void;
    selectVendor:(vendor:any)=>void
}
const SelectVendor = ({handleClose,selectVendor}:PropType) => {
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
    const [selectedVendor,setSelectedVendor] = useState<any>(null)
    const axiosPrivate = useAxiosPrivate();
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
    useEffect( ()=>{
    let params = '';
    if(queryOptions.sortModel){
      console.log(queryOptions,"code530")
        params+= '&orderBy='+queryOptions.sortModel[0]?.field
    }
    if(searchQuery.length > 0 ){
      params+= `&searchQuery=${searchQuery}`;
    }
    setPageState((old:any)=>({...old,isLoading:true}))
      axiosPrivate.get(`http://localhost:8080/api/vendors?offset=${pageState.page}&limit=${pageState.pageSize}${params}`)
        .then((res:any)=>{
            const {data:d} = res;
            console.log(1,d)
            setPageState((old:any)=>({...old,data:d?.data,total:d?.total,isLoading:false}))

        })
        .catch(err=>{
            console.error(err);
        })
   
},[pageState?.page,pageState?.pageSize,queryOptions.sortModel,searchQuery]);
  const handleConfirm = (e:any)=>{
    e.preventDefault();
    selectVendor(selectedVendor)
    handleClose()
    
  }
  return (
    <div className={styles.container}>
        
                <Typography  sx={{margin:"-5px 0 10px 0",fontSize:"14px",color:"#807D7D"}}>Selectioner un fournisseur</Typography>
                <div className={styles.searchContainer}>
                 
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
                    onSelectionModelChange={itm =>{ 
                        const id = itm[0];
                        const row = pageState.data.find((row:any)=>row.id === id)
                        setSelectedVendor(row)
                        console.log(itm,row,"selection")
                    }}
                    
                />
                </div>
             
     <Stack direction="row" justifyContent="center" gap={3} className={styles.actionButtons}>
        <Button onClick={()=>handleClose()}>Fermer</Button>
        <Button disabled={selectedVendor==null} onClick={handleConfirm}>Confirmer</Button>
      </Stack>

    </div>
  )
}

export default SelectVendor