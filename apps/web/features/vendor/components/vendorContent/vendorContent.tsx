'use client';

import styles from './vendorContent.module.css';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CircularProgress, Modal } from '@mui/material';
import AgreementList from '@/features/vendor/components/AgreementList/AgreementList';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { UserRole } from '@/features/auth/models/user-role.enum';
import { useVendor, useUpdateVendor } from '@/features/vendor/queries/vendor.queries';
import Link from 'next/link';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';

const VendorContent = () => {
  const user = useAuthStore((s) => s.user);
  const [editMode, setEditMode] = useState(false);
  const params = useParams();
  const vendorId = params.vendorId as string | undefined;
  const [localVendor, setLocalVendor] = useState<any>(null);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const handleContractModaOpen  = () => setContractModalOpen(true);
  const handleContractModalClose = () => setContractModalOpen(false);
  const [modalType, setModalType] = useState<'contract' | 'convension'>('contract');

  const { data: vendor } = useVendor(vendorId);
  const { mutate: updateVendor, isPending: loading } = useUpdateVendor();

  const displayVendor = localVendor ?? vendor;

  // ── All hooks must be called unconditionally before any early return ──
  const { data: statsData } = useStatistics();

  const handleShowContract  = () => { setModalType('contract');   handleContractModaOpen(); };
  const handleShowConvension = () => { setModalType('convension'); handleContractModaOpen(); };

  if (!displayVendor) return (
    <div className={styles.loadingState}>
      <div className={styles.loadingPulse} />
    </div>
  );

  const totalContracts   = statsData?.agreementsStats?.types?.contract   ?? null;
  const totalConvensions = statsData?.agreementsStats?.types?.convension ?? null;

  const contractCount   = displayVendor?.contractCount   ?? 0;
  const convensionCount = displayVendor?.convensionCount ?? 0;

  const setVendorProperty = (key: string, value: any) =>
    setLocalVendor((v: object) => ({ ...(v ?? displayVendor), [key]: value }));

  const handleSubmit = () => {
    updateVendor(
      { id: displayVendor.id, ...displayVendor },
      {
        onSuccess: () => { setEditMode(false); setLocalVendor(null); showSnackbar({ message: 'le fournisseur a été mis à jour', severty: 'success' }); },
        onError:   (err: any) => { setEditMode(false); showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' }); },
      },
    );
  };

  const showDisplayEdit = () => user?.role === UserRole.JURIDICAL;

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/vendors" className={styles.backLink}>
            <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
            <span>Fournisseurs</span>
          </Link>
          <div className={styles.pageHeaderTitle}>
            <h1 className={styles.pageTitle}>{displayVendor?.company_name}</h1>
            <span className={styles.vendorBadge}>Fournisseur</span>
            <span className={styles.numBadge}>{displayVendor?.num}</span>
          </div>
        </div>
        {showDisplayEdit() && (
          <div className={styles.pageHeaderActions}>
            {editMode ? (
              <button className={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon sx={{ fontSize: 15 }} />}
                Sauvegarder
              </button>
            ) : (
              <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                <EditIcon sx={{ fontSize: 15 }} />
                Modifier
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className={styles.container}>

        {/* ══ Left: vendor detail card ══ */}
        <div className={styles.left}>
          <div className={styles.vendorCard}>

            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.headerIconWrap}>
                <StorefrontOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div className={styles.headerText}>
                <span className={styles.vendorTitle}>{displayVendor?.company_name}</span>
                <span className={styles.labelText}>{displayVendor?.num}</span>
              </div>
            </div>

            {/* Field grid */}
            <div className={styles.content}>

              <div className={`${styles.vendorContentItem} ${styles.spanTwo}`}>
                <div className={styles.fieldLabel}>
                  <BusinessOutlinedIcon sx={{ fontSize: 12 }} />
                  Raison sociale
                </div>
                <Field edit={editMode} value={displayVendor?.company_name ?? ''} onChange={(e: any) => setVendorProperty('company_name', e.target.value)} />
              </div>

              <div className={styles.vendorContentItem}>
                <div className={styles.fieldLabel}>
                  <FingerprintOutlinedIcon sx={{ fontSize: 12 }} />
                  NIF
                </div>
                <Field edit={editMode} value={displayVendor?.nif ?? ''} onChange={(e: any) => setVendorProperty('nif', e.target.value)} />
              </div>

              <div className={styles.vendorContentItem}>
                <div className={styles.fieldLabel}>
                  <AssignmentIndOutlinedIcon sx={{ fontSize: 12 }} />
                  NRC
                </div>
                <Field edit={editMode} value={displayVendor?.nrc ?? ''} onChange={(e: any) => setVendorProperty('nrc', e.target.value)} />
              </div>

              <div className={styles.vendorContentItem}>
                <div className={styles.fieldLabel}>
                  <PhoneAndroidOutlinedIcon sx={{ fontSize: 12 }} />
                  Mobile
                </div>
                <Field edit={editMode} value={displayVendor?.mobile_phone_number ?? ''} onChange={(e: any) => setVendorProperty('mobile_phone_number', e.target.value)} />
              </div>

              <div className={styles.vendorContentItem}>
                <div className={styles.fieldLabel}>
                  <PhoneOutlinedIcon sx={{ fontSize: 12 }} />
                  Fixe
                </div>
                <Field edit={editMode} value={displayVendor?.home_phone_number ?? ''} onChange={(e: any) => setVendorProperty('home_phone_number', e.target.value)} />
              </div>

              <div className={`${styles.vendorContentItem} ${styles.spanTwo}`}>
                <div className={styles.fieldLabel}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 12 }} />
                  Adresse
                </div>
                <Field edit={editMode} value={displayVendor?.address ?? ''} onChange={(e: any) => setVendorProperty('address', e.target.value)} />
              </div>

            </div>
          </div>
        </div>

        {/* ══ Right: agreement stat cards ══ */}
        <div className={styles.right}>

          {/* Contracts */}
          <div className={styles.agreementCard}>
            <div className={styles.agreementCardHeader}>
              <div className={styles.agreementHeaderIcon}>
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
              </div>
              <div className={styles.agreementHeaderText}>
                <span className={styles.agreementHeaderTitle}>Contrats</span>
                <span className={styles.agreementHeaderSub}>Accords commerciaux</span>
              </div>
            </div>
            <div className={styles.agreementCardBody}>
              <div className={styles.agreementCountRow}>
                <span className={styles.agreementCount}>{contractCount}</span>
                <span className={styles.agreementCountLabel}>
                  contrat{contractCount !== 1 ? 's' : ''}<br />
                  <span className={styles.agreementCountSub}>lié{contractCount !== 1 ? 's' : ''} à ce fournisseur</span>
                </span>
              </div>
              <div className={styles.agreementMeta}>
                <div className={styles.agreementMetaBar}>
                  <div
                    className={styles.agreementMetaFill}
                    style={{ width: totalContracts ? `${Math.round((contractCount / totalContracts) * 100)}%` : '0%' }}
                  />
                </div>
                <span className={styles.agreementMetaLabel}>
                  {totalContracts != null
                    ? `${contractCount} sur ${totalContracts} contrat${totalContracts !== 1 ? 's' : ''} au total`
                    : contractCount === 0 ? 'Aucun contrat enregistré' : `${contractCount} contrat${contractCount !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>
            <button className={styles.agreementCta} onClick={handleShowContract} disabled={contractCount === 0}>
              <span>Voir les contrats</span>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Conventions */}
          <div className={styles.agreementCard}>
            <div className={styles.agreementCardHeader}>
              <div className={styles.agreementHeaderIcon}>
                <HandshakeOutlinedIcon sx={{ fontSize: 16 }} />
              </div>
              <div className={styles.agreementHeaderText}>
                <span className={styles.agreementHeaderTitle}>Conventions</span>
                <span className={styles.agreementHeaderSub}>Accords de partenariat</span>
              </div>
            </div>
            <div className={styles.agreementCardBody}>
              <div className={styles.agreementCountRow}>
                <span className={styles.agreementCount}>{convensionCount}</span>
                <span className={styles.agreementCountLabel}>
                  convention{convensionCount !== 1 ? 's' : ''}<br />
                  <span className={styles.agreementCountSub}>liée{convensionCount !== 1 ? 's' : ''} à ce fournisseur</span>
                </span>
              </div>
              <div className={styles.agreementMeta}>
                <div className={styles.agreementMetaBar}>
                  <div
                    className={styles.agreementMetaFill}
                    style={{ width: totalConvensions ? `${Math.round((convensionCount / totalConvensions) * 100)}%` : '0%' }}
                  />
                </div>
                <span className={styles.agreementMetaLabel}>
                  {totalConvensions != null
                    ? `${convensionCount} sur ${totalConvensions} convention${totalConvensions !== 1 ? 's' : ''} au total`
                    : convensionCount === 0 ? 'Aucune convention enregistrée' : `${convensionCount} convention${convensionCount !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>
            <button className={styles.agreementCta} onClick={handleShowConvension} disabled={convensionCount === 0}>
              <span>Voir les conventions</span>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </button>
          </div>

        </div>
      </div>

      <Modal open={contractModalOpen} onClose={handleContractModalClose}>
        <AgreementList vendorId={displayVendor?.id} type={modalType} handleClose={handleContractModalClose} />
      </Modal>
    </div>
  );
};

function Field({ edit, value, onChange }: any) {
  return (
    <>
      {edit
        ? <input type="text" className={styles.editInput} value={value} onChange={onChange} />
        : <span className={styles.vendorValueItem}>{value || '—'}</span>
      }
    </>
  );
}

export default VendorContent;
