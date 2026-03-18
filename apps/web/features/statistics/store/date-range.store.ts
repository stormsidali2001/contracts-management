import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangeStore {
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  setDateRange: (payload: { startDate?: string | null; endDate?: string | null }) => void;
}

export const useDateRangeStore = create<DateRangeStore>((set) => ({
  start_date: null,
  end_date: null,

  setDateRange: ({ startDate, endDate }) =>
    set({
      start_date: startDate ? dayjs(startDate) : null,
      end_date: endDate ? dayjs(endDate) : null,
    }),
}));
