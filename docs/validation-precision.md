# Validation de precision Soleil / Lune / planetes

## But

Mesurer l'ecart entre le moteur local et des references officielles sur quelques cas concrets, sans pretendre a une validation exhaustive.

## Commande

```bash
npm run validate:precision
npm run validate:precision:planets
```

## Source de reference

Les fixtures actuelles proviennent du service officiel USNO `Complete Sun and Moon Data for One Day`.

Les instants des phases lunaires majeures sont en plus compares a un snapshot local versionne du service officiel USNO `Phases of the Moon`, embarque dans le depot pour un usage hors ligne sur la plage `1900-2100`.

Les references planetaires proviennent de snapshots locaux versionnes du service officiel NASA/JPL Horizons, en vecteurs geocentriques `Ecliptic of J2000.0` et en coordonnees apparentes geocentriques `RA/Dec J2000`, pour 8 instants de controle: une couverture saisonniere 2026, deux snapshots dans des zones de mouvement apparent plus sensibles en 2026, et un point de controle supplementaire en 2034.

Le moteur planétaire expose maintenant deux modes:

- `standard`: formules approximatives JPL locales
- `enhanced`: meme base locale, plus correction interpolée sur ancrages officiels Horizons versionnés

Le `buildChart()` utilise `enhanced` par défaut.

Documentation API:

- https://aa.usno.navy.mil/data/api.html
- https://aa.usno.navy.mil/data/RS_OneDay?mod=article_inline
- https://ssd-api.jpl.nasa.gov/doc/horizons.html
- https://ssd.jpl.nasa.gov/planets/approx_pos.html

## Ce qui est verifie

- lever du Soleil
- coucher du Soleil
- lever de la Lune
- coucher de la Lune
- pourcentage d'illumination lunaire
- ordre des phases lunaires majeures autour de l'instant teste
- bornes raisonnables du cycle synodique lunaire courant
- bornes raisonnables distance / diametre apparent de la Lune
- coherence interne entre age lunaire reel et derniere Nouvelle Lune detectee
- ecart aux instants officiels USNO pour phase majeure precedente / suivante
- ecart aux instants officiels USNO pour Nouvelle Lune precedente / suivante
- ecart planetaire aux vecteurs geocentriques officiels Horizons pour Mercure, Venus, Mars, Jupiter, Saturne, Uranus et Neptune
- derivees associees sur longitude, latitude et distance geocentriques
- ecart planetaire officiel Horizons sur `RA/Dec J2000` pour Mercure, Venus, Mars, Jupiter, Saturne, Uranus et Neptune
- bon branchement du mode `enhanced` sur les ancrages versionnes Horizons

## Seuils actuels

- Soleil lever/coucher: 5 minutes
- Lune lever/coucher: 20 minutes
- illumination lunaire: 6 points de pourcentage
- phases lunaires majeures vs USNO offline: 180 minutes
- seuils planetaires: variables selon la planete et la grandeur comparee, calibres a partir des ecarts observes contre Horizons et des erreurs nominales publiees par JPL pour les formules approximatives

Les 8 snapshots planetaires versionnes couvrent actuellement:

- 2026-01-15 00:00 UTC
- 2026-03-20 12:00 UTC
- 2026-06-21 12:00 UTC
- 2026-08-12 00:00 UTC
- 2026-09-23 00:00 UTC
- 2026-12-10 00:00 UTC
- 2026-12-15 00:00 UTC
- 2034-03-20 12:00 UTC

Ces seuils sont pragmatiques. Ils sont suffisants pour detecter une regression numerique importante, mais pas pour certifier une precision d'almanach officiel.

## Limites

- le jeu de test reste petit
- les references de rise/set USNO sont comparees ici sur l'heure locale affichee par l'application
- les references planetaires Horizons restent un petit echantillon de snapshots, pas encore une campagne large multi-decennies
- le mode `enhanced` corrige les coordonnées a l interieur de la plage couverte par les ancrages, mais il ne remplace pas une éphéméride numerique complete de type Horizons hors de cette couverture
- les nouveaux controles lunaires supplementaires sont pour l'instant des controles de coherence forte internes, pas encore des comparaisons a une ephémeride externe pour les instants de phase

## Suite logique

1. ajouter des cas de test aux solstices, equinoxes et hautes latitudes
2. ajouter des comparaisons de declinaison solaire et, si possible, de coordonnees lunaires
3. etendre les snapshots Horizons a plus d'epoques, notamment autour des retrogradations et sur d'autres decennies
4. comparer ensuite les instants de Nouvelle Lune / Pleine Lune / quartiers a une reference externe plus fine
5. comparer ensuite le moteur a une reference plus fine pour la Lune si besoin

## Limite connue actuelle

Les cas extremes de Lune continuellement au-dessus ou au-dessous de l'horizon aux hautes latitudes ne sont pas encore inclus dans la suite de validation stricte.

La raison est simple: ces cas restent les plus sensibles aux limites du modele lunaire simplifie. Ils doivent etre testes a part jusqu'a ce que le moteur lunaire soit encore affine.
