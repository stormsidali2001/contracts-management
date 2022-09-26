import styles from './CreateVendor.module.css'
import { useEffect, useState } from 'react';
import UploadIcon from '@mui/icons-material/Upload';
import { Avatar, Button, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import useInput from '../../../../hooks/input/use-input';
import { Stack } from '@mui/system';
import { validateCompanyName } from '../../../../shared/utils/validation/validateCompanyName';
import { validateNif } from '../../../../shared/utils/validation/validateNif';
import { validateMobilePhoneNumber } from '../../../../shared/utils/validation/validatemobilePhoneNumber';
import { validateHomePhoneNumber } from '../../../../shared/utils/validation/validateHomePhoneNumber';
import { validateNrc } from '../../../../shared/utils/validation/validateNrc';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { Vendor } from '../../models/vendor.interface';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
 interface PropType{
  handleClose:()=>void
}


const CreateVendor = ({handleClose}:PropType) => {
    const steps = [
        'identifiants',
        'Localisation',
        'validation',
      ];
      const [activeStep,setActiveStep] = useState(0);
      const {
        text:num ,
        inputBlurHandler:numBlurHandler,
        textChangeHandler:numChangeHandler,
        shouldDisplayError:numShouldDisplayError,
        inputClearHandler:numInputClearHandler
        
      } = useInput();
      const {
        text:companyName ,
        inputBlurHandler:companyNameBlurHandler,
        textChangeHandler:companyNameChangeHandler,
        shouldDisplayError:companyNameShouldDisplayError,
        inputClearHandler:companyNameInputClearHandler
    
      } = useInput(validateCompanyName);
      const {
        text:nif ,
        inputBlurHandler:nifBlurHandler,
        textChangeHandler:nifChangeHandler,
        shouldDisplayError:nifShouldDisplayError,
        inputClearHandler:nifInputClearHandler

    
      } = useInput(validateNif);
      const {
        text:nrc ,
        inputBlurHandler:nrcBlurHandler,
        textChangeHandler:nrcChangeHandler,
        shouldDisplayError:nrcShouldDisplayError,
        inputClearHandler:nrcInputClearHandler

      } = useInput();
      const {
        text:address ,
        inputBlurHandler:addressBlurHandler,
        textChangeHandler:addressChangeHandler,
        shouldDisplayError:addressShouldDisplayError,
        inputClearHandler:addressInputClearHandler

    
      } = useInput();
      const {
        text:homePhoneNumber ,
        inputBlurHandler:homePhoneNumberBlurHandler,
        textChangeHandler:homePhoneNumberChangeHandler,
        shouldDisplayError:homePhoneNumberShouldDisplayError,
        inputClearHandler:homePhoneNumberInputClearHandler

    
      } = useInput(validateHomePhoneNumber);
      const {
        text:personalPhoneNumber ,
        inputBlurHandler:personalPhoneNumberBlurHandler,
        textChangeHandler:personalPhoneNumberChangeHandler,
        shouldDisplayError:personalPhoneNumberShouldDisplayError,
        inputClearHandler:personalPhoneNumberInputClearHandler

    
      } = useInput(validateMobilePhoneNumber);
      const dispatch = useAppDispatch()
      const [loading,setLoading] = useState(false);
      const [done,setDone] = useState(false)
      function nextBtnshouldBeDisabled():boolean{
        const bl =   Boolean(
        !done &&(
             (activeStep === 0) 
        && (
                num.length ===0 
                || companyName.length ===0
                || nif.length === 0
                || nrc.length ===0
                || companyNameShouldDisplayError
                || nifShouldDisplayError
                || nrcShouldDisplayError
            
            ) 
        || (activeStep === 2) &&(
            loading
        )
     
    
      )
        )
      ;
    
        return bl;
      }
      const handleSubmit = ()=>{
        if(!num || !companyName || !nif || !nrc ||!homePhoneNumber || !personalPhoneNumber)return;
        const vendor:Vendor = {
            num,
            company_name:companyName,
            nif,
            nrc,
            address,
            home_phone_number:homePhoneNumber,
            mobile_phone_number:personalPhoneNumber
          }

            setLoading(true) 
            axios.post("http://localhost:8080/api/vendors",vendor)
            .then(res =>{
                console.log(res)
                handleRestForm();
                setLoading(false) 
                setDone(true)

            })
            .catch(err=>{
                console.log(err)
                setLoading(false) 
                setDone(false)
                  //@ts-ignore
                 dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
            })

       
      }
      const handleNextStep = ()=>{
        if(done) return;
        if(activeStep === 1){

            handleSubmit();
        }
        setActiveStep(s=>(s+1)%3)
      }
      const handleStepLabel = (index:number)=>{
        if(done) return;
        if(index === 2){

            handleSubmit();
        }
        setActiveStep(index)
      }
      const handleRestForm = ()=>{
        numInputClearHandler();
        companyNameInputClearHandler();
        nifInputClearHandler();
        nrcInputClearHandler()
        addressInputClearHandler()
        personalPhoneNumberInputClearHandler();
        homePhoneNumberInputClearHandler();
        
    }
      return (
        <div className={styles.container}>
        <form >
          <Stack direction="row">
            <Typography className={styles.title}>Nouveau Fournisseur</Typography>
          </Stack>
          <Stepper   activeStep={activeStep} alternativeLabel>
            {steps.map((label,index) => (
              <Step     key={label} onClick={()=>!nextBtnshouldBeDisabled() && handleStepLabel(index)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
    
          <Stack className={styles.inputsContainer}>
            
            {
             activeStep === 0 && ( <>
                <TextField 
                value={num} 
                onChange={numChangeHandler}
                onBlur={numBlurHandler}
                error={numShouldDisplayError}
                helperText={numShouldDisplayError && "min caracteres 5"}
                size="small" 
                label="numero"
              />
              <TextField 
                value={companyName}
                onChange={companyNameChangeHandler}
                onBlur={companyNameBlurHandler}
                error={companyNameShouldDisplayError}
                helperText={companyNameShouldDisplayError &&"mauvais format"}
                size="small" 
                label="raison sociale"
              />
              <TextField 
                value={nif}
                onChange={nifChangeHandler}
                onBlur={nifBlurHandler}
                error={nifShouldDisplayError}
                helperText={nifShouldDisplayError && "format de nif: 1 caractere 7 numero 1 caractere"}
                size="small" 
                label="numero d'identification fiscale"
              /> 
              <TextField 
                value={nrc}
                onChange={nrcChangeHandler}
                onBlur={nrcBlurHandler}
                error={nrcShouldDisplayError}
                helperText={nrcShouldDisplayError && "email non valide"}
                size="small" 
                label="numero de registre de commerce"
              /> 
          
            </>)
            }
            {
                 activeStep === 1 && ( <>
                 
                  <TextField 
                    value={address}
                    onChange={addressChangeHandler}
                    onBlur={addressBlurHandler}
                    error={addressShouldDisplayError}
                    helperText={addressShouldDisplayError && "email non valide"}
                    size="small" 
                    label="adresse"
                  /> 
                  <TextField 
                    value={homePhoneNumber}
                    onChange={homePhoneNumberChangeHandler}
                    onBlur={homePhoneNumberBlurHandler}
                    error={homePhoneNumberShouldDisplayError}
                    helperText={homePhoneNumberShouldDisplayError && "ce n'est pas un numero de telephone(fixe) algerien"}
                    size="small" 
                    label="fixe"
                  /> 
                  <TextField 
                    value={personalPhoneNumber}
                    onChange={personalPhoneNumberChangeHandler}
                    onBlur={personalPhoneNumberBlurHandler}
                    error={personalPhoneNumberShouldDisplayError}
                    helperText={personalPhoneNumberShouldDisplayError && "ce n'est pas un numero de telephone algerien"}
                    size="small" 
                    label="mobile"
                  /> 
                </>)
            }

            {
                activeStep === 2 &&(
                    <>
                       { <Stack alignItems="center" gap={1}>
                          
                            {
                                loading?(
                                    <>
                                    <Typography>Creation de  Fournisseur...</Typography>
                                    <CircularProgress/>
                                  </>
                                    
                                ):(
                                    <>
                                      <Typography>Founisseur cree !</Typography>
                                      <Fab
                                      aria-label="save"
                                      color="secondary"
                                      size="small"
                                      sx={{boxShadow:"none"}}
                                      >
                                       <CheckIcon sx={{ color:"white"}}/> 
                                    </Fab>
                                    </>
                                )
                            }
                           
                          
                        </Stack>}
                    </>
                )
            }
    
           
                
          </Stack>
          <Stack direction="row" className={styles.actionButtons}>
            <Button disabled={activeStep === 0 || (activeStep === 2 && done ) }>Precedent</Button>
            <Button 
            disabled={nextBtnshouldBeDisabled()}
              onClick={()=>{activeStep !== 2 ?handleNextStep():handleClose()}}
              >{activeStep === 2 ?"Fermer":"Suivant"}</Button>
          </Stack>
          </form>
        </div>
      )
}

export default CreateVendor