import axios from 'axios';
import { useRouter } from 'next/router'
import { useEffect } from 'react';
import styles from './ContractContent.module.css'

const ContractContent = () => {
  const router = useRouter()
  const {query} = router;
  const {contractId} = query;
  
  useEffect(()=>{
    if(!contractId) return;
  },[contractId])
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>
            <div>Contrat</div>
            <div className={styles.items}>
                <div className={styles.item}>
                    <span>Object</span>
                    <span>sajasfjsafjlsakfjfasjsakflajskfkj</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ContractContent