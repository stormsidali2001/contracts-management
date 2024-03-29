import styles from './UserContent.module.css';
import {Avatar, Badge, Button, Modal} from '@mui/material';
import FilterIcon from '../../../../icons/FilterIcon';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColumns, GridRenderCellParams, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { useEffect, useState ,useMemo} from 'react';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CreateUser from '../CreateUser/CreateUser';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import UserActions from '../UserActions/UserActions';
import Link from 'next/link';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import UsersFilter from '../UsersFilter/UsersFilter';
import { UserRole } from '../../../auth/models/user-role.enum';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import DeleteUserAction from '../UserActions/DeleteUserAction/DeleteUserAction';
import { Stack } from '@mui/system';


const UsersContent = () => {
    const [filterModalOpen,setFilterModalOPen] = useState(false)
    const axiosPrivate = useAxiosPrivate({});
    const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


    });
    interface Filters{
        directionId?:string;
        departementId?:string;
        active?:"active"| "not_active";
        role?:UserRole;
    }
    const {user} = useAppSelector(state=>state.auth)
    const [filters,setFilters] = useState<Filters | null>(null);
    const handleSetFilter = (filters:Filters)=>{
        setFilters(filters)
    }
    const [rowId,setRowId] = useState<any>(null)
    const [searchQuery,setSearchQuery] = useState('');
    const {debounce} = useDebounce();
    const [queryOptions, setQueryOptions] = useState<{ sortModel:GridSortItem[] | null}>({sortModel:null});
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleSortModelChange = (sortModel: GridSortModel)=> {
        if(sortModel){
            
            setQueryOptions({ sortModel: [...sortModel] });
        }
      }
    const handleOpenFilterModal = ()=>setFilterModalOPen(true)
    const handleCloseFilterModal = ()=>setFilterModalOPen(false)
      const columns:GridColumns<any> = useMemo(()=>{
        const editable = shouldDisplayAddUser()
        const original:GridColumns<any> = [
            {
                field:"imageUrl",
                headerName:"photo",
                renderCell: (params: GridRenderCellParams<Date>) => (
                   <Avatar  src={params.row.imageUrl?`http://localhost:8080/api/users/image/${params.row.imageUrl}`:"blank-profile-picture.png"}/>
                  ),
                align:"left",
                sortable:false,
                width:60
            },
            
            {
                field:"firstName",
                headerName:"nom",
                width:100,
                editable:editable,
            },
            {
                field:"lastName",
                headerName:"prenom",
                width:100,
                editable:editable,
            },
            {
                field:"role",
                headerName:"role",
                width:100,
                valueOptions:['ADMIN','JURIDICAL','EMPLOYEE'],
                type: "singleSelect",
                editable:editable,
        
            },
            {
                field:"email",
                headerName:"email",
                width:200,
                editable
            },
            {
                field:"active",
                type:"boolean",
                editable
            },
            {
                field:"created_at",
                headerName:"cree a",
                editable,
                width:200
            },
            {
                field:"username",
                headerName:"nom d'utilisateur",
                editable,
                width:200
            },
            {
                field:"details",
                headerName:"Details",
                type:"actions",
                renderCell:(params:any)=>{
              
                    return (
                     <Button><Link href={`/users/${params.id}`}>Details</Link></Button>
                    )
                }
            }

           
        
        ]

        const extra:GridColumns<any> = [...original,
           
            {
                field:"actions",
                headerName:"mise a jour",
                type:"actions",
                renderCell:(params:any)=>{
        
                    return (

                            <UserActions {...{params,rowId,setRowId}}/>
                    )
                }
            },
            {
                field:"actions1",
                headerName:"suppression",
                type:"actions",
                renderCell:(params)=>{
        
                    return (
                        <DeleteUserAction deleteRow={deleteRow} {...{params}}/>
                    )
                }
            },
           
    
    ]

    return shouldDisplayAddUser() ? extra :original
        
   },[rowId,shouldDisplayAddUser()])
    useEffect( ()=>{
        let params = '';
        if(queryOptions.sortModel && queryOptions.sortModel.length > 0){
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
            axiosPrivate.get(`http://localhost:8080/api/users?offset=${pageState.page}&limit=${pageState.pageSize}${params}`)
            .then((res:any)=>{
                const {data:d} = res;
                console.log(1,d)
                setPageState((old:any)=>({...old,data:d?.data,total:d?.total,isLoading:false}))
            })
            .catch(err=>{
                console.error(err);
            })
       
    },[pageState?.page,pageState?.pageSize,queryOptions.sortModel,searchQuery,filters])
    // const obj = <InputAdornment position="start">
    // <SearchRounded />
    // </InputAdornment>;

    function deleteRow(userId:string){
        const newPageState = {... pageState};
        if(!newPageState?.data) return;
        setPageState((old:any)=>({...old,data:old.data.filter((u:any)=>u.id !== userId)}))
    }

 const handleSearch = (e:any)=>{
        const {value} = e.target;
        debounce(()=>setSearchQuery(value),1000)
    }

 const countFilters = ()=>{
     if(filters == null) return 0;
     let count = 0;
    Object.keys(filters).forEach(f=>{
        if(f !== 'departementId'){
            count++;
        }
     })

     return count;
 }
 function shouldDisplayAddUser(){
    return user?.role === UserRole.ADMIN
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

            />
            </div>
            {shouldDisplayAddUser() &&<Button onClick={handleOpen} className={styles.UserFormButton}>
                <PersonAddIcon/>
            </Button>}
        </div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
      >
        <CreateUser handleClose={handleClose}/>
      </Modal>


      <Modal
        open={filterModalOpen}
        onClose={handleCloseFilterModal}
        aria-labelledby="modal-filter-modal-title"
        aria-describedby="modal-filter-modal-description"
      >
        <UsersFilter initialFilters={filters ?? {} as Filters } handleClose={()=>setFilterModalOPen(false)} handleSetFilters={handleSetFilter}/>
      </Modal>

     
    </div>
  )
}

export default UsersContent