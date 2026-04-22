# Audit d'integration

Date: 2026-04-21

## Contexte

Audit du projet local `astro-app` par rapport a son integration actuelle.

La reference mentionnee par l'utilisateur, `Architecture App Astronomique Astrologique` issue de la conversation `Calculs Astrologiques et Astronomiques`, n'a pas pu etre retrouvee automatiquement ni dans le depot local ni via les documents Google Drive accessibles par titre ou mots-cles proches. Cet audit se base donc sur le code effectivement present dans le workspace.

## Resume executif

Le projet est une SPA JavaScript modulaire qui couvre deja plusieurs domaines:

- calcul de contexte astronomique de base
- Soleil, Lune, planetes geocentriques simplifiees
- signes tropicaux et sideraux
- maisons, aspects, phase lunaire, lever/coucher
- rendu UI par panneaux
- stockage local et export/import presents mais partiellement branches

L'integration reste cependant partielle. Le code ressemble davantage a un prototype fonctionnel modulaire qu'a une architecture applicative complete et tracee.

## Etat actuel observe

### Points deja integres

- `js/domain/chartBuilder.js` centralise la construction du theme.
- La separation `core` / `astronomy` / `astrology` / `domain` / `ui` / `storage` est propre et exploitable.
- Les formulaires de carte natale et de transits fonctionnent avec validation simple.
- Les rendus principaux sont relies a la generation du theme.

### Ecarts d'integration identifies

- `js/storage/localDb.js` existait mais n'etait pas branche a l'application.
- `js/ui/state.js` existait mais n'etait pratiquement pas utilise.
- `js/storage/settings.js` n'est pas consomme par l'interface.
- `js/storage/exportImport.js` n'est pas expose dans l'UI.
- L'orchestration de `js/app.js` etait centralisee mais encore imperative et peu factorisee.
- Aucun systeme de build, de test ou de verification automatique n'est present.
- Aucun document d'alignement entre architecture cible et implementation n'etait versionne dans le depot.

## Mise a jour effectuee

Les integrations suivantes ont ete realisees pendant cet audit:

- branchement du stockage local pour restaurer le dernier theme calcule au chargement
- synchronisation de l'etat applicatif via `uiState.currentChart` et `uiState.currentInput`
- factorisation de la lecture des formulaires et du rendu complet d'un theme dans `js/app.js`
- creation du present document d'audit pour servir de point de reference local
- prise en charge reelle des options `houseSystem` et `ayanamsa`
- ajout des controles sauvegarde / chargement / export / import dans l'UI
- ajout des filtres de transits et d'un rendu plus lisible
- ajout d'une premiere synthese automatique de theme

## Alignement avec le document a 164 parties

Le fichier racine `architecture_app_astronomique_astrologique.md` a ensuite ete fourni. Il sert desormais de reference locale explicite.

Etat d'alignement observe:

- parties 1 a 54: globalement presentes ou deja tres proches dans le depot
- parties 55 a 68: partiellement absentes au depart, puis integrees dans cette mise a jour
- parties 79 a 85: premiere integration realisee avec le module de synthese
- parties 129 a 164: partiellement traitees ensuite avec une determination exacte Roman87 branchee et un pipeline polygonal complet en couverture, mais encore alimente cote polygones par un dataset synthetique de transition plutot que par les frontieres IAU exactes

## Ecart probable avec une architecture en 164 parties

Au vu du depot actuel, il est tres improbable que l'implementation couvre deja une architecture de 164 parties decrites. Les absences les plus visibles sont:

- couche d'application plus explicite
- contrats de donnees formalises
- parametrage utilisateur branche de bout en bout
- persistence multi-objets et historique
- import/export visible en interface
- traçabilite entre exigences architecturales et modules
- tests de non-regression sur les calculs et les rendus

## Prochaine etape recommandee

Pour aligner reellement le projet avec la conversation de reference, il faut maintenant recuperer le document exact ou son identifiant. Des que la source est disponible, l'etape suivante est de produire une matrice de correspondance:

- partie d'architecture
- statut dans le code: present, partiel, absent
- fichiers concernes
- action de mise en conformite
