
export const DEFAULT_EXERCISES = [
  { id: 'ex_1', name: 'Maschine/Seitheben', category: 'Shoulders' },
  { id: 'ex_2', name: 'Schrägbankmaschine', category: 'Chest' },
  { id: 'ex_3', name: 'Brustdrückmaschine', category: 'Chest' },
  { id: 'ex_4', name: 'Flys', category: 'Chest' },
  { id: 'ex_5', name: 'Triceps-Extensions', category: 'Triceps' },
  { id: 'ex_6', name: 'Bauch', category: 'Abs' },
  { id: 'ex_7', name: 'Strecker Iso', category: 'Legs' },
  { id: 'ex_8', name: 'Beinpresse', category: 'Legs' },
  { id: 'ex_9', name: 'Waden', category: 'Legs' },
  { id: 'ex_10', name: 'Biceps-Curls', category: 'Biceps' },
  { id: 'ex_11', name: 'Eng von vorne', category: 'Back' },
  { id: 'ex_12', name: 'Seated Rows', category: 'Back' },
  { id: 'ex_13', name: 'Kelso', category: 'Shoulders' },
  { id: 'ex_14', name: 'Latzug', category: 'Back' },
  { id: 'ex_15', name: 'SDL', category: 'Back' },
  { id: 'ex_16', name: 'Forearm Curls', category: 'Forearms' },
  { id: 'ex_17', name: 'Leg Curls', category: 'Legs' },
  { id: 'ex_18', name: 'Bankdrücken', category: 'Chest' },
  { id: 'ex_19', name: 'Dips', category: 'Triceps' },
  { id: 'ex_20', name: 'Klimmzüge', category: 'Back' },
];

export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_1',
    name: 'Tag 1 - Push Focus',
    exercises: ['ex_1', 'ex_2', 'ex_3', 'ex_4', 'ex_5', 'ex_6', 'ex_7', 'ex_8', 'ex_9']
  },
  {
    id: 'tpl_2',
    name: 'Tag 2 - Pull Focus',
    exercises: ['ex_10', 'ex_11', 'ex_12', 'ex_13', 'ex_14', 'ex_15', 'ex_16', 'ex_17']
  },
  {
    id: 'tpl_3',
    name: 'Tag 3 - Push/Legs',
    exercises: ['ex_1', 'ex_4', 'ex_18', 'ex_19', 'ex_5', 'ex_6', 'ex_7', 'ex_8', 'ex_9']
  },
  {
    id: 'tpl_4',
    name: 'Tag 4 - Pull/Back',
    exercises: ['ex_10', 'ex_12', 'ex_13', 'ex_20', 'ex_11', 'ex_17', 'ex_15', 'ex_16']
  }
];
