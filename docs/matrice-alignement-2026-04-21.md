# Matrice d'alignement

Date: 2026-04-21

## But

Faire le point entre le document de reference `architecture_app_astronomique_astrologique.md` et le code actuellement present dans le depot local.

Cette matrice ne recopie pas les 164 sections une a une. Elle les regroupe en lots techniques utiles pour piloter la suite du projet.

## Lecture rapide

- `present`: implemente et branche dans le flux principal
- `partiel`: implemente mais encore incomplet, simplifie ou non stabilise
- `absent`: non implemente
- `en cours`: code local deja present, mais lot pas encore commit au moment de cette mise a jour

## Etat global

| Bloc | Sections de reference | Statut | Fichiers principaux | Commentaire |
| --- | --- | --- | --- | --- |
| Arborescence, separation des couches, pipeline general | 1 a 14 | present | `index.html`, `js/core/*`, `js/astronomy/*`, `js/astrology/*`, `js/domain/*`, `js/ui/*`, `js/storage/*` | La structure modulaire voulue existe et le flux global est en place. |
| Socle de donnees et calculs astronomiques | 15 a 41 | present | `js/data/*`, `js/astronomy/*`, `js/domain/chartBuilder.js` | Soleil, Lune, planetes, noeuds, phase lunaire, rise/set et aspects sont branches. |
| Visualisation et transits, premiere roue | 42 a 54 | present | `js/ui/renderChartWheel.js`, `js/domain/transits.js`, `js/ui/renderTransits.js`, `index.html` | Les panneaux sont branches et utilisables. |
| Phase 1: controles projet, stockage, reglages, UX de base | 55 a 78 | present | `js/app.js`, `js/storage/localDb.js`, `js/storage/settings.js`, `assets/styles.css`, `index.html` | Sauvegarde, brouillons, import/export et filtres de transits sont relies a l'interface. |
| Phase 2: synthese et niveaux de lecture | 79 a 128 | present | `js/domain/synthesis.js`, `js/ui/renderSynthesis.js`, `js/domain/transits.js`, `js/ui/renderTransits.js` | La synthese existe, avec niveaux `short / medium / long` et lecture des transits plus structuree. |
| Clarification des resultats et familles de calcul | hors document initial explicite | present | `js/ui/renderClarifications.js`, `js/ui/renderCalculationGroups.js`, `js/ui/renderSummary.js`, `js/ui/renderBodies.js` | Ajout utile pour expliciter ce qui est calcule et ce qui ne l'est pas encore. |
| Precision Soleil / Lune et validation | hors document initial explicite | present | `js/astronomy/sun.js`, `js/astronomy/moon.js`, `js/astronomy/moonPhases.js`, `js/astronomy/riseSet.js`, `tools/*`, `docs/validation-precision.md` | Le moteur a ete renforce et un harnais de validation officiel existe maintenant. |
| Constellations polygonales reelles et outillage de conversion | 129 a 164 | partiel | `js/data/constellationsRoman87.js`, `js/data/constellationsPolygons.js`, `js/astrology/constellations.js`, `tools/convert-constellation-roman87.js`, `tools/convert-constellation-boundaries.js`, `tools/generate-synthetic-constellation-boundaries.mjs`, `tools/validate-constellations.mjs` | Determination exacte branchee via Roman 1987 + precession B1875. La couche polygonale reste complete en couverture mais encore synthetique. |
| Constellation lunaire courante et prochain passage | extension locale | present | `js/astronomy/moonConstellationTransitions.js`, `js/domain/chartBuilder.js`, `js/ui/renderBodies.js` | Calculee et rendue dans l interface. |

## Detail par lot

### 1. Socle applicatif

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Formulaire natal principal | present | `index.html`, `js/app.js` | Lecture, validation, calcul et rendu complets. |
| Validation d'entree | present | `js/domain/validators.js` | Branchee dans natal et transits. |
| Orchestration centrale | present | `js/app.js` | Flux principal centralise et coherent. |
| Etat UI minimal | present | `js/ui/state.js` | Utilise pour la carte courante, l'entree courante, le niveau de synthese et le resultat de transit courant. |
| Contrats de donnees formalises | present | `js/domain/chartModel.js`, `js/domain/calculationGroups.js` | Le modele expose des groupes de calculs, presentations dediees et metadonnees de precision/usage. |

### 2. Stockage et persistance

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Sauvegarde locale de la carte | present | `js/storage/localDb.js`, `js/app.js` | Sauvegarde et restauration effectives. |
| Sauvegarde des reglages | present | `js/storage/settings.js`, `js/app.js` | `houseSystem`, `ayanamsa` et `synthesisLevel` sont persistants. |
| Brouillons de formulaires | present | `js/app.js` | Les deux formulaires sont restaures localement. |
| Export JSON | present | `js/storage/exportImport.js`, `js/app.js` | Expose dans l'UI. |
| Import JSON | present | `js/storage/exportImport.js`, `js/app.js` | Expose dans l'UI, avec regeneration de cartes anciennes si necessaire. |
| Historique multi-cartes | absent | aucun | Une seule carte est geree localement. |

### 3. UI et experience

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Resume technique | present | `js/ui/renderSummary.js` | Affiche le contexte astronomique et les angles. |
| Cles de lecture | present | `js/ui/renderClarifications.js` | Explique ce a quoi correspondent les calculs. |
| Familles de calcul | present | `js/ui/renderCalculationGroups.js` | Range les resultats par categorie: astronomie, astro, lunaire, symbolique, non implemente. |
| Corps celestes | present | `js/ui/renderBodies.js` | Affiche signes, maisons et constellation. |
| Maisons | present | `js/ui/renderHouses.js` | Branche dans le flux principal. |
| Symbolique | present | `js/ui/renderSymbolic.js` | Y-King branche, Human Design explicitement non implemente. |
| Aspects | present | `js/ui/renderAspects.js` | Branche dans le flux principal. |
| Phase lunaire | present | `js/ui/renderMoonPhase.js` | Affiche phase, age, illumination et angle de phase. |
| Lever / coucher | present | `js/ui/renderRiseSet.js` | Branche dans le flux principal. |
| Roue du theme | partiel | `js/ui/renderChartWheel.js` | Fonctionnelle mais encore simple visuellement et geometriquement. |
| Panneau transits | present | `js/ui/renderTransits.js` | Filtrage, synthese et detail branches. |
| Synthese automatique du theme | present | `js/ui/renderSynthesis.js` | Niveau court, moyen, long. |

### 4. Calculs et interpretation

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Soleil apparent ameliore | present | `js/astronomy/sun.js`, `js/core/obliquity.js` | Longitude apparente, distance et obliquite plus propres qu'au depart. |
| Lune amelioree | present | `js/astronomy/moon.js` | Plus de termes utilises que dans la version initiale. |
| Phase lunaire geometrique | present | `js/astronomy/moonPhases.js` | Illumination basee sur une geometrie plus realiste Soleil-Terre-Lune. |
| Lever / coucher iteratifs | present | `js/astronomy/riseSet.js` | Recherche iterative sur la journee locale, avec correction d'horizon Soleil / Lune. |
| Maisons et angles | present | `js/astrology/houses.js` | Plusieurs systemes relies a l'UI. |
| Zodiaque tropical et sideral | present | `js/astrology/zodiacTropical.js`, `js/astrology/zodiacSidereal.js` | `ayanamsa` branche. |
| Aspects natals | present | `js/astrology/aspects.js` | Utilises dans le theme et la roue. |
| Comparaison de transits | present | `js/domain/transits.js` | Lecture structuree avec filtres. |
| Synthese theme + transits | present | `js/domain/synthesis.js`, `js/domain/transits.js` | La synthese existe dans plusieurs niveaux, mais reste encore perfectible redactionnellement. |
| Constellation lunaire courante + prochain passage | en cours | `js/astronomy/moonConstellationTransitions.js`, `js/domain/chartBuilder.js`, `js/ui/renderBodies.js` | Lot local non commit au moment de cette matrice. |

### 5. Validation et outillage

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Harnais de validation precision Soleil / Lune | present | `package.json`, `tools/validate-precision.mjs`, `tools/precision-fixtures.js`, `docs/validation-precision.md` | Validation sur fixtures officielles USNO. |
| Cas standards multiplateformes horaires | present | `tools/precision-fixtures.js` | Couvre offsets entiers et fractionnaires. |
| Cas limites hautes latitudes dans suite stricte | partiel | `docs/validation-precision.md` | Documentes comme limite connue, pas encore inclus dans la suite stricte. |
| Validation des constellations reelles | partiel | `tools/validate-constellations.mjs` | Validation structurelle, mesure de couverture et controle de coherence Roman87 presentes, mais pas encore de verification scientifique exhaustive du maillage. |

### 6. Donnees reelles de constellations

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Constellations optimisees simplifiees | present | `js/data/constellationsOptimized.js`, `js/astrology/constellations.js` | Solution legere exploitable aujourd'hui. |
| Dataset Roman87 exact | present | `js/data/constellationsRoman87.js`, `js/core/precession.js`, `js/astrology/constellations.js` | 357 lignes de limites Roman87 et 88 noms IAU charges; la determination exacte precesse les coordonnees vers B1875 avant test. |
| Dataset polygonal reel | partiel | `js/data/constellationsPolygons.js` | Couverture complete 88/88, mais jeu courant synthetique base sur les rectangles de `constellationsOptimized.js`. |
| Script de conversion Roman87 | present | `tools/convert-constellation-roman87.js` | Convertit les fichiers de reference telecharges vers un module JS consomme par l application. |
| Script de conversion | present | `tools/convert-constellation-boundaries.js` | Convertit une source JSON ou texte delimitee vers le module JS consomme par l application. |
| Generation dataset de transition | present | `tools/generate-synthetic-constellation-boundaries.mjs` | Produit un jeu polygonal complet de transition a partir des bornes optimisees. |
| Validation du dataset | partiel | `tools/validate-constellations.mjs` | Controle la structure, la couverture, le type de source polygonale et la coherence du jeu Roman87. |

## Ce qui est effectivement termine

- La Phase 1 definie dans le document de reference est globalement terminee.
- La Phase 2 utile est deja bien engagee et plus avancee que dans la premiere matrice.
- Le moteur Soleil / Lune a ete renforce et il est maintenant appuye par une validation locale exploitable.
- Le projet peut deja calculer, visualiser, sauvegarder, recharger, comparer et expliquer une carte de facon nettement plus claire qu'au depart.

## Ce qui reste partiel ou ouvert

- La roue reste un rendu utile mais pas encore mature.
- La determination de constellation est maintenant fiable structurellement via Roman87, mais la couche polygonale auxiliaire n'est pas encore basee sur les frontieres IAU exactes.
- Les cas extremes de Lune continuellement au-dessus ou au-dessous de l'horizon restent hors suite stricte de validation.

## Ecart principal avec le document d'architecture

L'ecart principal n'est plus la structure generale ni le flux applicatif.

L'ecart principal est maintenant:

1. l'absence d'un vrai dataset polygonal exact pour remplacer le jeu synthetique de transition
2. le manque de couverture des cas limites lunaires dans la validation stricte
3. la roue encore fonctionnelle mais pas mature visuellement et geometriquement

## Prochaines etapes recommandees

### Etape immediate

Maintenir Roman87 comme source exacte, puis remplacer le dataset polygonal synthetique par une vraie source de frontieres:

- `npm run generate:constellations:synthetic`
- `npm run convert:constellations`
- `npm run convert:constellations:roman87`
- `npm run validate:constellations`

### Etape technique majeure restante

Ouvrir le chantier des constellations polygonales reelles prevu par les sections 129 a 164:

1. remplacer `tools/raw-constellation-boundaries.json` par une source IAU / VI-49 convertie
2. regenerer `js/data/constellationsPolygons.js`
3. ajouter ensuite une verification geometrique plus forte sur un echantillon de points connus

## Backlog priorise

| Priorite | Action | Pourquoi maintenant |
| --- | --- | --- |
| P1 | Remplacer le dataset polygonal synthetique par un dataset polygonal exact | La determination exacte est deja couverte par Roman87; le goulot restant est la fidelite de la couche polygonale. |
| P2 | Etendre la validation de precision a plus de cas et a plus de sorties | Pour fiabiliser davantage Soleil / Lune. |
| P3 | Reprendre la roue et les raffinements UI | Le socle metier est deja nettement plus solide que la couche visuelle. |

## Decision pratique

Si l'objectif est d'avancer en restant aligne avec le document, le prochain lot le plus juste est:

`injecter un vrai dataset polygonal exact, puis ajouter une validation geometrique plus forte`
