# Matrice d'alignement

Date: 2026-04-21

## But

Faire le point entre le document de reference `architecture_app_astronomique_astrologique.md` et le code actuellement present dans le depot local.

Cette matrice ne cherche pas a recopier les 164 sections une par une. Elle regroupe les blocs d'architecture en lots techniques coherents pour piloter la suite du projet.

## Lecture rapide

- `present`: implemente et branche dans le flux principal
- `partiel`: implemente en partie, ou present mais encore limite
- `absent`: non implemente ou non branche

## Etat global

| Bloc | Sections de reference | Statut | Fichiers principaux | Commentaire |
| --- | --- | --- | --- | --- |
| Arborescence, separation des couches, pipeline general | 1 a 14 | present | `index.html`, `js/core/*`, `js/astronomy/*`, `js/astrology/*`, `js/domain/*`, `js/ui/*`, `js/storage/*` | La structure modulaire voulue existe et reste lisible. |
| Socle de donnees et calculs astronomiques | 15 a 41 | present | `js/data/*`, `js/astronomy/*`, `js/domain/chartBuilder.js` | Le moteur couvre Soleil, Lune, planetes, noeuds, aspects, phase lunaire et lever/coucher avec approximations assumeees. |
| Visualisation et transits, premiere roue | 42 a 54 | present | `js/ui/renderChartWheel.js`, `js/domain/transits.js`, `js/ui/renderTransits.js`, `index.html` | Les panneaux sont branches et fonctionnels. |
| Phase 1: controles projet, stockage, reglages, UX de base | 55 a 78 | present | `js/app.js`, `js/storage/localDb.js`, `js/storage/settings.js`, `assets/styles.css`, `index.html` | Sauvegarde locale, brouillons, import/export et filtres de transits sont bien relies. |
| Phase 2: synthese textuelle initiale | 79 a 108 | present | `js/domain/synthesis.js`, `js/ui/renderSynthesis.js`, `js/domain/transits.js` | Le projet dispose d'une premiere synthese de theme et d'une synthese de transits filtrees. |
| Phase 2: synthese finale courte et qualite redactionnelle | 109 a 128 | partiel | `js/domain/synthesis.js`, `js/ui/renderSynthesis.js`, `js/domain/transits.js`, `js/ui/renderTransits.js` | La synthese existe deja, mais elle ne couvre pas encore plusieurs niveaux de lecture ni une vraie fusion natal/transits. |
| Constellations polygonales reelles et outillage de conversion | 129 a 164 | absent | aucun equivalent branche | Le projet reste sur une logique simplifiee de constellations. Les datasets polygonaux, scripts de conversion et validations ne sont pas integres. |

## Detail par lot

### 1. Socle applicatif

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Formulaire natal principal | present | `index.html`, `js/app.js` | Lecture, validation, calcul et rendu completes. |
| Validation d'entree | present | `js/domain/validators.js` | Branchee dans natal et transits. |
| Orchestration centrale | present | `js/app.js` | Le flux principal est centralise et coherent. |
| Etat UI minimal | present | `js/ui/state.js` | Utilise pour la carte courante et l'entree courante. |
| Contrats de donnees formalises | partiel | `js/domain/chartModel.js` | Le modele existe mais reste leger, sans schema ni verifications structurelles profondes. |

### 2. Stockage et persistance

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Sauvegarde locale de la carte | present | `js/storage/localDb.js`, `js/app.js` | Sauvegarde et restauration effectives. |
| Sauvegarde des reglages | present | `js/storage/settings.js`, `js/app.js` | `houseSystem` et `ayanamsa` sont persistants. |
| Brouillons de formulaires | present | `js/app.js` | Les deux formulaires sont restaurees localement. |
| Export JSON | present | `js/storage/exportImport.js`, `js/app.js` | Expose dans l'UI. |
| Import JSON | present | `js/storage/exportImport.js`, `js/app.js` | Expose dans l'UI, avec validation minimale. |
| Historique multi-cartes | absent | aucun | Une seule carte est geree localement. |

### 3. Rendus UI

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Resume technique | present | `js/ui/renderSummary.js` | Affiche le contexte astronomique et les angles. |
| Corps celestes | present | `js/ui/renderBodies.js` | Signes, maisons et constellation affiches. |
| Maisons | present | `js/ui/renderHouses.js` | Branche dans le flux principal. |
| Symbolique | present | `js/ui/renderSymbolic.js` | Branche dans le flux principal. |
| Aspects | present | `js/ui/renderAspects.js` | Branche dans le flux principal. |
| Phase lunaire | present | `js/ui/renderMoonPhase.js` | Branche dans le flux principal. |
| Lever / coucher | present | `js/ui/renderRiseSet.js` | Branche dans le flux principal. |
| Roue du theme | partiel | `js/ui/renderChartWheel.js` | Fonctionnelle, mais encore simple visuellement et sans niveaux de finition avances. |
| Panneau transits | present | `js/ui/renderTransits.js` | Filtrage et synthese deja exposes. |
| Synthese automatique du theme | present | `js/ui/renderSynthesis.js` | Affiche plusieurs blocs de lecture. |

### 4. Calculs et interpretation

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Soleil, Lune, planetes geocentriques simplifiees | present | `js/astronomy/sun.js`, `js/astronomy/moon.js`, `js/astronomy/planets.js` | Coeur moteur en place. |
| Maisons et angles | present | `js/astrology/houses.js` | Plusieurs systemes sont relies a l'UI. |
| Zodiaque tropical et sideral | present | `js/astrology/zodiacTropical.js`, `js/astrology/zodiacSidereal.js` | `ayanamsa` branche. |
| Aspects natals | present | `js/astrology/aspects.js` | Utilises dans le theme et la roue. |
| Comparaison de transits | present | `js/domain/transits.js` | Filtrage par orbe, vitesses et angles. |
| Synthese textuelle du theme | present | `js/domain/synthesis.js` | Dominantes, corps, aspects, phase lunaire, lever/coucher. |
| Synthese fusionnee natal plus transits | partiel | `js/domain/transits.js`, `js/ui/renderTransits.js` | Une synthese de transits existe, mais elle reste separee de la synthese globale du theme. |
| Plusieurs niveaux de synthese | absent | aucun | Pas encore de modes courte, moyenne, longue. |

### 5. Donnees reelles de constellations

| Element | Statut | Fichiers | Note |
| --- | --- | --- | --- |
| Constellations optimisees simplifiees | present | `js/data/constellationsOptimized.js`, `js/astrology/constellations.js` | Solution legere deja exploitable. |
| Dataset polygonal reel | absent | aucun | `js/data/constellationsPolygons.js` absent. |
| Script de conversion | absent | aucun | Dossier `tools/` absent. |
| Validation du dataset | absent | aucun | Aucun outillage de verification. |

## Ce qui est effectivement termine

- La Phase 1 definie dans le document de reference est globalement terminee dans le depot local.
- La premiere moitie utile de la Phase 2 est deja engagee et exploitable.
- Le projet peut deja servir a calculer, visualiser, sauvegarder, recharger et comparer un theme avec des transits.

## Ce qui bloque la suite

- Il n'y a encore aucun test automatique.
- Il n'y a encore aucun commit de reference pour figer un jalon.
- La suite du document d'architecture se divise maintenant en deux directions tres differentes:
  - ameliorer la qualite interpretative de la synthese
  - integrer les vraies constellations polygonales et leur outillage

## Prochaine etape recommandee

La prochaine etape la plus rentable est de terminer proprement la Phase 2 avant d'ouvrir le chantier polygonal.

Concretement:

1. ajouter une synthese finale courte du theme, distincte des sections detaillees
2. introduire plusieurs niveaux de lecture `courte`, `moyenne`, `longue`
3. mieux relier la synthese de transits au natal, plutot que laisser deux lectures juxtaposees
4. seulement apres cela, ouvrir le chantier `constellationsPolygons` et `tools/convert-constellation-boundaries.js`

## Backlog priorise

| Priorite | Action | Pourquoi maintenant |
| --- | --- | --- |
| P1 | Stabiliser la synthese Phase 2 | C'est la suite directe du code deja ajoute et le meilleur gain fonctionnel visible. |
| P2 | Ajouter un minimum de verification manuelle reproductible | Le depot n'a ni tests ni jalon stable. |
| P3 | Creer un premier commit de reference | Necessaire pour travailler proprement ensuite. |
| P4 | Ouvrir le chantier des constellations polygonales | Plus lourd, plus technique, et pas bloqueur pour la valeur utilisateur immediate. |

## Decision pratique

Si l'objectif est de continuer le produit sans se disperser, le prochain lot a implementer doit etre:

`Phase 2 - synthese finale courte + niveaux de lecture`

Ce lot est coherent avec l'etat actuel du code, visible immediatement dans l'interface, et ne depend d'aucun dataset externe.
