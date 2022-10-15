import { Alert, Snackbar } from '@mui/material'
import React, { useState } from 'react'
import { clear } from '../features/ui/UiSlice';
import { useAppDispatch ,useAppSelector} from '../hooks/redux/hooks';

const WithSnackbar = ({children}:any) => {
    const {message,open,severty} = useAppSelector(state=>state.uiSlice);
    const dispatch = useAppDispatch();
    const handleClose = ()=>{
        dispatch(clear())
      }
    
  return (
        <>
            {children}
            <Snackbar anchorOrigin={{horizontal:'center',vertical:"top"}} open={open} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severty} sx={{ width: '100%' }}>
                {message}
                </Alert>
            </Snackbar>
        </>
  )
}

export default WithSnackbar