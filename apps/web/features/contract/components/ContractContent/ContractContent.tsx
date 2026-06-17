'use client';

import { useState } from 'react';
import styles from './ContractContent.module.css';
import { Modal, Skeleton } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Breadcrumb from '@/shared/components/Breadcrumb/Breadcrumb';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ExecutionModal from '@/features/contract/components/ExecutionModal/ExecutionModal';
import { usePermissions } from '@/features/auth/queries/auth.queries';
import { useAgreement } from '@/features/contract/queries/contract.queries';
import { BASE_URL } from '@/api/axios';

interface PropType {
  type: 'contract' | 'convension';
  agreementId: string | undefined;
}

const STATUS_LABEL: Record<string, string> = {
  not_executed: 'Non exécuté',
  in_execution_with_delay: 'En cours (retard)',
  in_execution: 'En cours',
  executed_with_delay: 'Exécuté (retard)',
  executed: 'Exécuté',
};

const STATUS_CSS: Record<string, string> = {
  not_executed: styles.statusNotExecuted,
  in_execution: styles.statusInExecution,
  in_execution_with_delay: styles.statusInExecutionDelay,
  executed: styles.statusExecuted,
  executed_with_delay: styles.statusExecutedDelay,
};

const STATUS_PROGRESS: Record<string, number> = {
  not_executed: 0,
  in_execution: 50,
  in_execution_with_delay: 50,
  executed: 100,
  executed_with_delay: 100,
};

const formatDate = (raw: Date | string | null | undefined) => {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime())
    ? String(raw)
    : d.toLocaleDateString('fr-DZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
};

const formatAmount = (v: number | null | undefined) =>
  v == null ? '—' : new Intl.NumberFormat('fr-DZ').format(v) + ' DA';

const ContractContent = ({ type, agreementId }: PropType) => {
  const { data: permissions } = usePermissions();
  const [openExecutionModal, setOpenExecutionModal] = useState(false);

  const { data: contract, isLoading } = useAgreement(agreementId, type);

  if (isLoading || !contract) {
    return (
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <Skeleton variant="text" animation="wave" width={90} height={16} />
            <div className={styles.pageHeaderTitle}>
              <Skeleton
                variant="text"
                animation="wave"
                width={130}
                height={34}
              />
              <Skeleton
                variant="rounded"
                animation="wave"
                width={70}
                height={22}
                sx={{ borderRadius: 99 }}
              />
              <Skeleton
                variant="rounded"
                animation="wave"
                width={100}
                height={22}
                sx={{ borderRadius: 99 }}
              />
            </div>
          </div>
          <div className={styles.pageHeaderActions}>
            <Skeleton
              variant="rounded"
              animation="wave"
              width={140}
              height={34}
              sx={{ borderRadius: 8 }}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              width={100}
              height={34}
              sx={{ borderRadius: 8 }}
            />
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left card skeleton */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Skeleton
                variant="circular"
                animation="wave"
                width={36}
                height={36}
              />
              <div className={styles.headerText}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={170}
                  height={18}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={90}
                  height={14}
                />
              </div>
            </div>
            <div className={styles.cardBody}>
              <section className={styles.section}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={150}
                  height={14}
                />
                <div className={styles.parties}>
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    height={56}
                    sx={{ borderRadius: 8, flex: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    animation="wave"
                    width={20}
                    height={16}
                    sx={{ mx: 1 }}
                  />
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    height={56}
                    sx={{ borderRadius: 8, flex: 1 }}
                  />
                </div>
              </section>
              <div className={styles.divider} />
              <section className={styles.section}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoBlock}>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={45}
                      height={14}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width="100%"
                      height={16}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width="75%"
                      height={16}
                    />
                  </div>
                  <div className={styles.infoBlock}>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={60}
                      height={14}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={130}
                      height={24}
                    />
                  </div>
                </div>
              </section>
              <div className={styles.divider} />
              <section className={styles.section}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={80}
                  height={14}
                />
                <div className={styles.datesRow}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.dateBlock}>
                      <Skeleton
                        variant="circular"
                        animation="wave"
                        width={24}
                        height={24}
                      />
                      <div>
                        <Skeleton
                          variant="text"
                          animation="wave"
                          width={55}
                          height={13}
                        />
                        <Skeleton
                          variant="text"
                          animation="wave"
                          width={80}
                          height={16}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right card skeleton */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Skeleton
                variant="circular"
                animation="wave"
                width={36}
                height={36}
              />
              <div className={styles.headerText}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={110}
                  height={18}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={90}
                  height={14}
                />
              </div>
            </div>
            <div className={styles.cardBody}>
              <section className={styles.section}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={80}
                  height={14}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={110}
                  height={28}
                  sx={{ borderRadius: 99, mt: 0.5 }}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width="100%"
                  height={8}
                  sx={{ borderRadius: 99, mt: 1 }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  {[70, 50, 65].map((w, i) => (
                    <Skeleton
                      key={i}
                      variant="text"
                      animation="wave"
                      width={w}
                      height={13}
                    />
                  ))}
                </div>
              </section>
              <div className={styles.divider} />
              <section className={styles.section}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={130}
                  height={14}
                />
                <div className={styles.execDatesRow}>
                  <div className={styles.execDateBlock}>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={40}
                      height={13}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={80}
                      height={16}
                    />
                  </div>
                  <Skeleton
                    variant="text"
                    animation="wave"
                    width={16}
                    height={16}
                  />
                  <div className={styles.execDateBlock}>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={30}
                      height={13}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={80}
                      height={16}
                    />
                  </div>
                </div>
              </section>
              <div className={styles.divider} />
              <section className={styles.section}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  width={90}
                  height={14}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width="100%"
                  height={80}
                  sx={{ borderRadius: 8, mt: 0.5 }}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canExecute = permissions?.agreements.canExecute ?? false;
  const isExecuted = contract.status !== 'not_executed';
  const progress = STATUS_PROGRESS[contract.status] ?? 0;
  const backHref = type === 'contract' ? '/contracts' : '/convensions';
  const typeLabel = type === 'contract' ? 'Contrat' : 'Convention';

  return (
    <div id="agreement-detail-page" className={styles.container}>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Breadcrumb
            items={[
              {
                label: type === 'contract' ? 'Contrats' : 'Conventions',
                href: backHref,
              },
              { label: contract.number },
            ]}
          />
          <div className={styles.pageHeaderTitle}>
            <h1 className={styles.pageTitle}>{contract.number}</h1>
            <span className={styles.typeBadge}>{typeLabel}</span>
            <span
              className={`${styles.statusBadge} ${STATUS_CSS[contract.status] ?? ''}`}
            >
              {STATUS_LABEL[contract.status] ?? contract.status}
            </span>
          </div>
        </div>
        <div className={styles.pageHeaderActions}>
          {contract.url ? (
            <a
              href={`${BASE_URL}/agreements/files/${contract.url}`}
              target="_blank"
              rel="noreferrer"
              className={styles.docButton}
            >
              <OpenInNewOutlinedIcon sx={{ fontSize: 15 }} />
              Voir le document
            </a>
          ) : (
            <span className={styles.noDocButton}>Aucun document</span>
          )}
          {canExecute && (
            <button
              id="agreement-execute-btn"
              className={styles.executeButton}
              disabled={isExecuted}
              onClick={() => setOpenExecutionModal(true)}
            >
              <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />
              Exécuter
            </button>
          )}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className={styles.grid}>
        {/* ══ Left: Contract details ══ */}
        <div id="agreement-detail-card" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIconWrap}>
              <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div className={styles.headerText}>
              <span className={styles.cardTitle}>Informations du contrat</span>
              <span className={styles.cardSubtitle}>{contract.number}</span>
            </div>
          </div>

          <div className={styles.cardBody}>
            {/* ── Parties ── */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>Parties contractantes</span>
              <div className={styles.parties}>
                {/* Organisation side */}
                <div className={styles.party}>
                  <div className={styles.partyIconOrg}>
                    <AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className={styles.partyInfo}>
                    <span className={styles.partyName}>Organisation</span>
                    <div className={styles.partyMeta}>
                      {contract.departement?.abriviation && (
                        <span className={styles.metaPill}>
                          {contract.departement.abriviation}
                        </span>
                      )}
                      {contract.direction?.abriviation && (
                        <span className={styles.metaPill}>
                          {contract.direction.abriviation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.etSep}>
                  <span>ET</span>
                </div>

                {/* Vendor side */}
                <div className={styles.party}>
                  <div className={styles.partyIconVendor}>
                    <StorefrontOutlinedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className={styles.partyInfo}>
                    <span className={styles.partyName}>
                      {contract.vendor?.company_name ?? '—'}
                    </span>
                    <span className={styles.partyRole}>Fournisseur</span>
                  </div>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            {/* ── Object + Amount ── */}
            <section className={styles.section}>
              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Objet</span>
                  <p className={styles.infoValue}>{contract.object ?? '—'}</p>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Montant</span>
                  <span className={styles.amountValue}>
                    {formatAmount(contract.amount)}
                  </span>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            {/* ── Dates ── */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>Calendrier</span>
              <div className={styles.datesRow}>
                <div className={styles.dateBlock}>
                  <div className={styles.dateIcon}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className={styles.dateLabel}>Signature</span>
                    <span className={styles.dateValue}>
                      {formatDate(contract.signature_date)}
                    </span>
                  </div>
                </div>
                <div className={styles.dateBlock}>
                  <div className={styles.dateIcon}>
                    <EventBusyOutlinedIcon sx={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className={styles.dateLabel}>Expiration</span>
                    <span className={styles.dateValue}>
                      {formatDate(contract.expiration_date)}
                    </span>
                  </div>
                </div>
                <div className={styles.dateBlock}>
                  <div className={styles.dateIcon}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <span className={styles.dateLabel}>Créé le</span>
                    <span className={styles.dateValue}>
                      {formatDate(contract.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ══ Right: Execution ══ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIconWrap}>
              <PlayCircleOutlineIcon sx={{ fontSize: 18 }} />
            </div>
            <div className={styles.headerText}>
              <span className={styles.cardTitle}>Exécution</span>
              <span className={styles.cardSubtitle}>{contract.number}</span>
            </div>
          </div>

          <div className={styles.cardBody}>
            {/* ── Status block ── */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>État actuel</span>
              <div className={styles.statusBlock}>
                <span
                  className={`${styles.statusPill} ${STATUS_CSS[contract.status] ?? ''}`}
                >
                  {STATUS_LABEL[contract.status] ?? contract.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.progressLabels}>
                <span
                  className={progress >= 0 ? styles.progressLabelActive : ''}
                >
                  Non exécuté
                </span>
                <span
                  className={progress >= 50 ? styles.progressLabelActive : ''}
                >
                  En cours
                </span>
                <span
                  className={progress >= 100 ? styles.progressLabelActive : ''}
                >
                  Exécuté
                </span>
              </div>
            </section>

            <div className={styles.divider} />

            {/* ── Execution dates ── */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>Période d'exécution</span>
              <div className={styles.execDatesRow}>
                <div className={styles.execDateBlock}>
                  <span className={styles.infoLabel}>Début</span>
                  <span className={styles.dateValue}>
                    {formatDate(contract.execution_start_date)}
                  </span>
                </div>
                <div className={styles.execDateArrow}>→</div>
                <div className={styles.execDateBlock}>
                  <span className={styles.infoLabel}>Fin</span>
                  <span className={styles.dateValue}>
                    {formatDate(contract.execution_end_date)}
                  </span>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            {/* ── Observation ── */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>Observation</span>
              <textarea
                readOnly
                className={styles.observationArea}
                value={contract.observation ?? ''}
                placeholder="Aucune observation"
              />
            </section>

            {/* ── Execute CTA ── */}
            {canExecute && !isExecuted && (
              <div className={styles.ctaSection}>
                <button
                  className={styles.ctaButton}
                  onClick={() => setOpenExecutionModal(true)}
                >
                  <PlayCircleOutlineIcon sx={{ fontSize: 17 }} />
                  Lancer l'exécution
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={openExecutionModal}
        onClose={() => setOpenExecutionModal(false)}
      >
        <ExecutionModal
          type={type}
          handleClose={() => setOpenExecutionModal(false)}
          agreementId={contract.id}
        />
      </Modal>
    </div>
  );
};

export default ContractContent;
