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
export const askStep: Pointing = { text: "Tu as des questions ? Clique sur moi, je te réponds !", target: "" };

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
  { question: "Qui est Ȥrk ?", keys: ["qui", "zrk", "ȥrk", "developpeur", "fondateur"], answer: { text: "Un développeur indépendant, fondateur du studio Ȥrk, qui conçoit, développe, sécurise et assure le suivi de ton projet de A à Z, du premier échange à la mise en ligne, en garantissant la cybersécurité et la propriété du produit.", target: guide("apropos-titre") } },
  { question: "Comment ça se passe ?", keys: ["etape", "comment", "deroule", "passe", "methode", "process"], answer: { text: "Voici notre méthode en 3 étapes, telle que décrite sur le site : 1) On échange sur ton idée, tes objectifs et ton budget, en définissant le type de produit souhaité (site vitrine, portfolio, boutique, plateforme rapide, application mobile iOS/Android ou bot Telegram/WhatsApp/Discord). 2) Ȥrk conçoit, développe et teste la solution, tout en intégrant dès le départ la cybersécurité : audit complet, protection des accès et bonnes pratiques pour garantir la sécurité des données. 3) Le projet est mis en ligne, hébergé de façon sécurisée, nous restons disponibles pour le suivi après livraison, et la solution t’appartient vraiment, avec la garantie que la propriété et la sécurité sont assurées.", target: guide("etape-0") } },
  { question: "Quels délais ?", keys: ["delai", "temps", "quand", "rapide", "duree", "semaine"], answer: { text: "Ça dépend de ton projet : demande-le à Ȥrk dès le premier échange, il te suit clairement tout du long.", target: guide("whatsapp") } },
  { question: "Le site m’appartient ?", keys: ["appartient", "proprie", "mien", "a moi", "droits"], answer: { text: "Oui : tu reçois une solution qui t’appartient vraiment.", target: guide("apropos-propriete") } },
  { question: "C’est pour qui ?", keys: ["pour qui", "cible", "client", "particulier", "entreprise", "createur", "communaute", "public"], answer: { text: "Ȥrk accompagne particuliers, créateurs, communautés et entreprises. Que tu sois un indépendant, une association ou une boîte, il s’adapte à ton besoin avec des solutions sur mesure (portfolio, boutique en ligne, application mobile). Il s’occupe de l’apparence, du fonctionnement, des données, de la mise en ligne et du suivi, ce qui évite de devoir coordonner plusieurs prestataires.", target: guide("apropos-metier") } },
  { question: "C’est sécurisé ?", keys: ["secur", "cyber", "hack", "protection", "donnees", "fiable"], answer: { text: "La sécurité n'est pas une option, c'est notre fondation. Nous intégrons la protection des accès et des données dès la phase de conception, pas en après-coup. Un audit complet est réalisé et les meilleures pratiques sont appliquées pour garantir la sécurité de tes informations. L'hébergement est également sécurisé pour assurer la fiabilité et la disponibilité de ton projet.", target: guide("service-3") } },
  { question: "Tu as un Discord ?", keys: ["discord", "serveur", "communaute"], answer: { text: "Oui ! Tu peux rejoindre le serveur Discord de Ȥrk via le bouton dédié, c'est le meilleur endroit pour échanger avec la communauté.", target: guide("discord") } },
  { question: "Y a du support après ?", keys: ["support", "maintenance", "suivi", "apres", "livraison", "aide"], answer: { text: "Oui, le suivi fait partie intégrante de notre méthode. C'est la 3ème étape : après la mise en ligne sécurisée, Ȥrk reste disponible pour assurer le suivi et t'accompagner. Tu n'es pas laissé seul une fois le projet livré.", target: guide("etape-2") } },
  { question: "Tu travailles seul ?", keys: ["seul", "equipe", "equipe", "interlocuteur", "qui fait"], answer: { text: "Oui, Ȥrk est un développeur indépendant. Tu bénéficies d’un interlocuteur unique du premier échange jusqu’à la livraison. Tu parles directement avec la personne qui conçoit ton projet, ce qui simplifie la communication, assure un suivi clair et régulier, et garantit un engagement total sur la durée.", target: guide("apropos-engagements") } },
  { question: "Tu fais des apps mobiles ?", keys: ["app", "mobile", "ios", "android", "appstore", "playstore", "bot", "telegram", "whatsapp", "discord"], answer: { text: "Oui ! Ȥrk développe des applications mobiles iOS et Android prêtes à être publiées sur l'App Store et le Play Store. Nous créons aussi des bots et automatisations pour Telegram, WhatsApp et Discord, ainsi que des sites web (vitrines, portfolios, boutiques).", target: guide("apropos-metier") } },
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

