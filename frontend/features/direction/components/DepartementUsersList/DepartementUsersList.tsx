import { Avatar, Button, TextField } from '@mui/material';
import { DataGrid, GridColumns, GridRenderCellParams, GridSortItem, GridSortModel } from '@mui/x-data-grid'
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import styles from './DepartementUsersList.module.css'

interface PropType{
    handleClose:()=>void,
    departementId:string
}
const DepartementUsersList = ({handleClose,departementId}:PropType) => {
 const  {debounce} = useDebounce();
 const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


  });
    const [rowId,setRowId] = useState<any>(null)
    const axiosPrivate = useAxiosPrivate();
    const [searchQuery,setSearchQuery] = useState('');
    const [queryOptions, setQueryOptions] = useState<{ sortModel:GridSortItem[] | null}>({sortModel:null});
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
      
        setPageState((old:any)=>({...old,isLoading:true}))
        axiosPrivate.get(`http://localhost:8080/api/users?offset=${pageState.page}&limit=${pageState.pageSize}${params}&departementId=${departementId}`)
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
const columns:GridColumns<any> = useMemo(()=>(
    [
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
            editable:true,
        },
        {
            field:"lastName",
            headerName:"prenom",
            width:100,
            editable:true,
        },
        {
            field:"role",
            headerName:"role",
            width:100,
            valueOptions:['ADMIN','JURIDICAL','EMPLOYEE'],
            type: "singleSelect",
            editable:true,
    
        },
        {
            field:"email",
            headerName:"email",
            width:200,
            editable:true
        },
        {
            field:"active",
            type:"boolean",
            editable:true
        },
        {
            field:"created_at",
            headerName:"cree a",
            editable:true,
            width:200
        },
        {
            field:"username",
            headerName:"nom d'utilisateur",
            editable:true,
            width:200
        },
        // {
        //     field:"actions",
        //     headerName:"actions",
        //     type:"actions",
        //     renderCell:(params)=>{
    
        //         return (
        //           <UserActions {...{params,rowId,setRowId}}/>
        //         )
        //     }
        // },
        // {
        //     field:"details",
        //     headerName:"Details",
        //     type:"actions",
        //     renderCell:(params)=>{
          
        //         return (
        //          <Button><Link href={`/users/${params.id}`}>Details</Link></Button>
        //         )
        //     }
        // }
    ]
),[rowId])
  return (
    <div className={styles.container}>
         <span className={styles.title}>utilisateur Departement</span>
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
                    
                />
                </div>
              
    </div>
  )
}

export default DepartementUsersList