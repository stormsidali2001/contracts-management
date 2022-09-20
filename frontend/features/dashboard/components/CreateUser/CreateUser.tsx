import UploadIcon from '@mui/icons-material/Upload';
import { Avatar, Button, CircularProgress, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, useState } from 'react';
import useInput from '../../../../hooks/input/use-input';
import { validateEmail } from '../../../../shared/utils/validation/email';
import { validateFirstName, validateLastName } from '../../../../shared/utils/validation/length';
import CheckIcon from '@mui/icons-material/Check';
import styles from './CreateUser.module.css';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';


const CreateUser = () => {
  const steps = [
    'identifiants',
    'role et photo de profile',
    'validation',
  ];
  const [activeStep,setActiveStep] = useState(0);
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

  const [imageUploadProgress,setImageUploadProgress] = useState(0)

  const [role,setRole] = useState<string>("Employee");
  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };
  const [userProfileUrl,setUserProfileUrl] = useState("")
  function nextBtnshouldBeDisabled():boolean{
    const bl =   Boolean(
   !done &&( 
    (activeStep === 0) && (
       email.length === 0 
    || firstName.length ===0 
    || lastName.length === 0 
    || firstNameShouldDisplayError 
    || lastNameShouldDisplayError 
    || emailShouldDisplayError
    )
    || (activeStep === 2) && (

       loading
    )

    
    )
     
    )
    return bl;
  }
  const [profilImgFile,setProfileImageFile] = useState<any>(null);
  const [profileImgPreview,setProfileImgPreview] = useState('');
  const [loading,setLoading] = useState(false);
  const [done,setDone] = useState(false);
  const [isImageUploading,setIsImageUploading] = useState(false)
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
   const handleSubmit = async()=>{
  
      if(profilImgFile) setIsImageUploading(true)
      const formData = new FormData();
      formData.append("file",profilImgFile)
      try{
        let res;
        if(profilImgFile){
          res = await axios.post("http://localhost:8080/api/users/image/upload",formData,
         {
           onUploadProgress:(e)=>{
               const {loaded,total} = e;
               console.log(`${loaded} kbof ${total}`)
               setImageUploadProgress(Math.floor((loaded/total)*100))
           },
           headers:{
             'Authorization':"Bearer "+JSON.parse(localStorage.getItem("jwt") ?? "" )?.access_token
           }
         })

        }
       if( res){
         console.log(res)
         setIsImageUploading(false);
         setUserProfileUrl(res.data.filename);
       }
        const newUser = {
            email,
            firstName,
            lastName,
            imageUrl:userProfileUrl
        }
        setLoading(true)
        await axios.post("http://localhost:8080/api/auth/register",{
          ...newUser
        })

        setLoading(false)
        setDone(true)



      }catch(err){
        console.error(err)
        setLoading(false)
        setIsImageUploading(false);
      }
    
    
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
  return (
    <div className={styles.container}>
      <Stack direction="row">
        <Typography className={styles.title}>Nouveau Compte</Typography>
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

{
                activeStep === 2 &&(
                    <>
                       { <Stack alignItems="center" gap={1}>
                          
                            {
                               isImageUploading ?(<>
                               {imageUploadProgress}
                               <LinearProgress  variant="buffer"  valueBuffer={imageUploadProgress} value={imageUploadProgress} color="primary" sx={{width:"100%"}} />
                               
                               </>):(
                                  loading?(
                                    <>
                                    <Typography>Creation de  Compte...</Typography>
                                    <CircularProgress/>
                                  </>
                                    
                                ):(
                                    <>
                                      <Typography>Compte cree !</Typography>
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
                               )
                              
                            }
                           
                          
                        </Stack>}
                    </>
                )
            }
            
      </Stack>
      <Stack direction="row" className={styles.actionButtons}>
        <Button disabled={activeStep === 0 }>Precedent</Button>
        <Button disabled={nextBtnshouldBeDisabled()}
          onClick={()=>handleNextStep()}
          >Suivant</Button>
      </Stack>
      
    </div>
  )
}

export default CreateUser