# Protocole WebSocket OST

Documentation du protocole de communication entre le frontend et le backend OST via WebSocket sur le port **9624**.

## Connexion

```
ws://localhost:9624
```

## Message initial du client

Le client doit envoyer un message `Freadall` pour récupérer l'état complet du système:

```json
{"evt":"Freadall"}
```

## Messages reçus du serveur

Le serveur répond avec plusieurs messages JSON successifs:

### 1. `foldersdump` - Arborescence des dossiers

```json
{
  "evt": "foldersdump",
  "fileevent": [
    "/Sequencer",
    "/Sequencer/TEST",
    "/Sequencer/TEST/LIGHT/Luminance",
    "/Allsky",
    "/Allsky/archives/20241206-15-34-54",
    "/SQM/20251005-13-10-13",
    ...
  ]
}
```

**Contenu:** Liste complète des dossiers créés par les modules (Sequencer, Allsky, Darkassist, SQM)

### 2. `filesdump` - Liste des fichiers

```json
{
  "evt": "filesdump",
  "fileevent": [
    "/FocusCCD Simulator.jpeg",
    "/AllskyZWO CCD ASI120MM-S.jpeg",
    "/Sequencer-Luminance-20241206_225023_555.FITS",
    "/Guider.jpeg",
    "/Navigator.jpeg",
    ...
  ]
}
```

**Contenu:** Liste des fichiers d'images (JPEG, FITS) générés par les modules

### 3. `moduledump` - État des modules

Structure générale pour chaque module:

```json
{
  "evt": "moduledump",
  "modules": {
    "mainctl": { /* Configuration du contrôleur principal */ },
    "Allsky": { /* Configuration du module Allsky */ },
    "Focus": { /* Configuration du module Focus */ },
    "Guider": { /* Configuration du module Guider */ },
    "Navigator": { /* Configuration du module Navigator */ },
    "Sequencer": { /* Configuration du module Sequencer */ }
  }
}
```

## Structure d'un module

Chaque module contient:

### `errors` - Erreurs du module

```json
"errors": {
  "0": {
    "datetime": "2025-10-20T19:03:20.055",
    "error": "Module Focus already loaded - can't load twice"
  }
}
```

### `messages` - Messages du module

```json
"messages": {
  "0": {
    "datetime": "2025-10-20T19:02:36.970",
    "message": "Available configurations refreshed"
  },
  "1": {
    "datetime": "2025-10-20T19:02:37.015",
    "message": "Module Allsky successfully loaded"
  }
}
```

### `globallovs` - Listes de valeurs globales

```json
"globallovs": {
  "loadedModules": {
    "label": "Loaded modules",
    "type": "string",
    "values": {
      "Allsky": "Allsky",
      "Focus": "Focus",
      "Guider": "Guider",
      "Navigator": "Navigator",
      "Sequencer": "Sequencer"
    }
  },
  "DRIVER_INTERFACE-CCD_INTERFACE": {
    "label": "DRIVER_INTERFACE-CCD_INTERFACE",
    "type": "string",
    "values": {
      "CCD Simulator": "CCD Simulator",
      "Guide Simulator": "Guide Simulator"
    }
  }
}
```

### `infos` - Informations du module

```json
"infos": {
  "description": "Simple allsky camera module",
  "label": "Allsky",
  "name": "Allsky"
}
```

### `properties` - Propriétés du module

**Structure la plus importante!** Chaque propriété contient:

```json
"properties": {
  "actions": {
    "badge": false,
    "elements": {
      "loop": {
        "autoupdate": true,
        "badge": false,
        "directedit": false,
        "hint": "",
        "label": "Activer",
        "order": "0",
        "type": "bool",
        "value": false
      },
      "pause": {
        "type": "bool",
        "value": false,
        "label": "Pause",
        "order": "1"
      },
      "abort": {
        "type": "bool",
        "value": true,
        "label": "Stop",
        "order": "2"
      }
    },
    "enabled": true,
    "freevalue": "",
    "gridheaders": ["abort", "loop", "pause"],
    "hasGraph": false,
    "hasGrid": false,
    "hasprofile": false,
    "label": "Actions",
    "level1": "Contrôle",
    "level2": "",
    "order": "000Control111",
    "permission": 2,
    "posticon1": "",
    "posticon2": "",
    "preicon1": "",
    "preicon2": "",
    "rule": 0,
    "showElts": true,
    "status": 0
  }
}
```

#### Champs de propriété:

- **label**: Libellé d'affichage
- **level1/level2**: Hiérarchie de navigation (catégorie/sous-catégorie)
- **order**: Ordre d'affichage
- **permission**: 0=ReadOnly, 1=WriteOnly, 2=ReadWrite
- **status**: État (0=Idle, 1=Ok, 2=Busy, 3=Error)
- **enabled**: Activé ou non
- **badge**: Afficher un badge
- **hasGrid**: La propriété a une grille de données
- **hasGraph**: La propriété a un graphique
- **hasprofile**: Sauvegarder dans le profil
- **showElts**: Afficher les éléments
- **showGrid**: Afficher la grille
- **rule**: Règle des switches (0=OneOfMany, 1=AtMostOne, 2=Any)

#### Champs d'élément:

- **type**: "bool", "int", "float", "string", "date", "time", "img", "video", "light", "prg", "message"
- **label**: Libellé
- **value**: Valeur actuelle
- **order**: Ordre d'affichage
- **autoupdate**: Mise à jour automatique
- **directedit**: Édition directe
- **hint**: Info-bulle
- **badge**: Badge sur l'élément
- **posticon/preicon**: Icônes avant/après

#### Types d'éléments spécifiques:

**Int/Float:**
```json
{
  "type": "int",
  "value": 10,
  "min": 1,
  "max": 20,
  "step": 1,
  "format": "",
  "slider": 0
}
```

**String avec LOV (List of Values):**
```json
{
  "type": "string",
  "value": "default",
  "listOfValues": {
    "default": "default",
    "modules": "modules"
  }
}
```

**Image (img):**
```json
{
  "type": "img",
  "urljpeg": "Allsky/archives/20251019-20-52-18/keogram.jpeg",
  "urlfits": "",
  "urloverlay": "",
  "urlthumbnail": "",
  "channels": 1,
  "width": 0,
  "height": 0,
  "histogram": [[]],
  "mean": [0],
  "median": [0],
  "stddev": [0],
  "min": [0],
  "max": [0],
  "hfravg": 0,
  "stars": 0,
  "snr": 0,
  "issolved": false,
  "solverra": 0,
  "solverde": 0,
  "showstats": false
}
```

**Video:**
```json
{
  "type": "video",
  "url": "Allsky/archives/20251019-20-52-18/timelapse.mp4"
}
```

**Light (indicateur d'état):**
```json
{
  "type": "light",
  "value": 0
}
```
Valeurs: 0=Idle (gris), 1=Ok (vert), 2=Busy (jaune), 3=Error (rouge)

### `grid` - Données tabulaires

Si `hasGrid` est true, la propriété contient un tableau de données:

```json
"grid": [
  ["Allsky", "Allsky", "default", "allsky"],
  ["Focus", "Focus", "default", "focus"],
  ["Guider", "Guider", "default", "guider"],
  ["Sequencer", "Sequencer", "default", "sequencer"],
  ["Navigator", "Navigator", "default", "navigator"]
],
"gridheaders": ["label", "name", "profile", "type"],
"gridLimit": 5000
```

## Exemple: Module mainctl

Le module `mainctl` gère le contrôle principal et contient notamment:

### Propriété `load` - Charger des modules

```json
"load": {
  "label": "Modules disponibles",
  "level1": "Modules",
  "level2": "",
  "permission": 2,
  "status": 1,
  "elements": {
    "focus": {
      "type": "string",
      "value": "Focus",
      "label": "Focus (scxml)",
      "posticon": "forward",
      "order": "Focus (scxml)"
    },
    "allsky": {
      "type": "string",
      "value": "Allsky",
      "label": "Module Allsky",
      "posticon": "forward"
    },
    "sequencer": {
      "type": "string",
      "value": "Sequencer",
      "label": "Module Sequencer",
      "posticon": "forward"
    }
    // ... autres modules
  }
}
```

### Propriété `modules` - Modules chargés

```json
"modules": {
  "label": "Modules chargés",
  "hasGrid": true,
  "showGrid": true,
  "grid": [
    ["Allsky", "Allsky", "default", "allsky"],
    ["Focus", "Focus", "default", "focus"],
    ["Guider", "Guider", "default", "guider"],
    ["Sequencer", "Sequencer", "default", "sequencer"],
    ["Navigator", "Navigator", "default", "navigator"]
  ],
  "gridheaders": ["label", "name", "profile", "type"]
}
```

### Propriété `indidrivers` - Drivers INDI disponibles

Grille massive des drivers INDI:

```json
"indidrivers": {
  "label": "Driver Indi disponibles",
  "hasGrid": true,
  "showGrid": true,
  "gridLimit": 5000,
  "elements": {
    "driver": {
      "type": "string",
      "value": "indi_xagyl_wheel",
      "label": "Driver Indi",
      "posticon": "play_arrow",
      "preicon": "stop"
    },
    "search": {
      "type": "string",
      "value": "*",
      "label": "Rechercher",
      "posticon": "play_arrow"
    }
  },
  "grid": [
    ["indi_aaf2_focus", "*"],
    ["indi_asi_ccd", "*"],
    ["indi_simulator_ccd", "*"],
    // ... 300+ drivers
  ],
  "gridheaders": ["driver", "search"]
}
```

## Exemple: Module Allsky

### Propriété `actions` - Actions de contrôle

```json
"actions": {
  "label": "Actions",
  "level1": "Contrôle",
  "permission": 2,
  "elements": {
    "loop": {
      "type": "bool",
      "value": false,
      "label": "Activer",
      "order": "0"
    },
    "pause": {
      "type": "bool",
      "value": false,
      "label": "Pause"
    },
    "abort": {
      "type": "bool",
      "value": true,
      "label": "Stop"
    }
  }
}
```

### Propriété `archives` - Archives Allsky

Propriété avec grille d'archives:

```json
"archives": {
  "label": "Archives",
  "hasGrid": true,
  "elements": {
    "date": {
      "type": "string",
      "value": "20251019-20-52-18",
      "label": "Date"
    },
    "keogram": {
      "type": "img",
      "urljpeg": "Allsky/archives/20251019-20-52-18/keogram.jpeg",
      "label": "Keogramme"
    },
    "stack": {
      "type": "img",
      "urljpeg": "Allsky/archives/20251019-20-52-18/stacked.jpeg",
      "label": "Empilement"
    },
    "timelapse": {
      "type": "video",
      "url": "Allsky/archives/20251019-20-52-18/timelapse.mp4",
      "label": "Timelapse"
    }
  },
  "grid": [
    [
      "20241206-15-34-54",
      {"urljpeg": "Allsky/archives/20241206-15-34-54/keogram.jpeg", ...},
      {"urljpeg": "Allsky/archives/20241206-15-34-54/stacked.jpeg", ...},
      "to be implemented"
    ],
    // ... autres archives
  ],
  "gridheaders": ["date", "keogram", "stack", "timelapse"]
}
```

## Communication Frontend → Backend

Pour envoyer des mises à jour au backend, le frontend doit envoyer des messages avec la structure:

```json
{
  "evt": "Fupdate",
  "module": "Focus",
  "property": "actions",
  "elements": {
    "start": true
  }
}
```

ou pour des opérations de grille:

```json
{
  "evt": "Fgridnewline",
  "module": "Sequencer",
  "property": "sequence",
  "elements": {
    "filter": "Ha",
    "exposure": 300,
    "count": 10
  }
}
```

## Événements WebSocket

### Événements du serveur vers le client:

- `foldersdump`: Liste des dossiers
- `filesdump`: Liste des fichiers
- `moduledump`: État complet d'un module
- `propertyupdate`: Mise à jour d'une propriété
- `elementupdate`: Mise à jour d'un élément

### Événements du client vers le serveur:

- `Freadall`: Demande de l'état complet
- `Fupdate`: Mise à jour d'éléments
- `Fgridnewline`: Ajouter une ligne de grille
- `Fgridupdateline`: Mettre à jour une ligne de grille
- `Fgriddeleteline`: Supprimer une ligne de grille
- `Fgridclear`: Vider la grille
- `Fposticon`: Clic sur icône post (action)
- `Fpreicon`: Clic sur icône pré (action)

## Notes d'implémentation

1. **Connexion au démarrage**: Le frontend doit se connecter au WebSocket et envoyer `{"evt":"Freadall"}` immédiatement
2. **Reconstruction de l'état**: Parser les 3 messages successifs (foldersdump, filesdump, moduledump)
3. **Écoute des mises à jour**: Le serveur envoie des mises à jour partielles quand l'état change
4. **Gestion des images**: Les URLs d'images sont relatives au webroot du serveur
5. **Hiérarchie**: Utiliser `level1` et `level2` pour organiser les propriétés en catégories
6. **Permissions**: Respecter `permission` pour désactiver les champs en lecture seule

## Structure de données recommandée pour Angular

```typescript
interface Module {
  errors: { [key: string]: Error };
  messages: { [key: string]: Message };
  globallovs: { [key: string]: GlobalLov };
  infos: ModuleInfo;
  properties: { [key: string]: Property };
}

interface Property {
  label: string;
  level1: string;
  level2: string;
  order: string;
  permission: number; // 0=RO, 1=WO, 2=RW
  status: number; // 0=Idle, 1=Ok, 2=Busy, 3=Error
  enabled: boolean;
  hasGrid: boolean;
  hasGraph: boolean;
  showElts: boolean;
  showGrid: boolean;
  elements: { [key: string]: Element };
  grid?: any[][];
  gridheaders?: string[];
}

interface Element {
  type: 'bool' | 'int' | 'float' | 'string' | 'date' | 'time' | 'img' | 'video' | 'light' | 'prg' | 'message';
  label: string;
  value: any;
  order: string;
  // ... autres champs selon le type
}
```
