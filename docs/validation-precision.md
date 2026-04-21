# Validation de precision Soleil / Lune

## But

Mesurer l'ecart entre le moteur local et des references officielles sur quelques cas concrets, sans pretendre a une validation exhaustive.

## Commande

```bash
npm run validate:precision
```

## Source de reference

Les fixtures actuelles proviennent du service officiel USNO `Complete Sun and Moon Data for One Day`.

Documentation API:

- https://aa.usno.navy.mil/data/api.html
- https://aa.usno.navy.mil/data/RS_OneDay?mod=article_inline

## Ce qui est verifie

- lever du Soleil
- coucher du Soleil
- lever de la Lune
- coucher de la Lune
- pourcentage d'illumination lunaire

## Seuils actuels

- Soleil lever/coucher: 5 minutes
- Lune lever/coucher: 20 minutes
- illumination lunaire: 6 points de pourcentage

Ces seuils sont pragmatiques. Ils sont suffisants pour detecter une regression numerique importante, mais pas pour certifier une precision d'almanach officiel.

## Limites

- le jeu de test reste petit
- les references de rise/set USNO sont comparees ici sur l'heure locale affichee par l'application
- aucune comparaison directe RA/Dec / longitude geocentrique n'est encore incluse
- aucune reference JPL / DE n'est encore integree

## Suite logique

1. ajouter des cas de test aux solstices, equinoxes et hautes latitudes
2. ajouter des comparaisons de declinaison solaire et, si possible, de coordonnees lunaires
3. comparer ensuite le moteur a une reference plus fine pour la Lune si besoin
