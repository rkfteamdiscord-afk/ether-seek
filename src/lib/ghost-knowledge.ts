import { halloweenOffer } from "./seasonal-offer";

/**
 * Everything the guide ghost knows and says: the guided tour of each section, the
 * ready-made questions and the fact sheet given to its AI. Data only, all drawn from
 * what the page itself says; the guardian may add details here (see scripts/gardien).
 * Targets are CSS selectors of data-guide anchors on the page.
 */
export type Pointing = { text: string; target: string };

export const offer = `−${halloweenOffer.discountPercent} %`;
export const guide = (name: string) => `[data-guide="${name}"]`;
export const askStep: Pointing = { text: "Tu as des questions sur nos services, la méthode ou la promo ? Clique sur moi, je te réponds avec les infos du site !", target: "" };

/** A short guided tour for each part of the page, each step pointing at what it describes. */
export const tours: Record<string, Pointing[]> = {
  accueil: [
    { text: "Bouh ! Bienvenue chez Ȥrk, un studio digital indépendant. Suis-moi, je te fais la visite !", target: guide("accueil-titre") },
    { text: "Ȥrk transforme ton idée en site web, appli mobile, bot ou outil sur mesure.", target: guide("accueil-texte") },
    { text: "Pour commander, c’est ce bouton orange… et à côté, tu peux rejoindre le Discord !", target: guide("accueil-boutons") },
    { text: "La promesse : sur mesure, sécurisé, et tu parles directement avec Ȥrk.", target: guide("accueil-promesse") },
  ],
  services: [
    { text: "Les sites web : vitrines, portfolios, boutiques… rapides, élégants et faits pour convertir.", target: guide("service-0") },
    { text: "Les applis iOS et Android, prêtes à être publiées sur l’App Store et le Play Store.", target: guide("service-1") },
    { text: "Les bots Telegram, WhatsApp et Discord, ainsi que des outils d'automatisation adaptés à ton activité.", target: guide("service-2") },
    { text: "Et la cybersécurité : audit et protection des accès intégrés dès le départ.", target: guide("service-3") },
  ],
  apropos: [
    { text: "Voici Ȥrk : développeur indépendant et fondateur du studio.", target: guide("apropos-titre") },
    { text: "Il s’occupe de tout : apparence, fonctionnement, données, mise en ligne et suivi. Il accompagne particuliers, créateurs, communautés et entreprises.", target: guide("apropos-metier") },
    { text: "Ses engagements : un seul interlocuteur, du sur mesure, un suivi clair et la sécurité dès le début.", target: guide("apropos-engagements") },
    { text: "Et la solution qu’il te livre t’appartient vraiment !", target: guide("apropos-propriete") },
  ],
  methode: [
    { text: "Étape 1 : vous échangez sur ton idée, tes objectifs et ton budget.", target: guide("etape-0") },
    { text: "Étape 2 : Ȥrk conçoit, développe et teste la solution avec toi, crée les maquettes, intègre les fonctionnalités demandées, puis réalise un audit complet de cybersécurité incluant l’analyse des vulnérabilités, la protection des accès et la mise en place de bonnes pratiques pour sécuriser tes données.", target: guide("etape-1") },
    { text: "Étape 3 : il met ton projet en ligne, hébergé de façon sécurisée, et reste disponible pour le suivi après la livraison.", target: guide("etape-2") },
  ],
  contact: [
    { text: "Pour lancer ton projet, écris à Ȥrk ici : WhatsApp, Discord ou e-mail.", target: guide("contact-boutons") },
    { text: `N’oublie pas le code ${halloweenOffer.code} : ${offer} sur toute prestation !`, target: guide("contact-promo") },
  ],
};

/** Ready-made questions, answered instantly from what the page says. */
export const faq: Array<{ question: string; keys: string[]; answer: Pointing }> = [
  { question: "Tu crées quoi ?", keys: ["cree", "creer", "fais", "faire", "service", "site", "app", "bot", "propose"], answer: { text: "Nous créons des sites web sur mesure – vitrines, portfolios, boutiques – rapides, élégants et optimisés pour convertir. Nous développons des applications iOS et Android prêtes à être publiées sur l’App Store et le Play Store. Nous réalisons des bots Telegram, WhatsApp et Discord ainsi que des outils d’automatisation adaptés à ton activité. Enfin, nous intégrons dès le départ la cybersécurité : audit complet, protection des accès et bonnes pratiques. Découvre nos services ici !", target: guide("service-0") } },
  { question: "Combien ça coûte ?", keys: ["prix", "cout", "coute", "tarif", "combien", "devis", "budget", "cher"], answer: { text: "Chaque projet est sur mesure, donc le prix dépend de ton idée. Écris à Ȥrk : il te répondra directement.", target: guide("whatsapp") } },
  { question: "Il y a une promo ?", keys: ["promo", "code", "reduc", "remise", "offre", "halloween", "pourcent"], answer: { text: `Oui ! ${offer} sur toutes les prestations avec le code ${halloweenOffer.code}. Offre Halloween mentionnée sur le site.`, target: `${guide("promo-bandeau")}, ${guide("contact-promo")}` } },
  { question: "Comment contacter Ȥrk ?", keys: ["contact", "whatsapp", "mail", "joindre", "ecrire", "parler", "appeler", "message"], answer: { text: "Par WhatsApp, Discord ou e-mail : les boutons sont juste là !", target: guide("contact-boutons") } },
  { question: "Comment ça se passe ?", keys: ["methode", "etape", "processus", "comment", "se passe", "demarche"], answer: { text: "C'est simple ! Étape 1 : on échange sur ton idée et tes objectifs. Étape 2 : Ȥrk conçoit, développe et teste la solution avec toi, en intégrant la cybersécurité dès le départ (audit, protection des accès). Étape 3 : mise en ligne sécurisée, suivi après livraison, et la solution t'appartient vraiment.", target: guide("etape-0") } },
  { question: "Qui est Ȥrk ?", keys: ["qui", "zrk", "ȥrk", "developpeur", "fondateur"], answer: { text: "Un développeur indépendant, fondateur du studio Ȥrk, qui accompagne particuliers, créateurs, communautés et entreprises. Il conçoit, développe, sécurise et assure le suivi de ton projet de A à Z, du premier échange à la mise en ligne, en garantissant la cybersécurité et la propriété du produit.", target: guide("apropos-titre") } },
  { question: "Est-ce que je garde la propriété du code ?", keys: ["propriete", "code", "appartient", "intellectuelle", "mienne"], answer: { text: "Oui ! La solution que Ȥrk te livre t'appartient vraiment. Tu as la pleine propriété de ton projet, y compris le code source et les données. C'est un engagement clé du studio : tu es le propriétaire exclusif de ce qui est créé pour toi.", target: guide("apropos-propriete") } },
  { question: "Comment ça se passe ?", keys: ["etape", "comment", "deroule", "passe", "methode", "process"], answer: { text: "Voici notre méthode en 3 étapes, telle que décrite sur le site : 1) On échange sur ton idée, tes objectifs et ton budget. Ensemble, on définit le type de produit qui te correspond le mieux parmi : site vitrine, portfolio, boutique en ligne, plateforme rapide, application mobile iOS/Android ou bot Telegram/WhatsApp/Discord. 2) Ȥrk conçoit, développe et teste la solution, tout en intégrant dès le départ la cybersécurité : audit complet, protection des accès et bonnes pratiques pour garantir la sécurité des données. 3) Le projet est mis en ligne, hébergé de façon sécurisée, nous restons disponibles pour le suivi après livraison, et la solution t’appartient vraiment, avec la garantie que la propriété et la sécurité sont assurées.", target: guide("etape-0") } },
  { question: "Quels délais ?", keys: ["delai", "temps", "quand", "rapide", "duree", "semaine"], answer: { text: "La durée dépend de la complexité de ton projet (un site vitrine est différent d'une application mobile). Ȥrk te donne une estimation claire dès le premier échange, selon le type de produit choisi.", target: guide("whatsapp") } },
  { question: "Est-ce que c’est sécurisé ?", keys: ["securite", "securise", "cybersecurite", "hack", "protection", "donnees"], answer: { text: "La cybersécurité est intégrée dès le départ : audit complet, protection des accès et bonnes pratiques pour sécuriser tes données. L’hébergement est également sécurisé.", target: guide("apropos-engagements") } },
  { question: "Le site m’appartient ?", keys: ["appartient", "proprie", "mien", "a moi", "droits"], answer: { text: "Oui : tu reçois une solution qui t’appartient vraiment.", target: guide("apropos-propriete") } },
  { question: "C’est pour qui ?", keys: ["pour qui", "cible", "client", "particulier", "entreprise", "createur", "communaute", "public"], answer: { text: "Ȥrk accompagne particuliers, créateurs, communautés et entreprises. Que tu sois un indépendant, une association ou une boîte, il s’adapte à ton besoin avec des solutions sur mesure : site vitrine, portfolio, boutique en ligne, application mobile iOS/Android ou bot Telegram/WhatsApp/Discord. Il gère l’ensemble du cycle de vie : conception, développement, intégration de la cybersécurité, mise en ligne sécurisée et suivi après livraison. Cette approche tout-en-un évite de coordonner plusieurs prestataires et garantit une cohérence totale de ton projet, du premier échange jusqu'à la livraison finale.", target: guide("apropos-metier") } },
  { question: "C’est sécurisé ?", keys: ["secur", "cyber", "hack", "protection", "donnees", "fiable"], answer: { text: "La sécurité n'est pas une option, c'est notre fondation. Nous intégrons la protection des accès et des données dès la phase de conception, pas en après‑coup. Un audit complet est réalisé et les meilleures pratiques sont appliquées pour garantir la sécurité de tes informations. Nous appliquons également les principes de notre offre « Cybersécurité » : audit, protection des accès et bonnes pratiques intégrés pour livrer des produits solides et fiables. L'hébergement est sécurisé, assurant fiabilité et disponibilité du projet dès le départ. Comme la solution t'appartient vraiment, cette sécurité protège un actif qui est le tien, garantissant que tes données et ton code restent sous ton contrôle.", target: guide("service-3") } },
  { question: "Tu as un Discord ?", keys: ["discord", "serveur", "communaute"], answer: { text: "Oui ! Tu peux rejoindre le serveur Discord de Ȥrk via le bouton dédié, c'est le meilleur endroit pour échanger avec la communauté.", target: guide("discord") } },
  { question: "Y a du support après ?", keys: ["support", "maintenance", "suivi", "apres", "livraison", "aide"], answer: { text: "Oui, le suivi fait partie intégrante de notre méthode. Après la conception, le développement et les tests réalisés avec toi (étape 2), le projet est mis en ligne de façon sécurisée (étape 3). Ȥrk reste alors disponible pour assurer un suivi clair et régulier. Tu bénéficies d'un interlocuteur unique qui t'accompagne du début à la fin. Grâce à ce suivi, tu peux ajuster ta solution directement avec la personne qui l'a conçue. Comme la solution t'appartient vraiment, tu as le contrôle total sur les évolutions futures, sans dépendre de modèles génériques ou de tiers.", target: guide("etape-2") } },
  { question: "Tu travailles seul ?", keys: ["seul", "equipe", "equipe", "interlocuteur", "qui fait"], answer: { text: "Oui, Ȥrk est un développeur indépendant. Tu bénéficies d’un interlocuteur unique du premier échange jusqu’à la livraison. Tu parles directement avec la personne qui conçoit ton projet, ce qui simplifie la communication et évite les allers-retours inutiles entre plusieurs prestataires. Tu bénéficies d'un suivi clair et régulier, et d'un engagement total sur la durée. Tu n'as pas à coordonner plusieurs prestataires, Ȥrk s'occupe de tout.", target: guide("apropos-engagements") } },
  { question: "Tu fais des apps mobiles ?", keys: ["app", "mobile", "ios", "android", "appstore", "playstore", "bot", "telegram", "whatsapp", "discord"], answer: { text: "Oui ! Ȥrk développe des applications mobiles iOS et Android prêtes à être publiées sur l'App Store et le Play Store. Nous créons aussi des bots et automatisations pour Telegram, WhatsApp et Discord, ainsi que des sites web (vitrines, portfolios, boutiques).", target: guide("apropos-metier") } },
  { question: "Comment ça marche ?", keys: ["methode", "etapes", "processus", "comment", "fonctionne"], answer: { text: "Notre méthode est simple et se déroule en 3 étapes : 1) On échange sur ton idée, tes objectifs et ton budget pour cadrer le projet, définir précisément les fonctionnalités et s'assurer que la vision est alignée avant de commencer. 2) Ȥrk conçoit, développe et teste ta solution — qu'il s'agisse d'un site web, d'une application mobile ou d'un bot — en intégrant la cybersécurité dès la phase de conception. Nous validons chaque étape ensemble pour garantir que le résultat correspond exactement à tes attentes. 3) Le projet est mis en ligne de façon sécurisée et nous assurons le suivi. C'est un interlocuteur unique du début à la fin, et la solution t'appartient vraiment.", target: guide("methode") } },
  { question: "Tu fais des sites e-commerce ?", keys: ["ecommerce", "boutique", "vente", "shop", "panier"], answer: { text: "Oui, Ȥrk développe des boutiques en ligne sur mesure. Contrairement aux plateformes génériques, nous créons une solution adaptée à ton activité, avec une intégration sécurisée des paiements et une expérience utilisateur optimisée. La solution t'appartient vraiment, ce qui te donne le contrôle total sur ta boutique et tes données clients.", target: guide("apropos-metier") } },
  { question: "Le code est à moi ?", keys: ["propriete", "code", "ip", "intellectuelle", "appartient", "mon code"], answer: { text: "Oui, absolument. La solution que nous créons t'appartient vraiment. Tu reçois le code source et tu en as le contrôle total. Ce n'est pas un modèle générique ou un abonnement : c'est ton actif, sécurisé et personnalisé, que tu peux faire évoluer comme tu le souhaites.", target: guide("apropos-engagements") } },
];

export const fallback: Pointing = { text: "Hmm… je ne sais pas, mais voici les 3 étapes de notre méthode : 1) on échange sur ton idée, tes objectifs et ton budget, 2) Ȥrk conçoit, développe, teste et réalise un audit de cybersécurité, 3) le projet est mis en ligne, hébergé de façon sécurisée et nous assurons le suivi. Tu peux aussi contacter Ȥrk directement via WhatsApp.", target: guide("whatsapp") };

// Everything the ghost may say comes from here, which mirrors the page itself.
export const siteFacts = `
Studio : Ȥrk, studio digital indépendant. Ȥrk est un développeur indépendant et le fondateur du studio.
Ce qu'il crée :
- Sites web : sites vitrines, portfolios, boutiques et plateformes rapides, élégants et pensés pour convertir les visiteurs.
- Applications mobiles iOS et Android, prêtes à être publiées sur l'App Store et le Play Store.
- Bots et automatisations : bots Telegram, WhatsApp et Discord, et outils d'automatisation adaptés à l'activité.
- Cybersécurité : audit, protection des accès et bonnes pratiques intégrés pour livrer des produits solides et fiables.
Il s'occupe de l'apparence, du fonctionnement, des données, de la mise en ligne et du suivi.
Il accompagne particuliers, créateurs, communautés et entreprises, sans qu'ils aient à coordonner plusieurs prestataires.
La cybersécurité sert à concevoir des projets plus fiables : accès, données et hébergement réfléchis dès le départ.
Engagements : un interlocuteur unique du premier échange à la livraison ; une solution sur mesure, sans modèle générique ; un suivi clair et régulier ; la sécurité prise en compte dès le début.
Le client parle directement avec la personne qui conçoit son projet, suit son avancement et reçoit une solution qui lui appartient vraiment.
Méthode en 3 étapes : 1) on échange (idée, objectifs, budget) ; 2) Ȥrk conçoit, développe et teste la solution avec le client ; 3) il met le projet en ligne et reste disponible après la livraison.
Contact : WhatsApp, Discord ou e-mail, avec les boutons de la section contact. Il y a aussi un serveur Discord à rejoindre.
Offre Halloween : ${offer} sur toutes les prestations avec le code ${halloweenOffer.code}.
Le site ne donne aucun prix ni aucun délai : chaque projet est sur mesure, il faut demander à Ȥrk.
`.trim();

