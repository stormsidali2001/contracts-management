import axios from 'axios';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import styles from './ContractContent.module.css'
import {Button, Modal} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import ExecutionModal from '../ExecutionModal/ExecutionModal';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';


interface PropType{
  type:"contract" | "convension";
  agreementId:string | undefined;
}
const ContractContent = ({type , agreementId}:PropType) => {

  const {user} = useAppSelector(state=>state.auth)
  const axiosPrivate = useAxiosPrivate({});
 
  const [contract,setContract] = useState<any>(null);
  const [openExecutionModal,setOpenExecutionModal] = useState(false)
  
  const handelOpenExecutionModal = ()=>setOpenExecutionModal(true)
  const handelCloseExecutionModal = ()=>setOpenExecutionModal(false)
  useEffect(()=>{
    if(!agreementId) return;
    axiosPrivate.get(`http://localhost:8080/api/Agreements/${agreementId}?agreementType=${type}`)
    .then(res=>{
        console.log(res,"contract")
        setContract(res.data)
    })
    .catch(err=>console.error(err))
  },[agreementId])
  if(!contract) return <div className={styles.container}>Loading</div>
  const getStatus = (str:string)=>{
  
   switch (str) {
    case "not_executed":
      return "non executé"
      
    case "in_execution_with_delay":
      return "en execution avec retard"
    case "in_execution":
      return "en execution"

    case "executed_with_delay":
      return "executé avec retard"

    case "executed":
      return "executé"
    default:
      return "";
   }
  }

  const canExecuteContract = ()=>{
    return user?.role === UserRole.JURIDICAL;
  }
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>

           <div className={styles.labelWrapper}>
              <div className={styles.label}>N</div>
              <div className={styles.labelText}>{contract?.number}</div>
           </div>

           <div className={styles.title}>{type === "contract"?"Contrat":"Convension"}</div>
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
          { canExecuteContract() &&(<Button
              className={styles.executionButton}
              disabled = {!(contract.status === 'not_executed')}
              onClick={()=>handelOpenExecutionModal()}
            >
                  <PlayCircleFilledWhiteIcon/>
            </Button>)
           }
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
                <div className={styles.date}>{contract?.execution_start_date ?? "xxxx-xx-xx"}</div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Fin</div>
                <div className={styles.date}>{contract?.execution_end_date ?? "xxxx-xx-xx"}</div>
              </div>
            </div>
           
        </div>
        <Modal
          open={openExecutionModal}
          onClose={handelCloseExecutionModal}
        >
               <ExecutionModal type={type} handleClose={handelCloseExecutionModal} agreementId = {contract.id}/>
        </Modal>

        
    
    </div>
  )
}

export default ContractContent