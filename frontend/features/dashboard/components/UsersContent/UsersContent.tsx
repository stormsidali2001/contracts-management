import styles from './UserContent.module.css';
import {Button, FormControl, Input, InputLabel} from '@mui/material';
import FilterIcon from '../../../../icons/FilterIcon';
import TextField from '@mui/material/TextField';
import {SearchRounded } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';

const UsersContent = () => {

const obj = <InputAdornment position="start">
<SearchRounded />
</InputAdornment>;
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>
            <div className={styles.searchContainer}>
                <Button 
                    startIcon ={<FilterIcon/>}  
                    size='small' 
                    color='secondary' 
                    variant="contained" 
                    className={styles.advancedButton}>Avancée</Button>
              
          
                <TextField 
                    placeholder='mot clé...' color='secondary' 
                    size='small' 
                    fullWidth type='search' 
                    
                   InputProps={{

                                startAdornment:obj
                                
                                ,
                                className: styles.input,

                                }}
                />
                
            </div>
            
        </div>
    </div>
  )
}

export default UsersContent