# Validation de precision Soleil / Lune

## But

Mesurer l'ecart entre le moteur local et des references officielles sur quelques cas concrets, sans pretendre a une validation exhaustive.

## Commande

```bash
npm run validate:precision
```

## Source de reference

Les fixtures actuelles proviennent du service officiel USNO `Complete Sun and Moon Data for One Day`.

Les instants des phases lunaires majeures sont en plus compares a un snapshot local versionne du service officiel USNO `Phases of the Moon`, embarque dans le depot pour un usage hors ligne sur la plage `1900-2100`.

Documentation API:

- https://aa.usno.navy.mil/data/api.html
- https://aa.usno.navy.mil/data/RS_OneDay?mod=article_inline

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

## Seuils actuels

- Soleil lever/coucher: 5 minutes
- Lune lever/coucher: 20 minutes
- illumination lunaire: 6 points de pourcentage
- phases lunaires majeures vs USNO offline: 180 minutes

Ces seuils sont pragmatiques. Ils sont suffisants pour detecter une regression numerique importante, mais pas pour certifier une precision d'almanach officiel.

## Limites

- le jeu de test reste petit
- les references de rise/set USNO sont comparees ici sur l'heure locale affichee par l'application
- aucune comparaison directe RA/Dec / longitude geocentrique n'est encore incluse
- aucune reference JPL / DE n'est encore integree
- les nouveaux controles lunaires supplementaires sont pour l'instant des controles de coherence forte internes, pas encore des comparaisons a une ephémeride externe pour les instants de phase

## Suite logique

1. ajouter des cas de test aux solstices, equinoxes et hautes latitudes
2. ajouter des comparaisons de declinaison solaire et, si possible, de coordonnees lunaires
3. comparer ensuite les instants de Nouvelle Lune / Pleine Lune / quartiers a une reference externe plus fine
4. comparer ensuite le moteur a une reference plus fine pour la Lune si besoin

## Limite connue actuelle

Les cas extremes de Lune continuellement au-dessus ou au-dessous de l'horizon aux hautes latitudes ne sont pas encore inclus dans la suite de validation stricte.

La raison est simple: ces cas restent les plus sensibles aux limites du modele lunaire simplifie. Ils doivent etre testes a part jusqu'a ce que le moteur lunaire soit encore affine.
