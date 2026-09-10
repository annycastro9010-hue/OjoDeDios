// Definición de elementos y propiedades físicas / químicas
export const ELEM = {
  EMPTY: 0,
  WATER: 1,
  DIRT: 2,
  FERTILE_DIRT: 3,
  SEED: 4,
  PLANT: 5,
  PLANT_BLOOM: 6, // Flor madura / hierba clandestina cosechable
  FIRE: 7,
  SMOKE: 8,
  ASH: 9,
  STONE: 10,
  ROAD: 11,
  BUILDING: 12,
  SAND: 13,
  LAVA: 14
};

export const ELEM_PROPS = {
  [ELEM.EMPTY]: {
    name: 'Aire',
    color: '#0a0f1d',
    isSolid: false,
    isLiquid: false,
    flammable: false
  },
  [ELEM.WATER]: {
    name: 'Agua',
    color: '#2882db',
    isSolid: false,
    isLiquid: true,
    flammable: false,
    density: 1.0
  },
  [ELEM.DIRT]: {
    name: 'Tierra',
    color: '#8b5a2b',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.FERTILE_DIRT]: {
    name: 'Tierra Fértil',
    color: '#3d2314',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.SEED]: {
    name: 'Semilla',
    color: '#e2bb38',
    isSolid: true,
    isLiquid: false,
    flammable: true
  },
  [ELEM.PLANT]: {
    name: 'Brote Verde',
    color: '#2ea33d',
    isSolid: true,
    isLiquid: false,
    flammable: true
  },
  [ELEM.PLANT_BLOOM]: {
    name: 'Hierba Clandestina (Madura)',
    color: '#00e676',
    isSolid: true,
    isLiquid: false,
    flammable: true
  },
  [ELEM.FIRE]: {
    name: 'Fuego',
    color: '#ff4d00',
    isSolid: false,
    isLiquid: false,
    flammable: false
  },
  [ELEM.SMOKE]: {
    name: 'Humo',
    color: 'rgba(180, 180, 180, 0.6)',
    isSolid: false,
    isLiquid: false,
    flammable: false
  },
  [ELEM.ASH]: {
    name: 'Ceniza',
    color: '#555555',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.STONE]: {
    name: 'Roca',
    color: '#6b7280',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.ROAD]: {
    name: 'Sendero',
    color: '#a38258',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.BUILDING]: {
    name: 'Estructura / Casa',
    color: '#473c35',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.SAND]: {
    name: 'Arena de Desierto',
    color: '#d4b16a',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.LAVA]: {
    name: 'Magma / Lava',
    color: '#e11d48',
    isSolid: false,
    isLiquid: true,
    flammable: false
  }
};
