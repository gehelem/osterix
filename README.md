# MyOST Frontend

Interface Angular simplifiée pour le système OST (Observatoire Sans Tête).

## Description

MyOST est un frontend Angular statique qui présente les différents modules d'OST avec des pages dédiées pour chaque fonctionnalité. Contrairement à ost-front (le frontend complet avec Ionic/Capacitor), MyOST est une version légère uniquement web avec Angular Material.

## Structure du projet

```
myost-front/
├── src/
│   ├── app/
│   │   ├── pages/                # Pages statiques des modules
│   │   │   ├── home/            # Page d'accueil avec aperçu des modules
│   │   │   ├── focus/           # Module Focus (autofocus)
│   │   │   ├── sequence/        # Module Séquenceur
│   │   │   ├── navigator/       # Module Navigation
│   │   │   ├── guider/          # Module Guidage
│   │   │   └── allsky/          # Module Allsky
│   │   ├── app.component.*      # Composant principal avec toolbar + sidenav
│   │   ├── app-routing.module.ts # Routes de l'application
│   │   └── app.module.ts        # Module principal avec Angular Material
│   └── assets/                  # Ressources statiques
```

## Technologies utilisées

- **Angular 14**: Framework principal
- **Angular Material 13**: Composants UI (toolbar, sidenav, cards, tabs, tables, forms)
- **TypeScript 5.5**: Langage de développement
- **RxJS 7.5**: Gestion des flux asynchrones

## Installation

```bash
cd /home/gilles/claude/OST/MyOST/myost-front
npm install
```

## Lancement

```bash
# Serveur de développement
ng serve

# Sur un port spécifique
ng serve --port 4201

# Avec accès réseau
ng serve --host 0.0.0.0 --port 4201
```

L'application sera accessible à : `http://localhost:4201`

## Build de production

```bash
ng build --configuration production
```

Les fichiers de build seront dans le répertoire `dist/`.

## Pages disponibles

### Page d'accueil (`/home`)
- Vue d'ensemble des 5 modules principaux
- Cards cliquables pour accéder à chaque module
- Indicateurs d'état du système (serveur, INDI, modules)

### Page Focus (`/focus`)
- Onglet **Paramètres** : Configuration de l'autofocus
  - Itérations, exposition, pas initial, sélection de filtre
  - Boutons démarrer/arrêter
- Onglet **Courbe V** : Graphique HFR vs Position (placeholder pour Chart.js)
- Onglet **Historique** : Tableau des dernières sessions de focus

### Pages Séquence, Navigator, Guider, Allsky (`/sequence`, `/navigator`, `/guider`, `/allsky`)
- Templates de base prêts à être étendus
- Structure similaire avec onglets Material

## Fonctionnalités Angular Material utilisées

- **MatToolbar** : Barre d'outils avec titre et boutons
- **MatSidenav** : Menu latéral de navigation
- **MatList** : Liste de navigation avec icônes
- **MatCard** : Cartes pour afficher les modules et contenus
- **MatTabs** : Onglets pour organiser le contenu
- **MatTable** : Tableaux de données (historique focus)
- **MatFormField** / **MatInput** / **MatSelect** : Formulaires
- **MatButton** / **MatIcon** : Boutons et icônes Material Design
- **MatGridList** : Grille responsive pour la page d'accueil

## Différences avec ost-front

| Caractéristique | ost-front | MyOST |
|-----------------|-----------|--------|
| Framework UI | Ionic 8 + Angular | Angular Material |
| Mobile | iOS/Android via Capacitor | Web uniquement |
| Complexité | Dynamique, WebSocket, ZeroConf | Statique, pages fixes |
| Graphiques | D3-celestial, Chart.js, ngx-charts | Placeholders |
| Communication | WebSocket avec serveur OST | Aucune (statique) |
| Taille | ~5 MB (vendor) | ~4.6 MB (vendor) |

## Prochaines étapes

- [ ] Ajouter Chart.js pour les graphiques (courbe V, guiding)
- [ ] Implémenter les pages Séquence, Navigator, Guider, Allsky
- [ ] Ajouter un service WebSocket pour communication avec ostserver
- [ ] Créer des composants réutilisables pour les éléments OST (PropertyMulti, Elements)
- [ ] Implémenter la gestion des états et des formulaires réactifs
- [ ] Ajouter des tests unitaires et e2e

## Notes de développement

### Résolution du problème TypeScript
Le projet utilise `"skipLibCheck": true` dans `tsconfig.json` pour éviter les erreurs de compilation liées à l'incompatibilité entre Node 22.7.0 et Angular CLI 14.2.2.

### Style et thème
Le thème Angular Material utilisé est `indigo-pink`. Pour changer :
1. Modifier dans `angular.json` : `"@angular/material/prebuilt-themes/indigo-pink.css"`
2. Options : `purple-green`, `pink-bluegrey`, `deeppurple-amber`

## Commandes utiles

```bash
# Générer un nouveau composant
ng generate component pages/mon-module

# Générer un service
ng generate service services/mon-service

# Lancer les tests
ng test

# Build de production
ng build --prod

# Analyser la taille du build
ng build --prod --stats-json
npx webpack-bundle-analyzer dist/myost-front/stats.json
```

## Auteur

Projet généré pour OST (Observatoire Sans Tête) - Interface simplifiée pour tests et développement.
