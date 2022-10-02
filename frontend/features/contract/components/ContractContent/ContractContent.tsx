import axios from 'axios';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import styles from './ContractContent.module.css'
import {Button, Modal} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import ExecutionModal from '../ExecutionModal/ExecutionModal';

const ContractContent = () => {

  const axiosPrivate = useAxiosPrivate();
  const router = useRouter();
  const [contract,setContract] = useState<any>(null);
  const [openExecutionModal,setOpenExecutionModal] = useState(false)
  const {query} = router;
  const {contractId} = query;
  
  const handelOpenExecutionModal = ()=>setOpenExecutionModal(true)
  const handelCloseExecutionModal = ()=>setOpenExecutionModal(false)
  useEffect(()=>{
    if(!contractId) return;
    axiosPrivate.get(`http://localhost:8080/api/Agreements/${contractId}`)
    .then(res=>{
        console.log(res,"contract")
        setContract(res.data)
    })
    .catch(err=>console.error(err))
  },[contractId])
  if(!contract) return "Loading"
  const getStatus = (str:string)=>{
   switch (str) {
    case "not executed":
      return "non executee"
    case "executed":
      return "executee"
    case "executed_with_delay":
      return "executee avec retard"
    default:
      return "";
   }
  }
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>

           <div className={styles.labelWrapper}>
              <div className={styles.label}>N</div>
              <div className={styles.labelText}>{contract?.number}</div>
           </div>

           <div className={styles.title}>Contract</div>
            <div className={styles.contractHeader}>
                <div className={styles.bmtContainer}>
                    <div className={styles.bmtItem}>
                        <span className={styles.bmtText}>{contract?.departement?.abriviation}</span>
                        <span className={styles.bmtLabel}>dp</span>
                    </div>

                    <div className={styles.bmtTitle}>BMT</div>

                    <div className={styles.bmtItem}>
                        <span className={styles.bmtLabel}>dr</span>
                        <span className={styles.bmtText}>{contract?.direction?.abriviation}</span>
                    </div>
                </div>
                <div className={styles.et}>et</div>
                <div className={styles.companyName}>{contract?.vendor.company_name}</div>
            </div>
            <div className={styles.objectContainer}>
              <div className={styles.objectLabel}>Objet:</div>
              <p className={styles.objectContent}>{contract?.object}</p>
            </div>

            <div className={styles.bottomContainer}>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Signature</div>
                <div className={styles.date}>{contract?.signature_date}</div>
              </div>
              <Button variant="outlined" >
                {
                  contract?.url?(
                    <a target="_blank" href={`http://localhost:8080/api/agreements/files/${contract?.url}`}>document</a>
                  ):(
                    <span>aucun document</span>
                  )
                }
                </Button>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Expiration</div>
                <div className={styles.date}>{contract?.expiration_date}</div>
              </div>
            </div>
           
        </div>


        <div className={styles.wrapperBox}>
           <Button
            className={styles.executionButton}
            disabled = {!(contract.status === 'not executed')}
            onClick={()=>handelOpenExecutionModal()}
           >
                <PlayCircleFilledWhiteIcon/>
           </Button>
           <div className={styles.labelWrapper}>
              <div className={styles.label}>N</div>
              <div className={styles.labelText}>{contract?.number}</div>
           </div>

           <div className={styles.title}>Execution</div>
           <div className={styles.executionBodyContainer}>

           
                <div className={styles.statusContainer}>
                  <div className={styles.statusLabel}>Etat</div>
                  <div className={styles.statusText}>{getStatus(contract?.status)}</div>
                </div>
                <div className={styles.observationContainer}>
                  <div className={styles.observationTitle}>Observation:</div>
                  <textarea readOnly={true} className={styles.observationTextArea} value={contract?.observation}/>
                </div>
            </div>

            <div className={styles.bottomContainer}>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Debut</div>
                <div className={styles.date}>{contract?.signature_date}</div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Fin</div>
                <div className={styles.date}>{contract?.expiration_date}</div>
              </div>
            </div>
           
        </div>
        <Modal
          open={openExecutionModal}
          onClose={handelCloseExecutionModal}
        >
               <ExecutionModal handleClose={handelCloseExecutionModal} agreementId = {contract.id}/>
        </Modal>
    </div>
  )
}

export default ContractContent