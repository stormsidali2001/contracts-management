import styles from './vendorContent.module.css';
import {useEffect , useState} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button, Modal } from '@mui/material';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import AgreementList from '../AgreementList/AgreementList';
const VendorContent = () => {
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const [vendor,setVendor] = useState<any>(null)
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
  return (
    <div className={styles.container}>
       <div className={styles.left}>
            <div className={styles.vendorCard}>
              <div className={styles.labelWrapper}>
                <div className={styles.label}>N</div>
                <div className={styles.labelText}>{vendor?.num}</div>
              </div>
              <div className={styles.vendorTitle}>Fournisseur</div>
              <div className={styles.content}>
                <div className={styles.vendorContentItem}>
                  <span>raison sociale:</span>
                  <span>{vendor?.company_name}</span>
                </div>
                <div className={styles.vendorContentItem}>
                  <span>nif:</span>
                  <span>{vendor?.nif}</span>
                </div>
                <div className={styles.vendorContentItem}>
                  <span>nrc:</span>
                  <span>{vendor?.nrc}</span>
                </div>
                <div className={styles.vendorContentItem}>
                  <span>mobile:</span>
                  <span>{vendor?.mobile_phone_number}</span>
                </div>
                <div className={styles.vendorContentItem}>
                  <span>fixe:</span>
                  <span>{vendor?.home_phone_number}</span>
                </div>
                <div className={styles.vendorContentItem}>
                  <span>adresse:</span>
                  <span>{vendor?.address}</span>
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

export default VendorContent;