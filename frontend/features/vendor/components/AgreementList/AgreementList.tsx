import { Button, TextField } from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useDebounce } from '../../../../hooks/useDebounce.hook';
import styles from './AgreementList.module.css'

interface PropType{
    handleClose:()=>void,
    type:'contract' | 'convension',
    vendorId:string
}
const AgreementList = ({handleClose,type = 'contract',vendorId}:PropType) => {
    const columns:GridColumns<any> = [
        // {
        //     field:"id",
        //     headerName:"id",
        //     flex:1,
            
        // },
        {
            field:"number",
            headerName:"numero",
            width:200
        },
        {
            field:"object",
            headerName:"objet",
            width:200
        },
        {
            field:"amount",
            headerName:"montant",
            width:200
        },
        {
            field:"expiration_date",
            headerName:"expiration",
            width:200
        },
        {
            field:"signature_date",
            headerName:"signature",
            width:200
        },
        {
            field:"status",
            headerName:"status",
            width:200
        },
        {
            field:"createdAt",
            headerName:"date de creation",
            width:200
        },
        {
            field:"actions",
            headerName:"Details",
            type:"actions",
            renderCell:(params)=>{
    
                return (
                 <Button><Link href={`/${type}s/${params.id}`}>Details</Link></Button>
                )
            }
        }
    ];
 const  {debounce} = useDebounce();
 const [pageState,setPageState] = useState<any>({
        isLoading:false,
        data:[],
        total:0,
        page:0,
        pageSize:5,


  });
  
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
        axiosPrivate.get(`http://localhost:8080/api/agreements?offset=${pageState.page}&limit=${pageState.pageSize}${params}&agreementType=${type}&vendorId=${vendorId}`)
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
  return (
    <div className={styles.container}>
         <span className={styles.title}>{type}</span>
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

export default AgreementList