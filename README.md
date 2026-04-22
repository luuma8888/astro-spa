# Astro App

Base SPA offline en JavaScript modulaire pour :
- astronomie réelle simplifiée
- astrologie (signes, maisons, aspects)
- Soleil, Lune, planètes
- constellations optimisées
- Y-King
- transits
- roue de thème

## Ouvrir l'application
Ouvre simplement `index.html` dans un navigateur moderne.

## État actuel
Le projet est une base fonctionnelle et évolutive. Certains calculs restent des approximations raisonnables, surtout pour :
- lever/coucher
- maisons avancées
- éclipses détaillées
- précision planétaire de niveau observatoire

Les constellations utilisent maintenant une couche exacte `Roman 1987` pour la détermination principale, avec précession vers `B1875`, puis une couche polygonale de transition complète en couverture. Le dataset polygonal versionné actuel reste synthétique et dérivé des bornes optimisées: il sert de repli et de support de transition, pas de référence IAU exacte.

## Vérifications utiles
- `npm run validate:precision`
- `npm run generate:constellations:synthetic`
- `npm run validate:constellations`
- `npm run convert:constellations`
- `npm run convert:constellations:roman87`

## Étapes naturelles suivantes
- amélioration de la roue
- filtrage des transits
- export/import UI
- sauvegarde localStorage branchée à l'interface
- synthèse textuelle automatique
