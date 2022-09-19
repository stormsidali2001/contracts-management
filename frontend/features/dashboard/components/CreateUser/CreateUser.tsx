import UploadIcon from '@mui/icons-material/Upload';
import { Avatar, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, useState } from 'react';
import useInput from '../../../../hooks/input/use-input';
import { validateEmail } from '../../../../shared/utils/validation/email';
import { validateFirstName, validateLastName } from '../../../../shared/utils/validation/length';
import styles from './CreateUser.module.css';

const CreateUser = () => {
  const steps = [
    'identifiants',
    'role et photo de profile',
    'validation',
  ];
  const [activeStep,setActiveStep] = useState(1);
  const {
    text:firstName ,
    inputBlurHandler:firstNameBlurHandler,
    textChangeHandler:firstNameChangeHandler,
    shouldDisplayError:firstNameShouldDisplayError,
    
  } = useInput(validateFirstName);
  const {
    text:lastName ,
    inputBlurHandler:lastNameBlurHandler,
    textChangeHandler:lastNameChangeHandler,
    shouldDisplayError:lastNameShouldDisplayError,

  } = useInput(validateLastName);
  const {
    text:email ,
    inputBlurHandler:emailBlurHandler,
    textChangeHandler:emailChangeHandler,
    shouldDisplayError:emailShouldDisplayError,

  } = useInput(validateEmail);

  const [role,setRole] = useState<string>("Employee");
  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };
  function nextBtnshouldBeDisabled():boolean{
    const bl =   Boolean(
    (activeStep === 0) 
    && (
       email.length === 0 
    || firstName.length ===0 
    || lastName.length === 0 
    || firstNameShouldDisplayError 
    || lastNameShouldDisplayError 
    || emailShouldDisplayError) );

    return bl;
  }
  const [profilImgFile,setProfileImageFile] = useState(null);
  const [profileImgPreview,setProfileImgPreview] = useState('')
  useEffect(()=>{
    if(!profilImgFile) return;
    const objectUrl = URL.createObjectURL(profilImgFile);
    setProfileImgPreview(objectUrl)
    
    return () => URL.revokeObjectURL(objectUrl)
  },[profilImgFile])
  const handleFileChange = (e:any)=>{
    e.preventDefault();
    setProfileImageFile(e.target.files[0])
  }
  return (
    <div className={styles.container}>
      <Stack direction="row">
        <Typography className={styles.title}>Nouveau Compte</Typography>
      </Stack>
      <Stepper   activeStep={activeStep} alternativeLabel>
        {steps.map((label,index) => (
          <Step     key={label} onClick={()=>!nextBtnshouldBeDisabled() && setActiveStep(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Stack className={styles.inputsContainer}>
        {
         activeStep === 0 && ( <>
            <TextField 
            value={firstName} 
            onChange={firstNameChangeHandler}
            onBlur={firstNameBlurHandler}
            error={firstNameShouldDisplayError}
            helperText={firstNameShouldDisplayError && "min caracteres 5"}
            size="small" 
            label="Nom"
          />
          <TextField 
            value={lastName}
            onChange={lastNameChangeHandler}
            onBlur={lastNameBlurHandler}
            error={lastNameShouldDisplayError}
            helperText={lastNameShouldDisplayError &&"min caracteres 5"}
            size="small" 
            label="Prenom"
          />
          <TextField 
            value={email}
            onChange={emailChangeHandler}
            onBlur={emailBlurHandler}
            error={emailShouldDisplayError}
            helperText={emailShouldDisplayError && "email non valide"}
            size="small" 
            label="Email"
          /> 
        </>)
        }

        {
          activeStep === 1 && (
            <>
              <Typography></Typography>
              <Stack direction="row" className={styles.headerContainer}>
                
                <Stack alignItems="center" gap={1}>
                    <Button className={styles.uploadButton}>
                       <label htmlFor='input-file-upload'>
                        <Avatar><UploadIcon color="primary"/></Avatar>
                        <input onChange={handleFileChange} id="input-file-upload" type="file" style={{display:"none"}}/>
                       </label>
                    </Button>
                 
                  <Typography sx = {{fontSize:"11px"}}>Photo de Profile</Typography>
                </Stack>
                <div className={styles.header}>
                    <div className={styles.profilImgContainer}>
                        <img src={profileImgPreview ? profileImgPreview : "blank-profile-picture.png"}/>
                    </div>
                    <div className={styles.userInfos}>
                        <span>{`${firstName}  ${lastName}`}</span>
                        <span>{role ?? ''}</span>
                        <span>{email ?? ''}</span>
                    </div>
                </div>
              </Stack>
              <Stack direction="row" justifyContent="center">
              <FormControl className={styles.selectFormControl}>
              <InputLabel id="role-input-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role-id"
                value={role}
                label="role"
                size="small"
                onChange={handleRoleChange}
                fullWidth
              >
                <MenuItem value={'Employee'}>Employee</MenuItem>
                <MenuItem value={'Admin'}>Admin</MenuItem>
                <MenuItem value={'Juridique'}>Juridique</MenuItem>
              </Select>
            </FormControl>
            </Stack>
            </>
          )
        }
            
      </Stack>
      <Stack direction="row" className={styles.actionButtons}>
        <Button disabled={activeStep === 0 }>Precedent</Button>
        <Button disabled={nextBtnshouldBeDisabled()}
          onClick={()=>setActiveStep(s=>((s+1)%3))}
          >Suivant</Button>
      </Stack>
      
    </div>
  )
}

export default CreateUser