import styles from './Sidebar..module.css';
import { sidebarData } from '../../data';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import {useState} from 'react';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';const Sidebar = () => {
    const [selectedItem,setSelectedItem] = useState(0);
    const [expanded,setExpanded] = useState(true);
    return (
        <>
          
        <div className={styles.container} >
            <div className={styles.logo}>
                <img src="bmt.png" alt=""  />
            </div>
            <ul className={styles.menu}>
                {
                    sidebarData.map((item,index)=>{
                        return (
                            <li className={`${styles.menuItem} ${selectedItem === index ?styles.active:''}`} key={index} onClick={()=>setSelectedItem(index)}>
                                <item.icon/>
                                <span>{item.text}</span>
                            </li>
                        )
                        
                    })
                }
                <div className={styles.menuItem} >
                    <ExitToAppOutlinedIcon/>
                    <span>Deconnexion</span>
                </div>

            
            </ul>
        </div>
        </>
    )
}

export default Sidebar