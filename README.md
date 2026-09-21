# DEAD LINE — Subway Station FPS

FPS en 3D qui se déroule dans une station de métro abandonnée. Le jeu démarre en
visite libre (`WASD` + souris) puis se transforme en survie **par vagues** :
zombies humanoïdes, traces de balles, recul, flash de bouche, SFX procéduraux.

> **100 % procédural** : toutes les textures (Canvas2D), tous les modèles
> (primitives Three.js) et tous les sons (Web Audio API) sont générés en code.
> **Aucun asset externe, aucun téléchargement** — le jeu fonctionne **hors-ligne**.

![DEAD LINE](https://img.shields.io/badge/status-playable-FFA500?style=for-the-badge) ![Three.js](https://img.shields.io/badge/three-r160-010101?style=for-the-badge&color=black) ![Vite](https://img.shields.io/badge/vite-v5-5467FF?style=for-the-badge)

---

## 🎮 Jouer

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

   Ouvrez http://localhost:5173 dans un navigateur récent (Chrome, Firefox, Edge).

3. Cliquez sur **ENTRER DANS LA STATION** pour verrouiller la souris et commencer.

> **Note audio** : le navigateur exige une interaction utilisateur avant de
> démarrer l'`AudioContext`. Le clic sur *Entrer* le déclenche.

---

## ⌨️ Contrôles

| Touche            | Action                                        |
| ----------------- | --------------------------------------------- |
| `W` `A` `S` `D`   | Déplacement                                   |
| Souris            | Viser (pointer lock)                          |
| Clic gauche (maintenu) | Tirer (automatique pour les armes auto)  |
| `R` / Clic molette | Recharger                                   |
| Molette           | Changer d'arme                                |
| `[` / `]`         | Luminosité − / +                              |
| `Échap`           | Pause                                         |

---

## 🔫 Arsenal

7 armes, changeables à la molette :

| Arme           | Type   | Cadence (T/min) | Chargeur | Réserve |
| -------------- | ------ | --------------- | -------- | ------- |
| M9 PISTOL      | semi   | 340             | 12       | 60      |
| AK-47          | auto   | 600             | 30       | 150     |
| M4 CARBINE     | auto   | 720             | 30       | 180     |
| M870 SHOTGUN   | semi   | 70              | 7        | 35      |
| M249 SAW       | auto   | 780             | 1000     | 0       |
| M134 MINIGUN   | auto   | 3000            | 2000     | 0       |
| RPG-7          | semi   | 30              | 1        | 6       |

Headshots = **×2.2 de dégâts**.

---

## 🏛️ La station

Quai carrelé + ligne de sécurité jaune, voies en contrebas (ballast, traverses,
rails), deux bouches de tunnel par voie plongeant dans le brouillard, colonnes
carrelées, plafond en béton, panneaux de station, enseignes *WAY OUT*, caissons
publicitaires, graffitis, bancs, poubelles, distributeur, tuyauterie. Éclairage
dynamique : spots de quai, néons qui grésillent, nappes de lumière chaude vs coins
sombres.

---

## 🧠 Fonctionnalités

- **Viewmodel** carabine 1re personne, **flash de bouche** (sprite additif + light),
  **recul** (ressort caméra + arme), traces lumineuses qui s'estompent, éjection de
  douilles.
- **Zombies humanoïdes** (primitives), bras tendus, marche saccadée, IA de poursuite,
  attaque au contact, gerbes de sang, effondrement à la mort.
- **Vagues** montantes, headshots, score.
- **HUD** complet : réticule, hitmarker, munitions, barre de vie, vague, score,
  vignette de dégâts, **minimap tactique**.
- **Slider de luminosité** : pilote l'intensité des lumières + `toneMappingExposure`.

---

## 🏗️ Architecture (MVC)

Séparation stricte en 3 couches, **découplées par un EventBus** (pub/sub) :

- **Modèle** (`src/model`) : données + règles pures. Ne connaît ni Three.js ni le DOM.
- **Vue** (`src/view`) : lit le modèle, construit et met à jour les meshes Three.js,
  le HUD DOM et les effets.
- **Contrôleur** (`src/controller`) : lit les entrées (clavier/souris/UI), mute le
  modèle et émet des événements.

```
  INPUT ──▶  CONTROLLER  ──(mute)──▶  MODEL  ──(règles)
              ▲  │                      ▲
              │  └────(emit events)─────┘
              │
              ▼  (read state)
            VIEW  (meshes + HUD + effets)
```

**Boucle de jeu** (une seule `requestAnimationFrame` dans `main.js`) :
`controllers.update(dt)` → `views.update(dt)` → `engine.render()`.

### Arborescence

```
src/
├── main.js                 # bootstrap + boucle de jeu
├── core/
│   ├── Engine.js           # renderer, scène, caméra, horloge
│   ├── EventBus.js         # pub/sub (découpage des couches)
│   └── Procedural.js       # textures Canvas2D (carrelage, béton, métal…)
├── model/                  # données + règles pures
│   ├── GameState.js        # racine (player, enemies, score, wave…)
│   ├── Player.js
│   ├── Weapon.js
│   ├── Enemy.js
│   └── Spawner.js          # composition des vagues
├── view/                   # lit le modèle → THREE / DOM
│   ├── SubwayStation.js
│   ├── Walls.js
│   ├── Lighting.js
│   ├── PlayerRig.js        # viewmodel arme 1re personne
│   ├── EnemyView.js
│   ├── EffectsView.js      # traces, impacts, gerbes de sang, douilles
│   ├── HUD.js
│   └── Minimap.js
├── controller/             # INPUT → mute modèle → émet events
│   ├── PlayerController.js
│   ├── WeaponController.js
│   ├── EnemyController.js
│   └── UIController.js
└── audio/
    ├── AudioManager.js     # AudioContext + ambiance
    └── SFX.js              # synthèse temps réel
```

---

## 📖 Documentation détaillée

Le fichier **[PLAN.md](./PLAN.md)** détaille le flux de données (exemple : le tir),
les détails de la station et l'ensemble des mécaniques.

---

## 🛠️ Stack

| Besoin    | Choix                                    |
| --------- | ---------------------------------------- |
| Rendu 3D  | `three` r160                             |
| Bundler   | `vite` (ES modules, HMR)                 |
| Audio     | Web Audio API (synthèse temps réel)      |
| Textures  | Canvas2D → `THREE.CanvasTexture`         |
| HUD       | DOM overlay (HTML/CSS)                   |

---

## 📄 Licence

Projet personnel — tous les contenus sont générés procéduralement, aucun asset
tiers n'est utilisé.
