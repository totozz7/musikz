// PlayZup — Ça chauffe ! : mots secrets (simples et concrets). La proximité se calcule avec sem-vectors.bin.
module.exports = `chat chien maison soleil voiture avion pizza banane arbre fleur poisson éléphant girafe lunettes chapeau guitare téléphone
ordinateur vélo bateau fusée étoile lune nuage parapluie pomme fraise gâteau glace hamburger frites oiseau serpent tortue lapin cochon
vache mouton cheval papillon araignée abeille escargot requin baleine dinosaure dragon robot fantôme sorcière pirate château pont montagne
volcan île plage cactus sapin neige pingouin ours lion tigre singe crocodile kangourou hibou ballon trophée couronne épée clé lampe
bougie horloge lit canapé chaise table douche brosse ciseaux crayon livre cartable valise télévision piano violon trompette batterie
feu train camion tracteur hélicoptère tente forêt rivière océan désert jungle ferme village ville école hôpital boulangerie cinéma
musée restaurant cuisine jardin piscine stade église prison usine magasin marché bibliothèque pharmacie banque aéroport gare métro
docteur pompier policier boulanger cuisinier professeur facteur pilote soldat roi reine princesse chevalier sorcier clown magicien
chanteur danseur footballeur fromage chocolat bonbon café thé lait pain beurre œuf salade tomate carotte pomme poire cerise citron orange
ananas raisin melon soupe riz pâtes viande poulet sandwich biscuit confiture miel sucre sel poivre vin bière eau jus école vacances
anniversaire mariage noël cadeau fête concert musique danse film livre jeu football tennis basket natation ski vélo course boxe
hiver été printemps automne pluie orage vent tempête arc-en-ciel nuit matin soir rêve cauchemar amour amitié colère peur joie
tristesse rire larme bisou main pied tête œil nez bouche oreille cheveux dent cœur sang os muscle ventre dos genou doigt
argent trésor pirate carte boussole météo planète espace satellite étoile comète soleil terre mer sable coquillage vague bateau
chaussure chaussette pantalon robe manteau écharpe gant casquette pyjama montre bague collier sac miroir savon serviette
oreiller couverture fenêtre porte toit mur escalier ascenseur clé voiture moto bus taxi route autoroute parking feu panneau
`.split(/\s+/).filter(Boolean).filter((w, i, a) => a.indexOf(w) === i);
