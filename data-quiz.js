// PlayZup — QUIZ : une ligne par question « Question|BONNE réponse|faux 1|faux 2|faux 3 » (tu peux en ajouter/corriger librement)
// Thèmes généraux + « 🦄 La moins répondue ». Les sous-thèmes sont dans data-quiz2.js et data-quiz3.js.
const RAW = {
  culture: { name: "Culture G", emoji: '🧠', cat: 'gen', q: `
Combien de jours compte une année bissextile ?|366|365|364|367
Quelle est la langue la plus parlée au monde (locuteurs natifs) ?|Le mandarin|L'anglais|L'espagnol|L'hindi
Qui a peint « La Joconde » ?|Léonard de Vinci|Michel-Ange|Raphaël|Botticelli
Quel est le symbole chimique de l'or ?|Au|Or|Ag|Go
Combien de joueurs y a-t-il dans une équipe de football sur le terrain ?|11|10|12|9
Quelle est la capitale de l'Australie ?|Canberra|Sydney|Melbourne|Perth
Quel animal est l'emblème de la marque Lacoste ?|Un crocodile|Un lézard|Un serpent|Une tortue
Dans quelle ville se trouve la statue de la Liberté ?|New York|Washington|Boston|Chicago
Combien de côtés a un hexagone ?|6|5|7|8
Qui a écrit « Les Misérables » ?|Victor Hugo|Émile Zola|Alexandre Dumas|Balzac
Quelle est la monnaie du Japon ?|Le yen|Le yuan|Le won|Le baht
Quel est le plus grand océan du monde ?|Pacifique|Atlantique|Indien|Arctique
Combien de cordes a une guitare classique ?|6|4|5|7
Quel est le pays d'origine de la pizza ?|L'Italie|La Grèce|L'Espagne|Les États-Unis
Quelle couleur obtient-on en mélangeant du bleu et du jaune ?|Vert|Violet|Orange|Marron
En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?|1969|1959|1972|1965
Combien y a-t-il de lettres dans l'alphabet français ?|26|24|25|28
Quel est le plus long fleuve de France ?|La Loire|La Seine|Le Rhône|La Garonne
Quel instrument a 88 touches ?|Le piano|L'accordéon|L'orgue|Le xylophone
Quel jour fête-t-on la Saint-Valentin ?|14 février|14 mars|1er février|21 février
Qui a inventé l'ampoule électrique moderne (brevet de 1879) ?|Thomas Edison|Nikola Tesla|Graham Bell|Isaac Newton
Quel gaz les plantes absorbent-elles pour la photosynthèse ?|Le dioxyde de carbone|L'oxygène|L'azote|L'hélium
Combien de minutes y a-t-il dans une journée ?|1 440|1 240|2 400|1 000
Quelle est la plus petite planète du système solaire ?|Mercure|Mars|Vénus|Pluton
Comment s'appelle la peur des araignées ?|L'arachnophobie|La claustrophobie|L'agoraphobie|L'acrophobie
Combien de jours compte le mois de février d'une année normale ?|28|29|30|27
Quel est l'aliment principal du panda ?|Le bambou|L'eucalyptus|Le riz|Les fruits
Quelle est la capitale du Portugal ?|Lisbonne|Porto|Madrid|Séville
Combien de pattes a un insecte ?|6|8|4|10
Quel est le plus grand désert du monde (en comptant les déserts froids) ?|L'Antarctique|Le Sahara|Le Gobi|L'Arctique
Quelle fête célèbre-t-on le 31 octobre ?|Halloween|La Toussaint|Thanksgiving|Carnaval
Qui a écrit « Le Petit Prince » ?|Antoine de Saint-Exupéry|Jules Verne|Albert Camus|Marcel Pagnol
Quel métal est liquide à température ambiante ?|Le mercure|Le plomb|L'étain|Le zinc
De quel pays vient le tango ?|L'Argentine|L'Espagne|Le Brésil|Cuba
Combien de joueurs dans une équipe de rugby à XV ?|15|13|11|12
Dans quel pays se trouve la tour de Pise ?|L'Italie|La France|L'Espagne|La Grèce
Combien de faces a un dé classique ?|6|4|8|12
Quelle est la couleur du cheval blanc d'Henri IV ?|Blanc|Noir|Gris|Marron
Quel est le nom de la galaxie où se trouve la Terre ?|La Voie lactée|Andromède|Le Grand Nuage de Magellan|Orion
Quel animal est le symbole de la France ?|Le coq|L'aigle|Le lion|L'ours
Combien de secondes dans une heure ?|3 600|360|6 000|1 000
Qui a peint « Les Tournesols » ?|Vincent van Gogh|Claude Monet|Paul Cézanne|Pablo Picasso
Quel sport pratique-t-on à Wimbledon ?|Le tennis|Le golf|Le cricket|L'équitation
Quelle est la langue officielle du Brésil ?|Le portugais|L'espagnol|Le brésilien|L'anglais
Combien y a-t-il de zéros dans un million ?|6|5|7|9
Dans quel pays se trouve Venise ?|L'Italie|La Croatie|La Grèce|L'Espagne
Quelle est la capitale de l'Allemagne ?|Berlin|Munich|Francfort|Hambourg
Qui a composé « La Lettre à Élise » ?|Beethoven|Mozart|Chopin|Bach
Combien de couleurs a l'arc-en-ciel ?|7|5|6|8
Quel est le contraire de « concave » ?|Convexe|Plat|Creux|Courbe
Quelle est la boisson nationale du Japon (alcool de riz) ?|Le saké|Le soju|Le baijiu|La vodka
Quel est l'organe qui filtre le sang pour fabriquer l'urine ?|Les reins|Le foie|La rate|Le pancréas
Combien de temps dure un match de rugby (hors arrêts) ?|80 minutes|90 minutes|60 minutes|70 minutes
Quel est le nom de famille de Mickey dans sa VO ?|Mouse|Duck|Dog|Rat
Quelle est la plus grande île du monde ?|Le Groenland|L'Australie|Madagascar|Bornéo
Quel est l'instrument de musique de Jimi Hendrix ?|La guitare|La batterie|Le saxophone|Le piano
En quelle année est tombé le mur de Berlin ?|1989|1991|1985|1979
Quel est le nombre romain pour 50 ?|L|C|D|V
Quel est le nombre romain pour 100 ?|C|M|D|L
Quel écrivain a créé Sherlock Holmes ?|Arthur Conan Doyle|Agatha Christie|Edgar Allan Poe|Charles Dickens
Qui a créé le personnage d'Hercule Poirot ?|Agatha Christie|Arthur Conan Doyle|Georges Simenon|Maurice Leblanc
Quel est le gentleman cambrioleur créé par Maurice Leblanc ?|Arsène Lupin|Fantômas|Rocambole|Rouletabille
Combien de cases a un échiquier ?|64|81|100|49
Quelle reine d'Égypte est célèbre pour sa relation avec Jules César ?|Cléopâtre|Néfertiti|Hatchepsout|Isis
Quel est le symbole du dollar américain ?|$|£|€|¥
Quel est le symbole de la livre sterling ?|£|$|€|¥
De quelle couleur est le maillot de l'équipe de France de foot à domicile ?|Bleu|Blanc|Rouge|Noir
Quelle est la plus grande ville du monde par population (agglomération) ?|Tokyo|Paris|New York|Londres
Quel personnage de conte perd une pantoufle de verre ?|Cendrillon|Blanche-Neige|La Belle au bois dormant|Raiponce
Dans quel conte trouve-t-on un loup déguisé en grand-mère ?|Le Petit Chaperon rouge|Les Trois Petits Cochons|Hansel et Gretel|Boucle d'or
Qui a écrit « Le Tour du monde en 80 jours » ?|Jules Verne|Alexandre Dumas|Victor Hugo|H. G. Wells
Combien de temps met la Terre pour faire le tour du Soleil ?|Environ 365 jours|24 heures|30 jours|12 ans
Combien de temps met la Terre pour tourner sur elle-même ?|Environ 24 heures|365 jours|12 heures|7 jours
Quel est le cri du cheval ?|Il hennit|Il brame|Il barrit|Il mugit
Quel est le cri de l'éléphant ?|Il barrit|Il rugit|Il hennit|Il brait
Quel est l'ingrédient principal du guacamole ?|L'avocat|La tomate|Le concombre|Le poivron
Quel est l'ingrédient principal du houmous ?|Le pois chiche|La lentille|Le haricot rouge|La fève
Quel fromage italien est utilisé sur la pizza Margherita ?|La mozzarella|Le parmesan|Le gorgonzola|La ricotta
Quelle est la note de musique entre « mi » et « sol » ?|Fa|La|Ré|Si
Combien de notes dans une gamme (do ré mi fa sol la si) ?|7|8|6|12
Quel est le pays du flamenco ?|L'Espagne|Le Portugal|Le Mexique|L'Italie
Quelle invention est attribuée à Gutenberg ?|L'imprimerie à caractères mobiles|Le télescope|La boussole|Le papier
Dans quel pays se trouve le Taj Mahal ?|L'Inde|Le Pakistan|L'Iran|Le Népal
Quel monument parisien a été construit pour l'Exposition universelle de 1889 ?|La tour Eiffel|L'Arc de triomphe|Le Sacré-Cœur|Le Grand Palais
Qui a peint le plafond de la chapelle Sixtine ?|Michel-Ange|Léonard de Vinci|Raphaël|Le Caravage
Combien d'années dure un siècle ?|100|1 000|10|50
Combien de grammes dans un kilogramme ?|1 000|100|10|10 000
Combien de centimètres dans un mètre ?|100|10|1 000|60
Quelle est la couleur de la boîte noire d'un avion ?|Orange|Noire|Rouge|Jaune
Quel est le nom du bonhomme blanc mascotte de Michelin ?|Bibendum|Gaston|Michou|Marshmallow
Quelle est la mascotte des JO de Paris 2024 ?|Les Phryges|Les Coqs|Marianne|Les Bonnets
Quel est l'aliment préféré de Popeye ?|Les épinards|Les carottes|Le brocoli|Les haricots
Dans quelle ville se trouve le Colisée ?|Rome|Athènes|Naples|Florence
Quel est le plus long os du corps humain ?|Le fémur|Le tibia|L'humérus|Le radius
Quel est l'animal le plus lent du monde (mammifère) ?|Le paresseux|La tortue|Le koala|Le lamantin
Quelle est la boisson la plus consommée au monde après l'eau ?|Le thé|Le café|La bière|Le soda
Combien de pièces y a-t-il dans un jeu d'échecs (au total) ?|32|16|24|36
Quel est le nom de l'avion supersonique franco-britannique ?|Concorde|Caravelle|Airbus A380|Mirage
Quelle est la capitale de la Suisse (ville fédérale) ?|Berne|Genève|Zurich|Lausanne
De quel pays vient le sushi ?|Le Japon|La Chine|La Corée|La Thaïlande
Quel est le plus petit pays du monde ?|Le Vatican|Monaco|Saint-Marin|Malte
Quelle est la célèbre devise de la République française ?|Liberté, Égalité, Fraternité|Travail, Famille, Patrie|Paix et Justice|Un pour tous, tous pour un
` },
  sport: { name: "Sport", emoji: '🏅', cat: 'gen', q: `
Combien de fois la France a-t-elle gagné la Coupe du monde de football ?|2|1|3|0
Dans quel sport utilise-t-on un volant ?|Badminton|Tennis|Squash|Ping-pong
Combien de points vaut un essai au rugby à XV ?|5|3|4|7
Quel pays organise le tournoi de Roland-Garros ?|La France|L'Espagne|L'Angleterre|Les États-Unis
Combien de joueurs par équipe sur le terrain au basket ?|5|6|7|4
Quelle est la distance d'un marathon ?|42,195 km|40 km|21,1 km|50 km
Dans quel sport s'illustre Teddy Riner ?|Judo|Lutte|Boxe|Karaté
Quel club a remporté le plus de Ligues des champions ?|Real Madrid|AC Milan|Bayern Munich|Liverpool
Combien de trous compte un parcours de golf classique ?|18|9|12|21
Quelle couleur porte le leader du Tour de France ?|Jaune|Vert|Blanc|À pois
Dans quelle ville ont eu lieu les JO d'été de 2024 ?|Paris|Los Angeles|Tokyo|Londres
Combien de temps dure un match de foot (hors prolongations) ?|90 minutes|80 minutes|100 minutes|60 minutes
Quel sportif est surnommé « The GOAT » du basket par beaucoup ?|Michael Jordan|Kobe Bryant|Tony Parker|Shaquille O'Neal
Au tennis, comment appelle-t-on un score de 40-40 ?|Égalité|Avantage|Jeu blanc|Tie-break
Dans quel sport fait-on un « strike » avec des quilles ?|Le bowling|Le billard|Le baseball|Le cricket
Quel pays a remporté le plus de Coupes du monde de football ?|Le Brésil|L'Allemagne|L'Italie|L'Argentine
Combien d'anneaux compte le drapeau olympique ?|5|4|6|7
Avec quel club Kylian Mbappé a-t-il commencé en pro ?|AS Monaco|PSG|Real Madrid|OL
Quel est le sport national du Japon ?|Le sumo|Le judo|Le karaté|Le kendo
Combien de sets gagnants faut-il en finale de Grand Chelem masculin ?|3|2|4|5
Dans quel sport parle-t-on de « home run » ?|Le baseball|Le cricket|Le football américain|Le hockey
Quel nageur français a gagné 4 médailles d'or aux JO de Paris 2024 ?|Léon Marchand|Florent Manaudou|Camille Lacourt|Yannick Agnel
Quelle forme a un ballon de rugby ?|Ovale|Rond|Carré|Triangulaire
Combien de joueurs par équipe sur un terrain de volley ?|6|5|7|8
Combien de joueurs par équipe sur un terrain de handball ?|7|6|5|8
Combien de points vaut une transformation au rugby ?|2|1|3|5
Combien de points vaut une pénalité au rugby ?|3|2|5|1
Au basket, combien vaut un tir réussi derrière la ligne à 6,75 m ?|3|2|4|1
Dans quel sport utilise-t-on une crosse et une balle en caoutchouc sur glace (palet) ?|Le hockey sur glace|Le curling|Le polo|Le lacrosse
Quel sport se joue avec des pierres de granit qu'on fait glisser sur la glace ?|Le curling|Le bobsleigh|La luge|Le biathlon
Quelle épreuve combine ski de fond et tir à la carabine ?|Le biathlon|Le triathlon|Le pentathlon|Le combiné nordique
Quelles sont les 3 disciplines du triathlon ?|Natation, vélo, course|Course, tir, natation|Vélo, ski, course|Natation, aviron, course
Quel pays a inventé le judo ?|Le Japon|La Chine|La Corée|La Mongolie
Dans quel sport s'est illustré Usain Bolt ?|L'athlétisme (sprint)|La natation|Le saut en longueur|Le cyclisme
Quel est le record du monde du 100 m d'Usain Bolt ?|9,58 s|9,69 s|9,72 s|9,48 s
Combien de tours de piste fait-on lors d'un 400 m (piste standard) ?|1|2|4|½
Quel joueur de tennis espagnol est surnommé le « roi de la terre battue » ?|Rafael Nadal|Carlos Alcaraz|David Ferrer|Carlos Moyá
Combien de fois Rafael Nadal a-t-il gagné Roland-Garros ?|14|10|12|9
Quel est le surnom de l'équipe de France de rugby ?|Le XV de France|Les Bleus de l'ovale|Les Coqs|Les Tricolores du rugby
Quel tournoi oppose chaque année six nations européennes au rugby ?|Le Tournoi des Six Nations|La Coupe d'Europe|Le Super Rugby|Le Rugby Championship
Quel est le surnom de l'équipe de Nouvelle-Zélande de rugby ?|Les All Blacks|Les Wallabies|Les Springboks|Les Pumas
Quelle danse les All Blacks font-ils avant les matchs ?|Le haka|La samba|Le siva|Le tango
Comment s'appelle la course cycliste à travers la France en juillet ?|Le Tour de France|Paris-Roubaix|Le Giro|La Vuelta
Quel coureur a remporté 5 Tours de France, surnommé « le Cannibale » ?|Eddy Merckx|Bernard Hinault|Jacques Anquetil|Miguel Indurain
Quel maillot récompense le meilleur grimpeur du Tour de France ?|Le maillot à pois|Le maillot vert|Le maillot blanc|Le maillot jaune
Quel maillot récompense le meilleur sprinteur du Tour ?|Le maillot vert|Le maillot à pois|Le maillot blanc|Le maillot rouge
Dans quel sport parle-t-on de « birdie » et « eagle » ?|Le golf|Le badminton|Le tennis|Le cricket
Quel nageur américain détient le record de médailles d'or olympiques ?|Michael Phelps|Ryan Lochte|Mark Spitz|Caeleb Dressel
Combien de médailles d'or olympiques a Michael Phelps ?|23|18|28|20
Où se trouve le circuit des 24 Heures du Mans ?|Au Mans|À Magny-Cours|À Monaco|Au Castellet
Quel pays a gagné la Coupe du monde de foot 2022 ?|L'Argentine|La France|Le Brésil|La Croatie
Qui a gagné la Coupe du monde de foot 2014 ?|L'Allemagne|L'Argentine|Les Pays-Bas|Le Brésil
Qui a gagné la Coupe du monde de foot 2010 ?|L'Espagne|Les Pays-Bas|L'Allemagne|L'Italie
Dans quel pays a eu lieu la Coupe du monde de foot 2022 ?|Le Qatar|La Russie|Les Émirats arabes unis|L'Arabie saoudite
Quel joueur a gagné le plus de Ballons d'Or ?|Lionel Messi|Cristiano Ronaldo|Michel Platini|Johan Cruyff
Combien de Ballons d'Or Lionel Messi a-t-il gagnés ?|8|7|6|5
Quel Français a gagné le Ballon d'Or 2022 ?|Karim Benzema|Kylian Mbappé|Antoine Griezmann|N'Golo Kanté
Quel Français a gagné trois Ballons d'Or d'affilée (1983-85) ?|Michel Platini|Zinédine Zidane|Jean-Pierre Papin|Raymond Kopa
Dans quel club joue traditionnellement le « Clásico » contre le Real Madrid ?|Le FC Barcelone|L'Atlético Madrid|Séville|Valence
Quel club anglais est surnommé « les Red Devils » ?|Manchester United|Liverpool|Arsenal|Chelsea
Quel club est surnommé « les Gunners » ?|Arsenal|Tottenham|West Ham|Chelsea
Dans quel stade joue le PSG ?|Le Parc des Princes|Le Stade de France|Le Vélodrome|Le Groupama Stadium
Dans quel stade joue l'OM ?|Le Vélodrome|Le Parc des Princes|Le Stade Bollaert|Le Roazhon Park
Combien de joueurs dans une équipe de water-polo dans l'eau ?|7|6|5|11
Quel sport se pratique sur un « tatami » ?|Le judo|La lutte|La boxe|L'escrime
Quelle est la couleur de ceinture la plus élevée au judo (pour les débutants à confirmés) ?|Noire|Marron|Rouge|Bleue
Quelles armes utilise-t-on en escrime ?|Fleuret, épée, sabre|Fleuret, dague, sabre|Épée, lance, sabre|Fleuret, épée, rapière
Quel sport de raquette se joue contre un mur ?|Le squash|Le badminton|Le padel|Le tennis de table
Quel sport mélange tennis et squash, joué à 2 contre 2 dans une cage vitrée ?|Le padel|Le pickleball|Le badminton|Le racquetball
Quel est le nombre maximum de points en une seule fois au snooker (break maximum) ?|147|155|100|180
Quel score maximum peut-on faire avec 3 fléchettes ?|180|150|100|200
Quel boxeur était surnommé « The Greatest » ?|Mohamed Ali|Mike Tyson|Joe Frazier|George Foreman
Combien de rounds dure un combat de boxe pour un titre mondial pro ?|12|10|15|8
Dans quel sport s'affrontent des « quarterbacks » ?|Le football américain|Le baseball|Le rugby|Le hockey
Comment s'appelle la finale du championnat de football américain ?|Le Super Bowl|Les World Series|Le Final Four|La Stanley Cup
Quel trophée récompense le champion de la NHL (hockey) ?|La Coupe Stanley|Le Super Bowl|La Coupe Davis|La Ryder Cup
Quelle compétition de tennis oppose des nations ?|La Coupe Davis|La Ryder Cup|L'America's Cup|La Coupe Stanley
Quelle compétition de golf oppose l'Europe et les États-Unis ?|La Ryder Cup|La Coupe Davis|Le Masters|L'US Open
Quel sport se pratique avec un « kayak » ou un « canoë » ?|Le canoë-kayak|L'aviron|La voile|Le rafting
Quel skipper français a gagné plusieurs fois le Vendée Globe ?|Michel Desjoyeaux|Éric Tabarly|Florence Arthaud|Loïck Peyron
Comment s'appelle la course à la voile en solitaire autour du monde, sans escale ?|Le Vendée Globe|La Route du Rhum|La Transat Jacques Vabre|La Volvo Ocean Race
Quel skieur français a gagné le gros globe de cristal de ski alpin en 2021 ?|Alexis Pinturault|Jean-Claude Killy|Luc Alphand|Clément Noël
Quel biathlète français a gagné 7 gros globes de cristal ?|Martin Fourcade|Quentin Fillon Maillet|Simon Desthieux|Raphaël Poirée
Quel pays a accueilli les JO d'hiver 2018 ?|La Corée du Sud|Le Japon|La Chine|La Russie
Combien de temps dure une mi-temps au handball ?|30 minutes|45 minutes|20 minutes|25 minutes
Combien de quart-temps dans un match de NBA ?|4|2|3|6
Combien de minutes dure un quart-temps en NBA ?|12|10|15|20
Quel joueur français de NBA a été rookie de l'année 2024 ?|Victor Wembanyama|Rudy Gobert|Tony Parker|Evan Fournier
Dans quelle équipe joue Victor Wembanyama (draft 2023) ?|Les San Antonio Spurs|Les Lakers|Les Celtics|Les Knicks
Quel sport pratique Kelly Slater ?|Le surf|Le skateboard|Le snowboard|La natation
Quel sport se pratique sur une « half-pipe » en neige ?|Le snowboard|Le biathlon|Le ski de fond|Le saut à ski
Quel athlète français détient le record du monde du saut à la perche (2014) ?|Renaud Lavillenie|Armand Duplantis|Sergueï Bubka|Pierre Quinon
Quel perchiste suédois bat régulièrement le record du monde depuis 2020 ?|Armand Duplantis|Renaud Lavillenie|Sam Kendricks|Thiago Braz
Dans quel sport s'illustre Kilian Jornet ?|Le trail / ski-alpinisme|La natation|Le cyclisme|L'escrime
Combien de points pour gagner un set au tennis de table (sans égalité) ?|11|21|15|10
Combien de points pour gagner un set au badminton (sans égalité) ?|21|11|15|25
Combien de points pour gagner un set au volley (hors 5e set) ?|25|21|15|30
Dans quel sport doit-on faire un « slam dunk » ?|Le basket|Le volley|Le handball|Le water-polo
Quel joueur de foot portugais est surnommé CR7 ?|Cristiano Ronaldo|Ricardo Quaresma|Luís Figo|Bernardo Silva
Quel est le surnom de Zinédine Zidane ?|Zizou|Zinzin|Le Magicien|Le Kaiser
Quel joueur a donné un coup de tête en finale de la Coupe du monde 2006 ?|Zinédine Zidane|Marco Materazzi|Thierry Henry|Franck Ribéry
` },
  manga: { name: "Manga & anime", emoji: '🍥', cat: 'gen', q: `
Quel est le rêve de Luffy dans One Piece ?|Devenir le roi des pirates|Devenir Hokage|Trouver les Dragon Balls|Devenir chasseur
Comment s'appelle le renard à neuf queues dans Naruto ?|Kurama|Shukaku|Gyûki|Son Gokû
Quel est le vrai nom de Sangoku chez les Saiyans ?|Kakarot|Vegeta|Raditz|Bardock
Dans « L'Attaque des Titans », comment s'appelle le héros ?|Eren Jäger|Levi Ackerman|Armin Arlert|Reiner Braun
Que permet le Death Note ?|Tuer quelqu'un en écrivant son nom|Voyager dans le temps|Lire les pensées|Devenir invisible
Quel Pokémon est le compagnon de Sacha ?|Pikachu|Évoli|Salamèche|Rondoudou
Dans Demon Slayer, comment s'appelle la sœur de Tanjiro ?|Nezuko|Kanao|Shinobu|Mitsuri
Quel est le fruit du démon de Luffy (nom original) ?|Gomu Gomu no Mi|Mera Mera no Mi|Hie Hie no Mi|Ope Ope no Mi
Quel studio a réalisé « Le Voyage de Chihiro » ?|Ghibli|Toei|MAPPA|Kyoto Animation
Dans Jujutsu Kaisen, quel professeur porte un bandeau sur les yeux ?|Satoru Gojo|Kento Nanami|Suguru Geto|Masamichi Yaga
Combien y a-t-il de Dragon Balls ?|7|5|6|9
Quel est le métier de rêve de Gon dans Hunter x Hunter ?|Hunter|Pirate|Ninja|Alchimiste
Dans Naruto, quel est le nom du village caché de la Feuille ?|Konoha|Suna|Kiri|Kumo
Quel personnage de My Hero Academia est né sans Alter ?|Izuku Midoriya|Katsuki Bakugo|Shoto Todoroki|All Might
Dans One Piece, qui est le cuisinier de l'équipage ?|Sanji|Zoro|Usopp|Chopper
Quel anime suit les frères Elric ?|Fullmetal Alchemist|Bleach|Black Clover|Fairy Tail
Comment s'appelle le Shinigami qui accompagne Light ?|Ryuk|Rem|Sidoh|L
Dans Dragon Ball Z, qui tue Freezer sur Namek ?|Personne, il survit|Vegeta|Gohan|Piccolo
Quel manga met en scène Ichigo Kurosaki ?|Bleach|Naruto|Gintama|Blue Lock
Dans « Chainsaw Man », comment s'appelle le chien-tronçonneuse ?|Pochita|Power|Denji|Makima
Quelle est la forme de Gohan qui dépasse Cell ?|Super Saiyan 2|Super Saiyan 3|Super Saiyan God|Ultra Instinct
Quel manga se déroule autour d'un tournoi de football et d'un « ego » ?|Blue Lock|Captain Tsubasa|Inazuma Eleven|Haikyu!!
Quel est le nom du chapeau emblématique de Luffy ?|Un chapeau de paille|Un chapeau de cowboy|Un bonnet|Un béret
Qui est l'épéiste à trois sabres de l'équipage de Luffy ?|Roronoa Zoro|Sanji|Usopp|Brook
Quelle navigatrice de l'équipage de Luffy adore l'argent et les mandarines ?|Nami|Robin|Vivi|Boa Hancock
Quel est le nom du renne médecin de l'équipage du Chapeau de paille ?|Chopper|Brook|Franky|Jinbe
Quel personnage de Naruto possède le Sharingan et veut venger son clan ?|Sasuke Uchiwa|Kakashi Hatake|Rock Lee|Neji Hyûga
Qui est le sensei de l'équipe 7 dans Naruto ?|Kakashi Hatake|Jiraiya|Iruka|Gai Maito
Quel est le rêve de Naruto ?|Devenir Hokage|Devenir le roi des pirates|Devenir Kazekage|Devenir un Hunter
Comment s'appelle l'ermite pervers qui entraîne Naruto ?|Jiraiya|Orochimaru|Tsunade|Minato
Quelle technique de Naruto crée des clones ?|Le Multiclonage|Le Rasengan|Le Chidori|Le Sharingan
Quelle attaque en boule tournoyante utilise Naruto ?|Le Rasengan|Le Chidori|L'Amaterasu|Le Kamehameha
Quel est le nom de l'attaque signature de Sangoku ?|Le Kamehameha|Le Final Flash|Le Makankosappo|Le Genkidama
Qui est le prince des Saiyans ?|Vegeta|Nappa|Broly|Raditz
Comment s'appelle le fils de Sangoku et Chichi, l'aîné ?|Son Gohan|Son Goten|Trunks|Pan
Quel est le nom de l'ennemi rose et gourmand de Dragon Ball Z ?|Boo|Cell|Freezer|Babidi
Comment s'appelle la fusion de Goku et Vegeta par la danse ?|Gogeta|Vegeto|Gotenks|Kefla
Comment s'appelle la fusion de Goku et Vegeta avec les Potaras ?|Vegeto|Gogeta|Gotenks|Kakarot
Quel est le nom du dragon qui exauce les vœux sur Terre dans Dragon Ball ?|Shenron|Porunga|Super Shenron|Ryuk
Dans Death Note, quel est le pseudonyme de Light Yagami ?|Kira|L|Near|Mello
Qui est le grand détective qui traque Kira ?|L|Near|Watari|Mikami
Quel fruit adore manger Ryuk ?|Les pommes|Les fraises|Les bananes|Les oranges
Dans L'Attaque des Titans, comment s'appelle le capitaine le plus fort de l'humanité ?|Livaï (Levi)|Erwin|Hansi|Jean
Combien de murs protègent l'humanité au début de L'Attaque des Titans ?|3|2|4|5
Comment s'appelle l'amie d'enfance d'Eren qui le protège toujours ?|Mikasa|Annie|Historia|Sasha
Dans Demon Slayer, quel est le prénom du héros ?|Tanjiro|Zenitsu|Inosuke|Giyu
Quel personnage de Demon Slayer porte une tête de sanglier ?|Inosuke|Zenitsu|Tanjiro|Rengoku
Quel élément maîtrise le souffle de Tanjiro au début ?|L'eau|Le feu|La foudre|Le vent
Quel pilier de Demon Slayer est surnommé le pilier de la Flamme ?|Kyojuro Rengoku|Giyu Tomioka|Tengen Uzui|Shinobu Kocho
Dans My Hero Academia, comment s'appelle le symbole de la paix ?|All Might|Endeavor|Hawks|Eraser Head
Comment s'appelle l'Alter transmis à Deku ?|One For All|All For One|Explosion|Half-Cold Half-Hot
Quel est l'Alter de Bakugo ?|L'explosion|Le feu et la glace|La gravité|Le durcissement
Dans Hunter x Hunter, qui est le meilleur ami de Gon ?|Killua|Kurapika|Leorio|Hisoka
De quelle famille d'assassins vient Killua ?|Zoldyck|Uchiwa|Ackerman|Kurta
Dans Jujutsu Kaisen, quel fléau habite le corps de Yuji Itadori ?|Ryomen Sukuna|Mahito|Jogo|Geto
Quel objet Yuji avale-t-il au début de Jujutsu Kaisen ?|Un doigt de Sukuna|Un œil maudit|Une dent de démon|Un parchemin
Dans Fullmetal Alchemist, quel frère a perdu son corps et vit dans une armure ?|Alphonse|Edward|Roy|Hohenheim
Quel est le surnom d'Edward Elric ?|Fullmetal Alchemist|Flame Alchemist|Strong Arm Alchemist|Crimson Alchemist
Quel principe est central dans Fullmetal Alchemist ?|L'échange équivalent|La loi du plus fort|La volonté du feu|Le nindo
Quel mangaka a créé Dragon Ball ?|Akira Toriyama|Eiichiro Oda|Masashi Kishimoto|Tite Kubo
Qui est l'auteur de One Piece ?|Eiichiro Oda|Akira Toriyama|Hajime Isayama|Yoshihiro Togashi
Qui est l'auteur de Naruto ?|Masashi Kishimoto|Eiichiro Oda|Tite Kubo|Kohei Horikoshi
Quel magazine publie One Piece, Dragon Ball et Naruto au Japon ?|Weekly Shōnen Jump|Shōnen Magazine|Young Jump|Shōnen Sunday
Dans quel sens se lit traditionnellement un manga ?|De droite à gauche|De gauche à droite|De bas en haut|En colonnes de gauche
Comment appelle-t-on un manga pour jeunes garçons ?|Shōnen|Shōjo|Seinen|Josei
Comment appelle-t-on un manga visant les jeunes filles ?|Shōjo|Shōnen|Seinen|Kodomo
Quel film de Miyazaki met en scène une grosse créature grise et poilue ?|Mon voisin Totoro|Ponyo|Le Château ambulant|Princesse Mononoké
Dans « Le Voyage de Chihiro », en quoi sont transformés les parents de Chihiro ?|En cochons|En grenouilles|En oiseaux|En chats
Quel est le nom du château volant de Hauru ?|Le Château ambulant|Laputa|Le Château dans le ciel|Le Château de Cagliostro
Quel anime met en scène un lycéen qui joue au volley, Shoyo Hinata ?|Haikyu!!|Kuroko's Basket|Blue Lock|Slam Dunk
Quel manga de basket a pour héros Hanamichi Sakuragi ?|Slam Dunk|Kuroko's Basket|Haikyu!!|Hajime no Ippo
Quel manga suit un boxeur nommé Ippo Makunouchi ?|Hajime no Ippo|Ashita no Joe|Baki|Megalo Box
Dans Pokémon, quel est le premier Pokémon de Sacha ?|Pikachu|Bulbizarre|Carapuce|Salamèche
Dans One Punch Man, combien de coups suffisent à Saitama ?|Un seul|Deux|Trois|Cent
Quel personnage de One Punch Man est un cyborg disciple de Saitama ?|Genos|King|Bang|Mumen Rider
Dans Spy x Family, quel est le super-pouvoir d'Anya ?|Lire dans les pensées|Voler|Se téléporter|Voir l'avenir
Quel est le métier caché de Yor dans Spy x Family ?|Assassin|Espionne|Policière|Médecin
Dans Bleach, comment appelle-t-on les épées des Shinigami ?|Les Zanpakutō|Les Katana d'âme|Les Nichirin|Les Hollow
Dans Tokyo Ghoul, quel est le héros mi-humain mi-goule ?|Ken Kaneki|Touka|Rize|Amon
Quel anime met en scène des créatures enfermées dans des balles et un héros de Bourg Palette ?|Pokémon|Digimon|Yu-Gi-Oh!|Beyblade
Dans Yu-Gi-Oh!, quel est le monstre fétiche de Yugi ?|Le Magicien Sombre|Le Dragon Blanc aux Yeux Bleus|Exodia|Kuriboh
Quel est le monstre préféré de Seto Kaiba ?|Le Dragon Blanc aux Yeux Bleus|Le Magicien Sombre|Slifer|Le Dragon Noir aux Yeux Rouges
Dans Chainsaw Man, comment s'appelle le héros ?|Denji|Aki|Kobeni|Reze
Dans Blue Lock, comment s'appelle le héros attaquant ?|Yoichi Isagi|Rin Itoshi|Meguru Bachira|Seishiro Nagi
Dans « Olive et Tom », comment s'appelle Olive en VO ?|Tsubasa Ozora|Kojiro Hyuga|Genzo Wakabayashi|Taro Misaki
Comment s'appelle le gardien rival d'Olive dans « Olive et Tom » ?|Thomas Price (Genzo Wakabayashi)|Mark Landers|Ben Becker|Bruce Harper
Dans Sailor Moon, quel est le vrai prénom de Sailor Moon ?|Usagi (Bunny)|Ami|Rei|Makoto
Quel anime met en scène des chevaliers protégeant la déesse Athéna ?|Les Chevaliers du Zodiaque|Sailor Moon|Fairy Tail|Bleach
Dans Fairy Tail, quel mage maîtrise le feu et adore manger des flammes ?|Natsu|Grey|Erza|Gajeel
Quel est le nom du chat bleu volant de Fairy Tail ?|Happy|Carla|Lily|Plue
Dans Black Clover, quel héros n'a aucune magie ?|Asta|Yuno|Noelle|Yami
Dans Jojo's Bizarre Adventure, comment s'appellent les pouvoirs incarnés ?|Les Stands|Les Persona|Les Quirks|Les Zanpakutō
Quel est le méchant vampire emblématique de Jojo, célèbre pour « ZA WARUDO » ?|Dio Brando|Kars|Kira Yoshikage|Diavolo
Dans Mob Psycho 100, quel est le surnom du héros Shigeo ?|Mob|Reigen|Dimple|Teru
Dans Tokyo Revengers, quel héros voyage dans le passé ?|Takemichi Hanagaki|Mikey|Draken|Naoto
Quel studio a animé L'Attaque des Titans saison finale et Jujutsu Kaisen ?|MAPPA|Toei Animation|Pierrot|Bones
Quel studio produit l'anime One Piece ?|Toei Animation|MAPPA|Madhouse|Ufotable
Quel studio a animé Demon Slayer ?|Ufotable|MAPPA|Toei|Bones
Quel anime met en scène un détective rajeuni en enfant à lunettes ?|Détective Conan|Death Note|Kindaichi|Psycho-Pass
Dans Détective Conan, quel est le vrai nom de Conan ?|Shinichi Kudo|Kogoro Mouri|Heiji Hattori|Kaito Kid
` },
  cine: { name: "Cinéma & séries", emoji: '🎬', cat: 'gen', q: `
Qui joue Jack dans « Titanic » ?|Leonardo DiCaprio|Brad Pitt|Matt Damon|Tom Cruise
Quel film d'animation met en scène un poisson-clown nommé Nemo ?|Le Monde de Nemo|Gang de requins|Les Indestructibles|Luca
Dans « Star Wars », qui est le père de Luke ?|Dark Vador|Obi-Wan Kenobi|Yoda|Han Solo
Quel est le nom de l'école de sorciers d'Harry Potter ?|Poudlard|Beauxbâtons|Durmstrang|Ilvermorny
Quelle série se déroule dans la ville de Hawkins ?|Stranger Things|Riverdale|Dark|The Walking Dead
Dans « La Casa de Papel », quel est le surnom du cerveau du braquage ?|Le Professeur|Berlin|Tokyo|Le Patron
Qui réalise « Inception » et « Interstellar » ?|Christopher Nolan|Steven Spielberg|James Cameron|Ridley Scott
Quel super-héros porte une armure créée par Tony Stark ?|Iron Man|Captain America|Thor|Hulk
Dans « Le Roi Lion », comment s'appelle l'oncle de Simba ?|Scar|Mufasa|Rafiki|Zazu
Quelle série raconte l'histoire de Walter White ?|Breaking Bad|Narcos|Ozark|Dexter
Quel acteur français joue dans « Intouchables » avec François Cluzet ?|Omar Sy|Jamel Debbouze|Kad Merad|Dany Boon
Dans « Friends », quel est le métier de Ross ?|Paléontologue|Chef cuisinier|Acteur|Masseur
Quel film a la célèbre réplique « I'll be back » ?|Terminator|Rocky|Rambo|Predator
Comment s'appelle le cowboy de « Toy Story » ?|Woody|Buzz|Jessie|Andy
Quelle série suit les familles Stark et Lannister ?|Game of Thrones|The Witcher|Vikings|The Crown
Dans « Shrek », qui est le compagnon bavard de Shrek ?|L'Âne|Le Chat Potté|Pinocchio|Le Dragon
Combien de films compte la saga principale « Star Wars » (épisodes I à IX) ?|9|6|8|12
Quel film de 1997 de Luc Besson met en scène Leeloo ?|Le Cinquième Élément|Léon|Nikita|Lucy
Quelle série coréenne a des joueurs en survêtement vert ?|Squid Game|Alice in Borderland|Kingdom|Sweet Home
Dans « Bienvenue chez les Ch'tis », où est muté Philippe ?|Bergues|Lille|Dunkerque|Calais
Quel personnage dit « Je s'appelle Groot » ?|Groot|Rocket|Drax|Star-Lord
Quel film d'animation Disney se passe au Mexique pendant la fête des morts ?|Coco|Encanto|Vaiana|Raiponce
Quel acteur incarne Jack Sparrow ?|Johnny Depp|Orlando Bloom|Brad Pitt|Keanu Reeves
Dans « Matrix », quelle pilule choisit Neo ?|La rouge|La bleue|La verte|La jaune
Quel acteur joue Neo dans « Matrix » ?|Keanu Reeves|Tom Cruise|Will Smith|Hugh Jackman
Quel réalisateur a fait « Jurassic Park » et « E.T. » ?|Steven Spielberg|George Lucas|James Cameron|Ridley Scott
Quel réalisateur a fait « Titanic » et « Avatar » ?|James Cameron|Steven Spielberg|Peter Jackson|Christopher Nolan
Quel est le film le plus rentable de l'histoire (2024) ?|Avatar|Avengers: Endgame|Titanic|Star Wars VII
Dans « Forrest Gump », à quoi la vie est-elle comparée ?|Une boîte de chocolats|Une course|Un long fleuve|Une partie d'échecs
Quel acteur joue Forrest Gump ?|Tom Hanks|Robin Williams|Kevin Costner|Jim Carrey
Dans « Retour vers le futur », quelle voiture sert de machine à voyager dans le temps ?|Une DeLorean|Une Ford Mustang|Une Chevrolet Impala|Une Cadillac
À quelle vitesse la DeLorean doit-elle rouler pour voyager dans le temps ?|88 miles/h|100 miles/h|77 miles/h|120 miles/h
Quel personnage dit « Que la Force soit avec toi » ?|Les personnages de Star Wars|Gandalf|Harry Potter|Spider-Man
Qui est le méchant à la respiration bruyante dans Star Wars ?|Dark Vador|Dark Maul|L'Empereur|Boba Fett
Quel film de Pixar raconte l'histoire d'un rat cuisinier ?|Ratatouille|Là-haut|Wall-E|Les Indestructibles
Dans « Là-haut », comment la maison s'envole-t-elle ?|Avec des ballons|Avec une fusée|Avec des hélices|Avec un dirigeable
Quel robot de Pixar nettoie une Terre abandonnée ?|Wall-E|Eve|R2-D2|Baymax
Dans « Les Indestructibles », comment s'appelle le père ?|M. Indestructible|Frozone|Syndrome|Dash
Quel film de Disney a pour héroïne Elsa ?|La Reine des neiges|Raiponce|Vaiana|Rebelle
Quel est le nom du bonhomme de neige dans « La Reine des neiges » ?|Olaf|Sven|Kristoff|Hans
Quel acteur joue Wolverine dans X-Men ?|Hugh Jackman|Ryan Reynolds|Chris Hemsworth|Christian Bale
Quel acteur joue Deadpool ?|Ryan Reynolds|Hugh Jackman|Ryan Gosling|Chris Pratt
Qui joue Iron Man dans le MCU ?|Robert Downey Jr.|Chris Evans|Mark Ruffalo|Jeremy Renner
Quel acteur joue Thor dans le MCU ?|Chris Hemsworth|Chris Evans|Chris Pratt|Tom Hiddleston
Qui est le frère adoptif de Thor ?|Loki|Odin|Heimdall|Hela
Dans « Le Seigneur des anneaux », qui porte l'Anneau jusqu'au Mordor ?|Frodon|Aragorn|Gandalf|Legolas
Comment Gollum appelle-t-il l'Anneau ?|Mon précieux|Mon trésor|Mon bijou|Mon chéri
Quel acteur joue le Joker dans « The Dark Knight » (2008) ?|Heath Ledger|Joaquin Phoenix|Jack Nicholson|Jared Leto
Quel acteur joue le Joker dans « Joker » (2019) ?|Joaquin Phoenix|Heath Ledger|Jared Leto|Jack Nicholson
Quel acteur joue James Bond dans « Casino Royale » (2006) ?|Daniel Craig|Pierce Brosnan|Sean Connery|Roger Moore
Quel est le matricule de James Bond ?|007|001|700|070
Dans « Le Parrain », quel acteur joue Vito Corleone (1972) ?|Marlon Brando|Al Pacino|Robert De Niro|James Caan
Quel film de Christopher Nolan se passe dans les rêves ?|Inception|Interstellar|Tenet|Memento
Quel film a remporté l'Oscar du meilleur film en 2024 ?|Oppenheimer|Barbie|Killers of the Flower Moon|Pauvres Créatures
Quel acteur joue Oppenheimer ?|Cillian Murphy|Matt Damon|Robert Downey Jr.|Tom Hardy
Dans quelle série Cillian Murphy joue-t-il Thomas Shelby ?|Peaky Blinders|Boardwalk Empire|Taboo|The Crown
Dans « Friends », comment s'appelle le café où se retrouvent les amis ?|Central Perk|Monk's Café|MacLaren's|Luke's
Quel personnage de « Friends » dit « How you doin'? » ?|Joey|Chandler|Ross|Monica
Dans « How I Met Your Mother », quel personnage dit « Legen… dary » ?|Barney|Ted|Marshall|Robin
Dans « The Office » US, comment s'appelle le patron ?|Michael Scott|Dwight Schrute|Jim Halpert|Andy Bernard
Quelle série met en scène une famille jaune à Springfield ?|Les Simpson|Les Griffin|American Dad|Bob's Burgers
Dans « Stranger Things », quelle fille a des pouvoirs psychiques ?|Onze (Eleven)|Max|Nancy|Robin
Dans « Breaking Bad », quel est le pseudonyme de Walter White ?|Heisenberg|Gus|Saul|Pinkman
Dans « Game of Thrones », quelle est la devise des Stark ?|L'hiver vient|Feu et sang|Un Lannister paie toujours ses dettes|Nous ne semons pas
Quelle reine possède des dragons dans « Game of Thrones » ?|Daenerys Targaryen|Cersei Lannister|Sansa Stark|Margaery Tyrell
Dans « La Casa de Papel », quel masque portent les braqueurs ?|Dalí|Guy Fawkes|Un clown|Un loup
Quelle série Netflix française met en scène Omar Sy en gentleman cambrioleur ?|Lupin|Marseille|Plan Cœur|Les Combattantes
Quelle série se déroule dans la prison de Litchfield ?|Orange Is the New Black|Prison Break|Oz|Wentworth
Dans « Prison Break », qui a le plan de la prison tatoué sur le corps ?|Michael Scofield|Lincoln Burrows|T-Bag|Sucre
Quel détective vit au 221B Baker Street ?|Sherlock Holmes|Hercule Poirot|Columbo|Maigret
Quelle série met en scène des zombies et un shérif nommé Rick ?|The Walking Dead|Z Nation|Fear the Walking Dead|The Last of Us
Dans « Squid Game », quel jeu ouvre la compétition ?|1, 2, 3, soleil|La marelle|Le tir à la corde|Les billes
Quel film français de 2011 avec Omar Sy et François Cluzet a été un énorme succès ?|Intouchables|Bienvenue chez les Ch'tis|Les Visiteurs|Le Dîner de cons
Quel film français raconte l'histoire de Jacquouille et Godefroy ?|Les Visiteurs|Les Bronzés|Astérix|Le Père Noël est une ordure
Qui joue Jacquouille la Fripouille ?|Christian Clavier|Jean Reno|Gérard Depardieu|Thierry Lhermitte
Quel acteur joue Obélix dans les films Astérix des années 2000 ?|Gérard Depardieu|Gilles Lellouche|Jean Reno|Michel Blanc
Quel film français se déroule dans un camping avec Patrick Chirac ?|Camping|Les Bronzés|Bienvenue chez les Ch'tis|Les Tuche
Quel acteur joue Patrick Chirac dans « Camping » ?|Franck Dubosc|Kad Merad|Dany Boon|Christian Clavier
Quelle famille de Bouzolles gagne au loto dans une comédie française ?|Les Tuche|Les Bodin's|Les Deschiens|Les Lopez
Quel film de Luc Besson met en scène un tueur et une petite fille, Mathilda ?|Léon|Nikita|Lucy|Taxi
Dans « Le Roi Lion », comment s'appelle le phacochère ami de Simba ?|Pumbaa|Timon|Zazu|Rafiki
Dans « Aladdin », comment s'appelle le singe d'Aladdin ?|Abu|Iago|Rajah|Raja
Dans « Shrek », comment s'appelle la princesse ?|Fiona|Aurore|Belle|Raiponce
Quel est le nom de l'ogre vert de DreamWorks ?|Shrek|Hulk|Fiona|Donkey
Dans « L'Âge de glace », quel animal court après un gland ?|Scrat l'écureuil|Sid le paresseux|Manny le mammouth|Diego le tigre
Dans « Moi, moche et méchant », comment s'appellent les petits êtres jaunes ?|Les Minions|Les Gremlins|Les Smurfs|Les Lapins crétins
Quel personnage de « Toy Story » dit « Vers l'infini et au-delà ! » ?|Buzz l'Éclair|Woody|Rex|Zurg
Quel film d'animation de 2023 met en scène Miles Morales ?|Spider-Man: Across the Spider-Verse|Les Indestructibles 2|Les Mitchell contre les machines|Le Chat Potté 2
Quel acteur joue Indiana Jones ?|Harrison Ford|Mel Gibson|Bruce Willis|Sylvester Stallone
Quel acteur joue Rocky Balboa ?|Sylvester Stallone|Arnold Schwarzenegger|Dolph Lundgren|Jean-Claude Van Damme
Quel acteur joue John McClane dans « Piège de cristal » ?|Bruce Willis|Mel Gibson|Harrison Ford|Kurt Russell
Quel film de Quentin Tarantino a une scène de danse culte avec John Travolta et Uma Thurman ?|Pulp Fiction|Kill Bill|Reservoir Dogs|Jackie Brown
Quel film d'horreur met en scène un clown nommé Grippe-Sou ?|Ça|Saw|Annabelle|Scream
Quel tueur porte un masque de hockey dans « Vendredi 13 » ?|Jason|Freddy|Michael Myers|Ghostface
Quel cinéaste britannique est surnommé le maître du suspense ?|Alfred Hitchcock|Stanley Kubrick|Ridley Scott|David Lynch
Quel film de Kubrick se déroule dans l'hôtel Overlook ?|Shining|Orange mécanique|2001 l'Odyssée de l'espace|Full Metal Jacket
Quelle ville accueille le plus célèbre festival de cinéma français ?|Cannes|Deauville|Nice|Paris
Quelle récompense est remise au meilleur film à Cannes ?|La Palme d'or|L'Ours d'or|Le Lion d'or|L'Oscar
Comment s'appellent les récompenses du cinéma français ?|Les César|Les Molière|Les Victoires|Les Oscars
` },
  musique: { name: "Musique", emoji: '🎵', cat: 'gen', q: `
Qui chante « Bad Guy » ?|Billie Eilish|Dua Lipa|Ariana Grande|Lorde
Quel groupe a chanté « Bohemian Rhapsody » ?|Queen|The Beatles|ABBA|Pink Floyd
Quel rappeur français a sorti l'album « Civilisation » ?|Orelsan|Nekfeu|Booba|Damso
De quel pays vient le groupe ABBA ?|Suède|Norvège|Danemark|Pays-Bas
Qui est surnommé le « King of Pop » ?|Michael Jackson|Elvis Presley|Prince|Justin Timberlake
Quel instrument joue principalement Jimi Hendrix ?|La guitare|La batterie|Le piano|La basse
Qui chante « Alors on danse » ?|Stromae|Angèle|Maître Gims|Christophe Maé
Combien de musiciens dans un quatuor ?|4|3|5|6
Quel duo français est connu pour ses casques de robots ?|Daft Punk|Justice|Air|Cassius
Quelle chanteuse a sorti « Djadja » ?|Aya Nakamura|Wejdene|Angèle|Louane
Quel compositeur était sourd à la fin de sa vie ?|Beethoven|Mozart|Bach|Chopin
Quel est le vrai prénom de « Johnny Hallyday » ?|Jean-Philippe|Jean-Pierre|Jean-Jacques|Jean-Marc
Quel groupe britannique a chanté « Yellow » ?|Coldplay|Oasis|Radiohead|Muse
Quelle chanteuse est surnommée « Queen B » ?|Beyoncé|Britney Spears|Rihanna|Billie Eilish
Dans quel pays est né le reggae ?|La Jamaïque|Cuba|Le Brésil|Haïti
Qui a chanté « Shape of You » ?|Ed Sheeran|Shawn Mendes|Harry Styles|Sam Smith
Combien de lignes compte une portée de musique ?|5|4|6|7
Quel artiste a sorti « Thriller » ?|Michael Jackson|Prince|Madonna|Stevie Wonder
Quelle rappeuse US a sorti « Super Bass » ?|Nicki Minaj|Cardi B|Megan Thee Stallion|Doja Cat
Qui chante « Je veux » (« un peu d'amour, c'est tout ce que je veux ») ?|Zaz|Louane|Indila|Jain
Quel groupe de K-pop a chanté « Dynamite » ?|BTS|BLACKPINK|EXO|Stray Kids
Qui chante « Rolling in the Deep » ?|Adele|Amy Winehouse|Duffy|Lana Del Rey
Qui chante « Umbrella » ?|Rihanna|Beyoncé|Ciara|Kelly Rowland
Qui chante « Hello » (2015) ?|Adele|Sia|Lady Gaga|Ellie Goulding
Quel groupe a chanté « Smells Like Teen Spirit » ?|Nirvana|Pearl Jam|Green Day|Foo Fighters
Qui chante « Billie Jean » ?|Michael Jackson|Prince|Lionel Richie|Stevie Wonder
Quel artiste a sorti l'album « 21 » ?|Adele|Taylor Swift|Rihanna|Beyoncé
Quelle chanteuse a sorti « Shake It Off » ?|Taylor Swift|Katy Perry|Selena Gomez|Miley Cyrus
Quel rappeur américain s'appelle Marshall Mathers ?|Eminem|Dr. Dre|50 Cent|Snoop Dogg
Qui chante « Gangnam Style » ?|PSY|BTS|BigBang|G-Dragon
Qui chante « Despacito » avec Daddy Yankee ?|Luis Fonsi|Enrique Iglesias|J Balvin|Ricky Martin
Quel groupe a chanté « Wonderwall » ?|Oasis|Blur|The Verve|Coldplay
Quel groupe a chanté « Hotel California » ?|Eagles|Fleetwood Mac|The Doors|Lynyrd Skynyrd
Quel est le surnom d'Elvis Presley ?|Le King|Le Boss|The Voice|Le Duc
Quel chanteur est surnommé « The Boss » ?|Bruce Springsteen|Bon Jovi|Elvis Presley|Frank Sinatra
Qui chante « La Vie en rose » à l'origine ?|Édith Piaf|Dalida|Barbara|Juliette Gréco
Qui chante « Ne me quitte pas » ?|Jacques Brel|Charles Aznavour|Georges Brassens|Léo Ferré
Qui chante « Les Champs-Élysées » ?|Joe Dassin|Claude François|Michel Sardou|Serge Gainsbourg
Qui chante « Alexandrie Alexandra » ?|Claude François|Mike Brant|Christophe|Sacha Distel
Qui chante « La Bohème » ?|Charles Aznavour|Jacques Brel|Gilbert Bécaud|Yves Montand
Qui chante « Je te donne » en duo avec Michael Jones ?|Jean-Jacques Goldman|Patrick Bruel|Francis Cabrel|Renaud
Qui chante « Mistral gagnant » ?|Renaud|Alain Souchon|Laurent Voulzy|Francis Cabrel
Qui chante « Balance ton quoi » ?|Angèle|Louane|Clara Luciani|Pomme
Qui chante « Tout oublier » avec Roméo Elvis ?|Angèle|Aya Nakamura|Juliette Armanet|Lomepal
Quel rappeur a sorti « Bande organisée » avec d'autres artistes marseillais ?|Jul (et ses invités)|Booba|Nekfeu|Orelsan
Quel rappeur de Marseille est connu pour son signe de la main « JUL » ?|Jul|SCH|Naps|Soso Maness
Quel rappeur est surnommé « le Duc de Boulogne » ?|Booba|Kaaris|La Fouine|Rohff
Quel duo de rappeurs est composé de deux frères de Corbeil-Essonnes ?|PNL|Bigflo et Oli|Lacrim et Rim'K|Columbine
Quel duo toulousain est composé de deux frères rappeurs, Florian et Olivio ?|Bigflo et Oli|PNL|Casseurs Flowters|Twinsmatic
Qui chante « Papaoutai » ?|Stromae|Maître Gims|Kendji Girac|Black M
Quel chanteur belge a chanté « Formidable » ?|Stromae|Angèle|Jacques Brel|Damso
Qui chante « Dernière danse » ?|Indila|Zaz|Louane|Nolwenn Leroy
Quel groupe français a chanté « L'Aventurier » ?|Indochine|Téléphone|Noir Désir|Les Rita Mitsouko
Quel groupe français a chanté « Un autre monde » ?|Téléphone|Indochine|Noir Désir|Trust
Quel instrument a 4 cordes et se joue avec un archet, plus grand que le violon ?|L'alto|La guitare|Le ukulélé|La mandoline
Quel est le plus grave des instruments à cordes de l'orchestre ?|La contrebasse|Le violoncelle|L'alto|La harpe
Combien de touches noires sur un piano standard ?|36|52|40|32
Quel compositeur a écrit « Les Quatre Saisons » ?|Vivaldi|Mozart|Bach|Haendel
Quel compositeur a écrit « La Flûte enchantée » ?|Mozart|Verdi|Wagner|Beethoven
Quel compositeur a écrit le « Boléro » ?|Maurice Ravel|Claude Debussy|Erik Satie|Georges Bizet
Quel opéra de Bizet contient l'air « L'amour est un oiseau rebelle » ?|Carmen|La Traviata|Aïda|Tosca
Combien de musiciens dans un trio ?|3|2|4|5
Quel festival anglais se déroule dans une ferme près de Glastonbury ?|Glastonbury|Reading|Coachella|Download
Quel festival américain a lieu dans le désert californien ?|Coachella|Lollapalooza|Burning Man|Woodstock
Quel festival mythique a eu lieu en 1969 aux États-Unis ?|Woodstock|Coachella|Monterey|Lollapalooza
Comment s'appelle le concours européen de chansons ?|L'Eurovision|The Voice|Star Academy|Nouvelle Star
Quel groupe suédois a gagné l'Eurovision 1974 avec « Waterloo » ?|ABBA|Roxette|Ace of Base|Europe
Quel groupe italien a gagné l'Eurovision 2021 ?|Måneskin|Il Volo|Negramaro|Pinguini Tattici Nucleari
Quelle chanteuse française est arrivée 2e de l'Eurovision 2021 avec « Voilà » ?|Barbara Pravi|Amir|Patricia Kaas|La Zarra
Qui chante « Toxic » ?|Britney Spears|Christina Aguilera|Jessica Simpson|Mandy Moore
Qui chante « Poker Face » ?|Lady Gaga|Katy Perry|Rihanna|Kesha
Qui chante « Blinding Lights » ?|The Weeknd|Drake|Bruno Mars|Post Malone
Qui chante « Uptown Funk » avec Mark Ronson ?|Bruno Mars|Pharrell Williams|Justin Timberlake|Usher
Qui chante « Happy » ?|Pharrell Williams|Bruno Mars|Robin Thicke|Will.i.am
Quel groupe chante « (I Can't Get No) Satisfaction » ?|The Rolling Stones|The Who|The Kinks|The Beatles
De quelle ville viennent les Beatles ?|Liverpool|Londres|Manchester|Birmingham
Quel Beatles a écrit « Imagine » en solo ?|John Lennon|Paul McCartney|George Harrison|Ringo Starr
Quel chanteur de Queen avait une moustache célèbre ?|Freddie Mercury|Brian May|Roger Taylor|John Deacon
Quel groupe a chanté « We Will Rock You » ?|Queen|AC/DC|Kiss|Aerosmith
Quel groupe australien a chanté « Highway to Hell » ?|AC/DC|INXS|Midnight Oil|Men at Work
Qui chante « Purple Rain » ?|Prince|Jimi Hendrix|Lenny Kravitz|Stevie Wonder
Qui chante « I Will Always Love You » dans « Bodyguard » ?|Whitney Houston|Mariah Carey|Céline Dion|Tina Turner
Qui chante « My Heart Will Go On » ?|Céline Dion|Whitney Houston|Mariah Carey|Lara Fabian
Quel DJ français a produit « Titanium » ?|David Guetta|Bob Sinclar|Martin Solveig|DJ Snake
Quel DJ français a produit « Turn Down for What » avec Lil Jon ?|DJ Snake|David Guetta|Kungs|Petit Biscuit
Quel DJ suédois a produit « Wake Me Up » ?|Avicii|Alesso|Swedish House Mafia|Kygo
Quel DJ norvégien est connu pour la « tropical house » (« Firestone ») ?|Kygo|Alan Walker|Avicii|Robin Schulz
Qui chante « Bad Romance » ?|Lady Gaga|Madonna|Christina Aguilera|Rihanna
Quelle chanteuse est surnommée la « Reine de la pop » ?|Madonna|Britney Spears|Lady Gaga|Kylie Minogue
Quel rappeur a sorti l'album « Ipséité » ?|Damso|Nekfeu|Orelsan|Hamza
Quel rappeur a sorti l'album « Feu » en 2015 ?|Nekfeu|Orelsan|Vald|Lomepal
Quel rappeur a sorti l'album « Ceinture noire » ?|Maître Gims|Booba|Soprano|Black M
De quel groupe faisait partie Maître Gims ?|Sexion d'Assaut|IAM|113|Mafia K'1 Fry
De quel groupe marseillais faisait partie Akhenaton ?|IAM|Psy 4 de la Rime|Fonky Family|3e Œil
De quel groupe faisait partie Soprano ?|Psy 4 de la Rime|IAM|Sexion d'Assaut|Fonky Family
Qui chante « Bella » ?|Maître Gims|Black M|Soprano|Dadju
Quelle chanteuse a sorti « Pookie » ?|Aya Nakamura|Wejdene|Imen Es|Lyna Mahyem
Qui chante « Je vole » ?|Louane|Zaz|Angèle|Pomme
` },
  geo: { name: "Géographie", emoji: '🌍', cat: 'gen', q: `
Quelle est la capitale du Canada ?|Ottawa|Toronto|Montréal|Vancouver
Quel est le plus grand pays du monde ?|La Russie|Le Canada|La Chine|Les États-Unis
Quel est le plus haut sommet du monde ?|L'Everest|Le K2|Le mont Blanc|Le Kilimandjaro
Quel désert est le plus grand désert chaud ?|Le Sahara|Le Gobi|L'Atacama|Le Kalahari
Sur quel continent se trouve le Brésil ?|L'Amérique du Sud|L'Afrique|L'Amérique du Nord|L'Océanie
Quelle est la capitale de l'Espagne ?|Madrid|Barcelone|Séville|Valence
Dans quel pays se trouve Marrakech ?|Le Maroc|L'Algérie|La Tunisie|L'Égypte
Quel fleuve traverse Le Caire ?|Le Nil|Le Congo|Le Niger|Le Tigre
Quelle est la capitale de l'Italie ?|Rome|Milan|Venise|Naples
Quel pays a la forme d'une botte ?|L'Italie|Le Chili|Le Portugal|La Grèce
Quel est le plus haut sommet des Alpes ?|Le mont Blanc|Le Cervin|Le mont Rose|L'Eiger
Quelle est la capitale de l'Argentine ?|Buenos Aires|Santiago|Lima|Montevideo
Quel pays compte le plus d'habitants (2024) ?|L'Inde|La Chine|Les États-Unis|L'Indonésie
Combien de pays font partie de l'Union européenne (2024) ?|27|25|28|30
Quelle mer sépare l'Europe de l'Afrique ?|La Méditerranée|La mer Rouge|La mer Noire|La Manche
Quelle est la capitale de la Belgique ?|Bruxelles|Anvers|Liège|Bruges
Quel est le plus long fleuve d'Europe ?|La Volga|Le Danube|Le Rhin|La Loire
Dans quel pays se trouve le Machu Picchu ?|Le Pérou|La Bolivie|Le Mexique|Le Chili
Quelle île française est surnommée « l'île de Beauté » ?|La Corse|La Réunion|La Martinique|Belle-Île
Quel pays a pour capitale Oslo ?|La Norvège|La Suède|Le Danemark|La Finlande
Combien de régions compte la France métropolitaine ?|13|12|18|22
Quelle ville est surnommée « la Ville rose » ?|Toulouse|Marseille|Bordeaux|Nice
Quelle est la capitale du Japon ?|Tokyo|Kyoto|Osaka|Séoul
Quelle est la capitale de la Russie ?|Moscou|Saint-Pétersbourg|Kiev|Minsk
Quelle est la capitale de la Chine ?|Pékin|Shanghai|Hong Kong|Canton
Quelle est la capitale du Brésil ?|Brasilia|Rio de Janeiro|São Paulo|Salvador
Quelle est la capitale des États-Unis ?|Washington|New York|Los Angeles|Chicago
Quelle est la capitale de la Turquie ?|Ankara|Istanbul|Izmir|Antalya
Quelle est la capitale du Maroc ?|Rabat|Casablanca|Marrakech|Fès
Quelle est la capitale de l'Égypte ?|Le Caire|Alexandrie|Louxor|Gizeh
Quelle est la capitale de la Grèce ?|Athènes|Thessalonique|Sparte|Héraklion
Quelle est la capitale des Pays-Bas ?|Amsterdam|Rotterdam|La Haye|Utrecht
Quelle est la capitale de la Suède ?|Stockholm|Oslo|Göteborg|Helsinki
Quelle est la capitale de l'Irlande ?|Dublin|Belfast|Cork|Galway
Quelle est la capitale de la Pologne ?|Varsovie|Cracovie|Gdansk|Prague
Quelle est la capitale de l'Autriche ?|Vienne|Salzbourg|Graz|Innsbruck
Quelle est la capitale du Mexique ?|Mexico|Cancún|Guadalajara|Monterrey
Quelle est la capitale de l'Inde ?|New Delhi|Mumbai|Calcutta|Bangalore
Quelle est la capitale de la Corée du Sud ?|Séoul|Busan|Pyongyang|Incheon
Quelle est la capitale du Sénégal ?|Dakar|Saint-Louis|Thiès|Bamako
Quelle est la capitale de l'Algérie ?|Alger|Oran|Constantine|Tunis
Quelle est la capitale de la Tunisie ?|Tunis|Sfax|Sousse|Alger
Quelle est la capitale officielle de la Côte d'Ivoire ?|Yamoussoukro|Abidjan|Bouaké|Dakar
Quelle est la capitale de la Nouvelle-Zélande ?|Wellington|Auckland|Christchurch|Sydney
Quel est le plus long fleuve du monde (selon la plupart des sources) ?|Le Nil|L'Amazone|Le Yangtsé|Le Mississippi
Quel fleuve a le plus grand débit au monde ?|L'Amazone|Le Nil|Le Congo|Le Mississippi
Quelle chaîne de montagnes sépare la France et l'Espagne ?|Les Pyrénées|Les Alpes|Le Jura|Les Vosges
Quelle chaîne de montagnes est la plus haute du monde ?|L'Himalaya|Les Andes|Les Alpes|Les Rocheuses
Quelle est la plus longue chaîne de montagnes du monde (terrestre) ?|Les Andes|L'Himalaya|Les Rocheuses|L'Atlas
Quel pays a le plus de fuseaux horaires ?|La France|La Russie|Les États-Unis|La Chine
Combien d'États composent les États-Unis ?|50|52|48|51
Quel État américain est le plus grand ?|L'Alaska|Le Texas|La Californie|Le Montana
Dans quel pays se trouvent les chutes du Niagara (en partie) ?|Le Canada|Le Mexique|Le Brésil|L'Argentine
Quelles chutes d'eau se trouvent entre le Brésil et l'Argentine ?|Les chutes d'Iguazú|Les chutes Victoria|Le Niagara|Le Salto Ángel
Quel pays compte le plus de lacs ?|Le Canada|La Finlande|La Russie|La Suède
Quel est le lac le plus profond du monde ?|Le lac Baïkal|Le lac Tanganyika|Le lac Supérieur|Le lac Titicaca
Quel détroit sépare l'Espagne du Maroc ?|Le détroit de Gibraltar|Le Bosphore|Le détroit de Messine|Le Pas de Calais
Quel canal relie la mer Méditerranée à la mer Rouge ?|Le canal de Suez|Le canal de Panama|Le canal de Corinthe|Le canal du Midi
Quel canal relie l'Atlantique au Pacifique ?|Le canal de Panama|Le canal de Suez|Le détroit de Magellan|Le canal de Kiel
Dans quel pays se trouve le Kilimandjaro ?|La Tanzanie|Le Kenya|L'Éthiopie|L'Ouganda
Dans quel pays se trouve Petra ?|La Jordanie|L'Égypte|Israël|Le Liban
Dans quel pays se trouve Angkor Vat ?|Le Cambodge|La Thaïlande|Le Vietnam|Le Laos
Dans quel pays se trouve Chichén Itzá ?|Le Mexique|Le Guatemala|Le Pérou|Le Honduras
Dans quel pays se trouve la Sagrada Família ?|L'Espagne|Le Portugal|L'Italie|Le Mexique
Dans quelle ville se trouve Big Ben ?|Londres|Édimbourg|Dublin|Manchester
Dans quelle ville se trouve l'Opéra en forme de voiles ?|Sydney|Melbourne|Auckland|Dubaï
Dans quelle ville se trouve le Christ Rédempteur ?|Rio de Janeiro|São Paulo|Lisbonne|Buenos Aires
Quel est le plus haut gratte-ciel du monde (2024) ?|Le Burj Khalifa|La Shanghai Tower|Le One World Trade Center|La Tokyo Skytree
Dans quelle ville se trouve le Burj Khalifa ?|Dubaï|Abou Dabi|Doha|Riyad
Quel pays est surnommé le « pays du Soleil-Levant » ?|Le Japon|La Chine|La Corée|La Thaïlande
Quel pays est surnommé le « pays aux mille lacs » ?|La Finlande|Le Canada|La Suède|La Norvège
Quelle est la capitale du Nigeria ?|Abuja|Lagos|Kano|Accra
Combien de pays bordent la France métropolitaine (par la terre) ?|8|6|7|10
Quelle est la plus grande région de France métropolitaine ?|La Nouvelle-Aquitaine|L'Occitanie|L'Auvergne-Rhône-Alpes|Le Grand Est
Quel est le plus haut sommet des Pyrénées ?|L'Aneto|Le Vignemale|Le Canigou|Le pic du Midi
Quel fleuve traverse Paris ?|La Seine|La Loire|La Marne|L'Oise
Quel fleuve traverse Lyon avec le Rhône ?|La Saône|La Loire|L'Isère|La Garonne
Quel fleuve traverse Bordeaux ?|La Garonne|La Dordogne|La Loire|L'Adour
Quelle mer borde Marseille ?|La Méditerranée|L'Atlantique|La Manche|La mer du Nord
Quelle est la ville la plus peuplée de France après Paris ?|Marseille|Lyon|Toulouse|Nice
Quelle île de l'océan Indien est un département français ?|La Réunion|Madagascar|Maurice|Les Seychelles
Quel département français se trouve en Amérique du Sud ?|La Guyane|La Martinique|La Guadeloupe|Saint-Pierre-et-Miquelon
Dans quel pays se trouve la Cappadoce ?|La Turquie|La Grèce|L'Iran|L'Arménie
Quel est le désert le plus aride du monde (non polaire) ?|L'Atacama|Le Sahara|Le Namib|Le Gobi
Sur quel continent se trouve le Népal ?|L'Asie|L'Europe|L'Océanie|L'Afrique
Quel pays a la plus grande superficie en Afrique ?|L'Algérie|La RDC|Le Soudan|La Libye
Quel pays d'Amérique du Sud n'a pas d'accès à la mer ?|La Bolivie|Le Chili|Le Pérou|L'Uruguay
Quelle est la capitale du Pérou ?|Lima|Cuzco|Quito|Bogotá
Quelle est la capitale de la Colombie ?|Bogotá|Medellín|Cali|Caracas
Quelle est la capitale du Chili ?|Santiago|Valparaíso|Lima|Buenos Aires
Quelle ville est surnommée la « Grosse Pomme » ?|New York|Chicago|Boston|San Francisco
Quelle ville américaine est surnommée la « Cité des Anges » ?|Los Angeles|San Francisco|Las Vegas|San Diego
Quelle ville est célèbre pour son Golden Gate Bridge ?|San Francisco|Seattle|Los Angeles|Vancouver
Quel pays a pour emblème la feuille d'érable ?|Le Canada|Les États-Unis|La Suisse|L'Autriche
Quelle est la langue officielle du Mexique ?|L'espagnol|Le portugais|Le mexicain|L'anglais
Quelles langues sont officielles en Belgique ?|Néerlandais, français, allemand|Français et anglais|Français uniquement|Wallon et flamand
Combien de langues officielles a la Suisse ?|4|3|2|5
Quel océan borde la côte ouest de la France ?|L'Atlantique|Le Pacifique|L'océan Indien|L'Arctique
Quelle est la capitale de la Hongrie ?|Budapest|Bucarest|Prague|Belgrade
Quelle est la capitale de la Roumanie ?|Bucarest|Budapest|Sofia|Chisinau
` },
  histoire: { name: "Histoire", emoji: '🏰', cat: 'gen', q: `
En quelle année a eu lieu la prise de la Bastille ?|1789|1792|1776|1815
Qui était surnommé le « Roi-Soleil » ?|Louis XIV|Louis XVI|François Ier|Henri IV
Quelle bataille marque la défaite finale de Napoléon ?|Waterloo|Austerlitz|Trafalgar|Iéna
En quelle année a commencé la Première Guerre mondiale ?|1914|1918|1939|1912
Quel mur est tombé en 1989 ?|Le mur de Berlin|La Grande Muraille|Le mur d'Hadrien|Le mur des Lamentations
Quelle civilisation a construit les pyramides de Gizeh ?|Les Égyptiens|Les Mayas|Les Romains|Les Grecs
Qui a découvert l'Amérique en 1492 ?|Christophe Colomb|Vasco de Gama|Magellan|Amerigo Vespucci
Qui était le premier président des États-Unis ?|George Washington|Abraham Lincoln|Thomas Jefferson|John Adams
Quelle femme a mené les troupes françaises à Orléans en 1429 ?|Jeanne d'Arc|Catherine de Médicis|Marie-Antoinette|Aliénor d'Aquitaine
En quelle année a pris fin la Seconde Guerre mondiale ?|1945|1944|1946|1939
Qui était le chef des Gaulois à Alésia ?|Vercingétorix|Astérix|Clovis|Brennus
Quel empereur romain a été assassiné aux Ides de mars ?|Jules César|Néron|Auguste|Caligula
Quel navire a coulé en 1912 après avoir heurté un iceberg ?|Le Titanic|Le Lusitania|Le Britannic|Le Queen Mary
Qui a été le premier homme dans l'espace ?|Youri Gagarine|Neil Armstrong|Buzz Aldrin|John Glenn
Quelle reine a été guillotinée en 1793 ?|Marie-Antoinette|Anne d'Autriche|Catherine de Médicis|Joséphine
Quel peuple venu de Scandinavie a donné son nom à la Normandie ?|Les Vikings|Les Huns|Les Wisigoths|Les Celtes
Qui a lancé l'appel du 18 juin 1940 ?|Charles de Gaulle|Philippe Pétain|Jean Moulin|Winston Churchill
Quel roi de France a été baptisé à Reims vers 496 ?|Clovis|Charlemagne|Pépin le Bref|Hugues Capet
Quelle ville a été détruite par le Vésuve en 79 ?|Pompéi|Rome|Athènes|Carthage
En quelle année l'euro est-il arrivé en pièces et billets ?|2002|1999|2000|2005
Quel pharaon est célèbre pour son tombeau découvert en 1922 ?|Toutânkhamon|Ramsès II|Khéops|Akhenaton
En quelle année a eu lieu la bataille de Marignan ?|1515|1415|1615|1492
Quel roi de France a été guillotiné en 1793 ?|Louis XVI|Louis XV|Louis XIV|Charles X
Qui a été sacré empereur des Français en 1804 ?|Napoléon Bonaparte|Louis XVIII|Charles X|Napoléon III
Sur quelle île Napoléon est-il mort en exil ?|Sainte-Hélène|L'île d'Elbe|La Corse|Malte
Sur quelle île Napoléon a-t-il été exilé une première fois en 1814 ?|L'île d'Elbe|Sainte-Hélène|La Corse|Jersey
Quel empereur a été couronné le jour de Noël de l'an 800 ?|Charlemagne|Clovis|Pépin le Bref|Louis le Pieux
En quelle année a eu lieu la bataille d'Hastings ?|1066|1166|966|1215
Quel duc de Normandie a conquis l'Angleterre en 1066 ?|Guillaume le Conquérant|Richard Cœur de Lion|Rollon|Henri II
Combien de temps a duré la guerre de Cent Ans (environ) ?|116 ans|100 ans|99 ans|130 ans
Quelle peste a ravagé l'Europe au XIVe siècle ?|La peste noire|La grippe espagnole|Le choléra|La variole
Quel roi a promulgué l'édit de Nantes en 1598 ?|Henri IV|Louis XIII|François Ier|Henri III
Quel cardinal était le ministre de Louis XIII ?|Richelieu|Mazarin|Fleury|Dubois
Quel château Louis XIV a-t-il fait agrandir pour y installer la cour ?|Versailles|Fontainebleau|Chambord|Vincennes
Quel événement a lieu le 14 juillet 1789 ?|La prise de la Bastille|La mort de Louis XVI|Le serment du Jeu de paume|La fête de la Fédération
Quel document est adopté le 26 août 1789 ?|La Déclaration des droits de l'homme et du citoyen|La Constitution de 1791|Le Code civil|Le Concordat
Quel régime succède à la monarchie en France en 1792 ?|La Première République|L'Empire|Le Consulat|La Restauration
Qui a mis en place le Code civil en 1804 ?|Napoléon Bonaparte|Robespierre|Louis XVIII|Danton
Quelle bataille de 1805 est la plus célèbre victoire de Napoléon ?|Austerlitz|Waterloo|Iéna|Wagram
En quelle année l'esclavage a-t-il été définitivement aboli en France ?|1848|1794|1789|1905
En quelle année la loi de séparation des Églises et de l'État a-t-elle été votée en France ?|1905|1789|1881|1958
En quelle année les femmes ont-elles voté pour la première fois en France ?|1945|1919|1936|1958
Quelle république a été fondée en 1958 en France ?|La Ve République|La IVe République|La IIIe République|La VIe République
Qui a été le premier président de la Ve République ?|Charles de Gaulle|Georges Pompidou|François Mitterrand|Vincent Auriol
Quel événement a lieu en mai 1968 en France ?|Des grèves et manifestations étudiantes|L'élection de de Gaulle|La fin de la guerre d'Algérie|La création de l'euro
Quel président a fait abolir la peine de mort en France (1981) ?|François Mitterrand|Valéry Giscard d'Estaing|Jacques Chirac|Georges Pompidou
Quel ministre a porté l'abolition de la peine de mort en 1981 ?|Robert Badinter|Simone Veil|Jack Lang|Pierre Mauroy
Quelle femme ministre a porté la loi sur l'IVG en 1975 ?|Simone Veil|Simone de Beauvoir|Édith Cresson|Gisèle Halimi
Quel est le premier pays à avoir envoyé un satellite dans l'espace ?|L'URSS|Les États-Unis|La France|La Chine
Comment s'appelait le premier satellite artificiel (1957) ?|Spoutnik|Apollo|Vostok|Explorer
Quel débarquement a eu lieu le 6 juin 1944 ?|Le débarquement de Normandie|Le débarquement de Provence|Le débarquement en Sicile|Pearl Harbor
Quelle attaque japonaise en 1941 a fait entrer les États-Unis dans la guerre ?|Pearl Harbor|Hiroshima|Midway|Okinawa
Sur quelles villes ont été larguées les bombes atomiques en 1945 ?|Hiroshima et Nagasaki|Tokyo et Osaka|Kyoto et Kobe|Hiroshima et Tokyo
Quel président américain a été assassiné à Dallas en 1963 ?|John F. Kennedy|Abraham Lincoln|Richard Nixon|Martin Luther King
Qui a prononcé le discours « I have a dream » ?|Martin Luther King|Malcolm X|Barack Obama|Nelson Mandela
Quel homme a été président de l'Afrique du Sud après 27 ans de prison ?|Nelson Mandela|Desmond Tutu|Thabo Mbeki|Jacob Zuma
Qui était le premier président noir des États-Unis ?|Barack Obama|Martin Luther King|Joe Biden|Colin Powell
Quel mur divisait Berlin de 1961 à 1989 ?|Le mur de Berlin|Le rideau de fer|La ligne Maginot|La muraille de Chine
En quelle année l'URSS a-t-elle été dissoute ?|1991|1989|1985|1993
Quelle guerre a opposé le Nord et le Sud des États-Unis ?|La guerre de Sécession|La guerre d'indépendance|La guerre du Vietnam|La guerre de Corée
Quel président américain a aboli l'esclavage ?|Abraham Lincoln|George Washington|Thomas Jefferson|Ulysses Grant
Quelle cité grecque était célèbre pour ses guerriers ?|Sparte|Athènes|Corinthe|Thèbes
Combien de Spartiates selon la légende aux Thermopyles ?|300|100|1 000|500
Quel philosophe grec a été le maître d'Alexandre le Grand ?|Aristote|Platon|Socrate|Pythagore
Selon la légende, quel stratagème a permis aux Grecs d'entrer dans Troie ?|Un cheval de bois|Un bélier géant|Un tunnel|Une échelle de siège
Qui était le premier empereur romain ?|Auguste|Jules César|Néron|Caligula
Quel général carthaginois a traversé les Alpes avec des éléphants ?|Hannibal|Hamilcar|Scipion|Spartacus
Quel esclave a mené une grande révolte contre Rome ?|Spartacus|Hannibal|Vercingétorix|Brutus
Quelle langue parlaient les Romains ?|Le latin|Le grec|L'italien|L'étrusque
Quelle civilisation a construit le Machu Picchu ?|Les Incas|Les Mayas|Les Aztèques|Les Olmèques
Quelle était la capitale de l'Empire aztèque ?|Tenochtitlan|Cuzco|Teotihuacan|Chichén Itzá
Quel conquistador a conquis l'Empire aztèque ?|Hernán Cortés|Francisco Pizarro|Christophe Colomb|Magellan
Quel conquistador a conquis l'Empire inca ?|Francisco Pizarro|Hernán Cortés|Vasco de Gama|Cabral
Quel navigateur a dirigé l'expédition du premier tour du monde (1519-1522) ?|Magellan|Christophe Colomb|Vasco de Gama|James Cook
Quel navigateur portugais a ouvert la route maritime des Indes ?|Vasco de Gama|Magellan|Cabral|Bartolomeu Dias
Quel pays a été colonisé par la France et est devenu indépendant en 1962 ?|L'Algérie|Le Maroc|La Tunisie|Le Sénégal
Quel pharaon a régné le plus longtemps parmi les plus célèbres (environ 66 ans) ?|Ramsès II|Toutânkhamon|Khéops|Akhenaton
Quelle écriture utilisaient les anciens Égyptiens ?|Les hiéroglyphes|Le cunéiforme|L'alphabet latin|Les runes
Quelle pierre a permis de déchiffrer les hiéroglyphes ?|La pierre de Rosette|La pierre de Gizeh|La pierre de Champollion|La pierre philosophale
Qui a déchiffré les hiéroglyphes ?|Champollion|Napoléon|Howard Carter|Mariette
Quelle reine d'Angleterre a régné de 1952 à 2022 ?|Élisabeth II|Victoria|Élisabeth Ire|Marie Stuart
Quel roi anglais a eu six épouses ?|Henri VIII|Édouard VII|Richard III|Charles Ier
Quel navigateur anglais a exploré le Pacifique et l'Australie au XVIIIe siècle ?|James Cook|Francis Drake|Walter Raleigh|Henry Hudson
Quel mouvement artistique et culturel est né en Italie au XVe siècle ?|La Renaissance|Le Baroque|Le Romantisme|Le Classicisme
Qui a dessiné « l'Homme de Vitruve » ?|Léonard de Vinci|Michel-Ange|Raphaël|Dürer
Quel savant a été condamné pour avoir soutenu que la Terre tourne autour du Soleil ?|Galilée|Copernic|Kepler|Newton
Quelle révolution a commencé en Russie en 1917 ?|La révolution d'Octobre (bolchevique)|La révolution de Février uniquement|La révolution de velours|La révolution orange
Qui a dirigé la révolution bolchevique en 1917 ?|Lénine|Staline|Trotski|Nicolas II
Quel était le dernier tsar de Russie ?|Nicolas II|Alexandre III|Pierre le Grand|Ivan le Terrible
Quel traité a mis fin à la Première Guerre mondiale (1919) ?|Le traité de Versailles|Le traité de Paris|Le traité de Rome|Le traité de Vienne
Quelle bataille de 1916 est la plus longue de la Première Guerre mondiale ?|Verdun|La Somme|La Marne|Le Chemin des Dames
Comment surnommait-on les soldats français de 14-18 ?|Les Poilus|Les Grognards|Les Bleus|Les Sans-culottes
Quel jour commémore-t-on l'armistice de 1918 ?|Le 11 novembre|Le 8 mai|Le 14 juillet|Le 1er novembre
Quel jour commémore-t-on la victoire de 1945 en Europe ?|Le 8 mai|Le 11 novembre|Le 6 juin|Le 14 juillet
Quel traité de 1957 a fondé la Communauté économique européenne ?|Le traité de Rome|Le traité de Maastricht|Le traité de Lisbonne|Le traité de Paris
Quel attentat a frappé New York le 11 septembre 2001 ?|Les attaques contre le World Trade Center|L'attentat d'Oklahoma City|L'attaque du Pentagone uniquement|La prise d'otages de Munich
Quel roi de France était surnommé « le Bien-Aimé » ?|Louis XV|Louis XIV|Louis XVI|Henri IV
Quelle reine de France était surnommée « l'Autrichienne » ?|Marie-Antoinette|Anne d'Autriche|Catherine de Médicis|Marie de Médicis
Quelle dynastie de rois de France commence avec Hugues Capet en 987 ?|Les Capétiens|Les Mérovingiens|Les Carolingiens|Les Bourbons
` },
  sciences: { name: "Sciences", emoji: '🔬', cat: 'gen', q: `
Quelle est la formule chimique de l'eau ?|H₂O|CO₂|O₂|H₂O₂
Quelle planète est surnommée la planète rouge ?|Mars|Jupiter|Vénus|Saturne
Combien d'os compte le corps d'un adulte ?|206|186|256|306
Quel organe pompe le sang ?|Le cœur|Le foie|Les poumons|Les reins
À quelle température l'eau bout-elle (au niveau de la mer) ?|100 °C|90 °C|120 °C|80 °C
Quelle est la plus grande planète du système solaire ?|Jupiter|Saturne|Neptune|La Terre
Qui a formulé la théorie de la relativité ?|Albert Einstein|Isaac Newton|Galilée|Stephen Hawking
Quel est l'organe le plus grand du corps humain ?|La peau|Le foie|L'intestin|Le cerveau
Quel gaz respirons-nous principalement dans l'air ?|L'azote|L'oxygène|Le CO₂|L'hydrogène
Quelle est la vitesse de la lumière (environ) ?|300 000 km/s|30 000 km/s|3 000 km/s|3 millions km/s
Combien de chromosomes a un être humain ?|46|23|44|48
Quelle force nous maintient au sol ?|La gravité|Le magnétisme|La friction|L'inertie
Quel scientifique a découvert la pénicilline ?|Alexander Fleming|Louis Pasteur|Marie Curie|Robert Koch
Quel est le symbole chimique du fer ?|Fe|Fr|Ir|F
Quelle partie de la cellule contient l'ADN ?|Le noyau|La membrane|Le cytoplasme|La mitochondrie
Combien de temps met la lumière du Soleil pour atteindre la Terre ?|Environ 8 minutes|Environ 8 secondes|Environ 1 heure|Instantanément
Quel savant a reçu deux prix Nobel (physique et chimie) ?|Marie Curie|Albert Einstein|Niels Bohr|Pierre Curie
Quel est l'état de l'eau à −10 °C ?|Solide|Liquide|Gazeux|Plasma
Quelle unité mesure la puissance électrique ?|Le watt|Le volt|L'ampère|L'ohm
Combien de dents a un adulte (avec les dents de sagesse) ?|32|28|30|36
Quel est l'animal le plus rapide sur terre ?|Le guépard|Le lion|L'antilope|Le lévrier
Quelle est la formule chimique du dioxyde de carbone ?|CO₂|CO|O₂|C₂O
Quel est le symbole chimique de l'argent ?|Ag|Ar|Au|Al
Quel est le symbole chimique du sodium ?|Na|So|Sd|S
Quel est le symbole chimique du potassium ?|K|P|Po|Pt
Quel est l'élément chimique le plus abondant dans l'univers ?|L'hydrogène|L'hélium|L'oxygène|Le carbone
Quel gaz rend la voix aiguë quand on l'inhale ?|L'hélium|L'azote|Le néon|L'argon
Quelle est la planète la plus proche du Soleil ?|Mercure|Vénus|Mars|La Terre
Quelle planète possède les anneaux les plus visibles ?|Saturne|Jupiter|Uranus|Neptune
Quelle est la planète la plus chaude du système solaire ?|Vénus|Mercure|Mars|Jupiter
Comment s'appelle notre étoile ?|Le Soleil|Sirius|L'étoile Polaire|Bételgeuse
Quel scientifique a formulé la loi de la gravitation universelle ?|Isaac Newton|Albert Einstein|Galilée|Kepler
Quelle est la célèbre équation d'Einstein ?|E = mc²|F = ma|E = hν|PV = nRT
Quel scientifique a développé le vaccin contre la rage ?|Louis Pasteur|Robert Koch|Edward Jenner|Alexander Fleming
Qui a proposé la théorie de l'évolution par sélection naturelle ?|Charles Darwin|Lamarck|Mendel|Pasteur
Quel moine est considéré comme le père de la génétique ?|Gregor Mendel|Charles Darwin|Louis Pasteur|Watson
Quelle molécule porte l'information génétique ?|L'ADN|L'ATP|Le glucose|L'hémoglobine
Quelle forme a la molécule d'ADN ?|Une double hélice|Un cercle|Un triangle|Une spirale simple
Combien de cavités (chambres) a le cœur humain ?|4|2|3|6
Quel est le groupe sanguin « donneur universel » ?|O négatif|AB positif|A positif|B négatif
Quel est le groupe sanguin « receveur universel » ?|AB positif|O négatif|A négatif|B positif
Quelle partie de l'œil donne sa couleur ?|L'iris|La pupille|La rétine|La cornée
Quel organe produit l'insuline ?|Le pancréas|Le foie|L'estomac|La rate
Quel est l'os le plus petit du corps humain ?|L'étrier (oreille)|La phalange|Le coccyx|Le marteau
Combien de litres de sang a environ un adulte ?|5 litres|2 litres|10 litres|8 litres
Quelle vitamine fabrique-t-on grâce au soleil ?|La vitamine D|La vitamine C|La vitamine A|La vitamine B12
Quelle vitamine trouve-t-on beaucoup dans les oranges ?|La vitamine C|La vitamine D|La vitamine K|La vitamine E
Quel est le pH de l'eau pure ?|7|0|14|5
Comment appelle-t-on un changement d'état de solide à gaz direct ?|La sublimation|La fusion|La condensation|La vaporisation
Comment appelle-t-on le passage de liquide à solide ?|La solidification|La fusion|La sublimation|L'évaporation
À quelle température l'eau gèle-t-elle (pression normale) ?|0 °C|-10 °C|4 °C|-4 °C
Quel est le zéro absolu en degrés Celsius (environ) ?|-273 °C|-100 °C|-459 °C|0 °C
Quelle unité mesure la résistance électrique ?|L'ohm|Le volt|L'ampère|Le watt
Quelle unité mesure l'intensité du courant ?|L'ampère|Le volt|L'ohm|Le joule
Quelle unité mesure la force ?|Le newton|Le joule|Le pascal|Le watt
Quelle unité mesure l'énergie ?|Le joule|Le newton|Le watt|Le hertz
Quelle unité mesure la fréquence ?|Le hertz|Le décibel|Le watt|Le volt
Quelle unité mesure l'intensité sonore ?|Le décibel|Le hertz|Le lux|Le pascal
Quelle est la vitesse du son dans l'air (environ) ?|340 m/s|1 000 m/s|100 m/s|3 000 m/s
Quel instrument mesure la pression atmosphérique ?|Le baromètre|Le thermomètre|L'hygromètre|L'anémomètre
Quel instrument mesure la vitesse du vent ?|L'anémomètre|Le baromètre|Le sismographe|Le pluviomètre
Quelle échelle mesure la magnitude des séismes ?|L'échelle de Richter|L'échelle de Beaufort|L'échelle de Mohs|L'échelle de Kelvin
Quelle échelle mesure la dureté des minéraux ?|L'échelle de Mohs|L'échelle de Richter|L'échelle de pH|L'échelle de Fujita
Quel est le minéral le plus dur ?|Le diamant|Le quartz|Le rubis|Le saphir
De quoi est composé un diamant ?|De carbone|De silicium|De quartz|De fer
Quelle est la couche de gaz qui nous protège des UV ?|La couche d'ozone|La troposphère|L'ionosphère|La magnétosphère
Quel phénomène explique les saisons sur Terre ?|L'inclinaison de l'axe de la Terre|La distance au Soleil|La rotation de la Lune|Les marées
Qu'est-ce qui provoque les marées ?|L'attraction de la Lune (et du Soleil)|Le vent|La rotation de la Terre uniquement|Les courants marins
Combien de temps met la Lune pour faire le tour de la Terre (environ) ?|27 jours|7 jours|365 jours|48 heures
Quel est le nom du premier homme à avoir marché sur la Lune ?|Neil Armstrong|Buzz Aldrin|Youri Gagarine|Michael Collins
Quelle agence spatiale est européenne ?|L'ESA|La NASA|Roscosmos|La JAXA
Quel télescope spatial lancé en 2021 succède à Hubble ?|James Webb|Kepler|Spitzer|Chandra
Comment s'appelle une étoile qui explose en fin de vie ?|Une supernova|Une naine blanche|Un pulsar|Une comète
Qu'est-ce qu'une année-lumière ?|Une distance|Une durée|Une vitesse|Une énergie
Quel organe est touché par la myopie ?|L'œil|L'oreille|Le cœur|Le foie
Quelle partie du cerveau gère l'équilibre ?|Le cervelet|Le cortex|L'hippocampe|Le tronc cérébral
Quel est le principal composant du sang qui transporte l'oxygène ?|Les globules rouges|Les globules blancs|Les plaquettes|Le plasma
Quel est le rôle des globules blancs ?|Défendre l'organisme|Transporter l'oxygène|Coaguler le sang|Digérer
Quel est le rôle des plaquettes ?|La coagulation du sang|L'immunité|Le transport de l'oxygène|La digestion
Combien de paires de côtes a l'être humain ?|12|10|14|24
Quel est le muscle le plus puissant (par sa taille) du corps ?|Le grand fessier|Le biceps|Le cœur|Le quadriceps
Quel est le nom scientifique de l'homme moderne ?|Homo sapiens|Homo erectus|Homo habilis|Homo neanderthalensis
Quel animal a été cloné en premier (mammifère) en 1996 ?|La brebis Dolly|Le chien Snuppy|La souris Mickey|Le chat CC
Quelle énergie est produite par le vent ?|L'énergie éolienne|L'énergie solaire|L'énergie hydraulique|L'énergie géothermique
Quelle énergie utilise la chaleur de la Terre ?|La géothermie|L'éolien|Le solaire|Le nucléaire
Quel combustible utilisent les centrales nucléaires françaises ?|L'uranium|Le charbon|Le pétrole|Le plutonium uniquement
Qui a inventé le téléphone (brevet de 1876) ?|Graham Bell|Thomas Edison|Nikola Tesla|Marconi
Qui a inventé la radio (TSF) selon la tradition ?|Guglielmo Marconi|Graham Bell|Thomas Edison|Tesla
Quels frères ont inventé le cinématographe ?|Les frères Lumière|Les frères Wright|Les frères Montgolfier|Les frères Pathé
Quels frères ont réalisé le premier vol motorisé en 1903 ?|Les frères Wright|Les frères Lumière|Les frères Montgolfier|Les frères Michelin
Quels frères ont inventé la montgolfière ?|Les frères Montgolfier|Les frères Wright|Les frères Lumière|Les frères Renault
Combien de bits dans un octet ?|8|4|16|10
Que signifie l'abréviation « Wi-Fi » dans la vie courante ?|Connexion sans fil|Une marque de téléphone|Un câble réseau|Un virus
Quel nombre est représenté par π (pi) à deux décimales ?|3,14|3,41|2,71|1,61
Combien vaut la racine carrée de 81 ?|9|8|7|81
Combien de degrés dans un angle droit ?|90|180|45|360
Combien de degrés au total dans un triangle ?|180|360|90|270
Comment s'appelle un triangle à trois côtés égaux ?|Équilatéral|Isocèle|Rectangle|Scalène
Quel est le nombre premier pair ?|2|0|4|1
` },
  jv: { name: "Jeux vidéo", emoji: '🎮', cat: 'gen', q: `
Quel est le métier de Mario ?|Plombier|Charpentier|Électricien|Cuisinier
Quelle princesse Link doit-il souvent sauver ?|Zelda|Peach|Daisy|Rosalina
Dans Minecraft, quel monstre vert explose ?|Le Creeper|Le Zombie|L'Enderman|Le Slime
Quel hérisson bleu est la mascotte de Sega ?|Sonic|Knuckles|Tails|Shadow
Quel jeu a popularisé le « Battle Royale » avec une danse « Floss » ?|Fortnite|PUBG|Apex Legends|Warzone
Quelle console a été lancée par Nintendo en 2017 ?|La Switch|La Wii U|La DS|La GameCube
Dans Pac-Man, que mange Pac-Man pour chasser les fantômes ?|Des super-pastilles|Des cerises|Des étoiles|Des champignons
Quel est le frère de Mario ?|Luigi|Wario|Toad|Yoshi
Dans quel jeu incarne-t-on Kratos ?|God of War|Devil May Cry|Dark Souls|Bayonetta
Quel jeu de Rockstar se déroule à Los Santos ?|GTA V|Red Dead Redemption|Bully|Max Payne
Combien de Pokémon dans la toute première génération ?|151|150|251|100
Quel jeu a des blocs qui tombent et qu'on aligne ?|Tetris|Candy Crush|Puyo Puyo|Columns
Quelle entreprise fabrique la PlayStation ?|Sony|Microsoft|Nintendo|Sega
Dans « Among Us », comment s'appelle le traître ?|L'imposteur|Le saboteur|Le loup|Le traître
Quel est l'ennemi principal de Mario ?|Bowser|Ganon|Dr Eggman|King K. Rool
Dans League of Legends, combien de joueurs par équipe ?|5|4|6|3
Quel jeu de foot d'EA s'appelle désormais « EA Sports FC » ?|FIFA|PES|Football Manager|Rocket League
Dans « The Last of Us », comment s'appelle la jeune fille ?|Ellie|Clementine|Abby|Dina
Quel personnage est un dinosaure vert qui accompagne Mario ?|Yoshi|Rex|Dino|Koopa
Quel jeu français met en scène un héros sans bras ni jambes ?|Rayman|Beyond Good & Evil|Prince of Persia|Dofus
Dans « Animal Crossing », qui est le raton laveur commerçant ?|Tom Nook|Marie|Kéké|Thibou
Quel est le nom de la princesse que Mario sauve souvent ?|Peach|Daisy|Zelda|Rosalina
Dans Mario Kart, quel objet bleu vise le premier de la course ?|La carapace bleue|La banane|L'étoile|Le champignon
Quel est le nom du royaume de Mario ?|Le Royaume Champignon|Hyrule|Dreamland|Mushroom City
Comment s'appelle le royaume de Zelda ?|Hyrule|Termina|Kanto|Dreamland
Comment s'appelle le méchant principal de la saga Zelda ?|Ganon (Ganondorf)|Bowser|Vaati|Majora
Quel est le nom de la boule rose qui aspire ses ennemis chez Nintendo ?|Kirby|Jigglypuff|Yoshi|Toad
Quel gorille porte une cravate rouge chez Nintendo ?|Donkey Kong|Diddy Kong|Funky Kong|Cranky Kong
Quelle chasseuse de primes en armure est l'héroïne de Metroid ?|Samus Aran|Lara Croft|Bayonetta|Jill Valentine
Quelle aventurière pille des tombeaux dans une célèbre saga ?|Lara Croft|Samus Aran|Aloy|Chun-Li
Quel jeu de combat met en scène Ryu, Ken et Chun-Li ?|Street Fighter|Tekken|Mortal Kombat|King of Fighters
Quel jeu de combat est connu pour ses « Fatality » ?|Mortal Kombat|Street Fighter|Tekken|Soulcalibur
Quel jeu de combat de Nintendo réunit Mario, Link, Pikachu… ?|Super Smash Bros.|Mario Party|Mario Kart|Nintendo Land
Dans Pokémon Rouge et Bleu, quel professeur donne le premier Pokémon ?|Le professeur Chen|Le professeur Orme|Le professeur Seko|Le professeur Sorbier
Dans Pokémon, quel est le type de Salamèche ?|Feu|Plante|Eau|Électrik
Dans Pokémon, quel Pokémon légendaire psy a été créé par l'homme ?|Mewtwo|Mew|Lugia|Arceus
Dans Minecraft, quel matériau est le plus résistant pour les outils (avant la Netherite) ?|Le diamant|Le fer|L'or|La pierre
Dans Minecraft, quelle dimension contient l'Ender Dragon ?|L'End|Le Nether|L'Overworld|Le Aether
Quel minerai rouge sert à faire des circuits dans Minecraft ?|La redstone|Le lapis-lazuli|L'émeraude|Le quartz
Quel studio a créé Minecraft ?|Mojang|Ubisoft|Epic Games|Valve
Quel studio a créé Fortnite ?|Epic Games|Riot Games|Activision|Blizzard
Quel studio a créé League of Legends ?|Riot Games|Blizzard|Valve|Epic Games
Quel studio a créé World of Warcraft ?|Blizzard|Riot Games|BioWare|Bethesda
Quel studio français a créé Assassin's Creed ?|Ubisoft|Quantic Dream|Arkane|Dontnod
Quel studio a créé GTA ?|Rockstar Games|Ubisoft|EA|Naughty Dog
Quel studio a créé The Last of Us ?|Naughty Dog|Insomniac|Santa Monica Studio|Guerrilla
Quel studio a créé The Witcher 3 ?|CD Projekt Red|Bethesda|BioWare|FromSoftware
Quel studio a créé Elden Ring ?|FromSoftware|Capcom|Square Enix|Bandai Namco
Comment s'appelle le héros de The Witcher ?|Geralt de Riv|Ciri|Yennefer|Jaskier
Dans quel pays se déroule principalement Assassin's Creed II ?|L'Italie|La France|L'Égypte|L'Angleterre
Comment s'appelle le héros d'Assassin's Creed II ?|Ezio Auditore|Altaïr|Connor|Bayek
Dans Fortnite, comment s'appelle le véhicule volant d'où l'on saute au début ?|Le bus de combat|L'avion de guerre|Le zeppelin|Le dirigeable
Quel jeu de Riot Games est un FPS tactique 5 contre 5 ?|Valorant|Overwatch|Apex Legends|Rainbow Six
Quel jeu de Valve oppose terroristes et antiterroristes ?|Counter-Strike|Half-Life|Team Fortress|Left 4 Dead
Quel personnage scientifique muni d'un pied-de-biche est le héros de Half-Life ?|Gordon Freeman|Alyx Vance|Barney|G-Man
Dans Portal, quel est le nom de l'intelligence artificielle ?|GLaDOS|HAL 9000|Cortana|SHODAN
Comment s'appelle l'IA qui accompagne le Master Chief dans Halo ?|Cortana|GLaDOS|EDI|Siri
Sur quelle console est sorti Halo en premier ?|Xbox|PlayStation 2|GameCube|PC uniquement
Quelle entreprise fabrique la Xbox ?|Microsoft|Sony|Nintendo|Sega
Quelle console portable Nintendo avait deux écrans ?|La Nintendo DS|La Game Boy|La PSP|La Switch
Comment s'appelle la console de Sega qui a affronté la Super Nintendo ?|La Mega Drive|La Dreamcast|La Saturn|La Master System
Quel jeu de simulation de vie est développé par Maxis ?|Les Sims|Animal Crossing|SimCity uniquement|Stardew Valley
Quel jeu indépendant met en scène une ferme dans la vallée Pélican ?|Stardew Valley|Harvest Moon|Animal Crossing|Terraria
Quel jeu oppose des plantes à des zombies ?|Plants vs. Zombies|Zombie Farm|Garden Warfare uniquement|Dead Rising
Quel jeu mobile fait tirer des oiseaux sur des cochons ?|Angry Birds|Flappy Bird|Cut the Rope|Fruit Ninja
Quel jeu mobile fait couper des fruits avec le doigt ?|Fruit Ninja|Candy Crush|Subway Surfers|Temple Run
Dans quel jeu court-on sur les rails pour fuir un garde et son chien ?|Subway Surfers|Temple Run|Jetpack Joyride|Crossy Road
Quel jeu de Nintendo propose de peindre l'arène avec de l'encre ?|Splatoon|Paper Mario|Kirby|Pikmin
Dans Among Us, combien d'imposteurs au maximum dans une partie ?|3|1|2|5
Quel jeu de Rockstar suit le cowboy Arthur Morgan ?|Red Dead Redemption 2|GTA V|L.A. Noire|Bully
Combien de personnages jouables principaux dans GTA V ?|3|1|2|4
Quel jeu culte de 1980 met en scène des fantômes nommés Blinky, Pinky, Inky et Clyde ?|Pac-Man|Space Invaders|Galaga|Donkey Kong
Quel jeu d'arcade de 1978 fait tirer sur des envahisseurs extraterrestres ?|Space Invaders|Asteroids|Galaga|Defender
Quel est le jeu vidéo le plus vendu de tous les temps ?|Minecraft|GTA V|Tetris|Wii Sports
Dans quel jeu incarne-t-on Kratos, le dieu de la guerre ?|God of War|Devil May Cry|Bayonetta|Darksiders
Quel jeu de survie oppose 100 joueurs sur une île qui rétrécit ?|Fortnite (Battle Royale)|Minecraft|Rust|Ark
Quel est le nom du hérisson rival noir de Sonic ?|Shadow|Knuckles|Silver|Metal Sonic
Comment s'appelle le renard à deux queues ami de Sonic ?|Tails|Knuckles|Amy|Cream
Quel est le nom du scientifique ennemi de Sonic ?|Dr Eggman (Robotnik)|Dr Wily|Dr Neo Cortex|Bowser
Quel marsupial orange est la mascotte de Crash Bandicoot ?|Un bandicoot|Un renard|Un kangourou|Un wombat
Quel dragon violet est un héros de PlayStation ?|Spyro|Puff|Toothless|Elliot
Dans quel jeu fait-on du « Fus Ro Dah » ?|Skyrim|Oblivion|The Witcher|Dark Souls
Quel jeu de foot arcade se joue avec des voitures ?|Rocket League|FIFA Street|Car Soccer|Mario Strikers
Quel jeu d'horreur se déroule dans un restaurant de pizzas avec des animatroniques ?|Five Nights at Freddy's|Resident Evil|Outlast|Poppy Playtime
Quelle saga d'horreur se déroule souvent à Raccoon City ?|Resident Evil|Silent Hill|Dead Space|The Evil Within
Quel jeu de cartes à collectionner est basé sur l'univers de Warcraft ?|Hearthstone|Gwent|Magic Arena|Legends of Runeterra
Quel jeu en ligne de Riot oppose deux équipes de 5 « champions » ?|League of Legends|Dota 2|Smite|Valorant
Quel jeu de cartes de la saga The Witcher 3 est devenu culte ?|Le Gwynt|Le Hearthstone|Le Triple Triad|Le Pazaak
Quel jeu de Nintendo met en scène un village d'animaux et Tom Nook ?|Animal Crossing|Harvest Moon|Pikmin|Yoshi's Island
Quelle console de Sony est sortie en 2020 ?|La PlayStation 5|La PlayStation 4|La PS Vita|La PS4 Pro
Quelle console de Nintendo est sortie en 2006 avec une manette à détection de mouvement ?|La Wii|La Switch|La GameCube|La Wii U
Quel jeu de danse demande de reproduire des chorégraphies ?|Just Dance|Guitar Hero|Rock Band|SingStar
Quel jeu de musique se jouait avec une guitare en plastique ?|Guitar Hero|Just Dance|Osu!|Beat Saber
Quel jeu VR fait trancher des cubes au rythme de la musique ?|Beat Saber|Superhot|Half-Life Alyx|Pistol Whip
Dans Call of Duty, quel mode de jeu populaire est en Battle Royale ?|Warzone|Zombies|Modern Warfare|Black Ops
Quel personnage de Nintendo est un plombier vert froussard ?|Luigi|Wario|Waluigi|Toad
Quel est l'ennemi jaune et violet de Mario, version maléfique ?|Wario|Waluigi|Bowser Jr.|Kamek
Quel est le jeu de courses de Nintendo ?|Mario Kart|F-Zero uniquement|Need for Speed|Gran Turismo
Quelle saga de courses est exclusive à PlayStation ?|Gran Turismo|Forza|Mario Kart|Need for Speed
` },
  nature: { name: "Animaux & nature", emoji: '🦁', cat: 'gen', q: `
Quel est le plus grand animal du monde ?|La baleine bleue|L'éléphant|Le requin-baleine|La girafe
Combien de pattes a une araignée ?|8|6|10|12
Quel animal est le roi de la savane ?|Le lion|Le tigre|L'éléphant|Le guépard
Quel oiseau ne vole pas mais court très vite ?|L'autruche|Le pingouin|Le paon|Le flamant
Quel mammifère est capable de voler ?|La chauve-souris|L'écureuil volant|Le colugo|Le lémurien
Comment s'appelle le petit de la vache ?|Le veau|Le poulain|L'agneau|Le cabri
Quel animal change de couleur pour se camoufler ?|Le caméléon|Le lézard|L'iguane|Le gecko
De quoi se nourrit principalement le panda géant ?|De bambou|De poisson|De fruits|D'insectes
Combien de cœurs a une pieuvre ?|3|1|2|8
Quel animal produit le miel ?|L'abeille|La guêpe|Le bourdon|Le frelon
Quel est l'arbre qui perd ses aiguilles l'hiver (conifère) ?|Le mélèze|Le sapin|L'épicéa|Le pin
Quel animal a la plus longue gestation (environ 22 mois) ?|L'éléphant|La baleine|La girafe|Le rhinocéros
Quel est le plus grand félin ?|Le tigre|Le lion|Le jaguar|Le léopard
Comment appelle-t-on un groupe de loups ?|Une meute|Un troupeau|Une horde|Un banc
Quel animal dort la tête en bas ?|La chauve-souris|Le paresseux|Le koala|Le hibou
Quelle fleur est le symbole de l'amour ?|La rose|La tulipe|Le lys|La marguerite
Quel animal marin a huit bras ?|La pieuvre|Le calmar|La méduse|L'étoile de mer
Quel est le seul mammifère qui pond des œufs (avec l'échidné) ?|L'ornithorynque|Le kangourou|Le koala|Le tatou
Combien de bosses a un dromadaire ?|1|2|0|3
Quel animal est connu pour sa lenteur et vit dans les arbres ?|Le paresseux|Le koala|La tortue|Le lémurien
Quelle est la couleur du sang d'une pieuvre ?|Bleu|Rouge|Vert|Transparent
Comment s'appelle le petit du cheval ?|Le poulain|Le veau|Le chevreau|Le faon
Comment s'appelle le petit du cerf ?|Le faon|Le marcassin|Le poulain|Le levraut
Comment s'appelle le petit du sanglier ?|Le marcassin|Le porcelet|Le faon|Le louveteau
Comment s'appelle le petit de la chèvre ?|Le chevreau|L'agneau|Le louveteau|Le veau
Comment s'appelle le petit du lièvre ?|Le levraut|Le lapereau|Le faon|Le marcassin
Comment s'appelle le petit de l'ours ?|L'ourson|Le louveteau|Le lionceau|Le renardeau
Comment s'appelle la femelle du cerf ?|La biche|La chèvre|La laie|La hase
Comment s'appelle la femelle du sanglier ?|La laie|La truie|La biche|La hase
Comment s'appelle la femelle du lièvre ?|La hase|La lapine|La biche|La laie
Quel est le cri du loup ?|Il hurle|Il rugit|Il brame|Il glapit
Quel est le cri du cerf ?|Il brame|Il hennit|Il barrit|Il rugit
Quel est le cri de la grenouille ?|Elle coasse|Elle croasse|Elle siffle|Elle glousse
Quel est le cri du corbeau ?|Il croasse|Il coasse|Il hulule|Il roucoule
Quel oiseau hulule la nuit ?|La chouette|Le corbeau|Le pigeon|Le merle
Quel est l'oiseau le plus rapide en piqué ?|Le faucon pèlerin|L'aigle royal|Le martinet|L'hirondelle
Quel est le plus grand oiseau du monde ?|L'autruche|L'émeu|Le condor|L'albatros
Quel oiseau a la plus grande envergure ?|L'albatros hurleur|Le condor des Andes|L'aigle royal|Le pélican
Quel est le plus petit oiseau du monde ?|Le colibri d'Elena|Le roitelet|La mésange|Le moineau
Quel oiseau peut voler en arrière ?|Le colibri|L'hirondelle|Le martin-pêcheur|Le moineau
Quel animal est le symbole de l'Australie (avec l'émeu) ?|Le kangourou|Le koala|L'ornithorynque|Le wombat
De quoi se nourrit le koala ?|De feuilles d'eucalyptus|De bambou|D'insectes|De fruits
Combien d'estomacs a la vache (compartiments) ?|4|2|1|3
Quel animal rumine ?|La vache|Le cheval|Le cochon|Le chien
Quel est le plus grand mammifère terrestre ?|L'éléphant d'Afrique|L'hippopotame|La girafe|Le rhinocéros
Quel est l'animal terrestre le plus grand (en hauteur) ?|La girafe|L'éléphant|L'autruche|Le chameau
Quel mammifère a la plus longue durée de vie ?|La baleine boréale|L'éléphant|L'homme|La tortue
Quel reptile peut vivre plus de 150 ans ?|La tortue géante|Le crocodile|L'iguane|Le python
Combien de pattes a un crabe (pinces comprises) ?|10|8|6|12
Combien de bras a une étoile de mer (le plus souvent) ?|5|4|6|8
Quel poisson remonte les rivières pour pondre ?|Le saumon|Le thon|La sardine|La morue
Quel requin est le plus grand poisson du monde ?|Le requin-baleine|Le grand requin blanc|Le requin-tigre|Le requin-marteau
Quel mammifère marin est surnommé « la vache de mer » ?|Le lamantin|Le phoque|Le dauphin|Le morse
Quel animal a des défenses et vit sur la banquise ?|Le morse|Le phoque|L'otarie|Le narval
Quel cétacé possède une longue dent en forme de corne ?|Le narval|Le béluga|L'orque|Le cachalot
Comment s'appelle aussi l'orque ?|L'épaulard|Le cachalot|Le marsouin|Le globicéphale
Quel est le seul mammifère capable de voler activement ?|La chauve-souris|L'écureuil volant|Le colugo|Le phalanger
Comment les chauves-souris se repèrent-elles dans le noir ?|Par écholocation|Par l'odorat|Avec leurs yeux|Grâce aux étoiles
Quel insecte produit de la soie ?|Le ver à soie (bombyx)|L'araignée|La chenille processionnaire|La fourmi
Combien d'ailes a une abeille ?|4|2|6|8
Comment s'appelle la reine d'une ruche ?|La reine|L'ouvrière|Le faux-bourdon|La princesse
Comment s'appelle le mâle de l'abeille ?|Le faux-bourdon|Le bourdon|Le frelon|Le guêpier
Quel insecte se transforme en papillon ?|La chenille|La larve de mouche|Le ver de terre|La nymphe de libellule
Comment s'appelle l'enveloppe de la chenille avant de devenir papillon ?|La chrysalide|Le cocon de soie uniquement|La mue|L'œuf
Quel animal porte sa maison sur son dos ?|L'escargot|La tortue de mer|Le hérisson|Le tatou
Quel animal se roule en boule et a des piquants ?|Le hérisson|Le porc-épic|Le tatou|La musaraigne
Quel animal construit des barrages ?|Le castor|La loutre|Le rat musqué|Le ragondin
Quel animal hiberne tout l'hiver dans une tanière ?|L'ours brun|Le loup|Le renard|Le cerf
Quel animal est connu pour sa mémoire légendaire ?|L'éléphant|Le dauphin|Le chien|Le perroquet
Quel animal dort debout ?|Le cheval|Le chien|Le chat|Le lapin
Quel félin est le plus rapide ?|Le guépard|Le lion|Le léopard|Le lynx
Quel félin a des taches en forme de rosettes et vit en Amérique ?|Le jaguar|Le léopard|Le guépard|L'ocelot
Quel singe est le plus grand ?|Le gorille|L'orang-outan|Le chimpanzé|Le babouin
Quel singe est notre plus proche parent génétique ?|Le chimpanzé (et le bonobo)|Le gorille|L'orang-outan|Le gibbon
Quel animal est le symbole du WWF ?|Le panda géant|Le tigre|L'éléphant|L'ours polaire
Où vit l'ours polaire ?|En Arctique|En Antarctique|Au Canada uniquement|En Sibérie uniquement
Où vivent les manchots empereurs ?|En Antarctique|En Arctique|En Islande|Au Groenland
De quelle couleur est la peau de l'ours polaire ?|Noire|Blanche|Rose|Grise
Quel arbre produit des glands ?|Le chêne|Le hêtre|Le châtaignier|Le noisetier
Quel arbre produit des marrons (non comestibles) ?|Le marronnier|Le châtaignier|Le chêne|Le noyer
Quel arbre est le symbole du Liban ?|Le cèdre|Le palmier|L'olivier|Le pin
Quel est le plus grand arbre du monde (en hauteur) ?|Le séquoia à feuilles d'if|Le baobab|L'eucalyptus|Le chêne
Quel arbre africain a un tronc énorme qui stocke l'eau ?|Le baobab|L'acacia|Le palmier|Le kapokier
Quelle fleur jaune tourne vers le soleil ?|Le tournesol|La jonquille|Le pissenlit|La rose
Quelle fleur est le symbole du 1er mai en France ?|Le muguet|La rose|Le coquelicot|La tulipe
Quelle fleur porte-t-on en souvenir des soldats (au Royaume-Uni) ?|Le coquelicot|Le bleuet|La rose|L'œillet
Quelle plante carnivore referme ses feuilles sur les insectes ?|La dionée (attrape-mouche)|Le cactus|L'aloe vera|La fougère
De quelle plante tire-t-on le chocolat ?|Le cacaoyer|Le caféier|Le vanillier|Le palmier
De quelle plante vient la vanille ?|Une orchidée|Un palmier|Un arbuste à baies|Une fougère
Quelle est la partie de la plante qui absorbe l'eau du sol ?|Les racines|Les feuilles|La tige|Les fleurs
Quel pigment rend les plantes vertes ?|La chlorophylle|La mélanine|Le carotène|L'hémoglobine
Comment s'appelle un animal qui mange de tout ?|Omnivore|Herbivore|Carnivore|Insectivore
Comment s'appelle un animal qui ne mange que des plantes ?|Herbivore|Omnivore|Carnivore|Frugivore
Comment s'appelle un animal actif la nuit ?|Nocturne|Diurne|Crépusculaire|Hibernant
Quel animal est connu pour pondre ses œufs dans le nid d'autres oiseaux ?|Le coucou|La pie|Le corbeau|Le merle
Quel oiseau est attiré par ce qui brille selon la légende ?|La pie|Le corbeau|Le geai|Le pigeon
Quel amphibien peut faire repousser ses membres ?|L'axolotl|La grenouille|Le crapaud|La salamandre tachetée uniquement
Quel animal a le cou le plus long ?|La girafe|L'autruche|Le flamant rose|Le cygne
Pourquoi les flamants roses sont-ils roses ?|À cause de leur alimentation|C'est génétique|À cause du soleil|Ils se roulent dans la boue
` },
};
const RARE = [
 [
  "Cite un pays d'Europe",
  [
   "France",
   "Allemagne",
   "Italie",
   "Espagne",
   "Portugal",
   "Belgique",
   "Pays-Bas|Hollande",
   "Luxembourg",
   "Suisse",
   "Autriche",
   "Pologne",
   "Tchéquie|Republique tcheque",
   "Slovaquie",
   "Hongrie",
   "Roumanie",
   "Bulgarie",
   "Grèce",
   "Croatie",
   "Slovénie",
   "Serbie",
   "Bosnie|Bosnie-Herzegovine",
   "Monténégro",
   "Albanie",
   "Macédoine|Macedoine du Nord",
   "Kosovo",
   "Moldavie",
   "Ukraine",
   "Biélorussie",
   "Russie",
   "Lituanie",
   "Lettonie",
   "Estonie",
   "Finlande",
   "Suède",
   "Norvège",
   "Danemark",
   "Islande",
   "Irlande",
   "Royaume-Uni|Angleterre|Ecosse|Pays de Galles",
   "Malte",
   "Chypre",
   "Andorre",
   "Monaco",
   "Liechtenstein",
   "Saint-Marin",
   "Vatican"
  ]
 ],
 [
  "Cite un pays d'Afrique",
  [
   "Maroc",
   "Algérie",
   "Tunisie",
   "Libye",
   "Égypte",
   "Soudan",
   "Soudan du Sud",
   "Éthiopie",
   "Érythrée",
   "Djibouti",
   "Somalie",
   "Kenya",
   "Ouganda",
   "Tanzanie",
   "Rwanda",
   "Burundi",
   "RDC|Congo|Republique democratique du Congo",
   "Gabon",
   "Cameroun",
   "Nigeria",
   "Niger",
   "Tchad",
   "Mali",
   "Mauritanie",
   "Sénégal",
   "Gambie",
   "Guinée",
   "Guinée-Bissau",
   "Sierra Leone",
   "Liberia",
   "Côte d'Ivoire",
   "Ghana",
   "Togo",
   "Bénin",
   "Burkina Faso",
   "Centrafrique",
   "Guinée équatoriale",
   "Angola",
   "Zambie",
   "Zimbabwe",
   "Mozambique",
   "Malawi",
   "Namibie",
   "Botswana",
   "Afrique du Sud",
   "Lesotho",
   "Eswatini|Swaziland",
   "Madagascar",
   "Maurice",
   "Seychelles",
   "Comores",
   "Cap-Vert",
   "Sao Tomé-et-Principe"
  ]
 ],
 [
  "Cite un animal qui commence par la lettre C",
  [
   "Chat",
   "Chien",
   "Cheval",
   "Cochon",
   "Chèvre",
   "Canard",
   "Crocodile",
   "Chameau",
   "Castor",
   "Cerf",
   "Chimpanzé",
   "Coccinelle",
   "Corbeau",
   "Coq",
   "Cygne",
   "Crabe",
   "Crevette",
   "Calamar",
   "Caméléon",
   "Chouette",
   "Colibri",
   "Cobra",
   "Cafard",
   "Criquet",
   "Cigale",
   "Chenille",
   "Cachalot",
   "Chinchilla",
   "Coyote",
   "Condor",
   "Cormoran",
   "Carpe",
   "Cabillaud",
   "Chevreuil",
   "Caribou",
   "Capybara",
   "Caniche",
   "Canari",
   "Cigogne",
   "Concombre de mer",
   "Crapaud",
   "Chacal",
   "Chauve-souris",
   "Cheval de mer|Hippocampe",
   "Cochon d'Inde",
   "Corneille",
   "Coucou",
   "Cerf-volant",
   "Couleuvre"
  ]
 ],
 [
  "Cite un fruit",
  [
   "Pomme",
   "Poire",
   "Banane",
   "Orange",
   "Fraise",
   "Framboise",
   "Cerise",
   "Pêche",
   "Abricot",
   "Prune",
   "Raisin",
   "Kiwi",
   "Mangue",
   "Ananas",
   "Melon",
   "Pastèque",
   "Citron",
   "Clémentine|Mandarine",
   "Pamplemousse",
   "Myrtille",
   "Mûre",
   "Cassis",
   "Groseille",
   "Figue",
   "Datte",
   "Litchi",
   "Grenade",
   "Papaye",
   "Fruit de la passion|Maracuja",
   "Noix de coco|Coco",
   "Goyave",
   "Kaki",
   "Nectarine",
   "Mirabelle",
   "Coing",
   "Avocat",
   "Tomate",
   "Citron vert",
   "Kumquat",
   "Physalis",
   "Pitaya|Fruit du dragon",
   "Carambole",
   "Rhubarbe",
   "Airelle|Cranberry",
   "Ramboutan",
   "Durian",
   "Jacquier"
  ]
 ],
 [
  "Cite un joueur de l'équipe de France de foot (depuis 1998)",
  [
   "Zidane",
   "Henry",
   "Thuram",
   "Deschamps",
   "Barthez",
   "Desailly",
   "Lizarazu",
   "Petit",
   "Pires",
   "Trezeguet",
   "Djorkaeff",
   "Vieira",
   "Makelele",
   "Ribéry",
   "Benzema",
   "Griezmann",
   "Mbappé",
   "Pogba",
   "Kanté",
   "Lloris",
   "Varane",
   "Giroud",
   "Umtiti",
   "Pavard",
   "Hernandez",
   "Matuidi",
   "Dembélé",
   "Kimpembe",
   "Mandanda",
   "Koscielny",
   "Evra",
   "Sagna",
   "Abidal",
   "Gallas",
   "Malouda",
   "Nasri",
   "Cabaye",
   "Sissoko",
   "Payet",
   "Rabiot",
   "Tchouaméni",
   "Camavinga",
   "Upamecano",
   "Konaté",
   "Saliba",
   "Maignan",
   "Thuram (Marcus)|Marcus Thuram",
   "Kolo Muani",
   "Coman",
   "Theo Hernandez",
   "Koundé",
   "Wiltord",
   "Leboeuf",
   "Blanc",
   "Karembeu",
   "Sylvestre",
   "Sagnol",
   "Gourcuff",
   "Cissé",
   "Anelka",
   "Trezeguet",
   "Valbuena",
   "Martial",
   "Lacazette",
   "Tolisso",
   "Nkunku",
   "Olise",
   "Barcola",
   "Zaïre-Emery",
   "Fofana",
   "Clauss",
   "Mendy",
   "Digne",
   "Lemar",
   "Rami"
  ]
 ],
 [
  "Cite un personnage de Dragon Ball",
  [
   "Goku|Son Goku|Sangoku",
   "Vegeta",
   "Gohan|Sangohan",
   "Goten|Sangoten",
   "Trunks",
   "Piccolo",
   "Krilin",
   "Bulma",
   "Chichi",
   "Tortue Géniale|Kame Sennin",
   "Yamcha",
   "Tenshinhan|Ten Shin Han",
   "Chaozu",
   "Freezer",
   "Cell",
   "Boo|Majin Boo",
   "Broly",
   "Raditz",
   "Nappa",
   "Beerus",
   "Whis",
   "Hit",
   "Jiren",
   "Zamasu",
   "Black Goku|Goku Black",
   "C-17|C17",
   "C-18|C18",
   "C-16|C16",
   "Mr Satan|Hercule",
   "Videl",
   "Pan",
   "Oolong",
   "Plume|Puar",
   "Shenron",
   "Dende",
   "Kaioh|Maitre Kaio",
   "Babidi",
   "Dabura",
   "Zarbon",
   "Dodoria",
   "Ginyu",
   "Recoome",
   "Baddack|Bardock",
   "Cooler",
   "Janemba",
   "Gogeta",
   "Vegito|Vegeto",
   "Gotenks",
   "Ruban Rouge",
   "Arale",
   "Kami-sama|Kami",
   "Yajirobe",
   "Karin",
   "Mr Popo",
   "Lunch"
  ]
 ],
 [
  "Cite une marque de voiture",
  [
   "Peugeot",
   "Renault",
   "Citroën",
   "Dacia",
   "Alpine",
   "Bugatti",
   "DS",
   "Volkswagen",
   "Audi",
   "BMW",
   "Mercedes",
   "Porsche",
   "Opel",
   "Fiat",
   "Ferrari",
   "Lamborghini",
   "Maserati",
   "Alfa Romeo",
   "Lancia",
   "Toyota",
   "Honda",
   "Nissan",
   "Mazda",
   "Suzuki",
   "Mitsubishi",
   "Subaru",
   "Lexus",
   "Hyundai",
   "Kia",
   "Ford",
   "Chevrolet",
   "Tesla",
   "Jeep",
   "Dodge",
   "Cadillac",
   "Chrysler",
   "Volvo",
   "Saab",
   "Skoda",
   "Seat",
   "Cupra",
   "Mini",
   "Jaguar",
   "Land Rover",
   "Bentley",
   "Rolls-Royce",
   "Aston Martin",
   "McLaren",
   "Lotus",
   "BYD",
   "MG",
   "Smart",
   "Polestar",
   "Lada"
  ]
 ],
 [
  "Cite un sport olympique",
  [
   "Athlétisme",
   "Natation",
   "Football",
   "Basket",
   "Handball",
   "Volley",
   "Rugby",
   "Tennis",
   "Tennis de table|Ping-pong",
   "Badminton",
   "Judo",
   "Boxe",
   "Escrime",
   "Lutte",
   "Taekwondo",
   "Haltérophilie",
   "Gymnastique",
   "Trampoline",
   "Cyclisme|Vélo|BMX",
   "Équitation",
   "Aviron",
   "Canoë|Kayak",
   "Voile",
   "Surf",
   "Skateboard",
   "Escalade",
   "Tir",
   "Tir à l'arc",
   "Golf",
   "Hockey",
   "Triathlon",
   "Pentathlon",
   "Plongeon",
   "Water-polo",
   "Natation artistique",
   "Breakdance|Breaking",
   "Ski",
   "Snowboard",
   "Biathlon",
   "Patinage",
   "Hockey sur glace",
   "Curling",
   "Bobsleigh",
   "Luge",
   "Skeleton",
   "Saut à ski"
  ]
 ],
 [
  "Cite un super-héros",
  [
   "Spider-Man",
   "Batman",
   "Superman",
   "Iron Man",
   "Captain America",
   "Thor",
   "Hulk",
   "Wonder Woman",
   "Black Panther",
   "Black Widow",
   "Flash",
   "Aquaman",
   "Green Lantern",
   "Wolverine",
   "Deadpool",
   "Doctor Strange",
   "Ant-Man",
   "Hawkeye",
   "Captain Marvel",
   "Daredevil",
   "Cyclope",
   "Tornade",
   "Malicia",
   "Gambit",
   "Professeur X",
   "Shazam",
   "Cyborg",
   "Robin",
   "Batgirl",
   "Supergirl",
   "Vision",
   "Scarlet Witch|Sorciere rouge",
   "Falcon",
   "Star-Lord",
   "Groot",
   "Rocket",
   "Silver Surfer|Surfer d'argent",
   "Moon Knight",
   "Ms. Marvel",
   "She-Hulk",
   "Shang-Chi",
   "Venom",
   "Punisher",
   "La Chose",
   "Torche humaine",
   "Mister Fantastic",
   "Femme invisible",
   "Hellboy",
   "Invincible",
   "All Might"
  ]
 ],
 [
  "Cite une ville de France de plus de 100 000 habitants",
  [
   "Paris",
   "Marseille",
   "Lyon",
   "Toulouse",
   "Nice",
   "Nantes",
   "Montpellier",
   "Strasbourg",
   "Bordeaux",
   "Lille",
   "Rennes",
   "Toulon",
   "Reims",
   "Saint-Étienne",
   "Le Havre",
   "Villeurbanne",
   "Dijon",
   "Grenoble",
   "Angers",
   "Nîmes",
   "Aix-en-Provence",
   "Clermont-Ferrand",
   "Brest",
   "Le Mans",
   "Amiens",
   "Tours",
   "Limoges",
   "Annecy",
   "Perpignan",
   "Boulogne-Billancourt",
   "Metz",
   "Besançon",
   "Orléans",
   "Saint-Denis",
   "Rouen",
   "Argenteuil",
   "Mulhouse",
   "Montreuil",
   "Caen",
   "Nancy",
   "Saint-Paul",
   "Tourcoing",
   "Roubaix",
   "Nanterre",
   "Vitry-sur-Seine",
   "Avignon",
   "Créteil",
   "Poitiers",
   "Dunkerque",
   "Aubervilliers",
   "Versailles",
   "Courbevoie",
   "Colombes",
   "Pau",
   "Asnières-sur-Seine",
   "Aulnay-sous-Bois",
   "Rueil-Malmaison",
   "Saint-Pierre",
   "Fort-de-France",
   "Cayenne"
  ]
 ],
 [
  "Cite un ingrédient d'une pizza",
  [
   "Tomate|Sauce tomate",
   "Mozzarella",
   "Fromage",
   "Jambon",
   "Champignons",
   "Olives",
   "Chorizo",
   "Pepperoni",
   "Poivron",
   "Oignon",
   "Ananas",
   "Thon",
   "Anchois",
   "Basilic",
   "Origan",
   "Crème fraîche|Crème",
   "Lardons",
   "Œuf",
   "Chèvre",
   "Gorgonzola",
   "Parmesan",
   "Emmental",
   "Reblochon",
   "Roquefort",
   "Poulet",
   "Viande hachée|Boeuf",
   "Merguez",
   "Saumon",
   "Crevettes",
   "Roquette",
   "Artichaut",
   "Aubergine",
   "Courgette",
   "Piment",
   "Ail",
   "Huile d'olive",
   "Pommes de terre",
   "Miel",
   "Burrata",
   "Jambon cru",
   "Speck",
   "Kebab",
   "Câpres",
   "Maïs",
   "Saucisse",
   "Bacon",
   "Gruyère",
   "Raclette",
   "Ricotta",
   "Épinards",
   "Tomates cerises",
   "Pesto",
   "Truffe"
  ]
 ],
 [
  "Cite un Pokémon de la 1re génération",
  [
   "Pikachu",
   "Bulbizarre",
   "Herbizarre",
   "Florizarre",
   "Salamèche",
   "Reptincel",
   "Dracaufeu",
   "Carapuce",
   "Carabaffe",
   "Tortank",
   "Chenipan",
   "Aspicot",
   "Roucool",
   "Rattata",
   "Piafabec",
   "Abo",
   "Raichu",
   "Sabelette",
   "Mélofée",
   "Goupix",
   "Feunard",
   "Rondoudou",
   "Nosferapti",
   "Mystherbe",
   "Paras",
   "Mimitoss",
   "Taupiqueur",
   "Miaouss",
   "Psykokwak",
   "Férosinge",
   "Caninos",
   "Arcanin",
   "Ptitard",
   "Abra",
   "Kadabra",
   "Alakazam",
   "Machoc",
   "Mackogneur",
   "Chétiflor",
   "Tentacool",
   "Racaillou",
   "Grolem",
   "Ponyta",
   "Ramoloss",
   "Magnéti",
   "Canarticho",
   "Doduo",
   "Otaria",
   "Tadmorv",
   "Kokiyas",
   "Fantominus",
   "Ectoplasma",
   "Onix",
   "Soporifik",
   "Krabby",
   "Voltorbe",
   "Noeunoeuf",
   "Osselait",
   "Kicklee",
   "Tygnon",
   "Excelangue",
   "Smogo",
   "Rhinocorne",
   "Leveinard",
   "Saquedeneu",
   "Kangourex",
   "Hypotrempe",
   "Poissirène",
   "Stari",
   "M. Mime|M Mime",
   "Insécateur",
   "Lippoutou",
   "Élektek",
   "Magmar",
   "Scarabrute",
   "Tauros",
   "Magicarpe",
   "Léviator",
   "Lokhlass",
   "Métamorph",
   "Évoli",
   "Aquali",
   "Voltali",
   "Pyroli",
   "Porygon",
   "Amonita",
   "Kabuto",
   "Ptéra",
   "Ronflex",
   "Artikodin",
   "Électhor",
   "Sulfura",
   "Minidraco",
   "Draco",
   "Dracolosse",
   "Mewtwo",
   "Mew"
  ]
 ],
 [
  "Cite un plat à base de pâtes",
  [
   "Carbonara",
   "Bolognaise",
   "Lasagnes",
   "Cannellonis",
   "Raviolis",
   "Tortellinis",
   "Pesto",
   "Arrabbiata",
   "Puttanesca",
   "Cacio e pepe",
   "Aglio e olio",
   "Amatriciana",
   "Gratin de pâtes",
   "Macaroni au fromage|Mac and cheese",
   "Pâtes au thon",
   "Pâtes au saumon",
   "Pâtes à la crème",
   "Alfredo",
   "Vongole|Pâtes aux palourdes",
   "Pâtes aux crevettes",
   "Pâtes au beurre",
   "Pâtes au gorgonzola",
   "Pâtes au pistou",
   "Salade de pâtes",
   "Lasagnes végétariennes",
   "Pad thaï",
   "Ramen",
   "Udon",
   "Nouilles sautées",
   "Gnocchis",
   "Coquillettes jambon",
   "One pot pasta",
   "Pâtes à la sicilienne|Alla norma",
   "Penne all'arrabbiata",
   "Spaghetti aux boulettes"
  ]
 ],
 [
  "Cite une chanson de Michael Jackson",
  [
   "Thriller",
   "Billie Jean",
   "Beat It",
   "Bad",
   "Smooth Criminal",
   "Black or White",
   "Man in the Mirror",
   "Thriller",
   "Heal the World",
   "They Don't Care About Us",
   "Earth Song",
   "Don't Stop 'Til You Get Enough",
   "Rock with You",
   "Remember the Time",
   "You Rock My World",
   "Dirty Diana",
   "The Way You Make Me Feel",
   "Wanna Be Startin' Somethin'",
   "Human Nature",
   "Bad",
   "Scream",
   "Jam",
   "Dangerous",
   "Off the Wall",
   "Ben",
   "Liberian Girl",
   "Leave Me Alone",
   "Speed Demon",
   "Stranger in Moscow",
   "Will You Be There",
   "Blood on the Dance Floor",
   "Ghosts",
   "In the Closet",
   "Give In to Me",
   "Another Part of Me",
   "Childhood",
   "Xscape",
   "Love Never Felt So Good",
   "Slave to the Rhythm",
   "P.Y.T.",
   "Girlfriend",
   "She's Out of My Life",
   "Who Is It"
  ]
 ],
 [
  "Cite une capitale d'Asie",
  [
   "Tokyo",
   "Pékin|Beijing",
   "Séoul",
   "Pyongyang",
   "Bangkok",
   "Hanoï",
   "Vientiane",
   "Phnom Penh",
   "Kuala Lumpur",
   "Singapour",
   "Jakarta",
   "Manille",
   "Naypyidaw",
   "Dacca|Dhaka",
   "New Delhi|Delhi",
   "Katmandou",
   "Thimphou",
   "Colombo|Sri Jayawardenapura",
   "Malé",
   "Islamabad",
   "Kaboul",
   "Téhéran",
   "Bagdad",
   "Damas",
   "Beyrouth",
   "Amman",
   "Jérusalem",
   "Riyad",
   "Koweït",
   "Doha",
   "Abou Dabi",
   "Mascate",
   "Sanaa",
   "Manama",
   "Ankara",
   "Bakou",
   "Tbilissi",
   "Erevan",
   "Achgabat",
   "Tachkent",
   "Douchanbé",
   "Bichkek",
   "Astana",
   "Oulan-Bator",
   "Taipei",
   "Dili",
   "Bandar Seri Begawan"
  ]
 ],
 [
  "Cite un dessin animé de ton enfance",
  [
   "Pokémon",
   "Dragon Ball",
   "Bob l'éponge",
   "Les Simpson",
   "Scooby-Doo",
   "Tom et Jerry",
   "Les Razmoket",
   "Code Lyoko",
   "Totally Spies",
   "Kim Possible",
   "Ben 10",
   "Oggy et les Cafards",
   "Les Zinzins de l'espace",
   "Les Tortues Ninja",
   "Spirou",
   "Martin Mystère",
   "Kid Paddle",
   "Yu-Gi-Oh!",
   "Digimon",
   "Beyblade",
   "Naruto",
   "One Piece",
   "Les Supers Nanas",
   "Johnny Bravo",
   "Le Laboratoire de Dexter",
   "Arthur",
   "Caillou",
   "Franklin",
   "Babar",
   "Les Schtroumpfs",
   "Inspecteur Gadget",
   "Sailor Moon",
   "Les Chevaliers du Zodiaque",
   "Olive et Tom",
   "Il était une fois la vie",
   "Les Mystérieuses Cités d'or",
   "Barbapapa",
   "Bisounours",
   "Les Gummi",
   "Rox et Rouky",
   "Galactik Football",
   "W.I.T.C.H.",
   "Danny Fantôme",
   "Teen Titans",
   "Avatar",
   "Phinéas et Ferb",
   "Gumball",
   "Miraculous",
   "Peppa Pig",
   "Pat' Patrouille",
   "Tchoupi",
   "Petit Ours Brun",
   "Oui-Oui"
  ]
 ],
 [
  "Cite une couleur",
  [
   "Rouge",
   "Bleu",
   "Vert",
   "Jaune",
   "Orange",
   "Violet",
   "Rose",
   "Noir",
   "Blanc",
   "Gris",
   "Marron",
   "Beige",
   "Turquoise",
   "Cyan",
   "Magenta",
   "Fuchsia",
   "Bordeaux",
   "Kaki",
   "Indigo",
   "Lavande",
   "Lilas",
   "Mauve",
   "Saumon",
   "Corail",
   "Ocre",
   "Doré|Or",
   "Argenté|Argent",
   "Bronze",
   "Crème",
   "Ivoire",
   "Écru",
   "Ébène",
   "Anthracite",
   "Azur",
   "Marine|Bleu marine",
   "Émeraude",
   "Olive",
   "Pistache",
   "Menthe",
   "Sable",
   "Taupe",
   "Caramel",
   "Chocolat",
   "Prune",
   "Pourpre",
   "Carmin",
   "Vermillon",
   "Écarlate",
   "Pêche",
   "Abricot",
   "Moutarde",
   "Citron",
   "Vert sapin",
   "Bleu ciel",
   "Bleu canard",
   "Céladon",
   "Aubergine",
   "Framboise",
   "Cerise",
   "Sépia"
  ]
 ],
 [
  "Cite un métier",
  [
   "Médecin",
   "Infirmier",
   "Pompier",
   "Policier",
   "Professeur|Prof",
   "Boulanger",
   "Boucher",
   "Plombier",
   "Électricien",
   "Maçon",
   "Menuisier",
   "Avocat",
   "Juge",
   "Architecte",
   "Ingénieur",
   "Pilote",
   "Hôtesse de l'air",
   "Vétérinaire",
   "Dentiste",
   "Pharmacien",
   "Cuisinier",
   "Serveur",
   "Coiffeur",
   "Journaliste",
   "Photographe",
   "Facteur",
   "Agriculteur",
   "Pêcheur",
   "Mécanicien",
   "Chauffeur",
   "Comptable",
   "Banquier",
   "Développeur|Informaticien",
   "Designer",
   "Acteur",
   "Chanteur",
   "Musicien",
   "Écrivain",
   "Peintre",
   "Sculpteur",
   "Astronaute",
   "Militaire|Soldat",
   "Secrétaire",
   "Vendeur",
   "Caissier",
   "Fleuriste",
   "Bijoutier",
   "Couturier",
   "Jardinier",
   "Charpentier",
   "Couvreur",
   "Kiné|Kinésithérapeute",
   "Psychologue",
   "Sage-femme",
   "Chirurgien",
   "Notaire",
   "Huissier",
   "Douanier",
   "Gendarme",
   "Agent immobilier",
   "Youtubeur",
   "Streamer",
   "Influenceur",
   "Pâtissier",
   "Chocolatier",
   "Fromager",
   "Charcutier",
   "Éboueur",
   "Ramoneur",
   "Serrurier",
   "Vitrier",
   "Taxi",
   "Moniteur d'auto-école",
   "Animateur",
   "Éducateur",
   "Bibliothécaire",
   "Archéologue",
   "Biologiste",
   "Chimiste",
   "Physicien",
   "Astronome",
   "Géomètre",
   "Topographe"
  ]
 ]
];
const parse = (t) => t.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|').map(x => x.trim())).filter(r => r.length === 5);
const THEMES = {};
for (const src of [RAW, require('./data-quiz2'), require('./data-quiz3')])
  for (const [k, v] of Object.entries(src)) THEMES[k] = { name: v.name, emoji: v.emoji, cat: v.cat, q: parse(v.q) };
module.exports = { THEMES, RARE };
