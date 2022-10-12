import { Button, Input, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import styles from './Settings.module.css';

const Settings = () => {
  return (
    <div className={styles.container}>
        <div className={styles.title}>Settings</div>
        <div className={styles.content}>
            <Stack>
                <TextField size='small' type='password' label='ancien mot de passe'/>
                <TextField size='small' type='password' label='ancien mot de passe'/>
            </Stack>
            <div>
                <Input type="checkbox"/>
                <span>Recevoir des emails</span>
            </div>
           
        </div>
    </div>
  )
}
export default Settings