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
  LAVA: 14,
  WOOD: 15,
  CAMPFIRE: 16,
  GOLD: 17,
  CHASM: 18,
  RUBBLE: 19,
  CLIFF: 20,    // Muro/Acantilado con desnivel vertical y sombra
  FENCE: 21,    // Cerca de madera con postes y travesaños
  TREE: 22,     // Árbol volumétrico esférico estilo Minish Cap
  LADDER: 23    // Escalera de madera para trepar acantilados
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
  },
  [ELEM.WOOD]: {
    name: 'Madera / Tronco',
    color: '#854d0e',
    isSolid: true,
    isLiquid: false,
    flammable: true
  },
  [ELEM.CAMPFIRE]: {
    name: 'Fogata Comunal',
    color: '#f97316',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.GOLD]: {
    name: 'Oro / Mineral Sagrado',
    color: '#facc15',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.CHASM]: {
    name: 'Grieta Tectónica / Falla',
    color: '#05070d',
    isSolid: false,
    isLiquid: false,
    flammable: false
  },
  [ELEM.RUBBLE]: {
    name: 'Escombros / Derrumbe',
    color: '#71717a',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.CLIFF]: {
    name: 'Acantilado / Muro de Piedra',
    color: '#475569',
    isSolid: true,
    isLiquid: false,
    flammable: false
  },
  [ELEM.FENCE]: {
    name: 'Cerca de Madera',
    color: '#a16207',
    isSolid: true,
    isLiquid: false,
    flammable: true
  },
  [ELEM.TREE]: {
    name: 'Árbol Frondoso Minish',
    color: '#15803d',
    isSolid: true, // El tronco es sólido
    isLiquid: false,
    flammable: true
  },
  [ELEM.LADDER]: {
    name: 'Escalera de Mano',
    color: '#b45309',
    isSolid: false, // Transitable para subir desniveles
    isLiquid: false,
    flammable: true
  }
};
