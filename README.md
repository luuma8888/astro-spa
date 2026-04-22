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

La precision planetaire est maintenant suivie par une validation versionnee contre des references officielles NASA/JPL Horizons sur 8 snapshots (2026 + 2034), avec controles des vecteurs geocentriques, longitude/latitude/distance et `RA/Dec J2000` pour Mercure, Venus, Mars, Jupiter, Saturne, Uranus et Neptune. Le moteur propose un mode `enhanced` par défaut: base locale JPL approximative + correction interpolée sur ancrages Horizons versionnés.

Les constellations utilisent maintenant une couche exacte `Roman 1987` pour la détermination principale, avec précession vers `B1875`, puis une couche polygonale de transition complète en couverture. Le dataset polygonal versionné actuel reste synthétique et dérivé des bornes optimisées: il sert de repli et de support de transition, pas de référence IAU exacte.

## Vérifications utiles
- `npm run validate:precision`
- `npm run validate:precision:planets`
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
