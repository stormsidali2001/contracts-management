import styles from './vendorContent.module.css';
import {useEffect , useState} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
const VendorContent = () => {
    const router = useRouter();
    const [vendor,setVendor] = useState<any>(null)
    const {query} = router;
    const {vendorId} = query;
    
    useEffect(()=>{
      if(!vendorId) return;
      axios.get(`http://localhost:8080/api/vendors/${vendorId}`)
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
            <div className={styles.vendorCard}></div>
       </div>
       <div className={styles.right}>
            <div className={styles.littleCard}></div>
            <div className={styles.littleCard}></div>
       </div>
    </div>
  )
}

export default VendorContent;