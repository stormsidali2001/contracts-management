'use client';
import { Accordion, AccordionDetails, AccordionSummary, Button, Modal } from '@mui/material';
import styles from './DirectionContent.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useState } from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CreateDepartement from '@/features/direction/components/CreateDepartement/CreateDepartement';
import CreateDirection from '@/features/direction/components/CreateDirection/CreateDirection';
import DeleteDirectionModal from '@/features/direction/components/DeleteDirectionModal/DeleteDirectionModal';
import { useAppDispatch, useAppSelector } from '@/hooks/redux/hooks';
import { showSnackbar } from '@/features/ui/UiSlice';
import { UserRole } from '@/features/auth/models/user-role.enum';
import DepartementUsersList from '@/features/direction/components/DepartementUsersList/DepartementUsersList';
import { useDirections, useDeleteDirection, useDeleteDepartement } from '@/features/direction/queries/direction.queries';
import { Direction } from '@/features/direction/models/direction.interface';

/** Returns the 1–2 letter abbreviation for the direction icon */
const dirAbbr = (title: string) => {
  const words = title.trim().split(/\s+/).filter(w => !['de', 'du', 'des', 'la', 'le', 'les', 'd\''].includes(w.toLowerCase()));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
};

const DirectionContent = () => {
  const [openDepartementUsers, setOpenDepartementUsers] = useState(false);
  const [choosenDepartementId, setChoosenDepartementId] = useState('');
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { data: directions = [] } = useDirections();
  const { mutate: deleteDirection } = useDeleteDirection();
  const { mutate: deleteDepartement } = useDeleteDepartement();

  const totalDepts = directions.reduce((sum, d) => sum + (d.departements?.length ?? 0), 0);
  const totalUsers = directions.reduce((sum, d) => sum + (d.departements?.reduce((s: number, dept: any) => s + (dept.users ?? 0), 0) ?? 0), 0);

  const [openDepartementModal, setOpenDepartementModal] = useState(false);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null);
  const [openDirectionModal, setOpenDirectionModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Direction | null>(null);

  const handleDeleteDepartement = (id: string) => {
    deleteDepartement(id, {
      onSuccess: () => dispatch(showSnackbar({ message: 'la suppression de departement a reusi', severty: 'success' })),
      onError: (err: any) => dispatch(showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' })),
    });
  };

  const handleDeleteDirection = (directionId: string) => {
    deleteDirection(directionId, {
      onSuccess: () => {
        dispatch(showSnackbar({ message: 'La direction a été supprimée avec succès', severty: 'success' }));
        setDeleteTarget(null);
      },
      onError: (err: any) => dispatch(showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' })),
    });
  };

  const dispalayIfAdmin = () => {
    if (!user) return false;
    return user.role === UserRole.ADMIN;
  };

  const [choosenDepartementName, setChoosenDepartementName] = useState('');

  const handleShowDepartementUsers = (departementId: string, departementName?: string) => {
    setOpenDepartementUsers(true);
    setChoosenDepartementId(departementId);
    setChoosenDepartementName(departementName ?? '');
  };

  return (
    <div className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Directions & Départements</h1>
          <span className={styles.pageSubtitle}>Gérez la structure organisationnelle de votre entreprise</span>
        </div>
        {dispalayIfAdmin() && (
          <Button
            aria-label="Créer une direction"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenDirectionModal(true)}
            variant="contained"
            color="primary"
            className={styles.pageAddButton}
            size="small"
          >
            Nouvelle direction
          </Button>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><AccountTreeOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{directions.length}</span>
            <span className={styles.statLabel}>Directions</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><ApartmentOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalDepts}</span>
            <span className={styles.statLabel}>Départements</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><PeopleOutlineIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalUsers}</span>
            <span className={styles.statLabel}>Utilisateurs</span>
          </div>
        </div>
      </div>

      <div className={styles.wrapperBox}>
        {/* ── Card header ── */}
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Directions</span>
            {directions.length > 0 && <span className={styles.cardCount}>{directions.length} au total</span>}
          </div>
        </div>

        {/* ── Directions list ── */}
        <div className={styles.directionsWrapper}>
          {directions.map((direction, index) => (
            <Accordion
              key={index}
              defaultExpanded={index === 0}
              disableGutters
              className={styles.directionCard}
              sx={{
                '&.MuiAccordion-root': { margin: 0 },
                '& .MuiAccordionSummary-root': {
                  minHeight: 56,
                  px: '16px',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s',
                },
                '& .MuiAccordionSummary-root.Mui-expanded': {
                  backgroundColor: 'rgba(23,73,142,0.03)',
                  borderBottom: '1px solid var(--border-subtle, #D4DCE8)',
                },
                '& .MuiAccordionSummary-content': { margin: '10px 0' },
                '& .MuiAccordionDetails-root': { px: '16px', pb: '16px', backgroundColor: '#fff' },
                '&.Mui-expanded': { borderColor: 'var(--navy-mid, #17498E) !important' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-muted, #96A3B5)', fontSize: 20 }} />}
              >
                <div className={styles.accordionRow}>
                  <div className={styles.accordionLeft}>
                    <div className={styles.directionIcon}>{dirAbbr(direction?.title ?? '')}</div>
                    <span className={styles.directionTitle}>{direction?.title}</span>
                    {direction?.departements?.length > 0 && (
                      <span className={styles.deptCountBadge}>
                        {direction.departements.length} dept{direction.departements.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className={styles.accordionRight}>
                    {dispalayIfAdmin() && (
                      <Button
                        aria-label="Supprimer la direction"
                        className={styles.deleteBtn}
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(direction); }}
                        size="small"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div className={styles.deptSection}>
                  {/* Sub-header */}
                  <div className={styles.deptHeader}>
                    <div className={styles.deptHeaderLeft}>
                      <span className={styles.deptTitle}>Départements</span>
                      {(direction?.departements?.length ?? 0) > 0 && (
                        <span className={styles.deptCount}>{direction.departements.length}</span>
                      )}
                    </div>
                    {dispalayIfAdmin() && (
                      <Button
                        aria-label="Créer un département"
                        className={styles.addDeptBtn}
                        startIcon={<AddCircleIcon sx={{ fontSize: 15 }} />}
                        onClick={() => { setOpenDepartementModal(true); setSelectedDirectionId(direction.id); }}
                        size="small"
                        variant="outlined"
                      >
                        Ajouter
                      </Button>
                    )}
                  </div>

                  {/* Departments table */}
                  {(direction?.departements?.length ?? 0) === 0 ? (
                    <div className={styles.emptyDepts}>Aucun département</div>
                  ) : (
                    <table className={styles.deptTable}>
                      <thead>
                        <tr>
                          <th>Titre</th>
                          <th>Mnémonique</th>
                          <th>Utilisateurs</th>
                          <th className={styles.center}>Détails</th>
                          {dispalayIfAdmin() && <th className={styles.center}>Supprimer</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {direction?.departements?.map((row, i) => (
                          <tr key={i}>
                            <td>{row.title}</td>
                            <td><span className={styles.mnemonic}>{row.abriviation}</span></td>
                            <td>
                              <span className={styles.userCount}>
                                <PeopleAltOutlinedIcon sx={{ fontSize: 14, opacity: 0.55 }} />
                                {row.users}
                              </span>
                            </td>
                            <td className={styles.center}>
                              <Button className={styles.detailsBtn} onClick={() => handleShowDepartementUsers(row?.id ?? '', row?.title)}>
                                Détails
                              </Button>
                            </td>
                            {dispalayIfAdmin() && (
                              <td className={styles.center}>
                                <Button
                                  aria-label="Supprimer le département"
                                  className={styles.deleteBtn}
                                  onClick={() => handleDeleteDepartement(row?.id ?? '')}
                                  size="small"
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>

      <Modal open={openDepartementModal} onClose={() => setOpenDepartementModal(false)}>
        <CreateDepartement
          selectedDirectionId={selectedDirectionId}
          handleCloseDepartementModal={() => setOpenDepartementModal(false)}
          pushDepartementToDirection={() => {}}
        />
      </Modal>

      <Modal open={openDirectionModal} onClose={() => setOpenDirectionModal(false)}>
        <CreateDirection pushDirection={() => {}} handleDirectionModalClose={() => setOpenDirectionModal(false)} />
      </Modal>

      <Modal open={openDepartementUsers} onClose={() => setOpenDepartementUsers(false)}>
        <DepartementUsersList departementId={choosenDepartementId} departementName={choosenDepartementName} handleClose={() => setOpenDepartementUsers(false)} />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget ? (
          <DeleteDirectionModal
            direction={deleteTarget}
            onConfirm={() => handleDeleteDirection(deleteTarget.id ?? '')}
            onCancel={() => setDeleteTarget(null)}
          />
        ) : <></>}
      </Modal>
    </div>
  );
};

export default DirectionContent;
