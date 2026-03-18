'use client';

import { Avatar, Button, CircularProgress, LinearProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import styles from './UserProfile.module.css';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Stack } from '@mui/system';
import { UserRole } from '@/features/auth/models/user-role.enum';
import { useUser, useUpdateUser, useUploadUserImage } from '@/features/user/queries/user.queries';
import { BASE_URL } from '@/api/axios';

const UserProfile = () => {
  const currentUser = useAuthStore((s) => s.user);
  const connectedUser = currentUser;
  const params = useParams();
  const userId = params.userId as string | undefined;

  const [edit, setEdit] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState('/blank-profile-picture.png');
  const [imageFile, setImageFile] = useState<any>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const setImageUrl = useAuthStore((s) => s.setImageUrl);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const { data: fetchedUser } = useUser(userId);
  const { mutate: updateUser, isPending: loading } = useUpdateUser();
  const { mutateAsync: uploadImage, isPending: isImageUploading } = useUploadUserImage();

  useEffect(() => {
    if (fetchedUser) setLocalUser(fetchedUser);
  }, [fetchedUser]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const setUserProperty = (key: string, value: any) => setLocalUser((u: object) => ({ ...u, [key]: value }));

  const handleSubmit = async () => {
    let imageUrl = '';
    if (imageFile) {
      const res = await uploadImage({ file: imageFile, onProgress: (p) => setImageUploadProgress(p) });
      imageUrl = res.filename;
    }

    updateUser(
      {
        id: localUser.id,
        email: localUser.email,
        username: localUser.username,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
        ...(imageUrl && { imageUrl }),
      },
      {
        onSuccess: () => {
          if (imageUrl.length > 0) {
            if (currentUser?.sub === localUser.id) {
              setImageUrl(imageUrl);
            }
            setLocalUser({ ...localUser, imageUrl });
          }
          setEdit(false);
        },
        onError: (err: any) => {
          showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' });
          setEdit(false);
        },
      },
    );
  };

  const handleFileChange = (e: any) => {
    if (!e.target.files) return;
    if (e.target.files.length === 0) return;
    setImageFile(e.target.files[0]);
  };

  const canEditUser = () => {
    return connectedUser?.role === UserRole.ADMIN || connectedUser?.sub === localUser?.id;
  };

  if (!localUser) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.userCard}>
          <div className={styles.cardHeader} />
          <div className={styles.avatarArea}>
            <CircularProgress size={32} sx={{ color: 'primary.main' }} />
          </div>
        </div>
      </div>
    );
  }

  const avatarSrc = localUser?.imageUrl
    ? `${BASE_URL}/users/image/${localUser.imageUrl}`
    : '/blank-profile-picture.png';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.userCard}>

        {/* ── Hero header ── */}
        <div className={styles.cardHeader}>
          {canEditUser() && (
            edit ? (
              <Button className={styles.editButton} onClick={handleSubmit}>
                {loading
                  ? <CircularProgress size={18} sx={{ color: 'primary.contrastText' }} />
                  : <SaveIcon fontSize="small" />}
              </Button>
            ) : (
              <Button className={styles.editButton} onClick={() => setEdit(true)}>
                <EditIcon fontSize="small" />
              </Button>
            )
          )}
          <span className={styles.headerRole}>{localUser?.role}</span>
        </div>

        {/* ── Avatar + name + org badges ── */}
        <div className={styles.avatarArea}>
          {!edit ? (
            <Avatar className={styles.profileImg} src={avatarSrc} />
          ) : (
            <label htmlFor="input1" className={styles.avatarLabel}>
              <div className={styles.avatarEditWrapper}>
                <Avatar className={styles.profileImg} src={imagePreview} />
                <div className={styles.avatarEditHint}>Changer</div>
              </div>
              <input type="file" id="input1" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          )}

          <div className={styles.userName}>
            {localUser?.firstName} {localUser?.lastName}
          </div>

          <div className={styles.orgBadges}>
            <div className={styles.orgBadge}>
              <span className={styles.orgBadgeLabel}>DP</span>
              <span className={styles.orgBadgeValue}>{localUser?.departement?.abriviation ?? '—'}</span>
            </div>
            <div className={styles.orgBadge}>
              <span className={styles.orgBadgeLabel}>DR</span>
              <span className={styles.orgBadgeValue}>{localUser?.direction?.abriviation ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* ── Upload progress ── */}
        {isImageUploading && (
          <div className={styles.uploadRow}>
            <Stack alignItems="center" gap={0.5}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                {imageUploadProgress}%
              </span>
              <LinearProgress
                variant="buffer"
                valueBuffer={imageUploadProgress}
                value={imageUploadProgress}
                sx={{ width: '100%', borderRadius: 99 }}
              />
            </Stack>
          </div>
        )}

        {/* ── Fields ── */}
        <div className={styles.fieldsSection}>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Nom</span>
            <Field value={localUser?.firstName} edit={edit} onChange={(e: any) => setUserProperty('firstName', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Prénom</span>
            <Field value={localUser?.lastName} edit={edit} onChange={(e: any) => setUserProperty('lastName', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Email</span>
            <Field value={localUser?.email} edit={edit} onChange={(e: any) => setUserProperty('email', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{"Nom d'util."}</span>
            <Field value={localUser?.username} edit={edit} onChange={(e: any) => setUserProperty('username', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Rôle</span>
            <span className={styles.fieldValue}>{localUser?.role}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

function Field({ edit, value, onChange }: any) {
  return (
    <>
      {edit
        ? <input type="text" className={styles.editInput} value={value ?? ''} onChange={onChange} />
        : <span className={styles.fieldValue}>{value}</span>
      }
    </>
  );
}

export default UserProfile;
