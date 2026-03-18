'use client';
import moment from 'moment';
import 'moment-locale-fr';
moment.locale('fr');
import { useNotificationStore } from '@/features/notification/store/notification.store';
import { Entity } from '@/features/notification/models/Entity.enum';
import { Operation } from '@/features/notification/models/Operation.enum';
import styles from './LastEventsCard.module.css';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

const getOperationLabel = (op: Operation) => {
  switch (op) {
    case Operation.INSERT:  return { label: 'Création',     cls: styles.opInsert };
    case Operation.DELETE:  return { label: 'Suppression',  cls: styles.opDelete };
    case Operation.UPDATE:  return { label: 'Mise à jour',  cls: styles.opUpdate };
    case Operation.EXECUTE: return { label: 'Exécution',    cls: styles.opExecute };
  }
};

const getEntityLabel = (e: Entity) => {
  switch (e) {
    case Entity.CONTRACT:   return "d'un contrat";
    case Entity.CONVENSION: return "d'une convention";
    case Entity.EMPLOYEE:   return "d'un employé";
    case Entity.JURIDICAL:  return "d'un juridique";
    case Entity.VENDOR:     return "d'un fournisseur";
    case Entity.ADMIN:      return "d'un admin";
  }
};

const getEntityStyle = (e: Entity) => {
  switch (e) {
    case Entity.CONTRACT:
    case Entity.CONVENSION: return 'AgreementsCircle';
    case Entity.EMPLOYEE:
    case Entity.JURIDICAL:
    case Entity.ADMIN:      return 'UsersCircle';
    case Entity.VENDOR:     return 'VendorCircle';
  }
};

const EntityIcon = ({ entity }: { entity: Entity }) => {
  const iconStyle = { fontSize: 14 };
  switch (entity) {
    case Entity.CONTRACT:
    case Entity.CONVENSION: return <DescriptionOutlinedIcon sx={iconStyle} />;
    case Entity.VENDOR:     return <StorefrontOutlinedIcon sx={iconStyle} />;
    default:                return <PeopleAltOutlinedIcon sx={iconStyle} />;
  }
};

const LastEventsCard = () => {
  const events = useNotificationStore((s) => s.events);
  return (
    <div className={styles.container}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Événements</span>
          {events.length > 0 && <span className={styles.eventCount}>{events.length} récents</span>}
        </div>
      </div>
      {events.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 28 }} />
          </div>
          <span className={styles.emptyTitle}>Aucun événement</span>
          <span className={styles.emptyDesc}>Les activités récentes apparaîtront ici en temps réel.</span>
        </div>
      )}
      <ul className={styles.events}>
        {events.map((ev, index) => {
          const op = getOperationLabel(ev.operation);
          const entityText = getEntityLabel(ev.entity);
          const entityStyle = getEntityStyle(ev.entity);
          const extra = ev.departementId ? ` — ${ev.directionAbriviation}, ${ev.departementAbriviation}` : '';
          return (
            <li key={index} className={styles.event}>
              <div className={`${styles.entityBadge} ${styles[entityStyle]}`}>
                <EntityIcon entity={ev.entity} />
              </div>
              <p className={styles.body}>
                <span className={`${styles.opChip} ${op?.cls}`}>{op?.label}</span>
                {' '}{entityText}{extra}
              </p>
              <span className={styles.eventDate}>{moment(ev.createdAt).fromNow()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LastEventsCard;
