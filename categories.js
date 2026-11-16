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
`});

cat({ id: 'stade', name: 'Hymnes de stade', emoji: '🏟️', group: 'Fun', items: `
The White Stripes — Seven Nation Army
Queen — We Will Rock You
Queen — We Are the Champions
Gala — Freed from Desire
Kernkraft 400 — Zombie Nation
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
`});

cat({ id: 'comedies-musicales', name: 'Comédies musicales', emoji: '🎭', group: 'Fun', kind: 'work', label: 'Nom de la comédie musicale', items: `
Notre-Dame de Paris :: Belle Garou Daniel Lavoie Patrick Fiori
Notre-Dame de Paris :: Le temps des cathédrales Bruno Pelletier
Les Dix Commandements|10 commandements :: L'envie d'aimer Daniel Lévi
Le Roi Soleil :: Être à la hauteur Emmanuel Moire
Le Roi Soleil :: Je fais de toi mon essentiel Emmanuel Moire
Mozart, l'opéra rock|Mozart :: Tatoue-moi Mikelangelo Loconte
Mozart, l'opéra rock|Mozart :: Vivre à en crever Mozart opéra rock
Roméo et Juliette :: Les rois du monde Roméo et Juliette
Roméo et Juliette :: Aimer Roméo et Juliette
Starmania :: Le blues du businessman Claude Dubois
Starmania :: Les uns contre les autres Fabienne Thibeault
1789, les amants de la Bastille|1789 :: Pour la peine 1789 les amants de la Bastille
Cats :: Memory Elaine Paige
Le Fantôme de l'Opéra|Phantom of the Opera :: The Phantom of the Opera Sarah Brightman Michael Crawford
Les Misérables|Miserables :: I Dreamed a Dream Les Misérables
Mamma Mia! :: Mamma Mia ABBA
Hamilton :: My Shot Hamilton
Grease :: Summer Nights Grease
Le Roi Lion|Roi Lion :: Circle of Life Elton John
The Greatest Showman :: The Greatest Show Hugh Jackman
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
`});

cat({ id: 'pubs', name: 'Musiques de pub', emoji: '📣', group: 'Fun', items: `
Melanie Thornton — Wonderful Dream (Holidays Are Coming) ## Pub Coca-Cola (Noël)
Mr. Oizo — Flat Beat ## Pub Levi's (Flat Eric)
Stiltskin — Inside ## Pub Levi's
Babylon Zoo — Spaceman ## Pub Levi's
The Black Eyed Peas — Hey Mama ## Pub Apple iPod
Jet — Are You Gonna Be My Girl ## Pub Apple iPod
Feist — 1234 ## Pub Apple iPod nano
The Ting Tings — Shut Up and Let Me Go ## Pub Apple iPod
Yael Naim — New Soul ## Pub Apple MacBook Air
CSS — Music Is My Hot Hot Sex ## Pub Apple iPod touch
José González — Heartbeats ## Pub Sony Bravia
The Rolling Stones — Start Me Up ## Pub Windows 95
Nina Simone — My Baby Just Cares for Me ## Pub Chanel N°5
Les Rythmes Digitales — Jacques Your Body (Make Me Sweat) ## Pub Citroën C4
Pérez Prado — Guaglione ## Pub Guinness
Mint Royale — Singin' in the Rain ## Pub Volkswagen Golf
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
