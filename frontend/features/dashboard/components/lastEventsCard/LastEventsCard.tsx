import moment   from 'moment'
import 'moment-locale-fr'
moment.locale("fr")
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks'
import { Entity } from '../../../notification/models/Entity.enum'
import { Operation } from '../../../notification/models/Operation.enum'
import styles from './LastEventsCard.module.css'


const getTextFromOperation = (operation:Operation)=>{
  switch(operation){
    case Operation.INSERT: return "creation"
    case Operation.DELETE: return "suppression";
    case Operation.UPDATE: return "mise a jour";
    case Operation.EXECUTE: return "execution"

  }
}
const getEntityText = (entityType:Entity)=>{
    switch(entityType){
      case Entity.CONTRACT: return "d'un contrat";
      case Entity.CONVENSION: return "d' une convension";
      case Entity.EMPLOYEE: return "d'un employee";
      case Entity.JURIDICAL: return "d'un juridique";
      case Entity.VENDOR: return "d'un fournisseur";
      case Entity.ADMIN: return "d'un admin";
    }
}

const getElementStyle = (entity:Entity)=>{
  switch(entity){
    case Entity.EMPLOYEE: return "UsersCircle";
    case Entity.JURIDICAL: return "UsersCircle";
    case Entity.ADMIN: return "UsersCircle";
    case Entity.CONTRACT  : return "AgreementsCircle";
    case Entity.CONVENSION  : return "AgreementsCircle";
    case Entity.VENDOR : return "VendorCircle";
  }

}
const LastEventsCard = () => {
 
  const {events} = useAppSelector(state=>state.notification)
  return (
    <div className={styles.container}>
      <div className={styles.title}>Evenements</div>
      <ul className={styles.events}>
        {
          events.map(ev=>{
            const operation = getTextFromOperation(ev.operation)
            const entity = getEntityText(ev.entity);
            const extra =  ev.departementId && ev.departementId ?`dans : ${ev.directionAbriviation} , ${ev.departementAbriviation}`:"";
            return (
              <li className={styles.event}>
                <span  className={`${styles.circle} ${styles[getElementStyle(ev.entity)]} `}></span>
                <p className={styles.body}>{operation}: {entity} {extra}</p>
                <span className={styles.eventDate}>{moment(ev.createdAt).fromNow()}</span>
              </li>

            )
          })
        }
       
      </ul>
    </div>
  )
}

export default LastEventsCard