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
| Constellations polygonales reelles et outillage de conversion | 129 a 164 | absent | aucun equivalent branche | Le projet reste base sur des constellations optimisees simplifiees. |
| Constellation lunaire courante et prochain passage | extension locale | en cours | `js/astronomy/moonConstellationTransitions.js`, `js/domain/chartBuilder.js`, `js/ui/renderBodies.js` | Lot local non commit au moment de cette matrice. |

## Detail par lot

### 1. Socle applicatif

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Formulaire natal principal | present | `index.html`, `js/app.js` | Lecture, validation, calcul et rendu complets. |
| Validation d'entree | present | `js/domain/validators.js` | Branchee dans natal et transits. |
| Orchestration centrale | present | `js/app.js` | Flux principal centralise et coherent. |
| Etat UI minimal | present | `js/ui/state.js` | Utilise pour la carte courante, l'entree courante, le niveau de synthese et le resultat de transit courant. |
| Contrats de donnees formalises | partiel | `js/domain/chartModel.js` | Le modele existe mais reste leger. Pas encore de schema riche par famille de calcul. |

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
| Validation des constellations reelles | absent | aucun | Depend du futur chantier polygonal. |

### 6. Donnees reelles de constellations

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Constellations optimisees simplifiees | present | `js/data/constellationsOptimized.js`, `js/astrology/constellations.js` | Solution legere exploitable aujourd'hui. |
| Dataset polygonal reel | absent | aucun | `js/data/constellationsPolygons.js` absent. |
| Script de conversion | absent | aucun equivalent a `tools/convert-constellation-boundaries.js` | Le document le prevoit mais il n'est pas encore implemente. |
| Validation du dataset | absent | aucun | Aucun outillage de verification polygonale. |

## Ce qui est effectivement termine

- La Phase 1 definie dans le document de reference est globalement terminee.
- La Phase 2 utile est deja bien engagee et plus avancee que dans la premiere matrice.
- Le moteur Soleil / Lune a ete renforce et il est maintenant appuye par une validation locale exploitable.
- Le projet peut deja calculer, visualiser, sauvegarder, recharger, comparer et expliquer une carte de facon nettement plus claire qu'au depart.

## Ce qui reste partiel ou ouvert

- `js/domain/chartModel.js` ne joue pas encore le role d'un vrai contrat de donnees riche.
- La roue reste un rendu utile mais pas encore mature.
- La couche de constellations reelles polygonales prevue aux sections 129 a 164 n'est pas commencee.
- Les cas extremes de Lune continuellement au-dessus ou au-dessous de l'horizon restent hors suite stricte de validation.
- Le lot local sur la constellation de la Lune et son prochain passage est en cours mais non commit au moment de cette mise a jour.

## Ecart principal avec le document d'architecture

L'ecart principal n'est plus la structure generale ni le flux applicatif.

L'ecart principal est maintenant:

1. l'absence des constellations polygonales reelles et de leur outillage
2. l'absence d'un modele de donnees de calculs plus formalise
3. le manque de couverture des cas limites lunaires dans la validation stricte

## Prochaines etapes recommandees

### Etape immediate

Committer le lot local en cours:

- `js/astronomy/moonConstellationTransitions.js`
- mise a jour de `js/domain/chartBuilder.js`
- mise a jour de `js/ui/renderBodies.js`
- extension des fixtures et de la documentation de validation

### Etape suivante la plus structurante

Normaliser les resultats de calcul dans le domaine, avec une structure du type:

- valeur
- unite
- categorie
- methode
- precision attendue
- usage

Le but est d'eviter que la clarification reste seulement dans l'UI.

### Etape technique majeure restante

Ouvrir le chantier des constellations polygonales reelles prevu par les sections 129 a 164:

1. ajouter `js/data/constellationsPolygons.js`
2. remplacer ou doubler `js/astrology/constellations.js`
3. ajouter un script de conversion type `tools/convert-constellation-boundaries.js`
4. ajouter une validation minimale du dataset

## Backlog priorise

| Priorite | Action | Pourquoi maintenant |
| --- | --- | --- |
| P1 | Committer le lot local constellation lunaire + validation elargie | Etat de travail deja avance, faible risque, gain utilisateur direct. |
| P2 | Formaliser le modele de donnees des calculs | Necessaire pour rendre l'explication des resultats robuste et reutilisable. |
| P3 | Etendre la validation de precision a plus de cas et a plus de sorties | Pour fiabiliser davantage Soleil / Lune. |
| P4 | Lancer les constellations polygonales reelles | Plus gros ecart restant avec l'architecture cible. |
| P5 | Reprendre ensuite la roue et les raffinements UI | Important, mais moins structurant que les trois chantiers precedents. |

## Decision pratique

Si l'objectif est d'avancer en restant aligne avec le document et avec la priorite actuelle "calculs + clarification", le prochain lot le plus juste est:

`formaliser les resultats de calcul dans le domaine, puis ouvrir le chantier constellations polygonales`
