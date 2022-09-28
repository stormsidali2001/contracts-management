import { Avatar, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect ,useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import styles from './UserProfile.module.css';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { showSnackbar } from '../../../ui/UiSlice';
const UserProfile = () => {
    const router = useRouter();
    const [user,setUser] = useState<any>(null)
    const {query} = router;
    const {userId} = query;
    const [edit,setEdit] = useState(false);
    const [loading,setLoading] = useState(false)
    const privateAxios = useAxiosPrivate();
    const dispatch = useAppDispatch();
    useEffect(()=>{
        if(!userId) return;
        privateAxios.get(`http://localhost:8080/api/users/${userId}`)
        .then(res=>{
            console.log(res)
            setUser(res.data)
        })
        .catch(err=>{
            console.error(err);

        })
    },[userId])

    
  const setUserProperty = (key:string,value:any)=>setUser((u:Object)=>({...u,[key]:value}))
  const handleSubmit = ()=>{
    setLoading(true)
    privateAxios.put(`http://localhost:8080/api/users/${user.id}`,{
        email:user.email,
        username:user.username,
        firstName:user.firstName,
        lastName:user.lastName
    })
    .then(res=>{
        setEdit(false)
        setLoading(false)

    })
    .catch(err=>{
        dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
        setLoading(false)

    });
  }
  return (
    <div className={styles.userCard}>
    {
        edit?(
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
                onClick={()=>setEdit(true)}
            >
                <EditIcon/>
            </Button>
        )
    }
  
    <div className={styles.userTitle}>Profile</div>
    <div>
    <div className={styles.imageContainer}>
                    <div className={styles.imageItem}>
                        <span className={styles.imageText}>{user?.departement?.abriviation}</span>
                        <span className={styles.imageLabel}>dp</span>
                    </div>

                    <Avatar className={styles.profileImg} src={user?.imageUrl?`http://localhost:8080/api/users/image/${user?.imageUrl}`:"blank-profile-picture.png"}/>

                    <div className={styles.imageItem}>
                        <span className={styles.imageLabel}>dr</span>
                        <span className={styles.imageText}>{user?.direction?.abriviation}</span>
                    </div>
                </div>
    </div>
    <div className={styles.content}>
      <div className={styles.userContentItem}>
        <span>nom:</span>
        <Field
            value={user?.firstName}
            edit={edit}
            onChange = {(e:any)=>setUserProperty("firstName",e.target.value)}
        />
      </div>
      <div className={styles.userContentItem}>
        <span>Prenom:</span>
        <Field
            value={user?.lastName}
            edit={edit}
            onChange = {(e:any)=>setUserProperty("lastName",e.target.value)}
        />
      </div>
      <div className={styles.userContentItem}>
        <span>email:</span>
        <Field
            value={user?.email}
            edit={edit}
            onChange = {(e:any)=>setUserProperty("email",e.target.value)}
        />
      </div>
      <div className={styles.userContentItem}>
        <span>{"nom d'utilisateur"}</span>
        <Field
            value={user?.username}
            edit={edit}
            onChange = {(e:any)=>setUserProperty("username",e.target.value)}
        />
     
      </div>
      <div className={styles.userContentItem}>
        <span>{"Role"}</span>
        <span>{user?.role}</span>
      </div>
    
    </div>
  </div>
  )
}
function Field({edit, value,onChange}:any){
    return (
        <>
        { edit?(
                <input type="text" className={styles.editInput} value={value} onChange={onChange} />
            ):(

                <span>{value}</span>
            )}
        </>
    )
}

export default UserProfile
