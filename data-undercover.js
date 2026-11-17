// PlayZup — Undercover : paires de mots par thème.
// Chaque ligne : "mot des civils | mot de l'undercover" (proches mais différents).
// Pour ajouter une paire, ajoute une ligne. Le sens est tiré au hasard à chaque partie.
const T = [];
const theme = (id, name, emoji, pairs) => T.push({ id, name, emoji, pairs: pairs.trim().split('\n').map(l => l.split('|').map(s => s.trim())).filter(p => p.length === 2 && p[0] && p[1]) });

theme('anime', 'Animés japonais', '🍥', `
Naruto | Sasuke
Luffy | Ace
Goku | Vegeta
Pikachu | Évoli
Sharingan | Byakugan
Kamehameha | Rasengan
Light Yagami | L
Ninja | Samouraï
Zoro | Sanji
Tanjiro | Zenitsu
Eren | Livaï
Gon | Kirua
Saitama | Genos
Itachi | Madara
Kakashi | Jiraya
Sangoku | Sangohan
Pokéball | Master Ball
Shōnen | Seinen
Ramen | Onigiri
Totoro | Ponyo
Bulma | Chichi
Hokage | Kazekage
Chakra | Haki
Super Saiyan | Ultra Instinct
Titan colossal | Titan cuirassé
Ryuk | Rem
Nami | Robin
Dragon Ball | Saint Seiya
Manga | Webtoon
Gear 5 | Gear 4
Kurama | Shukaku
Bleach | Naruto
Hinata | Sakura
Chopper | Pikachu
Akatsuki | Espada
`);

theme('food', 'Nourriture', '🍕', `
Pizza | Burger
Croissant | Pain au chocolat
Sushi | Maki
Frites | Chips
Crêpe | Gaufre
Raclette | Fondue
Chocolat | Caramel
Café | Thé
Pâtes | Riz
Fraise | Framboise
Ketchup | Mayonnaise
Coca | Pepsi
Kebab | Tacos
Glace | Sorbet
Fromage | Beurre
Pomme | Poire
Citron | Orange
Couscous | Paëlla
Nutella | Confiture
Hot-dog | Sandwich
Macaron | Meringue
Omelette | Œuf au plat
`);

theme('animals', 'Animaux', '🦁', `
Chat | Chien
Lion | Tigre
Loup | Renard
Requin | Dauphin
Abeille | Guêpe
Cheval | Âne
Crocodile | Alligator
Lapin | Hamster
Aigle | Faucon
Pingouin | Manchot
Grenouille | Crapaud
Serpent | Lézard
Vache | Mouton
Singe | Gorille
Hibou | Chouette
Papillon | Libellule
Ours | Panda
Escargot | Limace
Poule | Canard
Baleine | Orque
Girafe | Zèbre
Moustique | Mouche
`);

theme('cartoons', 'Dessins animés', '📺', `
Bob l'éponge | Patrick
Totally Spies | W.I.T.C.H.
Code Lyoko | Galactik Football
Oggy | Tom et Jerry
Scooby-Doo | Garfield
Titeuf | Le Petit Nicolas
Mickey | Donald
Dora | Diego
Peppa Pig | Trotro
Ben 10 | Danny Fantôme
Les Schtroumpfs | Les Minions
Kim Possible | Atomic Betty
Bugs Bunny | Daffy Duck
Winx | Mew Mew
Pokémon | Digimon
Astérix | Obélix
Tintin | Spirou
Lucky Luke | Les Dalton
Les Simpson | Les Griffin
Phinéas et Ferb | Gumball
`);

theme('movies', 'Films & séries', '🎬', `
Harry Potter | Le Seigneur des anneaux
Star Wars | Star Trek
Titanic | Avatar
Batman | Superman
Spider-Man | Iron Man
Friends | How I Met Your Mother
Stranger Things | Dark
Le Roi Lion | Le Livre de la jungle
Shrek | L'Âge de glace
Jurassic Park | King Kong
Game of Thrones | The Witcher
La Casa de Papel | Lupin
Toy Story | Monstres & Cie
Fast & Furious | Taxi
James Bond | Mission impossible
Joker | Harley Quinn
Netflix | Disney+
Kaamelott | Astérix
Les Bronzés | Les Visiteurs
La Reine des neiges | Raiponce
Squid Game | Alice in Borderland
`);

theme('sport', 'Sport', '⚽', `
Football | Rugby
Tennis | Badminton
Basket | Handball
Ski | Snowboard
Natation | Plongée
Boxe | Judo
Vélo | Trottinette
Golf | Mini-golf
Pétanque | Bowling
Surf | Skate
Formule 1 | MotoGP
Marathon | Sprint
Volley | Beach-volley
Escalade | Randonnée
Ping-pong | Squash
Yoga | Pilates
Karaté | Taekwondo
Hockey | Patinage
Échecs | Dames
Coupe du monde | Ligue des champions
`);

theme('objects', 'Objets du quotidien', '🧸', `
Fourchette | Cuillère
Stylo | Crayon
Téléphone | Tablette
Chaise | Tabouret
Lampe | Bougie
Montre | Réveil
Brosse à dents | Peigne
Parapluie | Imperméable
Clé | Cadenas
Sac à dos | Valise
Ciseaux | Couteau
Oreiller | Couverture
Lunettes | Lentilles
Télécommande | Manette
Miroir | Fenêtre
Savon | Shampoing
Ordinateur | Console
Casque | Écouteurs
Bouteille | Gourde
Ballon | Frisbee
`);

theme('places', 'Lieux & voyages', '✈️', `
Plage | Piscine
Montagne | Colline
Paris | Londres
Avion | Hélicoptère
Hôtel | Camping
Restaurant | Cantine
École | Université
Hôpital | Pharmacie
Cinéma | Théâtre
Musée | Bibliothèque
Désert | Savane
Forêt | Jungle
Métro | Tramway
Château | Palais
New York | Las Vegas
Tour Eiffel | Statue de la Liberté
Supermarché | Marché
Zoo | Aquarium
Discothèque | Bar
Japon | Chine
`);

theme('jobs', 'Métiers', '👷', `
Pompier | Policier
Médecin | Infirmier
Boulanger | Pâtissier
Professeur | Directeur
Pilote | Hôtesse de l'air
Cuisinier | Serveur
Architecte | Ingénieur
Chanteur | Rappeur
Acteur | Mannequin
Avocat | Juge
Dentiste | Vétérinaire
Plombier | Électricien
Youtubeur | Streamer
Facteur | Livreur
Coiffeur | Esthéticienne
Fermier | Jardinier
Astronaute | Pilote de chasse
Magicien | Clown
Journaliste | Présentateur télé
Footballeur | Arbitre
`);

theme('games', 'Jeux vidéo', '🎮', `
Mario | Luigi
Minecraft | Roblox
Fortnite | Apex Legends
Pokémon | Yu-Gi-Oh
FIFA | PES
Zelda | Skyrim
GTA | Red Dead Redemption
PlayStation | Xbox
Switch | Game Boy
Pac-Man | Tetris
Sonic | Crash Bandicoot
League of Legends | Dota
Call of Duty | Battlefield
Among Us | Fall Guys
Rocket League | Mario Kart
Clash Royale | Brawl Stars
Les Sims | Animal Crossing
Candy Crush | Subway Surfers
Overwatch | Valorant
Street Fighter | Tekken
`);

theme('music', 'Musique', '🎸', `
Guitare | Basse
Piano | Synthétiseur
Batterie | Djembé
Violon | Violoncelle
Rap | Slam
Rock | Metal
Concert | Festival
Micro | Haut-parleur
Karaoké | Blind test
Chorale | Orchestre
Spotify | Deezer
Vinyle | CD
DJ | Producteur
Trompette | Saxophone
Disco | Funk
Clip | Live
Flûte | Harmonica
Opéra | Comédie musicale
Casque | Enceinte
Tube de l'été | Hymne national
`);

theme('party', 'Soirée', '🥳', `
Anniversaire | Mariage
Apéro | Barbecue
Bière | Champagne
Selfie | Photo de groupe
Gueule de bois | Fatigue
Bisou | Câlin
Danse | Chorégraphie
Pyjama | Jogging
Action ou vérité | Jeu à boire
Sieste | Grasse matinée
Uber | Taxi
Noël | Nouvel An
Halloween | Carnaval
Ex | Crush
Texto | Message vocal
Tinder | Instagram
Feu d'artifice | Feu de camp
Vacances | Week-end
Pizza froide | Restes de la veille
Playlist | Blind test
`);

module.exports = T;
