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
import { CreateUser } from '../../models/CreateUser.interface';
import { Direction } from '../../../direction/models/direction.interface';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import ErrorIcon from '@mui/icons-material/Error';

interface Proptype{
  handleClose:()=>void
}
const CreateUser = ({handleClose}:Proptype) => {
  const steps = [
    'identifiants',
    'direction , departement',
    'role et photo de profile',
    'validation',
  ];
  const [activeStep,setActiveStep] = useState(0);
  const [directions,setDirections] = useState<Direction[]>([]);
  const [selectedDirection,setSelectedDirection] = useState<{label:string,value:string}>({label:"",value:""})
  const [selectedDepartement,setSelectedDepartement] = useState<{label:string,value:string}>({label:"",value:""});

  const [profilImgFile,setProfileImageFile] = useState<any>(null);
  const [profileImgPreview,setProfileImgPreview] = useState('');
  const [loading,setLoading] = useState(false);
  const [done,setDone] = useState(false);
  const [isImageUploading,setIsImageUploading] = useState(false)
  const [role,setRole] = useState<string>("employee");

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
  const dispatch = useAppDispatch()

  const [imageUploadProgress,setImageUploadProgress] = useState(0)

 
  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };

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
    || (activeStep === 3) && (

       loading
    )

    
    )
     
    )
    return bl;
  }
  const handleDirectionChange = (event: SelectChangeEvent)=>{
    const directionId = event.target.value;
    const directionIndex = directions.findIndex(d=>d.id === directionId);
    if(directionIndex < 0 ) return ;
    const direction = directions[directionIndex];
    setSelectedDirection({label:direction?.title, value:directionId});
    console.log("selected direction: ",direction)
    if(direction.departements.length === 0 ) return;
    const departement = direction.departements[Math.floor(Math.random()*(direction.departements.length-1))];
    console.log("random departement",departement)
    setSelectedDepartement({label:departement?.title , value:departement.id as string})
  }
  const handleChangeDepartement = (event: SelectChangeEvent)=>{
    const departementId = event.target.value;
    const departements =  getDepartementsFromDirections();
    const directionIndex = departements.findIndex(d=>d.id === departementId);
    const departement = departements[directionIndex];
    if(directionIndex < 0 ) return ;
    setSelectedDepartement({label:departement.title , value:departementId})

  }
  useEffect(()=>{
    if(!profilImgFile) return;
    const objectUrl = URL.createObjectURL(profilImgFile);
    setProfileImgPreview(objectUrl)
    
    return () => URL.revokeObjectURL(objectUrl)
  },[profilImgFile])

  useEffect(()=>{
    const abortController = new AbortController();
    axios.get("http://localhost:8080/api/directions",{
      signal:abortController.signal
    }).then(res=>{
      const newDirections = res.data;
      setDirections(newDirections)
      if(newDirections.length ===0 ) return;
      const direction:Direction = newDirections[Math.floor(Math.random()*(newDirections.length-1))];
      setSelectedDirection({label:direction?.title, value:direction.id});
      console.log("selected direction: ",direction)
      if(direction.departements.length === 0 ) return;
      const departement = direction.departements[Math.floor(Math.random()*(direction.departements.length-1))];
      console.log("random departement",departement)
      setSelectedDepartement({label:departement?.title , value:departement.id as string})
      console.log(res.data,"t2")
    })
    .catch(err=>{
      console.error(err,"t2")
      if(err.code !== "ERR_CANCELED"){

        dispatch(showSnackbar({message:"verifiez si vous etes en ligne"}))
      }
     
    })
    return ()=>{
      abortController.abort();
    }
  },[])
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
        let imageUrl =""
       if( res){
         console.log(res)
         setIsImageUploading(false);
         imageUrl = res.data.filename
       }

        const newUser:CreateUser = {
            email,
            firstName,
            lastName,
            imageUrl,
            role,
            directionId:selectedDirection.value,
            departementId:selectedDepartement.value,
           
        }
        setLoading(true)
        await axios.post("http://localhost:8080/api/auth/register",{
          ...newUser
        })

        setLoading(false);
        setDone(true);




      }catch(err){
        console.error("t4",err)
        setLoading(false)
        setIsImageUploading(false);
         //@ts-ignore
         dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
      }
    
    
   }
  const handleNextStep = ()=>{
    if(done) return;
    if(activeStep === 2){

        handleSubmit();
    }
    setActiveStep(s=>(s+1)%4)
  }
  const handleStepLabel = (index:number)=>{
    if(done) return;
    if(index === 3){

        handleSubmit();
    }
    setActiveStep(index)
  }

  function getDepartementsFromDirections(){
    if(directions.length === 0) return [];
    const directionId =selectedDirection?.value;
    const directionIndex = directions.findIndex(d=>d.id === directionId);
    if(directionIndex < 0 ) return [];
    return directions[directionIndex].departements;
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
          activeStep === 1&& (
            <>
            <Stack direction="row" justifyContent="center" gap={3}>
              <FormControl className={styles.selectFormControl}>
                <InputLabel id="direction-input-label">Direction</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction-id"
                  value={selectedDirection?.value ??""}
                  label="direction"
                  size="small"
                  onChange={handleDirectionChange}
                  fullWidth
                >
                  {
                    directions.map((dr,index)=>{
                      return (
                        <MenuItem value={dr?.id ?? ""} key={index}>{dr.abriviation ?? ""}</MenuItem>
                      )
                    })
                  }
              
                </Select>
            </FormControl>
            <FormControl className={styles.selectFormControl}>
                <InputLabel id="direction-input-label">Departement</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction-id"
                  value={selectedDepartement?.value }
                  label="direction"
                  size="small"
                  onChange={handleChangeDepartement}
                  fullWidth
                >
                  {
                    getDepartementsFromDirections().map((dp,index)=>{
                      return (
                        <MenuItem value={dp?.id} key={index}>{dp?.abriviation}</MenuItem>
                      )
                    })
                  }
              
                </Select>
            </FormControl>
            </Stack>
            </>
          )
        }

        {
          activeStep === 2 && (
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
                  <MenuItem value={'employee'}>Employee</MenuItem>
                  <MenuItem value={'admin'}>Admin</MenuItem>
                  <MenuItem value={'juridical'}>Juridique</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            </>
          )
        }

{
                activeStep === 3 &&(
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
                                  done?(
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
                                  ):(
                                    <>
                                    <Typography>Erreur!</Typography>
                                    <Fab
                                    aria-label="save"
                                    color="secondary"
                                    size="small"
                                    sx={{boxShadow:"none"}}
                                    >
                                    <ErrorIcon sx={{ color:"white"}}/> 
                                   </Fab>
                                  </>
                                  )
                                   
                                )
                               )
                              
                            }
                           
                          
                        </Stack>}
                    </>
                )
            }
            
      </Stack>
      <Stack direction="row" className={styles.actionButtons}>
        <Button disabled={activeStep === 0 || done}>Precedent</Button>
        <Button disabled={nextBtnshouldBeDisabled() }
          onClick={()=>activeStep !== 3?handleNextStep():handleClose()}
          >{activeStep === 3 ?"Fermer":"Suivant"}</Button>
      </Stack>
      
    </div>
  )
}

export default CreateUser