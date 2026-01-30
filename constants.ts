import { Exercise, WorkoutTemplate } from './types';

// DEFAULT_EXERCISES provides the initial set of available exercises.
export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex_1', name: 'Maschine/Seitheben', category: 'Shoulders' },
  { id: 'ex_2', name: 'Schrägbankmaschine', category: 'Chest' },
  { id: 'ex_3', name: 'Brustdrückmaschine', category: 'Chest' },
  { id: 'ex_4', name: 'Flys', category: 'Chest' },
  { id: 'ex_5', name: 'Triceps-Extensions', category: 'Triceps' },
  { id: 'ex_6', name: 'Bauch', category: 'Abs' },
  { id: 'ex_7', name: 'Beinstrecker', category: 'Legs' }
];

// DEFAULT_TEMPLATES provides predefined workout structures for the user.
export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Ganzkörper Training',
    exercises: ['ex_2', 'ex_3', 'ex_4', 'ex_5', 'ex_6', 'ex_7', 'ex_1']
  }
];
