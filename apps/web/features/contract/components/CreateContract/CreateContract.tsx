'use client';
import styles from './CreateContract.module.css';
import { Avatar, Button, CircularProgress, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Step, StepLabel, Stepper, TextField, Typography, Modal } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/system';
import useInput from '@/hooks/input/use-input';
import UploadIcon from '@mui/icons-material/Upload';
import CheckIcon from '@mui/icons-material/Check';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SelectVendor from '@/features/contract/components/SelectVendor/SelectVendor';
import { CreateAgreement } from '@/features/contract/models/CreateAgreement.interface';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import ErrorIcon from '@mui/icons-material/Error';
import { useDirections } from '@/features/direction/queries/direction.queries';
import { useCreateAgreement, useUploadAgreementFile } from '@/features/contract/queries/contract.queries';

interface Proptype {
  handleClose: () => void;
  type?: 'contract' | 'convension';
}

const CreateContract = ({ handleClose, type = 'contract' }: Proptype) => {
  const steps = ['identifiants', 'direction , departement', 'fichier , date et Fournisseur', 'validation'];
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDirection, setSelectedDirection] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [selectedDepartement, setSelectedDepartement] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [agreementDocumentFile, setAgreementDocumentFile] = useState<any>(null);
  const [isAgreementDocumentFileUploading, setIsAgreementDocumentFileUploading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [vendor, setVendor] = useState<any>(null);
  const [signatureDate, setSignatureDate] = useState<Dayjs>(dayjs(new Date()));
  const [expirationDate, setExpirationDate] = useState<Dayjs>(dayjs(new Date()));
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  const { data: directions = [] } = useDirections();
  const { mutateAsync: uploadFile } = useUploadAgreementFile();
  const { mutate: createAgreement, isPending: loading, isSuccess: done } = useCreateAgreement();

  const { text: number, inputBlurHandler: numberBlurHandler, textChangeHandler: numberChangeHandler, shouldDisplayError: numberShouldDisplayError } = useInput();
  const { text: object, inputBlurHandler: objectBlurHandler, textChangeHandler: objectChangeHandler, shouldDisplayError: objectShouldDisplayError } = useInput();

  useEffect(() => {
    if (directions.length === 0) return;
    const direction = directions[Math.floor(Math.random() * (directions.length - 1))];
    setSelectedDirection({ label: direction?.title, value: direction.id });
    if (direction.departements.length === 0) return;
    const departement = direction.departements[Math.floor(Math.random() * (direction.departements.length - 1))];
    setSelectedDepartement({ label: departement?.title, value: departement.id as string });
  }, [directions.length]);

  function nextBtnshouldBeDisabled(): boolean {
    return Boolean(
      !done &&
        ((activeStep === 0 && (number.length === 0 || object.length === 0 || !amount || numberShouldDisplayError || objectShouldDisplayError)) ||
          (activeStep === 2 && vendor == null) ||
          (activeStep === 3 && loading)),
    );
  }

  const handleDirectionChange = (event: SelectChangeEvent) => {
    const directionId = event.target.value;
    const directionIndex = directions.findIndex((d) => d.id === directionId);
    if (directionIndex < 0) return;
    const direction = directions[directionIndex];
    setSelectedDirection({ label: direction?.title, value: directionId });
    if (direction.departements.length === 0) return;
    const departement = direction.departements[Math.floor(Math.random() * (direction.departements.length - 1))];
    setSelectedDepartement({ label: departement?.title, value: departement.id as string });
  };

  const handleChangeDepartement = (event: SelectChangeEvent) => {
    const departementId = event.target.value;
    const departements = getDepartementsFromDirections();
    const directionIndex = departements.findIndex((d) => d.id === departementId);
    const departement = departements[directionIndex];
    if (directionIndex < 0) return;
    setSelectedDepartement({ label: departement.title, value: departementId });
  };

  const handleFileChange = (e: any) => {
    e.preventDefault();
    setAgreementDocumentFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    let url = '';
    if (agreementDocumentFile) {
      setIsAgreementDocumentFileUploading(true);
      const res = await uploadFile({ file: agreementDocumentFile, onProgress: (p) => setFileUploadProgress(p) });
      url = res.filename;
      setIsAgreementDocumentFileUploading(false);
    }

    const format = (d: Date) => d.toISOString().replace(/T[0-9:.Z]*/g, '');
    const newAgreement: CreateAgreement = {
      number,
      object,
      amount,
      url,
      directionId: selectedDirection.value,
      departementId: selectedDepartement.value,
      vendorId: vendor.id,
      signature_date: format(signatureDate.toDate()),
      expiration_date: format(expirationDate.toDate()),
      type,
    };

    createAgreement(newAgreement, {
      onError: (err: any) => {
        setIsAgreementDocumentFileUploading(false);
        showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' });
      },
    });
  };

  const handleNextStep = () => {
    if (done) return;
    if (activeStep === 2) handleSubmit();
    setActiveStep((s) => (s + 1) % 4);
  };

  const handleStepLabel = (index: number) => {
    if (done) return;
    if (index === 3) handleSubmit();
    setActiveStep(index);
  };

  function getDepartementsFromDirections() {
    if (directions.length === 0) return [];
    const directionId = selectedDirection?.value;
    const directionIndex = directions.findIndex((d) => d.id === directionId);
    if (directionIndex < 0) return [];
    return directions[directionIndex].departements;
  }

  return (
    <div className={styles.container}>
      <Stack direction="row">
        <Typography className={styles.title}>{type === 'contract' ? 'Nouveau contrat' : 'Nouvelle convension'}</Typography>
      </Stack>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} onClick={() => !nextBtnshouldBeDisabled() && handleStepLabel(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Stack className={styles.inputsContainer}>
        {activeStep === 0 && (
          <>
            <TextField value={number} onChange={numberChangeHandler} onBlur={numberBlurHandler} error={numberShouldDisplayError} helperText={numberShouldDisplayError && 'min caracteres 5'} size="small" label="numero" />
            <TextField value={object} onChange={objectChangeHandler} onBlur={objectBlurHandler} error={objectShouldDisplayError} helperText={objectShouldDisplayError && 'email non valide'} size="small" label="Objet" />
            <TextField value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} size="small" label="montant" type="number" inputProps={{ min: 0, max: 600 }} />
          </>
        )}

        {activeStep === 1 && (
          <Stack direction="row" justifyContent="center" gap={3}>
            <FormControl className={styles.selectFormControl}>
              <InputLabel id="direction-input-label">Direction</InputLabel>
              <Select labelId="direction-label" id="direction-id" value={selectedDirection?.value ?? ''} label="direction" size="small" onChange={handleDirectionChange} fullWidth>
                {directions.map((dr, index) => (
                  <MenuItem value={dr?.id ?? ''} key={index}>{dr.abriviation ?? ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={styles.selectFormControl}>
              <InputLabel id="direction-input-label">Departement</InputLabel>
              <Select labelId="direction-label" id="direction-id" value={selectedDepartement?.value} label="direction" size="small" onChange={handleChangeDepartement} fullWidth>
                {getDepartementsFromDirections().map((dp, index) => (
                  <MenuItem value={dp?.id} key={index}>{dp?.abriviation}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {activeStep === 2 && (
          <>
            <Stack direction="row" className={styles.headerContainer}>
              <Stack alignItems="center" gap={1}>
                <Button className={styles.uploadButton}>
                  <label htmlFor="input-file-upload">
                    <Avatar><UploadIcon color="primary" /></Avatar>
                    <input onChange={handleFileChange} id="input-file-upload" type="file" style={{ display: 'none' }} />
                  </label>
                </Button>
                <Typography sx={{ fontSize: '11px' }}>{agreementDocumentFile?.name ? agreementDocumentFile?.name : 'Associer un fichier'}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="center" gap={3} sx={{ marginTop: '10px' }}>
              <MobileDatePicker label="date de signature" inputFormat="MM/DD/YYYY" value={signatureDate} onChange={(value) => setSignatureDate(value ?? dayjs(''))} renderInput={(params) => <TextField size="small" {...params} />} />
              <MobileDatePicker label="date d'expiration" inputFormat="MM/DD/YYYY" value={expirationDate} onChange={(value) => setExpirationDate(value ?? dayjs(''))} renderInput={(params) => <TextField size="small" {...params} />} />
            </Stack>
            <Stack direction="row" justifyContent="center" sx={{ marginTop: '10px' }}>
              <Button onClick={() => setVendorModalOpen(true)}>
                <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
                  <AddCircleIcon color="primary" />
                  <Typography sx={{ fontSize: '13px', textTransform: 'initial' }}>{vendor ? 'Raison sociale: ' + vendor.company_name : 'aucun fournisseur selectionee'}</Typography>
                </Stack>
              </Button>
            </Stack>
          </>
        )}

        {activeStep === 3 && (
          <Stack alignItems="center" gap={1}>
            {isAgreementDocumentFileUploading ? (
              <>
                {fileUploadProgress}
                <LinearProgress variant="buffer" valueBuffer={fileUploadProgress} value={fileUploadProgress} color="primary" sx={{ width: '100%' }} />
              </>
            ) : loading ? (
              <>
                <Typography>Creation de {type === 'contract' ? 'contrat' : 'convension'}...</Typography>
                <CircularProgress />
              </>
            ) : done ? (
              <>
                <Typography>{type === 'contract' ? 'contrat' : 'convension'} cree !</Typography>
                <Fab aria-label="save" color="secondary" size="small" sx={{ boxShadow: 'none' }}>
                  <CheckIcon sx={{ color: 'white' }} />
                </Fab>
              </>
            ) : (
              <>
                <Typography>Erreur!</Typography>
                <Fab aria-label="save" color="secondary" size="small" sx={{ boxShadow: 'none' }}>
                  <ErrorIcon sx={{ color: 'white' }} />
                </Fab>
              </>
            )}
          </Stack>
        )}
      </Stack>
      <Stack direction="row" className={styles.actionButtons}>
        <Button disabled={activeStep === 0 || done}>Precedent</Button>
        <Button disabled={nextBtnshouldBeDisabled()} onClick={() => (activeStep !== 3 ? handleNextStep() : handleClose())}>
          {activeStep === 3 ? 'Fermer' : 'Suivant'}
        </Button>
      </Stack>

      <Modal open={vendorModalOpen} onClose={() => setVendorModalOpen(false)}>
        <SelectVendor handleClose={() => setVendorModalOpen(false)} selectVendor={(v: any) => setVendor(v)} />
      </Modal>
    </div>
  );
};

export default CreateContract;
