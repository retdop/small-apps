export interface Word {
  mot: string;
  defs: string[];   // multiple definitions, one picked at random each time
  lettres: number;
  cat: string;
}

export const WORDS: Word[] = [
  // ══════════ PONCIFS CLASSIQUES ══════════
  { mot: "AA", defs: ["Fleuve côtier du Pas-de-Calais", "Coulée de lave rugueuse"], lettres: 2, cat: "géo" },
  { mot: "AAR", defs: ["Rivière ou massif montagneux de Suisse", "Affluent du Rhin"], lettres: 3, cat: "géo" },
  { mot: "ACE", defs: ["Coup d'envoi gagnant au tennis", "Service imparable"], lettres: 3, cat: "sport" },
  { mot: "AÏ", defs: ["Mammifère arboricole très lent", "Paresseux à trois doigts"], lettres: 2, cat: "animal" },
  { mot: "ANTE", defs: ["Pilier d'encoignure", "Pilastre de coin"], lettres: 4, cat: "archi" },
  { mot: "API", defs: ["Petite pomme rouge", "Pomme d'une chanson enfantine"], lettres: 3, cat: "nature" },
  { mot: "ASE", defs: ["Suffixe d'enzyme", "Terminaison de biocatalyseur"], lettres: 3, cat: "science" },
  { mot: "ASES", defs: ["Dieux scandinaves", "Divinités d'Asgard"], lettres: 4, cat: "mytho" },
  { mot: "ASPE", defs: ["Dévidoir à soie", "Outil du sériciculteur"], lettres: 4, cat: "objet" },
  { mot: "ASTI", defs: ["Vin pétillant du Piémont", "Mousseux italien", "Spumante célèbre"], lettres: 4, cat: "gastro" },
  { mot: "AŸ", defs: ["Commune champenoise de la Marne", "Village du champagne"], lettres: 2, cat: "géo" },
  { mot: "EIRE", defs: ["République d'Irlande", "Nom gaélique de l'Irlande"], lettres: 4, cat: "géo" },
  { mot: "ERG", defs: ["Désert de sable", "Étendue de dunes sahariennes"], lettres: 3, cat: "géo" },
  { mot: "ÉRIN", defs: ["Nom poétique de l'Irlande", "L'île verte des poètes"], lettres: 4, cat: "géo" },
  { mot: "ENTER", defs: ["Greffer en horticulture", "Insérer un greffon"], lettres: 5, cat: "nature" },
  { mot: "ERSE", defs: ["Cordage en anneau", "Relatif à l'Écosse gaélique", "Anneau de marin"], lettres: 4, cat: "marine" },
  { mot: "ESSE", defs: ["Crochet en forme de S", "Ouverture d'un violon"], lettres: 4, cat: "objet" },
  { mot: "ESTER", defs: ["Intenter une action en justice", "Agir en droit"], lettres: 5, cat: "droit" },
  { mot: "IDE", defs: ["Poisson cyprinidé d'eau douce", "Cousin du gardon"], lettres: 3, cat: "animal" },
  { mot: "IENISSEÏ", defs: ["Grand fleuve sibérien", "Cours d'eau traversant la Sibérie centrale"], lettres: 8, cat: "géo" },
  { mot: "IN", defs: ["À la mode", "Tendance du moment"], lettres: 2, cat: "divers" },
  { mot: "IO", defs: ["Princesse changée en génisse", "Amante bovine de Zeus"], lettres: 2, cat: "mytho" },
  { mot: "IPÉ", defs: ["Arbre tropical au bois très dur", "Bois exotique imputrescible"], lettres: 3, cat: "nature" },
  { mot: "IRE", defs: ["Colère littéraire", "Courroux poétique"], lettres: 3, cat: "divers" },
  { mot: "IS", defs: ["Ville de Côte-d'Or sur la Tille", "Petite commune bourguignonne"], lettres: 2, cat: "géo" },
  { mot: "ISE", defs: ["Ville japonaise et sa baie sacrée", "Sanctuaire shintoïste majeur"], lettres: 3, cat: "géo" },
  { mot: "IULE", defs: ["Espèce de mille-pattes", "Myriapode cylindrique"], lettres: 4, cat: "animal" },
  { mot: "LÉ", defs: ["Bande de tissu entre deux lisières", "Largeur d'une étoffe"], lettres: 2, cat: "objet" },
  { mot: "LEU / LEI", defs: ["Monnaie roumaine", "Devise de Bucarest"], lettres: 3, cat: "monnaie" },
  { mot: "LEV", defs: ["Monnaie bulgare", "Devise de Sofia (pluriel : leva)"], lettres: 3, cat: "monnaie" },
  { mot: "LÔ", defs: ["Préfecture de la Manche (après Saint-)", "Chef-lieu manchois"], lettres: 2, cat: "géo" },
  { mot: "NÉVÉ", defs: ["Neige durcie en altitude", "Granulé glaciaire de montagne"], lettres: 4, cat: "nature" },
  { mot: "NÔ", defs: ["Théâtre japonais masqué", "Drame lyrique nippon"], lettres: 2, cat: "culture" },
  { mot: "OB", defs: ["Fleuve de Sibérie occidentale", "Grand cours d'eau russe de l'Arctique"], lettres: 2, cat: "géo" },
  { mot: "OBI", defs: ["Ceinture du kimono", "Large bande nouée à la taille au Japon"], lettres: 3, cat: "culture" },
  { mot: "OC", defs: ["Oui méridional médiéval", "Langue du sud de la France"], lettres: 2, cat: "langue" },
  { mot: "OÏL", defs: ["Oui septentrional médiéval", "Langue du nord de la France"], lettres: 3, cat: "langue" },
  { mot: "OPE", defs: ["Trou dans un mur pour un échafaudage", "Ouverture de boulin"], lettres: 3, cat: "archi" },
  { mot: "ÖRE / ØRE", defs: ["Centième de couronne scandinave", "Subdivision monétaire nordique"], lettres: 3, cat: "monnaie" },
  { mot: "OST", defs: ["Armée féodale en campagne", "Convocation militaire médiévale"], lettres: 3, cat: "histoire" },
  { mot: "OUT", defs: ["Balle hors limites au tennis", "Dehors, sur le court"], lettres: 3, cat: "sport" },
  { mot: "OVE", defs: ["Ornement en forme d'œuf", "Motif architectural ovoïde"], lettres: 3, cat: "archi" },
  { mot: "PÉ", defs: ["Commune pyrénéenne (après Saint-)", "Village de Bigorre"], lettres: 2, cat: "géo" },
  { mot: "PEP / PEPS", defs: ["Tonus, énergie", "Dynamisme, entrain"], lettres: 3, cat: "divers" },
  { mot: "PÔ", defs: ["Plus long fleuve d'Italie", "Il traverse la plaine padane"], lettres: 2, cat: "géo" },
  { mot: "RÂ / RÊ", defs: ["Dieu-soleil égyptien", "Divinité solaire à tête de faucon"], lettres: 2, cat: "mytho" },
  { mot: "RAD", defs: ["Ancienne unité de dose absorbée", "Mesure d'irradiation remplacée par le gray"], lettres: 3, cat: "science" },
  { mot: "RÉA", defs: ["Poulie de renvoi", "Roue de poulie à gorge", "Service de réanimation (abrév.)"], lettres: 3, cat: "objet" },
  { mot: "RÉER", defs: ["Bramer pour le cerf en rut", "Cri du cerf à l'automne"], lettres: 4, cat: "animal" },
  { mot: "REG", defs: ["Désert de pierres", "Étendue caillouteuse saharienne"], lettres: 3, cat: "géo" },
  { mot: "REM", defs: ["Unité de dose équivalente (radiations)", "Mesure d'exposition biologique aux rayons"], lettres: 3, cat: "science" },
  { mot: "RU", defs: ["Petit ruisseau", "Modeste cours d'eau"], lettres: 2, cat: "nature" },
  { mot: "SASSER", defs: ["Tamiser, passer au sas", "Faire passer un bateau par une écluse"], lettres: 6, cat: "divers" },
  { mot: "SÉES", defs: ["Cité épiscopale de l'Orne", "Évêché normand millénaire"], lettres: 4, cat: "géo" },
  { mot: "SEN", defs: ["Centième de yen japonais", "Subdivision monétaire nippone"], lettres: 3, cat: "monnaie" },
  { mot: "SEP", defs: ["Pièce de charrue portant le soc", "Support de soc"], lettres: 3, cat: "objet" },
  { mot: "SIS", defs: ["Situé, en langage juridique", "Établi en un lieu"], lettres: 3, cat: "divers" },
  { mot: "SOC", defs: ["Fer tranchant de la charrue", "Lame qui ouvre le sillon"], lettres: 3, cat: "objet" },
  { mot: "STO", defs: ["Réquisition de travailleurs sous l'Occupation", "Travail obligatoire de 1943"], lettres: 3, cat: "histoire" },
  { mot: "TEE", defs: ["Petit socle de golf", "Support de balle au départ"], lettres: 3, cat: "sport" },
  { mot: "TSAR", defs: ["Empereur de Russie", "Autocrate de toutes les Russies"], lettres: 4, cat: "histoire" },
  { mot: "UNAU", defs: ["Paresseux à deux doigts", "Mammifère arboricole d'Amérique du Sud"], lettres: 4, cat: "animal" },
  { mot: "UR", defs: ["Cité antique de Mésopotamie", "Patrie biblique d'Abraham"], lettres: 2, cat: "géo" },
  { mot: "URE", defs: ["Bovidé sauvage disparu", "Ancêtre du bœuf domestique", "Auroch"], lettres: 3, cat: "animal" },
  { mot: "US", defs: ["Coutumes héritées du passé", "Usages et traditions"], lettres: 2, cat: "divers" },
  { mot: "UT", defs: ["Ancien nom du do en musique", "Première note de la gamme de Gui d'Arezzo"], lettres: 2, cat: "culture" },
  { mot: "UTE", defs: ["Amérindien du Colorado", "Peuple autochtone des Rocheuses"], lettres: 3, cat: "histoire" },

  // ══════════ DÉFINITIONS CODÉES ══════════
  { mot: "IS", defs: ["« Sur la Tille »"], lettres: 2, cat: "code" },
  { mot: "IO", defs: ["« Ah, la vache ! »", "« Elle n'était pas plus belle à poil ! »"], lettres: 2, cat: "code" },
  { mot: "EU", defs: ["« En Normandie » ou « Possédé »", "« Ville à deux lettres normande »"], lettres: 2, cat: "code" },
  { mot: "AY", defs: ["« En Champagne »", "« Vignoble de bulles »"], lettres: 2, cat: "code" },
  { mot: "ÉRATO", defs: ["« Muse de la poésie lyrique »", "« Inspiratrice des poètes amoureux »"], lettres: 5, cat: "code" },
  { mot: "ERSE", defs: ["« Anneau de cordage »", "« Boucle de marin »"], lettres: 4, cat: "code" },
  { mot: "ÉTAI", defs: ["« Soutien de mineur »", "« Appui de charpente »"], lettres: 4, cat: "code" },
  { mot: "ARAIRE", defs: ["« Ancêtre de la charrue »", "« Instrument aratoire primitif »"], lettres: 6, cat: "code" },
  { mot: "ARIA", defs: ["« Air d'opéra »", "« Embarras » ou « Solo lyrique »"], lettres: 4, cat: "code" },
  { mot: "ASTI", defs: ["« Vin italien pétillant »", "« Mousseux piémontais »"], lettres: 4, cat: "code" },
  { mot: "AÈDE", defs: ["« Poète de la Grèce antique »", "« Chanteur homérique »"], lettres: 4, cat: "code" },
  { mot: "ÉMEU / ÉMOU", defs: ["« Grand coureur d'Australie »", "« Volatile des antipodes »"], lettres: 4, cat: "code" },
  { mot: "NASSE", defs: ["« Piège à poissons »", "« Panier dont on ne sort pas »"], lettres: 5, cat: "code" },
  { mot: "ORÉE", defs: ["« Lisière de forêt »", "« Bord du bois »"], lettres: 4, cat: "code" },
  { mot: "ÉPI", defs: ["« Il va contre le courant » (digue)", "« Ouvrage perpendiculaire au rivage »"], lettres: 3, cat: "code" },
  { mot: "ANE", defs: ["« Bête à la foire »", "« Têtu de la ferme »"], lettres: 3, cat: "code" },
  { mot: "RAS", defs: ["« Tissu sans relief »", "« À fleur de »"], lettres: 3, cat: "code" },
  { mot: "SERGE", defs: ["« Tissu à côtes obliques »", "« Étoffe croisée »"], lettres: 5, cat: "code" },
  { mot: "LIED", defs: ["« Mélodie allemande »", "« Chant romantique germanique »"], lettres: 4, cat: "code" },
  { mot: "OPUS", defs: ["« Œuvre musicale numérotée »", "« Numéro de catalogue d'un compositeur »"], lettres: 4, cat: "code" },
  { mot: "INRI", defs: ["« Inscription au-dessus de la Croix »", "« Initiales du Calvaire »"], lettres: 4, cat: "code" },

  // ══════════ GÉOGRAPHIE ══════════
  { mot: "EU", defs: ["Ville normande de Seine-Maritime", "Cité des comtes à deux lettres"], lettres: 2, cat: "géo2" },
  { mot: "DON", defs: ["Fleuve de Russie méridionale", "Cours d'eau cher aux Cosaques"], lettres: 3, cat: "géo2" },
  { mot: "NARA", defs: ["Ancienne capitale impériale japonaise", "Ville aux cerfs sacrés du Japon"], lettres: 4, cat: "géo2" },
  { mot: "URI", defs: ["Canton suisse fondateur", "Berceau helvétique de Guillaume Tell"], lettres: 3, cat: "géo2" },
  { mot: "ZUG", defs: ["Canton suisse (Zoug en français)", "Plus petit canton de Suisse centrale"], lettres: 3, cat: "géo2" },
  { mot: "OURAL", defs: ["Chaîne de montagnes entre Europe et Asie", "Frontière naturelle euro-asiatique"], lettres: 5, cat: "géo2" },
  { mot: "IÉNA", defs: ["Ville de la victoire napoléonienne de 1806", "Bataille prussienne de Napoléon"], lettres: 4, cat: "géo2" },
  { mot: "ELBE", defs: ["Île du premier exil de Napoléon", "Île toscane entre deux empires"], lettres: 4, cat: "géo2" },
  { mot: "ORNE", defs: ["Département ou rivière de Normandie", "Département de la cité épiscopale"], lettres: 4, cat: "géo2" },
  { mot: "ARAL", defs: ["Mer intérieure en voie de disparition", "Lac salé d'Asie centrale asséché"], lettres: 4, cat: "géo2" },
  { mot: "ODER", defs: ["Fleuve frontière entre Allemagne et Pologne", "Cours d'eau de la ligne Oder-Neisse"], lettres: 4, cat: "géo2" },
  { mot: "ADEN", defs: ["Port yéménite sur un golfe célèbre", "Escale historique du détroit de Bab-el-Mandeb"], lettres: 4, cat: "géo2" },
  { mot: "OISE", defs: ["Département ou affluent de la Seine", "Rivière de Picardie et d'Île-de-France"], lettres: 4, cat: "géo2" },
  { mot: "AUDE", defs: ["Département du pays cathare", "Terre de Carcassonne"], lettres: 4, cat: "géo2" },
  { mot: "IRAK", defs: ["Pays de l'ancien entre-deux-fleuves", "État du Tigre et de l'Euphrate"], lettres: 4, cat: "géo2" },
  { mot: "IRAN", defs: ["Ancienne Perse", "Pays du plateau iranien"], lettres: 4, cat: "géo2" },
  { mot: "ORAN", defs: ["Grand port de l'ouest algérien", "Deuxième ville d'Algérie"], lettres: 4, cat: "géo2" },
  { mot: "YSER", defs: ["Fleuve de la bataille de 1914", "Cours d'eau des tranchées belges"], lettres: 4, cat: "géo2" },
  { mot: "LENA", defs: ["Grand fleuve de Sibérie orientale", "Cours d'eau de la Iakoutie"], lettres: 4, cat: "géo2" },

  // ══════════ MYTHOLOGIE ══════════
  { mot: "ÉROS", defs: ["Dieu grec de l'amour", "Archer ailé du désir"], lettres: 4, cat: "mytho2" },
  { mot: "ARÈS", defs: ["Dieu grec de la guerre", "Mars des Grecs"], lettres: 4, cat: "mytho2" },
  { mot: "ATÉ", defs: ["Déesse de l'erreur et de la folie", "Personnification de l'égarement"], lettres: 3, cat: "mytho2" },
  { mot: "ISIS", defs: ["Déesse égyptienne, sœur-épouse d'Osiris", "Grande magicienne du Nil"], lettres: 4, cat: "mytho2" },
  { mot: "OSIRIS", defs: ["Dieu égyptien des morts", "Souverain du royaume des défunts"], lettres: 6, cat: "mytho2" },
  { mot: "SETH", defs: ["Dieu égyptien du chaos et des tempêtes", "Frère meurtrier d'Osiris"], lettres: 4, cat: "mytho2" },
  { mot: "THOT", defs: ["Dieu égyptien de l'écriture à tête d'ibis", "Inventeur divin des hiéroglyphes"], lettres: 4, cat: "mytho2" },
  { mot: "ATON", defs: ["Dieu-soleil d'Akhénaton", "Disque solaire de la religion amarnienne"], lettres: 4, cat: "mytho2" },
  { mot: "HORUS", defs: ["Dieu égyptien à tête de faucon", "Fils d'Isis et d'Osiris"], lettres: 5, cat: "mytho2" },
  { mot: "ÉOLE", defs: ["Dieu grec des vents", "Maître des tempêtes dans l'Odyssée"], lettres: 4, cat: "mytho2" },
  { mot: "ÉRATO", defs: ["Muse de la poésie lyrique", "Inspiratrice des vers amoureux"], lettres: 5, cat: "mytho2" },
  { mot: "CLIO", defs: ["Muse de l'histoire", "Elle tient le rouleau du passé"], lettres: 4, cat: "mytho2" },
  { mot: "THALIE", defs: ["Muse de la comédie", "Elle porte le masque rieur"], lettres: 6, cat: "mytho2" },
  { mot: "PAN", defs: ["Dieu grec mi-homme mi-bouc", "Divinité pastorale à cornes"], lettres: 3, cat: "mytho2" },
  { mot: "STYX", defs: ["Fleuve des Enfers grecs", "Cours d'eau du serment des dieux"], lettres: 4, cat: "mytho2" },
  { mot: "LÉTHÉ", defs: ["Fleuve de l'oubli aux Enfers", "Ses eaux effacent la mémoire"], lettres: 5, cat: "mytho2" },
  { mot: "NAÏADE", defs: ["Nymphe des eaux douces", "Divinité des sources et fontaines"], lettres: 6, cat: "mytho2" },
  { mot: "ORÉADE", defs: ["Nymphe des montagnes", "Divinité des sommets"], lettres: 6, cat: "mytho2" },
  { mot: "DRYADE", defs: ["Nymphe des forêts", "Esprit féminin des arbres"], lettres: 6, cat: "mytho2" },
  { mot: "NÉRÉIDE", defs: ["Nymphe de la mer, fille de Nérée", "Divinité marine des vagues"], lettres: 7, cat: "mytho2" },
  { mot: "MAAT", defs: ["Déesse égyptienne de la justice", "Personnification de l'ordre cosmique"], lettres: 4, cat: "mytho2" },

  // ══════════ MONNAIES ══════════
  { mot: "DONG", defs: ["Monnaie du Vietnam", "Devise de Hanoï"], lettres: 4, cat: "monnaie2" },
  { mot: "BATH / BAHT", defs: ["Monnaie de Thaïlande", "Devise de Bangkok"], lettres: 4, cat: "monnaie2" },
  { mot: "REAL", defs: ["Monnaie du Brésil", "Devise de Brasilia"], lettres: 4, cat: "monnaie2" },
  { mot: "RIAL", defs: ["Monnaie d'Iran", "Devise de Téhéran"], lettres: 4, cat: "monnaie2" },
  { mot: "DINAR", defs: ["Monnaie de plusieurs pays arabes", "Devise d'Alger et de Tunis"], lettres: 5, cat: "monnaie2" },
  { mot: "YUAN", defs: ["Monnaie de la Chine", "Devise de Pékin"], lettres: 4, cat: "monnaie2" },
  { mot: "WON", defs: ["Monnaie de Corée", "Devise de Séoul"], lettres: 3, cat: "monnaie2" },
  { mot: "ROUBLE", defs: ["Monnaie de la Russie", "Devise de Moscou"], lettres: 6, cat: "monnaie2" },
  { mot: "RAND", defs: ["Monnaie d'Afrique du Sud", "Devise de Pretoria"], lettres: 4, cat: "monnaie2" },
  { mot: "ROUPIE", defs: ["Monnaie de l'Inde", "Devise de New Delhi"], lettres: 6, cat: "monnaie2" },
  { mot: "ZLOTY", defs: ["Monnaie de Pologne", "Devise de Varsovie"], lettres: 5, cat: "monnaie2" },
  { mot: "PESO", defs: ["Monnaie du Mexique et d'Argentine", "Devise de Mexico et Buenos Aires"], lettres: 4, cat: "monnaie2" },
  { mot: "LIRE", defs: ["Ancienne monnaie italienne", "Devise de Rome avant l'euro"], lettres: 4, cat: "monnaie2" },
  { mot: "ECU / ÉCU", defs: ["Ancienne monnaie française", "Pièce d'or des rois de France"], lettres: 3, cat: "monnaie2" },
  { mot: "AS", defs: ["Monnaie romaine antique", "Unité de bronze de la République romaine"], lettres: 2, cat: "monnaie2" },
  { mot: "OBOLE", defs: ["Petite monnaie grecque antique", "Prix du passage de Charon"], lettres: 5, cat: "monnaie2" },

  // ══════════ MARINE / ARTISANAT ══════════
  { mot: "ÉTAI", defs: ["Câble qui maintient le mât vers l'avant", "Hauban longitudinal"], lettres: 4, cat: "marine" },
  { mot: "DRISSE", defs: ["Cordage pour hisser une voile", "Elle fait monter les couleurs"], lettres: 6, cat: "marine" },
  { mot: "TOLET", defs: ["Point d'appui de l'aviron", "Cheville du plat-bord"], lettres: 5, cat: "marine" },
  { mot: "NABLE", defs: ["Bouchon d'évacuation d'un bateau", "Ouverture de vidange de coque"], lettres: 5, cat: "marine" },
  { mot: "ESPAR", defs: ["Longue pièce de bois tenant une voile", "Vergue, bôme ou bout-dehors"], lettres: 5, cat: "marine" },
  { mot: "SENNE", defs: ["Grand filet de pêche", "Filet que l'on tire depuis le rivage"], lettres: 5, cat: "marine" },
  { mot: "TAQUET", defs: ["Pièce pour bloquer un cordage", "Il arrête l'écoute sur le pont"], lettres: 6, cat: "marine" },
  { mot: "ÉTRAVE", defs: ["Extrémité avant d'un navire", "Elle fend les vagues"], lettres: 6, cat: "marine" },
  { mot: "SAFRAN", defs: ["Partie immergée du gouvernail", "Pale pivotante sous la coque"], lettres: 6, cat: "marine" },
  { mot: "HAUBAN", defs: ["Câble latéral soutenant le mât", "Gréement dormant de soutien"], lettres: 6, cat: "marine" },
  { mot: "BÔME", defs: ["Espar horizontal de la grand-voile", "Barre qui tient la voile en bas"], lettres: 4, cat: "marine" },
  { mot: "RIS", defs: ["Réduction de la surface d'une voile", "On le prend quand le vent forcit"], lettres: 3, cat: "marine" },
  { mot: "FOC", defs: ["Voile triangulaire d'avant", "Toile à l'étrave"], lettres: 3, cat: "marine" },
  { mot: "LOF", defs: ["Mouvement du bateau vers le vent", "Le contraire d'abattre, en navigation"], lettres: 3, cat: "marine" },
  { mot: "HOUE", defs: ["Outil pour biner la terre", "Lame de jardinier au bout d'un manche"], lettres: 4, cat: "marine" },
  { mot: "ARAIRE", defs: ["Charrue primitive sans roues", "Instrument aratoire ancestral"], lettres: 6, cat: "marine" },
  { mot: "SERPE", defs: ["Outil courbe pour tailler les haies", "Lame recourbée d'émondeur"], lettres: 5, cat: "marine" },
  { mot: "ÉCOUTE", defs: ["Cordage pour orienter une voile", "On la borde ou on la choque"], lettres: 6, cat: "marine" },
  { mot: "NASSE", defs: ["Panier-piège pour attraper des poissons", "Casier de pêcheur en osier"], lettres: 5, cat: "marine" },
];

export const CAT_LABELS: Record<string, string> = {
  géo: "Géo", animal: "Faune", sport: "Sport", archi: "Archi", nature: "Nature",
  science: "Science", mytho: "Mythe", objet: "Objet", gastro: "Gastro", droit: "Droit",
  monnaie: "Monnaie", culture: "Culture", langue: "Langue", histoire: "Histoire",
  divers: "Divers", code: "Déf. codée", géo2: "Géographie", mytho2: "Mythologie",
  monnaie2: "Monnaies", marine: "Marine",
};

export const THEMES = [
  { id: "poncifs", label: "Poncifs", cats: ["géo","animal","sport","archi","nature","science","mytho","objet","gastro","droit","monnaie","culture","langue","histoire","divers"] },
  { id: "code", label: "Déf. codées", cats: ["code"] },
  { id: "geo2", label: "Géographie", cats: ["géo2"] },
  { id: "mytho2", label: "Mythologie", cats: ["mytho2"] },
  { id: "monnaie2", label: "Monnaies", cats: ["monnaie2"] },
  { id: "marine", label: "Marine", cats: ["marine"] },
];

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

export const wordKey = (w: Word) => normalize(w.mot.split("/")[0].trim()) + "_" + w.cat;

export const pickDef = (w: Word) => w.defs[Math.floor(Math.random() * w.defs.length)];

export const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const wiktUrl = (w: Word) => {
  const raw = w.mot.split("/")[0].trim();
  const lower = raw.toLowerCase();
  const properCats = new Set(["géo","géo2","mytho","mytho2"]);
  const forcedProper = new Set(["eire","érin","ienisseï","ases","io","is","ay","aÿ","eu","érato","ute","asti","sées"]);
  const forcedCommon = new Set(["erg","reg","névé"]);
  let isProper = properCats.has(w.cat) || forcedProper.has(lower);
  if (forcedCommon.has(lower)) isProper = false;
  const title = isProper ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  return `https://fr.wiktionary.org/wiki/${encodeURIComponent(title)}`;
};

export interface Stats { [key: string]: { e: number; s: number; last: number; streak: number; f?: number } }

export function buildSmartDeck(words: Word[], stats: Stats): { word: Word; def: string }[] {
  const now = Date.now();
  return words.map(w => {
    const s = stats[wordKey(w)] || { e: 0, s: 0, last: 0 };
    const total = s.e + s.s;
    const errR = total > 0 ? s.e / total : 0.5;
    const days = s.last ? (now - s.last) / 86400000 : 999;
    let wt = total === 0 ? 5 : (s.e >= s.s ? 8 + errR * 3 + Math.min(days / 3, 3) : errR * 2 + Math.min(days / 7, 2));
    if (s.f) wt = Math.min(wt, 0.3); // marked facile: keep in deck but heavily deprioritized
    return { word: w, def: pickDef(w), wt };
  }).sort((a, b) => b.wt - a.wt).map(({ word, def }) => ({ word, def }));
}

export const STORAGE_KEY = "croises-stats-v3";
