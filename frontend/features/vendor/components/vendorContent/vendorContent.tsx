import styles from './vendorContent.module.css';
import {useEffect , useState} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button, CircularProgress, Modal } from '@mui/material';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import AgreementList from '../AgreementList/AgreementList';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import { UserRole } from '../../../auth/models/user-role.enum';
const VendorContent = () => {
    const {user} = useAppSelector(state=>state.auth)
    const [editMode,setEditMode] = useState(false)
    const [loading,setLoading] = useState(false)
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const [vendor,setVendor] = useState<any>(null)
    const dispatch = useAppDispatch();
    const [contractModalOpen,setContractModalOpen] = useState(false);
    const handleContractModaOpen = ()=>setContractModalOpen(true)
    const handleContractModalClose = ()=>setContractModalOpen(false)
    const [modalType,setModalType] = useState<"contract" | "convension">("contract")
    const {query} = router;
    const {vendorId} = query;
    const handleShowContract = ()=>{
      setModalType("contract")
      handleContractModaOpen();
    }
    const handleShowConvension = ()=>{
      setModalType("convension")
      handleContractModaOpen();
    }
    useEffect(()=>{
      if(!vendorId) return;
      axiosPrivate.get(`http://localhost:8080/api/vendors/${vendorId}`)
      .then(res=>{
          console.log(res,"contract")
          setVendor(res.data)
      })
      .catch(err=>console.error(err))
    },[vendorId])
    if(!vendor) return "Loading"
    const setVendorProperty = (key:string,value:any)=>setVendor((u:Object)=>({...u,[key]:value}))
    const handleSubmit = ()=>{
      setLoading(true)
      axiosPrivate.patch(`/vendors/${vendor.id}`,{
        ...vendor
      })
      .then(res=>{
        setLoading(false)
        dispatch(showSnackbar({message:"le fournisseur a eté mis a jour",severty:"success"}))
      })
      .catch(err=>{
        setLoading(false)
        dispatch(showSnackbar({message:err.response.data.error ?? "erreur inconu"}))

      })
    }
    const showDisplayEdit = ()=>{
      return user?.role === UserRole.JURIDICAL;
  }
  return (
    <div className={styles.container}>
       <div className={styles.left}>
            <div className={styles.vendorCard}>
            {
              showDisplayEdit() &&<>
              {  editMode?(
                    <Button 
                    className={styles.editButton}
                    onClick={()=>handleSubmit()}
                    >
                        {
                            loading?(
                                <CircularProgress size={30}/>
                            ):(
                                <SaveIcon/>
                            )
                        }
                    </Button>
                ):(
                    <Button 
                        className={styles.editButton}
                        onClick={()=>setEditMode(true)}
                    >
                        <EditIcon/>
                    </Button>
                )}
              </>
            }
  
              <div className={styles.labelWrapper}>
                <div className={styles.label}>N</div>
                <div className={styles.labelText}>{vendor?.num}</div>
              </div>
              <div className={styles.vendorTitle}>Fournisseur</div>
              <div className={styles.content}>
                <div className={styles.vendorContentItem}>
                  <span>raison sociale:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.company_name ?? ""}
                    onChange={(e:any)=>setVendorProperty("company_name",e.target.value)}

                  />
                </div>
                <div className={styles.vendorContentItem}>
                  <span>nif:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.nif ?? ""}
                    onChange={(e:any)=>setVendorProperty("nif",e.target.value)}

                  />
                </div>
                <div className={styles.vendorContentItem}>
                  <span>nrc:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.nrc ?? ""}
                    onChange={(e:any)=>setVendorProperty("nrc",e.target.value)}

                  />
                </div>
                <div className={styles.vendorContentItem}>
                  <span>mobile:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.mobile_phone_number ?? ""}
                    onChange={(e:any)=>setVendorProperty("mobile_phone_number",e.target.value)}
                  />
                </div>
                <div className={styles.vendorContentItem}>
                  <span>fixe:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.home_phone_number ?? ""}
                    onChange={(e:any)=>setVendorProperty("home_phone_number",e.target.value)}

                  />
                </div>
                <div className={styles.vendorContentItem}>
                  <span>adresse:</span>
                  <Field
                    edit = {editMode}
                    value={vendor?.address ?? ""}
                    onChange={(e:any)=>setVendorProperty("address",e.target.value)}
                  />
                </div>
              </div>
            </div>
            
       </div>
       <div className={styles.right}>
            <div className={styles.littleCard}>
              <div className={styles.title}>Contrat</div>
              <div className={styles.counter}>{vendor?.contractCount}</div>
              <Button color="secondary" onClick={()=>handleShowContract()} className={styles.cardButton} variant="contained">voir</Button>
            </div>
            <div className={styles.littleCard}>
              <div className={styles.title}>Convension</div>
              <div className={styles.counter}>{vendor?.convensionCount}</div>
              <Button onClick={()=>handleShowConvension()} color="secondary" className={styles.cardButton}  variant="contained">voir</Button>
            </div>
       </div>


       <Modal
        open={contractModalOpen}
        onClose={handleContractModalClose}
       >
          <AgreementList vendorId={vendor?.id} type={modalType} handleClose={handleContractModalClose} />
       </Modal>
    </div>
  )
}

function Field({edit, value,onChange}:any){
  return (
      <>
      { edit?(
              <input type="text" className={styles.editInput} value={value} onChange={onChange} />
          ):(

              <span className={styles.vendorContentItem}>{value}</span>
          )}
      </>
  )
}

export default VendorContent;