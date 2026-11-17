// PlayZup — Guess Party : thèmes et réponses.
// Les images ne sont PAS stockées ici : le serveur les récupère à la volée
//   • wiki  : image principale de la page Wikipédia anglaise (affiche, jaquette, logo, photo)
//   • album : pochette via l'API Deezer (artiste + album)
//   • flag  : drapeau via flagcdn.com (code pays ISO)
// Format d'une ligne :
//   wiki / flag : "Réponse affichée|clé (titre Wikipédia anglais ou code pays)|autres réponses acceptées, séparées par des virgules"
//   album       : "Artiste|Album|autres noms de l'artiste|autres noms de l'album"
// Niveaux : 1 = connu de tous, 2 = il faut s'y connaître, 3 = vraiment dur.
module.exports = [
  {
    id: 'cartoons', name: 'Dessins animés', emoji: '📺', src: 'wiki', ask: 'Quel est ce dessin animé ?',
    items: {
      1: [
        "Bob l'éponge|SpongeBob SquarePants|spongebob, bob l eponge carre", 'Les Simpson|The Simpsons|simpsons, the simpsons',
        'Scooby-Doo|Scooby-Doo, Where Are You!|scooby doo', 'Tom et Jerry|Tom and Jerry|tom and jerry', 'Peppa Pig|Peppa Pig|peppa',
        'Shrek|Shrek|', 'Moi, moche et méchant|Despicable Me|despicable me, moi moche et mechant', 'Les Minions|Minions (film)|minions',
        "L'Âge de glace|Ice Age (2002 film)|ice age, l age de glace", 'Madagascar|Madagascar (2005 film)|', 'Kung Fu Panda|Kung Fu Panda (film)|',
        'Oggy et les Cafards|Oggy and the Cockroaches|oggy', 'Miraculous|Miraculous: Tales of Ladybug & Cat Noir|ladybug, miraculous ladybug',
        'Totally Spies!|Totally Spies!|totally spies', 'Code Lyoko|Code Lyoko|', 'Dragons|How to Train Your Dragon (film)|how to train your dragon, dragons',
        'Les Schtroumpfs|The Smurfs (1981 TV series)|schtroumpfs, smurfs', 'Titeuf|Titeuf (TV series)|',
      ],
      2: [
        "Avatar, le dernier maître de l'air|Avatar: The Last Airbender|avatar, avatar le dernier maitre de l air, the last airbender", 'Phinéas et Ferb|Phineas and Ferb|phineas et ferb, phineas and ferb',
        'Souvenirs de Gravity Falls|Gravity Falls|gravity falls', 'Le Monde incroyable de Gumball|The Amazing World of Gumball|gumball',
        'Adventure Time|Adventure Time|', 'Futurama|Futurama|', 'Les Griffin|Family Guy|family guy, griffin', 'South Park|South Park|',
        'Rick et Morty|Rick and Morty|rick and morty', "Les Mystérieuses Cités d'or|The Mysterious Cities of Gold|citees d or, les mysterieuses cites d or",
        'Il était une fois… la Vie|Once Upon a Time... Life|il etait une fois la vie', 'Inspecteur Gadget|Inspector Gadget (1983 TV series)|inspector gadget',
        'Kirikou et la Sorcière|Kirikou and the Sorceress|kirikou', 'Les Supers Nanas|The Powerpuff Girls|powerpuff girls, les super nanas',
        'Le Laboratoire de Dexter|Dexter\'s Laboratory|dexter, laboratoire de dexter', 'Courage, le chien froussard|Courage the Cowardly Dog|courage',
        'Samouraï Jack|Samurai Jack|samurai jack', 'Zig et Sharko|Zig & Sharko|zig and sharko', 'Les Razmoket|Rugrats|rugrats',
        'Arcane|Arcane (TV series)|', 'Ernest et Célestine|Ernest & Celestine|ernest and celestine', 'Wakfu|Wakfu (TV series)|',
      ],
      3: [
        "Il était une fois… l'Homme|Once Upon a Time... Man|il etait une fois l homme", 'Ulysse 31|Ulysses 31|ulysses 31', 'Les Shadoks|Les Shadoks|shadoks',
        "Le Roi et l'Oiseau|The King and the Mockingbird|le roi et l oiseau", 'Barbapapa|Barbapapa|', 'Les Triplettes de Belleville|The Triplets of Belleville|triplettes de belleville',
        'Persepolis|Persepolis (film)|', 'La Planète sauvage|Fantastic Planet|planete sauvage', 'BoJack Horseman|BoJack Horseman|bojack',
        "Over the Garden Wall|Over the Garden Wall|", 'Invader Zim|Invader Zim|', 'Daria|Daria|', 'Klaus|Klaus (film)|',
        'Les Aventures de Tintin|The Adventures of Tintin (TV series)|tintin', 'Ed, Edd n Eddy|Ed, Edd n Eddy|ed edd et eddy',
        'Steven Universe|Steven Universe|',
        "J'ai perdu mon corps|I Lost My Body|j ai perdu mon corps", 'Ma vie de Courgette|My Life as a Zucchini|ma vie de courgette, courgette',
      ],
    },
  },
  {
    id: 'disney', name: 'Disney & Pixar', emoji: '🏰', src: 'wiki', ask: 'Quel est ce film Disney ou Pixar ?',
    items: {
      1: [
        'Toy Story|Toy Story|', 'Le Roi lion|The Lion King|roi lion, the lion king', 'La Reine des neiges|Frozen (2013 film)|frozen, reine des neiges',
        'Aladdin|Aladdin (1992 Disney film)|', 'Le Monde de Nemo|Finding Nemo|nemo, finding nemo', 'Cars|Cars (film)|', 'Là-haut|Up (2009 film)|up, la haut',
        'Coco|Coco (2017 film)|', 'Vaiana|Moana (2016 film)|moana, vaiana la legende du bout du monde', 'Raiponce|Tangled|tangled',
        'Ratatouille|Ratatouille (film)|', 'WALL-E|WALL-E|wall e, walle', 'Monstres et Cie|Monsters, Inc.|monstres et compagnie, monsters inc',
        'Les Indestructibles|The Incredibles|incredibles, indestructibles', 'Vice-versa|Inside Out (2015 film)|inside out, vice versa',
        'Zootopie|Zootopia|zootopia', 'La Belle et la Bête|Beauty and the Beast (1991 film)|belle et la bete', 'Lilo et Stitch|Lilo & Stitch|lilo and stitch, stitch',
      ],
      2: [
        'Mulan|Mulan (1998 film)|', 'Hercule|Hercules (1997 film)|hercules', 'Tarzan|Tarzan (1999 film)|', 'La Petite Sirène|The Little Mermaid (1989 film)|petite sirene, little mermaid',
        'Cendrillon|Cinderella (1950 film)|cinderella', 'Pinocchio|Pinocchio (1940 film)|', 'Bambi|Bambi|', 'Dumbo|Dumbo|', 'Encanto|Encanto (film)|',
        'Rebelle|Brave (2012 film)|brave', 'Les Mondes de Ralph|Wreck-It Ralph|ralph, wreck it ralph', 'Les Nouveaux Héros|Big Hero 6 (film)|big hero 6, nouveaux heros',
        'Soul|Soul (2020 film)|', 'Luca|Luca (2021 film)|', 'Alerte rouge|Turning Red|turning red', 'Élémentaire|Elemental (2023 film)|elemental',
        'Volt, star malgré lui|Bolt (2008 film)|volt, bolt', 'En avant|Onward (film)|onward', 'Les Aristochats|The Aristocats|aristochats, aristocats',
        'Blanche-Neige et les Sept Nains|Snow White and the Seven Dwarfs (1937 film)|blanche neige',
      ],
      3: [
        'Kuzco, l\'empereur mégalo|The Emperor\'s New Groove|kuzco', 'Frère des ours|Brother Bear|frere des ours, brother bear', 'La Princesse et la Grenouille|The Princess and the Frog|princesse et la grenouille',
        'La Planète au trésor|Treasure Planet|planete au tresor', 'Atlantide, l\'empire perdu|Atlantis: The Lost Empire|atlantide, atlantis',
        'Rox et Rouky|The Fox and the Hound|rox et rouky', 'Taram et le Chaudron magique|The Black Cauldron|taram, chaudron magique', 'La ferme se rebelle|Home on the Range (2004 film)|la ferme se rebelle',
        'Bienvenue chez les Robinson|Meet the Robinsons|robinson', 'Avalonia, l\'étrange voyage|Strange World (film)|avalonia, strange world', 'Oliver et Compagnie|Oliver & Company|oliver et compagnie',
        'Raya et le Dernier Dragon|Raya and the Last Dragon|raya', 'Chicken Little|Chicken Little (2005 film)|', 'Wish|Wish (2023 film)|wish asha et la bonne etoile',
        'Robin des Bois|Robin Hood (1973 film)|robin des bois, robin hood', 'Basil, détective privé|The Great Mouse Detective|basil', 'Fantasia|Fantasia (1940 film)|',
        'Bernard et Bianca|The Rescuers|bernard et bianca, the rescuers', 'Le Voyage d\'Arlo|The Good Dinosaur|arlo, the good dinosaur',
      ],
    },
  },
  {
    id: 'films', name: 'Films', emoji: '🎬', src: 'wiki', ask: 'Quel est ce film ?',
    items: {
      1: [
        'Titanic|Titanic (1997 film)|', 'Avatar|Avatar (2009 film)|', "Harry Potter à l'école des sorciers|Harry Potter and the Philosopher's Stone (film)|harry potter",
        'Star Wars|Star Wars (film)|star wars un nouvel espoir, la guerre des etoiles', 'Jurassic Park|Jurassic Park (film)|', 'Intouchables|The Intouchables|intouchables',
        "Bienvenue chez les Ch'tis|Welcome to the Sticks|bienvenue chez les chtis, les chtis", 'Astérix & Obélix : Mission Cléopâtre|Asterix & Obelix: Mission Cleopatra|mission cleopatre, asterix et obelix mission cleopatre',
        'Spider-Man|Spider-Man (2002 film)|spiderman', 'Avengers|The Avengers (2012 film)|the avengers, avengers', 'Pirates des Caraïbes|Pirates of the Caribbean: The Curse of the Black Pearl|pirates des caraibes',
        'Fast and Furious|The Fast and the Furious (2001 film)|fast and furious, fast & furious', 'Maman, j\'ai raté l\'avion !|Home Alone|maman j ai rate l avion, home alone',
        'E.T. l\'extra-terrestre|E.T. the Extra-Terrestrial|et, e t', 'Retour vers le futur|Back to the Future|back to the future', 'Barbie|Barbie (film)|',
        'The Dark Knight|The Dark Knight|dark knight, le chevalier noir', 'Les Visiteurs|Les Visiteurs|visiteurs',
      ],
      2: [
        'Inception|Inception|', 'Matrix|The Matrix|the matrix', 'Pulp Fiction|Pulp Fiction|', 'Forrest Gump|Forrest Gump|', 'Gladiator|Gladiator (2000 film)|',
        "Le Fabuleux Destin d'Amélie Poulain|Amélie|amelie, amelie poulain", 'La Haine|La Haine|', 'Interstellar|Interstellar (film)|', 'Joker|Joker (2019 film)|',
        'Oppenheimer|Oppenheimer (film)|', 'Dune|Dune (2021 film)|', 'Top Gun: Maverick|Top Gun: Maverick|top gun maverick, top gun', 'Le Parrain|The Godfather|the godfather, parrain',
        'Les Bronzés font du ski|Les Bronzés font du ski|les bronzes font du ski', 'OSS 117 : Le Caire, nid d\'espions|OSS 117: Cairo, Nest of Spies|oss 117',
        'Le Dîner de cons|The Dinner Game|diner de cons', 'Taxi|Taxi (1998 film)|', 'Fight Club|Fight Club|', 'Shining|The Shining (film)|the shining',
        'Les Dents de la mer|Jaws (film)|jaws, dents de la mer', 'Rocky|Rocky|',
      ],
      3: [
        'Drive|Drive (2011 film)|', 'Whiplash|Whiplash (2014 film)|', 'Parasite|Parasite (2019 film)|', 'Mulholland Drive|Mulholland Drive (film)|',
        'Le Samouraï|Le Samouraï|le samourai', 'Léon|Léon: The Professional|leon', 'Blade Runner|Blade Runner|', 'Orange mécanique|A Clockwork Orange (film)|clockwork orange, orange mecanique',
        'Taxi Driver|Taxi Driver|', 'Eternal Sunshine of the Spotless Mind|Eternal Sunshine of the Spotless Mind|eternal sunshine', 'The Grand Budapest Hotel|The Grand Budapest Hotel|grand budapest hotel',
        'Les Misérables (2019)|Les Misérables (2019 film)|les miserables', 'Portrait de la jeune fille en feu|Portrait of a Lady on Fire|portrait de la jeune fille en feu',
        'The Big Lebowski|The Big Lebowski|big lebowski', 'No Country for Old Men|No Country for Old Men|', '2001, l\'Odyssée de l\'espace|2001: A Space Odyssey|2001 l odyssee de l espace, 2001',
        'Anatomie d\'une chute|Anatomy of a Fall|anatomie d une chute', 'Old Boy|Oldboy (2003 film)|oldboy', 'Le Cinquième Élément|The Fifth Element|cinquieme element, the fifth element',
      ],
    },
  },
  {
    id: 'raprfr', name: 'Pochettes rap FR', emoji: '🎤', src: 'album', ask: "Trouve l'artiste ET le nom de l'album !",
    items: {
      1: [
        'PNL|Deux frères||deux freres', 'PNL|Dans la légende||dans la legende', 'Ninho|Destin||', 'Jul|My World||', 'Booba|Trône||trone',
        'Nekfeu|Feu||', 'Orelsan|Civilisation||', 'Orelsan|La fête est finie||la fete est finie', 'Damso|Ipséité||ipseite', 'Gims|Ceinture noire|maitre gims|',
        'SCH|JVLIVS||julius', 'Aya Nakamura|Nakamura||', 'Niska|Commando||', 'Soolking|Fruit du démon||fruit du demon', 'Lomepal|Jeannine||',
        'Tiakola|Mélo||melo', 'Gazo|KMT||', 'Werenoi|Carré||carre',
      ],
      2: [
        'Booba|Temps mort||', 'Booba|Ouest Side||', "IAM|L'École du micro d'argent||l ecole du micro d argent, ecole du micro d argent", 'Suprême NTM|Paris sous les bombes|ntm, supreme ntm|',
        'MC Solaar|Prose combat|solaar|', 'Sniper|Du rire aux larmes||', 'Kaaris|Or noir||', 'Lacrim|R.I.P.R.O||ripro', 'Vald|Xeu||',
        'Hamza|Paradise||', 'Freeze Corleone|LMF|freeze|', 'Laylow|Trinity||', 'Alpha Wann|UMLA||', 'Rohff|La fierté des nôtres||la fierte des notres',
        "Diam's|Dans ma bulle|diams|", "Sexion d'Assaut|L'École des points vitaux|sexion d assaut|l ecole des points vitaux", 'Koba LaD|VII|koba la d|7', 'Damso|Lithopédion||lithopedion',
      ],
      3: [
        'Lunatic|Mauvais œil||mauvais oeil', 'Ärsenik|Quelques gouttes suffisent...|arsenik|quelques gouttes suffisent', 'Oxmo Puccino|Opéra puccino|oxmo|opera puccino',
        'Fonky Family|Si Dieu veut...||si dieu veut', '113|Les Princes de la ville||princes de la ville', 'Booba|Panthéon||pantheon', 'La Rumeur|L\'Ombre sur la mesure||l ombre sur la mesure',
        'Népal|Adios Bahamas|nepal|', "Rim'K|Monster Tape|rimk|", 'Josman|J.O.$||jos, j o s', 'Hugo TSR|Fenêtre sur rue||fenetre sur rue', 'Dinos|Taciturne||',
        'Disiz|Le Poisson rouge|disiz la peste|poisson rouge', 'Kekra|Vréel||vreel', 'Zola|Cicatrices||', 'Hamza|1994||', 'Alpha Wann|Une main lave l\'autre||une main lave l autre',
      ],
    },
  },
  {
    id: 'rapus', name: 'Pochettes rap US', emoji: '🇺🇸', src: 'album', ask: "Trouve l'artiste ET le nom de l'album !",
    items: {
      1: [
        'Eminem|The Marshall Mathers LP||marshall mathers lp', 'Eminem|The Eminem Show||eminem show', 'Kanye West|Graduation|ye, kanye|', 'Drake|Views||',
        'Kendrick Lamar|DAMN.|kendrick|damn', 'Travis Scott|Astroworld||', '50 Cent|Get Rich or Die Tryin\'|50cent, fifty cent|get rich or die tryin', 'Post Malone|Hollywood\'s Bleeding||hollywoods bleeding',
        'Snoop Dogg|Doggystyle|snoop|', 'Dr. Dre|2001|dr dre|', 'Jay-Z|The Blueprint|jay z|blueprint', 'Nicki Minaj|Pink Friday||', '2Pac|All Eyez on Me|tupac|all eyez on me',
        'The Notorious B.I.G.|Ready to Die|notorious big, biggie|', 'Lil Nas X|Montero||', 'Cardi B|Invasion of Privacy||',
      ],
      2: [
        'Kendrick Lamar|To Pimp a Butterfly|kendrick|', 'Kanye West|My Beautiful Dark Twisted Fantasy|ye, kanye|mbdtf', 'Kanye West|The College Dropout|ye, kanye|college dropout',
        'Tyler, The Creator|Igor|tyler the creator, tyler|', 'Frank Ocean|Blonde||', 'J. Cole|2014 Forest Hills Drive|j cole|forest hills drive', 'Mac Miller|Swimming||',
        'A$AP Rocky|Long.Live.ASAP|asap rocky|long live asap', 'Nas|Illmatic||', 'Lil Wayne|Tha Carter III||the carter 3, carter 3', 'Outkast|Speakerboxxx/The Love Below||speakerboxxx the love below',
        'Kid Cudi|Man on the Moon: The End of Day|cudi|man on the moon', 'Juice WRLD|Goodbye & Good Riddance|juice world|goodbye and good riddance', 'XXXTentacion|17|xxxtentacion|',
        'Childish Gambino|"Awaken, My Love!"|gambino|awaken my love', 'Future|DS2||', 'Kendrick Lamar|good kid, m.A.A.d city|kendrick|good kid maad city',
      ],
      3: [
        'Wu-Tang Clan|Enter the Wu-Tang (36 Chambers)|wu tang|enter the wu tang, 36 chambers', 'Madvillain|Madvillainy|mf doom, madlib|', 'A Tribe Called Quest|The Low End Theory|atcq|low end theory',
        'Mobb Deep|The Infamous||infamous', 'Lauryn Hill|The Miseducation of Lauryn Hill||miseducation of lauryn hill', 'De La Soul|3 Feet High and Rising||3 feet high and rising',
        'Public Enemy|It Takes a Nation of Millions to Hold Us Back||it takes a nation of millions', 'Danny Brown|Atrocity Exhibition||', 'Earl Sweatshirt|Some Rap Songs|earl|',
        'Run the Jewels|Run the Jewels 2|rtj|rtj2', 'Clipse|Hell Hath No Fury||', 'Pusha T|Daytona|pusha|', 'Freddie Gibbs|Piñata|freddie gibbs madlib, madlib|pinata',
        'Playboi Carti|Whole Lotta Red|carti|', 'JPEGMAFIA|Veteran|jpeg mafia|', 'Little Simz|Sometimes I Might Be Introvert|simz|', 'Vince Staples|Big Fish Theory||',
      ],
    },
  },
  {
    id: 'pop', name: 'Pochettes pop & variété', emoji: '💿', src: 'album', ask: "Trouve l'artiste ET le nom de l'album !",
    items: {
      1: [
        'Stromae|Racine carrée||racine carree', 'Angèle|Brol|angele|', 'Indila|Mini World||', 'Michael Jackson|Thriller|mj|', 'Adele|21||', 'Taylor Swift|1989||',
        'Billie Eilish|When We All Fall Asleep, Where Do We Go?||when we all fall asleep where do we go', 'The Weeknd|After Hours|weeknd|', 'Daft Punk|Random Access Memories||ram',
        'Queen|A Night at the Opera||night at the opera', 'The Beatles|Abbey Road|beatles|', 'Pink Floyd|The Dark Side of the Moon||dark side of the moon', 'Nirvana|Nevermind||',
        'Dua Lipa|Future Nostalgia||', 'Ed Sheeran|÷|sheeran|divide', 'Bruno Mars|24K Magic||24k magic',
      ],
      2: [
        'Mylène Farmer|Ainsi soit je...|mylene farmer|ainsi soit je', "Céline Dion|D'eux|celine dion|d eux", 'Jean-Jacques Goldman|Entre gris clair et gris foncé|goldman, jj goldman|entre gris clair et gris fonce',
        'Zaz|Zaz||', 'Louane|Chambre 12||', 'Vianney|Idées blanches||idees blanches', 'Christine and the Queens|Chaleur humaine|christine and the queens, chris|',
        'Juliette Armanet|Petite Amie||', 'Prince|Purple Rain||', 'Madonna|Like a Prayer||', 'Fleetwood Mac|Rumours||', 'Amy Winehouse|Back to Black||',
        'Beyoncé|Lemonade|beyonce|', 'Lady Gaga|The Fame|gaga|fame', 'Harry Styles|Harry\'s House||harrys house', 'Coldplay|Parachutes||', 'Michael Jackson|Bad|mj|',
      ],
      3: [
        'Serge Gainsbourg|Histoire de Melody Nelson|gainsbourg|melody nelson', 'Alain Bashung|Fantaisie militaire|bashung|', 'Air|Moon Safari||', 'Phoenix|Wolfgang Amadeus Phoenix||',
        'Daft Punk|Homework||', 'Radiohead|OK Computer||ok computer', 'The Velvet Underground|The Velvet Underground & Nico|velvet underground|velvet underground and nico',
        'Joy Division|Unknown Pleasures||', 'Kate Bush|Hounds of Love||', 'Björk|Homogenic|bjork|', 'Massive Attack|Mezzanine||', 'Talking Heads|Remain in Light||',
        'David Bowie|The Rise and Fall of Ziggy Stardust and the Spiders from Mars|bowie|ziggy stardust', 'Clara Luciani|Sainte-Victoire||sainte victoire', 'Justice|Hyperdrama||',
        'Christophe|Les Vestiges du chaos||les vestiges du chaos', 'Fishbach|À ta merci||a ta merci',
      ],
    },
  },
  {
    id: 'anime', name: 'Animés japonais', emoji: '🍜', src: 'wiki', ask: 'Quel est cet animé ?',
    items: {
      1: [
        'Naruto|Naruto|', 'One Piece|One Piece|', 'Dragon Ball Z|Dragon Ball Z|dbz, dragon ball', 'Pokémon|Pokémon (TV series)|pokemon', 'Death Note|Death Note|',
        "L'Attaque des Titans|Attack on Titan|attack on titan, snk, shingeki no kyojin", 'Demon Slayer|Demon Slayer: Kimetsu no Yaiba|kimetsu no yaiba', 'My Hero Academia|My Hero Academia|mha',
        'Olive et Tom|Captain Tsubasa|captain tsubasa', 'Les Chevaliers du Zodiaque|Saint Seiya|saint seiya', 'Sailor Moon|Sailor Moon|', 'Hunter × Hunter|Hunter × Hunter|hunter x hunter',
        'Jujutsu Kaisen|Jujutsu Kaisen|jjk', 'Le Voyage de Chihiro|Spirited Away|chihiro, spirited away', 'Mon voisin Totoro|My Neighbor Totoro|totoro',
        'Dragon Ball|Dragon Ball (TV series)|', 'Nicky Larson|City Hunter|city hunter',
      ],
      2: [
        'Fullmetal Alchemist|Fullmetal Alchemist: Brotherhood|fma, fullmetal alchemist brotherhood', 'Bleach|Bleach (TV series)|', 'Fairy Tail|Fairy Tail|', 'Tokyo Ghoul|Tokyo Ghoul|',
        'One-Punch Man|One-Punch Man|one punch man', 'Chainsaw Man|Chainsaw Man|', 'Spy × Family|Spy × Family|spy x family', 'Neon Genesis Evangelion|Neon Genesis Evangelion|evangelion',
        'Cowboy Bebop|Cowboy Bebop|', 'Princesse Mononoké|Princess Mononoke|mononoke', 'Le Château ambulant|Howl\'s Moving Castle|chateau ambulant', 'Your Name|Your Name|kimi no na wa',
        'Blue Lock|Blue Lock|', 'Haikyu!!|Haikyu!!|haikyu', 'Détective Conan|Case Closed|detective conan, conan', 'Yu-Gi-Oh!|Yu-Gi-Oh! Duel Monsters|yu gi oh, yugioh',
        'Black Clover|Black Clover|', 'Vinland Saga|Vinland Saga|', 'Mob Psycho 100|Mob Psycho 100|mob psycho', 'Solo Leveling|Solo Leveling|',
      ],
      3: [
        'Akira|Akira (1988 film)|', 'Ghost in the Shell|Ghost in the Shell (1995 film)|', 'Steins;Gate|Steins;Gate|steins gate', 'Code Geass|Code Geass|',
        'Made in Abyss|Made in Abyss|', 'Le Tombeau des lucioles|Grave of the Fireflies|tombeau des lucioles', 'Perfect Blue|Perfect Blue|', 'Paprika|Paprika (2006 film)|',
        'Mushishi|Mushishi|', 'Frieren|Frieren|frieren beyond journey s end', 'Dorohedoro|Dorohedoro|', 'Berserk|Berserk (1997 TV series)|',
        'Ranking of Kings|Ranking of Kings|ousama ranking', 'Odd Taxi|Odd Taxi|', 'Serial Experiments Lain|Serial Experiments Lain|lain',
        'Nausicaä de la vallée du vent|Nausicaä of the Valley of the Wind (film)|nausicaa', 'Dandadan|Dandadan|dan da dan', 'Sakamoto Days|Sakamoto Days|',
      ],
    },
  },
  {
    id: 'series', name: 'Séries TV', emoji: '📡', src: 'wiki', ask: 'Quelle est cette série ?',
    items: {
      1: [
        'Game of Thrones|Game of Thrones|got', 'Stranger Things|Stranger Things|', 'Friends|Friends|', 'Breaking Bad|Breaking Bad|', 'The Walking Dead|The Walking Dead (TV series)|walking dead',
        'Squid Game|Squid Game|', 'La Casa de Papel|Money Heist|money heist, casa de papel', 'Lupin|Lupin (French TV series)|', 'Mercredi|Wednesday (TV series)|wednesday',
        'The Office|The Office (American TV series)|office', 'Prison Break|Prison Break|', "Grey's Anatomy|Grey's Anatomy|greys anatomy", 'Kaamelott|Kaamelott|',
        'The Big Bang Theory|The Big Bang Theory|big bang theory', 'Narcos|Narcos|', 'Peaky Blinders|Peaky Blinders (TV series)|peaky blinders', 'La Chronique des Bridgerton|Bridgerton|bridgerton',
      ],
      2: [
        'Dark|Dark (TV series)|', 'The Mandalorian|The Mandalorian|mandalorian', 'Black Mirror|Black Mirror|', 'Sherlock|Sherlock (TV series)|', 'Lost|Lost (2004 TV series)|lost les disparus',
        'Dexter|Dexter (TV series)|', 'Dr House|House (TV series)|house, docteur house', 'The Crown|The Crown (TV series)|crown', 'The Last of Us|The Last of Us (TV series)|last of us',
        'Euphoria|Euphoria (American TV series)|', 'Le Bureau des légendes|The Bureau (TV series)|bureau des legendes', 'Vikings|Vikings (2013 TV series)|', 'Westworld|Westworld (TV series)|',
        'Better Call Saul|Better Call Saul|', 'Engrenages|Spiral (French TV series)|', 'The Boys|The Boys (TV series)|boys', 'Severance|Severance (TV series)|',
      ],
      3: [
        'The Wire|The Wire|sur ecoute, the wire', 'Les Soprano|The Sopranos|sopranos, les sopranos', 'Twin Peaks|Twin Peaks|', 'Mad Men|Mad Men|', 'Fargo|Fargo (TV series)|',
        'True Detective|True Detective|', 'Succession|Succession (TV series)|', 'The Americans|The Americans|', 'Atlanta|Atlanta (TV series)|', 'Mr. Robot|Mr. Robot|mr robot',
        'The Leftovers|The Leftovers (TV series)|leftovers', 'Les Revenants|The Returned (French TV series)|revenants', 'Fleabag|Fleabag|', 'Chernobyl|Chernobyl (miniseries)|',
        'The Bear|The Bear (TV series)|bear', 'Shōgun|Shōgun (2024 TV series)|shogun', 'Le Jeu de la dame|The Queen\'s Gambit (miniseries)|queens gambit, jeu de la dame',
      ],
    },
  },
  {
    id: 'games', name: 'Jeux vidéo', emoji: '🎮', src: 'wiki', ask: 'Quel est ce jeu vidéo ?',
    items: {
      1: [
        'Minecraft|Minecraft|', 'Fortnite|Fortnite|', 'GTA V|Grand Theft Auto V|gta 5, gta v, grand theft auto 5', 'Super Mario Bros.|Super Mario Bros.|super mario bros, mario',
        'Mario Kart 8|Mario Kart 8|mario kart', 'Zelda: Breath of the Wild|The Legend of Zelda: Breath of the Wild|zelda, breath of the wild, botw', 'Pokémon Rouge et Bleu|Pokémon Red and Blue|pokemon rouge, pokemon bleu, pokemon',
        'EA Sports FC 24|EA Sports FC 24|fc 24, fifa', 'Call of Duty: Black Ops|Call of Duty: Black Ops|black ops, call of duty, cod', 'Among Us|Among Us|', 'Rocket League|Rocket League|',
        'Tetris|Tetris|', 'Pac-Man|Pac-Man|pacman', 'Clash Royale|Clash Royale|', 'Animal Crossing: New Horizons|Animal Crossing: New Horizons|animal crossing', 'League of Legends|League of Legends|lol',
      ],
      2: [
        'The Last of Us|The Last of Us|last of us', 'Red Dead Redemption 2|Red Dead Redemption 2|rdr2, red dead', 'Elden Ring|Elden Ring|', 'Hollow Knight|Hollow Knight|',
        'God of War|God of War (2018 video game)|', 'Overwatch|Overwatch (video game)|', "Assassin's Creed II|Assassin's Creed II|assassins creed 2, assassin s creed",
        'Rayman|Rayman (video game)|', 'Portal 2|Portal 2|', 'The Witcher 3|The Witcher 3: Wild Hunt|witcher 3, the witcher', 'Cyberpunk 2077|Cyberpunk 2077|cyberpunk',
        'Halo|Halo: Combat Evolved|halo', 'Undertale|Undertale|', 'Stardew Valley|Stardew Valley|', 'Super Smash Bros. Ultimate|Super Smash Bros. Ultimate|smash bros, smash',
        'Fall Guys|Fall Guys|', 'Valorant|Valorant|',
      ],
      3: [
        'Hades|Hades (video game)|', 'Celeste|Celeste (video game)|', 'Shadow of the Colossus|Shadow of the Colossus|', 'Disco Elysium|Disco Elysium|', 'Outer Wilds|Outer Wilds|',
        'Ōkami|Ōkami|okami', 'Journey|Journey (2012 video game)|', 'Inside|Inside (video game)|', 'Cuphead|Cuphead|', 'Dark Souls|Dark Souls (video game)|',
        'Metroid Prime|Metroid Prime|', 'Silent Hill 2|Silent Hill 2|', 'Clair Obscur: Expedition 33|Clair Obscur: Expedition 33|expedition 33, clair obscur',
        'Beyond Good & Evil|Beyond Good & Evil (video game)|beyond good and evil', 'Hotline Miami|Hotline Miami|', 'Firewatch|Firewatch|', 'Balatro|Balatro|',
      ],
    },
  },
  {
    id: 'flags', name: 'Drapeaux', emoji: '🌍', src: 'flag', ask: 'De quel pays est ce drapeau ?',
    items: {
      1: [
        'France|fr|', 'Allemagne|de|', 'Italie|it|', 'Espagne|es|', 'Royaume-Uni|gb|angleterre, uk, grande bretagne', 'États-Unis|us|usa, etats unis, amerique', 'Japon|jp|',
        'Brésil|br|bresil', 'Canada|ca|', 'Chine|cn|', 'Maroc|ma|', 'Algérie|dz|algerie', 'Portugal|pt|', 'Belgique|be|', 'Suisse|ch|', 'Mexique|mx|', 'Argentine|ar|', 'Tunisie|tn|',
      ],
      2: [
        'Sénégal|sn|senegal', "Côte d'Ivoire|ci|cote d ivoire", 'Turquie|tr|', 'Grèce|gr|grece', 'Suède|se|suede', 'Norvège|no|norvege', 'Irlande|ie|', 'Corée du Sud|kr|coree du sud, coree',
        'Inde|in|', 'Australie|au|', 'Pays-Bas|nl|pays bas, hollande', 'Pologne|pl|', 'Égypte|eg|egypte', 'Jamaïque|jm|jamaique', 'Cameroun|cm|', 'Colombie|co|', 'Croatie|hr|', 'Afrique du Sud|za|',
      ],
      3: [
        'Bhoutan|bt|', 'Kirghizistan|kg|', 'Kiribati|ki|', 'Mozambique|mz|', 'Népal|np|nepal', 'Sri Lanka|lk|', 'Brunei|bn|', 'Eswatini|sz|swaziland', 'Mauritanie|mr|',
        'Moldavie|md|', 'Laos|la|', 'Seychelles|sc|', 'Guyana|gy|', 'Belize|bz|', 'Comores|km|', 'Papouasie-Nouvelle-Guinée|pg|papouasie nouvelle guinee, papouasie', 'Saint-Marin|sm|saint marin', 'Vanuatu|vu|',
      ],
    },
  },
  {
    id: 'monuments', name: 'Monuments du monde', emoji: '🗿', src: 'wiki', ask: 'Quel est ce monument ?',
    items: {
      1: [
        'Tour Eiffel|Eiffel Tower|tour eiffel', 'Statue de la Liberté|Statue of Liberty|statue de la liberte', 'Colisée|Colosseum|colisee', 'Big Ben|Big Ben|', 'Taj Mahal|Taj Mahal|',
        'Pyramides de Gizeh|Giza pyramid complex|pyramides, pyramides d egypte', 'Grande Muraille de Chine|Great Wall of China|muraille de chine', 'Opéra de Sydney|Sydney Opera House|opera de sydney',
        "Arc de Triomphe|Arc de Triomphe|", 'Christ Rédempteur|Christ the Redeemer (statue)|christ redempteur, christ de rio', 'Tour de Pise|Leaning Tower of Pisa|tour de pise',
        'Sagrada Família|Sagrada Família|sagrada familia', 'Mont-Saint-Michel|Mont-Saint-Michel|mont saint michel', 'Notre-Dame de Paris|Notre-Dame de Paris|notre dame',
        'Pyramide du Louvre|Louvre Pyramid|louvre', 'Burj Khalifa|Burj Khalifa|',
      ],
      2: [
        'Machu Picchu|Machu Picchu|', 'Pétra|Petra|petra', 'Angkor Vat|Angkor Wat|angkor', 'Château de Neuschwanstein|Neuschwanstein Castle|neuschwanstein',
        'Golden Gate Bridge|Golden Gate Bridge|golden gate', 'Acropole d\'Athènes|Acropolis of Athens|acropole, parthenon', 'Stonehenge|Stonehenge|', 'Moaï de l\'île de Pâques|Moai|moai, ile de paques',
        'Mont Rushmore|Mount Rushmore|rushmore', 'Chichén Itzá|Chichen Itza|chichen itza', 'Alhambra|Alhambra|', 'Cathédrale Saint-Basile|Saint Basil\'s Cathedral|saint basile',
        'Sainte-Sophie|Hagia Sophia|sainte sophie', 'Tower Bridge|Tower Bridge|', 'Château de Versailles|Palace of Versailles|versailles', 'Porte de Brandebourg|Brandenburg Gate|porte de brandebourg',
        'Atomium|Atomium|', 'Viaduc de Millau|Millau Viaduct|viaduc de millau',
      ],
      3: [
        'Borobudur|Borobudur|', 'Palais du Potala|Potala Palace|potala', 'Pagode Shwedagon|Shwedagon Pagoda|shwedagon', 'Grande Mosquée de Djenné|Great Mosque of Djenné|djenne',
        'Hallgrímskirkja|Hallgrímskirkja|hallgrimskirkja', 'Bagan|Bagan|', 'Wat Arun|Wat Arun|', 'Fushimi Inari-taisha|Fushimi Inari-taisha|fushimi inari', 'Temples d\'Abou Simbel|Abu Simbel|abou simbel',
        'Palais national de Pena|Pena Palace|pena', 'Cité de Carcassonne|Cité de Carcassonne|carcassonne', 'Château de Chambord|Château de Chambord|chambord',
        'Mosquée-cathédrale de Cordoue|Mosque–Cathedral of Córdoba|mezquita, cordoue', 'Porte de l\'Inde|Gateway of India|gateway of india', 'Météores|Meteora|meteora',
        'Ponte Vecchio|Ponte Vecchio|', 'Grande mosquée Cheikh Zayed|Sheikh Zayed Grand Mosque|cheikh zayed', 'Église Saint-Georges de Lalibela|Church of Saint George, Lalibela|lalibela',
      ],
    },
  },
  {
    id: 'foot', name: 'Logos de clubs de foot', emoji: '⚽', src: 'wiki', ask: 'Quel est ce club ?',
    items: {
      1: [
        'PSG|Paris Saint-Germain F.C.|paris saint germain, paris sg, paris', 'OM|Olympique de Marseille|olympique de marseille, marseille', 'Real Madrid|Real Madrid CF|real',
        'FC Barcelone|FC Barcelona|barcelone, barca, barcelona', 'Manchester United|Manchester United F.C.|man united, man utd', 'Liverpool|Liverpool F.C.|', 'Juventus|Juventus FC|juve',
        'Bayern Munich|FC Bayern Munich|bayern', 'Chelsea|Chelsea F.C.|', 'OL|Olympique Lyonnais|olympique lyonnais, lyon', 'Arsenal|Arsenal F.C.|', 'Manchester City|Manchester City F.C.|man city, city',
        'AC Milan|AC Milan|milan', 'Inter Milan|Inter Milan|inter', 'Borussia Dortmund|Borussia Dortmund|dortmund, bvb',
      ],
      2: [
        'AS Monaco|AS Monaco FC|monaco', 'LOSC Lille|Lille OSC|lille, losc', 'Stade Rennais|Stade Rennais F.C.|rennes', 'RC Lens|RC Lens|lens', 'OGC Nice|OGC Nice|nice',
        'Atlético Madrid|Atlético Madrid|atletico, atletico madrid', 'Tottenham|Tottenham Hotspur F.C.|spurs', 'Ajax Amsterdam|AFC Ajax|ajax', 'Benfica|S.L. Benfica|',
        'FC Porto|FC Porto|porto', 'Galatasaray|Galatasaray S.K.|', 'Celtic Glasgow|Celtic F.C.|celtic', 'Naples|SSC Napoli|napoli, naples', 'AS Roma|AS Roma|roma, rome',
        'FC Séville|Sevilla FC|seville, sevilla', 'RB Leipzig|RB Leipzig|leipzig',
      ],
      3: [
        'AS Saint-Étienne|AS Saint-Étienne|saint etienne, asse, les verts', 'FC Nantes|FC Nantes|nantes', 'Girondins de Bordeaux|FC Girondins de Bordeaux|bordeaux', 'Stade Brestois|Stade Brestois 29|brest',
        'Toulouse FC|Toulouse FC|toulouse, tfc', 'Montpellier HSC|Montpellier HSC|montpellier', 'Feyenoord|Feyenoord|', 'Boca Juniors|Boca Juniors|boca', 'River Plate|Club Atlético River Plate|river',
        'Al Ahly|Al Ahly SC|', 'Fenerbahçe|Fenerbahçe S.K.|fenerbahce', 'Athletic Bilbao|Athletic Bilbao|bilbao', 'Olympiakos|Olympiacos F.C.|olympiacos', 'Club Bruges|Club Brugge KV|bruges, brugge',
        'PSV Eindhoven|PSV Eindhoven|psv', 'Étoile rouge de Belgrade|Red Star Belgrade|etoile rouge, red star', 'Sporting Portugal|Sporting CP|sporting',
      ],
    },
  },
];
