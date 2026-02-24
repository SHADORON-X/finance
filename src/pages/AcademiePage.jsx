import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, CheckCircle2, Circle, Flame, Brain,
    Crown, Target, Sparkles, ChevronDown, ChevronRight,
    TrendingUp, Shield, Zap, Star, Calendar, ScrollText,
    Edit3, Save, X, AlertCircle, Award, Lock,
    Sword, ShieldCheck, HelpCircle, Timer, Wrench, Plus, Trash2,
    Upload, Library, FileText, Loader
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { useAuthStore } from '../store';
import BookReader from '../components/BookReader';
import { uploadBook, getUserBooks, deleteBook } from '../services/bookService';
import toast from 'react-hot-toast';

// ============================================================
// BIBLIOTHÈQUE IMPÉRIALE — 10 Livres Fondateurs
// ============================================================
const BOOKS = [
    {
        id: 'rich_dad',
        title: 'Père Riche, Père Pauvre',
        author: 'Robert Kiyosaki',
        year: 1997,
        pages: 336,
        readTime: '6–8h',
        emoji: '💰',
        color: 'amber',
        category: 'Finance',
        phase: 'Semaine 1',
        tagline: 'Actifs vs Passifs. Transformer ta vision fondamentale de l\'argent.',
        keyLesson: 'Le pauvre travaille pour l\'argent. Le riche fait travailler l\'argent pour lui.',
        quote: '"Les pauvres et la classe moyenne travaillent pour l\'argent. Les riches font travailler l\'argent pour eux."',
        summary: 'Kiyosaki compare deux "pères" : son père biologique instruit mais pauvre, et le père de son ami — peu diplômé mais riche. Le livre centrale sur la différence entre actifs (ce qui met de l\'argent dans ta poche) et passifs (ce qui prend de l\'argent). Il démystifie l\'idée que l\'école préprare à la richesse et révèle pourquoi des gens riches ne se noient jamais, tandis que les gens éducés restent dans la course aux rats.',
        chapters: [
            {
                title: 'La leçon que le père riche m\'a enseignée',
                summary: 'Introduction de la "course des rats" : travailler toute sa vie pour payer bills et impôts, sans jamais s\'enrichir réellement. La leçon fondamentale : les riches ne travaillent pas pour l\'argent — ils construisent des actifs qui génèrent de l\'argent. Kiyosaki et son ami commencent à travailler pour "Père Riche" et comprennent que la vraie connaissance financière passe par l\'expérience, pas le diplôme.',
            },
            {
                title: 'Pourquoi enseigner la maîtrise financière ?',
                summary: 'La différence entre actif et passif expliquée simplement : un actif = quelque chose qui met de l\'argent dans ta poche. Un passif = quelque chose qui sort de l\'argent. Ta maison n\'est PAS un actif si elle te coûte chaque mois. L\'intelligence financière (QI financier) se développe par l\'éducation, pas l\'école classique.',
            },
            {
                title: 'Occupe-toi de tes propres affaires',
                summary: 'Kiyosaki insiste sur la colonne "Actifs" du bilan. La plupart des gens remplissent la colonne "Revenu" (salaires) sans jamais construire la colonne "Actifs". L\'objectif : bâtir une base d\'actifs productifs (investissements, business, immobilier, brevets) AVANT d\'augmenter ses dépenses.',
            },
            {
                title: 'L\'histoire de la taxe et l\'intelligence',
                summary: 'Comment les impôts ont été inventés pour les riches mais ont fini par punir les pauvres. Les riches utilisent des sociétés pour protéger leurs actifs légalement. Concept de "Intelligence Financière" : gagner plus, dépenser moins, savoir utiliser la loi à son avantage.',
            },
            {
                title: 'Les riches inventent l\'argent',
                summary: 'L\'argent n\'est pas réel — c\'est une fabrication humaine. Les gens financièrement intelligents créent des occasions là où d\'autres ne voient rien. Il faut développer une "intelligence créative financière" : voir des deals où les autres voient des problèmes. La peur paralyse l\'action ; l\'action crée la richesse.',
            },
            {
                title: 'Il faut apprendre pour travailler',
                summary: 'Chapitre final : ne cherche pas la sécurité d\'emploi — cherche à apprendre. Les compétences combinées valent plus qu\'un seul expertise. Kiyosaki recommande d\'apprendre la vente, la communication, la comptabilité, le droit. Le but : construire un système financier personal robuste.',
            },
        ],
        applyTask: 'Dresse ta liste d\'actifs actuels. Pour chaque unité gagnée ce mois, quelle portion va en actifs ?',
        biases: ['Travailler pour l\'argent au lieu de faire travailler l\'argent', 'Confondre revenu et richesse', 'Penser que la maison est un actif'],
    },
    {
        id: 'babylon',
        title: 'L\'Homme le Plus Riche de Babylone',
        author: 'George S. Clason',
        year: 1926,
        pages: 208,
        readTime: '4–5h',
        emoji: '🏛️',
        color: 'blue',
        category: 'Finance',
        phase: 'Semaine 2',
        tagline: 'Les 7 lois de l\'or. Simple, puissant, intemporel.',
        keyLesson: 'Commence d\'abord à te payer toi-même. 10% minimum de tout ce que tu gagnes.',
        quote: '"Une partie de tout ce que tu gagneras est à toi de garder. Pas moins d\'un dixième."',
        summary: 'À travers des paraboles situées dans l\'ancienne Babylone, Clason expose des principes financiers universels et intemporels. Des personnages comme Arkad (l\'homme le plus riche de Babylone) révèlent les secrets pour bâtir une fortune : épargner systématiquement, investir prudemment, apprendre à distinguer bons et mauvais conseils. Chaque parabole encode une loi précise.',
        chapters: [
            {
                title: 'L\'homme qui désirait de l\'or',
                summary: 'Bansir le luthier et Kobbi le musicien sont fatigués d\'être pauvres malgré leur travail. Ils consultent Arkad, leur ami devenu riche. Leçon : le désir seul ne suffit pas — il faut une méthode. Arkad révèle que sa richesse a commencé par un choix simple mais radical.',
            },
            {
                title: 'Le plus riche homme de Babylone',
                summary: 'Arkad révèle son secret : "Commence à te payer toi-même." Avant toute dépense, garde 10% de tes revenus. Ce n\'est pas ce que tu gagnes qui compte — c\'est ce que tu gardes. L\'argent gardé devient lui-même un travailleur infatigable qui génère plus d\'argent.',
            },
            {
                title: 'Sept remèdes pour une bourse légère',
                summary: 'Les 7 principes fondamentaux : 1) Épargne 10%, 2) Contrôle tes dépenses, 3) Fais croître ton or (investissement), 4) Protège ton trésor des pertes (ne pas risquer le capital), 5) Rends ta demeure profitable, 6) Assure des revenus futurs (protection sociale/vieillesse), 7) Développe ta capacité à gagner.',
            },
            {
                title: 'La déesse de la Chance',
                summary: 'La chance favorise l\'action. Les hommes qui saisissent les opportunités sont "chanceux" ; ceux qui hésitent la voient passer. Clé : sois prêt — quand l\'opportunité frappe, tu dois avoir des fonds disponibles et la connaissance pour agir vite.',
            },
            {
                title: 'Les cinq lois de l\'or',
                summary: 'L\'or obéit à des lois : 1) L\'or vient à l\'homme qui épargne, 2) L\'or travaille pour l\'homme qui le place prudemment, 3) L\'or reste avec l\'homme prudent, 4) L\'or fuit l\'homme qui l\'investit dans des domaines qu\'il ne connaît pas, 5) L\'or fuit l\'homme qui écoute des conseils d\'imposteurs.',
            },
            {
                title: 'Le prêteur d\'or de Babylone',
                summary: 'Ne jamais mélanger amitié et argent dans un prêt non structuré. L\'histoire du prêt à un ami bouclier-maker illustre la 4ème loi : investir dans un domaine sans expertise = perdre son capital. La prudence avant la confiance aveugle.',
            },
            {
                title: 'Les murs de Babylone',
                summary: 'La protection est une forme de richesse. Les murs de Babylone protégeaient ses richesses comme les assurances et fonds d\'urgence protègent les nôtres. Conclusion : bâtir une forteresse financière (fonds de sécurité, assurances) avant de chercher la croissance.',
            },
        ],
        applyTask: 'Automatise l\'épargne de 10% dès demain. Quel montant EXACT retires-tu chaque mois peu importe les circonstances ?',
        biases: ['Dépenser avant d\'épargner', 'Croire que les petits montants ne comptent pas', 'Écouter des conseils non-qualifiés'],
    },
    {
        id: 'psychology_money',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        year: 2020,
        pages: 256,
        readTime: '5–6h',
        emoji: '🧠',
        color: 'purple',
        category: 'Psychologie',
        phase: 'Semaine 3',
        tagline: 'Ton blocage n\'est pas mathématique — il est mental.',
        keyLesson: 'Être riche et accumuler de la richesse sont deux choses différentes. La plupart des gens ne voient pas cette distinction.',
        quote: '"La richesse est ce que tu ne vois pas. C\'est la voiture non achetée, la montre non portée, la rénovation non faite."',
        summary: 'Housel démontre que la finance est moins une science des chiffres qu\'une science du comportement humain. À travers 19 histoires courtes, il révèle comment nos biais psychologiques, notre rapport à l\'ego et à la chance, nos définitions de succès influencent chaque décision financière. Un livre pour comprendre POURQUOI tu fais ce que tu fais avec l\'argent.',
        chapters: [
            {
                title: 'Personne n\'est fou',
                summary: 'Chaque personne prend des décisions financières basées sur son expérience unique du monde. Les choix qui semblent irrationnels aux autres ont du sens dans le contexte de vie de la personne. Il n\'y a pas un comportement financier universel "correct" — mais certains comportements sont objectivement plus efficaces.',
            },
            {
                title: 'La chance et le risque',
                summary: 'Ni tout succès ni tout échec ne sont 100% dus à l\'individu. La chance joue un rôle sous-évalué dans la richesse. Warren Buffett doit une grande part de sa fortune au lieu et à l\'époque où il est né. Leçon : sois humble face au succès, et prudent face à l\'échec des autres.',
            },
            {
                title: 'Jamais assez',
                summary: 'Les gens les plus riches du monde ont pris des risques démesurés pour plus d\'argent alors qu\'ils en avaient déjà suffisamment. La comparaison sociale est un jeu infini. Apprendre QUAND s\'arrêter est la vraie sagesse financière. Connaître ton "assez" te libère.',
            },
            {
                title: 'La confusion entre richesse et fortune',
                summary: 'La "fortune" (richesse visible) ≠ la vraie richesse. Les gens qui roulent en Ferrari sont souvent moins riches que ceux qui conduisent une vieille voiture et investissent. Le vrai symbole de richesse est invisible : épargne, investissements, liberté. La richesse, c\'est l\'argent que tu n\'as PAS encore dépensé.',
            },
            {
                title: 'L\'économie et l\'investissement',
                summary: 'Sur le long terme, l\'investissement régulier bat presque toutes les stratégies complexes. La patience et la constance surpassent l\'intelligence. Charlie Munger : "Le premier principe est de ne jamais perdre d\'argent." La règle n°2 : ne jamais oublier la règle n°1.',
            },
            {
                title: 'Les queues font bouger tout',
                summary: 'La plupart des gains et des pertes viennent d\'extrêmes — les "queues" de la distribution. Buffett a réalisé 99% de sa richesse après ses 65 ans. La magie des intérêts composés ne se voit pas pendant longtemps, puis elle devient explosive. Patience absolue.',
            },
            {
                title: 'La liberté',
                summary: 'L\'objectif ultime de l\'argent : te donner le contrôle de ton temps. Faire ce que tu veux, quand tu veux, avec qui tu veux. Ce n\'est pas la voiture, ni la maison. La richesse ≠ le niveau de vie. La richesse = la liberté de temps.',
            },
            {
                title: 'Le paradoxe de l\'homme dans la voiture',
                summary: 'Quand tu vois quelqu\'un dans une Ferrari, tu ne penses pas à LUI — tu imagines comment tu auras l\'air dans cette voiture. Personne n\'admire le propriétaire de la Ferrari autant que vous le pensez. Les achats pour le statut sont une illusion. Dépenser pour paraître riche empêche de devenir riche.',
            },
            {
                title: 'La richesse est ce que tu ne vois pas',
                summary: 'Être riche c\'est avoir des actifs non déployés, de l\'épargne non touchée, des options ouvertes. Les dépenses visibles (voitures, montres) DIMINUENT la richesse. La richesse se crée en résistant à l\'envie de la dépenser. Développer une tolérance pour retarder la gratification.',
            },
            {
                title: 'Économise de l\'argent',
                summary: 'Tu n\'as pas besoin d\'une raison précise pour épargner. L\'épargne donne flexible, optionalité, et liberté. Dans un monde incertain, avoir des réserves te donne un avantage enorme. Les gens avec épargne peuvent saisir des opportunités que les autres ne peuvent pas saisir.',
            },
        ],
        applyTask: 'Identifie tes 3 biais principaux. Écris UNE décision récente où chaque biais t\'a coûté de l\'argent.',
        biases: ['Confondre chance et compétence', 'Vouloir paraître riche plutôt qu\'être riche', 'Comparer sa situation à celle des autres', 'Sous-estimer la patience nécessaire'],
    },
    {
        id: 'atomic_habits',
        title: 'Atomic Habits',
        author: 'James Clear',
        year: 2018,
        pages: 320,
        readTime: '6–7h',
        emoji: '⚡',
        color: 'emerald',
        category: 'Productivité',
        phase: 'Semaine 4',
        tagline: '1% mieux chaque jour = 37x mieux en 1 an.',
        keyLesson: 'Tu ne t\'élèves pas au niveau de tes objectifs. Tu tombes au niveau de tes systèmes.',
        quote: '"Vous ne montez pas au niveau de vos objectifs. Vous tombez au niveau de vos systèmes."',
        summary: 'James Clear explique la science derrière la formation des habitudes avec une méthode en 4 étapes (Signal → Envie → Réponse → Récompense). Le livre démontre que les petits changements de 1% semblent insignifiants mais deviennent révolutionnaires avec le temps. L\'identité est la clé : tu ne cherches pas à courir un marathon — tu deviens "un coureur".',
        chapters: [
            {
                title: 'Les surprenants pouvoirs des petites habitudes',
                summary: 'L\'amélioration de 1% par jour donne 37x plus en un an. Mais le inverse est vrai : 1% de régression = quasi zéro en un an. Les habitudes sont des intérêts composés du comportement. Le problème : les effets des habitudes ne sont pas visibles immédiatement — il faut traverser le "plateau de potentiel latent".',
            },
            {
                title: 'Comment vos habitudes vous façonnent',
                summary: 'Les habitudes façonnent l\'identité, et l\'identité façonne les habitudes. Le changement le plus puissant commence par "Je suis quelqu\'un qui..." plutôt que "Je veux...". Chaque action que tu fais est un vote pour le type de personne que tu veux devenir. Accumule des preuves de ta nouvelle identité.',
            },
            {
                title: 'La meilleure façon de changer',
                summary: 'Le modèle en 4 étapes : Signal (déclencheur) → Envie (motivation) → Réponse (action) → Récompense (satisfaction). Pour créer une bonne habitude : rendre le signal évident, l\'envie attrayante, la réponse facile, la récompense satisfaisante. Pour briser une mauvaise : inverser chaque étape.',
            },
            {
                title: 'L\'homme qui finit par courir',
                summary: '"L\'implémentation des intentions" : planifier quand et où tu réaliseras une habitude triple la probabilité de l\'exécuter. "J\'irai à la gym le lundi à 18h à la salle X." Le "empilement d\'habitudes" : accrocher une nouvelle habitude à une existante. Après [HABITUDE ACTUELLE], je ferai [NOUVELLE HABITUDE].',
            },
            {
                title: 'La motivation est surévaluée — L\'environnement compte plus',
                summary: 'L\'environnement est le chef invisible de notre comportement. Modifier ton espace physique est plus puissant que la discipline. Rends les bonnes habitudes évidentes et les mauvaises invisibles. Si tu veux épargner, automatise le virement. Si tu veux pas gaspiller, supprime l\'app de livraison.',
            },
            {
                title: 'La règle des deux minutes',
                summary: 'Pour commencer une habitude : réduis-la à moins de 2 minutes d\'effort. "Lire 30 pages" → "Ouvrir le livre". "Méditer 20 min" → "Poser le coussin". Une fois lancé, continuer est naturel. L\'action de démarrage doit coûter zero effort. La friction est l\'ennemi de l\'habitude.',
            },
            {
                title: 'Comment rester concentré dans un monde distrayant',
                summary: 'Le sentiment de progression motive. Utilise des "habit trackers" visuels : ne brise pas la chaîne ! L\'objectif n\'est pas la perfection mais la constance. La règle : ne jamais rater deux fois de suite. Un jour raté ≠ échec. Deux jours = nouvelle mauvaise habitude.',
            },
        ],
        applyTask: 'Lance 3 habitudes financières. Chacune DOIT prendre moins de 2 minutes. Identifie le signal déclencheur pour chacune.',
        biases: ['Attendre la motivation pour agir', 'Vouloir tout changer d\'un coup', 'Négliger l\'environnement comme générateur d\'habitudes'],
    },
    {
        id: 'lean_startup',
        title: 'The Lean Startup',
        author: 'Eric Ries',
        year: 2011,
        pages: 336,
        readTime: '7–8h',
        emoji: '🚀',
        color: 'rose',
        category: 'Business',
        phase: 'Semaine 5',
        tagline: 'Ne gaspille rien. Teste, mesure, ajuste. Velmo doit fonctionner ainsi.',
        keyLesson: 'Construis — Mesure — Apprends. Chaque décision business doit être un test avec des données.',
        quote: '"La seule façon de gagner, c\'est d\'apprendre plus vite que tout le monde."',
        summary: 'Ries révolutionne l\'approche entrepreneuriale avec la méthode "Build-Measure-Learn". Au lieu d\'élaborer un plan parfait pendant des mois, tu lances un MVP (Minimum Viable Product) rapidement, collectes des données réelles, et tu ajustes. Le gaspillage n\'est pas de l\'argent dépensé — c\'est du temps passé à construire ce que les clients ne veulent pas.',
        chapters: [
            { title: 'Vision : Démarrer', summary: 'L\'entrepreneuriat requiert une vision managériale nouvelle. Chaque startup est une expérience humaine. La question n\'est pas "peut-on construire ?" mais "doit-on construire ?". Le validated learning (apprentissage validé) est la seule unité de progrès qui compte.' },
            { title: 'Définir : La valeur et le gaspillage', summary: 'Dans une startup, tout ce qui ne contribue pas à apprendre ce que les clients veulent est du gaspillage. Même des fonctionnalités parfaites et livrations parfaites sont du gaspillage si personne ne les voulait. Redéfinir la productivité : non pas "livrer des features" mais "valider des hypothèses".' },
            { title: 'Apprendre : Validated Learning', summary: 'L\'apprentissage validé ≠ post-mortem ou impression. C\'est des données réelles de vrais clients. Chaque hypothèse business doit être testable. Zappos a commencé par vendre des chaussures en ligne avec des photos de chaussures existantes — avant même d\'avoir de stock.' },
            { title: 'Expérimenter : Le test de la valeur', summary: 'Deux questions fondamentales : 1) Est-ce que les clients veulent ce produit ? (hypothèse de valeur) 2) Si oui, comment grandir ? (hypothèse de croissance). Tester ces hypothèses avec le minimum de ressources possible : MVP, landing pages, prototypes papier.' },
            { title: 'Pivoter ou persévérer', summary: 'Un "pivot" = changer de stratégie sans changer de vision. Groupon a commencé comme un site de plaidoyer politique. Pinterest était une app de shopping. Le pivot ne signifie pas l\'échec — c\'est de l\'apprentissage accéléré. La question : mes données actuelles me disent-elles de pivoter ou d\'accélérer ?' },
            { title: 'Accélérer : Batchs et files d\'attente', summary: 'Travailler en petits batchs accélère l\'apprentissage et réduit le gaspillage. Paradoxalement, livrer souvent et en petites quantités est plus efficace que de grandes livraisons rares. Cela permet un feedback rapide et des corrections avant que les erreurs ne s\'accumulent.' },
            { title: 'Croître : Les moteurs de croissance', summary: 'Il existe 3 moteurs de croissance : viral (les clients recrutent des clients), sticky (rétention forte : les clients restent), payé (investir en acquisition client rapporte plus que ça ne coûte). Identifier le bon moteur pour Velmo et le mesurer rigoureusement.' },
        ],
        applyTask: 'Définis 1 hypothèse sur Velmo. Conçois un test de 7 jours pour la valider avec de vraies données. Lance-le.',
        biases: ['Construire sans tester', 'Confondre occupation et progression', 'Lancer un produit "parfait" trop tard'],
    },
    {
        id: 'think_grow_rich',
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        year: 1937,
        pages: 320,
        readTime: '6–7h',
        emoji: '👑',
        color: 'amber',
        category: 'Mindset',
        phase: 'Semaine 6',
        tagline: 'Les 13 principes de la richesse. Brûler les vaisseaux.',
        keyLesson: 'Ce que l\'esprit peut concevoir et croire, il peut l\'accomplir.',
        quote: '"Les pensées sont des choses, et des choses puissantes quand elles sont mélangées au caractère, au but et à la volonté."',
        summary: 'Hill a interviewé 500 des personnes les plus riches d\'Amérique (dont Andrew Carnegie, Ford, Edison) pendant 20 ans pour identifier les principes universels de la richesse. Le résultat : 13 principes — du désir brûlant à la maîtrise de soi — qui forment la philosophie complète de la réussite financière.',
        chapters: [
            { title: 'Le désir brûlant', summary: 'Le point de départ de tout accomplissement : un désir précis, intense, obsessionnel. Pas un souhait vague mais un but chiffré avec une date, un plan d\'action, et une répétition quotidienne. Edison a essayé 10 000 fois avant la lumière — parce que son désir était BRÛLANT.' },
            { title: 'La foi et la visualisation', summary: 'La foi est un état d\'esprit qui peut être induit par des affirmations répétées. Visualiser son objectif comme déjà accompli programme le subconscient à travailler vers ce but. Auto-suggestion : se parler à soi-même avec une intention positive et spécifique, chaque jour.' },
            { title: 'L\'auto-suggestion', summary: 'Le subconscient accepte et agit sur les pensées que l\'esprit conscient lui envoie. Techniques pratiques : écrire son désir chiffré, le lire à voix haute matin et soir avec conviction, visualiser l\'état désiré avec émotion. L\'émotion amplifie le message.' },
            { title: 'La connaissance spécialisée', summary: 'La connaissance générale ne vaut rien en finance. Il faut une connaissance SPÉCIALISÉE dans son domaine. Savoir où trouver cette connaissance (mentors, livres, formations) vaut plus que de la posséder soi-même. Henry Ford avait une armée d\'experts à portée de bouton.' },
            { title: 'L\'imagination', summary: 'Il existe deux types d\'imagination : synthétique (recombiner les anciennes idées) et créatrice (inspiration pure, sixième sens). Les grandes fortunes sont bâties sur l\'imagination créatrice : voir CE QUI N\'EXISTE PAS ENCORE et le matérialiser.' },
            { title: 'La planification organisée', summary: 'Un désir sans plan n\'est qu\'un souhait. Créer une "Master Mind Alliance" : un groupe de personnes complémentaires qui travaillent vers un but commun. Chaque membre apporte ce que les autres n\'ont pas. Alone you go fast, together you go far.' },
            { title: 'La décision — Le secret de tous les leaders', summary: 'La procrastination est l\'ennemi de la richesse. Les gens riches décident vite (parce qu\'ils ont des valeurs claires) et changent d\'avis lentement. Les pauvres décident lentement et changent vite. L\'indécision accumule les intérêts de la peur.' },
        ],
        applyTask: 'Écris ton désir financier précis : montant exact, date exacte, plan d\'action en 3 étapes. Lis-le à voix haute chaque matin.',
        biases: ['Désirs vagues sans engagement', 'Peur de l\'échec', 'Attendre conditions parfaites pour démarrer'],
    },
    {
        id: 'millionaire_fastlane',
        title: 'The Millionaire Fastlane',
        author: 'MJ DeMarco',
        year: 2011,
        pages: 352,
        readTime: '7–8h',
        emoji: '🛣️',
        color: 'orange',
        category: 'Business',
        phase: 'Semaine 7',
        tagline: 'Refuse la route lente. Produis de la valeur, contrôle les systèmes.',
        keyLesson: 'La richesse n\'est pas une destination avec une carte prédéfinie — c\'est un véhicule que toi, tu construis.',
        quote: '"Arrêtez d\'échanger du temps contre de l\'argent. Construisez des systèmes qui génèrent de l\'argent pendant que vous dormez."',
        summary: 'DeMarco démantèle le mythe "travaille dur toute ta vie et tu seras riche à 65 ans" (la "Slowlane"). Il révèle la "Fastlane" : créer des systèmes de production de valeur (entreprises, IP, logiciels) qui brisent le lien entre temps personnel et revenu. La clé : contrôler les variables qui déterminent ton revenu.',
        chapters: [
            { title: 'Arrêtez d\'être pauvre de l\'esprit', summary: 'La richesse n\'est pas une maison ou une voiture — c\'est une Famille, la Santé, et la Liberté. Les gens riches contrôlent leur temps. Les gens pauvres échangent leur temps. La vraie richesse = liberté de faire ce que tu veux, quand tu veux.' },
            { title: 'La Sidewalk — Le chemin de la pauvreté', summary: 'Le "Sidewalker" vit au jour le jour, dépense tout ce qu\'il gagne, blâme tout le monde sauf lui. C\'est la mentalité du "je mérite" sans construire de valeur. Un accident médical ou une perte d\'emploi = catastrophe totale.' },
            { title: 'La Slowlane — Le chemin de la médiocrité', summary: 'Aller à l\'école, trouver un bon travail, épargner, investir à long terme, profiter à 65 ans. Le problème : les variables clés (salaire, marché boursier) ne sont pas sous ton contrôle. Et tu échanges tes meilleures années contre de l\'argent.' },
            { title: 'La Fastlane — Construire un système', summary: 'La Fastlane = créer un véhicule (business/IP) qui produit de la valeur massivement et que tu contrôles. Critères CENTS : Contrôle (tu contrôles les variables), Entrée (barrières à l\'entrée élevées), Besoin (tu résous un vrai problème), Temps (le revenu est découplé du temps), Échelle (peut toucher des milliers de personnes).' },
            { title: 'Les 5 commandements de la Fastlane', summary: 'CENTS : Contrôle, Entrée, Besoin, Temps (time-independence), Échelle. Ton business doit satisfaire TOUS ces critères. Un job n\'en satisfait aucun. Un business Velmo peut les satisfaire tous si c\'est construit correctement.' },
            { title: 'L\'accélérateur — La production de valeur', summary: 'La richesse s\'accumule en produisant de la valeur pour un grand nombre de personnes. La formule : Richesse = Valeur Produite × Nombre de Personnes Atteintes. Plus tu touches de monde avec une solution réelle, plus tu crées de richesse. Velmo = solution pour qui exactement ?' },
            { title: 'Le sens de la vitesse', summary: 'L\'exécution compte plus que l\'idée. Une bonne idée bien exécutée > une excellente idée mal exécutée. La vitesse est un avantage compétitif. Payer pour la vitesse (outils, délégation, formation) est un investissement, pas une dépense.' },
        ],
        applyTask: 'Évalue Velmo sur le filtre CENTS. Quels critères sont remplis ? Quels ajustements pour satisfaire les 5 ?',
        biases: ['Relier temps et revenu', 'Attendre une permission pour créer', 'Construire sans penser à l\'échelle'],
    },
    {
        id: 'essentialism',
        title: 'Essentialism',
        author: 'Greg McKeown',
        year: 2014,
        pages: 272,
        readTime: '5–6h',
        emoji: '🎯',
        color: 'blue',
        category: 'Productivité',
        phase: 'Semaine 8',
        tagline: 'Moins mais mieux. La discipline du choix.',
        keyLesson: 'Si tu ne priorises pas ta vie, quelqu\'un d\'autre le fera.',
        quote: '"L\'essentialisme n\'est pas comment faire plus en moins de temps. C\'est comment faire moins mais mieux, pour que chaque chose compte vraiment."',
        summary: 'McKeown plaide pour une vie et un travail radicalement focalisés : dire non à presque tout pour dire OUI profondément à ce qui compte vraiment. Dans un monde où tout crie pour ton attention (et ton argent), l\'essentialisme est une protection contre la médiocrité dilution. Appliqué aux finances : dépenser moins mais avec plus d\'intention.',
        chapters: [
            { title: 'Le paradigme essentialiste', summary: 'L\'essentialiste ne se demande pas "Comment tout faire ?" mais "Qu\'est-ce qui est vital ?". Dans le monde financier : tu ne peux pas maximiser chaque dépense. Tu dois choisir. L\'essentialisme est moins une stratégie qu\'une façon d\'être.' },
            { title: 'Discerner : la quête de moins', summary: 'Explorer plusieurs options avant de s\'engager. Prendre du temps pour penser, lire, jouer, écouter. Les décisions les plus importantes méritent l\'espace mental nécessaire. Appliqué aux finances : avant chaque grand achat, pause obligatoire.' },
            { title: 'Éliminer : le mot magique', summary: '"Non" est une phrase complète. Savoir dire non gracieusement protège tes ressources (temps, argent, énergie). Chaque "oui" à une chose = "non" à quelque chose d\'autre. Les achats impulsifs sont des "oui" non-essentialistes.' },
            { title: 'Exécuter : un système simple', summary: 'Créer des routines qui rendent l\'essentiel automatique et rendent le non-essentiel plus difficile. Supprimer les décisions inutiles (Steve Jobs portait le même type de vêtement chaque jour). Automatiser l\'épargne = décision essentialiste.' },
        ],
        applyTask: 'Identifie tes 3 dépenses non-essentielles du mois dernier. Calcule leur coût annuel. Redirige vers tes fonds.',
        biases: ['Croire que plus = mieux', 'Difficultés à dire non (FOMO)', 'Diluer ses ressources sur trop de fronts'],
    },
    {
        id: 'zero_based_budget',
        title: 'The Total Money Makeover',
        author: 'Dave Ramsey',
        year: 2003,
        pages: 272,
        readTime: '5–6h',
        emoji: '💪',
        color: 'emerald',
        category: 'Finance',
        phase: 'Semaine 9',
        tagline: 'Éliminer les dettes. Bâtir la richesse. Étape par étape.',
        keyLesson: 'Les dettes sont une urgence nationale. Les éliminer est la seule voie vers la vraie liberté financière.',
        quote: '"Si tu continues à faire ce que tu as toujours fait, tu continueras à obtenir ce que tu as toujours obtenu."',
        summary: 'Ramsey propose un plan en 7 étapes ("Baby Steps") pour transformer sa vie financière : d\'abord éliminer toutes les dettes (sauf hypothèque), puis construire une réserve de 3–6 mois, puis investir pour la retraite et bâtir la richesse. Radical, pragmatique, sans excuse.',
        chapters: [
            { title: 'Le problème est MOI', summary: 'La première vérité : tu es responsable de ta situation financière. Pas l\'économie, pas ton patron, pas ta famille. Ce qui te demande de responsabilité, te donne aussi du pouvoir. Arrêter de blâmer pour commencer à agir.' },
            { title: 'Baby Step 1 — Fonds d\'urgence initial', summary: 'Avant tout, constituer un fonds d\'urgence minimum. Ce petit coussin empêche les urgences de devenir des catastrophes de dette. Vendre quelque chose si nécessaire. Priorité absolue.' },
            { title: 'Baby Step 2 — La boule de neige anti-dette', summary: 'Lister toutes tes dettes du plus petit au plus grand montant. Rembourser minimum sur tout SAUF la plus petite. Y mettre tout ce que tu peux. Quand elle est payée, attaquer la suivante avec la somme libérée. La psychologie de la victoire accélère l\'élan.' },
            { title: 'Baby Step 3 — Fonds d\'urgence complet', summary: 'Une fois les dettes éliminées, construire 3 à 6 mois de dépenses en réserve. C\'est le filet de sécurité qui permet de prendre des risques business sans peur. Aucun investissement avant d\'avoir ce filet.' },
            { title: 'Baby Steps 4–7 : Construire la richesse', summary: 'Étape 4 : Investir 15% en retraite. Étape 5 : Éducation des enfants. Étape 6 : Rembourser la maison. Étape 7 : Bâtir la richesse et donner généreusement. La liberté financière est un marathon, pas un sprint.' },
        ],
        applyTask: 'Dresse la liste complète de tes dettes aujourd\'hui. Applique la "boule de neige" : identifie la plus petite dette à attaquer en premier.',
        biases: ['Reporter le remboursement des dettes', 'Investir avant d\'avoir un fonds d\'urgence', 'Minimiser l\'impact psychologique de la dette'],
    },
    {
        id: 'zero_to_one',
        title: 'Zero to One',
        author: 'Peter Thiel & Blake Masters',
        year: 2014,
        pages: 224,
        readTime: '4–5h',
        emoji: '∞',
        color: 'purple',
        category: 'Business',
        phase: 'Semaine 10',
        tagline: 'Ne pas copier. Créer. Le monopole comme stratégie.',
        keyLesson: 'Aller de 0 à 1 (créer quelque chose de nouveau) est infiniment plus puissant que d\'aller de 1 à N (copier).',
        quote: '"Toute grande entreprise est construite autour d\'un secret que les autres ne voient pas encore."',
        summary: 'Thiel, co-fondateur de PayPal, partage sa vision counter-intuitive de l\'innovation et du business : les meilleurs business créent des monopoles (domination d\'une niche), pas de la compétition. La compétition est pour les perdants — trouve un marché que tu peux dominer. Appliqué à Velmo : quel secret vois-tu que les autres ne voient pas encore ?',
        chapters: [
            { title: 'Le challenge du futur', summary: 'Si tu prends les meilleures idées du passé et tu les copies légèrement mieux : tu vas de 1 à N. Si tu construis quelque chose d\'entièrement nouveau : tu vas de 0 à 1. La technologie et l\'innovation vraie partent toujours de zéro.' },
            { title: 'Toutes les entreprises heureuses sont différentes', summary: 'Dans un marché compétitif, les profits disparaissent (les compagnies aériennes gagnent 0,37€ par passager). Dans un monopole, les profits sont structurels (Google garde 21€ par recherche). La stratégie : dominer complètement un marché de niche, puis s\'étendre.' },
            { title: 'La concurrence est pour les perdants', summary: 'L\'idéologie de la compétition est destructrice. Les entrepreneurs copient leurs concurrents alors qu\'ils devraient chercher à les rendre non pertinents. Si tu es en guerre avec tes concurrents, tu PERDS. Trouver un blue ocean où tu n\'as pas de concurrent direct.' },
            { title: 'La loi de la puissance', summary: 'Les rendements suivent une loi de puissance : 1 investissement sur 10 dépasse tous les autres combinés. Appliqué au business : 1 marché, 1 produit, 1 canal d\'acquisition devrait produire 80% des résultats. Identifie et amplifie ce qui marche vraiment.' },
            { title: 'Les secrets', summary: 'Chaque grand business est construit sur un secret : une vérité que personne d\'autre ne voit encore. Où sont les secrets qui restent à découvrir dans ton marché ? Qu\'est-ce que les gens pensent être vrai mais ne l\'est pas ? Ou faux mais qui est vrai ?' },
            { title: 'Le fondateur charismatique', summary: 'Les meilleures entreprises ont des fondateurs avec une vision unique et la capacité de recruter des gens pour la réaliser. La vision doit être large (mission) mais l\'exécution précise (étape suivante claire). Velmo : quelle est ta mission en une phrase ?' },
        ],
        applyTask: 'Quel est le SECRET que tu vois dans ton marché que les autres ne voient pas ? C\'est là que réside ton avantage. Écris-le.',
        biases: ['Copier au lieu d\'innover', 'Entrer dans des marchés compétitifs sans avantage', 'Diversifier trop tôt au lieu de dominer une niche'],
    },
];

const DAILY_HABITS = [
    { id: 'check_balance', label: 'Vérifier mes soldes (2 min)', icon: '💰', category: 'finance' },
    { id: 'log_transaction', label: 'Logger toutes mes dépenses du jour', icon: '📝', category: 'finance' },
    { id: 'review_goal', label: 'Regarder la progression de mon objectif #1', icon: '🎯', category: 'finance' },
    { id: 'income_action', label: 'Faire 1 action pour générer du revenu', icon: '📈', category: 'business' },
    { id: 'learn_10min', label: 'Lire 10 pages d\'un livre de la bibliothèque', icon: '📚', category: 'learning' },
    { id: 'no_impulse', label: 'Aucune dépense impulsive aujourd\'hui', icon: '🛡️', category: 'discipline' },
];

const BIASES = [
    { id: 'instant', label: 'Gratification Instantanée', desc: 'Dépenser une somme imprévue immédiatement plutôt que de l\'allouer selon la règle. La récompense immédiate paralyse la construction à long terme.', icon: '⚡', danger: 'high', book: 'Babylone' },
    { id: 'peak_trap', label: 'Piège du Pic de Revenu', desc: '"J\'ai gagné 200k en 2 jours → je peux dépenser." Non. Un opérateur capitalise les pics. Un gain exceptionnel = opportunité de construire un actif, jamais une permission de dépenser.', icon: '📈', danger: 'high', book: 'Psychologie' },
    { id: 'anchor', label: 'Ancrage au Revenu Actuel', desc: 'Baser ses dépenses sur le revenu actuel, pas sur la base prudente. Si ton revenu monte de 100%, tes dépenses ne doivent PAS monter de 100%.', icon: '⚓', danger: 'medium', book: 'Atom. Habits' },
    { id: 'lifestyle', label: 'Inflation du Style de Vie', desc: 'Augmenter ses dépenses proportionnellement à ses revenus au lieu d\'accumuler des actifs. Chaque augmentation de revenu devrait aller d\'abord en actifs.', icon: '🏠', danger: 'high', book: 'Père Riche' },
    { id: 'visible', label: 'Richesse Visible vs Réelle', desc: 'Chercher à PARAÎTRE riche plutôt qu\'à ÊTRE riche. La Ferrari que tu vois t\'impressionne — mais son propriétaire te regarde peut-être envier ta liberté financière.', icon: '👁️', danger: 'high', book: 'Psychologie' },
    { id: 'tomorrow', label: 'Procrastination Financière', desc: '"Je commencerai à épargner le mois prochain." Le meilleur moment, c\'était hier. Le deuxième, c\'est maintenant. Les intérêts composés ne peuvent pas attendre ta motivation.', icon: '📅', danger: 'medium', book: 'Atom. Habits' },
    { id: 'sunk_cost', label: 'Coût Irrécupérable', desc: 'Continuer à investir dans quelque chose qui ne marche pas parce que tu y as déjà mis de l\'argent. Celui qui a déjà perdu 100k et continue pour "récupérer" perd souvent 200k.', icon: '🕳️', danger: 'high', book: 'Lean Startup' },
    { id: 'herd', label: 'Mentalité de Troupeau', desc: 'Investir ou dépenser parce que "tout le monde le fait". Les tendances créent des bulles. L\'opérateur stratège va toujours à contre-courant du troupeau.', icon: '🐑', danger: 'medium', book: 'Zero to One' },
    { id: 'overconf', label: 'Surconfiance après succès', desc: 'Un ou deux bons résultats créent l\'illusion de la mêtrise. Les traders qui gagnent 3 fois de suite prennent des risques démesurés au 4ème. La chance ≠ la compétence.', icon: '🌟', danger: 'high', book: 'Psychologie' },
    { id: 'slowlane', label: 'Mentalité Slowlane', desc: 'Croire qu\'on s\'enrichit en travaillant dur pendant 40 ans. Échanger son temps contre de l\'argent est un plafond de verre. La richesse n\'apporte pas la liberté à 65 ans si elle détruit la vie entre 25 et 65.', icon: '🚶', danger: 'high', book: 'Fastlane' },
    { id: 'fomo', label: 'FOMO Financière', desc: 'La peur de rater une opportunité force des décisions rapides et irréfléchies. Chaque "opportunité" qui exige une décision immédiate est rarement une vraie opportunité.', icon: '😨', danger: 'medium', book: 'Essentialism' },
    { id: 'vague_goals', label: 'Objectifs Vagues sans Engagement', desc: 'Désirer "devenir riche" sans montant précis, date précise, et plan d\'action. Un souhait sans plan est une hallucination. Chiffre tout, date tout, exécute maintenant.', icon: '🌫️', danger: 'medium', book: 'Think & Grow Rich' },
];


const COLOR_MAP = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500', ring: 'ring-amber-500/40' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500', ring: 'ring-blue-500/40' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500', ring: 'ring-purple-500/40' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500', ring: 'ring-rose-500/40' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500', ring: 'ring-orange-500/40' },
};

const today = new Date().toISOString().slice(0, 10);

// ── Storage helpers ────────────────────────────────────────
const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } };

// ============================================================
// STRATÈGE — Données statiques
// ============================================================
const FUNDS = [
    {
        id: 'security',
        label: 'Fonds de Sécurité',
        desc: '3 mois de dépenses. Intouchable. Survie garantie même sans revenu.',
        icon: '🔒',
        color: 'blue',
        rule: 'INTERDIT — Seulement si tu ne manges pas ou tu perds ton logement.',
        targetMonths: 3,
    },
    {
        id: 'business',
        label: 'Fonds Business / Velmo',
        desc: 'Marketing, acquisition clients, serveur, outils payants. Jamais pour le confort.',
        icon: '📈',
        color: 'amber',
        rule: 'Utilisation stricte : actions qui génèrent du revenu UNIQUEMENT.',
        targetMonths: null,
    },
    {
        id: 'equipment',
        label: 'Fonds Équipement & Opportunité',
        desc: 'Matériel tech planifié. Constitué AVANT l\'achat. Jamais à découvert.',
        icon: '🔧',
        color: 'orange',
        rule: 'Achat déclenché uniquement quand le fonds atteint l\'objectif.',
        targetMonths: null,
    },
];

const PEAK_RULES = [
    { pct: 40, label: 'Sécurité', icon: '🔒', color: 'blue' },
    { pct: 30, label: 'Business / Velmo', icon: '📈', color: 'amber' },
    { pct: 20, label: 'Compétence', icon: '🧠', color: 'purple' },
    { pct: 10, label: 'Plaisir limité / Transport', icon: '🎧', color: 'emerald' },
];

const THREE_QUESTIONS = [
    { id: 'q1', text: 'Est-ce que ça augmente mon revenu ou ma capacité à produire ?', icon: '📈' },
    { id: 'q2', text: 'Puis-je attendre 30 jours si je veux toujours cet achat ?', icon: '⏳' },
    { id: 'q3', text: 'Est-ce planifié dans mon système budgétaire ?', icon: '🗂️' },
];

export default function AcademiePage() {
    const { formatCurrency } = useCurrency();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('library');
    const [expandedBook, setExpandedBook] = useState(null);
    const [libFilter, setLibFilter] = useState('Tous'); // filtre catégorie
    const [readingBook, setReadingBook] = useState(null); // livre préchargé ouvert en modal

    // ── MES LIVRES — state ────────────────────────────────────
    const [userBooks, setUserBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [readingUserBook, setReadingUserBook] = useState(null); // livre uploadé en lecture
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadMeta, setUploadMeta] = useState({ title: '', author: '', category: 'Finance', coverEmoji: '📕' });
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const COVER_EMOJIS = ['📕', '📗', '📘', '📙', '📒', '📓', '📔', '📖', '🏛️', '💰', '🧠', '⚔️', '🎯', '🚀', '💎', '👑'];
    const UPLOAD_CATEGORIES = ['Finance', 'Mindset', 'Business', 'Productivité', 'Investissement', 'Marketing', 'Biographie', 'Autres'];

    // Charger les livres uploadés
    useEffect(() => {
        if (user) loadUserBooks();
    }, [user]);

    const loadUserBooks = async () => {
        setLoadingBooks(true);
        try {
            const books = await getUserBooks(user.id);
            setUserBooks(books);
        } catch (e) {
            console.error('Erreur chargement livres:', e);
        } finally {
            setLoadingBooks(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'epub'].includes(ext)) {
            toast.error('Format non supporté. PDF uniquement.');
            return;
        }
        setUploadFile(file);
        setUploadMeta(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }));
    };

    const handleUpload = async () => {
        if (!uploadFile || !user) return;
        if (!uploadMeta.title.trim()) {
            toast.error('Donne un titre à ce livre.');
            return;
        }

        // 1. Optimistic UI : Ajout temporaire immédiatement
        const tempId = 'temp_' + Date.now();
        const optimisticBook = {
            id: tempId,
            title: uploadMeta.title,
            author: uploadMeta.author || 'Auteur inconnu',
            category: uploadMeta.category || 'Finance',
            cover_emoji: uploadMeta.coverEmoji || '📕',
            file_type: uploadFile.name.split('.').pop().toLowerCase(),
            file_size: uploadFile.size,
            read_progress: 0,
            signed_url: URL.createObjectURL(uploadFile), // URL locale
            isUploading: true
        };

        setUserBooks(prev => [optimisticBook, ...prev]);
        setShowUploadModal(false);

        // Sauvegarde des données avant de reset l'état
        const fileToUpload = uploadFile;
        const metaToUpload = { ...uploadMeta };

        setUploadFile(null);
        setUploadMeta({ title: '', author: '', category: 'Finance', coverEmoji: '📕' });

        const toastId = toast.loading('Envoi du parchemin en cours...');

        // 2. Upload silencieux en arrière-plan
        try {
            const newBook = await uploadBook(fileToUpload, user.id, {
                ...metaToUpload,
                coverColor: 'amber',
            });

            // 3. Remplacement du livre temporaire par le vrai livre (qui a le bon ID Supabase)
            setUserBooks(prev => prev.map(b => b.id === tempId ? newBook : b));
            toast.success('📚 Livre stocké dans le coffre de guilde !', { id: toastId });
        } catch (err) {
            console.error(err);
            // Suppression en cas d'erreur
            setUserBooks(prev => prev.filter(b => b.id !== tempId));
            toast.error(`Erreur lors du scellement : ${err.message}`, { id: toastId });
        }
    };

    const handleDeleteUserBook = async (book) => {
        if (!confirm(`Supprimer "${book.title}" de ta bibliothèque ?`)) return;
        try {
            await deleteBook(user.id, book.id, book.file_path);
            setUserBooks(prev => prev.filter(b => b.id !== book.id));
            toast.success('Livre supprimé.');
        } catch (err) {
            toast.error('Erreur lors de la suppression.');
        }
    };

    // Reading progress: { [bookId]: Set of completed chapter indices }
    const [readChapters, setReadChapters] = useState(() => load('academie_chapters', {}));
    // Daily habits: { [date]: [habitId, ...] }
    const [habits, setHabits] = useState(() => load('academie_habits', {}));
    // Journal: { [date]: { earned, saved, invested, improve } }
    const [journals, setJournals] = useState(() => load('academie_journals', {}));
    // Biases acknowledged
    const [ackBiases, setAckBiases] = useState(() => load('academie_biases', []));
    // Current draft journal
    const [draft, setDraft] = useState({ earned: '', saved: '', invested: '', improve: '' });
    const [journalSaved, setJournalSaved] = useState(false);

    // ── STRATÈGE state ─────────────────────────────────────
    // Fonds : { security: { current, target }, business: { current, target }, equipment: { current, target } }
    const [funds, setFunds] = useState(() => load('strat_funds', {
        security: { current: 0, target: 300000, monthlyExp: 100000 },
        business: { current: 0, target: 500000 },
        equipment: { current: 0, target: 200000, itemName: 'SSD / Disque dur' },
    }));
    // Achat en cours d'évaluation (filtre 3 questions)
    const [purchaseItem, setPurchaseItem] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null });
    const [showVerdict, setShowVerdict] = useState(false);
    // Sim pic de revenu
    const [peakAmount, setPeakAmount] = useState('');
    // Plan 90j
    const [plans, setPlans] = useState(() => load('strat_plans', []));
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanCost, setNewPlanCost] = useState('');
    const [newPlanMonthly, setNewPlanMonthly] = useState('');

    useEffect(() => { save('academie_chapters', readChapters); }, [readChapters]);
    useEffect(() => { save('academie_habits', habits); }, [habits]);
    useEffect(() => { save('academie_journals', journals); }, [journals]);
    useEffect(() => { save('academie_biases', ackBiases); }, [ackBiases]);
    useEffect(() => { save('strat_funds', funds); }, [funds]);
    useEffect(() => { save('strat_plans', plans); }, [plans]);

    // Helpers Stratège
    const updateFund = (id, field, val) => setFunds(prev => ({ ...prev, [id]: { ...prev[id], [field]: parseFloat(val) || 0 } }));
    const toggleAnswer = (qid, val) => setAnswers(prev => ({ ...prev, [qid]: prev[qid] === val ? null : val }));
    const verdict = Object.values(answers).filter(v => v === true).length;
    const peakVal = parseFloat(peakAmount) || 0;
    const addPlan = () => {
        if (!newPlanName || !newPlanCost || !newPlanMonthly) return;
        const cost = parseFloat(newPlanCost);
        const monthly = parseFloat(newPlanMonthly);
        const months = Math.ceil(cost / monthly);
        setPlans(prev => [...prev, { id: Date.now(), name: newPlanName, cost, monthly, months, saved: 0, createdAt: today }]);
        setNewPlanName(''); setNewPlanCost(''); setNewPlanMonthly('');
    };
    const updatePlanSaved = (id, val) => setPlans(prev => prev.map(p => p.id === id ? { ...p, saved: Math.min(parseFloat(val) || 0, p.cost) } : p));
    const deletePlan = (id) => setPlans(prev => prev.filter(p => p.id !== id));

    // Load today's journal into draft
    useEffect(() => {
        if (journals[today]) setDraft(journals[today]);
    }, []);

    const toggleChapter = (bookId, idx) => {
        setReadChapters(prev => {
            const current = new Set(prev[bookId] || []);
            current.has(idx) ? current.delete(idx) : current.add(idx);
            return { ...prev, [bookId]: [...current] };
        });
    };

    const toggleHabit = (habitId) => {
        setHabits(prev => {
            const todayList = new Set(prev[today] || []);
            todayList.has(habitId) ? todayList.delete(habitId) : todayList.add(habitId);
            return { ...prev, [today]: [...todayList] };
        });
    };

    const saveJournal = () => {
        setJournals(prev => ({ ...prev, [today]: draft }));
        save('academie_journals', { ...journals, [today]: draft });
        setJournalSaved(true);
        setTimeout(() => setJournalSaved(false), 2000);
    };

    const toggleBias = (id) => {
        setAckBiases(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    };

    const todayHabits = new Set(habits[today] || []);
    const habitsCompleted = todayHabits.size;
    const allBooksProgress = BOOKS.map(b => {
        const done = (readChapters[b.id] || []).length;
        return { id: b.id, done, total: b.chapters.length, pct: Math.round((done / b.chapters.length) * 100) };
    });
    const totalChapters = BOOKS.reduce((s, b) => s + b.chapters.length, 0);
    const totalDone = allBooksProgress.reduce((s, b) => s + b.done, 0);
    const overallPct = Math.round((totalDone / totalChapters) * 100);

    return (
        <div className="min-h-screen pb-32 fade-in">
            {/* Hero */}
            <div className="relative overflow-hidden px-4 pt-10 pb-8 mb-6 max-w-6xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                <div className="relative z-10 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-2">
                        <BookOpen size={13} className="text-purple-400" />
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em]">Académie Impériale</span>
                    </div>
                    <h1 className="heading-gold text-4xl lg:text-5xl">Bibliothèque du Conquérant</h1>
                    <p className="font-ancient text-slate-500 text-[10px] tracking-[0.2em] uppercase max-w-lg mx-auto">
                        La vraie puissance vient d'une mentalité formée et structurée — pas d'un seul revenu.
                    </p>
                    {/* Global progress */}
                    <div className="flex items-center justify-center gap-6 pt-3">
                        <div className="text-center">
                            <div className="text-3xl font-ancient font-black text-amber-500">{overallPct}%</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Progression</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-ancient font-black text-emerald-400">{habitsCompleted}/{DAILY_HABITS.length}</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Habitudes Aujourd'hui</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-ancient font-black text-blue-400">{ackBiases.length}/{BIASES.length}</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Biais Identifiés</div>
                        </div>
                    </div>
                    <div className="max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 mb-8">
                <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'library', label: 'Bibliothèque', icon: <BookOpen size={15} /> },
                        { id: 'mybooks', label: 'Mes Livres', icon: <Library size={15} />, badge: userBooks.length || null },
                        { id: 'stratege', label: 'Stratège', icon: <Sword size={15} /> },
                        { id: 'habits', label: 'Habitudes', icon: <Flame size={15} /> },
                        { id: 'journal', label: 'Journal', icon: <Edit3 size={15} /> },
                        { id: 'biases', label: 'Biais Mentaux', icon: <Brain size={15} /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-5 py-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-600 hover:text-slate-400'}`}>
                            {tab.icon}{tab.label}
                            {tab.badge ? (
                                <span className="absolute top-2 right-1 min-w-[16px] h-4 flex items-center justify-center bg-amber-500 text-slate-950 text-[7px] font-black rounded-full px-1">
                                    {tab.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <AnimatePresence mode="wait">

                    {/* ════════════════════════════════════════════
                        TAB — MES LIVRES UPLOADÉS
                    ════════════════════════════════════════════ */}
                    {activeTab === 'mybooks' && (
                        <motion.div key="mybooks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                            {/* Header actions */}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="font-ancient font-black text-white text-sm uppercase tracking-widest">Ma Bibliothèque Personnelle</h2>
                                    <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-widest">
                                        {userBooks.length} livre{userBooks.length !== 1 ? 's' : ''} uploadé{userBooks.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                >
                                    <Upload size={14} /> Uploader un Livre
                                </button>
                            </div>

                            {/* États */}
                            {loadingBooks ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader size={28} className="text-amber-500 animate-spin" />
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Chargement des parchemins...</p>
                                </div>
                            ) : userBooks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-24 gap-5 card-warrior bg-slate-900/40"
                                >
                                    <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-dashed border-amber-500/30 flex items-center justify-center text-5xl">
                                        📚
                                    </div>
                                    <div className="text-center">
                                        <p className="font-ancient font-black text-slate-400 text-sm uppercase tracking-widest">Bibliothèque Vide</p>
                                        <p className="text-[9px] text-slate-600 font-bold mt-1 max-w-xs">
                                            Upload ton premier livre PDF. Il sera sauvegardé dans ton coffre sécurisé.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-500 text-amber-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Upload size={14} /> Uploader mon premier livre
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {userBooks.map((book, i) => {
                                        const pct = book.read_progress || 0;
                                        const sizeKb = book.file_size ? (book.file_size / 1024).toFixed(0) : '?';
                                        const sizeMb = book.file_size ? (book.file_size / 1048576).toFixed(1) : '?';
                                        return (
                                            <motion.div
                                                key={book.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                                className="card-warrior bg-slate-900/60 flex flex-col group overflow-hidden hover:border-amber-500/30 transition-all"
                                            >
                                                {/* Cover */}
                                                <div className="relative h-40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-purple-500/10 flex items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
                                                    <span className="text-7xl">{book.cover_emoji || '📕'}</span>
                                                    {/* Badge catégorie */}
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-amber-500/20">
                                                        <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">{book.category}</span>
                                                    </div>
                                                    {/* Bouton supprimer */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteUserBook(book); }}
                                                        className="absolute top-3 right-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    {/* Format badge */}
                                                    <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                                                        <span className="text-[7px] font-black text-slate-400 uppercase">{book.file_type?.toUpperCase()}</span>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="font-ancient font-black text-white text-[11px] uppercase tracking-wide leading-tight line-clamp-2">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-[9px] text-slate-500 font-bold mt-1">{book.author}</p>

                                                    {/* Taille fichier */}
                                                    <p className="text-[8px] text-slate-700 font-bold mt-0.5">
                                                        {book.file_size > 1048576 ? `${sizeMb} Mo` : `${sizeKb} Ko`}
                                                    </p>

                                                    {/* Progress bar */}
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-[8px] font-black text-slate-600 mb-1 uppercase">
                                                            <span>Progression</span>
                                                            <span className="text-amber-500">{pct}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8 }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Bouton lire / loader */}
                                                    {book.isUploading ? (
                                                        <button
                                                            disabled
                                                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest cursor-not-allowed"
                                                        >
                                                            <Loader size={13} className="animate-spin" />
                                                            Upload en cours...
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReadingUserBook(book)}
                                                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all active:scale-98"
                                                        >
                                                            <BookOpen size={13} />
                                                            {pct > 0 ? 'Continuer la lecture' : 'Commencer la lecture'}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Carte d'ajout rapide */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: userBooks.length * 0.06 }}
                                        onClick={() => setShowUploadModal(true)}
                                        className="card-warrior flex flex-col items-center justify-center gap-3 h-60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 text-slate-700 hover:text-amber-500 transition-all group bg-transparent"
                                    >
                                        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload size={22} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Ajouter un livre</span>
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ════════════════════════════════════════════
                        TAB 1 — BIBLIOTHÈQUE
                    ════════════════════════════════════════════ */}
                    {activeTab === 'library' && (
                        <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                            {/* Filtres catégorie */}
                            <div className="flex flex-wrap gap-2">
                                {['Tous', 'Finance', 'Mindset', 'Business', 'Productivité'].map(cat => (
                                    <button key={cat} onClick={() => setLibFilter(cat)}
                                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all ${libFilter === cat
                                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                                            : 'border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-400'
                                            }`}>
                                        {cat}
                                    </button>
                                ))}
                                <div className="ml-auto text-[9px] font-black text-slate-600 uppercase tracking-widest self-center">
                                    {(libFilter === 'Tous' ? BOOKS : BOOKS.filter(b => b.category === libFilter)).length} livre{(libFilter === 'Tous' ? BOOKS : BOOKS.filter(b => b.category === libFilter)).length > 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Grille des livres */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(libFilter === 'Tous' ? BOOKS : BOOKS.filter(b => b.category === libFilter)).map((book, bi) => {
                                    const colors = COLOR_MAP[book.color] || COLOR_MAP.amber;
                                    const prog = allBooksProgress.find(p => p.id === book.id);
                                    const done = prog?.done || 0;
                                    const completedSet = new Set(readChapters[book.id] || []);
                                    const isFinished = done === book.chapters.length;

                                    return (
                                        <motion.div key={book.id}
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.06 }}
                                            className={`card-warrior overflow-hidden ${colors.bg} ${isFinished ? 'ring-1 ' + colors.ring : 'border-white/5'} flex flex-col`}>

                                            {/* Header */}
                                            <div className="p-5 flex gap-4">
                                                <div className={`w-14 h-18 rounded-xl ${colors.badge} flex items-center justify-center text-3xl shrink-0 shadow-lg aspect-[3/4]`}>
                                                    {book.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-1 mb-1">
                                                        <div>
                                                            <div className={`text-[8px] font-black uppercase tracking-widest ${colors.text} flex items-center gap-1.5`}>
                                                                <span>{book.category}</span>
                                                                <span className="text-slate-700">·</span>
                                                                <span>{book.phase}</span>
                                                            </div>
                                                            <h3 className="font-ancient font-black text-white text-[11px] uppercase tracking-wider leading-tight mt-0.5">{book.title}</h3>
                                                            <p className="text-[9px] text-slate-500 font-bold">{book.author} · {book.year}</p>
                                                        </div>
                                                        {isFinished && (
                                                            <div className={`p-1.5 ${colors.badge} rounded-full shrink-0`}>
                                                                <Award size={12} className="text-slate-950" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Méta */}
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[8px] text-slate-600 font-bold">📖 {book.pages}p</span>
                                                        <span className="text-[8px] text-slate-600 font-bold">⏱ {book.readTime}</span>
                                                        <span className="text-[8px] text-slate-600 font-bold">📌 {book.chapters.length} ch.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tagline */}
                                            <div className="px-5 pb-3">
                                                <p className={`text-[9px] font-bold ${colors.text} italic`}>{book.tagline}</p>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="px-5 pb-4">
                                                <div className="flex justify-between text-[8px] font-black text-slate-600 mb-1 uppercase">
                                                    <span>{done}/{book.chapters.length} chapitres lus</span>
                                                    <span className={colors.text}>{prog?.pct || 0}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div className={`h-full ${colors.badge} rounded-full`}
                                                        initial={{ width: 0 }} animate={{ width: `${prog?.pct || 0}%` }} transition={{ duration: 0.8 }} />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-auto px-5 pb-5 flex gap-2">
                                                <button onClick={() => setReadingBook(book)}
                                                    className={`flex-1 py-2.5 rounded-xl border ${colors.border} ${colors.text} text-[9px] font-black uppercase tracking-widest hover:${colors.bg} transition-all flex items-center justify-center gap-1.5`}>
                                                    <BookOpen size={12} /> Lire
                                                </button>
                                                <button onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
                                                    className="px-3 py-2.5 rounded-xl border border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-all">
                                                    {expandedBook === book.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            </div>

                                            {/* Expanded — chapters quick check */}
                                            <AnimatePresence>
                                                {expandedBook === book.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden border-t border-white/5">
                                                        <div className="p-5 space-y-2">
                                                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Marquer comme lus</div>
                                                            {book.chapters.map((ch, i) => (
                                                                <button key={i} onClick={() => toggleChapter(book.id, i)}
                                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${completedSet.has(i) ? `${colors.bg} ${colors.border}` : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                                                                        }`}>
                                                                    {completedSet.has(i)
                                                                        ? <CheckCircle2 size={15} className={colors.text} />
                                                                        : <Circle size={15} className="text-slate-700" />}
                                                                    <span className={`text-[9px] font-bold ${completedSet.has(i) ? 'text-white' : 'text-slate-500'}`}>
                                                                        {i + 1}. {ch.title || ch}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ════════════════════════════════════════════
                        MODAL DE LECTURE PLEIN ÉCRAN
                    ════════════════════════════════════════════ */}
                    {readingBook && (() => {
                        const book = readingBook;
                        const colors = COLOR_MAP[book.color] || COLOR_MAP.amber;
                        const completedSet = new Set(readChapters[book.id] || []);
                        const done = completedSet.size;
                        return (
                            <motion.div
                                key="reading-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
                                style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}
                            >
                                {/* Header modal */}
                                <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-4">
                                    <button onClick={() => setReadingBook(null)}
                                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                                        <X size={18} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${colors.text}`}>{book.category} · {book.phase}</div>
                                        <div className="font-ancient font-black text-white text-sm uppercase tracking-wide truncate">{book.title}</div>
                                    </div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase">{done}/{book.chapters.length} lus</div>
                                </div>

                                <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                                    {/* Cover block */}
                                    <div className={`card-warrior p-6 ${colors.bg} ${colors.border} flex gap-5`}>
                                        <div className={`w-20 h-28 rounded-2xl ${colors.badge} flex items-center justify-center text-5xl shadow-2xl shrink-0`}>
                                            {book.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="font-ancient font-black text-white text-xl uppercase tracking-wider leading-tight">{book.title}</h1>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">{book.author} · {book.year} · {book.pages} pages · {book.readTime}</p>
                                            {/* Progress */}
                                            <div className="mt-3">
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div className={`h-full ${colors.badge} rounded-full`}
                                                        initial={{ width: 0 }} animate={{ width: `${Math.round(done / book.chapters.length * 100)}%` }} transition={{ duration: 1 }} />
                                                </div>
                                                <div className={`text-[8px] font-black ${colors.text} uppercase tracking-widest mt-1`}>{Math.round(done / book.chapters.length * 100)}% complété</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Citation */}
                                    {book.quote && (
                                        <div className={`p-5 rounded-2xl border-l-4 ${colors.border} bg-slate-900/40`}>
                                            <p className={`text-sm font-ancient font-black ${colors.text} italic leading-relaxed`}>{book.quote}</p>
                                            <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest">— {book.author}</p>
                                        </div>
                                    )}

                                    {/* Résumé général */}
                                    {book.summary && (
                                        <div className="card-warrior p-6 bg-slate-900/60">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <ScrollText size={12} className="text-amber-500" /> Résumé Général
                                            </div>
                                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{book.summary}</p>
                                        </div>
                                    )}

                                    {/* Chapitres avec résumés */}
                                    <div className="space-y-3">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={12} className="text-amber-500" /> Chapitres — Coche après lecture
                                        </div>
                                        {book.chapters.map((ch, i) => {
                                            const chTitle = typeof ch === 'string' ? ch : ch.title;
                                            const chSummary = typeof ch === 'string' ? null : ch.summary;
                                            const read = completedSet.has(i);
                                            return (
                                                <div key={i} className={`card-warrior overflow-hidden transition-all ${read ? `${colors.bg} border ${colors.border}` : 'bg-slate-900/40 border border-white/5'
                                                    }`}>
                                                    <button onClick={() => toggleChapter(book.id, i)}
                                                        className="w-full flex items-center gap-4 p-4 text-left">
                                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${read ? `${colors.badge} border-transparent` : 'border-slate-700 bg-slate-900'
                                                            }`}>
                                                            {read
                                                                ? <CheckCircle2 size={16} className="text-slate-950" />
                                                                : <span className={`text-[10px] font-black text-slate-600`}>{i + 1}</span>
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`font-ancient font-black text-[10px] uppercase tracking-wider ${read ? 'text-white' : 'text-slate-400'}`}>
                                                                Chapitre {i + 1} — {chTitle}
                                                            </div>
                                                        </div>
                                                        {read && <span className={`text-[8px] font-black ${colors.text} uppercase shrink-0`}>✓ Lu</span>}
                                                    </button>
                                                    {/* Résumé du chapitre */}
                                                    {chSummary && (
                                                        <div className="px-4 pb-4 pt-0">
                                                            <div className="pl-12">
                                                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{chSummary}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Leçon clé */}
                                    <div className={`p-5 rounded-2xl border ${colors.border} ${colors.bg}`}>
                                        <div className={`text-[9px] font-black uppercase tracking-widest ${colors.text} mb-2 flex items-center gap-2`}>
                                            <Crown size={12} /> Leçon Clé Absolue
                                        </div>
                                        <p className="text-sm text-white font-bold italic leading-relaxed">"{book.keyLesson}"</p>
                                    </div>

                                    {/* Mission application */}
                                    <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                                        <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Target size={12} /> Mission d'Application
                                        </div>
                                        <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{book.applyTask}</p>
                                    </div>

                                    {/* Biais combattus */}
                                    <div className="card-warrior p-5 bg-slate-900/40">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Brain size={12} className="text-rose-400" /> Biais que ce livre combat
                                        </div>
                                        <div className="space-y-2">
                                            {book.biases.map((b, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                    <AlertCircle size={12} className="text-rose-500 shrink-0" />{b}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bouton marquer tout lu */}
                                    {done < book.chapters.length && (
                                        <button onClick={() => {
                                            const all = book.chapters.map((_, i) => i);
                                            setReadChapters(prev => ({ ...prev, [book.id]: all }));
                                        }}
                                            className={`w-full py-4 rounded-2xl border ${colors.border} ${colors.text} text-[10px] font-black uppercase tracking-widest hover:${colors.bg} transition-all`}>
                                            Tout marquer comme lu
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })()}

                    {/* ══════════════════════════════════════════════
                        TAB 2 — HABITUDES QUOTIDIENNES
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'habits' && (
                        <motion.div key="habits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">

                            {/* Today's score */}
                            <div className={`card-warrior p-6 flex items-center gap-6 ${habitsCompleted === DAILY_HABITS.length ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/60'}`}>
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-ancient font-black ${habitsCompleted === DAILY_HABITS.length ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-amber-500'}`}>
                                    {habitsCompleted === DAILY_HABITS.length ? '🔥' : `${habitsCompleted}/${DAILY_HABITS.length}`}
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <div className="text-xl font-ancient font-black text-white mt-0.5">
                                        {habitsCompleted === DAILY_HABITS.length ? 'JOURNÉE PARFAITE 🏆' : habitsCompleted === 0 ? 'Commence maintenant' : `${DAILY_HABITS.length - habitsCompleted} habitude${DAILY_HABITS.length - habitsCompleted > 1 ? 's' : ''} restante${DAILY_HABITS.length - habitsCompleted > 1 ? 's' : ''}`}
                                    </div>
                                    <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                                        <motion.div className="h-full bg-emerald-500 rounded-full"
                                            animate={{ width: `${(habitsCompleted / DAILY_HABITS.length) * 100}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Habits list */}
                            <div className="card-warrior p-6 bg-slate-900/60 space-y-3">
                                <h2 className="font-ancient font-black text-white text-[10px] uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Flame size={16} className="text-amber-500" /> Tes 6 Habitudes Fondatrices
                                </h2>
                                {DAILY_HABITS.map((habit, i) => {
                                    const done = todayHabits.has(habit.id);
                                    const catColor = { finance: 'emerald', business: 'amber', learning: 'purple', discipline: 'blue' }[habit.category];
                                    const colors = COLOR_MAP[catColor] || COLOR_MAP.amber;
                                    return (
                                        <motion.button key={habit.id} onClick={() => toggleHabit(habit.id)}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${done ? `${colors.bg} ${colors.border}` : 'bg-slate-950/40 border-slate-800 hover:border-slate-600'}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${done ? colors.badge + ' text-slate-950' : 'bg-slate-900 text-slate-700'}`}>
                                                {done ? '✓' : habit.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${done ? 'text-white line-through opacity-50' : 'text-slate-300'}`}>{habit.label}</p>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${colors.text} opacity-60`}>{habit.category}</p>
                                            </div>
                                            {done
                                                ? <CheckCircle2 size={20} className={colors.text} />
                                                : <Circle size={20} className="text-slate-700" />
                                            }
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Plan de lecture 30 jours */}
                            <div className="card-warrior p-6 bg-amber-500/5 border-amber-500/20">
                                <h3 className="font-ancient font-black text-amber-400 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calendar size={14} /> Plan de Lecture 30 Jours
                                </h3>
                                <div className="space-y-3">
                                    {BOOKS.map((book, i) => {
                                        const colors = COLOR_MAP[book.color];
                                        const prog = allBooksProgress.find(p => p.id === book.id);
                                        return (
                                            <div key={book.id} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl">
                                                <span className="text-xl shrink-0">{book.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide truncate">{book.title}</span>
                                                        <span className={`text-[9px] font-mono ${colors.text} shrink-0 ml-2`}>{prog?.pct}%</span>
                                                    </div>
                                                    <div className="text-[7px] text-slate-600 font-bold uppercase mb-1">{book.phase}</div>
                                                    <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors.badge}`} style={{ width: `${prog?.pct}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB 3 — JOURNAL QUOTIDIEN
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'journal' && (
                        <motion.div key="journal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="max-w-2xl mx-auto space-y-6">

                            <div className="card-warrior p-6 bg-slate-900/80 border-amber-500/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="font-ancient font-black text-white text-sm uppercase tracking-widest">Journal de 10 Minutes</h2>
                                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    {journals[today] && (
                                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[8px] font-black uppercase">
                                            ✓ Enregistré
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: 'earned', label: 'Ce que j\'ai gagné aujourd\'hui', icon: '🟦', color: 'blue', placeholder: 'Revenus, missions, ventes...' },
                                        { key: 'saved', label: 'Ce que j\'ai économisé', icon: '🟧', color: 'orange', placeholder: 'Dépense évitée, surplus conservé...' },
                                        { key: 'invested', label: 'Ce que j\'ai investi (argent ou temps)', icon: '🟨', color: 'yellow', placeholder: 'Formation, outil, business...' },
                                        { key: 'improve', label: 'Ce que je dois améliorer demain', icon: '🟥', color: 'red', placeholder: 'Erreur, faiblesse, ajustement...' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                <span>{field.icon}</span> {field.label}
                                            </label>
                                            <textarea
                                                value={draft[field.key]}
                                                onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                rows={2}
                                                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm font-ancient outline-none transition-all resize-none placeholder-slate-900"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button onClick={saveJournal}
                                    className={`mt-6 w-full py-4 rounded-xl font-ancient font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${journalSaved ? 'bg-emerald-500 text-slate-950' : 'btn-empire-primary'}`}>
                                    {journalSaved ? <><CheckCircle2 size={18} /> SCELLÉ DANS LES ANNALES</> : <><Save size={18} /> SCELLER AUJOURD'HUI</>}
                                </button>
                            </div>

                            {/* Journal history */}
                            {Object.keys(journals).filter(d => d !== today).length > 0 && (
                                <div className="card-warrior p-6 bg-slate-900/40">
                                    <h3 className="font-ancient font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Annales Précédentes</h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                        {Object.entries(journals).filter(([d]) => d !== today).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14).map(([date, entry]) => (
                                            <div key={date} className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                                                <div className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-2">
                                                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </div>
                                                {entry.earned && <p className="text-[9px] text-slate-400 mb-1"><span className="text-blue-400">🟦</span> {entry.earned}</p>}
                                                {entry.improve && <p className="text-[9px] text-slate-500 italic"><span className="text-rose-400">🟥</span> {entry.improve}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB 4 — BIAIS MENTAUX
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'biases' && (
                        <motion.div key="biases" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-3xl mx-auto">

                            <div className="card-warrior p-5 bg-purple-500/5 border-purple-500/20">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 shrink-0"><Brain size={20} /></div>
                                    <div>
                                        <h2 className="font-ancient font-black text-purple-400 text-sm uppercase tracking-widest mb-1">Cartographie des Biais</h2>
                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                            Ton blocage financier n'est pas mathématique — il est mental.<br />
                                            Identifie chaque biais. Reconnaître = déjà 50% du combat gagné.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {BIASES.map((bias, i) => {
                                    const ack = ackBiases.includes(bias.id);
                                    const dangerColor = { high: 'rose', medium: 'amber' }[bias.danger];
                                    const colors = COLOR_MAP[ack ? 'emerald' : dangerColor] || COLOR_MAP.amber;
                                    return (
                                        <motion.div key={bias.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            className={`card-warrior p-5 cursor-pointer transition-all ${ack ? 'bg-emerald-500/10 border-emerald-500/20' : `${colors.bg} ${colors.border}`}`}
                                            onClick={() => toggleBias(bias.id)}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{bias.icon}</span>
                                                    <div>
                                                        <h4 className={`font-ancient font-black text-[10px] uppercase tracking-widest ${ack ? 'text-emerald-400' : colors.text}`}>
                                                            {bias.label}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className={`text-[7px] font-black uppercase ${bias.danger === 'high' ? 'text-rose-500' : 'text-amber-500'}`}>
                                                                {bias.danger === 'high' ? '⚠ DANGER ÉLEVÉ' : '△ DANGER MOYEN'}
                                                            </div>
                                                            {bias.book && (
                                                                <div className="text-[7px] font-black text-slate-700 uppercase tracking-widest border border-slate-800 rounded px-1.5 py-0.5">
                                                                    📖 {bias.book}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {ack
                                                    ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                                    : <Circle size={20} className="text-slate-700 shrink-0" />
                                                }
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">{bias.desc}</p>
                                            {ack && (
                                                <div className="mt-3 text-[8px] text-emerald-500 font-black uppercase tracking-widest">
                                                    ✓ Biais identifié et conscientisé
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>


                            {ackBiases.length === BIASES.length && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="card-warrior p-6 bg-emerald-500/10 border-emerald-500/30 text-center">
                                    <div className="text-4xl mb-2">🏆</div>
                                    <h3 className="font-ancient font-black text-emerald-400 text-sm uppercase tracking-widest">CARTOGRAPHIE COMPLÈTE</h3>
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold">
                                        Tu as identifié tous tes biais. La conscientisation est la première arme de l'opérateur.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB STRATÈGE — Reprogrammation Mentale
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'stratege' && (
                        <motion.div key="stratege" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto">

                            {/* Intro */}
                            <div className="card-warrior p-5 bg-rose-500/5 border-rose-500/20">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0"><Sword size={20} /></div>
                                    <div>
                                        <h2 className="font-ancient font-black text-rose-400 text-sm uppercase tracking-widest mb-1">Reprogrammation du Stratège</h2>
                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                            Changer de <span className="text-rose-400">"Je gagne, je dépense vite"</span> à <span className="text-emerald-400">"Je construis un système incassable."</span><br />
                                            Chaque gain devient un actif. Jamais du confort immédiat.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* BLOC 1 — 3 Fonds Inviolables */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <h3 className="font-ancient font-black text-white text-[10px] uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-blue-400" /> Tes 3 Fonds Inviolables
                                </h3>
                                <div className="space-y-4">
                                    {FUNDS.map(fund => {
                                        const f = funds[fund.id];
                                        const pct = f.target > 0 ? Math.min(100, Math.round((f.current / f.target) * 100)) : 0;
                                        const colorMap = { blue: { text: 'text-blue-400', bar: 'bg-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10' }, amber: { text: 'text-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10' }, orange: { text: 'text-orange-400', bar: 'bg-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10' } };
                                        const c = colorMap[fund.color];
                                        return (
                                            <div key={fund.id} className={`p-5 rounded-2xl border ${c.border} ${c.bg}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{fund.icon}</span>
                                                        <div>
                                                            <div className={`font-ancient font-black text-[10px] uppercase tracking-wider ${c.text}`}>{fund.label}</div>
                                                            <div className="text-[8px] text-slate-600 font-bold mt-0.5 max-w-xs">{fund.rule}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-2xl font-ancient font-black ${c.text} shrink-0`}>{pct}%</div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold mb-4">{fund.desc}</p>
                                                {/* Progress */}
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                                                    <motion.div className={`h-full ${c.bar} rounded-full`}
                                                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
                                                </div>
                                                {/* Inputs */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Montant actuel</div>
                                                        <input type="number" value={f.current} onChange={e => updateFund(fund.id, 'current', e.target.value)}
                                                            className={`w-full bg-slate-950 border ${c.border} rounded-xl px-3 py-2 text-sm font-mono ${c.text} font-black outline-none focus:ring-1 text-center`} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Objectif</div>
                                                        <input type="number" value={f.target} onChange={e => updateFund(fund.id, 'target', e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-400 font-black outline-none focus:border-amber-500 focus:ring-0 text-center" />
                                                    </div>
                                                </div>
                                                {pct === 100 && (
                                                    <div className="mt-3 text-center text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">✓ Fonds consolidé — Forteresse active</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BLOC 2 — Filtre des 3 Questions */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <h3 className="font-ancient font-black text-white text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <HelpCircle size={16} className="text-amber-400" /> Filtre des 3 Questions
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold mb-5">Tout achat important doit passer ce filtre. Zéro exception.</p>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Nom de l'achat</div>
                                        <input value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)} placeholder="Ex: SSD Samsung 1To"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-ancient outline-none focus:border-amber-500 transition-all" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Montant</div>
                                        <input type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} placeholder="0"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-amber-500 font-mono text-sm font-black outline-none focus:border-amber-500 transition-all text-center" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {THREE_QUESTIONS.map(q => (
                                        <div key={q.id} className={`p-4 rounded-xl border transition-all ${answers[q.id] === true ? 'bg-emerald-500/10 border-emerald-500/30' :
                                            answers[q.id] === false ? 'bg-rose-500/10 border-rose-500/20' :
                                                'bg-slate-950/40 border-white/5'
                                            }`}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <span className="text-lg shrink-0">{q.icon}</span>
                                                <p className="text-[10px] font-bold text-white leading-relaxed">{q.text}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => toggleAnswer(q.id, true)}
                                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${answers[q.id] === true ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500 hover:text-emerald-400 border border-emerald-500/10'
                                                        }`}>OUI</button>
                                                <button onClick={() => toggleAnswer(q.id, false)}
                                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${answers[q.id] === false ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500 hover:text-rose-400 border border-rose-500/10'
                                                        }`}>NON</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {Object.values(answers).some(v => v !== null) && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`p-5 rounded-2xl border-2 text-center ${verdict === 3 ? 'bg-emerald-500/10 border-emerald-500/40' :
                                            verdict === 2 ? 'bg-amber-500/10 border-amber-500/30' :
                                                'bg-rose-500/10 border-rose-500/30'
                                            }`}>
                                        <div className="text-3xl mb-2">
                                            {verdict === 3 ? '✅' : verdict === 2 ? '⚠️' : '🚫'}
                                        </div>
                                        <div className={`font-ancient font-black text-sm uppercase tracking-widest ${verdict === 3 ? 'text-emerald-400' : verdict === 2 ? 'text-amber-400' : 'text-rose-400'
                                            }`}>
                                            {verdict === 3 ? 'ACHAT AUTORISÉ' : verdict === 2 ? 'ATTENDRE 30 JOURS' : 'ACHAT REFUSÉ'}
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold mt-2">
                                            {verdict === 3 ? `"${purchaseItem || 'Cet achat'}" passe le filtre. Si le fonds équipement est prêt : procède.` :
                                                verdict === 2 ? 'Attends que toutes les conditions soient réunies. Si tu veux toujours dans 30 jours : réévalue.' :
                                                    'Dépense émotionnelle détectée. Zéro tolérance. Remets cet argent dans ton fonds épargne.'}
                                        </p>
                                        <button onClick={() => setAnswers({ q1: null, q2: null, q3: null })} className="mt-3 text-[8px] text-slate-600 font-black uppercase underline">
                                            Réinitialiser
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            {/* BLOC 3 — Simulateur Pic de Revenu */}
                            <div className="card-warrior p-6 bg-amber-500/5 border-amber-500/20">
                                <h3 className="font-ancient font-black text-amber-400 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <TrendingUp size={16} /> Simulateur — Pic de Revenu
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold mb-4">Tu gagnes plus que prévu ? Voici comment l'allouer AVANT de dépenser.</p>

                                <div className="mb-4">
                                    <input type="number" value={peakAmount} onChange={e => setPeakAmount(e.target.value)}
                                        placeholder="Ex: 200000"
                                        className="w-full bg-slate-950 border-2 border-amber-500/20 focus:border-amber-500 rounded-2xl px-6 py-4 text-4xl font-ancient font-black text-amber-500 text-center outline-none transition-all placeholder-slate-800"
                                    />
                                    <div className="text-center text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1">Volume reçu</div>
                                </div>

                                {peakVal > 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                        {PEAK_RULES.map(r => {
                                            const amt = Math.round(peakVal * r.pct / 100);
                                            const cmap = { blue: 'text-blue-400 bg-blue-500', amber: 'text-amber-400 bg-amber-500', purple: 'text-purple-400 bg-purple-500', emerald: 'text-emerald-400 bg-emerald-500' };
                                            const [textC, barC] = cmap[r.color].split(' ');
                                            return (
                                                <div key={r.label} className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl">
                                                    <span className="text-lg w-8 text-center shrink-0">{r.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[10px] font-black text-slate-300 uppercase">{r.label}</span>
                                                            <span className={`font-mono font-black text-sm ${textC}`}>{formatCurrency(amt)}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full ${barC} rounded-full`} style={{ width: `${r.pct}%` }} />
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-700 w-8 text-right shrink-0">{r.pct}%</span>
                                                </div>
                                            );
                                        })}
                                        <div className="mt-3 p-3 bg-slate-950/40 rounded-xl border border-white/5 text-center">
                                            <p className="text-[9px] text-slate-500 font-bold italic">
                                                ⚠️ Cette règle s'applique avant toute dépense. Pas après.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* BLOC 4 — Planificateur 90 jours */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <h3 className="font-ancient font-black text-white text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Timer size={16} className="text-orange-400" /> Planificateur d'Achat (90 jours)
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold mb-5">Tout achat majeur = plan sur 90 jours. Construis le fonds. Achète quand c'est prêt.</p>

                                {/* Ajouter un plan */}
                                <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 mb-5">
                                    <div className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-3">Nouveau Plan d'Achat</div>
                                    <div className="space-y-2">
                                        <input value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="Nom de l'article (ex: MacBook Air)"
                                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-xs font-ancient outline-none transition-all" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={newPlanCost} onChange={e => setNewPlanCost(e.target.value)} placeholder="Coût total"
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-amber-500 font-mono text-sm font-black outline-none transition-all text-center" />
                                            <input type="number" value={newPlanMonthly} onChange={e => setNewPlanMonthly(e.target.value)} placeholder="Épargne/mois"
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-blue-400 font-mono text-sm font-black outline-none transition-all text-center" />
                                        </div>
                                        <button onClick={addPlan} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-empire-primary text-[9px] font-black uppercase tracking-widest">
                                            <Plus size={14} /> Créer le Plan
                                        </button>
                                    </div>
                                </div>

                                {/* Liste des plans actifs */}
                                {plans.length === 0 ? (
                                    <div className="text-center py-8 text-slate-700">
                                        <Timer size={36} className="mx-auto mb-2 opacity-30" />
                                        <p className="font-ancient text-[10px] uppercase tracking-widest">Aucun plan actif. Patience = discipline.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {plans.map(plan => {
                                            const pct = plan.cost > 0 ? Math.min(100, Math.round((plan.saved / plan.cost) * 100)) : 0;
                                            const remaining = plan.cost - plan.saved;
                                            const monthsLeft = plan.monthly > 0 ? Math.ceil(remaining / plan.monthly) : '?';
                                            return (
                                                <div key={plan.id} className={`p-4 rounded-2xl border transition-all ${pct === 100 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-white/5'
                                                    }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="font-ancient font-black text-white text-[11px] uppercase tracking-wide">{plan.name}</div>
                                                            <div className="text-[8px] text-slate-600 font-bold mt-0.5">
                                                                {pct === 100 ? '🎉 FONDS COMPLET — ACHAT AUTORISÉ' : `${monthsLeft} mois restants · ${formatCurrency(remaining)} à constituer`}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => deletePlan(plan.id)} className="text-slate-700 hover:text-rose-500 transition-colors p-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                                        <motion.div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                            animate={{ width: `${pct}%` }} />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[8px] font-black text-slate-600 uppercase shrink-0">Épargné :</div>
                                                        <input type="number" value={plan.saved} onChange={e => updatePlanSaved(plan.id, e.target.value)}
                                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-orange-400 font-mono text-xs font-black outline-none text-center" />
                                                        <div className="text-[9px] font-black text-slate-700">/ {formatCurrency(plan.cost)}</div>
                                                        <div className={`text-[9px] font-black ${pct === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>{pct}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>


                            {/* Mantra final */}
                            <div className="card-warrior p-5 bg-gradient-to-br from-amber-500/5 to-purple-500/5 border border-amber-500/10 text-center">
                                <div className="text-3xl mb-3">👑</div>
                                <p className="font-ancient font-black text-white text-sm uppercase tracking-[0.2em] leading-relaxed">
                                    "Je construis un système incassable.<br />
                                    <span className="text-amber-400">Chaque gain devient un actif.</span>"
                                </p>
                                <p className="text-[9px] text-slate-600 mt-2 font-bold">Pas du confort. Pas une permission. Un actif.</p>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ══ MODAL LECTURE (fixe, hors AnimatePresence) ══ */}
            <AnimatePresence>
                {readingBook && (() => {
                    const book = readingBook;
                    const colors = COLOR_MAP[book.color] || COLOR_MAP.amber;
                    const completedSet = new Set(readChapters[book.id] || []);
                    const done = completedSet.size;
                    return (
                        <motion.div key="reading-modal"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 px-4 py-4">
                                <div className="max-w-3xl mx-auto flex items-center gap-4">
                                    <button onClick={() => setReadingBook(null)}
                                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all shrink-0">
                                        <X size={18} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${colors.text}`}>{book.category} · {book.phase}</div>
                                        <div className="font-ancient font-black text-white text-sm uppercase tracking-wide truncate">{book.title}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-lg font-ancient font-black ${colors.text}`}>{Math.round(done / book.chapters.length * 100)}%</div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase">{done}/{book.chapters.length} lus</div>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                                {/* Cover hero */}
                                <div className={`rounded-3xl p-6 border ${colors.border} ${colors.bg} flex gap-5 items-center`}>
                                    <div className={`w-20 h-28 rounded-2xl ${colors.badge} flex items-center justify-center text-5xl shadow-2xl shrink-0`}>
                                        {book.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="font-ancient font-black text-white text-2xl uppercase tracking-wide leading-tight">{book.title}</h1>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1">{book.author} · {book.year}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] text-slate-600 font-bold">📖 {book.pages} pages</span>
                                            <span className="text-[9px] text-slate-600 font-bold">⏱ {book.readTime}</span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>{book.category}</span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div className={`h-full ${colors.badge} rounded-full`}
                                                    initial={{ width: 0 }} animate={{ width: `${Math.round(done / book.chapters.length * 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Citation */}
                                {book.quote && (
                                    <div className={`p-5 rounded-2xl border-l-4 ${colors.border} bg-slate-900/40`}>
                                        <p className={`text-base font-ancient font-black ${colors.text} italic leading-relaxed`}>{book.quote}</p>
                                        <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest">— {book.author}</p>
                                    </div>
                                )}

                                {/* Résumé général */}
                                {book.summary && (
                                    <div className="card-warrior p-6">
                                        <div className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <ScrollText size={12} /> Résumé Général
                                        </div>
                                        <p className="text-[12px] text-slate-300 leading-[1.8] font-medium">{book.summary}</p>
                                    </div>
                                )}

                                {/* Chapitres */}
                                <div className="space-y-3">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                        <span className="flex items-center gap-2"><BookOpen size={12} className={colors.text} /> Chapitres</span>
                                        {done < book.chapters.length && (
                                            <button onClick={() => {
                                                const all = book.chapters.map((_, i) => i);
                                                setReadChapters(prev => ({ ...prev, [book.id]: all }));
                                            }} className={`text-[8px] font-black ${colors.text} hover:underline uppercase tracking-widest`}>
                                                Tout marquer lu
                                            </button>
                                        )}
                                    </div>
                                    {book.chapters.map((ch, i) => {
                                        const chTitle = typeof ch === 'string' ? ch : ch.title;
                                        const chSummary = typeof ch === 'string' ? null : ch.summary;
                                        const read = completedSet.has(i);
                                        return (
                                            <div key={i} className={`rounded-2xl overflow-hidden border transition-all ${read ? `${colors.bg} ${colors.border}` : 'bg-slate-900/60 border-white/5'
                                                }`}>
                                                <button onClick={() => toggleChapter(book.id, i)}
                                                    className="w-full flex items-center gap-4 p-4 text-left">
                                                    <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${read ? `${colors.badge} border-transparent` : 'border-slate-700 bg-slate-950'
                                                        }`}>
                                                        {read
                                                            ? <CheckCircle2 size={18} className="text-slate-950" />
                                                            : <span className="text-[10px] font-black text-slate-600">{i + 1}</span>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-ancient font-black text-[11px] uppercase tracking-wider leading-tight ${read ? 'text-white' : 'text-slate-400'}`}>
                                                            Ch. {i + 1} — {chTitle}
                                                        </div>
                                                    </div>
                                                    {read && <span className={`text-[9px] font-black ${colors.text} uppercase shrink-0`}>✓ Lu</span>}
                                                </button>
                                                {chSummary && (
                                                    <div className="px-4 pb-5 pt-0">
                                                        <div className="ml-[52px] border-l-2 border-white/5 pl-4">
                                                            <p className="text-[11px] text-slate-400 leading-[1.75] font-medium">{chSummary}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Leçon clé */}
                                <div className={`p-5 rounded-2xl border ${colors.border} ${colors.bg}`}>
                                    <div className={`text-[9px] font-black uppercase tracking-widest ${colors.text} mb-3 flex items-center gap-2`}>
                                        <Crown size={12} /> Leçon Clé Absolue
                                    </div>
                                    <p className="text-base text-white font-bold italic leading-relaxed">"{book.keyLesson}"</p>
                                </div>

                                {/* Mission */}
                                <div className="p-5 rounded-2xl border border-amber-500/25 bg-amber-500/5">
                                    <div className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Target size={12} /> Mission d'Application
                                    </div>
                                    <p className="text-[12px] text-slate-200 font-bold leading-relaxed">{book.applyTask}</p>
                                </div>

                                {/* Biais */}
                                <div className="card-warrior p-5 bg-slate-900/40">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Brain size={12} className="text-rose-400" /> Biais que ce livre combat
                                    </div>
                                    <div className="space-y-2">
                                        {book.biases.map((b, i) => (
                                            <div key={i} className="flex items-start gap-3 text-[11px] text-slate-500 font-bold">
                                                <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />{b}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════
                MODAL D'UPLOAD DE LIVRE
            ══════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        key="upload-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
                        onClick={(e) => { if (e.target === e.currentTarget) { setShowUploadModal(false); setUploadFile(null); } }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-slate-950 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/5"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-xl">
                                        <Upload size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-ancient font-black text-white text-sm uppercase tracking-widest">Uploader un Livre</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase">PDF · Supabase Storage</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

                                {/* Zone drag & drop */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : uploadFile
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-900/60'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.epub"
                                        className="hidden"
                                        onChange={handleFileDrop}
                                    />
                                    {uploadFile ? (
                                        <>
                                            <div className="text-4xl">✅</div>
                                            <div className="text-center">
                                                <p className="font-black text-emerald-400 text-[11px] uppercase tracking-wider truncate max-w-xs">
                                                    {uploadFile.name}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-bold mt-1">
                                                    {(uploadFile.size / 1048576).toFixed(1)} Mo · Cliquer pour changer
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-black text-slate-400 text-[11px] uppercase tracking-wider">
                                                    Glisser-déposer ou cliquer
                                                </p>
                                                <p className="text-[9px] text-slate-600 font-bold mt-1">PDF uniquement · Max 50 Mo</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sélecteur d'emoji couverture */}
                                <div>
                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                        Icône de couverture
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {COVER_EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setUploadMeta(p => ({ ...p, coverEmoji: emoji }))}
                                                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${uploadMeta.coverEmoji === emoji
                                                    ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-500/30'
                                                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Titre */}
                                <div>
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Titre du livre *</label>
                                    <input
                                        type="text"
                                        value={uploadMeta.title}
                                        onChange={(e) => setUploadMeta(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Ex: Dune — Frank Herbert"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm font-ancient outline-none transition-all placeholder-slate-700"
                                    />
                                </div>

                                {/* Auteur */}
                                <div>
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Auteur</label>
                                    <input
                                        type="text"
                                        value={uploadMeta.author}
                                        onChange={(e) => setUploadMeta(p => ({ ...p, author: e.target.value }))}
                                        placeholder="Ex: Frank Herbert"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm font-ancient outline-none transition-all placeholder-slate-700"
                                    />
                                </div>

                                {/* Catégorie */}
                                <div>
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Catégorie</label>
                                    <div className="flex flex-wrap gap-2">
                                        {UPLOAD_CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setUploadMeta(p => ({ ...p, category: cat }))}
                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${uploadMeta.category === cat
                                                    ? 'bg-amber-500 border-amber-500 text-slate-950'
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bouton upload */}
                                <button
                                    onClick={handleUpload}
                                    disabled={!uploadFile || uploading}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-[11px] uppercase tracking-widest transition-all active:scale-98 shadow-lg shadow-amber-500/20"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Sceller dans la bibliothèque
                                        </>
                                    )}
                                </button>

                                {/* Info Supabase */}
                                <p className="text-center text-[8px] text-slate-700 font-bold uppercase tracking-widest">
                                    🔐 Stockage sécurisé · Bucket Supabase privé
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════
                LECTEUR DE LIVRES UPLOADÉS (BookReader)
            ══════════════════════════════════════════════════ */}
            <AnimatePresence>
                {readingUserBook && (
                    <BookReader
                        book={readingUserBook}
                        onClose={() => setReadingUserBook(null)}
                        onProgressUpdate={(id, pct) => {
                            setUserBooks(prev => prev.map(b => b.id === id ? { ...b, read_progress: pct } : b));
                        }}
                    />
                )}
            </AnimatePresence>

        </div >
    );
}
