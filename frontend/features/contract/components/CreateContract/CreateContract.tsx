import styles from './CreateContract.module.css';
import { Avatar, Button, CircularProgress, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper, TextField, Typography ,Modal, Snackbar, Alert} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/system';
import axios from 'axios';
import { Direction } from '../../../direction/models/direction.interface';
import useInput from '../../../../hooks/input/use-input';
import UploadIcon from '@mui/icons-material/Upload';
import CheckIcon from '@mui/icons-material/Check';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SelectVendor from '../SelectVendor/SelectVendor';
import { CreateAgreement } from '../../models/CreateAgreement.interface';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import ErrorIcon from '@mui/icons-material/Error';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';





interface Proptype{
    handleClose:()=>void,
    type?: 'contract' | 'convension'
  }
  const CreateContract = ({handleClose,type = "contract"}:Proptype) => {
    const axiosPrivate = useAxiosPrivate();
    const steps = [
      'identifiants',
      'direction , departement',
      'fichier , date et Fournisseur',
      'validation',
    ];
    const [activeStep,setActiveStep] = useState(0);
    const [directions,setDirections] = useState<Direction[]>([]);
    const [selectedDirection,setSelectedDirection] = useState<{label:string,value:string}>({label:"",value:""})
    const [selectedDepartement,setSelectedDepartement] = useState<{label:string,value:string}>({label:"",value:""});
    const [agreementDocumentFile,setAgreementDocumentFile] = useState<any>(null);
    const [loading,setLoading] = useState(false);
    const [done,setDone] = useState(false);
    const [isAgreementDocumentFileUploading,setIsAgreementDocumentFileUploading] = useState(false)
    const [amount,setAmount] = useState(0)
    const [vendor,setVendor] = useState<any>(null);
    const [signatureDate, setSignatureDate] = useState<Dayjs>(
        dayjs(new Date()),
      );
    const [expirationDate, setExpirationDate] = useState<Dayjs>(
        dayjs(new Date()),
      );
    const dispatch = useAppDispatch();
    const [fileUploadProgress,setFileUploadProgress] = useState(0)
    const [vendorModalOpen,setVendorModalOpen] = useState(false)
    const handleVendorModalOpen = ()=>setVendorModalOpen(true)
    const handleVendorModalClose = ()=>setVendorModalOpen(false)
  
    const {
      text:number ,
      inputBlurHandler:numberBlurHandler,
      textChangeHandler:numberChangeHandler,
      shouldDisplayError:numberShouldDisplayError,
      
    } = useInput();
    const {
      text:object ,
      inputBlurHandler:objectBlurHandler,
      textChangeHandler:objectChangeHandler,
      shouldDisplayError:objectShouldDisplayError,
  
    } = useInput();
 
   
    
  
    function nextBtnshouldBeDisabled():boolean{
      const bl =   Boolean(
     !done &&( 
      (activeStep === 0) && (
         number.length === 0 
      || object.length ===0 
      || !amount
      || numberShouldDisplayError
      || objectShouldDisplayError 

      )
      || (activeStep === 2) && (
  
        vendor == null
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
      const abortController = new AbortController();
      axiosPrivate.get("http://localhost:8080/api/directions",{
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
        console.log(res.data)
      })
      .catch(err=>{
        console.error(err)
        // if(err.code !== "ERR_CANCELED"){
        //   dispatch(showSnackbar({message:"verifiez si vous etes en ligne"}))
          
        // }
     
      })
      return ()=>{
        abortController.abort();
      }
    },[])
    const handleFileChange = (e:any)=>{
      e.preventDefault();
      setAgreementDocumentFile(e.target.files[0])
    }
     const handleSubmit = async()=>{
    
        if(agreementDocumentFile) setIsAgreementDocumentFileUploading(true)
        const formData = new FormData();
        formData.append("file",agreementDocumentFile)
        try{
          let res;
          if(agreementDocumentFile){
            setIsAgreementDocumentFileUploading(true);
            res = await axiosPrivate.post("http://localhost:8080/api/agreements/files/upload",formData,
           {
             onUploadProgress:(e)=>{
                 const {loaded,total} = e;
                 console.log(`${loaded} kbof ${total}`)
                 setFileUploadProgress(Math.floor((loaded/total)*100))
             },
             headers:{
               'Authorization':"Bearer "+JSON.parse(localStorage.getItem("jwt") ?? "" )?.access_token
             }
           })
  
          }
          let url =""
         if( res){
           console.log(res)
           setIsAgreementDocumentFileUploading(false);
           url = res.data.filename
         }
          const format = (d:Date)=>{
              
              return d.toISOString().replace(/T[0-9:.Z]*/g,"");

          }
          const newAgreement:CreateAgreement = {
              number,
              object,
              amount,
              url,
              directionId:selectedDirection.value,
              departementId:selectedDepartement.value,
              vendorId:vendor.id,
              signature_date:format(signatureDate.toDate()),
              expiration_date:format(expirationDate.toDate()),
              type
          }
          setLoading(true)
          await axiosPrivate.post(`http://localhost:8080/api/Agreements`,{
            ...newAgreement,
          })
  
          setLoading(false);
          setDone(true);
  
  
  
        }catch(err){
          console.error(err)
          setLoading(false)
          setIsAgreementDocumentFileUploading(false);
          setDone(false)
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
          <Typography className={styles.title}>{type === 'contract'?'Nouveau contrat':'Nouvelle convension'}</Typography>
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
                value={number} 
                onChange={numberChangeHandler}
                onBlur={numberBlurHandler}
                error={numberShouldDisplayError}
                helperText={numberShouldDisplayError && "min caracteres 5"}
                size="small" 
                label="numero"
            />
            <TextField 
              value={object}
              onChange={objectChangeHandler}
              onBlur={objectBlurHandler}
              error={objectShouldDisplayError}
              helperText={objectShouldDisplayError && "email non valide"}
              size="small" 
              label="Objet"
            /> 
            <TextField 
              value={amount}
              onChange={(e)=>setAmount(parseInt(e.target.value))}
              size="small" 
              label="montant"
              type="number"
              inputProps={{
                min:0,
                max:600
              }}
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
                <Stack direction="row" className={styles.headerContainer}>
                  
                  <Stack alignItems="center" gap={1}>
                      <Button className={styles.uploadButton}>
                         <label htmlFor='input-file-upload'>
                          <Avatar><UploadIcon color="primary"/></Avatar>
                          <input onChange={handleFileChange} id="input-file-upload" type="file" style={{display:"none"}}/>
                         </label>
                      </Button>
                   
                    <Typography sx = {{fontSize:"11px"}}>{agreementDocumentFile?.name?agreementDocumentFile?.name:"Associer un fichier"}</Typography>
                  </Stack>
                  
                 
                </Stack>
                <Stack direction="row" justifyContent="center" gap={3} sx={{marginTop:"10px"}}>
               
   
       
                    <MobileDatePicker
                    label="date de signature"
                    inputFormat="MM/DD/YYYY"
                    value={signatureDate}
                    onChange={(value)=>setSignatureDate(value ?? dayjs(""))}
                    renderInput={(params) => <TextField size="small" {...params} />}
                    />
      
                    <MobileDatePicker
                    label="date d'expiration"
                    inputFormat="MM/DD/YYYY"
                    value={expirationDate}
                    onChange={(value)=>setExpirationDate(value ?? dayjs(""))}
                    renderInput={(params) => <TextField size="small"  {...params} />}
                    />
     
    
                </Stack>
                <Stack direction="row" justifyContent="center" sx={{marginTop:"10px"}} >
                  <Button  onClick={()=>handleVendorModalOpen()}>
                  <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
                    <AddCircleIcon color="primary"/>
                    <Typography sx={{fontSize:"13px",textTransform:"initial"}}>{vendor?"Raison sociale: "+vendor.company_name:"aucun fournisseur selectionee"}</Typography>
                  </Stack>
                  </Button>
                </Stack>
              </>
            )
          }
  
  {
                  activeStep === 3 &&(
                      <>
                         { <Stack alignItems="center" gap={1}>
                            
                              {
                                 isAgreementDocumentFileUploading ?(<>
                                 {fileUploadProgress}
                                 <LinearProgress  variant="buffer"  valueBuffer={fileUploadProgress} value={fileUploadProgress} color="primary" sx={{width:"100%"}} />
                                 
                                 </>):(
                                    loading?(
                                      <>
                                      <Typography>Creation de  {type==='contract'?'contrat':"convension"}...</Typography>
                                      <CircularProgress/>
                                      </>
                                       
                                      
                                  ):(
                                    done?(
                                      <>
                                        <Typography>{type==='contract'?'contrat':"convension"} cree !</Typography>
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
            >{activeStep === 3?"Fermer":"Suivant"}</Button>
        </Stack>
        

        <Modal
          open={vendorModalOpen}
          onClose={handleVendorModalClose}
          
        >
          <SelectVendor 
            handleClose={handleVendorModalClose}
            selectVendor={(vendor:any)=>setVendor(vendor)}
          />
        </Modal>
       
      </div>
    )
  }

export default CreateContract