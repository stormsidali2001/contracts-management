import styles from './vendorContent.module.css';
import {useEffect , useState} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button } from '@mui/material';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
const VendorContent = () => {
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const [vendor,setVendor] = useState<any>(null)
    const {query} = router;
    const {vendorId} = query;
    
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
              <Button color="secondary" className={styles.cardButton} variant="contained">voir</Button>
            </div>
            <div className={styles.littleCard}>
              <div className={styles.title}>Convension</div>
              <div className={styles.counter}>{vendor?.convensionCount}</div>
              <Button color="secondary" className={styles.cardButton}  variant="contained">voir</Button>
            </div>
       </div>
    </div>
  )
}

export default VendorContent;