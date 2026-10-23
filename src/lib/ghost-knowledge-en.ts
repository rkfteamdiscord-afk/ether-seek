import { halloweenOffer } from "./seasonal-offer";
import { guide, offer, type Pointing } from "./ghost-knowledge";

/**
 * The guide ghost's words in English, the site's default language. Same facts as the
 * French version in ghost-knowledge.ts (the source of siteFacts): never anything the
 * page does not say. The guardian may enrich both files, keeping them in step.
 */
export const askStepEn: Pointing = { text: "Got questions? Click me, I’ll answer!", target: "" };

/** Said in French at the very start, pointing at the language button. */
export const languageHint: Pointing = { text: "Psst… tu parles français ? Clique sur ce gros bouton « Français » : tout le site passe en français, moi compris !", target: guide("langue") };

export const toursEn: Record<string, Pointing[]> = {
  accueil: [
    { text: "Boo! Welcome to Ȥrk, an independent digital studio. Follow me, I’ll show you around!", target: guide("accueil-titre") },
    { text: "Ȥrk turns your idea into a website, mobile app, bot or custom tool.", target: guide("accueil-texte") },
    { text: "To order, it’s this orange button… and next to it, you can join the Discord!", target: guide("accueil-boutons") },
    { text: "The promise: tailor-made, secure, and you talk directly with Ȥrk.", target: guide("accueil-promesse") },
  ],
  services: [
    { text: "Websites: showcase sites, portfolios, shops… fast, elegant and built to convert.", target: guide("service-0") },
    { text: "iOS and Android apps, ready to be published on the App Store and the Play Store.", target: guide("service-1") },
    { text: "Telegram, WhatsApp and Discord bots, plus automation tools tailored to your business.", target: guide("service-2") },
    { text: "And cybersecurity: audits and access protection built in from the start.", target: guide("service-3") },
  ],
  apropos: [
    { text: "Meet Ȥrk: independent developer and founder of the studio.", target: guide("apropos-titre") },
    { text: "He handles everything: look, features, data, going live and follow-up. He works with individuals, creators, communities and companies.", target: guide("apropos-metier") },
    { text: "His commitments: a single contact, tailor-made work, clear follow-up and security from day one.", target: guide("apropos-engagements") },
    { text: "And the solution he delivers truly belongs to you!", target: guide("apropos-propriete") },
  ],
  methode: [
    { text: "Step 1: you talk about your idea, your goals and your budget.", target: guide("etape-0") },
    { text: "Step 2: Ȥrk designs, develops and tests the solution with you, with security built in from the start.", target: guide("etape-1") },
    { text: "Step 3: he puts your project online and stays available for follow-up after delivery.", target: guide("etape-2") },
  ],
  contact: [
    { text: "To start your project, write to Ȥrk here: WhatsApp, Discord or e-mail.", target: guide("contact-boutons") },
    { text: `Don’t forget the code ${halloweenOffer.code}: ${offer} on every service!`, target: guide("contact-promo") },
  ],
};

export const faqEn: Array<{ question: string; keys: string[]; answer: Pointing }> = [
  { question: "What do you build?", keys: ["build", "make", "do", "service", "website", "site", "app", "bot", "offer"], answer: { text: "Tailor-made websites (showcase sites, portfolios, shops), iOS and Android apps, Telegram, WhatsApp and Discord bots, and cybersecurity built in from the start. Here are the services!", target: guide("service-0") } },
  { question: "How much does it cost?", keys: ["price", "cost", "how much", "rate", "quote", "budget", "expensive"], answer: { text: "Every project is tailor-made, so the price depends on your idea. Write to Ȥrk: he will answer you directly.", target: guide("whatsapp") } },
  { question: "Is there a discount?", keys: ["promo", "code", "discount", "deal", "offer", "halloween", "percent", "coupon"], answer: { text: `Yes! ${offer} on every service with the code ${halloweenOffer.code}. It’s the Halloween offer shown on the site.`, target: `${guide("promo-bandeau")}, ${guide("contact-promo")}` } },
  { question: "How do I contact Ȥrk?", keys: ["contact", "whatsapp", "mail", "reach", "write", "talk", "call", "message"], answer: { text: "By WhatsApp, Discord or e-mail: the buttons are right here!", target: guide("contact-boutons") } },
  { question: "Who is Ȥrk?", keys: ["who", "zrk", "ȥrk", "developer", "founder"], answer: { text: "An independent developer, founder of the Ȥrk studio, who works with individuals, creators, communities and companies, from the first conversation to going live.", target: guide("apropos-titre") } },
  { question: "How does it work?", keys: ["step", "how", "process", "method", "work"], answer: { text: "Three steps: 1) we talk about your idea, goals and budget; 2) Ȥrk designs, develops and tests the solution with you; 3) he puts it online and stays available after delivery.", target: guide("etape-0") } },
  { question: "How long does it take?", keys: ["long", "time", "when", "fast", "duration", "week", "deadline"], answer: { text: "The site gives no delay: it depends on your project. Ask Ȥrk, he will tell you in the first conversation.", target: guide("whatsapp") } },
  { question: "Is it secure?", keys: ["secur", "cyber", "hack", "protection", "data", "safe", "reliable"], answer: { text: "Security is built in from the start: audits, access protection and best practices. Access, data and hosting are thought through seriously from day one.", target: guide("service-3") } },
  { question: "Do I own the site?", keys: ["own", "belong", "mine", "rights", "property"], answer: { text: "Yes: you receive a solution that truly belongs to you.", target: guide("apropos-propriete") } },
  { question: "Who is it for?", keys: ["who for", "for who", "client", "individual", "company", "business", "creator", "community"], answer: { text: "Ȥrk works with individuals, creators, communities and companies, so you never have to coordinate several providers.", target: guide("apropos-metier") } },
  { question: "Do you have a Discord?", keys: ["discord", "server", "community"], answer: { text: "Yes! You can join Ȥrk’s Discord server with the dedicated button.", target: guide("discord") } },
  { question: "Is there support afterwards?", keys: ["support", "maintenance", "follow", "after", "delivery", "help"], answer: { text: "Yes: after putting your project online, Ȥrk stays available for clear, regular follow-up, as your single contact.", target: guide("etape-2") } },
];

export const fallbackEn: Pointing = { text: "Hmm… I don’t know, but you can ask Ȥrk directly on WhatsApp!", target: guide("whatsapp") };

/** The ghost's panel, in both languages. */
export const ghostUi = {
  en: { hello: "Boo! Ask me anything about Ȥrk, or pick a question. I’ll show you the answer on the page.", ask: "Ask the ghost a question", dialog: "Questions for the ghost", title: "Ask me a question!", close: "Close the questions", thinking: "The ghost is thinking", label: "Your question", placeholder: "Type your question…", send: "Ask", note: "Typed questions are sent to an AI service (Groq or Pollinations) to answer you. Nothing is saved on the site." },
  fr: { hello: "Bouh ! Pose-moi n’importe quelle question sur Ȥrk, ou choisis-en une. Je te montre la réponse sur la page.", ask: "Poser une question au fantôme", dialog: "Questions au fantôme", title: "Pose-moi une question !", close: "Fermer les questions", thinking: "Le fantôme réfléchit", label: "Ta question", placeholder: "Écris ta question…", send: "Demander", note: "Les questions écrites sont envoyées à un service d’IA (Groq ou Pollinations) pour te répondre. Rien n’est enregistré sur le site." },
};
