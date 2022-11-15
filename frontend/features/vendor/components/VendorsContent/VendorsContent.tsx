import {Button, Modal} from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TextField from '@mui/material/TextField';


import FilterIcon from '../../../../icons/FilterIcon';
import styles from './VendorsContent.module.css';
import axios from 'axios';
import CreateVendor from '../CreateVendor/CreateVendor';
import { Vendor } from '../../models/vendor.interface';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import VendorActions from '../../../dashboard/VendorActions/VendorActions';
import Link from 'next/link';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';
import DeleteVendorAction from '../../../dashboard/components/UserActions/DeleteVendorAction/DeleteVendorAction';


const VendorsContent = () => {
  const [pageState,setPageState] = useState<any>({
    isLoading:false,
    data:[],
    total:0,
    page:0,
    pageSize:5,


});
const [rowId,setRowId] = useState<any>(null)
const [searchQuery,setSearchQuery] = useState('')
const [queryOptions, setQueryOptions] = useState<{ sortModel:GridSortItem[] | null}>({sortModel:null});
const [open, setOpen] = useState(false);
const handleOpen = () => setOpen(true);
const handleClose = () => setOpen(false);
const {user} = useAppSelector(state=>state.auth);
const {debounce} = useDebounce();
function showDisplayAddVendor(){
  return Boolean(user?.role === UserRole.JURIDICAL);
}
const columns:GridColumns<any> = useMemo(()=>{
  const editable = showDisplayAddVendor();

const original:GridColumns<any> = [

  {
      field:"num",
      headerName:"numero",
      width:130,
      editable
  },
  {
      field:"company_name",
      headerName:"raison sociale",
      width:160,
      editable
  },
  {
      field:"nif",
      headerName:"nif",
      width:140,
      editable
  },
  {
      field:"address",
      headerName:"adresse",
      width:150,
      editable
  },
  {
      field:"mobile_phone_number",
      headerName:"mobile",
      width:130,
      editable
  },
  {
      field:"home_phone_number",
      headerName:"fixe",
      width:120,
      editable
  },
  {
    field:"details",
    headerName:"Details",
    type:"actions",
    renderCell:(params)=>{

        return (
        <Button><Link href={`/vendors/${params.id}`}>Details</Link></Button>
        )
    }
  }

]
const extra:GridColumns<any> = [...original,
      {
        field:"actions",
        headerName:"actions",
        type:"actions",
        renderCell:(params:any)=>{

            return (
              <VendorActions {...{params,rowId,setRowId}}/>
            )
        },
      
    },
    {
      field:"actions1",
      headerName:"suppression",
      type:"actions",
      renderCell:(params)=>{

          return (
              <DeleteVendorAction deleteRow={deleteRow} {...{params}}/>
          )
      }
  },


];

return editable ?extra :original;



},[showDisplayAddVendor(),rowId])
const handleSortModelChange = (sortModel: GridSortModel)=> {
    // Here you save the data you need from the sort model
    if(sortModel){

      setQueryOptions({ sortModel: [...sortModel] });
    }
  }

const privateAxiosPrivate = useAxiosPrivate();

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
    privateAxiosPrivate.get(`http://localhost:8080/api/vendors?offset=${pageState.page}&limit=${pageState.pageSize}${params}`)
        .then((res:any)=>{
            const {data:d} = res;
            console.log(1,d)
            setPageState((old:any)=>({...old,data:d?.data,total:d?.total,isLoading:false}))

        })
        .catch(err=>{
            console.error(err);
        })
   
},[pageState?.page,pageState?.pageSize,queryOptions.sortModel,searchQuery])
const handleSearch = (e:any)=>{
  const {value} = e.target;
  debounce(()=>setSearchQuery(value),1000)
}

function deleteRow(vendorId:string){
  const newPageState = {... pageState};
  if(!newPageState?.data) return;
  setPageState((old:any)=>({...old,data:old.data.filter((u:any)=>u.id !== vendorId)}))
}

  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>
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
                rowsPerPageOptions={[5]}
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
                experimentalFeatures={{ newEditingApi: true }}
                onCellEditStop={params=>{console.log(params,"...");setRowId(params.id)}}
                getRowId={(row)=>row.id}
                className={styles.dataGridStyle}
                
            />
            </div>

          { showDisplayAddVendor() && <Button onClick={handleOpen} className={styles.UserFormButton}>
                <PersonAddIcon/>
            </Button>}
        </div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
      >
        <CreateVendor handleClose={handleClose}/>
      </Modal>

     
    </div>
  )
}

export default VendorsContent