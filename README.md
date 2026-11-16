# 🎵 MUSIKZ — le blind test entre potes

Blind test multijoueur en temps réel (jusqu'à 12 joueurs), extraits Deezer de 30 s, 39 catégories
(Dessins animés FR, Disney VF, films, séries, animés, jeux vidéo, rap FR, variété, décennies, genres, monde…).

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

1. Ouvre le site, choisis un pseudo et un avatar, clique **Créer un salon**.
2. Clique sur le code du salon en haut (🔗 *Copier le lien*) et envoie le lien à tes potes.
3. Choisis les catégories et les options, puis **Lancer la partie**.

### Options de partie
- **Mode** : saisie libre (tolérante aux fautes et aux accents) ou QCM 4 choix
- **À deviner** : artiste + titre, titre seul ou artiste seul
- **5 à 50 extraits**, **10 à 30 s** d'écoute
- **Bonus** : vitesse (50 → 100 pts), premier à trouver (+20), combo artiste + titre (+50)
- **Playlist perso** : colle un lien de playlist Deezer pour jouer sur tes propres morceaux
- **Chat + réactions emoji** pendant la partie (les bonnes réponses sont bloquées dans le chat 🤫)
- L'hôte peut passer un extrait, arrêter la partie, exclure un joueur. Si l'hôte part, un autre joueur prend la main.

## Tester sur ton ordinateur
Avec Node.js 18+ installé : `npm install` puis `npm start` et ouvre http://localhost:3000.
`npm test` lance un mode test avec de faux morceaux (sans son), pratique pour essayer l'interface.

## Personnaliser les catégories
Tout est dans `categories.js` : chaque catégorie = un nom, un emoji et des mots-clés de recherche
de playlists Deezer. Ajoute une ligne pour créer une catégorie.
