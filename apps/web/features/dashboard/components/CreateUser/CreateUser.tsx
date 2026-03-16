'use client';
import { CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import useInput from '@/hooks/input/use-input';
import { validateEmail } from '@/shared/utils/validation/email';
import { validateFirstName, validateLastName } from '@/shared/utils/validation/length';
import CheckIcon from '@mui/icons-material/Check';
import styles from './CreateUser.module.css';
import LinearProgress from '@mui/material/LinearProgress';
import { CreateUser as CreateUserPayload } from '@/features/dashboard/models/CreateUser.interface';
import { useAppDispatch } from '@/hooks/redux/hooks';
import { showSnackbar } from '@/features/ui/UiSlice';
import { useDirections } from '@/features/direction/queries/direction.queries';
import { useCreateUser, useUploadUserImage } from '@/features/user/queries/user.queries';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface Proptype {
  handleClose: () => void;
}

const STEP_META = [
  { title: 'Identifiants',  subtitle: 'Nom, prénom et adresse email', Icon: PersonOutlinedIcon        },
  { title: 'Profil',        subtitle: 'Photo de profil et rôle',       Icon: BadgeOutlinedIcon         },
  { title: 'Direction',     subtitle: 'Direction et département',       Icon: AccountTreeOutlinedIcon   },
  { title: 'Validation',    subtitle: 'Création du compte',             Icon: HowToRegOutlinedIcon      },
];

const ROLES = [
  { value: 'EMPLOYEE',  label: 'Employé',   desc: 'Accès standard',   Icon: BadgeOutlinedIcon                },
  { value: 'ADMIN',     label: 'Admin',      desc: 'Accès complet',    Icon: AdminPanelSettingsOutlinedIcon   },
  { value: 'JURIDICAL', label: 'Juridique',  desc: 'Gestion contrats', Icon: GavelOutlinedIcon                },
];

const ROLE_LABELS: Record<string, string> = { EMPLOYEE: 'Employé', ADMIN: 'Admin', JURIDICAL: 'Juridique' };

const CreateUser = ({ handleClose }: Proptype) => {
  const steps = ['identifiants', 'role et photo de profile', 'direction , departement', 'validation'];
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDirection, setSelectedDirection] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [selectedDepartement, setSelectedDepartement] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [profilImgFile, setProfileImageFile] = useState<any>(null);
  const [profileImgPreview, setProfileImgPreview] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [role, setRole] = useState<string>('EMPLOYEE');
  const dispatch = useAppDispatch();

  const { data: directions = [] } = useDirections();
  const { mutateAsync: uploadImage } = useUploadUserImage();
  const { mutate: createUser, isPending: loading, isSuccess: done } = useCreateUser();

  const { text: firstName, inputBlurHandler: firstNameBlurHandler, textChangeHandler: firstNameChangeHandler, shouldDisplayError: firstNameShouldDisplayError } = useInput(validateFirstName);
  const { text: lastName,  inputBlurHandler: lastNameBlurHandler,  textChangeHandler: lastNameChangeHandler,  shouldDisplayError: lastNameShouldDisplayError  } = useInput(validateLastName);
  const { text: email,     inputBlurHandler: emailBlurHandler,     textChangeHandler: emailChangeHandler,     shouldDisplayError: emailShouldDisplayError     } = useInput(validateEmail);

  useEffect(() => {
    if (directions.length === 0) return;
    const direction = directions[Math.floor(Math.random() * directions.length)];
    setSelectedDirection({ label: direction?.title, value: direction.id });
    if (direction.departements.length === 0) return;
    const departement = direction.departements[Math.floor(Math.random() * direction.departements.length)];
    setSelectedDepartement({ label: departement?.title, value: departement.id as string });
  }, [directions.length]);

  useEffect(() => {
    if (!profilImgFile) return;
    const objectUrl = URL.createObjectURL(profilImgFile);
    setProfileImgPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilImgFile]);

  function nextBtnshouldBeDisabled(): boolean {
    return Boolean(
      !done &&
        ((activeStep === 0 && (email.length === 0 || firstName.length === 0 || lastName.length === 0 || firstNameShouldDisplayError || lastNameShouldDisplayError || emailShouldDisplayError)) ||
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
    setProfileImageFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    let imageUrl = '';
    if (profilImgFile) {
      setIsImageUploading(true);
      const res = await uploadImage({ file: profilImgFile, onProgress: (p) => setImageUploadProgress(p) });
      imageUrl = res.filename;
      setIsImageUploading(false);
    }

    const isExeptionRoles = (value: string) => ['ADMIN', 'JURIDICAL'].some((el) => el === value);
    const newUser: CreateUserPayload = {
      email, firstName, lastName, imageUrl, role,
      directionId:   isExeptionRoles(role) ? null : selectedDirection.value,
      departementId: isExeptionRoles(role) ? null : selectedDepartement.value,
    };

    createUser(newUser, {
      onSuccess: () => dispatch(showSnackbar({ message: "l'utilisateur a eté creé avec success.", severty: 'success' })),
      onError:   (err: any) => dispatch(showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' })),
    });
  };

  const handleNextStep = () => {
    if (done) return;
    if (activeStep === 1 && (role === 'ADMIN' || role === 'JURIDICAL')) {
      handleSubmit();
      setActiveStep((s) => (s + 2) % 4);
      return;
    }
    if (activeStep === 2) handleSubmit();
    setActiveStep((s) => (s + 1) % 4);
  };

  const handlePrevStep = () => {
    setActiveStep((s) => Math.max(0, s - 1));
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

  const meta = STEP_META[activeStep];
  const HeaderIcon = meta.Icon;

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <HeaderIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>{meta.title}</span>
            <span className={styles.headerSubtitle}>{meta.subtitle}</span>
          </div>
        </div>
        <div className={styles.headerStep}>
          <span className={styles.headerStepNum}>{activeStep + 1}</span>
          <span className={styles.headerStepOf}>/ {steps.length}</span>
        </div>
      </div>

      {/* ── Custom stepper ── */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperRow}>
          {steps.map((_, index) => (
            <>
              <div
                key={index}
                className={`${styles.step} ${index === activeStep ? styles.stepActive : ''} ${index < activeStep ? styles.stepDone : ''}`}
                onClick={() => !nextBtnshouldBeDisabled() && handleStepLabel(index)}
              >
                <div className={styles.stepCircle}>
                  {index < activeStep
                    ? <CheckIcon sx={{ fontSize: 13 }} />
                    : <span>{index + 1}</span>
                  }
                </div>
                <span className={styles.stepLabel}>{STEP_META[index].title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.stepLine} ${index < activeStep ? styles.stepLineDone : ''}`} key={`line-${index}`} />
              )}
            </>
          ))}
        </div>
      </div>

      {/* ── Step body ── */}
      <div className={styles.body}>

        {/* Step 0 — Identifiants */}
        {activeStep === 0 && (
          <div className={styles.fieldGroup}>
            <p className={styles.stepHint}>Renseignez les informations d'identification du nouveau compte.</p>
            <TextField
              value={firstName} onChange={firstNameChangeHandler} onBlur={firstNameBlurHandler}
              error={firstNameShouldDisplayError} helperText={firstNameShouldDisplayError && 'Minimum 5 caractères'}
              size="small" label="Nom" fullWidth
            />
            <TextField
              value={lastName} onChange={lastNameChangeHandler} onBlur={lastNameBlurHandler}
              error={lastNameShouldDisplayError} helperText={lastNameShouldDisplayError && 'Minimum 5 caractères'}
              size="small" label="Prénom" fullWidth
            />
            <TextField
              value={email} onChange={emailChangeHandler} onBlur={emailBlurHandler}
              error={emailShouldDisplayError} helperText={emailShouldDisplayError && 'Adresse email non valide'}
              size="small" label="Email" type="email" fullWidth
            />
          </div>
        )}

        {/* Step 1 — Profil + Rôle */}
        {activeStep === 1 && (
          <div className={styles.profileStep}>
            <div className={styles.profileTopRow}>
              {/* Upload zone */}
              <label htmlFor="input-file-upload" className={styles.uploadZone}>
                {profileImgPreview
                  ? <img src={profileImgPreview} alt="Preview" className={styles.uploadPreviewImg} />
                  : (
                    <>
                      <CloudUploadOutlinedIcon sx={{ fontSize: 26 }} />
                      <span>Photo</span>
                    </>
                  )
                }
                <input onChange={handleFileChange} id="input-file-upload" type="file" style={{ display: 'none' }} />
              </label>

              {/* Preview card */}
              <div className={styles.profilePreview}>
                <div className={styles.profilePreviewAvatar}>
                  <img src={profileImgPreview || '/blank-profile-picture.png'} alt="Profil" />
                </div>
                <div className={styles.profilePreviewInfo}>
                  <span className={styles.profilePreviewName}>{firstName} {lastName}</span>
                  <span className={styles.profilePreviewRole}>{ROLE_LABELS[role] ?? role}</span>
                  <span className={styles.profilePreviewEmail}>{email}</span>
                </div>
              </div>
            </div>

            {/* Role cards */}
            <div className={styles.roleSectionLabel}>Sélectionner un rôle</div>
            <div className={styles.roleCards}>
              {ROLES.map(({ value, label, desc, Icon }) => (
                <div
                  key={value}
                  className={`${styles.roleCard} ${role === value ? styles.roleCardActive : ''}`}
                  onClick={() => setRole(value)}
                >
                  <div className={styles.roleCardIcon}><Icon sx={{ fontSize: 20 }} /></div>
                  <span className={styles.roleCardLabel}>{label}</span>
                  <span className={styles.roleCardDesc}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Direction + Département */}
        {activeStep === 2 && (
          <div className={styles.directionStep}>
            <p className={styles.stepHint}>Associez l'utilisateur à une direction et un département.</p>
            <FormControl fullWidth size="small">
              <InputLabel id="direction-input-label">Direction</InputLabel>
              <Select labelId="direction-label" id="direction-id" value={selectedDirection?.value ?? ''} label="Direction" onChange={handleDirectionChange}>
                {directions.map((dr, index) => (
                  <MenuItem value={dr?.id ?? ''} key={index}>{dr.abriviation ?? ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="departement-input-label">Département</InputLabel>
              <Select labelId="departement-label" id="departement-id" value={selectedDepartement?.value} label="Département" onChange={handleChangeDepartement}>
                {getDepartementsFromDirections().map((dp, index) => (
                  <MenuItem value={dp?.id} key={index}>{dp?.abriviation}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Step 3 — Validation / Result */}
        {activeStep === 3 && (
          <div className={styles.validationStep}>
            {isImageUploading ? (
              <>
                <div className={styles.statusIcon} style={{ background: 'rgba(23,73,142,0.08)' }}>
                  <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: 'var(--navy-mid)' }} />
                </div>
                <span className={styles.statusTitle}>Upload de l'image…</span>
                <div className={styles.progressWrap}>
                  <LinearProgress variant="buffer" valueBuffer={imageUploadProgress} value={imageUploadProgress} color="primary" />
                  <span className={styles.progressLabel}>{imageUploadProgress}%</span>
                </div>
              </>
            ) : loading ? (
              <>
                <CircularProgress size={48} thickness={3} sx={{ color: 'var(--navy-mid)' }} />
                <span className={styles.statusTitle}>Création en cours…</span>
                <span className={styles.statusSubtitle}>Veuillez patienter</span>
              </>
            ) : done ? (
              <>
                <div className={`${styles.statusIcon} ${styles.statusIconSuccess}`}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />
                </div>
                <span className={styles.statusTitle}>Compte créé !</span>
                <span className={styles.statusSubtitle}>{firstName} {lastName} a été ajouté avec succès.</span>
              </>
            ) : (
              <>
                <div className={`${styles.statusIcon} ${styles.statusIconError}`}>
                  <ErrorOutlineIcon sx={{ fontSize: 36 }} />
                </div>
                <span className={styles.statusTitle}>Une erreur est survenue</span>
                <span className={styles.statusSubtitle}>Veuillez réessayer ou contacter l'administrateur.</span>
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Action row ── */}
      <div className={styles.actionRow}>
        <button
          className={styles.backBtn}
          disabled={activeStep === 0 || done}
          onClick={handlePrevStep}
        >
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
          Précédent
        </button>
        <button
          className={styles.nextBtn}
          disabled={nextBtnshouldBeDisabled()}
          onClick={() => activeStep !== 3 ? handleNextStep() : handleClose()}
        >
          {activeStep === 3 ? 'Fermer' : 'Suivant'}
          {activeStep !== 3 && <ChevronRightIcon sx={{ fontSize: 16 }} />}
        </button>
      </div>
    </div>
  );
};

export default CreateUser;
