export type ActionType = 'sow_indoor' | 'sow_outdoor' | 'repot' | 'harvest';
export type ClimateRegion = 'oceanique' | 'continental' | 'mediterraneen' | 'montagnard';

export interface Region {
  id: ClimateRegion;
  name: string;
  icon: string;
  color: string;
  description: string;
  lat: number;
  lng: number;
  city: string;
}

export const REGIONS: Region[] = [
  { id: 'oceanique', name: 'Océanique', icon: '🌊', color: 'bg-[#B2CEFE]', description: 'Hivers doux et étés tempérés (Ouest de la France)', lat: 47.2184, lng: -1.5536, city: 'Nantes' },
  { id: 'continental', name: 'Continental', icon: '🌲', color: 'bg-[#A8E6CF]', description: 'Hivers froids et étés chauds (Est et Centre)', lat: 48.5734, lng: 7.7521, city: 'Strasbourg' },
  { id: 'mediterraneen', name: 'Méditerranéen', icon: '☀️', color: 'bg-[#FFD93D]', description: 'Hivers doux et étés chauds/secs (Sud)', lat: 43.7102, lng: 7.262, city: 'Nice' },
  { id: 'montagnard', name: 'Montagnard', icon: '⛰️', color: 'bg-[#FFB347]', description: 'Hivers longs/froids et étés frais (Alpes, Pyrénées, Massif central)', lat: 45.9237, lng: 6.8694, city: 'Chamonix' },
];

export interface Variety {
  name: string;
  description: string;
  image?: string;
  schedule: Record<ClimateRegion, Record<ActionType, number[]>>;
  sensitivity?: {
    cold?: boolean;
    heat?: boolean;
    wind?: boolean;
  };
}

export interface Crop {
  id: string;
  name: string;
  type: 'légume' | 'fruit' | 'herbe' | 'fleur';
  emoji: string;
  image?: string;
  seedEmoji: string;
  germinationDays: string;
  repotting: string;
  conditions: string;
  description: string;
  harvestInfo: string;
  pests?: string;
  companions?: string[]; // IDs of crops that go well with this one
  enemies?: string[]; // IDs of crops that should be avoided nearby
  schedule: Record<ClimateRegion, Record<ActionType, number[]>>; // month index 0-11
  sensitivity?: {
    cold?: boolean;
    heat?: boolean;
    wind?: boolean;
  };
  varieties?: Variety[];
}

const shiftMonths = (months: number[], shift: number): number[] => {
  return months.map(m => (m + shift + 12) % 12);
};

// Base schedules
const tomateBase = { sow_indoor: [1, 2], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] };
const carotteBase = { sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6], repot: [], harvest: [4, 5, 6, 7, 8, 9, 10] };
const radisBase = { sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [], harvest: [3, 4, 5, 6, 7, 8, 9] };
const fraiseBase = { sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [2, 3, 7, 8], harvest: [4, 5, 6, 7] };
const basilicBase = { sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [5, 6, 7, 8, 9] };
const courgetteBase = { sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] };
const aubergineBase = { sow_indoor: [1, 2], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] };
const betteraveBase = { sow_indoor: [2, 3], sow_outdoor: [3, 4, 5, 6], repot: [3, 4, 5, 6], harvest: [5, 6, 7, 8, 9] };
const brocoliBase = { sow_indoor: [2, 3], sow_outdoor: [4, 5, 6], repot: [3, 4, 5, 6], harvest: [5, 6, 7, 8, 9] };
const chouFleurBase = { sow_indoor: [1, 2, 3, 4], sow_outdoor: [4, 5, 6], repot: [2, 3, 4, 5, 6], harvest: [5, 6, 7, 8, 9, 10] };
const chouBruxellesBase = { sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [8, 9, 10, 11] };
const concombreBase = { sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] };
const courgeButternutBase = { sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [8, 9, 10] };
const epinardBase = { sow_indoor: [], sow_outdoor: [1, 2, 3, 7, 8, 9], repot: [], harvest: [3, 4, 5, 9, 10, 11] };
const haricotVertBase = { sow_indoor: [], sow_outdoor: [4, 5, 6, 7], repot: [], harvest: [6, 7, 8, 9] };
const laitueBase = { sow_indoor: [1, 2], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [2, 3, 4, 5, 6, 7, 8], harvest: [3, 4, 5, 6, 7, 8, 9, 10] };
const maisBase = { sow_indoor: [3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [7, 8, 9] };
const navetBase = { sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [], harvest: [4, 5, 9, 10] };
const oignonBase = { sow_indoor: [1, 2], sow_outdoor: [2, 3], repot: [2, 3], harvest: [6, 7, 8] };
const petitPoisBase = { sow_indoor: [], sow_outdoor: [1, 2, 3], repot: [], harvest: [4, 5, 6] };
const poireauBase = { sow_indoor: [0, 1, 2], sow_outdoor: [3, 4, 5], repot: [4, 5, 6], harvest: [7, 8, 9, 10, 11, 0] };
const poivronBase = { sow_indoor: [1, 2], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] };
const pommeDeTerreBase = { sow_indoor: [], sow_outdoor: [2, 3, 4], repot: [], harvest: [6, 7, 8, 9] };
const potironBase = { sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [8, 9, 10] };
const roquetteBase = { sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [], harvest: [3, 4, 5, 6, 7, 8, 9] };
const artichautBase = { sow_indoor: [1, 2], sow_outdoor: [3, 4], repot: [3, 4], harvest: [5, 6, 7, 8] };
const aspergeBase = { sow_indoor: [], sow_outdoor: [2, 3], repot: [2, 3], harvest: [3, 4, 5] };
const betteBase = { sow_indoor: [2, 3], sow_outdoor: [3, 4, 5], repot: [3, 4, 5], harvest: [5, 6, 7, 8, 9, 10] };
const celeriBase = { sow_indoor: [1, 2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [7, 8, 9, 10] };
const chicoreeBase = { sow_indoor: [], sow_outdoor: [4, 5, 6, 7], repot: [4, 5, 6, 7], harvest: [8, 9, 10, 11] };
const echaloteBase = { sow_indoor: [], sow_outdoor: [1, 2], repot: [1, 2], harvest: [6, 7] };
const feveBase = { sow_indoor: [], sow_outdoor: [1, 2, 9, 10], repot: [], harvest: [4, 5, 6] };
const melonBase = { sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8] };
const panaisBase = { sow_indoor: [], sow_outdoor: [2, 3, 4], repot: [], harvest: [8, 9, 10, 11] };
const persilBase = { sow_indoor: [1, 2], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [2, 3, 4, 5, 6, 7, 8], harvest: [3, 4, 5, 6, 7, 8, 9, 10, 11] };
const radisNoirBase = { sow_indoor: [], sow_outdoor: [5, 6, 7], repot: [], harvest: [8, 9, 10] };
const rhubarbeBase = { sow_indoor: [], sow_outdoor: [2, 3, 8, 9], repot: [2, 3, 8, 9], harvest: [3, 4, 5] };

const generateSchedule = (base: Record<ActionType, number[]>) => {
  return {
    oceanique: base,
    continental: {
      sow_indoor: base.sow_indoor,
      sow_outdoor: shiftMonths(base.sow_outdoor, 1),
      repot: shiftMonths(base.repot, 1),
      harvest: shiftMonths(base.harvest, 1)
    },
    mediterraneen: {
      sow_indoor: shiftMonths(base.sow_indoor, -1),
      sow_outdoor: shiftMonths(base.sow_outdoor, -1),
      repot: shiftMonths(base.repot, -1),
      harvest: shiftMonths(base.harvest, -1)
    },
    montagnard: {
      sow_indoor: shiftMonths(base.sow_indoor, 1),
      sow_outdoor: shiftMonths(base.sow_outdoor, 1),
      repot: shiftMonths(base.repot, 1),
      harvest: shiftMonths(base.harvest, 1)
    }
  };
};

export const CROPS: Crop[] = [
  {
    id: 'tomate',
    name: 'Tomate',
    type: 'légume',
    emoji: '🍅',
    image: '/pictures/tomate.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 14 jours',
    repotting: 'Quand les plants ont 3-4 vraies feuilles, puis en pleine terre après les gelées.',
    conditions: 'Beaucoup de soleil et de chaleur. Terre riche et bien drainée.',
    description: 'La reine du potager ! Elle demande de l\'attention mais offre de belles récompenses juteuses en été.',
    harvestInfo: 'Récolter quand le fruit est uniformément coloré et souple sous la pression du doigt.',
    pests: 'Mildiou (humidité), Pucerons (purin d\'ortie), Araignées rouges (douche au jet).',
    companions: ['basilic', 'carotte', 'oignon', 'souci'],
    enemies: ['pomme-de-terre', 'betterave'],
    schedule: generateSchedule(tomateBase),
    sensitivity: { cold: true, heat: true },
    varieties: [
      { 
        name: 'Cœur de Bœuf', 
        description: 'Grosse tomate charnue et très goûteuse, idéale pour les salades.',
        image: '/pictures/tomatecoeurboeuf.webp',
        schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] }),
        sensitivity: { heat: true }
      },
      { 
        name: 'Cerise - Sweet 100', 
        description: 'Très productive, petites tomates très sucrées que les enfants adorent.',
        image: '/pictures/tomatecerise.webp',
        schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5, 6], repot: [4, 5, 6], harvest: [5, 6, 7, 8, 9] }),
        sensitivity: { heat: true }
      },
      { 
        name: 'Marmande', 
        description: 'Variété précoce produisant de gros fruits légèrement aplatis et côtelés.',
        image: '/pictures/tomatemarmande.webp',
        schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [3, 4], repot: [3, 4], harvest: [5, 6, 7, 8] }),
        sensitivity: { heat: true }
      },
      { 
        name: 'Roma', 
        description: 'Tomate allongée avec peu de pépins, excellente pour les sauces et conserves.',
        image: '/pictures/tomateroma.webp',
        schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [7, 8, 9] }),
        sensitivity: { heat: true }
      },
      { 
        name: 'Noire de Crimée', 
        description: 'Couleur sombre originale, chair douce et fondante, peu acide.',
        image: '/pictures/tomatecrimé.webp',
        schedule: generateSchedule({ sow_indoor: [1, 2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] }),
        sensitivity: { heat: true }
      }
    ]
  },
  {
    id: 'carotte',
    name: 'Carotte',
    type: 'légume',
    emoji: '🥕',
    image: '/pictures/Carotte.webp',
    seedEmoji: '🟠',
    germinationDays: '10 à 20 jours',
    repotting: 'Pas de repiquage, semis direct en pleine terre. Penser à éclaircir !',
    conditions: 'Terre meuble, légère et sans cailloux pour des carottes bien droites.',
    description: 'Un classique croquant. Le secret est une terre bien préparée et un arrosage régulier.',
    harvestInfo: 'Récolter dès qu\'elles atteignent la taille souhaitée. Plus elles sont jeunes, plus elles sont sucrées.',
    pests: 'Mouche de la carotte (filet de protection), Limaces (cendres).',
    companions: ['oignon', 'poireau', 'laitue', 'tomate'],
    enemies: ['persil', 'celeri'],
    schedule: generateSchedule(carotteBase),
    sensitivity: { heat: true },
    varieties: [
      { 
        name: 'Nantaise Améliorée', 
        description: 'La référence : racine cylindrique, bout arrondi, chair très colorée et sucrée.',
        image: '/pictures/carottenataise.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6], repot: [], harvest: [4, 5, 6, 7, 8, 9, 10] })
      },
      { 
        name: 'Touchon', 
        description: 'Variété demi-longue à chair très fine et sans cœur ligneux.',
        image: '/pictures/Carottetouchon.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4], repot: [], harvest: [5, 6, 7, 8] })
      },
      { 
        name: 'Chantenay à cœur rouge', 
        description: 'Plus courte et conique, parfaite pour les terres un peu lourdes ou caillouteuses.',
        image: '/pictures/carottechantenayrouge.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [3, 4, 5, 6], repot: [], harvest: [6, 7, 8, 9, 10] })
      },
      { 
        name: 'Purple Sun', 
        description: 'Une touche d\'originalité avec sa peau violette et son cœur orange vif.',
        image: '/pictures/CarottePurple.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5], repot: [], harvest: [5, 6, 7, 8, 9] })
      },
      { 
        name: 'De la Halle', 
        description: 'Très précoce, idéale pour les premières récoltes de printemps.',
        image: '/pictures/carottehalle.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [1, 2], repot: [], harvest: [3, 4, 5] })
      }
    ]
  },
  {
    id: 'basilic',
    name: 'Basilic',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/basilic.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 10 jours',
    repotting: 'Au stade 4 feuilles, en pot ou pleine terre.',
    conditions: 'Soleil, chaleur et arrosage régulier au pied.',
    description: 'L\'herbe aromatique indispensable de l\'été. Très frileux, attention aux gelées tardives.',
    harvestInfo: 'Récolter les feuilles au sommet pour favoriser la ramification.',
    pests: 'Pucerons (savon noir), Mildiou (air libre).',
    companions: ['tomate', 'poivron', 'courgette'],
    schedule: generateSchedule(basilicBase),
    sensitivity: { cold: true }
  },
  {
    id: 'lavande',
    name: 'Lavande',
    type: 'herbe',
    emoji: '💜',
    image: '/pictures/lavande.webp',
    seedEmoji: '🌱',
    germinationDays: '14 à 28 jours',
    repotting: 'Au printemps, en sol bien drainé.',
    conditions: 'Plein soleil, sol calcaire et pauvre. Très résistant à la sécheresse.',
    description: 'Parfume le jardin et attire les pollinisateurs tout en éloignant certains nuisibles.',
    harvestInfo: 'Couper les tiges fleuries juste avant l\'ouverture complète des fleurs.',
    pests: 'Cigales écumeuses (peu fréquent).',
    companions: ['fraise', 'tomate', 'souci'],
    schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [3, 4], repot: [3, 4], harvest: [5, 6, 7] })
  },
  {
    id: 'souci',
    name: 'Souci',
    type: 'fleur',
    emoji: '🌼',
    image: '/pictures/souci.webp',
    seedEmoji: '🌻',
    germinationDays: '7 à 10 jours',
    repotting: 'Repiquage facile quand les plants font 5cm.',
    conditions: 'Toute bonne terre de jardin, soleil ou mi-ombre.',
    description: 'Une fleur alliée du potager : elle attire les insectes utiles et repousse les pucerons.',
    harvestInfo: 'Récolter les fleurs au fur et à mesure pour prolonger la floraison.',
    pests: 'Pucerons (parfois), Oïdium en fin de saison.',
    companions: ['tomate', 'carotte', 'chou-fleur'],
    schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [3, 4, 5], repot: [4, 5], harvest: [5, 6, 7, 8, 9] })
  },
  {
    id: 'framboise',
    name: 'Framboisier',
    type: 'fruit',
    emoji: '🍇',
    image: '/pictures/framboisier.webp',
    seedEmoji: '🪴',
    germinationDays: 'Plantation de drageons recommandée.',
    repotting: 'À l\'automne ou au début du printemps.',
    conditions: 'Sol riche, frais et légèrement acide. Mi-ombre ou soleil doux.',
    description: 'Un arbuste facile qui donne des fruits délicieux année après année.',
    harvestInfo: 'Récolter quand les fruits se détachent tout seuls du réceptacle.',
    pests: 'Ver de la framboise (installer des nichoirs à oiseaux).',
    companions: ['souci', 'lavande'],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [9, 10, 1, 2], repot: [9, 10, 1, 2], harvest: [5, 6, 7, 8] })
  },
  {
    id: 'radis',
    name: 'Radis',
    type: 'légume',
    emoji: '🍒',
    image: '/pictures/radis.webp',
    seedEmoji: '🟤',
    germinationDays: '3 à 5 jours',
    repotting: 'Semis direct, pas de repiquage.',
    conditions: 'Terre fraîche. Arrosage régulier sinon ils piquent !',
    description: 'Le légume des impatients : pousse à une vitesse folle. Parfait pour les débutants.',
    harvestInfo: 'Récolter dès que le haut de la racine dépasse de terre (environ 2cm). N\'attendez pas trop sinon ils piquent !',
    pests: 'Altises (petits trous - maintenir le sol humide), Mouche du chou (filet).',
    schedule: generateSchedule(radisBase),
    sensitivity: { heat: true },
    varieties: [
      { 
        name: '18 Jours', 
        description: 'Le plus rapide ! Racine demi-longue rose à bout blanc.',
        image: '/pictures/Radis18.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [], harvest: [3, 4, 5, 6, 7, 8, 9] })
      },
      { 
        name: 'Flamboyant', 
        description: 'Radis de tous les mois, demi-long et très croquant.',
        image: '/pictures/radisflamboyant.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6], repot: [], harvest: [3, 4, 5, 6, 7] })
      },
      { 
        name: 'National', 
        description: 'Petit radis rond tout rouge, idéal pour les jardins en ville.',
        image: '/pictures/radisNational.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 6, 7, 8], repot: [], harvest: [3, 4, 5, 6, 7, 8, 9] })
      },
      { 
        name: 'Chandelle de Glace', 
        description: 'Variété longue et blanche, originale, avec un goût légèrement piquant.',
        image: '/pictures/radisglace.webp',
        schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [3, 4, 5], repot: [], harvest: [5, 6, 7] })
      }
    ]
  },
  {
    id: 'aubergine',
    name: 'Aubergine',
    type: 'légume',
    emoji: '🍆',
    image: '/pictures/aubergine.webp',
    seedEmoji: '🌱',
    germinationDays: '8 à 15 jours',
    repotting: 'En pleine terre après les Saints de Glace (mi-mai).',
    conditions: 'Chaleur intense et plein soleil. Sol très riche.',
    description: 'Demande beaucoup de soleil ! Idéal pour les ratatouilles ou moussaka.',
    harvestInfo: 'Récolter quand la peau est bien brillante et que le fruit ne grossit plus. Si elle devient mate, elle est trop mûre.',
    pests: 'Doryphores (ramassage manuel), Pucerons (savon noir).',
    schedule: generateSchedule(aubergineBase),
    sensitivity: { cold: true }
  },
  {
    id: 'betterave',
    name: 'Betterave',
    type: 'légume',
    emoji: '🔴',
    image: '/pictures/beterave.webp',
    seedEmoji: '🧅',
    germinationDays: '10 à 15 jours',
    repotting: 'Peut être repiquée en godet ou semée direct.',
    conditions: 'Sol frais et profond. Exposition ensoleillée.',
    description: 'Riche en vitamines, elle se consomme crue ou cuite.',
    harvestInfo: 'Dès qu\'elle atteint la taille d\'une balle de tennis (environ 3 mois après semis).',
    pests: 'Mouche de la betterave (poudrage à la chaux), Limaces au stade jeune.',
    schedule: generateSchedule(betteraveBase)
  },
  {
    id: 'brocoli',
    name: 'Brocoli',
    type: 'légume',
    emoji: '🥦',
    image: '/pictures/brocoli.webp',
    seedEmoji: '🥬',
    germinationDays: '5 à 10 jours',
    repotting: 'Repiquage quand les plants ont 5-6 feuilles.',
    conditions: 'Sol riche, frais et calcaire. Apprécie l\'humidité.',
    description: 'Un super-aliment facile à cultiver s\'il ne fait pas trop chaud.',
    harvestInfo: 'Couper la tête principale quand les grains sont bien serrés et avant que les fleurs jaunes n\'apparaissent.',
    pests: 'Piéride du chou (filet, purin de tomate), Pucerons cendrés.',
    schedule: generateSchedule(brocoliBase),
    sensitivity: { heat: true }
  },
  {
    id: 'chou-fleur',
    name: 'Chou-fleur',
    type: 'légume',
    emoji: '🥦',
    image: '/pictures/Choufleur.webp',
    seedEmoji: '🥬',
    germinationDays: '5 à 10 jours',
    repotting: 'Repiquer quand le plant a 4-5 feuilles.',
    conditions: 'Sol riche et humide. Exposition ensoleillée à mi-ombre.',
    description: 'Exigeant en nutriments et en eau pour former une belle pomme.',
    harvestInfo: 'Récolter quand la pomme est bien ferme, blanche et compacte.',
    pests: 'Piéride du chou, Mouche du chou (filet), Limaces.',
    schedule: generateSchedule(chouFleurBase),
    sensitivity: { heat: true }
  },
  {
    id: 'chou-bruxelles',
    name: 'Chou de Bruxelles',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/choubruxelle.webp',
    seedEmoji: '🌱',
    germinationDays: '6 à 10 jours',
    repotting: 'Repiquage en place à 50 cm d\'intervalle.',
    conditions: 'Sol ferme et riche. Aime le froid pour développer les petits choux.',
    description: 'Le légume d\'hiver par excellence, encore meilleur après une gelée.',
    harvestInfo: 'Récolter de bas en haut quand les petites pommes font 2-3 cm de diamètre et sont bien fermes.',
    pests: 'Pucerons cendrés (savon noir), Piéride du chou.',
    schedule: generateSchedule(chouBruxellesBase)
  },
  {
    id: 'concombre',
    name: 'Concombre',
    type: 'légume',
    emoji: '🥒',
    image: '/pictures/concombre.webp',
    seedEmoji: '🌰',
    germinationDays: '6 à 10 jours',
    repotting: 'En pleine terre après les gelées.',
    conditions: 'Chaleur, soleil et arrosage abondant régulier.',
    description: 'Rafraîchissant en été. Prévoir un support pour le faire grimper.',
    harvestInfo: 'Récolter régulièrement pour stimuler la production. Plus ils sont petits, moins ils ont de pépins.',
    pests: 'Oïdium (mélange eau/lait), Pucerons, Limaces au semis.',
    schedule: generateSchedule(concombreBase),
    sensitivity: { cold: true, heat: true }
  },
  {
    id: 'courge-butternut',
    name: 'Courge Butternut',
    type: 'légume',
    emoji: '🎃',
    image: '/pictures/Courgebutternut.webp',
    seedEmoji: '🌰',
    germinationDays: '5 à 10 jours',
    repotting: 'Repiquage en mai après les gelées.',
    conditions: 'Sol très riche en compost, beaucoup d\'espace.',
    description: 'Une chair fondante et sucrée. Se conserve tout l\'hiver.',
    harvestInfo: 'Quand le pédoncule (la tige) devient sec et liégeux, et que la peau est dure.',
    pests: 'Oïdium (ventilation), Limaces sur les jeunes plants.',
    schedule: generateSchedule(courgeButternutBase),
    sensitivity: { cold: true }
  },
  {
    id: 'epinard',
    name: 'Épinard',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/epinard.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 12 jours',
    repotting: 'Semis direct uniquement.',
    conditions: 'Sol frais et riche, mi-ombre en été pour éviter la montée en graine.',
    description: 'Pousse vite et peut se récolter feuille à feuille.',
    harvestInfo: 'Récolter les feuilles extérieures au fur et à mesure des besoins quand elles font environ 10cm.',
    pests: 'Mildiou (ne pas mouiller le feuillage), Limaces.',
    schedule: generateSchedule(epinardBase),
    sensitivity: { heat: true }
  },
  {
    id: 'haricot-vert',
    name: 'Haricot vert',
    type: 'légume',
    emoji: '🫛',
    image: '/pictures/haricot.webp',
    seedEmoji: '🫘',
    germinationDays: '5 à 8 jours',
    repotting: 'Semis direct. Terre réchauffée indispensable.',
    conditions: 'Soleil, sol léger. Paillage utile.',
    description: 'Productif et délicieux. Semer tous les 15 jours pour une récolte étalée.',
    harvestInfo: 'Récolter quand les grains ne sont pas encore formés pour éviter qu\'ils ne soient filandreux.',
    pests: 'Pucerons noirs (savon noir), Mouche du haricot (semis profond).',
    schedule: generateSchedule(haricotVertBase),
    sensitivity: { cold: true }
  },
  {
    id: 'laitue',
    name: 'Laitue',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/laitue.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 10 jours',
    repotting: 'Repiquage possible pour les semis en godet.',
    conditions: 'Sol frais, arrosages fréquents. Mi-ombre en plein été.',
    description: 'La base du potager. Plusieurs variétés pour produire toute l\'année.',
    harvestInfo: 'Récolter quand le coeur est bien formé en coupant la racine au ras du sol.',
    pests: 'Limaces (pièges à bière ou barrières), Pucerons radicaux (rotation).',
    schedule: generateSchedule(laitueBase),
    sensitivity: { heat: true },
    varieties: [
      { 
        name: 'Appia', 
        description: 'Une très belle laitue pommée de printemps et d\'été, tendre et savoureuse.',
        image: '/pictures/laitueappia.webp',
        schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [2, 3, 4, 5], repot: [3, 4, 5, 6], harvest: [4, 5, 6, 7] })
      },
      { 
        name: 'Rouge Grenobloise', 
        description: 'Laitue batavia très croquante, résistante à la chaleur et au froid.',
        image: '/pictures/laitueraouge.webp',
        schedule: generateSchedule({ sow_indoor: [1, 2, 6, 7], sow_outdoor: [2, 3, 4, 5, 7, 8], repot: [3, 4, 5, 8, 9], harvest: [4, 5, 6, 9, 10, 11] })
      },
      { 
        name: 'Grosse Blonde Paresseuse', 
        description: 'Une énorme pomme qui supporte très bien les chaleurs de l\'été.',
        image: '/pictures/laituegrosseblonde.webp',
        schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5, 6], repot: [5, 6, 7], harvest: [6, 7, 8, 9] })
      },
      { 
        name: 'Lollo Rossa', 
        description: 'Laitue à couper frisée et rouge, décorative et savoureuse.',
        image: '/pictures/laituelollorosso.webp',
        schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [3, 4, 5, 6, 7, 8], repot: [4, 5, 6, 7, 8, 9], harvest: [5, 6, 7, 8, 9, 10] })
      }
    ]
  },
  {
    id: 'mais',
    name: 'Maïs doux',
    type: 'légume',
    emoji: '🌽',
    image: '/pictures/mais.webp',
    seedEmoji: '🫘',
    germinationDays: '7 à 10 jours',
    repotting: 'Repiquage en motte pour ne pas abîmer les racines.',
    conditions: 'Chaleur, plein soleil et sol riche.',
    description: 'Semer en bloc (plusieurs rangs) pour une bonne pollinisation.',
    harvestInfo: 'Quand les "barbes" (soies) deviennent brunes et que les grains libèrent un liquide laiteux sous l\'ongle.',
    pests: 'Pyrale du maïs (purin de fougère), Pucerons.',
    schedule: generateSchedule(maisBase),
    sensitivity: { cold: true }
  },
  {
    id: 'navet',
    name: 'Navet',
    type: 'légume',
    emoji: '🧅',
    image: '/pictures/Navet.webp',
    seedEmoji: '🟤',
    germinationDays: '4 à 7 jours',
    repotting: 'Semis direct. Éclaircir rapidement.',
    conditions: 'Sol frais et léger. Arrosage régulier.',
    description: 'Culture rapide d\'automne ou de printemps.',
    harvestInfo: 'Récolter quand ils atteignent la taille d\'une mandarine.',
    pests: 'Altises, Mouche du navet (filet de protection).',
    schedule: generateSchedule(navetBase)
  },
  {
    id: 'oignon',
    name: 'Oignon',
    type: 'légume',
    emoji: '🧅',
    image: '/pictures/oignons.webp',
    seedEmoji: '🧄',
    germinationDays: '10 à 15 jours (semis) ou plantation directe de bulbilles.',
    repotting: 'Peu commun si bulbille.',
    conditions: 'Sol drainé, pas trop de fumure fraîche. Plein soleil.',
    description: 'Indispensable en cuisine. Facile à réussir avec des bulbilles.',
    harvestInfo: 'Quand le feuillage jaunit et se couche au sol. Laisser sécher sur place si le temps le permet.',
    pests: 'Mouche de l\'oignon (association avec carotte), Mildiou.',
    schedule: generateSchedule(oignonBase)
  },
  {
    id: 'petit-pois',
    name: 'Petit pois',
    type: 'légume',
    emoji: '🫛',
    image: '/pictures/petitpois.webp',
    seedEmoji: '🫘',
    germinationDays: '7 à 10 jours',
    repotting: 'Semis direct préconisé.',
    conditions: 'Sol frais et profond. Exposition ensoleillée mais pas brûlante.',
    description: 'Le goût du jardin ! Prévoir des rames pour les variétés grimpeantes.',
    harvestInfo: 'Récolter quand les cosses sont bien pleines mais les grains encore tendres.',
    pests: 'Pucerons verts, Tordeuse du pois (semis précoce).',
    schedule: generateSchedule(petitPoisBase),
    sensitivity: { heat: true }
  },
  {
    id: 'poireau',
    name: 'Poireau',
    type: 'légume',
    emoji: '🎋',
    image: '/pictures/poireau.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 20 jours',
    repotting: 'Repiquage indispensable après avoir "habillé" le plant.',
    conditions: 'Sol profond, riche et frais.',
    description: 'Récolte d\'hiver ou d\'été selon les variétés.',
    harvestInfo: 'Récolter au fur et à mesure des besoins dès qu\'ils ont un diamètre suffisant.',
    pests: 'Teigne du poireau (filet, purin de prêle), Mouche mineuse.',
    schedule: generateSchedule(poireauBase)
  },
  {
    id: 'poivron',
    name: 'Poivron',
    type: 'légume',
    emoji: '🫑',
    image: '/pictures/poivron.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'En pleine terre après les gelées.',
    conditions: 'Chaleur et soleil maximum. Sol riche.',
    description: 'Même culture que la tomate mais encore plus frileux.',
    harvestInfo: 'Récolter dès qu\'ils atteignent leur couleur finale (vert, rouge ou jaune) et sont bien fermes.',
    pests: 'Pucerons, Araignées rouges (pulvérisation d\'eau).',
    schedule: generateSchedule(poivronBase),
    sensitivity: { cold: true }
  },
  {
    id: 'pomme-de-terre',
    name: 'Pomme de terre',
    type: 'légume',
    emoji: '🥔',
    image: '/pictures/pommedeterre.webp',
    seedEmoji: '🥔',
    germinationDays: 'Levée en 15-20 jours après plantation.',
    repotting: 'Buttage nécessaire au cours de la croissance.',
    conditions: 'Sol meuble et riche. Exposition ensoleillée.',
    description: 'La base ! Planter des tubercules germés.',
    harvestInfo: 'Quand les feuilles commencent à faner pour les variétés de conservation.',
    pests: 'Doryphores (ramassage), Mildiou (décoction de prêle).',
    schedule: generateSchedule(pommeDeTerreBase)
  },
  {
    id: 'potiron',
    name: 'Potiron',
    type: 'légume',
    emoji: '🎃',
    image: '/pictures/potiron.webp',
    seedEmoji: '🌰',
    germinationDays: '5 à 10 jours',
    repotting: 'En mai en pleine terre.',
    conditions: 'Sol très riche, plein soleil, beaucoup d\'eau.',
    description: 'Le roi d\'Halloween ! Prend beaucoup de place au jardin.',
    harvestInfo: 'Récolter avant les premières gelées quand le pédoncule devient dur.',
    pests: 'Oïdium, Limaces (jeunes plants).',
    schedule: generateSchedule(potironBase),
    sensitivity: { cold: true }
  },
  {
    id: 'roquette',
    name: 'Roquette',
    type: 'légume',
    emoji: '🌿',
    image: '/pictures/roquette.webp',
    seedEmoji: '🌱',
    germinationDays: '3 à 6 jours',
    repotting: 'Semis direct en place.',
    conditions: 'Terre fraîche. Mi-ombre en été.',
    description: 'Une salade piquante très facile et rapide à cultiver.',
    harvestInfo: 'Couper les feuilles à 2cm du sol quand elles font environ 10cm, elle repoussera.',
    pests: 'Altises (maintenir humide), Limaces.',
    schedule: generateSchedule(roquetteBase),
    sensitivity: { heat: true }
  },
  {
    id: 'artichaut',
    name: 'Artichaut',
    type: 'légume',
    emoji: '🌵',
    image: '/pictures/artichaud.webp',
    seedEmoji: '🌱',
    germinationDays: '12 à 20 jours',
    repotting: 'Plantation en automne ou printemps.',
    conditions: 'Sol riche et profond, exposition ensoleillée et chaude.',
    description: 'Plante vivace qui reste en place plusieurs années.',
    harvestInfo: 'Récolter avant que les écailles (les fleurs) ne commencent à s\'ouvrir.',
    pests: 'Pucerons noirs (savon noir), Limaces sur les jeunes pousses.',
    schedule: generateSchedule(artichautBase),
    sensitivity: { cold: true }
  },
  {
    id: 'asperge',
    name: 'Asperge',
    type: 'légume',
    emoji: '🎋',
    image: '/pictures/asperge.webp',
    seedEmoji: '🌱',
    germinationDays: 'Semis long, souvent via des griffes.',
    repotting: 'Installation durable en tranchées (griffes).',
    conditions: 'Sol sableux, léger et profond.',
    description: 'Un régal de printemps. Demande de la patience (3 ans avant récolte).',
    harvestInfo: 'Couper les turions quand ils font environ 20cm de haut.',
    pests: 'Criocère de l\'asperge (ramassage manuel), Mouche de l\'asperge.',
    schedule: generateSchedule(aspergeBase)
  },
  {
    id: 'bette',
    name: 'Bette (Blette)',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/bette.webp',
    seedEmoji: '🧅',
    germinationDays: '8 à 12 jours',
    repotting: 'Peut être repiquée à 40 cm.',
    conditions: 'Sol riche et frais.',
    description: 'On consomme les côtes et les feuilles. Très décorative.',
    harvestInfo: 'Récolter les feuilles extérieures au fur et à mesure en les cassant à la base.',
    pests: 'Mouche de la betterave, Limaces.',
    schedule: generateSchedule(betteBase)
  },
  {
    id: 'celeri',
    name: 'Céleri-rave',
    type: 'légume',
    emoji: '🌿',
    image: '/pictures/celerirave.webp',
    seedEmoji: '🌱',
    germinationDays: '15 à 20 jours',
    repotting: 'Repiquage complexe (sans enterrer le coeur).',
    conditions: 'Sol lourd, riche en humus et frais.',
    description: 'Longue culture exigeante en eau et nutriments.',
    harvestInfo: 'Récolter à l\'automne quand la boule fait la taille d\'un gros pamplemousse.',
    pests: 'Mouche du céleri, Pucerons.',
    schedule: generateSchedule(celeriBase)
  },
  {
    id: 'chicoree',
    name: 'Chicorée',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/chicoré.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 10 jours',
    repotting: 'Semis direct ou repiquage.',
    conditions: 'Sol frais. Résiste bien au froid.',
    description: 'Salade croquante parfaite pour l\'automne.',
    harvestInfo: 'Récolter quand le coeur est bien serré ou feuille à feuille.',
    pests: 'Limaces, Pucerons.',
    schedule: generateSchedule(chicoreeBase)
  },
  {
    id: 'echalote',
    name: 'Échalote',
    type: 'légume',
    emoji: '🧅',
    image: '/pictures/echalotte.webp',
    seedEmoji: '🧅',
    germinationDays: 'Levée en 15 jours.',
    repotting: 'Plantation de caïeux.',
    conditions: 'Sol drainé, léger. Pas besoin d\'arrosage excessif.',
    description: 'Plus fine que l\'oignon. Culture très simple.',
    harvestInfo: 'Quand les fanes sont sèches, généralement en été.',
    pests: 'Mouche de l\'oignon, Mildiou.',
    schedule: generateSchedule(echaloteBase)
  },
  {
    id: 'feve',
    name: 'Fève',
    type: 'légume',
    emoji: '🫛',
    image: '/pictures/feve.webp',
    seedEmoji: '🫘',
    germinationDays: '8 à 12 jours',
    repotting: 'Semis direct uniquement.',
    conditions: 'Sol profond et frais. Aime les climats doux.',
    description: 'Se sème tôt en saison. Améliore la fertilité du sol.',
    harvestInfo: 'Récolter quand les graines sont bien visibles à travers la cosse.',
    pests: 'Pucerons noirs (pincement des sommets), Bruche.',
    schedule: generateSchedule(feveBase)
  },
  {
    id: 'melon',
    name: 'Melon',
    type: 'légume',
    emoji: '🍈',
    image: '/pictures/melon.webp',
    seedEmoji: '🌰',
    germinationDays: '5 à 8 jours',
    repotting: 'Repiquage délicat en mai.',
    conditions: 'Max de soleil, chaleur et terre très riche.',
    description: 'Demande de la taille pour fructifier correctement.',
    harvestInfo: 'Quand le fruit se détache facilement ou qu\'une craquelure apparaît autour du pédoncule.',
    pests: 'Oïdium, Pucerons, Araignées rouges.',
    schedule: generateSchedule(melonBase),
    sensitivity: { cold: true, heat: true }
  },
  {
    id: 'panais',
    name: 'Panais',
    type: 'légume',
    emoji: '🥕',
    image: '/pictures/panais.webp',
    seedEmoji: '🟠',
    germinationDays: '15 à 25 jours',
    repotting: 'Semis direct uniquement.',
    conditions: 'Sol profond, meuble et frais.',
    description: 'Un légume d\'antan dont le goût s\'adoucit avec le gel.',
    harvestInfo: 'Récolter après les premières gelées pour un goût plus sucré.',
    pests: 'Mouche de la carotte, Limaces.',
    schedule: generateSchedule(panaisBase)
  },
  {
    id: 'persil',
    name: 'Persil',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/persil.webp',
    seedEmoji: '🌱',
    germinationDays: '20 à 30 jours (lent !)',
    repotting: 'Possible en godet.',
    conditions: 'Sol frais, riche. Ombre légère en été.',
    description: 'L\'aromatique incontournable. Faire tremper les graines 24h avant.',
    harvestInfo: 'Récolter branche par branche selon les besoins.',
    pests: 'Mouche de la carotte, Mouche du céleri.',
    schedule: generateSchedule(persilBase)
  },
  {
    id: 'radis-noir',
    name: 'Radis noir',
    type: 'légume',
    emoji: '🧅',
    image: '/pictures/radisnoir.webp',
    seedEmoji: '🟤',
    germinationDays: '3 à 6 jours',
    repotting: 'Semis direct uniquement.',
    conditions: 'Sol meuble et frais.',
    description: 'Excellent pour la santé en hiver. Goût puissant.',
    harvestInfo: 'Récolter quand ils ont la taille d\'un gros pamplemousse avant les grands froids.',
    pests: 'Altises, Mouche du chou.',
    schedule: generateSchedule(radisNoirBase)
  },
  {
    id: 'rhubarbe',
    name: 'Rhubarbe',
    type: 'légume',
    emoji: '🌿',
    image: '/pictures/rhubarbe.webp',
    seedEmoji: '🌱',
    germinationDays: 'Plantation de souches recommandée.',
    repotting: 'Installation durable, demande de l\'espace.',
    conditions: 'Sol profond, très riche et frais.',
    description: 'Vivace décorative et délicieuse en compote !',
    harvestInfo: 'Casser les pétioles (tiges) à la base. Ne jamais consommer les feuilles (toxiques).',
    pests: 'Limaces.',
    schedule: generateSchedule(rhubarbeBase)
  },
  {
    id: 'fraise',
    name: 'Fraise',
    type: 'fruit',
    emoji: '🍓',
    image: '/pictures/Fraise.webp',
    seedEmoji: '🪴',
    germinationDays: 'Plantation en godet recommandée',
    repotting: 'Espacer les plants de 30 cm.',
    conditions: 'Soleil, terre riche et paillage (pour garder l\'humidité et des fruits propres).',
    description: 'Le bonheur des enfants ! De bons stolons permettront de multiplier vos plants pour l\'année suivante.',
    harvestInfo: 'Récolter quand elles sont bien rouges et brillantes.',
    pests: 'Limaces (paillage), Oïdium (ventilation).',
    companions: ['lavande', 'salade', 'haricot'],
    schedule: generateSchedule(fraiseBase),
    sensitivity: { heat: true },
    varieties: [
      { 
        name: 'Gariguette', 
        description: 'La plus célèbre des fraises de printemps, très parfumée et de forme allongée.',
        image: '/pictures/Fraisegarigette.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [2, 3, 7, 8], harvest: [4, 5] })
      },
      { 
        name: 'Mara des Bois', 
        description: 'Une fraise remontante au goût exceptionnel de fraise des bois.',
        image: '/pictures/fraisemarabois.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [2, 3, 7, 8], harvest: [5, 6, 7, 8] })
      },
      { 
        name: 'Charlotte', 
        description: 'Grosse fraise remontante, sucrée et ferme, très productive.',
        image: '/pictures/FraiseCharlotte.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [2, 3, 7, 8], harvest: [5, 6, 7, 8, 9] })
      },
      { 
        name: 'Ostara', 
        description: 'Variété remontante vigoureuse, produisant des fruits jusqu\'aux premières gelées.',
        image: '/pictures/Fraiseostara.webp',
        schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 7, 8], repot: [2, 3, 7, 8], harvest: [5, 6, 7, 8, 9, 10] })
      }
    ]
  },
  {
    id: 'courgette',
    name: 'Courgette',
    type: 'légume',
    emoji: '🥒',
    image: '/pictures/Courgette.webp',
    seedEmoji: '🌰',
    germinationDays: '5 à 8 jours',
    repotting: 'Quand les gelées ne sont plus à craindre, en pleine terre avec compost.',
    conditions: 'Terreau riche, eau en abondance et beaucoup de soleil.',
    description: 'Très productive ! Il faut cueillir les fruits jeunes pour en avoir tout l\'été.',
    harvestInfo: 'Récolter environ 15cm de long pour les variétés allongées, elles sont alors plus tendres.',
    pests: 'Oïdium (mélange lait/eau), Pucerons.',
    companions: ['basilic', 'mais', 'haricot'],
    enemies: ['concombre'],
    schedule: generateSchedule(courgetteBase),
    sensitivity: { cold: true, heat: true },
    varieties: [
      { 
        name: 'Verte de Milan', 
        description: 'Une variété classique, productive, aux fruits vert foncé allongés.',
        image: '/pictures/courgettemilan.webp',
        schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] })
      },
      { 
        name: 'Ronde de Nice', 
        description: 'Petite courgette ronde, idéale pour être farcie.',
        image: '/pictures/courgetterondenice.webp',
        schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [5, 6, 7] })
      },
      { 
        name: 'Gold Rush', 
        description: 'Étonnante courgette jaune vif, à la chair fine et douce.',
        image: '/pictures/courgettegoldrush.webp',
        schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8] })
      },
      { 
        name: 'Zuboda', 
        description: 'Variété non coureuse, très hâtive, produisant de longs fruits vert clair.',
        image: '/pictures/courgettezuboda.webp',
        schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [3, 4], repot: [3, 4], harvest: [5, 6, 7, 8] })
      }
    ]
  },
  {
    id: 'ail',
    name: 'Ail',
    type: 'légume',
    emoji: '🧄',
    image: '/pictures/ail.webp',
    seedEmoji: '🧄',
    germinationDays: '10 à 15 jours (levée des pousses)',
    repotting: 'Pas de repiquage. Planter les caïeux directement en terre (pointe vers le haut).',
    conditions: 'Exposition ensoleillée. Sol léger, très bien drainé pour éviter le pourrissement des bulbes.',
    description: 'Une culture d\'une simplicité enfantine et incontournable pour cuisiner. Il passe l\'hiver en terre sans problème.',
    harvestInfo: 'Récolter en été quand les feuilles commencent à jaunir et sécher à moitié. Laisser sécher au soleil.',
    pests: 'Mouche de l\'oignon (associer avec la carotte), Rouille de l\'ail (éviter l\'excès d\'humidité).',
    companions: ['carotte', 'tomate', 'fraise', 'laitue'],
    enemies: ['haricot-vert', 'petit-pois', 'feve'],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [9, 10, 1, 2], repot: [], harvest: [5, 6, 7] })
  },
  {
    id: 'chou-kale',
    name: 'Chou Kale',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/choukale.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 8 jours',
    repotting: 'Repiquer quand les plants ont 4 à 5 vraies feuilles, en les espaçant de 45 cm.',
    conditions: 'Sols riches, profonds et frais. Il adore les climats frais et résiste extrêmement bien au gel.',
    description: 'Le roi des légumes d\'hiver ! Ses feuilles frisées sont délicieuses en salade ou cuites, très nutritives.',
    harvestInfo: 'Récolter feuille à feuille en commençant par le bas au fur et à mesure des besoins pendant tout l\'hiver.',
    pests: 'Piéride du chou (filet protecteur), Altises (maintenir le sol humide), Pucerons.',
    companions: ['laitue', 'betterave', 'pomme-de-terre'],
    enemies: ['fraise'],
    schedule: generateSchedule({ sow_indoor: [4, 5], sow_outdoor: [5, 6, 7], repot: [6, 7, 8], harvest: [9, 10, 11, 0, 1] })
  },
  {
    id: 'piment',
    name: 'Piment',
    type: 'légume',
    emoji: '🌶️',
    image: '/pictures/piment.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Repiquer en pot individuel puis en pleine terre en mai après les dernières gelées.',
    conditions: 'Maximum de soleil, à l\'abri du vent. Sol très riche et bien drainé.',
    description: 'Pour apporter une touche de piquant et de couleur à votre potager. Sensible au froid comme ses cousines les tomates.',
    harvestInfo: 'Récolter quand les fruits sont bien colorés (rouges ou jaunes selon la variété) et fermes.',
    pests: 'Pucerons (pulvérisation de savon noir), Araignées rouges (maintenir une humidité ambiante).',
    companions: ['basilic', 'tomate', 'carotte'],
    enemies: ['pomme-de-terre', 'concombre'],
    schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [4, 5], repot: [4, 5], harvest: [7, 8, 9, 10] }),
    sensitivity: { cold: true, heat: true }
  },
  {
    id: 'pak-choi',
    name: 'Chou Chinois (Pak Choï)',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/chouchinois.webp',
    seedEmoji: '🌱',
    germinationDays: '4 à 7 jours',
    repotting: 'Repiquer en lignes espacées de 30 cm environ 3 semaines après le semis.',
    conditions: 'Sol frais, riche et léger. Exposition ensoleillée ou mi-ombre.',
    description: 'Une superbe variété de chou asiatique à croissance rapide, aux tiges charnues et croquantes et feuilles tendres.',
    harvestInfo: 'Couper la plante entière au ras du sol ou récolter les feuilles extérieures au fil des besoins.',
    pests: 'Altises (faire des arrosages en pluie fine), Limaces.',
    companions: ['laitue', 'haricot-vert', 'petit-pois'],
    enemies: ['radis'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [6, 7], repot: [3, 4, 7, 8], harvest: [4, 5, 8, 9, 10] })
  },
  {
    id: 'pasteque',
    name: 'Pastèque',
    type: 'fruit',
    emoji: '🍉',
    image: '/pictures/pasteque.webp',
    seedEmoji: '🌱',
    germinationDays: '6 à 10 jours',
    repotting: 'Repiquer en godets individuels puis au chaud. Mise en place en mai/juin après tout risque de gel.',
    conditions: 'Beaucoup de soleil et de chaleur. Sol riche, profond et régulier en arrosage sans excès.',
    description: 'Le fruit phare de l\'été ! Assez gourmand en place et en eau, mais tellement rafraîchissant.',
    harvestInfo: 'Récolter quand le pédoncule sèche, ou que la vrille à l\'opposé du fruit est totalement sèche.',
    pests: 'Pucerons (traitement naturel régulier), Oïdium.',
    companions: ['mais', 'radis', 'haricot-vert'],
    enemies: ['pomme-de-terre', 'courgette'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [7, 8, 9] }),
    sensitivity: { cold: true, heat: false }
  },
  {
    id: 'coriandre',
    name: 'Coriandre',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/coriandre.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 21 jours',
    repotting: 'Peut se repiquer mais n\'aime pas trop. Préférer le semis en place.',
    conditions: 'Soleil ou mi-ombre (qui retarde la montée en graine). Sol frais.',
    description: 'Une herbe aromatique divisant les foules, au goût citronné et frais, dont feuilles et graines se consomment.',
    harvestInfo: 'Couper les tiges au ras du sol selon les besoins. Laisser monter en graines si on veut les récolter.',
    pests: 'Pucerons (très peu sensible de manière générale).',
    companions: ['carotte', 'chou', 'fraise'],
    enemies: ['fenouil'],
    schedule: generateSchedule({ sow_indoor: [3], sow_outdoor: [4, 5, 6, 7, 8], repot: [], harvest: [5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'fenouil',
    name: 'Fenouil',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/fenouille.webp',
    seedEmoji: '🌱',
    germinationDays: '12 à 15 jours',
    repotting: 'Si semé en pépinière, repiquer au stade 4 feuilles.',
    conditions: 'Soleil, sol riche et léger, frais. Butter les bulbes s\'ils s\'exposent trop.',
    description: 'Plante au goût anisé prononcé, très appréciée pour la fraîcheur de son bulbe charnu croquant.',
    harvestInfo: 'Récolter en fin d\'été avant les gelées quand le bulbe a la taille d\'un poing.',
    pests: 'Puceron (qui transmet des virus).',
    companions: ['celeri', 'navet', 'poireau'],
    enemies: ['haricot-vert', 'tomate', 'coriandre'],
    schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [5, 6], repot: [5, 6], harvest: [7, 8, 9, 10] })
  },
  {
    id: 'capucine',
    name: 'Capucine',
    type: 'fleur',
    emoji: '🌺',
    image: '/pictures/capucine.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 14 jours',
    repotting: 'Repiquer en place après les gelées.',
    conditions: 'Soleil ou mi-ombre. Sol pauvre et bien drainé.',
    description: 'Une fleur comestible au goût poivré, excellente pour attirer les pucerons loin des légumes.',
    harvestInfo: 'Récolter les fleurs et les feuilles au fur et à mesure pour les salades.',
    pests: 'Pucerons noirs (les attire exprès).',
    companions: ['tomate', 'radis', 'chou', 'courgette'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [3], sow_outdoor: [4, 5, 6], repot: [4, 5], harvest: [5, 6, 7, 8, 9] })
  },
  {
    id: 'oeillet-d-inde',
    name: 'Œillet d\'Inde',
    type: 'fleur',
    emoji: '🏵️',
    image: '/pictures/oeilletdinde.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 8 jours',
    repotting: 'Repiquer en godet puis en pleine terre après les gelées.',
    conditions: 'Plein soleil. Sol ordinaire, même pauvre.',
    description: 'Essentielle au potager, elle repousse les nématodes du sol et attire les syrphes.',
    harvestInfo: 'Couper les fleurs fanées pour prolonger la floraison.',
    pests: 'Limaces (au stade jeune plant).',
    companions: ['tomate', 'chou', 'haricot-vert', 'pomme-de-terre'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'tournesol',
    name: 'Tournesol',
    type: 'fleur',
    emoji: '🌻',
    image: '/pictures/tournesol.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 10 jours',
    repotting: 'Semis direct recommandé, craint le repiquage.',
    conditions: 'Plein soleil absolu. Sol riche et profond.',
    description: 'Géant du jardin, il attire les pollinisateurs et fournit tuteur naturel et graines.',
    harvestInfo: 'Récolter quand le dos de la fleur brunit et les graines sont bien formées.',
    pests: 'Oiseaux (protéger les graines), Limaces (jeunes pousses).',
    companions: ['concombre', 'melon', 'courgette', 'mais'],
    enemies: ['pomme-de-terre'],
    schedule: generateSchedule({ sow_indoor: [3], sow_outdoor: [4, 5], repot: [], harvest: [7, 8, 9] })
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    type: 'fleur',
    emoji: '🌸',
    image: '/pictures/comos.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 14 jours',
    repotting: 'Repiquer après les gelées, espacement 30-40cm.',
    conditions: 'Plein soleil. Sol léger et bien drainé, pas trop riche.',
    description: 'Fleurs très aériennes et colorées, fleurissent jusqu\'aux gelées, attirent papillons et abeilles.',
    harvestInfo: 'Idéal en bouquet. Retirer les fleurs fanées.',
    pests: 'Pucerons (très peu sensible).',
    companions: ['tomate', 'laitue', 'carotte'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9, 10] })
  },
  {
    id: 'bourrache',
    name: 'Bourrache',
    type: 'fleur',
    emoji: '💠',
    image: '/pictures/BOURACHE.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 10 jours',
    repotting: 'Semis direct conseillé. Racine pivotante.',
    conditions: 'Soleil ou mi-ombre. S\'adapte à presque tous les sols.',
    description: 'Fleurs bleues magnifiques en forme d\'étoile, comestibles au léger goût d\'huître. Superbe plante mellifère.',
    harvestInfo: 'Récolter fleurs et jeunes feuilles au printemps et été.',
    pests: 'Très résistante.',
    companions: ['fraise', 'chou', 'tomate', 'courgette'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 5, 8, 9], repot: [], harvest: [4, 5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'zinnia',
    name: 'Zinnia',
    type: 'fleur',
    emoji: '🌺',
    image: '/pictures/zinnia.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 10 jours',
    repotting: 'Repiquer délicatement, racines fragiles.',
    conditions: 'Plein soleil. Chaleur. Sol riche et bien arrosé.',
    description: 'Floraison spectaculaire et longue, idéale en fleurs à couper et pour attirer les papillons.',
    harvestInfo: 'Couper régulièrement pour encourager de nouvelles fleurs.',
    pests: 'Oïdium (éviter de mouiller le feuillage).',
    companions: ['tomate', 'haricot-vert', 'poivron'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9, 10] })
  },
  {
    id: 'myosotis',
    name: 'Myosotis',
    type: 'fleur',
    emoji: '💮',
    image: '/pictures/myosotis.webp',
    seedEmoji: '🌱',
    germinationDays: '14 à 21 jours',
    repotting: 'Semer en été pour floraison l\'année suivante.',
    conditions: 'Ombre ou mi-ombre. Sol frais, humide mais bien drainé.',
    description: 'Généralement bisannuelle (fleurit au printemps). Petites fleurs bleues romantiques, attirent les premiers pollinisateurs.',
    harvestInfo: 'Peu récoltée, surtout ornementale.',
    pests: 'Oïdium (en fin de saison).',
    companions: ['framboisier', 'tulipe'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [5, 6, 7, 8], repot: [8, 9], harvest: [3, 4, 5] })
  },
  {
    id: 'bleuet',
    name: 'Bleuet',
    type: 'fleur',
    emoji: '🪻',
    image: '/pictures/bleuet.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Semis direct de préférence (septembre ou mars).',
    conditions: 'Plein soleil. Sol léger, même pauvre ou calcaire.',
    description: 'Sauvage d\'apparence, délicate, fleur comestible prisée dans les salades estivales. Attire énormément de biodiversité.',
    harvestInfo: 'Récolter en pleine floraison pour utiliser les pétales.',
    pests: 'Assez robuste.',
    companions: ['carotte', 'chou', 'fraise'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 8, 9], repot: [], harvest: [5, 6, 7, 8] })
  },
  {
    id: 'rose-d-inde',
    name: 'Rose d\'Inde',
    type: 'fleur',
    emoji: '🏵️',
    image: '/pictures/rosedinde.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 14 jours',
    repotting: 'Similaire à l\'œillet d\'Inde. Mise en place après gelées.',
    conditions: 'Plein soleil. Sol normal à riche.',
    description: 'Grandes fleurs pompons, excellente compagne repoussant certains parasites du sol (nématodes).',
    harvestInfo: 'Couper les fleurs fanées.',
    pests: 'Limaces (au stade plantule).',
    companions: ['tomate', 'aubergine', 'poivron', 'pomme-de-terre'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9, 10] })
  },
  {
    id: 'coquelicot',
    name: 'Coquelicot',
    type: 'fleur',
    emoji: '🥀',
    image: '/pictures/coquelicot.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 20 jours',
    repotting: 'Déteste le repiquage. Semis direct uniquement.',
    conditions: 'Plein soleil. Sols perturbés ou retournés.',
    description: 'Une touche rouge flamboyante et sauvage. Se ressème tout seul abondamment. Nourrit les abeilles.',
    harvestInfo: 'Les pétales sont comestibles (sirop).',
    pests: 'Pucerons (très rare).',
    companions: ['carotte', 'tournesol', 'bleuet'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 8], repot: [], harvest: [4, 5, 6, 7] })
  },
  {
    id: 'mache',
    name: 'Mâche',
    type: 'légume',
    emoji: '🥗',
    image: '/pictures/mache.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Semis direct en place.',
    conditions: 'Mi-ombre ou soleil doux. Préfère les sols frais et fermes.',
    description: 'La salade d\'hiver par excellence, rustique et riche en oméga-3.',
    harvestInfo: 'Récolter les rosettes au ras du sol avant la floraison.',
    pests: 'Fonte des semis (en cas d\'excès d\'humidité).',
    companions: ['chou', 'poireau', 'carotte'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [7, 8, 9], repot: [], harvest: [9, 10, 11, 0, 1, 2] })
  },
  {
    id: 'menthe',
    name: 'Menthe',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/menthe.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Très envahissante, à planter de préférence en pot ou avec une barrière anti-rhizomes.',
    conditions: 'Mi-ombre, sol riche et frais.',
    description: 'Herbe aromatique très vigoureuse, rafraîchissante, idéale pour infusions et desserts.',
    harvestInfo: 'Cueillir les feuilles au fur et à mesure des besoins, de préférence le matin.',
    pests: 'Chrysomèle de la menthe.',
    companions: ['chou', 'tomate'],
    enemies: ['carotte', 'radis'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [3, 4, 5], repot: [4, 5], harvest: [4, 5, 6, 7, 8, 9] })
  },
  {
    id: 'ciboulette',
    name: 'Ciboulette',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/ciboulette.webp',
    seedEmoji: '🌱',
    germinationDays: '15 à 20 jours',
    repotting: 'Diviser les touffes tous les 3-4 ans.',
    conditions: 'Soleil ou mi-ombre, sol frais, léger et fertile.',
    description: 'Un classique indispensable au goût alliacé fin, produit de belles fleurs violettes comestibles.',
    harvestInfo: 'Couper les feuilles à la base avec des ciseaux au fur et à mesure.',
    pests: 'Pucerons (rare).',
    companions: ['carotte', 'rose', 'fraise'],
    enemies: ['haricot-vert', 'petit-pois'],
    schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [2, 3, 4, 8], repot: [3, 4], harvest: [4, 5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'romarin',
    name: 'Romarin',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/romarin.webp',
    seedEmoji: '🌱',
    germinationDays: '20 à 30 jours (semis lent, bouturage préféré)',
    repotting: 'Repiquage en sol très drainant.',
    conditions: 'Plein soleil, sol léger, pauvre, calcaire et bien drainé.',
    description: 'Arbrisseau aromatique méditerranéen très résistant à la sécheresse.',
    harvestInfo: 'Couper les jeunes tiges toute l\'année selon les besoins.',
    pests: 'Chrysomèle du romarin.',
    companions: ['chou', 'haricot-vert', 'carotte'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5, 8], harvest: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })
  },
  {
    id: 'thym',
    name: 'Thym',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/thym.webp',
    seedEmoji: '🌱',
    germinationDays: '15 à 21 jours',
    repotting: 'Planter en sol très drainant, même rocailleux.',
    conditions: 'Plein soleil, sol léger, calcaire, n\'aime pas l\'humidité stagnante.',
    description: 'Petite plante vivace parfumée, indispensable du bouquet garni et médicinale.',
    harvestInfo: 'Récolter les branches toute l\'année, idéalement juste avant la floraison au printemps pour un maximum de parfum.',
    pests: 'Craint surtout l\'excès d\'eau.',
    companions: ['aubergine', 'pomme-de-terre', 'tomate'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })
  },
  {
    id: 'cresson',
    name: 'Cresson',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/cresson.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 10 jours',
    repotting: 'Semis direct en place ou en jardinière très humide.',
    conditions: 'Mi-ombre, sol gorgé d\'eau ou très régulièrement arrosé.',
    description: 'Une petite salade au goût piquant et poivré, très riche en fer et vitamines.',
    harvestInfo: 'Couper les tiges au ras de l\'eau ou du sol après 1 à 2 mois.',
    pests: 'Altises.',
    companions: ['laitue'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [1, 2], sow_outdoor: [3, 4, 5, 8, 9], repot: [], harvest: [4, 5, 6, 7, 9, 10, 11] })
  },
  {
    id: 'topinambour',
    name: 'Topinambour',
    type: 'légume',
    emoji: '🥔',
    image: '/pictures/topinambour.webp',
    seedEmoji: '🌱',
    germinationDays: 'Plantation de tubercules (15 à 20 jours pour germer)',
    repotting: 'Planter les tubercules à 10 cm de profondeur.',
    conditions: 'Soleil ou mi-ombre, peu exigeant mais aime les sols riches.',
    description: 'Légume racine vivace très rustique au goût proche de l\'artichaut. Attention, peut devenir envahissant.',
    harvestInfo: 'Récolter les tubercules au fur et à mesure des besoins en hiver.',
    pests: 'Campagnols, oïdium blanc.',
    companions: ['mais', 'tournesol'],
    enemies: ['pomme-de-terre', 'tomate'],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4], repot: [], harvest: [10, 11, 0, 1, 2] })
  },
  {
    id: 'chou-rouge',
    name: 'Chou rouge',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/chourouge.webp',
    seedEmoji: '🌱',
    germinationDays: '5 à 10 jours',
    repotting: 'Repiquer profondément à environ 50cm d\'espacement.',
    conditions: 'Soleil, sol riche, lourd et argileux, restant frais.',
    description: 'Superbe chou pommé rustique, croquant, très riche en vitamines et utile pour de longues conservations.',
    harvestInfo: 'Récolter avant les fortes gelées quand la pomme est bien ferme.',
    pests: 'Piéride du chou, pucerons, limaces.',
    companions: ['tomate', 'celeri', 'haricot-vert'],
    enemies: ['ail', 'oignon', 'fraise'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5, 6], harvest: [9, 10, 11] })
  },
  {
    id: 'camomille',
    name: 'Camomille',
    type: 'fleur',
    emoji: '🌼',
    image: '/pictures/camomille.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Repiquage facile, ou laisser se ressemer.',
    conditions: 'Plein soleil, tous types de sols même secs ou pauvres.',
    description: 'Petites fleurs parfumées, incontournables des tisanes calmantes. Plante médicinale douce.',
    harvestInfo: 'Récolter les capitules floraux de préférence le matin une fois la rosée évaporée.',
    pests: 'Pucerons (très rare).',
    companions: ['chou', 'oignon', 'menthe'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [3], sow_outdoor: [4, 5, 8, 9], repot: [4, 5], harvest: [5, 6, 7, 8, 9] })
  },
  {
    id: 'cerfeuil',
    name: 'Cerfeuil',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/Cerfeuil.webp',
    seedEmoji: '🌱',
    germinationDays: '10 à 15 jours',
    repotting: 'Semis direct. Ne supporte pas bien le repiquage.',
    conditions: 'Mi-ombre. Sol frais, léger et riche en humus.',
    description: 'Herbe aromatique au goût subtil, indispensable dans les salades et omelettes printanières.',
    harvestInfo: 'Couper les tiges extérieures selon les besoins avant la floraison.',
    pests: 'Pucerons, limaces (jeunes pousses).',
    companions: ['laitue', 'carotte', 'radis'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [2, 3, 4, 7, 8], repot: [], harvest: [3, 4, 5, 6, 8, 9, 10] })
  },
  {
    id: 'estragon',
    name: 'Estragon',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/estragon.webp',
    seedEmoji: '🌱',
    germinationDays: 'Bouturage ou division préféré (semis très aléatoire)',
    repotting: 'Planter au printemps dans un sol bien drainé.',
    conditions: 'Plein soleil, à l\'abri des vents froids. Sol léger, riche et bien drainé.',
    description: 'Herbe très parfumée, l\'estragon français est incontournable pour la sauce béarnaise.',
    harvestInfo: 'Récolter les feuilles juste avant utilisation, de préférence avant floraison.',
    pests: 'Pucerons (rare)',
    companions: ['tomate', 'haricot-vert', 'aubergine'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [3, 4, 5], repot: [3, 4], harvest: [4, 5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'sauge',
    name: 'Sauge',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/sauge.webp',
    seedEmoji: '🌱',
    germinationDays: '14 à 21 jours',
    repotting: 'Planter en sol très drainé.',
    conditions: 'Plein soleil. Sol léger, même caillouteux ou calcaire.',
    description: 'Plante aromatique et médicinale, au feuillage persistant très décoratif.',
    harvestInfo: 'Récolter les feuilles toute l\'année, mais le parfum est meilleur avant floraison.',
    pests: 'Pucerons, limaces.',
    companions: ['chou', 'carotte', 'romarin'],
    enemies: ['basilic'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })
  },
  {
    id: 'origan',
    name: 'Origan',
    type: 'herbe',
    emoji: '🌿',
    image: '/pictures/origan.webp',
    seedEmoji: '🌱',
    germinationDays: '15 à 20 jours',
    repotting: 'Planter au printemps ou à l\'automne.',
    conditions: 'Soleil. Sols légers, même secs et caillouteux.',
    description: 'Herbe incontournable des pizzas et plats méditerranéens. Très mellifère.',
    harvestInfo: 'Cueillir au fur et à mesure, idéalement juste au début de la floraison pour le sécher.',
    pests: 'Résistant.',
    companions: ['tomate', 'poivron', 'courgette'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5], harvest: [4, 5, 6, 7, 8, 9, 10] })
  },
  {
    id: 'cassis',
    name: 'Cassis',
    type: 'fruit',
    emoji: '🍇',
    image: '/pictures/cassis.webp',
    seedEmoji: '🌱',
    germinationDays: 'Bouturage ou plantation de jeunes plants',
    repotting: 'Creuser un grand trou, ajouter du compost, enterrer légèrement la base des tiges.',
    conditions: 'Soleil ou mi-ombre (dans le Sud). Sols profonds, riches, frais.',
    description: 'Petit arbuste très productif offrant des baies noires acidulées riches en vitamine C.',
    harvestInfo: 'Récolter en juillet, quand les baies sont bien noires et se détachent facilement.',
    pests: 'Pucerons, rouille.',
    companions: ['groseille', 'framboisier', 'pomme-de-terre'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [10, 11, 0, 1, 2], repot: [], harvest: [6, 7] })
  },
  {
    id: 'groseille',
    name: 'Groseille',
    type: 'fruit',
    emoji: '🍒',
    image: '/pictures/grosseil.webp',
    seedEmoji: '🌱',
    germinationDays: 'Bouturage ou plantation',
    repotting: 'Planter de novembre à mars hors gel.',
    conditions: 'Mi-ombre ou soleil non brûlant. Sols frais, consistants.',
    description: 'Petites grappes de baies rouges acidulées, parfaites pour les confitures et gelées.',
    harvestInfo: 'Cueillir grappe par grappe à pleine maturité en été.',
    pests: 'Oiseaux, pucerons, tenthrède.',
    companions: ['cassis', 'laitue', 'oignon'],
    enemies: [],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [10, 11, 0, 1, 2], repot: [], harvest: [5, 6, 7] })
  },
  {
    id: 'endive',
    name: 'Endive (Chicon)',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/Endive.webp',
    seedEmoji: '🌱',
    germinationDays: '8 à 14 jours',
    repotting: 'Nécessite un forçage (arracher les racines, couper le feuillage d\'été et les remettre en terre/bac dans le noir).',
    conditions: 'Soleil en été pour la racine, puis obscurité totale et fraîcheur l\'hiver pour forcer le chicon.',
    description: 'Culture en deux temps: champ l\'été pour la racine, cave l\'hiver pour la pousse blanche de l\'endive croquante et légèrement amère.',
    harvestInfo: 'Casser l\'endive développée sur la racine en hiver, dans l\'obscurité.',
    pests: 'Mouche de l\'endive, pourriture.',
    companions: ['poireau', 'radis', 'carotte'],
    enemies: ['chou'],
    schedule: generateSchedule({ sow_indoor: [], sow_outdoor: [4, 5], repot: [], harvest: [10, 11, 0, 1, 2, 3] })
  },
  {
    id: 'patisson',
    name: 'Pâtisson',
    type: 'légume',
    emoji: '🛸',
    image: '/pictures/patisson.webp',
    seedEmoji: '🌱',
    germinationDays: '7 à 10 jours',
    repotting: 'Repiquer après les gelées en laissant beaucoup d\'espace.',
    conditions: 'Plein soleil, terre riche et bien fumée, arrosage régulier.',
    description: 'Petite courge en forme de soucoupe volante, avec un léger goût de fond d\'artichaut.',
    harvestInfo: 'Se récolte très jeune pour la tendreté (peau souple) ou mûr pour la conservation (peau dure).',
    pests: 'Oïdium, limaces, pucerons.',
    companions: ['mais', 'haricot-vert', 'capucine'],
    enemies: ['pomme-de-terre', 'tomate'],
    schedule: generateSchedule({ sow_indoor: [3, 4], sow_outdoor: [4, 5], repot: [4, 5], harvest: [6, 7, 8, 9] }),
    sensitivity: { cold: true, heat: false }
  },
  {
    id: 'celeri-branche',
    name: 'Céleri branche',
    type: 'légume',
    emoji: '🥬',
    image: '/pictures/celeribranche.webp',
    seedEmoji: '🌱',
    germinationDays: '15 à 20 jours (lent)',
    repotting: 'Au stade de 4-5 feuilles, planter à environ 30 cm de distance.',
    conditions: 'Sol très riche, frais et humide. Mi-ombre ou soleil doux.',
    description: 'Fameux légume croquant et filandreux, utilisé autant en crudité qu\'en base de bouquet garni.',
    harvestInfo: 'On le fait parfois blanchir (en le buttant ou le couvrant) avant récolte pour l\'adoucir.',
    pests: 'Mouche du céleri, pucerons, limaces.',
    companions: ['chou', 'tomate', 'poireau', 'endive'],
    enemies: ['persil', 'mais'],
    schedule: generateSchedule({ sow_indoor: [2, 3], sow_outdoor: [4, 5], repot: [4, 5, 6], harvest: [7, 8, 9, 10] })
  }
];

export const TIPS = [
  {
    title: "Rotation des cultures",
    icon: "🔄",
    content: "Ne plantez pas la même famille de légumes (ex: tomates, poivrons, pommes de terre) au même endroit deux années de suite pour éviter les maladies et ne pas épuiser le sol."
  },
  {
    title: "L'arrosage malin",
    icon: "💧",
    content: "Arrosez tôt le matin ou tard le soir pour limiter l'évaporation. Évitez de mouiller le feuillage des tomates et courgettes pour prévenir le mildiou et l'oïdium."
  },
  {
    title: "Le paillage",
    icon: "🌾",
    content: "Couvrez le sol avec de la paille, de la tonte de pelouse sèche ou des feuilles mortes. Cela garde l'humidité, nourrit le sol et empêche les mauvaises herbes de pousser."
  },
  {
    title: "Attirer les alliés",
    icon: "🐝",
    content: "Plantez des fleurs (soucis, lavande, bourrache) pour attirer les abeilles et les papillons. C'est essentiel pour la pollinisation de vos légumes-fruits !"
  }
];

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
