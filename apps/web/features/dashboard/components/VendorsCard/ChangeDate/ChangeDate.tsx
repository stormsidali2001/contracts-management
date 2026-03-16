'use client';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/redux/hooks';
import { setDateRange } from '@/features/statistics/StatisticsSlice';
import styles from './ChangeDate.module.css';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';

const format = (d: Date) => new Date(d).toISOString().replace(/T[0-9:.Z]*/g, '');

interface PropType {
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  handleClose: () => void;
}

const ChangeDate = ({ start_date, end_date, handleClose }: PropType) => {
  const [byStartDate, setByStartDate] = useState(false);
  const [byEndDate,   setByEndDate]   = useState(false);
  const [startDate,   setStartDate]   = useState(start_date);
  const [endDate,     setEndDate]     = useState(end_date);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (start_date) setByStartDate(true);
    if (end_date)   setByEndDate(true);
  }, []);

  const handleApply = () => {
    dispatch(setDateRange({
      startDate: byStartDate && startDate ? format(startDate.toDate()) : null,
      endDate:   byEndDate   && endDate   ? format(endDate.toDate())   : null,
    }));
    handleClose();
  };

  const canApply = byStartDate || byEndDate;

  return (
    <div className={styles.container}>
      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Filtrer par période</span>
            <span className={styles.headerSubtitle}>Sélectionner un intervalle de dates</span>
          </div>
        </div>
      </div>

      {/* ── Date rows ── */}
      <div className={styles.modalBody}>
        {/* Start date */}
        <div className={`${styles.dateRow} ${byStartDate ? styles.active : ''}`}>
          <div className={styles.dateRowTop}>
            <div className={styles.dateRowLabel}>
              <div className={styles.dateRowIcon}>
                <EventOutlinedIcon sx={{ fontSize: 14 }} />
              </div>
              <span className={styles.dateRowTitle}>Date de début</span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={byStartDate}
                onChange={() => setByStartDate((v) => !v)}
              />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.pickerWrapper} ${byStartDate ? styles.visible : ''}`}>
            <MobileDatePicker
              label="Date de début"
              value={startDate}
              disabled={!byStartDate}
              onChange={(v) => setStartDate(v ?? dayjs())}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </div>
        </div>

        {/* End date */}
        <div className={`${styles.dateRow} ${byEndDate ? styles.active : ''}`}>
          <div className={styles.dateRowTop}>
            <div className={styles.dateRowLabel}>
              <div className={styles.dateRowIcon}>
                <EventOutlinedIcon sx={{ fontSize: 14 }} />
              </div>
              <span className={styles.dateRowTitle}>Date de fin</span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={byEndDate}
                onChange={() => setByEndDate((v) => !v)}
              />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.pickerWrapper} ${byEndDate ? styles.visible : ''}`}>
            <MobileDatePicker
              label="Date de fin"
              value={endDate}
              disabled={!byEndDate}
              onChange={(v) => setEndDate(v ?? dayjs())}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </div>
        </div>
      </div>

      {/* ── Period preview ── */}
      <div className={`${styles.periodPreview} ${!(byStartDate || byEndDate) ? styles.hidden : ''}`}>
        <span>{byStartDate && startDate ? startDate.format('DD/MM/YYYY') : '—'}</span>
        <span className={styles.periodArrow}>→</span>
        <span>{byEndDate && endDate ? endDate.format('DD/MM/YYYY') : '—'}</span>
      </div>

      {/* ── Actions ── */}
      <div className={styles.actionRow}>
        <button className={styles.cancelBtn} onClick={handleClose}>
          Fermer
        </button>
        <button className={styles.applyBtn} disabled={!canApply} onClick={handleApply}>
          <CheckOutlinedIcon sx={{ fontSize: 15 }} />
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default ChangeDate;
