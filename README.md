# 🎮 PLAYZUP — les jeux de soirée entre potes

Un site à partager par lien : chacun crée son profil (icône, couleur, cadre, boutique), puis l'hôte choisit un jeu.

| Jeu | Joueurs | Le principe |
|---|---|---|
| 🎵 **Blind test** | 1 à 12 | Extraits de 30 s, 42 catégories, mode Zizanie avec bonus et malus |
| 🕵️ **Undercover** | 3 à 12 | Les civils ont un mot, l'undercover un mot proche, Mr. White rien du tout. Indices puis vote |
| 🔤 **Speed Word** | 1 à 12 | Mots fléchés inédits à chaque partie, 4 niveaux. Seul contre la montre, ou en course : le premier qui finit gagne |
| 🔢 **Jeu de la Note** | 2 à 10 | Une note secrète sur 10, 3 thèmes : on répond avec quelque chose qui « vaut » sa note, les autres devinent |

Dans le salon, l'hôte peut **changer de jeu** sans que personne n'ait à se reconnecter.

### 🕵️ Undercover
- 12 thèmes : **Animés japonais**, nourriture, animaux, dessins animés, films & séries, sport, objets, lieux, métiers,
  jeux vidéo, musique, soirée (ou tout mélangé). Les paires de mots sont dans `data-undercover.js` (une ligne = une paire).
- Réglages : nombre d'undercovers (1 à 3, ajusté au nombre de joueurs), Mr. White (dès 4 joueurs), indices écrits ou à l'oral,
  1 ou 2 tours d'indices avant le vote, temps par indice.
- Points : civils 2 · undercover 10 · Mr. White 6. Mr. White éliminé peut gagner en devinant le mot des civils.

### 🔤 Speed Word
- Les grilles sont **générées automatiquement** à partir d'un dictionnaire maison de 400 mots (`data-words.js`, une ligne = `MOT | définition facile | définition difficile`) : chaque grille est nouvelle.
- 4 niveaux : 🟢 Facile 9×9 · 🟡 Moyen 11×11 (définitions simples) · 🟠 Difficile 12×12 · 🔴 Expert 14×14 (définitions corsées).
- **Avec indices** : les mots trouvés passent en vert et sont verrouillés (plus modifiables), 3 lettres à révéler (−2 🪙 chacune). **Sans indices** : aucune aide jusqu'à la fin.
- Pièces pour une grille finie : 15 / 25 / 35 / 50 selon le niveau, +25 au vainqueur d'une course ; les autres gagnent selon leur % de lettres justes.
- Clavier : flèches pour se déplacer, Espace pour changer de sens, Entrée pour passer au mot suivant. Record solo enregistré dans le navigateur.

### 🎨 Draw Time (2 à 12 joueurs)
- Comme skribbl.io : chacun dessine à son tour un mot choisi parmi 3, les autres devinent dans le chat. Lettres dévoilées avec le temps, points selon la rapidité, le dessinateur gagne des points pour chaque joueur qui trouve.
- Outils : 20 couleurs, 4 tailles, gomme, pot de peinture, annuler, tout effacer. Traits relayés en direct (événement socket `gdraw`).
- Mots (`data-draw.js`) : classiques, marrants, pimentés 🌶️ ou tout mélangé. Options : 2 à 5 manches, 60 à 120 s, 0 à 3 lettres dévoilées.

### 🎴 PRIMO ! (1 à 8 joueurs, robots possibles)
- Jeu de cartes de défausse : même couleur, même chiffre ou même symbole. ⊘ Passe, ⇄ Inversion, +2, Joker, Joker +4. Option cumul des +2/+4. À une carte, clique **PRIMO !** sinon on peut te dénoncer (+2).
- Mode **🤪 Pagaille** : 38 cartes vicieuses en plus — Échange de mains, Tornade, Cadeau piégé, Bombe, Sniper, Congélo, Miroir, Trèfle, Dynamite, Grand ménage, Roulette, Espion, Charité, Encore !, Pickpocket, +6.
- Pièces : 10 + 2 par carte posée (max 25) + podium (30/15/8).

### 🖼️ Guess Party (1 à 12 joueurs)
- Une image apparaît brouillée : devine le dessin animé, le film, le pays… Pour les pochettes d'album : l'artiste ET l'album.
- 12 thèmes (≈ 640 images) : dessins animés, Disney & Pixar, films, pochettes rap FR, rap US, pop & variété, animés japonais, séries, jeux vidéo, drapeaux, monuments, logos de clubs de foot. Plusieurs thèmes au choix.
- 3 niveaux : 😎 facile (images connues, pixellisation qui disparaît vite + indice), 🤔 moyen (plus pointu, reste pixelisé), 💀 très dur (images rares, gros zoom en noir et blanc, aucun indice).
- Images chargées à la volée : Wikipédia (affiches, jaquettes, logos, photos), Deezer (pochettes), flagcdn (drapeaux). Contenu dans `data-guess.js`.

### 🃏 Bar des Menteurs (1 à 6 joueurs, robots possibles)
- Chaque manche : 5 cartes chacun (Dames, Rois, As + Jokers qui valent tout) et une **carte du tour**. Pose 1 à 3 cartes face cachée en prétendant que ce sont des cartes du tour… ou crie **MENTEUR !** sur la pose précédente.
- Le menteur démasqué (ou l'accusateur qui s'est trompé) tire au **pistolet à bouchon** : 6 chambres, un seul bouchon, le risque monte à chaque tir. Dernier debout = gagnant.
- Options : robots bluffeurs (0 à 5), temps de jeu 20/30/45 s. Pièces : manches survécues, bonnes dénonciations, bluffs réussis, bonus vainqueur.

### 🐎 Petits chevaux (1 à 4 joueurs)
- Règles classiques, 100 % hasard : un **6 pour sortir** un cheval, un 6 fait rejouer, on **renvoie à l'écurie** le cheval adverse sur lequel on s'arrête, les cases ★ de départ sont protégées, arrivée au chiffre exact.
- Les places vides sont prises par des **robots**. Options : nombre de chevaux (2/3/4), nombre de camps, *Tu choisis ton cheval* (par défaut) ou *100 % hasard*.
- Option **🪜 Échelle** : on s'arrête pile au pied de son escalier, puis il faut faire 1, 2, 3, 4, 5, 6 pour monter chaque marche, et encore un 6 pour rentrer (≈ 7 min à 2 chevaux, 35 min à 4 chevaux/4 camps).
- **🌶️ Pimenter la partie** (options du salon) : cases spéciales posées au hasard (🚀 turbo +3, 🍌 peau de banane −3, 🌀 2 portails reliés, 🛡️ bouclier anti-capture, 🎲 rejoue, 🕳️ trou = retour à l'écurie, ⭐ +5 🪙), sortie de l'écurie sur 1 ou 6, 0/1/3 relances de dé par joueur, « manger un cheval fait rejouer ».
- Les chevaux avancent case par case en sautillant ; chaque case spéciale a sa propre animation.
- Boutique : **22 skins de pions** (🐎 Pions), **12 plateaux** (🎲 Plateaux : Bois verni gratuit → Prisme arc-en-ciel légendaire, chacun voit le plateau qu'il a équipé) et **12 animations** de capture / cheval rentré (💥 Animations chevaux, vues par tout le monde, aperçu en cliquant dans la boutique).
- Pièces : selon la durée de la partie (≈ 4 à 7 🪙/min), +2 par cheval rentré, +2 par capture, gros bonus au vainqueur.

### 🔢 Jeu de la Note
- 70 thèmes avec leur échelle (« Un animal : 1 = inoffensif, 10 = terrifiant »…), dans `data-note.js`.
- Le questionneur choisit 3 thèmes parmi 12 (2 relances), le répondeur répond, les autres devinent.
- Points : note exacte 3 · à 1 près 2 · à 2 près 1. Le répondeur gagne 1 point par joueur tombé à 1 près.

## Mettre le site en ligne (gratuit, ~10 min) avec Render

1. **Crée un compte GitHub** (github.com) puis un nouveau dépôt, par ex. `musikz`.
2. **Envoie les fichiers** du dossier dans le dépôt : sur la page du dépôt, « Add file → Upload files »,
   glisse tout le contenu du dossier `musikz` (sauf `node_modules` s'il existe), puis « Commit changes ».
3. **Crée un compte sur render.com** (connexion avec GitHub).
4. « New + » → **Web Service** → choisis ton dépôt `musikz`.
   - Runtime : **Node**
   - Build Command : `npm install`
   - Start Command : `npm start`
   - Instance type : **Free**
5. Clique **Create Web Service**. Après 2-3 minutes tu obtiens une adresse du type
   `https://musikz-xxxx.onrender.com`. C'est ton site !

> ℹ️ Avec l'offre gratuite, le serveur s'endort après 15 min sans visite : le premier chargement
> peut prendre ~1 minute. Ouvre le site un peu avant de jouer.

## Jouer

### 🪙 Progression, pièces et boutique
- Chaque partie rapporte : **10 🪙 de participation + 4 🪙 par bonne réponse + podium 30 / 15 / 8 🪙**
  (une bonne partie ≈ 40 à 80 🪙). On démarre avec 100 🪙. Barème modifiable en haut de `shop.js` (`earn`).
- Prix : **Commun** < 300 🪙 · **◆ Rare** 300–1 200 · **✦ Épique** 1 200–2 500 · **★ Légendaire** 2 500 à 6 000 🪙.
- Boutique (🎨 à l'accueil, dans le salon et en fin de partie — on peut changer de look à tout moment, même pendant une manche) :
  icônes (dont animées : dragon, planète, comète, space invader, trophée…), **couleurs animées** (coucher de soleil, océan,
  toxique, vaporwave, or massif, arc-en-ciel), cadres (jusqu'à Flammes vivantes, Hacker, Roi, Arc-en-ciel stroboscope),
  effets de pseudo (jusqu'à Inferno, Hacker, Royal, Stroboscope), titres, effets de victoire.
- 🎁 **Cadeau** toutes les 10 minutes (6 à 15 🪙) et 💰 **coffre** toutes les heures (35 à 90 🪙, 10 % de chance de jackpot ×2),
  à ouvrir en bas à gauche de l'écran pendant l'attente (accueil, salon, fin de partie). Réglages dans `shop.js` (`gift`, `chest`).
- La progression est enregistrée **dans le navigateur** (le serveur gratuit de Render oublie tout quand il s'endort).
  Onglet **💾 Sauvegarde** : un code à copier pour la retrouver sur un autre appareil.

### 🃏 Mode Zizanie (option)
Avant chaque extrait, chaque joueur tire 2 cartes (1 bonus + 1 malus, 10 s pour choisir) et en joue une (ou aucune).
Rareté de chaque carte : **Commune 68 %**, **◆ Rare 23 %** (bleu), **✦ Épique 7,5 %** (violet), **★ Légendaire 1,5 %** (arc-en-ciel).

| | Bonus (pour soi) | Malus (sur le joueur de son choix) |
|---|---|---|
| Communes | 🔤 Première lettre · 🧩 Pendu · 🖼️ Pochette floue · 📅 Année · 💰 ×2 · 👂 Avant-première · ⚡ Éclair (+50 si trouvé en 10 s) · ✂️ 50/50 (QCM) | 📢 Soundboard · 🙃 Tête en bas · 🧊 Gel · 🎚️ Volume yo-yo · 🕶️ Lunettes noires · 💩 Pluie d'emojis · 🦟 Moustique |
| ◆ Rares | 💎 ×3 · 🛡️ Bouclier · 🔀 Anagramme | 🐿️ Chipmunk · 🐢 Ralenti · ⌨️ Clavier fou · 🔌 Coupures de courant |
| ✦ Épiques | 🗣️ Le Souffleur · 🎰 Jackpot ×4 | 🎪 Le Grand Bazar · 💿 Disque rayé |
| ★ Légendaires | ✍️ **La Plume Magique** : la réponse s'écrit toute seule | 🎭 **L'Imposteur** : la victime entend une AUTRE chanson, sans le savoir |

### Options de partie
- **Mode** : saisie libre (tolérante aux fautes et aux accents) ou QCM 4 choix
- **À deviner** : artiste + titre, titre seul ou artiste seul
- **5 à 50 extraits**, **10 à 30 s** d'écoute
- **Temps entre deux extraits** : 3, 5 (par défaut), 8 ou 12 s, ou « Manuel » (l'hôte clique sur Suivant)
- **Bonus** : vitesse (50 → 100 pts), premier à trouver (+20), combo artiste + titre (+50)
- **Playlist perso** : colle un lien de playlist **Spotify ou Deezer** (option « Jouer uniquement ma playlist »).
  Pour Spotify, les morceaux sont retrouvés sur Deezer pour avoir l'extrait audio (quelques-uns peuvent manquer).
  La playlist Spotify doit être publique.
- **Chat + réactions emoji** pendant la partie (les bonnes réponses sont bloquées dans le chat 🤫)
- **🚫 Mauvaise version** (hôte, pendant la révélation) : bannit cet extrait, une autre version sera cherchée la prochaine fois
  (la liste des bannis repart à zéro quand Render redémarre ; les extraits bannis apparaissent dans les Logs de Render).
- L'hôte peut passer un extrait, arrêter la partie, exclure un joueur. Si l'hôte part, un autre joueur prend la main.

## Tester sur ton ordinateur
Avec Node.js 18+ installé : `npm install` puis `npm start` et ouvre http://localhost:3000.
`npm test` lance un mode test avec de faux morceaux (sans son), pratique pour essayer l'interface.

## Personnaliser les catégories
Tout est dans `categories.js`, une ligne par morceau :
- catégories musique : `Artiste — Titre`
- catégories « œuvre » : `Nom de l'œuvre|Autre nom accepté :: recherche Deezer`

## Spotify (facultatif)
L'import Spotify marche sans rien configurer. Si un jour Spotify bloque, crée une appli sur
developer.spotify.com et ajoute dans Render (Environment) les variables `SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET`.

## 🎡 Roue de la chance & récompenses
- Un tour = 200 🪙 : pièces (25 à 500) ou objet surprise que tu n'as pas encore (commun 28 %, rare 10 %, épique 1,5 %, légendaire 0,3 %). Chances affichées sous la roue, réglables dans `public/shop.js` (`wheel`).
- Boutique : un premier clic sur un objet pas encore acheté ouvre un **aperçu** (les animations se jouent), l'achat se fait avec le bouton « Acheter ».
- Cadeau (10 min) et coffre (1 h) redessinés en SVG.

## 🛡️ Mode modo (réservé au propriétaire)
1. Sur Render : service → **Environment** → *Add Environment Variable* → clé `ADMIN_KEY`, valeur = ton code secret → *Save* (le site redémarre).
2. Dans un salon, tape dans le chat : `/modo ton-code` (la commande n'est jamais envoyée aux autres).
3. Un bouton 🛡️ apparaît : ajoute-toi des pièces (sans rien débloquer) ou donne des pièces à un joueur / à tout le salon. Le code est retenu sur ton appareil.
