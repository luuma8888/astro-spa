const CONSTELLATION_LABELS = {
  And: { fr: 'Andromède', en: 'Andromeda' },
  Ant: { fr: 'Machine pneumatique', en: 'Antlia' },
  Aps: { fr: 'Oiseau de paradis', en: 'Apus' },
  Aql: { fr: 'Aigle', en: 'Aquila' },
  Aqr: { fr: 'Verseau', en: 'Aquarius' },
  Ara: { fr: 'Autel', en: 'Ara' },
  Ari: { fr: 'Bélier', en: 'Aries' },
  Aur: { fr: 'Cocher', en: 'Auriga' },
  Boo: { fr: 'Bouvier', en: 'Boötes' },
  CMa: { fr: 'Grand Chien', en: 'Canis Major' },
  CMi: { fr: 'Petit Chien', en: 'Canis Minor' },
  CVn: { fr: 'Chiens de chasse', en: 'Canes Venatici' },
  Cae: { fr: 'Burin', en: 'Caelum' },
  Cam: { fr: 'Girafe', en: 'Camelopardalis' },
  Cap: { fr: 'Capricorne', en: 'Capricornus' },
  Car: { fr: 'Carène', en: 'Carina' },
  Cas: { fr: 'Cassiopée', en: 'Cassiopeia' },
  Cen: { fr: 'Centaure', en: 'Centaurus' },
  Cep: { fr: 'Céphée', en: 'Cepheus' },
  Cet: { fr: 'Baleine', en: 'Cetus' },
  Cha: { fr: 'Caméléon', en: 'Chamaeleon' },
  Cir: { fr: 'Compas', en: 'Circinus' },
  Cnc: { fr: 'Cancer', en: 'Cancer' },
  Col: { fr: 'Colombe', en: 'Columba' },
  Com: { fr: 'Chevelure de Bérénice', en: 'Coma Berenices' },
  CrA: { fr: 'Couronne australe', en: 'Corona Australis' },
  CrB: { fr: 'Couronne boréale', en: 'Corona Borealis' },
  CrV: { fr: 'Corbeau', en: 'Corvus' },
  Crt: { fr: 'Coupe', en: 'Crater' },
  Cru: { fr: 'Croix du Sud', en: 'Crux' },
  Cyg: { fr: 'Cygne', en: 'Cygnus' },
  Del: { fr: 'Dauphin', en: 'Delphinus' },
  Dor: { fr: 'Dorade', en: 'Dorado' },
  Dra: { fr: 'Dragon', en: 'Draco' },
  Equ: { fr: 'Petit Cheval', en: 'Equuleus' },
  Eri: { fr: 'Éridan', en: 'Eridanus' },
  For: { fr: 'Fourneau', en: 'Fornax' },
  Gem: { fr: 'Gémeaux', en: 'Gemini' },
  Gru: { fr: 'Grue', en: 'Grus' },
  Her: { fr: 'Hercule', en: 'Hercules' },
  Hor: { fr: 'Horloge', en: 'Horologium' },
  Hya: { fr: 'Hydre', en: 'Hydra' },
  Hyi: { fr: 'Hydre mâle', en: 'Hydrus' },
  Ind: { fr: 'Indien', en: 'Indus' },
  Lac: { fr: 'Lézard', en: 'Lacerta' },
  Leo: { fr: 'Lion', en: 'Leo' },
  Lep: { fr: 'Lièvre', en: 'Lepus' },
  Lib: { fr: 'Balance', en: 'Libra' },
  LMi: { fr: 'Petit Lion', en: 'Leo Minor' },
  Lup: { fr: 'Loup', en: 'Lupus' },
  Lyn: { fr: 'Lynx', en: 'Lynx' },
  Lyr: { fr: 'Lyre', en: 'Lyra' },
  Men: { fr: 'Table', en: 'Mensa' },
  Mic: { fr: 'Microscope', en: 'Microscopium' },
  Mon: { fr: 'Licorne', en: 'Monoceros' },
  Mus: { fr: 'Mouche', en: 'Musca' },
  Nor: { fr: 'Règle', en: 'Norma' },
  Oct: { fr: 'Octant', en: 'Octans' },
  Oph: { fr: 'Ophiuchus', en: 'Ophiuchus' },
  Ori: { fr: 'Orion', en: 'Orion' },
  Pav: { fr: 'Paon', en: 'Pavo' },
  Peg: { fr: 'Pégase', en: 'Pegasus' },
  Per: { fr: 'Persée', en: 'Perseus' },
  Phe: { fr: 'Phénix', en: 'Phoenix' },
  Pic: { fr: 'Peintre', en: 'Pictor' },
  PsA: { fr: 'Poisson austral', en: 'Piscis Austrinus' },
  Psc: { fr: 'Poissons', en: 'Pisces' },
  Pup: { fr: 'Poupe', en: 'Puppis' },
  Pyx: { fr: 'Boussole', en: 'Pyxis' },
  Ret: { fr: 'Réticule', en: 'Reticulum' },
  Scl: { fr: 'Sculpteur', en: 'Sculptor' },
  Sco: { fr: 'Scorpion', en: 'Scorpius' },
  Sct: { fr: 'Écu de Sobieski', en: 'Scutum' },
  Ser: { fr: 'Serpent', en: 'Serpens' },
  Sex: { fr: 'Sextant', en: 'Sextans' },
  Sge: { fr: 'Flèche', en: 'Sagitta' },
  Sgr: { fr: 'Sagittaire', en: 'Sagittarius' },
  Tau: { fr: 'Taureau', en: 'Taurus' },
  Tel: { fr: 'Télescope', en: 'Telescopium' },
  TrA: { fr: 'Triangle austral', en: 'Triangulum Australe' },
  Tri: { fr: 'Triangle', en: 'Triangulum' },
  Tuc: { fr: 'Toucan', en: 'Tucana' },
  UMa: { fr: 'Grande Ourse', en: 'Ursa Major' },
  UMi: { fr: 'Petite Ourse', en: 'Ursa Minor' },
  Vel: { fr: 'Voiles', en: 'Vela' },
  Vir: { fr: 'Vierge', en: 'Virgo' },
  Vol: { fr: 'Poisson volant', en: 'Volans' },
  Vul: { fr: 'Petit Renard', en: 'Vulpecula' }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function getConstellationLabel(constellation) {
  if (!constellation) {
    return { short: 'n/a', fr: 'n/a', en: 'n/a', title: 'n/a' };
  }

  const match = CONSTELLATION_LABELS[constellation.abbr];
  const en = match?.en ?? constellation.name ?? constellation.abbr ?? 'n/a';
  const fr = match?.fr ?? en;
  const short = fr === en ? fr : `${fr}`;
  const title = fr === en ? en : `${fr} (${en})`;

  return { short, fr, en, title };
}

export function formatConstellationLabelHtml(constellation) {
  const label = getConstellationLabel(constellation);
  return `<span title="${escapeHtml(label.title)}">${escapeHtml(label.short)}</span>`;
}
