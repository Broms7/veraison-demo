# Véraison

Site d'une cuvée de Pomerol. Une bouteille 3D reste au centre de la page pendant que vous défilez : elle verse dans le verre, puis se range dans la grille d'allocation. La page se lit en français et en anglais.

Démo : https://veraison-demo.vercel.app

## Ce que c'est

Une démonstration réalisée par [Kaïro](https://github.com/Broms7), studio web et IA à Bordeaux. Le Clos Ferrugine n'existe pas. Le domaine, les personnes, la presse, les avis et les prix sont inventés. La réservation et la demande d'allocation sont simulées : rien n'est envoyé, rien n'est enregistré.

Le projet teste une idée : poser un objet unique au centre d'un site et laisser le défilement écrire son étiquette.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Three.js avec React Three Fiber et drei pour la bouteille
- GSAP et Lenis pour le défilement
- Tailwind CSS 4, composants Radix et shadcn/ui
- Polices Big Shoulders, Instrument Serif, Instrument Sans et IBM Plex Mono, chargées par `next/font`

## Lancer le projet

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm start        # sert le build
```

Une variable d'environnement, facultative : `NEXT_PUBLIC_SITE_URL` donne l'adresse publique du site (sitemap, robots, image de partage). Sans elle, le site utilise une adresse provisoire.

## Crédits

- Images et vidéos générées par IA (Kling).
- Modèle 3D de la bouteille généré avec Meshy. L'étiquette est dessinée par le site.
- Textes écrits pour la démo.

## Droits

Code et contenus © 2026 Kaïro, tous droits réservés. Le dépôt est public pour que vous puissiez le lire. Il n'accorde pas de licence de réutilisation.
