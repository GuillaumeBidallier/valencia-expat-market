// Content firewall — automatically blocks prohibited listings before publication.
// Rules cover French, English and Spanish since the platform is used by expats in Spain.

export interface FirewallResult {
  blocked: boolean
  category: string | null
  reason: string | null
  matchedTerms: string[]
}

// Normalize text: lowercase + remove diacritics so "héroïne" matches "heroine"
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Match a list of keywords/regex against normalised text.
// Returns the first matched term, or null.
function findMatch(text: string, patterns: (string | RegExp)[]): string | null {
  for (const p of patterns) {
    if (typeof p === 'string') {
      // Whole-word match using word-boundary equivalent for multi-byte chars
      const re = new RegExp(`(?<![a-z0-9])(${escapeRegex(p)})(?![a-z0-9])`, 'i')
      if (re.test(text)) return p
    } else {
      const m = text.match(p)
      if (m) return m[0]
    }
  }
  return null
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Rule definitions ─────────────────────────────────────────────────────────

interface FirewallRule {
  category: string
  reason: string
  patterns: (string | RegExp)[]
}

const RULES: FirewallRule[] = [

  // ── Armes à feu & munitions ──────────────────────────────────────────────────
  {
    category: 'Armes à feu',
    reason: 'La vente d\'armes à feu et de munitions est interdite sur la plateforme.',
    patterns: [
      // FR
      'pistolet', 'revolver', 'fusil automatique', 'carabine militaire', 'arme a feu',
      'munitions', 'cartouches', 'chargeur arme', 'silencieux arme',
      // EN
      'handgun', 'firearm', 'semi-automatic', 'fully automatic', 'ammunition',
      /\bammo\b/, /\bglock\b/, /\bak[-\s]?47\b/, /\bm16\b/, /\bar[-\s]?15\b/,
      /\bberetta\b/, /\bsig sauer\b/, /\bwalther\b/, /\bremington (700|870)\b/,
      // ES
      'arma de fuego', 'pistola automatica', 'municion', 'cartucho arma', 'silenciador arma',
      // Generic
      'kalachnikov', /\bkalach\b/, 'bazooka', 'lance-grenades',
    ],
  },

  // ── Armes blanches & armes de combat ──────────────────────────────────────────
  {
    category: 'Armes de combat',
    reason: 'La vente d\'armes de combat (couteaux militaires, armes dissimulables) est interdite.',
    patterns: [
      /\bpoignard\b/, /\bdague\b/, 'couteau de combat', 'couteau tactical', 'couteau militaire',
      /\bshuriken\b/, /\bnunchaku\b/, /\bmatraque\b/, /\btaser\b/, /\bstun gun\b/,
      'baton telescopique', /\bknuckle duster\b/, 'poing americain', 'katana vente',
      // ES
      'cuchillo de combate', 'navaja automatica', 'defensa personal arma',
    ],
  },

  // ── Stupéfiants & drogues ───────────────────────────────────────────────────
  {
    category: 'Stupéfiants',
    reason: 'La vente de stupéfiants ou drogues illicites est strictement interdite.',
    patterns: [
      // Cannabis
      /\bcannabis\b/, /\bmarijuana\b/, /\bweed\b/, /\bherbe\b.*\bvend/, /\bjoint\b.*\bvend/,
      /\bhaschich\b/, /\bhachis\b/, /\bbeuh\b/, /\bshit\b.*\bvend/, /\bpollen\b.*\bcannabis\b/,
      'huile de cbd concentre', 'resine cannabis',
      // Cocaine
      /\bcocaine\b/, /\bcocaina\b/, /\bcoke\b.*\bvend/, /\bcrack\b.*\bvend/,
      // Heroin & opioids
      /\bheroine\b/, /\bheroin\b/, /\bopium\b/, /\bfentanyl\b/,
      // Amphetamines
      /\bmethamph/, /\bcrystal meth\b/, /\bice\b.*\bdrogue/, /\bspeed\b.*\bvend/,
      /\bamphetamine\b/, /\bamphetamines\b/,
      // MDMA / Ecstasy
      /\becstasy\b/, /\bmdma\b/, /\bpilule ecstasy\b/,
      // LSD / psychedelics
      /\blsd\b/, /\bacide\b.*\bvend/, /\bchampignons magiques\b/, /\bpsilocybine\b/,
      /\bpsilocybin\b/, /\btruffes psychedeliques\b/,
      // GHB
      /\bghb\b/, 'drogue du violeur',
      // ES
      /\bcocaina\b/, /\bmarihuana\b/, /\bpaco\b.*\bvend/, /\bporro\b.*\bvend/,
    ],
  },

  // ── Prostitution & services sexuels ─────────────────────────────────────────
  {
    category: 'Prostitution',
    reason: 'Les services de prostitution ou d\'escorte sont interdits sur la plateforme.',
    patterns: [
      /\bescort\b/, /\bescorte\b/, /\bprostituee\b/, /\bprostitution\b/,
      /\bcall.?girl\b/, /\bcall.?boy\b/,
      'massage erotique', 'massage tantrique sexuel', 'prestation sexuelle',
      'passe complete', /\bpute\b/, /\bputain\b.*\bservices?\b/,
      'plan cul', /\bsexe\b.*\bargent\b/, /\bargent\b.*\bsexe\b/,
      // ES
      'prostitucion', /\bputas?\b.*\bservicios?\b/, 'acompanante sexual',
    ],
  },

  // ── Faux documents & contrefaçon officielle ─────────────────────────────────
  {
    category: 'Faux documents',
    reason: 'La vente de faux documents officiels est un délit grave.',
    patterns: [
      'faux papiers', 'faux passeport', 'faux permis de conduire', 'fausse carte d identite',
      'fausse carte d identite', 'faux diplome', 'diplome falsifie', 'document falsifie',
      'faux visa', 'carte bancaire clonee', 'carte clonee',
      // EN
      'fake passport', 'fake id', 'fake driving licence', 'forged document',
      'fake diploma', 'cloned card',
      // ES
      'pasaporte falso', 'dni falso', 'carnet falso', 'documento falsificado',
    ],
  },

  // ── Explosifs & matières dangereuses ─────────────────────────────────────────
  {
    category: 'Explosifs',
    reason: 'La vente d\'explosifs ou de matières dangereuses est interdite.',
    patterns: [
      /\bexplosif\b/, /\bexplosive\b/, /\bdynamite\b/, /\btnt\b/,
      /\bdetonateur\b/, /\bdetonator\b/, 'poudre noire vente', 'poudre a canon',
      /\bgrenade\b.*\bvend/, /\bgrenade\b.*\bachete/, /\bmolotov\b/,
      // ES
      /\bexplosivo\b/, /\bdetonador\b/,
    ],
  },

  // ── Médicaments sous contrôle vendus illégalement ────────────────────────────
  {
    category: 'Médicaments illicites',
    reason: 'La vente de médicaments sous ordonnance sans prescription est interdite.',
    patterns: [
      /\btramadol\b.*\bvend/, /\boxycodone\b/, /\boxycod/, /\bfentanyl\b/,
      /\bxanax\b.*\bvend/, /\balprazolam\b.*\bvend/, /\bvalium\b.*\bvend/,
      /\bdiazepam\b.*\bvend/, /\bcodeine\b.*\bvend/, /\bmorphine\b.*\bvend/,
      /\brohypnol\b/, /\bbuprenorphine\b.*\bvend/, /\bsubutex\b.*\bvend/,
      /\bmethadone\b.*\bvend/, /\britaline\b.*\bvend/, /\bmodafinil\b.*\bvend/,
      'medicament sans ordonnance achat', 'acheter medicament illicite',
    ],
  },

  // ── Contenu sexuel explicite ──────────────────────────────────────────────────
  {
    category: 'Contenu adulte explicite',
    reason: 'Le contenu sexuel explicite n\'est pas autorisé sur la plateforme.',
    patterns: [
      /\bpornographie\b/, /\bporno\b.*\bvend/, /\bvideo x\b.*\bvend/,
      /\bsextape\b/, 'film porno vente', 'video sexe vente',
      // EN
      /\bpornography\b.*\bsell/, /\badult content\b.*\bsell/,
    ],
  },

  // ── Animaux protégés & espèces CITES ─────────────────────────────────────────
  {
    category: 'Espèces protégées',
    reason: 'La vente d\'espèces animales protégées (CITES) est illégale.',
    patterns: [
      'espece protegee', 'animal protege', 'cites appendice',
      /\bperroquet\b.*\bsauvage\b/, /\bfaucon\b.*\bvend/, /\baigle\b.*\bvend/,
      /\btortue\b.*\bprotegee\b/, /\bcoral\b.*\bvend/,
      'ivoire vente', 'come de rhinoceros', 'peau de leopard',
      // ES
      'especie protegida', 'animal protegido',
    ],
  },

  // ── Organes humains ──────────────────────────────────────────────────────────
  {
    category: 'Trafic d\'organes',
    reason: 'La vente d\'organes humains est illégale.',
    patterns: [
      'rein a vendre', 'organe humain', 'organe a vendre',
      'kidney for sale', 'organ for sale',
      'rinon en venta', 'organo humano venta',
    ],
  },
]

// ─── Public API ───────────────────────────────────────────────────────────────

export function checkFirewall(title: string, description: string): FirewallResult {
  const combined = normalize(`${title} ${description}`)
  const matched: string[] = []

  for (const rule of RULES) {
    const term = findMatch(combined, rule.patterns)
    if (term) {
      matched.push(term)
      return {
        blocked: true,
        category: rule.category,
        reason: rule.reason,
        matchedTerms: matched,
      }
    }
  }

  return { blocked: false, category: null, reason: null, matchedTerms: [] }
}
