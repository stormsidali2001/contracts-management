import { Statistics } from '@/features/statistics/queries/statistics.queries';

export const mockStatistics: Statistics = {
  agreementsStats: {
    status: {
      executed: 6,
      executed_with_delay: 4,
      in_execution: 18,
      in_execution_with_delay: 4,
      not_executed: 18,
    },
    topDirections: [
      {
        id: 'dir-3',
        title: "Direction des Systèmes d'Information",
        abriviation: 'DSI',
        agreementCount: 10,
      },
      {
        id: 'dir-7',
        title: 'Direction de la Production',
        abriviation: 'DPR',
        agreementCount: 9,
      },
      {
        id: 'dir-1',
        title: 'Direction des Ressources Humaines',
        abriviation: 'DRH',
        agreementCount: 7,
      },
      {
        id: 'dir-6',
        title: 'Direction des Achats',
        abriviation: 'DAC',
        agreementCount: 5,
      },
      {
        id: 'dir-4',
        title: 'Direction Commerciale',
        abriviation: 'DCM',
        agreementCount: 5,
      },
      {
        id: 'dir-8',
        title: 'Direction Générale',
        abriviation: 'DG',
        agreementCount: 5,
      },
      {
        id: 'dir-5',
        title: 'Direction Juridique',
        abriviation: 'DJR',
        agreementCount: 5,
      },
      {
        id: 'dir-2',
        title: 'Direction Financière et Comptable',
        abriviation: 'DFC',
        agreementCount: 4,
      },
    ],
    types: {
      contract: 25,
      convension: 25,
    },
  },
  userTypes: {
    admin: 4,
    employee: 12,
    juridical: 5,
    total: 21,
  },
  vendorsStats: [
    { id: 'vs-1', date: '2024-01-01', nb_vendors: 2 },
    { id: 'vs-2', date: '2024-02-01', nb_vendors: 4 },
    { id: 'vs-3', date: '2024-03-01', nb_vendors: 6 },
    { id: 'vs-4', date: '2024-04-01', nb_vendors: 7 },
    { id: 'vs-5', date: '2024-05-01', nb_vendors: 9 },
    { id: 'vs-6', date: '2024-06-01', nb_vendors: 12 },
    { id: 'vs-7', date: '2024-07-01', nb_vendors: 15 },
  ],
};
