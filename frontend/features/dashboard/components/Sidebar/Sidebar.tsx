import { Button } from '@mui/material';
import { BMT_LOGO_URL, sidebarLinks } from '../../data';
import styles from './Sidebar.module.css';
import {useState} from 'react';
const Sidebar = () => {
    const [activeIndex,setAcitveIndex] = useState(0);

    const getStyle = (index:number)=>{
        if(index === activeIndex){
            return `${styles.link} ${styles.active}`;
        }
        return `${styles.link}`;
    }
  return (
    <div className={styles.container}>
        <Button className={styles.logo}>
            <img src={BMT_LOGO_URL} alt=""/>
        </Button>
        <ul className={styles.links}>
            {
                sidebarLinks.map((link,index)=>(
                    <li key={index} className={getStyle(index)} onClick={()=>setAcitveIndex(index)}>
                        <link.icon/>
                        <span>{link.text}</span>
                    </li>
                ))
            }
        </ul>
    </div>
  )
}

export default Sidebar