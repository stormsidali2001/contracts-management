import { TextField, Theme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';


import styles from './DateRangePicker.module.css';
import {useState} from 'react';
import { makeStyles } from "@mui/material";



const DateRangePicker = () => {

  return (
<div className={styles.container}>
    <input type="date" className={styles.dateInput}/>
    <div className={styles.bubbles}>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
    </div>
    <label htmlFor="input" className={styles.dateInput}>
    <input id="input" type="date" className={styles.dateInput}/>
    <input type="text" className={styles.dateInput}/>
    </label>
</div>
  )
}

export default DateRangePicker