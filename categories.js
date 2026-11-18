// Catégories Musikz — listes choisies à la main pour que tout reste cohérent.
//
// Deux types de catégories :
//  • kind: 'work'  → on devine le NOM DE L'ŒUVRE (dessin animé, film, série…)
//      ligne : "Nom de l'œuvre|Autre nom accepté :: recherche Deezer"
//  • musique (par défaut) → on devine ARTISTE et TITRE
//      ligne : "Artiste — Titre"   (optionnel : " :: recherche Deezer" si la recherche doit être différente)
//
// Pour ajouter un morceau : ajoute simplement une ligne. Les lignes vides et celles qui commencent par # sont ignorées.

const C = [];
const cat = (o) => C.push(o);

// ═════════════════════ ÉCRANS ═════════════════════
cat({ id: 'da-fr', name: 'Dessins animés 2000-2010', emoji: '📺', group: 'Écrans', star: true, kind: 'work', label: 'Nom du dessin animé', items: `
Code Lyoko :: Code Lyoko Un monde sans danger
Totally Spies :: Totally Spies générique
Kim Possible :: Kim Possible générique
W.I.T.C.H.|Witch :: WITCH générique
Winx Club|Winx :: Winx Club générique
Galactik Football :: Galactik Football générique
Oggy et les Cafards|Oggy :: Oggy et les cafards générique
Titeuf :: Titeuf générique
Les Zinzins de l'espace|Zinzins de l'espace :: Les zinzins de l'espace générique
Bob l'éponge|Bob l'eponge carré :: Bob l'éponge générique
Yu-Gi-Oh!|Yugioh :: Yu-Gi-Oh générique français
Naruto :: Naruto générique français
Atomic Betty :: Atomic Betty générique
Kid Paddle :: Kid Paddle générique
Foot 2 Rue|Foot de rue :: Foot 2 rue générique
Ratz :: Ratz générique
Martin Mystère|Martin Mystery :: Martin Mystère générique
Mes parrains sont magiques :: Mes parrains sont magiques générique
Danny Fantôme|Danny Phantom :: Danny Fantôme générique
Avatar, le dernier maître de l'air|Avatar :: Avatar le dernier maître de l'air générique
Ben 10 :: Ben 10 générique
Les Supers Nanas|Powerpuff Girls :: Les Supers Nanas générique
Le Laboratoire de Dexter|Dexter :: Le laboratoire de Dexter générique
Sonic X :: Sonic X générique
Beyblade :: Beyblade générique français
Digimon :: Digimon générique français
Inazuma Eleven :: Inazuma Eleven générique français
Bakugan :: Bakugan générique
Lilo et Stitch, la série|Lilo et Stitch :: Lilo et Stitch la série générique
Phinéas et Ferb|Phineas et Ferb :: Phinéas et Ferb générique
Jimmy Neutron :: Jimmy Neutron générique
Wakfu :: Wakfu générique
Teen Titans :: Teen Titans générique
Kaeloo :: Kaeloo générique
Trotro :: Trotro générique
Hamtaro :: Hamtaro générique
Zig et Sharko :: Zig et Sharko générique
Shuriken School :: Shuriken School générique
Corneil et Bernie :: Corneil et Bernie générique
Yakari :: Yakari générique
Lucky Luke :: Les nouvelles aventures de Lucky Luke générique
Foster, la maison des amis imaginaires|Foster :: Foster la maison des amis imaginaires générique
Ed, Edd et Eddy|Ed Edd Eddy :: Ed Edd et Eddy générique
Rocket Power :: Rocket Power générique
Le Petit Nicolas :: Le petit Nicolas générique dessin animé
Ninjago :: Ninjago générique The Weekend Whip
Le Monde incroyable de Gumball|Gumball :: Le monde incroyable de Gumball générique
Mew Mew Power|Tokyo Mew Mew :: Mew Mew Power générique
Fifi et ses Floribelles|Fifi :: Fifi et les floribelles générique
Kirikou :: Kirikou générique
Les Lapins Crétins|Lapins crétins :: Les lapins crétins générique
Pokémon|Pokemon :: Pokémon générique français
Dragon Ball Z|DBZ :: Dragon Ball Z générique français
One Piece :: One Piece générique français
Les Razmoket|Razmoket :: Les Razmoket générique
Arthur :: Arthur générique dessin animé
Caillou :: Caillou générique
Franklin :: Franklin générique
Babar :: Babar générique
Les Simpson|Simpsons :: Les Simpson générique
Les Tortues Ninja|Tortues Ninja :: Les Tortues Ninja générique français
Scooby-Doo|Scooby Doo :: Scooby-Doo générique
Tom et Jerry|Tom & Jerry :: Tom et Jerry générique
Bisounours :: Bisounours générique
Il était une fois... la Vie|Il était une fois la vie :: Il était une fois la vie générique
Spirou :: Spirou générique dessin animé
Lady Oscar :: Lady Oscar générique
Cédric|Cedric :: Cédric générique dessin animé
Les Mystérieuses Cités d'or|Cités d'or :: Les mystérieuses cités d'or générique
Pat' Patrouille|Pat Patrouille :: Pat Patrouille générique
Miraculous :: Miraculous Ladybug générique français
Peppa Pig :: Peppa Pig générique
Oui-Oui|Oui Oui :: Oui-Oui générique
Les Schtroumpfs|Schtroumpfs :: Les Schtroumpfs générique
`});

cat({ id: 'disney', name: 'Disney en VF', emoji: '🏰', group: 'Écrans', kind: 'work', label: 'Nom du film Disney', items: `
La Reine des neiges|Frozen :: Libérée délivrée Anaïs Delva
La Reine des neiges 2|Frozen 2 :: Dans un autre monde La reine des neiges 2
Le Roi lion :: Hakuna Matata Le Roi Lion
Aladdin :: Ce rêve bleu Aladdin
La Petite Sirène :: Sous l'océan La petite sirène
La Belle et la Bête :: Histoire éternelle La belle et la bête
Le Livre de la jungle :: Il en faut peu pour être heureux
Vaiana|Moana :: Le bleu lumière Vaiana
Encanto :: Ne parlons pas de Bruno
Raiponce :: Où est la vraie vie Raiponce
Mulan :: Comme un homme Mulan
Hercule :: De zéro en héros Hercule
Pocahontas :: L'air du vent Pocahontas
Tarzan :: Toujours dans mon cœur Phil Collins
Toy Story :: Je suis ton ami Toy Story
Coco :: Ne m'oublie pas Coco
Les Aristochats :: Tout le monde veut devenir un cat
Le Bossu de Notre-Dame :: Les cloches de Notre-Dame Bossu
Cendrillon :: Bibbidi Bobbidi Boo Cendrillon
Mary Poppins :: Supercalifragilisticexpialidocious
Blanche-Neige :: Heigh-Ho Blanche-Neige sept nains
Zootopie|Zootopia :: Try Everything Shakira
High School Musical :: Breaking Free High School Musical
Ratatouille :: Le Festin Camille
Lilo et Stitch :: Hawaiian Roller Coaster Ride Lilo Stitch
Le Roi lion|Roi lion :: L'histoire de la vie Le Roi Lion
Aladdin :: Prince Ali Aladdin
La Petite Sirène|Petite Sirène :: Partir là-bas La Petite Sirène
Le Livre de la jungle|Livre de la jungle :: Être un homme comme vous
Hercule :: Je n'dirai pas que je l'aime Hercule
Mulan :: Réflexion Mulan
Peter Pan :: Tu t'envoles Peter Pan
Les 101 Dalmatiens|101 Dalmatiens :: Cruella d'Enfer
Robin des Bois :: Oo-de-lally Robin des Bois
Dumbo :: Quand je vois un éléphant voler
Pinocchio :: Quand on prie la bonne étoile
Wish :: Un vœu Wish Disney
La Princesse et la Grenouille|Princesse et la Grenouille :: Au bout du rêve Anika Noni Rose
Là-haut|La-haut :: Married Life Michael Giacchino
Le Monde de Nemo|Nemo :: Nemo Egg Thomas Newman
Les Indestructibles|Indestructibles :: The Incredits Michael Giacchino
Monstres et Cie|Monstres et compagnie :: If I Didn't Have You Monstres
Vice-versa|Inside Out :: Bundle of Joy Michael Giacchino
`});

cat({ id: 'films', name: 'Musiques de films', emoji: '🎬', group: 'Écrans', kind: 'work', label: 'Nom du film', items: `
Star Wars :: Star Wars Main Title John Williams
Indiana Jones :: Raiders March John Williams
Jurassic Park :: Jurassic Park theme John Williams
Harry Potter :: Hedwig's Theme John Williams
Le Seigneur des anneaux|Seigneur des anneaux :: Concerning the Hobbits Howard Shore
Pirates des Caraïbes :: He's a Pirate Klaus Badelt
Titanic :: My Heart Will Go On Celine Dion
Retour vers le futur :: Back to the Future theme Alan Silvestri
Gladiator :: Now We Are Free Hans Zimmer
Inception :: Time Hans Zimmer Inception
Interstellar :: Interstellar Main Theme Hans Zimmer
Le Parrain :: Godfather theme Nino Rota
Les Dents de la mer|Jaws :: Jaws theme John Williams
Rocky :: Gonna Fly Now Bill Conti
Top Gun :: Danger Zone Kenny Loggins
SOS Fantômes|Ghostbusters :: Ghostbusters Ray Parker Jr
Mission impossible :: Mission Impossible theme Lalo Schifrin
James Bond :: James Bond Theme Monty Norman
Le Fabuleux Destin d'Amélie Poulain|Amélie Poulain|Amelie :: Comptine d'un autre été Yann Tiersen
Intouchables :: Fly Ludovico Einaudi
Pulp Fiction :: Misirlou Dick Dale
Kill Bill :: Battle Without Honor or Humanity Tomoyasu Hotei
Grease :: You're the One That I Want Grease
Dirty Dancing :: Time of My Life Bill Medley
La La Land :: City of Stars La La Land
The Greatest Showman :: This Is Me Keala Settle
Le Bon, la Brute et le Truand|Le bon la brute et le truand :: The Good the Bad and the Ugly Ennio Morricone
Il était une fois dans l'Ouest :: Man with a Harmonica Ennio Morricone
Les Choristes :: Vois sur ton chemin Les Choristes
Terminator :: Terminator 2 theme Brad Fiedel
Matrix :: Clubbed to Death Rob Dougan
E.T. :: E.T. Flying Theme John Williams
Superman :: Superman March John Williams
Avengers :: The Avengers theme Alan Silvestri
Shrek :: All Star Smash Mouth
Requiem for a Dream :: Lux Aeterna Clint Mansell
Forrest Gump :: Forrest Gump Suite Alan Silvestri
Le Roi lion :: Circle of Life Elton John
Pirates des Caraïbes :: Davy Jones Hans Zimmer
Harry Potter :: Harry Potter Prologue John Williams
Le Seigneur des anneaux|Seigneur des anneaux :: The Breaking of the Fellowship
Le Grand Bleu :: Le Grand Bleu Eric Serra
Les Bronzés font du ski|Bronzés :: Quand te reverrai-je Les bronzés font du ski
La Boum :: Reality Richard Sanderson
Le Professionnel :: Chi Mai Ennio Morricone
Bienvenue chez les Ch'tis|Ch'tis :: Bienvenue chez les Ch'tis Philippe Rombi
Les Visiteurs :: Les Visiteurs Eric Levi
Avatar :: I See You Leona Lewis
Hunger Games :: The Hanging Tree James Newton Howard
Twilight :: Decode Paramore
Batman :: The Dark Knight Why So Serious Hans Zimmer
Pirates des Caraïbes|Pirates des Caraibes :: Up Is Down Hans Zimmer
Les Gardiens de la Galaxie|Gardiens de la Galaxie :: Hooked on a Feeling Blue Swede
Top Gun|Top Gun Maverick :: Take My Breath Away Berlin
Footloose :: Footloose Kenny Loggins
Flashdance :: Flashdance What a Feeling Irene Cara
Le Flic de Beverly Hills|Beverly Hills Cop :: Axel F Harold Faltermeyer
Oppenheimer :: Can You Hear the Music Ludwig Göransson
Barbie :: What Was I Made For Billie Eilish
Dune :: Dune Paul's Dream Hans Zimmer
`});

cat({ id: 'series', name: 'Génériques de séries', emoji: '📼', group: 'Écrans', kind: 'work', label: 'Nom de la série', items: `
Friends :: I'll Be There for You The Rembrandts
Game of Thrones :: Game of Thrones Main Title Ramin Djawadi
Stranger Things :: Stranger Things theme Kyle Dixon
Breaking Bad :: Breaking Bad main title theme
Les Simpson|Simpsons :: The Simpsons main title theme
Prison Break :: Prison Break main title
Dr House|House :: Teardrop Massive Attack
Grey's Anatomy :: Cosy in the Rocket Psapp
The Big Bang Theory|Big Bang Theory :: Big Bang Theory theme Barenaked Ladies
Malcolm :: Boss of Me They Might Be Giants
Le Prince de Bel-Air|Prince de Bel Air :: Fresh Prince of Bel-Air theme
Kaamelott :: Kaamelott générique
Scrubs :: Superman Lazlo Bane
Les Experts|CSI :: Who Are You The Who
Charmed :: How Soon Is Now Love Spit Love
Buffy contre les vampires|Buffy :: Buffy the Vampire Slayer theme Nerf Herder
X-Files :: X-Files theme Mark Snow
Twin Peaks :: Twin Peaks theme Angelo Badalamenti
Dexter :: Dexter main title theme
The Office :: The Office theme
Peaky Blinders :: Red Right Hand Nick Cave
La Casa de Papel :: Bella ciao La casa de papel
Squid Game :: Way Back Then Squid Game
Plus belle la vie :: Plus belle la vie générique
Desperate Housewives :: Desperate Housewives theme Danny Elfman
Lost :: Lost main title Michael Giacchino
The Walking Dead :: The Walking Dead main title Bear McCreary
Narcos :: Tuyo Rodrigo Amarante
Doctor Who :: Doctor Who theme
Sherlock :: Sherlock theme David Arnold
Hannah Montana :: The Best of Both Worlds Hannah Montana
Mercredi|Wednesday :: Wednesday main titles Danny Elfman
Gossip Girl :: Gossip Girl theme
Hélène et les garçons :: Hélène et les garçons générique
Sous le soleil :: Sous le soleil générique
Les Frères Scott|One Tree Hill :: I Don't Want to Be Gavin DeGraw
Ma sorcière bien-aimée|Ma sorciere bien aimee :: Ma sorcière bien aimée générique
La Famille Addams|Addams :: La famille Addams générique
Columbo :: Columbo générique
Magnum :: Magnum générique
Mac Gyver|MacGyver :: MacGyver générique
K 2000|Knight Rider :: K 2000 générique
Alerte à Malibu|Baywatch :: Alerte à Malibu générique I'm Always Here
Le Bureau des légendes :: Le bureau des légendes générique
Sex Education :: Sex Education générique
The Crown :: The Crown main title
Bridgerton|La Chronique des Bridgerton :: Bridgerton main title
How I Met Your Mother|HIMYM :: How I Met Your Mother theme Hey Beautiful
The Mandalorian|Mandalorian :: The Mandalorian theme Ludwig Göransson
Euphoria :: Euphoria All for Us Labrinth
Arcane :: Enemy Imagine Dragons
Les Feux de l'amour|Feux de l'amour :: Nadia's Theme
Kaamelott :: Kaamelott thème principal Alexandre Astier
Engrenages :: Engrenages générique
Lupin :: Lupin Netflix générique
Vikings :: If I Had a Heart Fever Ray
True Detective :: Far from Any Road The Handsome Family
Les Sopranos|Sopranos :: Woke Up This Morning Alabama 3
Hartley cœurs à vif|Hartley :: Hartley coeurs à vif générique
Code Quantum :: Code Quantum générique
`});

cat({ id: 'anime', name: 'Animés japonais', emoji: '🍥', group: 'Écrans', kind: 'work', label: 'Nom de l\'animé', items: `
Naruto Shippuden|Naruto :: Blue Bird Ikimono-gakari
Dragon Ball Z|DBZ :: Cha-La Head-Cha-La
One Piece :: We Are One Piece opening
L'Attaque des Titans|Shingeki no Kyojin|Attack on Titan|SNK :: Guren no Yumiya Linked Horizon
Death Note :: The World Nightmare
Fullmetal Alchemist|FMA :: Again YUI
Tokyo Ghoul :: Unravel TK
Demon Slayer|Kimetsu no Yaiba :: Gurenge LiSA
Jujutsu Kaisen :: Kaikai Kitan Eve
My Hero Academia|Boku no Hero :: The Day Porno Graffitti
Sword Art Online|SAO :: Crossing Field LiSA
Neon Genesis Evangelion|Evangelion :: A Cruel Angel's Thesis Yoko Takahashi
Cowboy Bebop :: Tank! Seatbelts
Hunter x Hunter :: Departure Masatoshi Ono
Bleach :: Asterisk Orange Range
Les Chevaliers du Zodiaque|Saint Seiya :: Pegasus Fantasy
Sailor Moon :: Moonlight Densetsu
Code Geass :: Colors FLOW
Chainsaw Man :: KICK BACK Kenshi Yonezu
Spy x Family :: Mixed Nuts Official Hige Dandism
One Punch Man :: The Hero JAM Project
Fairy Tail :: Snow Fairy FUNKIST
Black Clover :: Haruka Mirai Kankaku Piero
Your Name|Kimi no na wa :: Zenzenzense RADWIMPS
Olive et Tom|Captain Tsubasa :: Olive et Tom générique
Haikyuu :: Imagination SPYAIR
Oshi no Ko :: Idol YOASOBI
Frieren :: Yuusha YOASOBI
Mob Psycho 100 :: 99 MOB CHOIR
Dragon Ball Super :: Limit Break x Survivor Dragon Ball Super
Nicky Larson|City Hunter :: Nicky Larson générique
Naruto :: Haruka Kanata Asian Kung-Fu Generation
L'Attaque des Titans|Attaque des Titans :: Shinzou wo Sasageyo
Demon Slayer|Kimetsu no Yaiba :: Zankyou Sanka Aimer
Jujutsu Kaisen :: Specialz King Gnu
Dr. Stone|Dr Stone :: Good Morning World Burnout Syndromes
Blue Lock :: Chaos ga Kiwameru Unison Square Garden
Solo Leveling :: Level Hiroyuki Sawano
Dandadan|Dan Da Dan :: Otonoke Creepy Nuts
Mashle :: Bling-Bang-Bang-Born Creepy Nuts
Pokémon|Pokemon :: Pokémon attrapez-les tous générique
Goldorak :: Goldorak générique
Albator :: Albator générique
Candy :: Candy générique Dorothée
`});

cat({ id: 'jeux-video', name: 'Jeux vidéo', emoji: '🎮', group: 'Écrans', kind: 'work', label: 'Nom du jeu', items: `
Super Mario Bros|Mario :: Super Mario Bros theme Koji Kondo
The Legend of Zelda|Zelda :: Legend of Zelda main theme
Tetris :: Tetris theme Korobeiniki
Sonic the Hedgehog|Sonic :: Green Hill Zone Sonic
Final Fantasy VII|Final Fantasy :: One-Winged Angel Final Fantasy
Halo :: Halo theme Martin O'Donnell
Minecraft :: Sweden C418
Skyrim :: Dragonborn Jeremy Soule
The Witcher 3|The Witcher :: The Witcher 3 Wild Hunt main theme
Street Fighter :: Guile's Theme Street Fighter
Mario Kart :: Mario Kart 8 main theme
Super Smash Bros :: Super Smash Bros Brawl main theme
Assassin's Creed :: Ezio's Family Jesper Kyd
Undertale :: Megalovania Toby Fox
Pac-Man|Pacman :: Pac-Man theme
Doom :: BFG Division Mick Gordon
Animal Crossing :: Animal Crossing New Horizons main theme
League of Legends|LoL :: Legends Never Die League of Legends
Wii Sports :: Wii Sports theme
Mii Channel|Wii :: Mii Channel theme
GTA San Andreas|GTA :: GTA San Andreas theme
Red Dead Redemption 2|Red Dead Redemption :: That's the Way It Is Daniel Lanois
Portal :: Still Alive Portal
Kingdom Hearts :: Simple and Clean Utada Hikaru
Metal Gear Solid :: Metal Gear Solid main theme
Castlevania :: Bloody Tears Castlevania
Crash Bandicoot :: Crash Bandicoot theme
Pokémon Rouge et Bleu|Pokémon|Pokemon :: Pokemon Red Blue opening theme
Fortnite :: Fortnite lobby music
Rayman :: Rayman main theme
Pokémon|Pokemon :: Pokemon Battle Wild Pokemon Red Blue
Sonic :: Sonic 2 Chemical Plant Zone
Final Fantasy :: One-Winged Angel
The Witcher :: Geralt of Rivia Witcher 3 theme
Super Mario 64|Mario 64 :: Super Mario 64 Bob-omb Battlefield
Zelda: Ocarina of Time|Ocarina of Time|Zelda :: Song of Storms
Zelda: Breath of the Wild|Breath of the Wild|Zelda :: Breath of the Wild main theme
Donkey Kong Country|Donkey Kong :: DK Island Swing
Super Mario Galaxy|Mario Galaxy :: Gusty Garden Galaxy
Overwatch :: Overwatch main theme
World of Warcraft|WoW :: Legends of Azeroth
Mass Effect :: Vigil Mass Effect
Dark Souls :: Gwyn Lord of Cinder
Elden Ring :: Elden Ring main theme
God of War :: God of War 2018 main theme Bear McCreary
Celeste :: Resurrections Lena Raine
Hollow Knight :: Hollow Knight Dirtmouth
The Last of Us :: The Last of Us Gustavo Santaolalla
Silent Hill :: Promise Silent Hill 2 Akira Yamaoka
Resident Evil :: Resident Evil safe room save theme
Persona 5|Persona :: Last Surprise Persona 5
Splatoon :: Splattack Splatoon
Gran Turismo :: Moon Over the Castle
Tekken :: Tekken 3 main theme
`});

// ═════════════════════ FRANCOPHONE ═════════════════════
cat({ id: 'hits', name: 'Hits du moment', emoji: '🔥', group: 'Francophone', deezerPlaylist: 1109890291, chartFallback: true });

cat({ id: 'variete', name: 'Variété française', emoji: '🎙️', group: 'Francophone', items: `
Jean-Jacques Goldman — Envole-moi
Jean-Jacques Goldman — Quand la musique est bonne
Michel Sardou — Les lacs du Connemara
Johnny Hallyday — Allumer le feu
France Gall — Ella, elle l'a
Daniel Balavoine — L'Aziza
Indochine — L'aventurier
Téléphone — Un autre monde
Céline Dion — Pour que tu m'aimes encore
Francis Cabrel — Je l'aime à mourir
Renaud — Mistral gagnant
Michel Berger — Le paradis blanc
Mylène Farmer — Désenchantée
Patrick Bruel — Casser la voix
Michel Polnareff — On ira tous au paradis
Alain Souchon — Foule sentimentale
Laurent Voulzy — Rockollection
Patricia Kaas — Mon mec à moi
Étienne Daho — Week-end à Rome
Les Rita Mitsouko — Marcia Baila
Kyo — Le chemin
Calogero — En apesanteur
Christophe Maé — Il est où le bonheur
Zazie — Je suis un homme
Pascal Obispo — Lucie
Louane — Avenir
Vianney — Je m'en vais
Kendji Girac — Color Gitano
Julien Clerc — Ma préférence
Véronique Sanson — Chanson sur ma drôle de vie
Gérald De Palmas — Sur la route
Louise Attaque — J't'emmène au vent
Noir Désir — Le vent nous portera
Desireless — Voyage voyage
Jean-Louis Aubert — Temps à nouveau
Jean-Jacques Goldman — Je te donne
Daniel Balavoine — Le chanteur
Michel Berger — Seras-tu là
Jean-Louis Aubert — Voilà c'est fini
Florent Pagny — Savoir aimer
William Sheller — Un homme heureux
Michel Fugain — Une belle histoire
`});

cat({ id: 'rap-fr', name: 'Rap français', emoji: '🎤', group: 'Francophone', items: `
IAM — Je danse le mia
Suprême NTM — Ma Benz
MC Solaar — Caroline
Booba — DKR
Booba — Validée
Diam's — La boulette
Sexion d'Assaut — Désolé
Orelsan — Basique
Nekfeu — On verra
PNL — Au DD
Jul — Tchikita
Jul — Bande organisée
Ninho — Lettre à une femme
Damso — Macarena
Soprano — Cosmo
Gims — Bella
Rohff — La puissance
Psy 4 de la Rime — Le son des bandits
Sniper — Gravé dans la roche
113 — Tonton du bled
Fonky Family — Art de rue
Oxmo Puccino — L'enfant seul
Kery James — Banlieusards
Disiz — J'pète les plombs
Bigflo & Oli — Dommage
Vald — Désaccordé
Niska — Réseaux
MHD — Afro Trap Part. 3 (Champions League)
Gazo — Die
Tiakola — Meuda
Kaaris — Zoo
Lacrim — Oh bah oui
SCH — Champs-Élysées
NTM — La fièvre
Soprano — Clown
Lomepal — Trop beau
Aya Nakamura — Djadja
Diam's — DJ
IAM — Petit frère
IAM — Demain c'est loin
Suprême NTM — Seine-Saint-Denis Style
MC Solaar — Bouge de là
Booba — Mona Lisa
Booba — Pitbull
PNL — Le monde ou rien
PNL — Deux frères
Nekfeu — Ma dope
Orelsan — La terre est ronde
Orelsan — Tout va bien
Ninho — Jefe
Ninho — Goutte d'eau
Naps — La kiffance
Heuss l'Enfoiré — Khapta
Freeze Corleone — Freeze Raël
La Fouine — Ma meilleure
Youssoupha — Dreamin
Médine — Grand Paris
Saïan Supa Crew — Angela
Ärsenik — Boxe avec les mots
`});

cat({ id: 'pop-fr', name: 'Pop française', emoji: '🥖', group: 'Francophone', items: `
Stromae — Alors on danse
Stromae — Papaoutai
Angèle — Balance ton quoi
Angèle — Tout oublier
Clara Luciani — La grenade
Clara Luciani — Le reste
Louane — Jour 1
Indila — Dernière danse
Zaz — Je veux
Christine and the Queens — Saint Claude
Julien Doré — Paris-Seychelles
Vianney — Pas là
Amir — J'ai cherché
Kendji Girac — Andalouse
Gims — Sapés comme jamais
Gims — Est-ce que tu m'aimes ?
Black M — Sur ma route
Juliette Armanet — Le dernier jour du disco
Hoshi — Ta marinière
Eddy de Pretto — Kid
Lomepal — Yeux disent
Aya Nakamura — Djadja
Aya Nakamura — Pookie
M. Pokora — Juste une photo de toi
Shy'm — Et alors !
Tal — Le passé
Bigflo & Oli — Plus tard
Cœur de pirate — Comme des enfants
Jain — Makeba
Vitaa — Avant toi
Santa — Popcorn salé
Pierre Garnier — Ceux qu'on était
Christine and the Queens — Christine
Louane — Avenir
Vianney — Je m'en vais
Julien Doré — Le lac
Pomme — Je sais pas danser
Slimane — Viens on s'aime
M. Pokora — Juste un instant
Louise Attaque — J't'emmène au vent
Angèle — Bruxelles je t'aime
Stromae — Formidable
Stromae — Santé
Clara Luciani — Respire encore
Kendji Girac — Color Gitano
Amir — On dirait
Indila — Tourner dans le vide
Zaz — On ira
Slimane — Mon amour
Pomme — Les cours d'eau
Aya Nakamura — Copines
Nolwenn Leroy — Juste pour me souvenir
Calogero — Un jour au mauvais endroit
M — Je dis aime
Mylène Farmer — Libertine
Jenifer — Notre idylle
Charlotte Cardin — Main Girl
Yseult — Corps
Zaho de Sagazan — La symphonie des éclairs
Joyce Jonathan — Ça ira
`});

cat({ id: 'annees-2000-fr', name: 'Années 2000 FR', emoji: '📀', group: 'Francophone', items: `
Lorie — Près de moi
Alizée — Moi… Lolita
Jenifer — Au soleil
Star Academy — La musique (Angelica)
Yannick Noah — Métisse
Kyo — Dernière danse
Superbus — Butterfly
Corneille — Parce qu'on vient de loin
Diam's — DJ
Diam's — Jeune demoiselle
Christophe Maé — On s'attache
Grégoire — Toi + moi
Raphaël — Caravane
Bénabar — L'effet papillon
Amel Bent — Ma philosophie
Tragédie — Hey Oh
Magic System — Premier Gaou
M. Pokora — Elle me contrôle
Nolwenn Leroy — Cassé
Mickey 3D — Respire
Calogero — Face à la mer
Nâdiya — Et c'est parti
Bob Sinclar — Love Generation
Shy'm — Femme de couleur
-M- — Qui de nous deux
Indochine — J'ai demandé à la lune
Natasha St-Pier — Tu trouveras
Ilona Mitrecey — Un monde parfait
Yelle — À cause des garçons
Vitaa — À fleur de toi
Christophe Willem — Double je
Olivia Ruiz — J'traîne des pieds
Kamini — Marly-Gomont
Sinsemilia — Tout le bonheur du monde
Diam's — La boulette
Kyo — Le chemin
Yannick Noah — Aux arbres citoyens
Matt Pokora — Showbiz
Sinik — Une époque formidable
Mylène Farmer — C'est une belle journée
Bénabar — Le dîner
Les Fatals Picards — L'amour à la française
Lorie — Sur un air latino
Alizée — J'en ai marre !
Amel Bent — Ne retiens pas tes larmes
Superbus — Lola
Christophe Maé — Il est où le bonheur
Grégoire — Rue des étoiles
Yannick Noah — Simon Papa Tara
Tragédie — Sexy pour moi
Corneille — Seul au monde
Jenifer — J'attends l'amour
Mylène Farmer — Dégénération
Raphaël — Ne partons pas fâchés
Magic System — Bouger bouger
Sinik — Le toit du monde
Leslie — Sobri (notre destin)
K-Maro — Femme like U
Mathieu Edward — Un monde à refaire
Hélène Ségara — Il y a trop de gens qui t'aiment
Garou — Seul
Kenza Farah — Lettre du front
Willy Denzey — Le mur du son
Billy Crawford — Trackin'
`});

cat({ id: 'retro-fr', name: 'Chanson rétro', emoji: '🎩', group: 'Francophone', items: `
Édith Piaf — Non, je ne regrette rien
Édith Piaf — La vie en rose
Charles Aznavour — Emmenez-moi
Charles Aznavour — La bohème
Jacques Brel — Ne me quitte pas
Jacques Brel — Amsterdam
Georges Brassens — Les copains d'abord
Serge Gainsbourg — Le poinçonneur des Lilas
Françoise Hardy — Tous les garçons et les filles
Sylvie Vartan — La plus belle pour aller danser
Johnny Hallyday — Retiens la nuit
Dalida — Laissez-moi danser
Dalida — Paroles paroles
Claude François — Alexandrie Alexandra
Claude François — Comme d'habitude
Joe Dassin — L'été indien
Joe Dassin — Les Champs-Élysées
Jacques Dutronc — Il est cinq heures, Paris s'éveille
France Gall — Poupée de cire, poupée de son
Sheila — L'école est finie
Nino Ferrer — Le Sud
Michel Delpech — Pour un flirt
Mike Brant — Laisse-moi t'aimer
Gilbert Bécaud — Et maintenant
Yves Montand — Les feuilles mortes
Bourvil — Salade de fruits
Henri Salvador — Le lion est mort ce soir
Charles Trenet — La mer
Barbara — L'aigle noir
Christophe — Aline
Hugues Aufray — Céline
Jean Ferrat — La montagne
Enrico Macias — Les filles de mon pays
Michel Fugain — Une belle histoire
Serge Gainsbourg — La javanaise
Boby Lapointe — Ta Katie t'a quitté
Sacha Distel — Scoubidou
Hugues Aufray — Santiano
Bourvil — La tactique du gendarme
Charles Aznavour — For me formidable
Charles Aznavour — Hier encore
Jacques Brel — Quand on n'a que l'amour
Jacques Brel — Les bonbons
Georges Brassens — La mauvaise réputation
Serge Gainsbourg — Je t'aime... moi non plus
Serge Gainsbourg — Comic Strip
Françoise Hardy — Le temps de l'amour
Johnny Hallyday — Noir c'est noir
Eddy Mitchell — La dernière séance
Claude François — Le téléphone pleure
Claude François — Belles belles belles
Dalida — Gigi l'amoroso
Dalida — Bambino
Joe Dassin — Et si tu n'existais pas
Joe Dassin — Salut les amoureux
Jacques Dutronc — Et moi, et moi, et moi
Sheila — Les rois mages
Mireille Mathieu — Mille colombes
Nana Mouskouri — Le temps des cerises
Juliette Gréco — Déshabillez-moi
Boris Vian — Le déserteur
Annie Cordy — La bonne du curé
Marcel Amont — Le mexicain
Antoine — Les élucubrations d'Antoine
Michel Polnareff — Love Me, Please Love Me
Serge Reggiani — Il suffirait de presque rien
Jean Sablon — Vous qui passez sans me voir
`});

// ═════════════════════ DÉCENNIES ═════════════════════
cat({ id: '70s', name: 'Années 70', emoji: '🕺', group: 'Décennies', items: `
ABBA — Dancing Queen
Queen — Bohemian Rhapsody
Bee Gees — Stayin' Alive
Gloria Gaynor — I Will Survive
Boney M. — Rasputin
Eagles — Hotel California
Earth, Wind & Fire — September
Village People — Y.M.C.A.
Led Zeppelin — Stairway to Heaven
Pink Floyd — Another Brick in the Wall, Pt. 2
Elton John — Rocket Man
David Bowie — Heroes
Fleetwood Mac — Dreams
Stevie Wonder — Superstition
Donna Summer — Hot Stuff
Chic — Le Freak
The Jackson 5 — ABC
Lynyrd Skynyrd — Sweet Home Alabama
Supertramp — The Logical Song
Blondie — Heart of Glass
Michael Jackson — Don't Stop 'Til You Get Enough
The Clash — London Calling
Ramones — Blitzkrieg Bop
Carl Douglas — Kung Fu Fighting
AC/DC — Highway to Hell
Bob Marley & The Wailers — No Woman, No Cry
Barry White — You're the First, the Last, My Everything
John Lennon — Imagine
Kiss — I Was Made for Lovin' You
Elton John — Crocodile Rock
Donna Summer — I Feel Love
Pink Floyd — Another Brick in the Wall
The Jackson 5 — I Want You Back
ABBA — Mamma Mia
ABBA — Waterloo
ABBA — Gimme! Gimme! Gimme! (A Man After Midnight)
Bee Gees — Night Fever
Bee Gees — How Deep Is Your Love
Queen — Killer Queen
Elton John — Your Song
Rod Stewart — Da Ya Think I'm Sexy?
The Rolling Stones — Angie
Led Zeppelin — Whole Lotta Love
Deep Purple — Smoke on the Water
Marvin Gaye — What's Going On
Al Green — Let's Stay Together
The Doobie Brothers — Long Train Runnin'
Electric Light Orchestra — Mr. Blue Sky
Steely Dan — Do It Again
Boney M. — Daddy Cool
Boney M. — Rivers of Babylon
Baccara — Yes Sir, I Can Boogie
Hot Chocolate — You Sexy Thing
Patrick Hernandez — Born to Be Alive
The Police — Roxanne
Sex Pistols — God Save the Queen
Bruce Springsteen — Born to Run
`});

cat({ id: '80s', name: 'Années 80', emoji: '📼', group: 'Décennies', items: `
Michael Jackson — Billie Jean
Madonna — Like a Virgin
a-ha — Take On Me
Queen — Another One Bites the Dust
Toto — Africa
Europe — The Final Countdown
Bon Jovi — Livin' on a Prayer
Cyndi Lauper — Girls Just Want to Have Fun
Whitney Houston — I Wanna Dance with Somebody (Who Loves Me)
Wham! — Wake Me Up Before You Go-Go
Survivor — Eye of the Tiger
Rick Astley — Never Gonna Give You Up
Prince — Purple Rain
Tears for Fears — Everybody Wants to Rule the World
Dire Straits — Money for Nothing
Eurythmics — Sweet Dreams (Are Made of This)
The Police — Every Breath You Take
Duran Duran — Hungry Like the Wolf
Kim Wilde — Kids in America
Pet Shop Boys — West End Girls
Depeche Mode — Just Can't Get Enough
Kenny Loggins — Footloose
Irene Cara — Flashdance... What a Feeling
Bonnie Tyler — Total Eclipse of the Heart
Guns N' Roses — Sweet Child O' Mine
U2 — With or Without You
Simple Minds — Don't You (Forget About Me)
Lionel Richie — All Night Long (All Night)
Culture Club — Karma Chameleon
Kool & The Gang — Celebration
Whitney Houston — I Wanna Dance with Somebody
Kim Wilde — Cambodia
Eurythmics — Sweet Dreams
Pat Benatar — Love Is a Battlefield
Desireless — Voyage voyage
Images — Les démons de minuit
Michael Jackson — Beat It
Michael Jackson — Thriller
Madonna — Material Girl
Madonna — La Isla Bonita
Prince — Kiss
Queen — Under Pressure
Queen — Radio Ga Ga
Kim Carnes — Bette Davis Eyes
The Human League — Don't You Want Me
Soft Cell — Tainted Love
Depeche Mode — Enjoy the Silence
New Order — Blue Monday
Spandau Ballet — True
Phil Collins — In the Air Tonight
Starship — We Built This City
Van Halen — Jump
Joan Jett & The Blackhearts — I Love Rock 'n' Roll
Kajagoogoo — Too Shy
Men at Work — Down Under
Billy Idol — White Wedding
Frankie Goes to Hollywood — Relax
Rick Astley — Together Forever
Kylie Minogue — The Loco-Motion
`});

cat({ id: '90s', name: 'Années 90', emoji: '💿', group: 'Décennies', items: `
Nirvana — Smells Like Teen Spirit
Spice Girls — Wannabe
Backstreet Boys — I Want It That Way
Britney Spears — ...Baby One More Time
Oasis — Wonderwall
Haddaway — What Is Love
Ace of Base — All That She Wants
Eiffel 65 — Blue (Da Ba Dee)
Aqua — Barbie Girl
Coolio — Gangsta's Paradise
TLC — No Scrubs
Whitney Houston — I Will Always Love You
Los del Rio — Macarena
Lou Bega — Mambo No. 5 (A Little Bit of...)
Alanis Morissette — Ironic
The Cranberries — Zombie
R.E.M. — Losing My Religion
Red Hot Chili Peppers — Californication
Ricky Martin — Livin' la Vida Loca
Vengaboys — Boom, Boom, Boom, Boom!!
Shania Twain — Man! I Feel Like a Woman!
Dr. Alban — It's My Life
2 Unlimited — No Limit
Scatman John — Scatman (ski-ba-bop-ba-dop-bop)
Fugees — Killing Me Softly With His Song
No Doubt — Don't Speak
Will Smith — Men in Black
Snap! — Rhythm Is a Dancer
Blur — Song 2
Radiohead — Creep
Las Ketchup — Asereje
MC Hammer — U Can't Touch This
Vanilla Ice — Ice Ice Baby
Mariah Carey — Fantasy
Celine Dion — My Heart Will Go On
Bryan Adams — (Everything I Do) I Do It for You
Prince — The Most Beautiful Girl in the World
Madonna — Vogue
Michael Jackson — Black or White
Bon Jovi — Always
Seal — Kiss from a Rose
Natalie Imbruglia — Torn
Savage Garden — Truly Madly Deeply
Hanson — MMMBop
Backstreet Boys — Everybody (Backstreet's Back)
NSYNC — Bye Bye Bye
Spice Girls — Say You'll Be There
La Bouche — Be My Lover
Corona — The Rhythm of the Night
Culture Beat — Mr. Vain
Gala — Freed from Desire
Robert Miles — Children
Mr. President — Coco Jamboo
Boyz II Men — End of the Road
Chumbawamba — Tubthumping
Cher — Believe
Fatboy Slim — The Rockafeller Skank
`});

cat({ id: '2000s', name: 'Années 2000', emoji: '📱', group: 'Décennies', items: `
Eminem — Without Me
Beyoncé — Crazy In Love
OutKast — Hey Ya!
Britney Spears — Toxic
The Black Eyed Peas — I Gotta Feeling
Lady Gaga — Poker Face
Rihanna — Umbrella
Shakira — Hips Don't Lie
Amy Winehouse — Rehab
Gnarls Barkley — Crazy
Linkin Park — In the End
The Killers — Mr. Brightside
Coldplay — Viva la Vida
Kanye West — Stronger
Nelly Furtado — Promiscuous
Justin Timberlake — SexyBack
Daft Punk — One More Time
Usher — Yeah!
50 Cent — In da Club
Avril Lavigne — Complicated
Katy Perry — I Kissed a Girl
Kylie Minogue — Can't Get You out of My Head
Las Ketchup — The Ketchup Song (Aserejé)
O-Zone — Dragostea Din Tei
James Blunt — You're Beautiful
Gwen Stefani — Hollaback Girl
Kelly Clarkson — Since U Been Gone
Leona Lewis — Bleeding Love
Sean Paul — Get Busy
Akon — Lonely
Daniel Powter — Bad Day
Nelly — Dilemma
Eminem — Lose Yourself
Black Eyed Peas — Where Is the Love?
Shakira — Whenever, Wherever
Christina Aguilera — Genie in a Bottle
Christina Aguilera — Dirrty
Pink — Get the Party Started
Destiny's Child — Survivor
Missy Elliott — Work It
Timbaland — Apologize
Mika — Grace Kelly
Kanye West — Gold Digger
Flo Rida — Low
Britney Spears — Womanizer
Lady Gaga — Just Dance
Pussycat Dolls — Don't Cha
Sean Kingston — Beautiful Girls
Akon — Smack That
Chris Brown — With You
T.I. — Whatever You Like
Ciara — Goodies
Fergie — Glamorous
Corinne Bailey Rae — Put Your Records On
Jason Mraz — I'm Yours
Basshunter — Now You're Gone
Eric Prydz — Call on Me
Alice Deejay — Better Off Alone
Kesha — TiK ToK
`});

cat({ id: '2010s', name: 'Années 2010', emoji: '🎧', group: 'Décennies', items: `
Pharrell Williams — Happy
Mark Ronson — Uptown Funk
Adele — Rolling in the Deep
Ed Sheeran — Shape of You
Luis Fonsi — Despacito
Gotye — Somebody That I Used to Know
PSY — Gangnam Style
Carly Rae Jepsen — Call Me Maybe
Avicii — Wake Me Up
Daft Punk — Get Lucky
Bruno Mars — Locked Out of Heaven
Katy Perry — Roar
Taylor Swift — Shake It Off
Imagine Dragons — Believer
The Weeknd — Can't Feel My Face
Justin Bieber — Sorry
LMFAO — Party Rock Anthem
Maroon 5 — Moves Like Jagger
Rihanna — Diamonds
Sia — Chandelier
Major Lazer — Lean On
Calvin Harris — Summer
Billie Eilish — bad guy
Lil Nas X — Old Town Road
Drake — Hotline Bling
Lorde — Royals
Lady Gaga — Shallow
OneRepublic — Counting Stars
Dua Lipa — New Rules
Macklemore & Ryan Lewis — Thrift Shop
Bruno Mars — Just the Way You Are
Bruno Mars — Grenade
Adele — Hello
Ed Sheeran — Thinking Out Loud
Katy Perry — Firework
Katy Perry — Dark Horse
Rihanna — We Found Love
Rihanna — Work
Lady Gaga — Bad Romance
Ariana Grande — 7 rings
Ariana Grande — thank u, next
Taylor Swift — Blank Space
Selena Gomez — Lose You to Love Me
Shawn Mendes — Treat You Better
Camila Cabello — Havana
Post Malone — Circles
The Chainsmokers — Closer
Clean Bandit — Rockabye
Hozier — Take Me to Church
Kygo — Firestone
Ellie Goulding — Love Me Like You Do
Meghan Trainor — All About That Bass
Pitbull — Timber
Wiz Khalifa — See You Again
Imagine Dragons — Radioactive
Twenty One Pilots — Stressed Out
Portugal. The Man — Feel It Still
Sia — Cheap Thrills
Justin Timberlake — Can't Stop the Feeling!
Lewis Capaldi — Someone You Loved
`});

// ═════════════════════ GENRES ═════════════════════
cat({ id: 'rock', name: 'Rock', emoji: '🎸', group: 'Genres', items: `
Queen — We Will Rock You
Queen — Don't Stop Me Now
AC/DC — Back In Black
The Rolling Stones — (I Can't Get No) Satisfaction
Led Zeppelin — Whole Lotta Love
Deep Purple — Smoke on the Water
The Beatles — Come Together
Guns N' Roses — Welcome to the Jungle
Nirvana — Come as You Are
Foo Fighters — Everlong
Red Hot Chili Peppers — Can't Stop
Muse — Uprising
Arctic Monkeys — Do I Wanna Know?
The White Stripes — Seven Nation Army
Green Day — Boulevard of Broken Dreams
Linkin Park — Numb
Bon Jovi — It's My Life
The Who — Baba O'Riley
Pink Floyd — Wish You Were Here
Aerosmith — Dream On
The Clash — Should I Stay or Should I Go
Franz Ferdinand — Take Me Out
The Offspring — The Kids Aren't Alright
Blink-182 — All the Small Things
Kings of Leon — Sex on Fire
The Strokes — Last Nite
Imagine Dragons — Radioactive
Téléphone — Ça (c'est vraiment toi)
Noir Désir — Tostaky
Indochine — 3e sexe
AC/DC — Highway to Hell
Guns N' Roses — Sweet Child O' Mine
Red Hot Chili Peppers — Californication
The Beatles — Hey Jude
Kiss — I Was Made for Lovin' You
Téléphone — Un autre monde
Queen — Bohemian Rhapsody
The Rolling Stones — Paint It Black
The Doors — Light My Fire
Jimi Hendrix — Purple Haze
Led Zeppelin — Immigrant Song
Aerosmith — I Don't Want to Miss a Thing
Bruce Springsteen — Born in the U.S.A.
U2 — With or Without You
U2 — Sunday Bloody Sunday
Pearl Jam — Alive
The Black Keys — Lonely Boy
Queens of the Stone Age — No One Knows
Linkin Park — Somewhere I Belong
Muse — Plug In Baby
Noir Désir — Le vent nous portera
Noir Désir — L'homme pressé
Trust — Antisocial
Louise Attaque — Ton invitation
Shaka Ponk — My Name Is Stain
Blur — Girls & Boys
`});

cat({ id: 'metal', name: 'Metal', emoji: '🤘', group: 'Genres', items: `
Metallica — Enter Sandman
Metallica — Nothing Else Matters
Iron Maiden — The Trooper
Black Sabbath — Paranoid
System Of A Down — Chop Suey!
Rammstein — Du hast
Slipknot — Duality
Linkin Park — Faint
Evanescence — Bring Me To Life
Avenged Sevenfold — Hail to the King
Disturbed — Down with the Sickness
Megadeth — Symphony of Destruction
Slayer — Raining Blood
Pantera — Walk
Rage Against The Machine — Killing In the Name
Korn — Freak on a Leash
Gojira — Stranded
Ozzy Osbourne — Crazy Train
Judas Priest — Breaking the Law
Motörhead — Ace of Spades
Nightwish — Nemo
Sabaton — Primo Victoria
Bring Me The Horizon — Throne
Mötley Crüe — Kickstart My Heart
Deftones — Change (In the House of Flies)
Ghost — Square Hammer
Linkin Park — Numb
Metallica — Master of Puppets
Metallica — One
Iron Maiden — Run to the Hills
Iron Maiden — Fear of the Dark
Black Sabbath — Iron Man
System of a Down — Toxicity
Slipknot — Psychosocial
Rammstein — Sonne
Rammstein — Engel
Dio — Holy Diver
Avenged Sevenfold — Nightmare
Bullet for My Valentine — Tears Don't Fall
Trivium — In Waves
Mastodon — Blood and Thunder
Lamb of God — Redneck
Within Temptation — Ice Queen
Powerwolf — Demons Are a Girl's Best Friend
Alestorm — Drink
Amon Amarth — Guardians of Asgaard
Five Finger Death Punch — Wrong Side of Heaven
Papa Roach — Last Resort
Limp Bizkit — Break Stuff
`});

cat({ id: 'hiphop-us', name: 'Hip-hop US', emoji: '🗽', group: 'Genres', items: `
Eminem — Lose Yourself
Eminem — The Real Slim Shady
Dr. Dre — Still D.R.E.
2Pac — California Love
The Notorious B.I.G. — Juicy
Snoop Dogg — Drop It Like It's Hot
50 Cent — Candy Shop
Kendrick Lamar — HUMBLE.
Kendrick Lamar — Not Like Us
Drake — God's Plan
Travis Scott — SICKO MODE
Kanye West — Gold Digger
Jay-Z — Empire State of Mind
Nelly — Hot In Herre
OutKast — Ms. Jackson
Run-DMC — It's Tricky
Beastie Boys — (You Gotta) Fight For Your Right (To Party)
Wu-Tang Clan — C.R.E.A.M.
Missy Elliott — Get Ur Freak On
Cypress Hill — Insane in the Brain
House of Pain — Jump Around
Post Malone — rockstar
Cardi B — Bodak Yellow
Nicki Minaj — Super Bass
Lil Wayne — Lollipop
Juice WRLD — Lucid Dreams
The Sugarhill Gang — Rapper's Delight
50 Cent — In da Club
Kanye West — Stronger
Nas — N.Y. State of Mind
Lil Nas X — Old Town Road
Eminem — Mockingbird
Eminem — Stan
Dr. Dre — Forgot About Dre
Dr. Dre — The Next Episode
2Pac — Changes
The Notorious B.I.G. — Hypnotize
Kendrick Lamar — Swimming Pools (Drank)
Kendrick Lamar — Alright
Drake — Hotline Bling
Drake — Started from the Bottom
Travis Scott — goosebumps
Kanye West — Heartless
Jay-Z — 99 Problems
Jay-Z — Run This Town
J. Cole — No Role Modelz
Future — Mask Off
Migos — Bad and Boujee
A$AP Rocky — Praise the Lord (Da Shine)
Tyler, The Creator — EARFQUAKE
Mac Miller — Self Care
Coolio — Gangsta's Paradise
DMX — X Gon' Give It to Ya
Ludacris — Move Bitch
Warren G — Regulate
Naughty by Nature — Hip Hop Hooray
Lil Jon & The East Side Boyz — Get Low
Doja Cat — Paint the Town Red
Megan Thee Stallion — Savage
Childish Gambino — This Is America
Eminem — Rap God
`});

cat({ id: 'rnb', name: 'R&B / Soul', emoji: '💜', group: 'Genres', items: `
Aretha Franklin — Respect
Marvin Gaye — Ain't No Mountain High Enough
Stevie Wonder — Isn't She Lovely
Ben E. King — Stand by Me
Otis Redding — (Sittin' On) the Dock of the Bay
Etta James — At Last
Al Green — Let's Stay Together
Bill Withers — Ain't No Sunshine
Chaka Khan — I'm Every Woman
Alicia Keys — Fallin'
Beyoncé — Halo
Destiny's Child — Say My Name
Usher — Burn
Mary J. Blige — Family Affair
Lauryn Hill — Doo Wop (That Thing)
Bruno Mars — That's What I Like
The Weeknd — Blinding Lights
Frank Ocean — Thinking Bout You
SZA — Kill Bill
John Legend — All of Me
Amy Winehouse — Back to Black
James Brown — I Got You (I Feel Good)
Ray Charles — Hit the Road Jack
Sam Cooke — A Change Is Gonna Come
Ne-Yo — So Sick
Craig David — 7 Days
Marvin Gaye — Let's Get It On
Whitney Houston — I Will Always Love You
Usher — U Remind Me
Mariah Carey — We Belong Together
Erykah Badu — On & On
Frank Ocean — Thinkin Bout You
The Weeknd — Earned It
Rihanna — Diamonds
Beyoncé — Irreplaceable
Alicia Keys — No One
Alicia Keys — If I Ain't Got You
Destiny's Child — Bills, Bills, Bills
Aaliyah — Try Again
Brandy & Monica — The Boy Is Mine
Lauryn Hill — Ex-Factor
Ginuwine — Pony
Jagged Edge — Where the Party At
Ashanti — Foolish
Mariah Carey — Fantasy
Chris Brown — Forever
Sade — Smooth Operator
Sade — No Ordinary Love
The Temptations — My Girl
Ray Charles — I Got a Woman
Amy Winehouse — Valerie
Daniel Caesar — Best Part
H.E.R. — Focus
Summer Walker — Girls Need Love
Jorja Smith — Blue Lights
`});

cat({ id: 'electro', name: 'Électro / Dance', emoji: '⚡', group: 'Genres', items: `
David Guetta — Titanium
Daft Punk — Around the World
Avicii — Levels
Swedish House Mafia — Don't You Worry Child
Calvin Harris — Feel So Close
Martin Garrix — Animals
Bob Sinclar — World, Hold On (Children of the Sky)
Modjo — Lady (Hear Me Tonight)
Stardust — Music Sounds Better With You
Benny Benassi — Satisfaction
Eric Prydz — Call On Me
DJ Snake — Turn Down for What
Darude — Sandstorm
Alice Deejay — Better Off Alone
Cascada — Everytime We Touch
Corona — The Rhythm of the Night
Gigi D'Agostino — L'Amour Toujours
Robin Schulz — Prayer in C
Kungs — This Girl
Faithless — Insomnia
The Prodigy — Firestarter
Fatboy Slim — Right Here, Right Now
Justice — D.A.N.C.E.
Disclosure — Latch
Kavinsky — Nightcall
Martin Solveig — Hello
Klingande — Jubel
Mr. Oizo — Flat Beat
Daft Punk — One More Time
Calvin Harris — Summer
Bob Sinclar — Love Generation
The Chemical Brothers — Galvanize
Alan Walker — Faded
Moby — Porcelain
Daft Punk — Harder, Better, Faster, Stronger
David Guetta — When Love Takes Over
David Guetta — Memories
Calvin Harris — This Is What You Came For
Avicii — The Nights
Avicii — Hey Brother
Swedish House Mafia — One (Your Name)
Cassius — Feeling for You
Laurent Garnier — The Man with the Red Face
The Prodigy — Breathe
Eric Prydz — Pjanoo
Deadmau5 — Ghosts 'n' Stuff
Skrillex — Bangarang
Zedd — Clarity
Fred again.. — Marea (We've Lost Dancing)
Kygo — Firestone
Armin van Buuren — This Is What It Feels Like
Tiësto — Adagio for Strings
Gigi D'Agostino — Bla Bla Bla
Basement Jaxx — Where's Your Head At
Daft Punk — Da Funk
`});

cat({ id: 'disco-funk', name: 'Disco / Funk', emoji: '🪩', group: 'Genres', items: `
Chic — Good Times
Bee Gees — Night Fever
Donna Summer — I Feel Love
Gloria Gaynor — Never Can Say Goodbye
Earth, Wind & Fire — Let's Groove
Kool & The Gang — Get Down On It
James Brown — Get Up (I Feel Like Being a) Sex Machine
Parliament — Give Up the Funk (Tear the Roof off the Sucker)
Sister Sledge — We Are Family
ABBA — Gimme! Gimme! Gimme! (A Man After Midnight)
Boney M. — Daddy Cool
Michael Jackson — Rock With You
Cerrone — Supernature
Patrick Hernandez — Born to Be Alive
Sheila & B. Devotion — Spacer
The Trammps — Disco Inferno
KC & The Sunshine Band — That's the Way (I Like It)
Diana Ross — Upside Down
Rick James — Super Freak
Stevie Wonder — Sir Duke
Jamiroquai — Virtual Insanity
Anita Ward — Ring My Bell
Lipps Inc. — Funkytown
The Weather Girls — It's Raining Men
Dua Lipa — Don't Start Now
Kool & the Gang — Celebration
James Brown — I Got You (I Feel Good)
James Brown — Sex Machine
Michael Jackson — Don't Stop 'Til You Get Enough
Gloria Gaynor — I Will Survive
Parliament — Give Up the Funk
Wild Cherry — Play That Funky Music
Donna Summer — Hot Stuff
Village People — In the Navy
Earth, Wind & Fire — Boogie Wonderland
Kool & the Gang — Ladies' Night
Diana Ross — I'm Coming Out
Sylvester — You Make Me Feel (Mighty Real)
Prince — Kiss
Chaka Khan — I'm Every Woman
The Gap Band — Oops Upside Your Head
Zapp — More Bounce to the Ounce
Shalamar — A Night to Remember
Cheryl Lynn — Got to Be Real
The Jacksons — Can You Feel It
Daft Punk — Get Lucky
Dua Lipa — Physical
Bruno Mars — 24K Magic
Jamiroquai — Cosmic Girl
Ottawan — D.I.S.C.O.
`});

cat({ id: 'reggae', name: 'Reggae', emoji: '🇯🇲', group: 'Genres', items: `
Bob Marley & The Wailers — Is This Love
Bob Marley & The Wailers — Could You Be Loved
Bob Marley & The Wailers — Three Little Birds
Peter Tosh — Legalize It
Jimmy Cliff — The Harder They Come
UB40 — Red Red Wine
Toots & The Maytals — 54-46 Was My Number
Damian Marley — Welcome to Jamrock
Sean Paul — Temperature
Shaggy — It Wasn't Me
Shaggy — Boombastic
Inner Circle — Bad Boys
Alpha Blondy — Brigadier Sabari
Tiken Jah Fakoly — Plus rien ne m'étonne
Pierpoljak — Je sais pas jouer
Danakil — Marley
Tryo — L'hymne de nos campagnes
Matisyahu — King Without a Crown
Chronixx — Here Comes Trouble
Gregory Isaacs — Night Nurse
Desmond Dekker — Israelites
Ziggy Marley — Tomorrow People
Bob Marley & The Wailers — Jamming
Jimmy Cliff — I Can See Clearly Now
Toots and the Maytals — Pressure Drop
Alpha Blondy — Jerusalem
Dub Inc — Rude Boy
Bob Marley & The Wailers — One Love
Bob Marley & The Wailers — Get Up, Stand Up
Bob Marley & The Wailers — Buffalo Soldier
Bob Marley & The Wailers — Redemption Song
Bob Marley & The Wailers — Waiting in Vain
UB40 — Kingston Town
UB40 — Can't Help Falling in Love
Shaggy — Angel
Sean Paul — No Lie
Sean Paul — She Doesn't Mind
Eddy Grant — Electric Avenue
Ini Kamoze — Here Comes the Hotstepper
Musical Youth — Pass the Dutchie
Steel Pulse — Your House
Burning Spear — Marcus Garvey
Max Romeo — Chase the Devil
Junior Kelly — Love So Nice
Koffee — Toast
Nneka — Heartbeat
Sinsemilia — Tout le bonheur du monde
`});

cat({ id: 'jazz', name: 'Jazz', emoji: '🎷', group: 'Genres', items: `
Louis Armstrong — What a Wonderful World
The Dave Brubeck Quartet — Take Five
Miles Davis — So What
John Coltrane — Giant Steps
Duke Ellington — Take the "A" Train
Ella Fitzgerald — Summertime
Nina Simone — Feeling Good
Frank Sinatra — Fly Me to the Moon
Billie Holiday — Strange Fruit
Glenn Miller — In the Mood
Benny Goodman — Sing, Sing, Sing
Herbie Hancock — Cantaloupe Island
Chet Baker — My Funny Valentine
Thelonious Monk — 'Round Midnight
Art Blakey & The Jazz Messengers — Moanin'
Cab Calloway — Minnie the Moocher
Norah Jones — Don't Know Why
Michael Bublé — Feeling Good
Stan Getz — The Girl from Ipanema
Django Reinhardt — Minor Swing
Sidney Bechet — Petite fleur
Nat King Cole — L-O-V-E
Ray Charles — Georgia on My Mind
John Coltrane — My Favorite Things
Etta James — At Last
Louis Armstrong — Hello, Dolly!
Louis Armstrong — La vie en rose
Frank Sinatra — My Way
Frank Sinatra — Strangers in the Night
Ella Fitzgerald — Dream a Little Dream of Me
Nina Simone — My Baby Just Cares for Me
Nina Simone — Sinnerman
Dizzy Gillespie — A Night in Tunisia
Bill Evans — Waltz for Debby
Peggy Lee — Fever
Sarah Vaughan — Misty
Count Basie — One O'Clock Jump
Diana Krall — The Look of Love
Gregory Porter — Liquid Spirit
Wes Montgomery — Bumpin' on Sunset
Ahmad Jamal — Poinciana
Michel Petrucciani — Looking Up
Stéphane Grappelli — Nuages
Vince Guaraldi Trio — Linus and Lucy
`});

cat({ id: 'classique', name: 'Classique', emoji: '🎻', group: 'Genres', allowCovers: true, items: `
Beethoven — Symphonie n°5 :: Beethoven Symphony No. 5 Allegro con brio
Beethoven — Lettre à Élise :: Beethoven Für Elise
Mozart — Une petite musique de nuit :: Mozart Eine kleine Nachtmusik
Mozart — Requiem : Lacrimosa :: Mozart Requiem Lacrimosa
Vivaldi — Les Quatre Saisons : Le Printemps :: Vivaldi Spring Allegro Four Seasons
Bach — Toccata et fugue en ré mineur :: Bach Toccata and Fugue in D minor
Tchaïkovski — Le Lac des cygnes :: Tchaikovsky Swan Lake Scene
Tchaïkovski — Casse-Noisette : Danse de la Fée Dragée :: Dance of the Sugar Plum Fairy
Grieg — Dans l'antre du roi de la montagne :: Grieg In the Hall of the Mountain King
Orff — Carmina Burana : O Fortuna :: Carmina Burana O Fortuna
Wagner — La Chevauchée des Walkyries :: Wagner Ride of the Valkyries
Bizet — Carmen : L'amour est un oiseau rebelle :: Carmen Habanera
Ravel — Boléro :: Ravel Bolero
Debussy — Clair de lune :: Debussy Clair de lune
Satie — Gymnopédie n°1 :: Satie Gymnopedie No. 1
Pachelbel — Canon en ré :: Pachelbel Canon in D
Verdi — La Traviata : Libiamo :: Libiamo ne' lieti calici
Puccini — Turandot : Nessun dorma :: Nessun dorma Pavarotti
Strauss — Le Beau Danube bleu :: Strauss Blue Danube
Saint-Saëns — Le Carnaval des animaux : Aquarium :: Saint-Saens Carnival of the Animals Aquarium
Rossini — Guillaume Tell : Ouverture :: Rossini William Tell Overture Finale
Offenbach — Orphée aux enfers : French cancan :: Offenbach Orpheus in the Underworld Can-Can
Chopin — Nocturne op. 9 n°2 :: Chopin Nocturne Op. 9 No. 2
Dvořák — Symphonie du Nouveau Monde :: Dvorak New World Symphony Allegro con fuoco
Haendel — Le Messie : Alléluia :: Handel Messiah Hallelujah
Elgar — Pomp and Circumstance :: Elgar Pomp and Circumstance March No. 1
Barber — Adagio pour cordes :: Barber Adagio for Strings
Khatchatourian — Danse du sabre :: Khachaturian Sabre Dance
Delibes — Lakmé : Duo des fleurs :: Lakme Flower Duet
Ludwig van Beethoven — Für Elise
Wolfgang Amadeus Mozart — Eine kleine Nachtmusik :: Mozart Eine kleine Nachtmusik Allegro
Antonio Vivaldi — Les Quatre Saisons : L'Hiver :: Vivaldi Winter Four Seasons
Carl Orff — O Fortuna :: Carmina Burana O Fortuna
Georges Bizet — Carmen : Habanera :: Carmen Habanera Bizet
Giuseppe Verdi — La traviata : Brindisi :: Libiamo ne' lieti calici
Jacques Offenbach — French cancan :: Offenbach Galop infernal Orphée aux enfers
Camille Saint-Saëns — Danse macabre :: Saint-Saëns Danse macabre
Giacomo Puccini — Nessun dorma :: Nessun dorma Pavarotti
Wolfgang Amadeus Mozart — La Flûte enchantée : Air de la Reine de la nuit :: Queen of the Night aria Mozart
Wolfgang Amadeus Mozart — Marche turque :: Mozart Rondo alla turca
Ludwig van Beethoven — Symphonie n° 9 : Ode à la joie :: Beethoven Symphony 9 Ode to Joy
Ludwig van Beethoven — Sonate au clair de lune :: Moonlight Sonata Beethoven
Johann Sebastian Bach — Suite pour violoncelle n° 1 : Prélude :: Bach Cello Suite No 1 Prelude
Johann Sebastian Bach — Air sur la corde de sol :: Bach Air on the G String
Georg Friedrich Haendel — Alléluia (Le Messie) :: Handel Messiah Hallelujah
Georg Friedrich Haendel — Sarabande :: Handel Sarabande
Pyotr Ilyich Tchaikovsky — Concerto pour piano n° 1 :: Tchaikovsky Piano Concerto No 1
Giuseppe Verdi — Nabucco : Va, pensiero :: Va pensiero Nabucco
Gustav Holst — Les Planètes : Mars :: Holst Mars the Bringer of War
Modeste Moussorgski — Une nuit sur le mont Chauve :: Night on Bald Mountain
Johannes Brahms — Danse hongroise n° 5 :: Brahms Hungarian Dance No 5
Franz Schubert — Ave Maria :: Schubert Ave Maria
Felix Mendelssohn — Marche nuptiale :: Mendelssohn Wedding March
Sergueï Prokofiev — Roméo et Juliette : Danse des chevaliers :: Dance of the Knights Prokofiev
Jules Massenet — Méditation de Thaïs :: Meditation Thais Massenet
`});

cat({ id: 'country', name: 'Country', emoji: '🤠', group: 'Genres', items: `
Johnny Cash — Ring of Fire
Dolly Parton — Jolene
Kenny Rogers — The Gambler
John Denver — Take Me Home, Country Roads
Shania Twain — You're Still the One
Willie Nelson — On the Road Again
Garth Brooks — Friends in Low Places
Taylor Swift — Love Story
Carrie Underwood — Before He Cheats
Billy Ray Cyrus — Achy Breaky Heart
Luke Combs — Fast Car
Morgan Wallen — Last Night
Zach Bryan — Something in the Orange
Patsy Cline — Crazy
Glen Campbell — Rhinestone Cowboy
Lady A — Need You Now
Beyoncé — TEXAS HOLD 'EM
Tim McGraw — Live Like You Were Dying
Johnny Cash — Folsom Prison Blues
Dolly Parton — 9 to 5
Lil Nas X — Old Town Road
Dolly Parton — Islands in the Stream
Johnny Cash — Hurt
Johnny Cash — I Walk the Line
Hank Williams — Your Cheatin' Heart
Waylon Jennings — Mammas Don't Let Your Babies Grow Up to Be Cowboys
Tammy Wynette — Stand by Your Man
Brooks & Dunn — Boot Scootin' Boogie
Faith Hill — Breathe
Florida Georgia Line — Cruise
Kacey Musgraves — Rainbow
Chris Stapleton — Tennessee Whiskey
Dixie Chicks — Wide Open Spaces
Rascal Flatts — Life Is a Highway
Keith Urban — Somebody Like You
Kenny Chesney — When the Sun Goes Down
Blake Shelton — God's Country
Shaboozey — A Bar Song (Tipsy)
Post Malone — I Had Some Help
Jason Aldean — Dirt Road Anthem
Alan Jackson — Chattahoochee
`});

// ═════════════════════ MONDE ═════════════════════
cat({ id: 'latino', name: 'Latino', emoji: '💃', group: 'Monde', items: `
Daddy Yankee — Gasolina
J Balvin — Mi Gente
Shakira — La Tortura
Enrique Iglesias — Bailando
Bad Bunny — Tití Me Preguntó
Bad Bunny — DÁKITI
Ricky Martin — La Copa de la Vida
Marc Anthony — Vivir Mi Vida
Gipsy Kings — Bamboléo
Santana — Oye Como Va
Celia Cruz — La Vida Es un Carnaval
Buena Vista Social Club — Chan Chan
Rosalía — DESPECHÁ
Karol G — TUSA
DJ Snake — Taki Taki
Maluma — Felices los 4
Nicky Jam — X
Juanes — La Camisa Negra
Camila Cabello — Havana
Kaoma — Lambada
Los Lobos — La Bamba
Manu Chao — Me gustas tú
Luis Fonsi — Despacito
Shakira — Hips Don't Lie
Shakira — Waka Waka (This Time for Africa)
Ricky Martin — Livin' la Vida Loca
Gente de Zona — La Gozadera
Carlos Vives — La Bicicleta
Maluma — Hawái
Pitbull — Give Me Everything
Santana — Smooth
Shakira — Ojos Así
Bad Bunny — Me Porto Bonito
Bad Bunny — DtMF
J Balvin — Ay Vamos
Daddy Yankee — Dura
Don Omar — Danza Kuduro
Prince Royce — Darte un Beso
Romeo Santos — Propuesta Indecente
Aventura — Obsesión
Juan Luis Guerra — Burbujas de Amor
Ricky Martin — María
Jennifer Lopez — On the Floor
Becky G — Mayores
Natti Natasha — Sin Pijama
Feid — Normal
Peso Pluma — Ella Baila Sola
Ozuna — Se Preparó
Nicky Jam — El Perdón
Camila Cabello — Señorita
Selena — Bidi Bidi Bom Bom
Chayanne — Torero
`});

cat({ id: 'kpop', name: 'K-pop', emoji: '🇰🇷', group: 'Monde', items: `
BTS — Dynamite
BTS — Butter
BLACKPINK — DDU-DU DDU-DU
BLACKPINK — How You Like That
TWICE — TT
EXO — Growl
BIGBANG — BANG BANG BANG
Stray Kids — God's Menu
NewJeans — Super Shy
NewJeans — Hype Boy
aespa — Next Level
IVE — LOVE DIVE
SEVENTEEN — Super
ROSÉ — APT.
Jung Kook — Seven
Girls' Generation — Gee
Red Velvet — Psycho
ITZY — WANNABE
LE SSERAFIM — ANTIFRAGILE
(G)I-DLE — Queencard
SHINee — Ring Ding Dong
JENNIE — SOLO
PSY — Gangnam Style
BIGBANG — Fantastic Baby
ITZY — Dalla Dalla
BTS — Boy With Luv
BTS — Fake Love
BTS — DNA
BLACKPINK — Kill This Love
BLACKPINK — Pink Venom
BLACKPINK — As If It's Your Last
TWICE — Fancy
TWICE — What Is Love?
Stray Kids — S-Class
Stray Kids — MANIAC
NewJeans — Ditto
NewJeans — OMG
aespa — Supernova
aespa — Whiplash
IVE — After LIKE
LE SSERAFIM — Perfect Night
ILLIT — Magnetic
KISS OF LIFE — Midas Touch
ENHYPEN — Bite Me
TOMORROW X TOGETHER — Sugar Rush Ride
Jimin — Like Crazy
LISA — MONEY
IU — Good Day
Girls' Generation — I Got a Boy
2NE1 — I Am the Best
Wonder Girls — Nobody
EXO — Love Shot
NCT 127 — Kick It
MAMAMOO — HIP
Sunmi — Gashina
`});

cat({ id: 'afro', name: 'Afro / Afrobeats', emoji: '🌍', group: 'Monde', items: `
Wizkid — Essence
Burna Boy — Last Last
Rema — Calm Down
CKay — love nwantiti (ah ah ah)
Davido — FALL
Master KG — Jerusalema
Yemi Alade — Johnny
Fally Ipupa — Eloko Oyo
Amadou & Mariam — Dimanche à Bamako
Youssou N'Dour — 7 Seconds
Miriam Makeba — Pata Pata
Fela Kuti — Water No Get Enemy
Angélique Kidjo — Agolo
Mory Kanté — Yé ké yé ké
Magic System — Magic in the Air
Asake — Lonely At The Top
Ayra Starr — Rush
Kizz Daniel — Buga
Tems — Free Mind
CKay — Love Nwantiti
Fireboy DML — Peru
Mr Eazi — Leg Over
Aya Nakamura — Pookie
Tiwa Savage — Koroba
Asake — Joha
Burna Boy — Ye
Burna Boy — On the Low
Wizkid — Ojuelegba
Wizkid — Come Closer
Davido — If
Davido — Unavailable
Rema — Dumebi
Tyla — Water
Ayra Starr — Sability
Omah Lay — Godly
Joeboy — Baby
Uncle Waffles — Tanzania
Black Coffee — Superman
Fally Ipupa — Associé
Koffi Olomidé — Loi
Magic System — 1er Gaou
Toofan — Gweta
DJ Arafat — Moto Moto
Serge Beynaud — Okéninkpin
Salif Keita — Madan
Oumou Sangaré — Moussolou
Cesária Évora — Sodade
Johnny Clegg — Asimbonanga
`});

cat({ id: 'uk', name: 'Britannique', emoji: '🇬🇧', group: 'Monde', items: `
The Beatles — Hey Jude
Oasis — Don't Look Back in Anger
Adele — Someone Like You
Coldplay — Yellow
Arctic Monkeys — I Bet You Look Good on the Dancefloor
Blur — Parklife
The Rolling Stones — Paint It Black
David Bowie — Let's Dance
Elton John — Your Song
Amy Winehouse — Valerie
Ed Sheeran — Perfect
Dua Lipa — Levitating
Harry Styles — As It Was
One Direction — What Makes You Beautiful
The Police — Roxanne
The Cure — Boys Don't Cry
Radiohead — Karma Police
Muse — Starlight
Florence + The Machine — Dog Days Are Over
Sam Smith — Stay With Me
George Michael — Careless Whisper
Lily Allen — Smile
Kaiser Chiefs — Ruby
Pulp — Common People
The Beatles — Let It Be
Queen — Somebody to Love
David Bowie — Starman
Coldplay — Viva la Vida
Amy Winehouse — Back to Black
Blur — Song 2
The Police — Every Breath You Take
Spice Girls — Spice Up Your Life
Radiohead — Creep
Dua Lipa — Don't Start Now
Harry Styles — Watermelon Sugar
The Verve — Bitter Sweet Symphony
Duffy — Mercy
Queen — I Want to Break Free
The Beatles — Here Comes the Sun
The Rolling Stones — Start Me Up
Pink Floyd — Wish You Were Here
The Kinks — You Really Got Me
The Smiths — There Is a Light That Never Goes Out
The Cure — Friday I'm in Love
Joy Division — Love Will Tear Us Apart
Oasis — Champagne Supernova
Arctic Monkeys — 505
Adele — Skyfall
Ed Sheeran — The A Team
Elton John — I'm Still Standing
Eurythmics — Sweet Dreams (Are Made of This)
Robbie Williams — Angels
Take That — Back for Good
Jessie J — Price Tag
Little Mix — Black Magic
Stormzy — Shut Up
Central Cee — Doja
`});

cat({ id: 'italie', name: 'Italienne', emoji: '🇮🇹', group: 'Monde', items: `
Eros Ramazzotti — Più bella cosa
Laura Pausini — La solitudine
Adriano Celentano — Azzurro
Domenico Modugno — Nel blu dipinto di blu
Måneskin — ZITTI E BUONI
Umberto Tozzi — Ti amo
Toto Cutugno — L'italiano
Andrea Bocelli — Con te partirò
Zucchero — Senza una donna
Al Bano & Romina Power — Felicità
Ricchi e Poveri — Sarà perché ti amo
Raffaella Carrà — A far l'amore comincia tu
Paolo Conte — Via con me
Mahmood — Soldi
Tiziano Ferro — Perdono
Gianna Nannini — Bello e impossibile
Lucio Dalla — Caruso
Vasco Rossi — Albachiara
Mina — Parole parole
Umberto Tozzi — Gloria
Måneskin — Beggin'
Gigi D'Agostino — L'amour toujours
Gabry Ponte — Geordie
Ricchi e Poveri — Mamma Maria
Laura Pausini — Strani amori
Eros Ramazzotti — Terra promessa
Eros Ramazzotti — Se bastasse una canzone
Adriano Celentano — Il ragazzo della via Gluck
Adriano Celentano — Prisencolinensinainciusol
Riccardo Cocciante — Margherita
Gianni Morandi — Fatti mandare dalla mamma
Nek — Laura non c'è
Lunapop — 50 Special
Eiffel 65 — Blue (Da Ba Dee)
Francesco Gabbani — Occidentali's Karma
Mahmood & Blanco — Brividi
Angelina Mango — La noia
Annalisa — Mon Amour
Ultimo — Pianeti
Marco Mengoni — Due vite
Fred Buscaglione — Che bambola
Renato Carosone — Tu vuò fà l'americano
Dean Martin — That's Amore
`});

cat({ id: 'espagne', name: 'Espagnole', emoji: '🇪🇸', group: 'Monde', items: `
Alejandro Sanz — Corazón partío
Enrique Iglesias — Héroe
Julio Iglesias — Me olvidé de vivir
Rosalía — MALAMENTE
La Oreja de Van Gogh — Rosas
Estopa — Como Camarón
Mecano — Hijo de la Luna
Los del Rio — Macarena
Las Ketchup — Aserejé
Pablo Alborán — Solamente tú
Melendi — Caminando por la vida
David Bisbal — Ave María
Camilo Sesto — Vivir así es morir de amor
Joaquín Sabina — 19 días y 500 noches
El Canto del Loco — Zapatillas
Rosalía — Con altura
Enrique Iglesias — Bailamos
Gipsy Kings — Bamboléo
Gipsy Kings — Volare
Estopa — La raja de tu falda
Aitana — Mon Amour
Quevedo — Columbia
David Bisbal — Bulería
Rosalía — Despechá
Rosalía — Saoko
Enrique Iglesias — Hero
Enrique Iglesias — Escapar
Gipsy Kings — Djobi Djoba
Julio Iglesias — Hey!
Raphael — Escándalo
Mecano — Me cuesta tanto olvidarte
Héroes del Silencio — Entre dos tierras
Camela — Cuando zarpa el barco
Amaral — Sin ti no soy nada
Shakira — Bzrp Music Sessions, Vol. 53
Bizarrap — Quevedo: Bzrp Music Sessions, Vol. 52
C. Tangana — Tú me dejaste de querer
Manu Chao — Bongo Bong
Ketama — No estamos lokos
Juanes — La Camisa Negra
Álvaro Soler — Sofia
Álvaro Soler — El mismo sol
Chanel — SloMo
Lola Índigo — Mujer bruja
Bebe — Malo
Melendi — Tu jardín con enanitos
Fito y Fitipaldis — Soldadito marinero
`});

cat({ id: 'arabe', name: 'Raï / Oriental', emoji: '🌙', group: 'Monde', items: `
Khaled — Aïcha
Khaled — Didi
Khaled — C'est la vie
Faudel — Tellement N'brick
Rachid Taha — Ya Rayah
Soolking — Dalida
Soolking — Suavemente
DJ Snake — Disco Maghreb
Amr Diab — Tamally Maak
Nancy Ajram — Ah W Noss
Saad Lamjarred — LM3ALLEM
L'Algérino — Les menottes
Balti — Ya Lili
Sting — Desert Rose
Cheb Mami — Parisien du Nord
Oum Kalthoum — Enta Omri
Fairuz — Li Beirut
Cheb Hasni — Baida mon amour
Rim'K — Air Max
Haifa Wehbe — Boos El Wawa
Khaled — Abdel Kader
Khaled — Wahran Wahran
Cheb Mami — Meli Meli
Rachid Taha — Rock el Casbah
Faudel — Mon pays
Cheb Bilal — Saragtou galbi
Zouhair Bahaoui — Hasta Luego
Saad Lamjarred — Enty
Saad Lamjarred — Ghaltana
Amr Diab — Nour El Ein
Nancy Ajram — Akhasmak Ah
Elissa — Aa Bali Habibi
Mohamed Ramadan — Number One
Wegz — El Bakht
Mohamed Mounir — Ya Ahl El Arab
Souad Massi — Raoui
Idir — A Vava Inouva
Cheb Khaled — El Harba Wayn
Soolking — Liberté
Lartiste — Chocolat
`});


// ═════════════════════ FUN ═════════════════════
cat({ id: 'soiree-fr', name: 'Tubes de soirée', emoji: '🥳', group: 'Fun', star: true, items: `
Images — Les démons de minuit
Cookie Dingler — Femme libérée
Gilbert Montagné — Les sunlights des tropiques
Vanessa Paradis — Joe le taxi
Partenaire Particulier — Partenaire particulier
Début de Soirée — Nuit de folie
Jean-Pierre Mader — Macumba
Thierry Hazard — Le jerk
Niagara — Tchiki boum
Licence IV — Viens boire un p'tit coup à la maison
La Compagnie Créole — C'est bon pour le moral
La Compagnie Créole — Ça fait rire les oiseaux
Annie Cordy — Tata Yoyo
La Bande à Basile — La chenille
J.J. Lionel — La danse des canards
Patrick Sébastien — Les sardines
Patrick Sébastien — Pourvu qu'elles soient douces
Yannick — Ces soirées-là
Gold — Capitaine abandonné
Images — Le coeur en exil
France Gall — Il jouait du piano debout
Jean-Jacques Goldman — Je te donne
Les Forbans — Chante
Zouk Machine — Maldòn (La musique dans la peau)
Kassav' — Zouk la sé sèl médikaman nou ni
Magic System — Magic in the Air
Collectif Métissé — Laisse-moi kiffer
Desireless — Voyage voyage
Ottawan — D.I.S.C.O.
Ottawan — T'es OK
Boney M. — Rasputin
Village People — Y.M.C.A.
Las Ketchup — The Ketchup Song (Aserejé)
Magic System — Premier gaou
Patrick Sébastien — Le petit bonhomme en mousse
Les Musclés — La fête au village
Gilbert Montagné — On va s'aimer
Larusso — Tu m'oublieras
Jean-Jacques Goldman — Au bout de mes rêves
Indochine — J'ai demandé à la lune
Michel Sardou — En chantant
Claude François — Cette année-là
Céline Dion — On ne change pas
Joe Dassin — Siffler sur la colline
Dalida — Laissez-moi danser
Kendji Girac — Color Gitano
Bob Sinclar — World Hold On
Lou Bega — Mambo No. 5
Gala — Freed from Desire
`});

cat({ id: 'ete', name: "Tubes de l'été", emoji: '🏖️', group: 'Fun', items: `
Kaoma — Lambada
Los del Rio — Macarena
O-Zone — Dragostea Din Tei
Lou Bega — Mambo No. 5 (A Little Bit of...)
Mr. President — Coco Jambo
DJ BoBo — Chihuahua
Phénoménal Club — Il est vraiment phénoménal
Carrapicho — Tic Tic Tac
Yannick Noah — Saga Africa
Don Omar — Danza Kuduro
Shakira — Waka Waka (This Time for Africa)
K'NAAN — Wavin' Flag
Jessy Matador — Allez Ola Olé
Tragédie — Hey Oh
Shy'm — Femme de couleur
Magic System — Premier Gaou
Bob Sinclar — Love Generation
Major Lazer — Lean On
Luis Fonsi — Despacito
Master KG — Jerusalema
Rema — Calm Down
Ilona Mitrecey — Un monde parfait
Alizée — Moi… Lolita
Lorie — Toute seule
Matt Houston — Positif
Willy William — Ego
Kungs — This Girl
Lost Frequencies — Are You With Me
Mr. Probz — Waves
Sean Paul — Temperature
Las Ketchup — Aserejé
Lou Bega — Mambo No. 5
Crazy Frog — Axel F
Yannick — Ces soirées-là
Alexandra Stan — Mr. Saxobeat
Mika — Relax, Take It Easy
Kendji Girac — Andalouse
Mylène Farmer — Désenchantée
Aqua — Doctor Jones
Will Smith — Men in Black
Michel Teló — Ai Se Eu Te Pego
Black Eyed Peas — Pump It
Daddy Yankee — Con Calma
Kungs — Never Going Home
Robin Schulz — Sugar
OMI — Cheerleader
Kygo — Stole the Show
Felix Jaehn — Ain't Nobody (Loves Me Better)
Imany — Don't Be So Shy
Calvin Harris — Feel So Close
Bob Sinclar — Rock This Party (Everybody Dance Now)
Inna — Hot
Edward Maya — Stereo Love
Major Lazer — Light It Up
Jason Derulo — Talk Dirty
Stromae — Alors on danse
Shakira — Chantaje
Ofenbach — Be Mine
Nicky Jam — X (Equis)
`});

cat({ id: 'stade', name: 'Hymnes de stade', emoji: '🏟️', group: 'Fun', items: `
The White Stripes — Seven Nation Army
Queen — We Will Rock You
Queen — We Are the Champions
Gala — Freed from Desire
Opus — Live Is Life
Europe — The Final Countdown
Survivor — Eye of the Tiger
AC/DC — Thunderstruck
Van Halen — Jump
Blur — Song 2
The Black Eyed Peas — Pump It
The Fratellis — Chelsea Dagger
Neil Diamond — Sweet Caroline
Pet Shop Boys — Go West
Bellini — Samba de Janeiro
Gloria Gaynor — I Will Survive
Ricky Martin — La Copa de la Vida
Shakira — Waka Waka (This Time for Africa)
Magic System — Magic in the Air
Gary Glitter — Rock and Roll Part 2
Joe Esposito — You're the Best
Gigi D'Agostino — L'Amour Toujours
Darude — Sandstorm
Imagine Dragons — Believer
Vangelis — Conquest of Paradise
Ricky Martin — The Cup of Life
Zombie Nation — Kernkraft 400
The Killers — Mr. Brightside
Tina Turner — The Best
Village People — Y.M.C.A.
House of Pain — Jump Around
Bon Jovi — Livin' on a Prayer
Joe Dassin — Les Champs-Élysées
Imagine Dragons — Radioactive
Shakira — La La La (Brazil 2014)
K'naan — Wavin' Flag
Pitbull — We Are One (Ole Ola)
Dua Lipa — One Kiss
The Black Eyed Peas — Let's Get It Started
Queen — Another One Bites the Dust
Joan Jett & The Blackhearts — I Love Rock 'n' Roll
Baha Men — Who Let the Dogs Out
Gerry and the Pacemakers — You'll Never Walk Alone
Les Rita Mitsouko — Marcia Baila
Patrick Hernandez — Born to Be Alive
DJ Snake — Turn Down for What
`});

cat({ id: 'noel', name: 'Chansons de Noël', emoji: '🎄', group: 'Fun', items: `
Mariah Carey — All I Want for Christmas Is You
Wham! — Last Christmas
Tino Rossi — Petit papa Noël
Bobby Helms — Jingle Bell Rock
José Feliciano — Feliz Navidad
Dean Martin — Let It Snow! Let It Snow! Let It Snow!
Brenda Lee — Rockin' Around the Christmas Tree
Ariana Grande — Santa Tell Me
Michael Bublé — It's Beginning to Look a Lot Like Christmas
Chris Rea — Driving Home for Christmas
Band Aid — Do They Know It's Christmas?
Shakin' Stevens — Merry Christmas Everyone
John Lennon — Happy Xmas (War Is Over)
Kelly Clarkson — Underneath the Tree
Justin Bieber — Mistletoe
Darlene Love — Christmas (Baby Please Come Home)
Bing Crosby — White Christmas
Eartha Kitt — Santa Baby
Frank Sinatra — Jingle Bells
The Pogues — Fairytale of New York
Paul McCartney — Wonderful Christmastime
Michael Bublé — Holly Jolly Christmas
Elvis Presley — Blue Christmas
Melanie Thornton — Wonderful Dream (Holidays Are Coming)
Sia — Snowman
Mariah Carey — Santa Claus Is Comin' to Town
Chuck Berry — Run Rudolph Run
Dean Martin — Baby, It's Cold Outside
Mariah Carey — Joy to the World
Bing Crosby — Silent Night
Nat King Cole — The Christmas Song
Andy Williams — It's the Most Wonderful Time of the Year
Burl Ives — A Holly Jolly Christmas
Gene Autry — Rudolph the Red-Nosed Reindeer
The Ronettes — Sleigh Ride
Tom Jones — Santa Claus Is Back in Town
Pentatonix — Little Drummer Boy
Mariah Carey — O Holy Night
Jackson 5 — I Saw Mommy Kissing Santa Claus
Coldplay — Christmas Lights
Ed Sheeran — Merry Christmas
Mariah Carey — Oh Santa!
Tino Rossi — Noël blanc
Georges Brassens — Le père Noël et la petite fille
`});

cat({ id: 'disney-channel', name: 'Années Disney Channel', emoji: '✨', group: 'Fun', items: `
Hannah Montana — The Best of Both Worlds
Hannah Montana — Nobody's Perfect
Miley Cyrus — Party in the U.S.A.
Miley Cyrus — The Climb
Troy & Gabriella — Breaking Free
High School Musical Cast — We're All in This Together
Zac Efron — Bet On It
Demi Lovato — This Is Me
Jonas Brothers — Burnin' Up
Selena Gomez & The Scene — Naturally
Selena Gomez — Magic
Aly & AJ — Potential Breakup Song
Vanessa Hudgens — Say OK
Ashley Tisdale — He Said She Said
Hilary Duff — So Yesterday
Raven-Symoné — That's So Raven
Demi Lovato — Skyscraper
Bridgit Mendler — Ready or Not
Zendaya — Replay
Olivia Rodrigo — drivers license
Dove Cameron — Rotten to the Core
Sabrina Carpenter — Thumbs
Miley Cyrus — See You Again
Camp Rock — We Rock :: Camp Rock We Rock
Bella Thorne — Watch Me
Teen Beach Movie — Surf's Up :: Teen Beach Movie Surf's Up
Hannah Montana — He Could Be the One
Miley Cyrus — 7 Things
Jonas Brothers — S.O.S.
Jonas Brothers — Year 3000
Demi Lovato — La La Land
Selena Gomez & The Scene — Love You Like a Love Song
Selena Gomez & The Scene — Who Says
Hilary Duff — Come Clean
Hilary Duff — Wake Up
Ashley Tisdale — Be Good to Me
High School Musical Cast — What Time Is It
Sharpay & Ryan — Fabulous :: High School Musical 2 Fabulous
Bridgit Mendler — Hurricane
China Anne McClain — Calling All the Monsters
Ross Lynch — Heard It on the Radio
Dove Cameron — If Only
Sabrina Carpenter — Can't Blame a Girl for Trying
Debby Ryan — We Got the Beat
Olivia Holt — Phenomenal
`});

cat({ id: 'comedies-musicales', name: 'Comédies musicales', emoji: '🎭', group: 'Fun', kind: 'work', label: 'Nom de la comédie musicale', items: `
Notre-Dame de Paris :: Belle Garou Daniel Lavoie Patrick Fiori
Les Dix Commandements|10 commandements :: L'envie d'aimer Daniel Lévi
Le Roi Soleil :: Être à la hauteur Emmanuel Moire
Mozart, l'opéra rock|Mozart :: Tatoue-moi Mikelangelo Loconte
Roméo et Juliette :: Les rois du monde Roméo et Juliette
Starmania :: Le blues du businessman Claude Dubois
1789, les amants de la Bastille|1789 :: Pour la peine 1789 les amants de la Bastille
Cats :: Memory Elaine Paige
Le Fantôme de l'Opéra|Phantom of the Opera :: The Phantom of the Opera Sarah Brightman Michael Crawford
Les Misérables|Miserables :: I Dreamed a Dream Les Misérables
Mamma Mia! :: Mamma Mia ABBA
Hamilton :: My Shot Hamilton
Grease :: Summer Nights Grease
Le Roi Lion|Roi Lion :: Circle of Life Elton John
The Greatest Showman :: The Greatest Show Hugh Jackman
La La Land :: City of Stars
West Side Story :: America West Side Story
Chicago :: All That Jazz Chicago
Le Magicien d'Oz|Magicien d'Oz :: Over the Rainbow Judy Garland
Hairspray :: You Can't Stop the Beat
Les Demoiselles de Rochefort|Demoiselles de Rochefort :: Chanson des jumelles
Notre-Dame de Paris :: Le temps des cathédrales Bruno Pelletier
Le Roi Soleil :: Je fais de toi mon essentiel Emmanuel Moire
Mozart, l'opéra rock|Mozart :: Vivre à en crever Mozart opéra rock
Roméo et Juliette :: Aimer Roméo et Juliette
Starmania :: Les uns contre les autres Fabienne Thibeault
Notre-Dame de Paris :: Vivre Hélène Ségara
Les Dix Commandements|Dix Commandements :: Mon frère Daniel Lévi
Le Roi Soleil :: Le ciel ne m'aime pas Christophe Maé
Mozart, l'opéra rock|Mozart :: Tatoue-moi Mozart opéra rock
Roméo et Juliette :: Le poète Roméo et Juliette
Starmania :: SOS d'un terrien en détresse
1789, les Amants de la Bastille|1789 :: Pour la peine 1789
Robin des Bois :: Ce que l'on vit Robin des Bois M Pokora
Le Roi Lion|Roi Lion musical :: L'histoire de la vie Roi Lion comédie musicale
Grease :: Grease is the word Frankie Valli
Mamma Mia! :: Gimme Gimme Gimme Mamma Mia film
Les Misérables|Misérables :: Do You Hear the People Sing
Wicked :: Defying Gravity Idina Menzel
Rent :: Seasons of Love Rent
Moulin Rouge :: Lady Marmalade Moulin Rouge
Cabaret :: Willkommen Cabaret Liza Minnelli
Mary Poppins :: Chem Cheminée Mary Poppins
The Rocky Horror Picture Show|Rocky Horror :: Time Warp
Les Parapluies de Cherbourg|Parapluies de Cherbourg :: Je ne pourrai jamais vivre sans toi
Saturday Night Fever|La Fièvre du samedi soir :: Night Fever Bee Gees
`});

cat({ id: 'emissions', name: 'Émissions télé', emoji: '📡', group: 'Fun', kind: 'work', label: 'Nom de l\'émission', items: `
Koh-Lanta|Koh Lanta :: Koh-Lanta générique
Fort Boyard :: Fort Boyard générique Paul Koulak
Questions pour un champion :: Questions pour un champion générique
Qui veut gagner des millions ?|Qui veut gagner des millions :: Qui veut gagner des millions main theme
Le Juste Prix|Juste prix :: Le Juste Prix générique
Des chiffres et des lettres :: Des chiffres et des lettres générique
Téléfoot :: Téléfoot générique
Thalassa :: Thalassa générique
Ushuaïa|Ushuaia :: Ushuaïa générique
Intervilles :: Intervilles générique
Star Academy :: Star Academy générique
Secret Story :: Secret Story générique
Top Chef :: Top Chef générique
Les Guignols de l'info|Les Guignols :: Les Guignols de l'info générique
Burger Quiz :: Burger Quiz générique
Motus :: Motus générique
Le Maillon faible|Maillon faible :: Le maillon faible générique
C'est pas sorcier :: C'est pas sorcier générique
N'oubliez pas les paroles :: N'oubliez pas les paroles générique
Tout le monde veut prendre sa place :: Tout le monde veut prendre sa place générique
Club Dorothée :: Club Dorothée générique
Les Feux de l'amour|Feux de l'amour :: Nadia's Theme Feux de l'amour
Télématin :: Télématin générique
Loft Story :: Loft Story générique
La Roue de la fortune|Roue de la fortune :: La roue de la fortune générique
Taratata :: Taratata générique
Le Bigdil :: Le Bigdil générique
Les Z'amours|Z'amours :: Les Z'amours générique
Pyramide :: Pyramide générique jeu télé
Slam :: Slam France 3 générique
La Carte aux trésors|Carte aux trésors :: La carte aux trésors générique
Vidéo Gag|Video Gag :: Vidéo gag générique
Les Enfants du Rock :: Les enfants du rock générique
Nulle part ailleurs :: Nulle part ailleurs générique
Le Jeu de la mort|Jeu de la mort :: Le jeu de la mort générique
Faites entrer l'accusé :: Faites entrer l'accusé générique
Les Reines du shopping|Reines du shopping :: Les reines du shopping générique
Pékin Express|Pekin Express :: Pékin Express générique
L'amour est dans le pré|Amour est dans le pré :: L'amour est dans le pré générique
Un dîner presque parfait|Diner presque parfait :: Un dîner presque parfait générique
The Voice :: The Voice France générique
La France a un incroyable talent|Incroyable talent :: La France a un incroyable talent générique
Danse avec les stars :: Danse avec les stars générique
Zone interdite :: Zone interdite générique
Envoyé spécial|Envoye special :: Envoyé spécial générique
Le Journal de 20h|JT TF1 :: TF1 journal 20h générique
Capital :: Capital M6 générique
Les Marseillais|Marseillais :: Les Marseillais générique
Quotidien :: Quotidien générique
Le Grand Concours|Grand Concours :: Le grand concours générique
`});

cat({ id: '2020s', name: 'Années 2020 / TikTok', emoji: '📲', group: 'Décennies', items: `
The Weeknd — Blinding Lights
Dua Lipa — Levitating
Harry Styles — As It Was
Glass Animals — Heat Waves
Olivia Rodrigo — drivers license
Miley Cyrus — Flowers
Sabrina Carpenter — Espresso
Benson Boone — Beautiful Things
Kate Bush — Running Up That Hill (A Deal With God)
Lady Gaga — Bloody Mary
Doja Cat — Paint The Town Red
FIFTY FIFTY — Cupid
Sophie Ellis-Bextor — Murder on the Dancefloor
Tommy Richman — MILLION DOLLAR BABY
Billie Eilish — BIRDS OF A FEATHER
Chappell Roan — Good Luck, Babe!
Lady Gaga — Die With A Smile
Teddy Swims — Lose Control
Shakira — Bzrp Music Sessions, Vol. 53
Stromae — L'enfer
Aya Nakamura — Djadja
Tiakola — Meuda
Gazo — Die
Santa — Popcorn salé
Pierre Garnier — Ceux qu'on était
Måneskin — Beggin'
Jason Derulo — Savage Love (Laxed - Siren Beat)
Lil Nas X — MONTERO (Call Me By Your Name)
Doja Cat — Say So
The Kid LAROI — Stay
Tones and I — Dance Monkey
SZA — Kill Bill
Taylor Swift — Anti-Hero
Billie Eilish — What Was I Made For?
Tate McRae — greedy
Ed Sheeran — Bad Habits
Elton John — Cold Heart
Rema — Calm Down
Hozier — Too Sweet
Doechii — Anxiety
Kenya Grace — Strangers
Jack Harlow — First Class
`});

// ───────── parsing ─────────
function parse(c) {
  if (!c.items) return { ...c, list: [] };
  const list = [];
  for (let line of c.items.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    let note = '';
    if (line.includes('##')) { [line, note] = line.split('##').map(s => s.trim()); }
    let [main, q] = line.split('::').map(s => s && s.trim());
    if (c.kind === 'work') {
      const names = main.split('|').map(s => s.trim()).filter(Boolean);
      list.push({ key: c.id + ':' + names[0] + ':' + (q || ''), work: names[0], alts: names.slice(1), q: q || names[0] + ' générique', cat: c.id, note, allowCovers: !!c.allowCovers });
    } else {
      const m = main.split(/\s+—\s+/);
      if (m.length < 2) continue;
      const artist = m[0].trim(), title = m.slice(1).join(' — ').trim();
      list.push({ key: 'm:' + artist + '|' + title, artist, title, q: q || null, cat: c.id, note, allowCovers: !!c.allowCovers });
    }
  }
  return { ...c, list };
}

module.exports = C.map(parse);
