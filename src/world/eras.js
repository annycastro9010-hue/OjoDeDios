// Definición de Eras Históricas del Mundo (Líneas de Tiempo)

export const ERAS = {
  BIBLICAL: {
    id: 'biblical',
    name: 'Albores Bíblicos (Tras Caín y Abel)',
    year: 'Año 33',
    icon: '🕊️',
    description: 'Los primeros humanos fundan la civilización. Adán y Eva recuerdan el Edén, Caín busca redención labrando la tierra y Abel cuida los rebaños junto al Altar.',
    roles: ['prophet', 'fisherman', 'cultivator', 'child', 'healer'],
    questTitle: 'LA PRIMERA OFRENDA AL CREADOR',
    questDesc: 'Cosecha 2 fardos de espigas doradas y ofréndalos en el Altar Sagrado de Dios para traer bendición al clan.',
    mapPreset: 'biblical',
    themeColor: '#f59e0b'
  },
  SEVENTIES: {
    id: 'seventies',
    name: 'Comuna de Paz (Años 70 - Bob Marley)',
    year: '1976',
    icon: '☮️',
    description: 'Festival de amor libre, melodías de guitarra bajo el cielo y cultivo ecológico en armonía.',
    roles: ['musician', 'hippie', 'healer', 'cultivator', 'child'],
    questTitle: 'EL CONCIERTO DE LA PAZ',
    questDesc: 'Comparte 2 flores de la armonía con la multitud y toca junto al gran escenario de madera.',
    mapPreset: 'seventies',
    themeColor: '#10b981'
  },
  EIGHTIES: {
    id: 'eighties',
    name: 'Imperio Clandestino (Años 80 - Carteles)',
    year: '1985',
    icon: '💰',
    description: 'Pistas secretas, hacienda con piscina privada, capos y avionetas de contrabando.',
    roles: ['cultivator', 'boss', 'police', 'child'],
    questTitle: 'OPERACIÓN: CARGAMENTO NOCTURNO',
    questDesc: 'Lleva 2 fardos de mercancía al almacén clandestino esquivando los retenes policiales.',
    mapPreset: 'eighties',
    themeColor: '#38bdf8'
  },
  FORTIES: {
    id: 'forties',
    name: 'Frente de Resistencia (Años 40)',
    year: '1944',
    icon: '⚔️',
    description: 'Trincheras zigzagueantes, búnker de mando blindado, hospital de campaña y partisanos de la resistencia civil.',
    roles: ['soldier', 'medic', 'cultivator', 'child'],
    questTitle: 'SUMINISTROS PARA EL FRENTE',
    questDesc: 'Transporta 2 botiquines médicos al búnker fortificado a través de la línea de trincheras.',
    mapPreset: 'forties',
    themeColor: '#94a3b8'
  },
  COLOMBIA: {
    id: 'colombia',
    name: 'Realidad Macondo (Selva, Retenes y Cuadrante)',
    year: '2026',
    icon: '🇨🇴',
    description: 'Trochas de barro, retenes guerrilleros, patrullas de policía pidiendo pa la gaseosa, mototaxistas suicidas y vendedores de aguacates.',
    roles: ['police_cuadrante', 'guerrillero', 'mototaxista', 'vendedor', 'vecina_chismosa', 'alcalde', 'cultivator', 'child'],
    questTitle: 'EL REBUSQUE NACIONAL',
    questDesc: 'Sobrevive a la trocha y a los retenes, esquiva los comparendos y entrega los víveres en la tienda comunitaria.',
    mapPreset: 'colombia',
    themeColor: '#facc15'
  },
  HYRULE: {
    id: 'hyrule',
    name: 'Ciudadela de Hyrule (The Minish Cap)',
    year: 'Era de la Leyenda',
    icon: '🗡️',
    description: 'Ciudadela amurallada de estilo 16-bit GBA: tejados curvos multicolores, gran plaza con fuente de mármol y bazares, canal con molino y rueda hidráulica giratoria, puerta monumental del castillo y jardineras floridas.',
    roles: ['hero', 'farmer', 'child', 'healer', 'prophet'],
    questTitle: 'EL SECRETO DE LA CIUDADELA',
    questDesc: 'Recorre la gran plaza, cruza los puentes del canal hacia el molino de agua y visita el dojo de los maestros.',
    mapPreset: 'hyrule',
    themeColor: '#22c55e'
  },
  GENESIS: {
    id: 'genesis',
    name: 'Génesis (Mundo Virgen desde Cero)',
    year: 'Año 1 - Creación',
    icon: '🌱',
    description: 'Naturaleza virgen sin construcciones. Los primeros colonos recolectan madera, pican piedra, descubren el fuego y aprenden a construir su civilización desde cero.',
    roles: ['cultivator', 'child'],
    questTitle: 'EL NACIMIENTO DE LA CIVILIZACIÓN',
    questDesc: 'Corta árboles, reúne madera y piedra para que los colonos aprendan a construir su primera choza.',
    mapPreset: 'genesis',
    themeColor: '#10b981'
  }
};

