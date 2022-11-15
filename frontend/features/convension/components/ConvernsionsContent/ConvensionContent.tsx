import {Badge, Button, Modal} from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import styles from './ConvensionContent.module.css';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterIcon from '../../../../icons/FilterIcon';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import Link from 'next/link';
import ContractsFilter from '../../../contract/components/ContractsFilter/ContractsFilter';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CreateContract from '../../../contract/components/CreateContract/CreateContract';


const columns:GridColumns<any> = [
    {
        field:"number",
        headerName:"numero",
        width:150,
    },
    {
        field:"object",
        headerName:"objet",
        width:200
    },
    {
        field:"amount",
        headerName:"montant",
        width:100
    },
    {
        field:"expiration_date",
        headerName:"expiration",
        width:120
    },
    {
        field:"signature_date",
        headerName:"signature",
        width:120
    },
    {
        field:"status",
        headerName:"status",
        width:170
    },
    {
        field:"createdAt",
        headerName:"date de creation",
        width:170
    },
    {
        field:"actions",
        headerName:"Details",
        type:"actions",
        renderCell:(params)=>{

            return (
             <Button><Link href={`/convensions/${params.id}`}>Details</Link></Button>
            )
        }
    }
];
enum  AgreementStatus{
    executed = 'executed' ,
    executed_with_delay = 'executed_with_delay',
    in_execution = 'in_execution',
    in_execution_with_delay = 'in_execution_with_delay',
    not_executed = 'in_execution_with_delay'

}
interface Filters{
directionId?:string;
departementId?:string;
start_date?:string;
end_date?:string;
amount_min?:number;
amount_max?:number;
status?:AgreementStatus

}
const ConvensionsContent = () => {
  const [filterModalOpen,setFilterModalOPen] = useState(false)
  const handleCloseFilterModal = ()=>setFilterModalOPen(false)
  const handleOpenFilterModal = ()=>setFilterModalOPen(true)

  const [filters,setFilters] = useState<Filters | null>(null);
    const handleSetFilter = (filters:Filters)=>{
        setFilters(filters)
    }
    const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


    });
    const [queryOptions, setQueryOptions] = useState<{ sortModel:GridSortItem[] | null}>({sortModel:null});
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const {debounce} = useDebounce();
    const {user} = useAppSelector(state=>state.auth)
    const [searchQuery,setSearchQuery] = useState('');
    const axiosPrivate = useAxiosPrivate({});
    const handleSortModelChange = (sortModel: GridSortModel)=> {
        // Here you save the data you need from the sort model
        setQueryOptions({ sortModel: [...sortModel] });
      }
 
    useEffect( ()=>{
        let params = '';
        if(queryOptions.sortModel && queryOptions.sortModel.length >0){
            params+= '&orderBy='+queryOptions.sortModel[0].field
        }
        if(searchQuery.length > 0 ){
            params+= `&searchQuery=${searchQuery}`;
          }
          if(filters && Object.keys(filters).length > 0){
            Object.entries(filters).forEach(([key,value])=>{
                params +=`&${key}=${value}`
            })
           
        }
        setPageState((old:any)=>({...old,isLoading:true}))
            axiosPrivate.get(`http://localhost:8080/api/agreements?offset=${pageState.page}&limit=${pageState.pageSize}${params}&agreementType=convension`)
            .then((res:any)=>{
                const {data:d} = res;
                console.log(1,d)
                setPageState((old:any)=>({...old,data:d?.data,total:d?.total,isLoading:false}))
            })
            .catch(err=>{
                console.error(err);
            })
       
    },[pageState?.page,pageState?.pageSize,queryOptions.sortModel,filters,searchQuery])
    const handleSearch = (e:any)=>{
        const {value} = e.target;
        debounce(()=>setSearchQuery(value),1000)
      }

      const countFilters = ()=>{
        if(filters == null) return 0;
        let count = 0;
        Object.keys(filters).forEach(f=>{
           if(!['departementId','amount_min','start_date'].includes(f)){
               count++;
           }
        })
   
        return count;
    }
    const canCreateAgreement = ()=>{
        return user?.role === UserRole.JURIDICAL;
    }
    return (
        <div className={styles.container}>
            <div className={styles.wrapperBox}>
                <div className={styles.searchContainer}>
                    <Badge badgeContent={countFilters()}  sx={{padding:0}}  className={styles.searchBadge}>
                        <Button 
                                startIcon ={<FilterIcon/>}  
                                size='small' 
                                color='secondary' 
                                variant="contained" 
                                onClick={()=>handleOpenFilterModal()}
                                className={styles.advancedButton}>Avancée</Button>
                    </Badge>
                    
              
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
              { canCreateAgreement() &&( <Button onClick={handleOpen} className={styles.UserFormButton}>
                    <AddCircleIcon/>
                </Button>)}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
          >
            <CreateContract type="convension" handleClose={handleClose}/>
          </Modal>

          <Modal
            open={filterModalOpen}
            onClose={handleCloseFilterModal}
            aria-labelledby="modal-filter-modal-title"
            aria-describedby="modal-filter-modal-description"
           >
                <ContractsFilter initialFilters={filters ?? {} as Filters } handleClose={handleCloseFilterModal} handleSetFilters={handleSetFilter}/>
         </Modal>
    
    
    
         
        </div>
      )
}

export default ConvensionsContent