import styles from './PopoverContent.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider } from '@mui/material';
import Link from 'next/link';
import { useAppDispatch } from '../../../../../hooks/redux/hooks';
import { logout } from '../../../../auth/authSlice';
const PopoverContent = () => {
    const links = [
        {text:"Profile" , link:"",icon:AccountCircleIcon},
        {text:"Parametres" , link:"",icon:SettingsIcon},
    ]
    const dispatch = useAppDispatch();
    function handleLogout(e:any){
        e.preventDefault();
        dispatch(logout())
    }
  return (
    <div className={styles.container}>
         <div className={styles.header}>
            <div className={styles.profilImgContainer}>
                <img src="sidali.jpg"/>
            </div>
            <div className={styles.userInfos}>
                <span>Assoul Sidali</span>
                <span>Juridique</span>
                <span>assoulsidali@gmail.com</span>
            </div>
         </div>
         <Divider sx={{margin:'6px 0'}}/>
         <ul className={styles.links}>
               {
                links.map((link,index)=>{
                    return (
                        <Link href={link.link}><li className={styles.link} key={index}>
                            <link.icon className={styles.iconStyle}/>
                            <span>{link.text}</span>
                        </li></Link>
                    )
                })
               }
               <li onClick = {handleLogout} className={styles.link} >
                        <LogoutIcon className={styles.iconStyle}/>
                        <span>Deconnexion</span>
              </li>
         </ul>
    </div>
  )
}

export default PopoverContent;