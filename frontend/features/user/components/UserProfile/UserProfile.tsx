import { Avatar } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import styles from './UserProfile.module.css';

const UserProfile = () => {
    const router = useRouter();
    const {user} = useAppSelector(state=>state.auth)
    const {query} = router;
    const {userId} = query;
    useEffect(()=>{
        if(!userId) return;
    },[userId])

    
    
  return (
    <div className={styles.userCard}>
    <div className={styles.userTitle}>Profile</div>
    <div>
    <div className={styles.imageContainer}>
                    <div className={styles.imageItem}>
                        <span className={styles.imageText}>DRG</span>
                        <span className={styles.imageLabel}>dp</span>
                    </div>

                    <Avatar className={styles.profileImg} src={user?.imageUrl?`http://localhost:8080/api/users/image/${user?.imageUrl}`:"blank-profile-picture.png"}/>

                    <div className={styles.imageItem}>
                        <span className={styles.imageLabel}>dr</span>
                        <span className={styles.imageText}>DRG</span>
                    </div>
                </div>
    </div>
    <div className={styles.content}>
      <div className={styles.userContentItem}>
        <span>nom:</span>
        <span>Assoul</span>
      </div>
      <div className={styles.userContentItem}>
        <span>Prenom:</span>
        <span>Sidali</span>
      </div>
      <div className={styles.userContentItem}>
        <span>email:</span>
        <span>assoulsidali@gmail.com</span>
      </div>
      <div className={styles.userContentItem}>
        <span>{"nom d'utilisateur"}</span>
        <span>storm.sidali</span>
      </div>
      <div className={styles.userContentItem}>
        <span>{"Role"}</span>
        <span>Juridique</span>
      </div>
    
    </div>
  </div>
  )
}

export default UserProfile