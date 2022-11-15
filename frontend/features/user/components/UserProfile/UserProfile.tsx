import { Avatar, Button, CircularProgress, LinearProgress } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect ,useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import styles from './UserProfile.module.css';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { showSnackbar } from '../../../ui/UiSlice';
import { Stack } from '@mui/system';
import { setImageUrl } from '../../../auth/authSlice';
import { UserRole } from '../../../auth/models/user-role.enum';
const UserProfile = () => {
    const {user:currentUser} = useAppSelector(state=>state.auth)
    const router = useRouter();
    const [user,setUser] = useState<any>(null)
    const {query} = router;
    const {userId} = query;
    const [edit,setEdit] = useState(false);
    const {user:connectedUser} = useAppSelector(state=>state.auth)
    const [loading,setLoading] = useState(false)
    const [imagePreview,setImagePreview] = useState(user?.imageUrl?`http://localhost:8080/api/users/image/${user?.imageUrl}`:"/blank-profile-picture.png");
    const [isImageUploading,setIsImageUploading] = useState(false)
    const [imageFile,setImageFile] = useState<any>(null)
    const [imageUploadProgress,setImageUploadProgress] = useState(0)
    const privateAxios = useAxiosPrivate({});
    const dispatch = useAppDispatch();


    const fetchUser = ()=>{
        privateAxios.get(`http://localhost:8080/api/users/${userId}`)
        .then(res=>{
            console.log(res)
            setUser(res.data)
        })
        .catch(err=>{
            console.error(err);

        })
    }

    useEffect(()=>{
        if(!userId) return;
        fetchUser();
      
    },[userId])

    
  const setUserProperty = (key:string,value:any)=>setUser((u:Object)=>({...u,[key]:value}))
  const handleSubmit = async()=>{
    //image upload section
    
    if(imageFile) setIsImageUploading(true)
    const formData = new FormData();
    formData.append("file",imageFile)
      let res;
      if(imageFile){
        res = await privateAxios.post("http://localhost:8080/api/users/image/upload",
            formData,
            {
                onUploadProgress:(e)=>{
                    const {loaded,total} = e;
                    console.log(`${loaded} kbof ${total}`)
                    setImageUploadProgress(Math.floor((loaded/total)*100))
                },
               
            }
        );

      }
      let imageUrl =""
     if( res?.data){
       console.log(res)
       imageUrl = res.data.filename
       setIsImageUploading(false);
     }

   
    setLoading(true)
    console.log("update user :",{
        email:user.email,
        username:user.username,
        firstName:user.firstName,
        lastName:user.lastName,
        imageUrl
    })
    privateAxios.put(`http://localhost:8080/api/users/${user.id}`,{
        email:user.email,
        username:user.username,
        firstName:user.firstName,
        lastName:user.lastName,
        imageUrl
    })
    .then(res=>{
        if(imageUrl.length > 0 ){
            if(currentUser?.sub === user.id){
                dispatch(setImageUrl({imageUrl}))
            }
            setUser({...user,imageUrl})
            
            
         }
    
        setEdit(false)
        setLoading(false)

    })
    .catch(err=>{
        dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
        setLoading(false)
        setEdit(false)

    });
  }
  const handleFileChange = (e:any)=>{
    if(!e.target.files ) return;
    if(e.target.files.length === 0 ) return;
    setImageFile(e.target.files[0])

  }
  useEffect(()=>{
    if(!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)

    return ()=>{
        URL.revokeObjectURL(objectUrl)
    }
  },[imageFile])
  const canEditUser = ()=>{
    return connectedUser?.role === UserRole.ADMIN || connectedUser?.sub === user?.id;
  }
  return (
    <div className={styles.userCard}>
    {
        canEditUser() &&(<>
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
        
        </>)
       
    }
  
    <div className={styles.userTitle}>Profile</div>
    <div>
    <div className={styles.imageContainer}>
                    <div className={styles.imageItem}>
                        <span className={styles.imageText}>{user?.departement?.abriviation ?? "..."}</span>
                        <span className={styles.imageLabel}>dp</span>
                    </div>
                    {
                        !edit?(
                            <Avatar className={styles.profileImg} src={user?.imageUrl?`http://localhost:8080/api/users/image/${user?.imageUrl}`:"/blank-profile-picture.png"}/>
                        ):(
                            <label htmlFor='input1' style={{cursor:"pointer"}}>
                                <Avatar className={styles.profileImg} src={imagePreview}/>
                                <input onChange={handleFileChange} type='file' id='input1' style={{display:'none'}}/>
                           </label>
                        )
                    }
                            

                    <div className={styles.imageItem}>
                        <span className={styles.imageLabel}>dr</span>
                        <span className={styles.imageText}>{user?.direction?.abriviation ?? "..."}</span>
                    </div>
                </div>
    </div>
     {  
       isImageUploading && 
      ( <Stack  sx={{marginTop:"10px"}} alignItems="center">
            <span >{imageUploadProgress}</span>
            <LinearProgress   variant="buffer"  valueBuffer={imageUploadProgress} value={imageUploadProgress} color="primary" sx={{width:"100%"}} />
        </Stack>)
     }
   
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
