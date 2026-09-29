import type { ReactNode } from 'react'

// Steps of the admin onboarding tour. `path` is the page the step is shown on
// (the tour navigates there itself); `target` is a `data-tour="…"` attribute
// placed on the element to highlight. `action: 'click'` steps wait for the
// admin to press the highlighted element, which usually navigates to the next
// step's page. The wording follows the admin manual (app/manuel/page.tsx) — if
// a feature changes, update both.

export interface TourStep {
  path: string
  target?: string
  title: string
  body: ReactNode
  action?: 'click'
  hint?: string
  emoji?: string
}

const b = (s: string) => <strong className="text-navy">{s}</strong>

export const TOUR_STEPS: TourStep[] = [
  {
    path: '/admin',
    emoji: '👋',
    title: 'Bienvenue dans votre espace d’administration',
    body: (
      <>
        <p>En quelques minutes, ce guide vous montre où se trouve chaque outil et à quoi il sert : modération, comptes, professionnels, paiements, contenu et réglages.</p>
        <p>Vous pouvez le quitter à tout moment et le relancer plus tard depuis le menu.</p>
      </>
    ),
  },
  {
    path: '/admin',
    target: 'sidebar',
    title: 'Le menu principal',
    body: <p>Toutes les sections de l’administration sont ici, dans l’ordre où vous les utiliserez le plus souvent. Nous allons les parcourir une par une.</p>,
  },
  {
    path: '/admin',
    target: 'dashboard-stats',
    title: 'Ce qu’il y a à traiter aujourd’hui',
    body: (
      <>
        <p>Le tableau de bord répond à une seule question : {b('y a-t-il quelque chose à faire ?')}</p>
        <p>Annonces en attente, signalements, blocages du pare-feu, nouveaux membres… Chaque carte est cliquable et mène à la liste correspondante.</p>
      </>
    ),
  },
  {
    path: '/admin',
    target: 'dashboard-moderation',
    title: 'La file de modération',
    body: <p>Les annonces qui attendent votre validation apparaissent ici. {b('Valider')} les met en ligne, {b('Refuser')} prévient l’auteur par e-mail. Ne les laissez pas traîner : une annonce en attente est une annonce perdue pour son auteur.</p>,
  },
  {
    path: '/admin',
    target: 'dashboard-modules',
    title: 'Modules et accès rapides',
    body: <p>Des raccourcis vers chaque module, l’export de la base de données et le vidage du cache, utile si une modification tarde à apparaître sur le site.</p>,
  },
  {
    path: '/admin',
    target: 'site-selector',
    title: 'Le site que vous administrez',
    body: <p>1000Click peut servir plusieurs pays. Ce sélecteur choisit le site dont vous voyez les données : toutes les pages de l’administration s’y adaptent.</p>,
  },
  {
    path: '/admin',
    target: 'nav-annonces',
    action: 'click',
    title: 'Passons aux annonces',
    body: <p>C’est ici que se fait l’essentiel de la modération.</p>,
    hint: 'Cliquez sur « Annonces »',
  },
  {
    path: '/admin/annonces',
    target: 'annonces-autopublish',
    title: 'Publication automatique',
    body: (
      <>
        <p>{b('Activée')} : chaque annonce est publiée immédiatement, seul le pare-feu peut encore la bloquer.</p>
        <p>{b('Désactivée')} : chaque annonce attend votre validation. Idéal à l’ouverture du site ou après une vague d’abus.</p>
        <p>Le changement ne concerne que les prochaines annonces déposées.</p>
      </>
    ),
  },
  {
    path: '/admin/annonces',
    target: 'annonces-filters',
    title: 'Filtrer par statut',
    body: <p>En attente, publiées, vendues, expirées, refusées ou signalées : un clic affiche la liste correspondante. Sur une annonce en attente, les boutons {b('Approuver')} et {b('Refuser')} apparaissent directement dans la ligne.</p>,
  },
  {
    path: '/admin/annonces',
    target: 'annonces-search',
    title: 'Retrouver une annonce',
    body: <p>Recherchez par titre et filtrez par catégorie pour retrouver une annonce précise en quelques secondes.</p>,
  },
  {
    path: '/admin/annonces',
    target: 'nav-utilisateurs',
    action: 'click',
    title: 'Les membres du site',
    body: <p>Voyons maintenant les comptes utilisateurs.</p>,
    hint: 'Cliquez sur « Utilisateurs »',
  },
  {
    path: '/admin/utilisateurs',
    target: 'users-filters',
    title: 'Tous les comptes, par type',
    body: <p>Gratuits, premium, administrateurs, professionnels, bloqués : chaque carte filtre la liste. Pour chaque compte, vous voyez ses annonces, ses favoris et ses messages envoyés — un compte créé le jour même qui publie quinze annonces mérite un regard.</p>,
  },
  {
    path: '/admin/utilisateurs',
    target: 'users-search',
    title: 'Chercher et agir',
    body: <p>Recherchez un membre par nom ou e-mail. Dans sa ligne, vous pouvez changer son rôle ou le {b('bloquer')} : un compte bloqué ne peut plus ni publier ni écrire.</p>,
  },
  {
    path: '/admin/utilisateurs',
    target: 'nav-professionnels',
    action: 'click',
    title: 'L’annuaire des professionnels',
    body: <p>La partie commerciale du site.</p>,
    hint: 'Cliquez sur « Professionnels »',
  },
  {
    path: '/admin/professionnels',
    target: 'pros-tiers',
    title: 'Les formules',
    body: (
      <>
        <p>{b('Gratuit')}, {b('Smart')} (99 € HT/an), {b('Pro')} (299 € HT/an) et {b('VIP')} (499 € HT/an). Plus la formule est haute, plus le professionnel est visible : bannières, photos illimitées, badge « Recommandé », statistiques de clics.</p>
        <p>Cliquez sur une carte pour filtrer la liste.</p>
      </>
    ),
  },
  {
    path: '/admin/professionnels',
    target: 'pros-add',
    title: 'Créer ou modifier une fiche',
    body: (
      <>
        <p>Ajoutez un professionnel vous-même, ou ouvrez une fiche existante pour la modifier : description, photos, zones, formule.</p>
        <p>Le champ {b('Offert jusqu’au')} permet un geste commercial : la formule est accordée sans paiement jusqu’à la date choisie, puis la fiche repasse en Gratuit.</p>
      </>
    ),
  },
  {
    path: '/admin/professionnels',
    target: 'nav-signalements',
    action: 'click',
    title: 'Les alertes des visiteurs',
    body: <p>Quand un visiteur signale une annonce, c’est ici qu’elle arrive.</p>,
    hint: 'Cliquez sur « Signalements »',
  },
  {
    path: '/admin/signalements',
    target: 'reports-legend',
    title: 'Trois actions à ne pas confondre',
    body: (
      <>
        <p>{b('Retirer')} dépublie l’annonce, {b('Republier')} la remet en ligne, {b('Clore')} ferme le signalement sans toucher à l’annonce.</p>
        <p>Un signalement fondé se traite en deux temps : retirer l’annonce, puis clore. Tant qu’il n’est pas clos, il reste dans le compteur.</p>
      </>
    ),
  },
  {
    path: '/admin/signalements',
    target: 'nav-paiements',
    action: 'click',
    title: 'Les revenus',
    body: <p>Voyons qui paie quoi.</p>,
    hint: 'Cliquez sur « Paiements »',
  },
  {
    path: '/admin/paiements',
    target: 'payments-arr',
    title: 'Le revenu annuel estimé',
    body: (
      <>
        <p>La somme des formules actives sur douze mois, hors taxes. C’est une projection, pas un encaissement : les formules offertes y sont signalées comme telles.</p>
        <p>Remboursements, litiges et factures se gèrent dans votre tableau de bord Stripe.</p>
      </>
    ),
  },
  {
    path: '/admin/paiements',
    target: 'nav-statistiques',
    action: 'click',
    title: 'Piloter le site',
    body: <p>Les grands chiffres, réunis sur une page.</p>,
    hint: 'Cliquez sur « Statistiques »',
  },
  {
    path: '/admin/statistiques',
    target: 'stats-kpis',
    title: 'Les indicateurs clés',
    body: <p>Membres, annonces, professionnels, revenus, signalements. Plus bas, le {b('top des catégories')} vous dit où se trouve votre audience : une catégorie qui décolle mérite d’être mise en avant.</p>,
  },
  {
    path: '/admin/statistiques',
    target: 'nav-blog',
    action: 'click',
    title: 'Le contenu éditorial',
    body: <p>Le blog attire des visiteurs depuis les moteurs de recherche.</p>,
    hint: 'Cliquez sur « Blog »',
  },
  {
    path: '/admin/blog',
    target: 'blog-new',
    title: 'Écrire un article',
    body: <p>Créez un article dans l’une des langues du site, enregistrez-le en brouillon puis publiez-le quand il est prêt. Chaque article bien référencé est une porte d’entrée supplémentaire vers 1000Click.</p>,
  },
  {
    path: '/admin/blog',
    target: 'nav-categories',
    action: 'click',
    title: 'L’organisation des annonces',
    body: <p>Les catégories structurent tout le site.</p>,
    hint: 'Cliquez sur « Catégories »',
  },
  {
    path: '/admin/categories',
    target: 'categories-tree',
    title: 'L’arborescence des catégories',
    body: (
      <>
        <p>Catégories et sous-catégories, avec leur icône, leurs traductions et le nombre d’annonces classées.</p>
        <p>Changez le nom affiché librement, mais évitez de modifier le {b('slug')} : c’est l’adresse publique de la catégorie, le changer casse les liens existants.</p>
      </>
    ),
  },
  {
    path: '/admin/categories',
    target: 'nav-parametres',
    action: 'click',
    title: 'Les réglages du site',
    body: <p>Quelques clics ici changent le site pour tout le monde.</p>,
    hint: 'Cliquez sur « Paramètres »',
  },
  {
    path: '/admin/parametres',
    target: 'settings-tabs',
    title: 'Les onglets de réglages',
    body: (
      <>
        <p>{b('Général')} : publication automatique et e-mail de contact.</p>
        <p>{b('Apparence')} : les images qui défilent en haut de la page d’accueil.</p>
        <p>{b('Bannière du site')} : un bandeau d’information en haut de toutes les pages.</p>
        <p>{b('Base de données')} : export et remises à zéro.</p>
      </>
    ),
  },
  {
    path: '/admin/parametres',
    target: 'settings-save',
    title: 'N’oubliez pas d’enregistrer',
    body: <p>Vos modifications ne s’appliquent qu’après un clic sur {b('Sauvegarder')}. Le bouton s’active dès que quelque chose a changé.</p>,
  },
  {
    path: '/admin/parametres',
    target: 'settings-tab-maintenance',
    action: 'click',
    title: 'Le mode maintenance',
    body: <p>L’interrupteur le plus lourd de conséquences.</p>,
    hint: 'Cliquez sur l’onglet « Maintenance »',
  },
  {
    path: '/admin/parametres',
    target: 'settings-maintenance',
    title: 'Fermer le site temporairement',
    body: (
      <>
        <p>Activé, tout le site public affiche une page d’indisponibilité. L’administration et la connexion restent accessibles : vous ne serez jamais enfermé dehors.</p>
        <p>Prévenez d’abord vos visiteurs avec la bannière, activez ensuite.</p>
      </>
    ),
  },
  {
    path: '/admin/parefeu',
    target: 'firewall-info',
    title: 'Le pare-feu automatique',
    body: (
      <>
        <p>Chaque annonce est analysée avant publication : armes, stupéfiants, faux documents… Les annonces suspectes sont bloquées et arrivent ici.</p>
        <p>Le pare-feu détecte des mots, pas des intentions : en cas de faux positif, {b('approuvez')} ; sinon, {b('supprimez')}. Cette page n’est pas dans le menu : on y accède par la carte « Bloquée (pare-feu) » du tableau de bord.</p>
      </>
    ),
  },
  {
    path: '/admin/sites',
    target: 'sites-list',
    title: 'Les sites par pays',
    body: <p>La configuration multi-pays : nom, domaine, publication et activation de chaque site. Cette page n’est pas dans le menu non plus — mettez l’adresse /admin/sites en favori.</p>,
  },
  {
    path: '/admin/sites',
    target: 'nav-aide',
    title: 'Le manuel complet',
    body: <p>Tout ce que vous venez de voir, en détail, avec une liste de vérifications avant ouverture et un guide de dépannage.</p>,
  },
  {
    path: '/admin/sites',
    target: 'tour-replay',
    title: 'Revoir ce guide',
    body: <p>Ce bouton relance la visite à tout moment.</p>,
  },
  {
    path: '/admin',
    emoji: '🎉',
    title: 'Vous êtes prêt !',
    body: <p>Votre routine quotidienne : ouvrir le tableau de bord et ramener la pastille de notifications à zéro — annonces en attente, signalements et pare-feu. Bonne administration !</p>,
  },
]
