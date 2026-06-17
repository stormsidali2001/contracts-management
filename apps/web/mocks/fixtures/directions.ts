import { DirectionView } from '@contracts/types';

export const mockDirections: DirectionView[] = [
  {
    id: 'dir-1',
    title: 'Direction des Ressources Humaines',
    abriviation: 'DRH',
    departements: [
      { id: 'dep-1', title: 'Département Recrutement', abriviation: 'REC' },
      { id: 'dep-2', title: 'Département Formation', abriviation: 'FOR' },
      { id: 'dep-3', title: 'Département Paie', abriviation: 'PAI' },
    ],
  },
  {
    id: 'dir-2',
    title: 'Direction Financière et Comptable',
    abriviation: 'DFC',
    departements: [
      { id: 'dep-4', title: 'Département Comptabilité', abriviation: 'CPT' },
      { id: 'dep-5', title: 'Département Budget', abriviation: 'BDG' },
    ],
  },
  {
    id: 'dir-3',
    title: "Direction des Systèmes d'Information",
    abriviation: 'DSI',
    departements: [
      { id: 'dep-6', title: 'Département Développement', abriviation: 'DEV' },
      { id: 'dep-7', title: 'Département Infrastructure', abriviation: 'INF' },
      { id: 'dep-8', title: 'Département Sécurité', abriviation: 'SEC' },
    ],
  },
  {
    id: 'dir-4',
    title: 'Direction Commerciale',
    abriviation: 'DCM',
    departements: [
      { id: 'dep-9', title: 'Département Ventes', abriviation: 'VNT' },
      { id: 'dep-10', title: 'Département Marketing', abriviation: 'MKT' },
    ],
  },
  {
    id: 'dir-5',
    title: 'Direction Juridique',
    abriviation: 'DJR',
    departements: [
      { id: 'dep-11', title: 'Département Contrats', abriviation: 'CTR' },
      { id: 'dep-12', title: 'Département Litiges', abriviation: 'LTG' },
    ],
  },
  {
    id: 'dir-6',
    title: 'Direction des Achats',
    abriviation: 'DAC',
    departements: [
      {
        id: 'dep-13',
        title: 'Département Approvisionnement',
        abriviation: 'APP',
      },
      { id: 'dep-14', title: 'Département Fournisseurs', abriviation: 'FRN' },
      { id: 'dep-15', title: 'Département Logistique', abriviation: 'LOG' },
    ],
  },
  {
    id: 'dir-7',
    title: 'Direction de la Production',
    abriviation: 'DPR',
    departements: [
      { id: 'dep-16', title: 'Département Fabrication', abriviation: 'FAB' },
      { id: 'dep-17', title: 'Département Qualité', abriviation: 'QLT' },
    ],
  },
  {
    id: 'dir-8',
    title: 'Direction Générale',
    abriviation: 'DG',
    departements: [
      { id: 'dep-18', title: 'Département Stratégie', abriviation: 'STR' },
      { id: 'dep-19', title: 'Département Communication', abriviation: 'COM' },
    ],
  },
];
