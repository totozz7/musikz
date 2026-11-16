# 🎵 MUSIKZ — le blind test entre potes

Blind test multijoueur en temps réel (jusqu'à 12 joueurs), extraits Deezer de 30 s, 43 catégories
choisies à la main (~1 100 morceaux) : Dessins animés 2000-2010, Disney VF, films, séries, animés, jeux vidéo,
rap FR, variété, décennies, genres, monde, et des catégories fun (tubes de soirée,
tubes de l'été, hymnes de stade, Noël, Disney Channel, comédies musicales, émissions télé)…

Seules les **versions originales** sont gardées : les reprises piano/guitare, karaoké, live, remix… sont filtrées,
et parmi les versions restantes on prend la plus écoutée.

Dans les catégories « Écrans » on devine le **nom de l'œuvre** (dessin animé, film, série…) ;
dans les autres, l'**artiste** et le **titre**.

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
- Chaque partie rapporte des pièces : **15 de participation + 8 par bonne réponse + bonus de podium (60 / 35 / 20)**.
  On démarre avec 300 🪙.
- Bouton **🎨 Personnaliser & Boutique** à l'accueil : icônes, couleur, cadres (RGB gamer, néon clignotant, glitch,
  galaxie, électrique, diamant…), effets de pseudo (RGB qui bouge, néon clignotant, glitch, or brillant…), titres,
  effets de victoire (ce qui pleut quand tu trouves une réponse).
- La progression est enregistrée **dans le navigateur** (le serveur gratuit de Render oublie tout quand il s'endort).
  Onglet **💾 Sauvegarde** : un code à copier pour la retrouver sur un autre appareil.


1. Ouvre le site, choisis un pseudo et un avatar, clique **Créer un salon**.
2. Clique sur le code du salon en haut (🔗 *Copier le lien*) et envoie le lien à tes potes.
3. Choisis les catégories et les options, puis **Lancer la partie**.

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
