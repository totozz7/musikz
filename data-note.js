// PlayZup — Jeu de la Note : thèmes et leur échelle.
// Chaque ligne : "Thème | ce que vaut un 1 | ce que vaut un 10"
// Le répondeur doit trouver, pour chaque thème, une réponse qui correspond à SA note secrète.
module.exports = `
Un film | 1 = navet absolu | 10 = chef-d'œuvre
Une série | 1 = soporifique | 10 = addictive
Un dessin animé | 1 = nul | 10 = culte
Un animé japonais | 1 = à fuir | 10 = légendaire
Une chanson | 1 = insupportable | 10 = tube parfait
Un chanteur ou une chanteuse | 1 = inconnu | 10 = superstar
Un plat | 1 = immangeable | 10 = délicieux
Un dessert | 1 = écœurant | 10 = divin
Une boisson | 1 = dégueu | 10 = délicieuse
Un fast-food | 1 = horrible | 10 = le meilleur
Un fruit ou légume | 1 = détesté | 10 = adoré
Une destination de vacances | 1 = cauchemar | 10 = paradis
Une ville | 1 = déprimante | 10 = de rêve
Un pays | 1 = aucune envie | 10 = rêve absolu
Un animal | 1 = inoffensif | 10 = terrifiant
Un animal de compagnie | 1 = pire idée | 10 = idéal
Un métier | 1 = enfer | 10 = métier de rêve
Un sport | 1 = tranquille | 10 = extrême
Un sport à regarder | 1 = ennuyeux | 10 = passionnant
Un jeu vidéo | 1 = injouable | 10 = jeu de l'année
Un jeu de société | 1 = barbant | 10 = trop fun
Un super-héros | 1 = inutile | 10 = surpuissant
Un méchant de film | 1 = gentillet | 10 = terrifiant
Un personnage de fiction | 1 = insupportable | 10 = attachant
Une célébrité | 1 = inconnue | 10 = mondialement connue
Un youtubeur ou streamer | 1 = inconnu | 10 = incontournable
Une émission télé | 1 = navrante | 10 = culte
Une marque | 1 = bas de gamme | 10 = luxe
Une voiture | 1 = épave | 10 = voiture de rêve
Un objet | 1 = inutile | 10 = indispensable
Un cadeau | 1 = vexant | 10 = parfait
Une odeur | 1 = infecte | 10 = divine
Un bruit | 1 = apaisant | 10 = insupportable
Une matière à l'école | 1 = cauchemar | 10 = passion
Une activité du dimanche | 1 = corvée | 10 = parfaite
Une tâche ménagère | 1 = facile | 10 = calvaire
Une peur | 1 = rien du tout | 10 = phobie totale
Une excuse pour être en retard | 1 = pas crédible | 10 = imparable
Une phrase de drague | 1 = gênante | 10 = irrésistible
Un prénom | 1 = moche | 10 = magnifique
Une appli | 1 = inutile | 10 = indispensable
Un réseau social | 1 = mort | 10 = incontournable
Une invention | 1 = inutile | 10 = révolutionnaire
Un moyen de transport | 1 = lent | 10 = ultra rapide
Un vêtement | 1 = ringard | 10 = stylé
Un super-pouvoir | 1 = nul | 10 = ultime
Un endroit pour un premier rendez-vous | 1 = catastrophe | 10 = parfait
Un repas de Noël | 1 = triste | 10 = festin
Une saison ou une météo | 1 = détestable | 10 = idéale
Un instrument de musique | 1 = cacophonie | 10 = magnifique
Une danse | 1 = ridicule | 10 = stylée
Une couleur | 1 = horrible | 10 = superbe
Un bonbon | 1 = dégueu | 10 = le meilleur
Un plat de cantine | 1 = traumatisant | 10 = régal
Un parfum de glace | 1 = bizarre | 10 = parfait
Un chiffre ou un nombre | 1 = porte-malheur | 10 = porte-bonheur
Une situation gênante | 1 = rien de grave | 10 = la honte de ma vie
Un mensonge | 1 = petit mensonge | 10 = énorme mytho
Une dépense | 1 = pas chère | 10 = ruineuse
Un talent caché | 1 = inutile | 10 = impressionnant
Un sujet de conversation | 1 = barbant | 10 = passionnant
Une boisson de soirée | 1 = sans alcool sage | 10 = explosif
Un club de foot | 1 = petit club | 10 = géant
Un personnage historique | 1 = oublié | 10 = légendaire
Une fête | 1 = nulle | 10 = inoubliable
Un rêve d'enfant | 1 = banal | 10 = fou
Une mode ou tendance | 1 = gênante | 10 = géniale
Un lieu pour dormir | 1 = horrible | 10 = luxueux
Une compétence | 1 = inutile | 10 = indispensable
Un trajet | 1 = rapide | 10 = interminable
`.trim().split('\n').map(l => l.split('|').map(s => s.trim())).filter(x => x.length === 3).map(([name, low, high], i) => ({ id: 't' + i, name, low, high }));
