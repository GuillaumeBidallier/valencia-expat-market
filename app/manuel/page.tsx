import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { IBM_Plex_Mono } from 'next/font/google'
import { auth } from '@/auth'

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--manuel-mono',
})

export const metadata: Metadata = {
  title: 'Manuel d\'administration',
  // Document interne : il décrit les règles de modération et le pare-feu.
  robots: { index: false, follow: false },
}

const CSS = `
  .manuel {
    --ink:          #1A1F36;
    --ink-soft:     #4A4F66;
    --muted:        #6E665F;
    --ground:       #FAF8F6;
    --surface:      #FFFFFF;
    --surface-2:    #F2EEEA;
    --line:         #E4DDD6;
    --line-strong:  #CFC5BB;

    --orange:       #E8571A;
    --orange-dark:  #C4471A;
    --orange-soft:  #FFF3EE;
    --indigo:       #4F46E5;
    --indigo-soft:  #EEF2FF;

    --be-black:     #14140F;
    --be-yellow:    #FDBE01;
    --be-red:       #EF0110;

    --ok:           #047857;
    --ok-soft:      #ECFDF5;
    --warn:         #B45309;
    --warn-soft:    #FFFBEB;
    --stop:         #B91C1C;
    --stop-soft:    #FEF2F2;

    --display: 'Nunito', 'Trebuchet MS', sans-serif;
    --body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --mono:    var(--manuel-mono), ui-monospace, 'SFMono-Regular', Menlo, monospace;

    --masthead-bg: #1A1F36;
    --masthead-ink: #FFFFFF;
    --masthead-body: #C2BCB6;
    --masthead-meta: #9A948E;

    --rail: 268px;
  }



  .manuel, .manuel * { box-sizing: border-box; }

  .manuel {
    background: var(--ground);
    color: var(--ink);
    font-family: var(--body);
    font-size: 16px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Bandeau titre ─────────────────────────────────────────── */
  .manuel .masthead {
    background: var(--masthead-bg);
    color: var(--masthead-body);
    padding: 56px 32px 0;
  }

  .manuel .masthead-inner { max-width: 1180px; margin: 0 auto; }
  .manuel .backlink {
    display: inline-block;
    font-family: var(--body);
    font-size: 13px;
    color: var(--masthead-meta);
    text-decoration: none;
    margin-bottom: 22px;
  }
  .manuel .backlink:hover { color: var(--masthead-ink); }
  .manuel .backlink:focus-visible { outline: 2px solid var(--be-yellow); outline-offset: 3px; }

  .manuel .eyebrow {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--be-yellow);
    margin: 0 0 14px;
  }
  .manuel .masthead h1 {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(2.1rem, 5vw, 3.4rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
    text-wrap: balance;
    color: var(--masthead-ink);
  }
  .manuel .masthead p {
    max-width: 60ch;
    color: var(--masthead-body);
    font-size: 1.02rem;
    margin: 0 0 34px;
  }
  .manuel .masthead-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 26px;
    font-size: 13px;
    color: var(--masthead-meta);
    padding-bottom: 34px;
  }
  .manuel .masthead-meta b { color: var(--masthead-ink); font-weight: 600; }

  /* Filet tricolore — écho au pin du logo */
  .manuel .tricolour { display: flex; height: 6px; }
  .manuel .tricolour i { flex: 1; }
  .manuel .tricolour i:nth-child(1) { background: var(--be-black); }
  .manuel .tricolour i:nth-child(2) { background: var(--be-yellow); }
  .manuel .tricolour i:nth-child(3) { background: var(--be-red); }

  /* ── Charpente ─────────────────────────────────────────────── */
  .manuel .shell {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 32px 96px;
    display: grid;
    grid-template-columns: var(--rail) minmax(0, 1fr);
    gap: 56px;
    align-items: start;
  }

  .manuel .toc {
    position: sticky;
    top: 28px;
    padding-top: 44px;
    max-height: calc(100vh - 56px);
    overflow-y: auto;
  }
  .manuel .toc h2 {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 14px;
    font-weight: 500;
  }
  .manuel .toc ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
  .manuel .toc a {
    display: flex;
    gap: 10px;
    padding: 5px 10px 5px 8px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--ink-soft);
    font-size: 13.5px;
    line-height: 1.4;
    border-left: 2px solid transparent;
  }
  .manuel .toc a:hover { background: var(--surface-2); color: var(--ink); }
  .manuel .toc a:focus-visible { outline: 2px solid var(--orange); outline-offset: 1px; }
  .manuel .toc a span { font-family: var(--mono); font-size: 11px; color: var(--muted); padding-top: 1px; }
  .manuel .toc .toc-admin { border-left-color: var(--indigo); }
  .manuel .toc .toc-public { border-left-color: var(--orange); }

  .manuel main { padding-top: 44px; min-width: 0; }

  /* ── Sections ──────────────────────────────────────────────── */
  .manuel section { margin-bottom: 68px; scroll-margin-top: 24px; }
  .manuel section > h2 {
    font-family: var(--display);
    font-weight: 900;
    font-size: 1.72rem;
    letter-spacing: -0.015em;
    line-height: 1.2;
    margin: 0 0 6px;
    text-wrap: balance;
  }
  .manuel .sec-kicker {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .manuel .sec-kicker::before {
    content: "";
    width: 22px; height: 2px;
    background: var(--orange);
    display: block;
  }
  .manuel .sec-kicker.admin::before { background: var(--indigo); }

  .manuel h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.12rem;
    margin: 34px 0 10px;
    letter-spacing: -0.005em;
  }
  .manuel h4 {
    font-family: var(--body);
    font-weight: 700;
    font-size: 0.94rem;
    margin: 24px 0 8px;
    color: var(--ink);
  }
  .manuel p { margin: 0 0 14px; max-width: 68ch; }
  .manuel main ul, .manuel main ol { max-width: 68ch; margin: 0 0 16px; padding-left: 22px; }
  .manuel main li { margin-bottom: 7px; }
  .manuel main li::marker { color: var(--muted); }
  .manuel b, .manuel strong { font-weight: 600; color: var(--ink); }
  .manuel a { color: var(--orange-dark); }

  .manuel code {
    font-family: var(--mono);
    font-size: 0.855em;
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 0.1em 0.38em;
    color: var(--ink);
    white-space: nowrap;
  }

  /* ── Encadrés ──────────────────────────────────────────────── */
  .manuel .note {
    border-left: 3px solid var(--orange);
    background: var(--orange-soft);
    padding: 15px 18px;
    border-radius: 0 8px 8px 0;
    margin: 0 0 18px;
    max-width: 68ch;
  }
  .manuel .note.admin { border-left-color: var(--indigo); background: var(--indigo-soft); }
  .manuel .note.warn { border-left-color: var(--warn);   background: var(--warn-soft); }
  .manuel .note.stop { border-left-color: var(--stop);   background: var(--stop-soft); }
  .manuel .note p:last-child { margin-bottom: 0; }
  .manuel .note-label {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 6px;
    color: var(--orange-dark);
  }
  .manuel .note.admin .note-label { color: var(--indigo); }
  .manuel .note.warn  .note-label { color: var(--warn); }
  .manuel .note.stop  .note-label { color: var(--stop); }

  /* ── Tableaux ──────────────────────────────────────────────── */
  .manuel .table-wrap { overflow-x: auto; margin: 0 0 20px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  .manuel table { border-collapse: collapse; width: 100%; font-size: 14px; }
  .manuel th, .manuel td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .manuel th {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    background: var(--surface-2);
    white-space: nowrap;
  }
  .manuel tbody tr:last-child td { border-bottom: none; }
  .manuel td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }

  /* ── Marches numérotées (séquences réelles uniquement) ─────── */
  .manuel .steps { list-style: none; padding: 0; margin: 0 0 20px; counter-reset: s; max-width: 68ch; }
  .manuel .steps > li {
    counter-increment: s;
    position: relative;
    padding-left: 42px;
    margin-bottom: 18px;
  }
  .manuel .steps > li::before {
    content: counter(s);
    position: absolute;
    left: 0; top: 1px;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--ground);
    font-family: var(--mono);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Pastilles d'état ──────────────────────────────────────── */
  .manuel .pill {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 20px;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .manuel .pill.ok { background: var(--ok-soft);   color: var(--ok);   border-color: var(--ok); }
  .manuel .pill.warn { background: var(--warn-soft); color: var(--warn); border-color: var(--warn); }
  .manuel .pill.stop { background: var(--stop-soft); color: var(--stop); border-color: var(--stop); }
  .manuel .pill.mute { background: var(--surface-2); color: var(--muted); border-color: var(--line-strong); }

  /* ── Nuancier ──────────────────────────────────────────────── */
  .manuel .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; margin: 0 0 20px; }
  .manuel .swatch { border: 1px solid var(--line); border-radius: 9px; overflow: hidden; background: var(--surface); }
  .manuel .swatch .chip { height: 52px; }
  .manuel .swatch .meta { padding: 8px 10px; }
  .manuel .swatch .meta b { display: block; font-size: 12.5px; }
  .manuel .swatch .meta code { background: none; border: none; padding: 0; font-size: 11.5px; color: var(--muted); }

  /* ── Divers ────────────────────────────────────────────────── */
  .manuel .lede { font-size: 1.06rem; color: var(--ink-soft); max-width: 66ch; }
  .manuel .rule { height: 1px; background: var(--line); border: 0; margin: 0 0 34px; max-width: 68ch; }

  .manuel footer {
    border-top: 1px solid var(--line);
    padding: 26px 32px 60px;
    color: var(--muted);
    font-size: 13px;
  }
  .manuel footer div { max-width: 1180px; margin: 0 auto; }

  @media (max-width: 900px) {
    .manuel .shell { grid-template-columns: 1fr; gap: 0; padding: 0 22px 64px; }
    .manuel .toc { position: static; max-height: none; padding-top: 34px; border-bottom: 1px solid var(--line); padding-bottom: 20px; }
    .manuel .masthead { padding: 40px 22px 0; }
    .manuel main { padding-top: 34px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .manuel, .manuel * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
`

export default async function ManuelPage() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/')

  return (
    <div className={`manuel ${plexMono.variable}`}>
      <style>{CSS}</style>
      <header className="masthead">
        <div className="masthead-inner">
          <Link href="/admin" className="backlink">&#8592; Retour à l&apos;administration</Link>
            <p className="eyebrow">Documentation interne · Espace d&apos;administration</p>
          <h1>Manuel d&apos;administration 1000Click</h1>
          <p className="lede" style={{ color: 'var(--masthead-body)' }}>Tout ce qu&apos;il faut savoir pour piloter la plateforme au quotidien : modérer les annonces, gérer les professionnels et leurs abonnements, ajuster l&apos;apparence du site et comprendre ce que voient les visiteurs.</p>
          <div className="masthead-meta">
            <span><b>Plateforme</b> · 1000Click Belgique</span>
            <span><b>Domaine</b> · www.1000click.com</span>
            <span><b>Accès</b> · /admin, réservé au rôle Administrateur</span>
            <span><b>Langues du site</b> · 7</span>
          </div>
        </div>
      </header>
      <div className="tricolour" role="presentation"><i></i><i></i><i></i></div>

      <div className="shell">

        <nav className="toc" aria-label="Sommaire">
          <h2>Sommaire</h2>
          <ol>
            <li><a href="#orientation"><span>00</span>Comment lire ce manuel</a></li>
            <li><a href="#publics"><span>01</span>Qui fait quoi sur le site</a></li>
            <li><a className="toc-admin" href="#acces"><span>02</span>Accéder à l&apos;administration</a></li>
            <li><a className="toc-admin" href="#tableau-de-bord"><span>03</span>Le tableau de bord</a></li>
            <li><a className="toc-admin" href="#annonces"><span>04</span>Annonces et modération</a></li>
            <li><a className="toc-admin" href="#parefeu"><span>05</span>Le pare-feu automatique</a></li>
            <li><a className="toc-admin" href="#signalements"><span>06</span>Les signalements</a></li>
            <li><a className="toc-admin" href="#professionnels"><span>07</span>Professionnels et abonnements</a></li>
            <li><a className="toc-admin" href="#paiements"><span>08</span>Paiements et revenus</a></li>
            <li><a className="toc-admin" href="#utilisateurs"><span>09</span>Les comptes utilisateurs</a></li>
            <li><a className="toc-admin" href="#categories"><span>10</span>Les catégories</a></li>
            <li><a className="toc-admin" href="#blog"><span>11</span>Le blog</a></li>
            <li><a className="toc-admin" href="#parametres"><span>12</span>Les réglages du site</a></li>
            <li><a className="toc-admin" href="#statistiques"><span>13</span>Statistiques</a></li>
            <li><a className="toc-public" href="#visiteur"><span>14</span>Le parcours visiteur</a></li>
            <li><a className="toc-public" href="#parcours-pro"><span>15</span>Le parcours professionnel</a></li>
            <li><a href="#charte"><span>16</span>La charte graphique</a></li>
            <li><a href="#avant-ouverture"><span>17</span>Avant l&apos;ouverture au public</a></li>
            <li><a href="#depannage"><span>18</span>Dépannage</a></li>
          </ol>
        </nav>

        <main>

          {/* ══ 00 ══ */}
          <section id="orientation">
            <p className="sec-kicker">Comment lire ce manuel</p>
            <h2>Deux couleurs, deux territoires</h2>
            <p className="lede">Ce document couvre à la fois ce que vous faites en coulisses et ce que vos visiteurs voient à l&apos;écran. Pour éviter la confusion, les deux sont distingués en permanence.</p>
            <div className="note admin">
              <span className="note-label">Réservé à l&apos;administrateur</span>
              <p>Les encadrés à liseré indigo, comme celui-ci, décrivent des écrans accessibles uniquement depuis <code>/admin</code>. Aucun visiteur ne les voit jamais.</p>
            </div>
            <div className="note">
              <span className="note-label">Visible du public</span>
              <p>Les encadrés à liseré orange décrivent ce qui s&apos;affiche sur le site public. Une modification faite ici est immédiatement visible par tout le monde.</p>
            </div>
            <p>Les chemins entre <code>/slashes/</code> sont des adresses à taper à la suite du nom de domaine. Ainsi <code>/admin/annonces</code> se lit <code>www.1000click.com/admin/annonces</code>.</p>
          </section>

          {/* ══ 01 ══ */}
          <section id="publics">
            <p className="sec-kicker">Les rôles</p>
            <h2>Qui fait quoi sur le site</h2>
            <p>Quatre profils cohabitent. Les comprendre évite 90 % des questions de support.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Profil</th><th>Ce qu&apos;il peut faire</th><th>Comment on le devient</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Visiteur</b></td>
                    <td>Parcourir et rechercher les annonces, consulter l&apos;annuaire des professionnels, lire le blog. Il ne peut ni publier ni contacter.</td>
                    <td>Aucune inscription.</td>
                  </tr>
                  <tr>
                    <td><b>Membre</b></td>
                    <td>Déposer des annonces, les modifier, enregistrer des favoris, échanger par messagerie interne.</td>
                    <td>Inscription libre sur <code>/inscription</code>.</td>
                  </tr>
                  <tr>
                    <td><b>Professionnel</b></td>
                    <td>Tout ce que fait un membre, plus une fiche dans l&apos;annuaire, des statistiques et selon la formule des emplacements publicitaires.</td>
                    <td>Un membre crée sa fiche sur <code>/devenir-pro</code> et souscrit une formule.</td>
                  </tr>
                  <tr>
                    <td><b>Administrateur</b></td>
                    <td>Accès complet à <code>/admin</code> : modération, comptes, abonnements, contenu, réglages.</td>
                    <td>Attribué manuellement. Ce n&apos;est pas un bouton public.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="note warn">
              <span className="note-label">À retenir</span>
              <p>Un professionnel <b>reste un membre</b>. Sa fiche pro est une couche supplémentaire posée sur son compte : si vous supprimez le compte, vous supprimez la fiche avec.</p>
            </div>
          </section>

          {/* ══ 02 ══ */}
          <section id="acces">
            <p className="sec-kicker admin">Connexion</p>
            <h2>Accéder à l&apos;administration</h2>
            <ol className="steps">
              <li>Connectez-vous normalement sur <code>/connexion</code> avec votre compte administrateur.</li>
              <li>Rendez-vous sur <code>/admin</code>. Aucun lien ne pointe vers cette adresse depuis le site public : il faut la saisir, ou la mettre en favori.</li>
              <li>Si votre compte n&apos;a pas le rôle administrateur, vous êtes silencieusement renvoyé vers la page d&apos;accueil. Ce n&apos;est pas un bug : c&apos;est la protection.</li>
            </ol>
            <p>L&apos;interface d&apos;administration remplace entièrement l&apos;habillage public : ni barre de navigation, ni pied de page, ni bandeau d&apos;annonce. Vous saurez toujours où vous êtes.</p>
            <h3>La barre latérale</h3>
            <p>Onze entrées, dans l&apos;ordre où vous les utiliserez le plus souvent : Tableau de bord, Annonces, Utilisateurs, Professionnels, Signalements, Paiements, Statistiques, Blog, Catégories, Paramètres, Maintenance.</p>
            <div className="note admin">
              <span className="note-label">Réservé à l&apos;administrateur</span>
              <p>Deux écrans existent sans figurer dans cette barre : <code>/admin/parefeu</code>, la file des annonces bloquées automatiquement, et <code>/admin/sites</code>, la configuration multi-pays. Mettez-les en favori si vous les utilisez souvent.</p>
            </div>
          </section>

          {/* ══ 03 ══ */}
          <section id="tableau-de-bord">
            <p className="sec-kicker admin">Vue d&apos;ensemble</p>
            <h2>Le tableau de bord</h2>
            <p>Première page après connexion. Elle sert à une chose : savoir s&apos;il y a quelque chose à traiter aujourd&apos;hui.</p>
            <h3>La pastille de notification</h3>
            <p>Le compteur affiché en haut de l&apos;administration n&apos;est pas un simple nombre d&apos;annonces. Il additionne <b>trois files d&apos;attente distinctes</b> :</p>
            <ul>
              <li>les annonces <span className="pill warn">en attente</span> de validation ;</li>
              <li>les annonces ayant reçu <b>au moins un signalement</b> non traité ;</li>
              <li>les annonces <b>bloquées par le pare-feu</b> et jamais arbitrées.</li>
            </ul>
            <p>Un compteur à <span className="pill ok">0</span> signifie donc que les trois files sont vides. C&apos;est l&apos;objectif quotidien.</p>
            <div className="note warn">
              <span className="note-label">Piège fréquent</span>
              <p>Le compteur ne descend pas tout seul. Retirer une annonce signalée ne clôt pas le signalement : il faut explicitement <b>clore le signalement</b>. Voir la section 06.</p>
            </div>
          </section>

          {/* ══ 04 ══ */}
          <section id="annonces">
            <p className="sec-kicker admin">Modération</p>
            <h2>Annonces et modération</h2>
            <p>Écran <code>/admin/annonces</code>. Recherche par titre, filtrage par catégorie et par statut.</p>
            <h3>Les six statuts d&apos;une annonce</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Statut</th><th>Visible ?</th><th>Signification</th></tr></thead>
                <tbody>
                  <tr><td><span className="pill warn">En attente</span></td><td>Non</td><td>Déposée, attend votre validation. N&apos;apparaît nulle part publiquement.</td></tr>
                  <tr><td><span className="pill ok">Active</span></td><td>Oui</td><td>Publiée et visible de tous.</td></tr>
                  <tr><td><span className="pill stop">Refusée</span></td><td>Non</td><td>Rejetée par la modération. L&apos;auteur en est informé par e-mail.</td></tr>
                  <tr><td><span className="pill mute">Vendue</span></td><td>Oui</td><td>Marquée vendue par son auteur. Reste consultable, grisée.</td></tr>
                  <tr><td><span className="pill mute">Expirée</span></td><td>Non</td><td>A dépassé sa durée de vie.</td></tr>
                  <tr><td><span className="pill stop">Supprimée</span></td><td>Non</td><td>Retirée définitivement.</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Les deux régimes de publication</h3>
            <p>Le comportement par défaut se règle dans <code>/admin/parametres</code>, onglet Général, interrupteur <b>Publication automatique</b>. Il change radicalement votre charge de travail :</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Réglage</th><th>Ce qui se passe au dépôt</th><th>Quand le choisir</th></tr></thead>
                <tbody>
                  <tr>
                    <td><b>Activé</b></td>
                    <td>L&apos;annonce est publiée immédiatement, sans passer par vous. Seul le pare-feu peut encore la bloquer.</td>
                    <td>Site en régime de croisière, communauté de confiance, volume élevé.</td>
                  </tr>
                  <tr>
                    <td><b>Désactivé</b></td>
                    <td>Chaque annonce arrive <span className="pill warn">en attente</span> et ne s&apos;affiche qu&apos;après votre validation.</td>
                    <td>Ouverture du site, période sensible, ou après une vague d&apos;abus.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="note warn">
              <span className="note-label">Attention</span>
              <p>Désactiver la publication automatique <b>ne remet pas en attente</b> les annonces déjà en ligne. Le réglage ne concerne que les dépôts à venir.</p>
            </div>

            <h3>Valider ou refuser</h3>
            <p>Depuis la file d&apos;attente, chaque annonce se traite en un clic. Refuser envoie un e-mail à l&apos;auteur ; validez plutôt que de laisser traîner, une annonce en attente trop longtemps est une annonce perdue pour le déposant.</p>
          </section>

          {/* ══ 05 ══ */}
          <section id="parefeu">
            <p className="sec-kicker admin">Sécurité du contenu</p>
            <h2>Le pare-feu automatique</h2>
            <p>Écran <code>/admin/parefeu</code>. Le pare-feu analyse le titre et la description de <b>chaque annonce déposée ou modifiée</b>, avant toute publication — y compris lorsque la publication automatique est activée. C&apos;est le seul filet qui ne dort jamais.</p>

            <h3>Les dix catégories surveillées</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Catégorie</th><th>Motif du blocage</th></tr></thead>
                <tbody>
                  <tr><td>Armes à feu</td><td>Vente d&apos;armes à feu et de munitions</td></tr>
                  <tr><td>Armes de combat</td><td>Couteaux militaires, armes dissimulables</td></tr>
                  <tr><td>Stupéfiants</td><td>Drogues illicites</td></tr>
                  <tr><td>Prostitution</td><td>Services d&apos;escorte</td></tr>
                  <tr><td>Faux documents</td><td>Documents officiels contrefaits</td></tr>
                  <tr><td>Explosifs</td><td>Explosifs et matières dangereuses</td></tr>
                  <tr><td>Médicaments illicites</td><td>Médicaments sur ordonnance sans prescription</td></tr>
                  <tr><td>Contenu adulte explicite</td><td>Contenu sexuel explicite</td></tr>
                  <tr><td>Espèces protégées</td><td>Espèces animales couvertes par la CITES</td></tr>
                  <tr><td>Trafic d&apos;organes</td><td>Vente d&apos;organes humains</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Traiter un blocage</h3>
            <p>Le pare-feu détecte des mots, pas des intentions. Un faux positif est donc normal — une annonce pour une « poudre à récurer » peut déclencher la règle stupéfiants. Deux actions possibles :</p>
            <ul>
              <li><b>Faux positif — approuver et publier</b> : l&apos;annonce est légitime, elle part en ligne.</li>
              <li><b>Supprimer définitivement</b> : le blocage était justifié.</li>
            </ul>
            <div className="note stop">
              <span className="note-label">Ne laissez pas la file s&apos;accumuler</span>
              <p>Chaque annonce bloquée est un membre qui a publié quelque chose et ne voit rien apparaître, <b>sans explication de son côté</b>. Traitez cette file quotidiennement, même quand tout le reste est à zéro.</p>
            </div>
          </section>

          {/* ══ 06 ══ */}
          <section id="signalements">
            <p className="sec-kicker admin">Modération communautaire</p>
            <h2>Les signalements</h2>
            <p>Écran <code>/admin/signalements</code>. Ce sont les alertes remontées par vos visiteurs. L&apos;écran affiche la répartition par motif, ce qui permet de repérer une tendance plutôt que de traiter au cas par cas.</p>
            <h3>Trois actions, à ne pas confondre</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Action</th><th>Effet sur l&apos;annonce</th><th>Effet sur le signalement</th></tr></thead>
                <tbody>
                  <tr><td><b>Retirer l&apos;annonce</b></td><td>Dépubliée</td><td>Reste ouvert</td></tr>
                  <tr><td><b>Republier l&apos;annonce</b></td><td>Remise en ligne</td><td>Reste ouvert</td></tr>
                  <tr><td><b>Clore les signalements</b></td><td>Inchangée</td><td>Fermé, sort du compteur</td></tr>
                </tbody>
              </table>
            </div>
            <div className="note warn">
              <span className="note-label">Le geste complet</span>
              <p>Un signalement fondé se traite en <b>deux temps</b> : retirer l&apos;annonce, <i>puis</i> clore le signalement. Un signalement infondé se clôt seul, sans toucher à l&apos;annonce.</p>
            </div>
          </section>

          {/* ══ 07 ══ */}
          <section id="professionnels">
            <p className="sec-kicker admin">Monétisation</p>
            <h2>Professionnels et abonnements</h2>
            <p>Écran <code>/admin/professionnels</code>. Recherche par nom, ville ou catégorie. Chaque fiche s&apos;ouvre en édition : nom, description, catégorie, ville, site web, photos, adresse de la page publique (le <i>slug</i>), et surtout la <b>formule</b>.</p>

            <h3>Les trois formules</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Avantage</th><th>Gratuit</th><th>Smart<br />99 € HT/an</th><th>Pro<br />299 € HT/an</th><th>VIP<br />499 € HT/an</th></tr>
                </thead>
                <tbody>
                  <tr><td>Fiche professionnelle visible</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr>
                  <tr><td>Page dédiée dans l&apos;annuaire</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr>
                  <tr><td>Lien vers son site web</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr>
                  <tr><td>Bannière sur le côté du site</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
                  <tr><td>Photos illimitées sur ses annonces</td><td>—</td><td>—</td><td>—</td><td>✓</td></tr>
                  <tr><td>Bannière grand format en accueil</td><td>—</td><td>—</td><td>—</td><td>✓</td></tr>
                  <tr><td>Badge « Recommandé »</td><td>—</td><td>—</td><td>—</td><td>✓</td></tr>
                  <tr><td>Statistiques de clics</td><td>—</td><td>—</td><td>—</td><td>✓</td></tr>
                </tbody>
              </table>
            </div>
            <p>Tous les tarifs sont <b>hors taxes</b>, en facturation annuelle, résiliables à tout moment.</p>

            <h3>Le geste commercial</h3>
            <p>Le champ <b>Offert jusqu&apos;au</b> permet d&apos;accorder une formule sans paiement : essai, partenariat, compensation. À la date choisie, la fiche <b>repasse automatiquement en Gratuit</b> — sauf si un abonnement Stripe actif a démarré entre-temps, auquel cas c&apos;est l&apos;abonnement qui prime.</p>
            <div className="note admin">
              <span className="note-label">Réservé à l&apos;administrateur</span>
              <p>Changer la formule ici est immédiat et <b>ne déclenche aucun paiement ni aucune facture</b>. C&apos;est un levier commercial, pas un outil de facturation. Pour l&apos;argent réellement encaissé, voir la section 08.</p>
            </div>

            <h3>La carte de visite numérique</h3>
            <p>Option à <b>3,99 € HT/mois</b>, sans engagement, souscrite par le professionnel lui-même. Elle lui donne une page autonome à l&apos;adresse <code>/carte/son-slug</code>, avec son titre ou sa spécialité, une accroche, l&apos;e-mail de son choix et un QR code — de quoi remplacer une carte papier.</p>
          </section>

          {/* ══ 08 ══ */}
          <section id="paiements">
            <p className="sec-kicker admin">Finances</p>
            <h2>Paiements et revenus</h2>
            <p>Écran <code>/admin/paiements</code>. Vue consolidée des abonnements : qui paie, quelle formule, quel statut, et le <b>revenu annuel estimé</b> agrégé en haut de page.</p>
            <div className="note warn">
              <span className="note-label">Comment lire le revenu annuel</span>
              <p>Le montant affiché est une <b>projection hors taxes</b> : la somme des formules actives sur douze mois. Ce n&apos;est ni un encaissement constaté, ni un chiffre d&apos;affaires comptable. Les paliers offerts manuellement y apparaissent identifiés comme tels.</p>
            </div>
            <p>Les paiements transitent par Stripe. Cet écran les reflète ; il ne les pilote pas. Remboursements, litiges et factures se traitent dans le tableau de bord Stripe.</p>
          </section>

          {/* ══ 09 ══ */}
          <section id="utilisateurs">
            <p className="sec-kicker admin">Communauté</p>
            <h2>Les comptes utilisateurs</h2>
            <p>Écran <code>/admin/utilisateurs</code>. Recherche par nom ou e-mail. Pour chaque compte : date d&apos;inscription, statut, et trois indicateurs d&apos;activité — <b>annonces déposées</b>, <b>favoris enregistrés</b>, <b>messages envoyés</b>.</p>
            <p>Ces trois chiffres valent mieux qu&apos;un long dossier : un compte à zéro partout, créé le jour même, qui dépose soudain quinze annonces, mérite un regard.</p>
            <p>Vous pouvez bloquer un compte. Un compte bloqué ne peut plus ni publier ni écrire.</p>
          </section>

          {/* ══ 10 ══ */}
          <section id="categories">
            <p className="sec-kicker admin">Structure</p>
            <h2>Les catégories</h2>
            <p>Écran <code>/admin/categories</code>. L&apos;arborescence sur deux niveaux : catégories racines et sous-catégories. Chaque entrée possède un nom affiché, un <b>slug</b> (le fragment d&apos;adresse, généré depuis le nom), une <b>icône emoji</b> et ses <b>traductions</b>.</p>
            <div className="note stop">
              <span className="note-label">Manipuler avec précaution</span>
              <p>Le slug est l&apos;adresse publique de la catégorie. Le modifier <b>casse tous les liens existants</b> vers elle : favoris, partages, résultats de moteurs de recherche. Changez le nom affiché librement ; ne touchez au slug qu&apos;en connaissance de cause.</p>
            </div>
            <p>Le nombre d&apos;annonces classées dans chaque catégorie est affiché. Consultez-le avant toute suppression.</p>
          </section>

          {/* ══ 11 ══ */}
          <section id="blog">
            <p className="sec-kicker admin">Contenu éditorial</p>
            <h2>Le blog</h2>
            <p>Écran <code>/admin/blog</code>. Création via <code>/admin/blog/new</code>, modification via la liste. Recherche par titre, catégorie ou auteur.</p>
            <p>Le blog sert le référencement autant que la communauté : chaque article est une porte d&apos;entrée supplémentaire vers le site depuis les moteurs de recherche. Des articles ancrés sur la vie pratique en Belgique travaillent pour vous en continu.</p>
          </section>

          {/* ══ 12 ══ */}
          <section id="parametres">
            <p className="sec-kicker admin">Configuration</p>
            <h2>Les réglages du site</h2>
            <p>Écran <code>/admin/parametres</code>, organisé en onglets. C&apos;est le seul endroit où une poignée de clics change le visage du site pour tout le monde — d&apos;où la vigilance particulière recommandée ici.</p>

            <h3>Général</h3>
            <ul>
              <li><b>Publication automatique</b> — détaillée en section 04.</li>
              <li><b>E-mail de contact</b> — l&apos;adresse affichée sur les pages légales et le formulaire de contact.</li>
            </ul>

            <h3>Apparence — le carrousel de la page d&apos;accueil</h3>
            <p>Les images de fond du grand visuel d&apos;accueil. Vous pouvez :</p>
            <ul>
              <li><b>téléverser</b> un fichier (JPEG, PNG, WebP ou AVIF, <b>8 Mo maximum</b>) ;</li>
              <li><b>ajouter par adresse</b> une image déjà en ligne ;</li>
              <li><b>réordonner</b> par glisser-déposer — l&apos;ordre est celui de la rotation ;</li>
              <li><b>supprimer</b>, et renseigner le <b>texte alternatif</b>, lu par les lecteurs d&apos;écran.</li>
            </ul>
            <p>Avec deux images ou plus, le fond défile automatiquement <b>toutes les 6 secondes</b> en fondu, et des puces de navigation apparaissent. Avec une seule, l&apos;image reste fixe. Si la liste est vide, le visuel d&apos;origine est utilisé.</p>
            <div className="note">
              <span className="note-label">Visible du public</span>
              <p>Privilégiez des images <b>larges et peu chargées au centre</b> : le titre, le sous-titre et la barre de recherche se superposent au milieu du visuel. Une photo au sujet central se retrouvera masquée.</p>
            </div>

            <h3>Bannière d&apos;annonce</h3>
            <p>Un bandeau jaune en haut de toutes les pages publiques, pour une information ponctuelle : maintenance programmée, nouveauté, fermeture. Un interrupteur l&apos;active, un champ porte le message, et un aperçu montre le rendu exact avant publication.</p>
            <p>Le visiteur peut la fermer d&apos;un clic. Elle ne revient pas pour lui — <b>jusqu&apos;à ce que vous changiez le texte</b>, ce qui la fait réapparaître pour tout le monde. Pour rediffuser un message, modifiez-le plutôt que de le désactiver puis le réactiver à l&apos;identique.</p>

            <h3>Maintenance</h3>
            <p>L&apos;interrupteur le plus lourd de conséquences du panneau. Activé, <b>l&apos;intégralité du site public renvoie une page d&apos;indisponibilité</b> aux visiteurs.</p>
            <p>Restent accessibles, pour que vous ne soyez jamais enfermé dehors : <code>/admin</code>, <code>/connexion</code> et les services d&apos;authentification.</p>
            <div className="note stop">
              <span className="note-label">Avant d&apos;activer</span>
              <p>Prévenez d&apos;abord avec la bannière d&apos;annonce, activez ensuite. Le basculement prend effet en <b>quelques secondes</b> et se voit immédiatement de l&apos;extérieur. Vérifiez depuis une fenêtre de navigation privée : connecté en administrateur, vous ne verriez rien.</p>
            </div>
          </section>

          {/* ══ 13 ══ */}
          <section id="statistiques">
            <p className="sec-kicker admin">Pilotage</p>
            <h2>Statistiques</h2>
            <p>Écran <code>/admin/statistiques</code>. Les grands indicateurs réunis : annonces, utilisateurs, professionnels, revenus, signalements et <b>top des catégories</b>.</p>
            <p>Le classement des catégories est le plus actionnable : il dit où se trouve réellement votre audience. Une catégorie qui décolle mérite d&apos;être mise en avant dans le carrousel d&apos;accueil et démarchée côté professionnels.</p>
          </section>

          {/* ══ 14 ══ */}
          <section id="visiteur">
            <p className="sec-kicker">Côté public</p>
            <h2>Le parcours visiteur</h2>
            <p>Ce que vivent vos utilisateurs. Le connaître permet de répondre au support sans avoir à reproduire chaque cas.</p>

            <h3>Déposer une annonce</h3>
            <ol className="steps">
              <li>Le membre ouvre <code>/deposer-annonce</code>. Non connecté, il est d&apos;abord renvoyé vers la connexion.</li>
              <li>Il renseigne titre, description, catégorie, prix et photos. Le prix peut rester vide : l&apos;annonce devient un <b>don</b>.</li>
              <li>Selon la catégorie, des champs spécifiques apparaissent — année, kilométrage et carburant pour un véhicule ; chambres et surface habitable pour un bien immobilier.</li>
              <li>À la validation, le pare-feu analyse le contenu.</li>
              <li>L&apos;annonce est publiée aussitôt, ou placée en attente selon votre réglage.</li>
            </ol>

            <h3>Son espace personnel</h3>
            <p>Sur <code>/mon-compte</code>, quatre onglets : <b>Mes annonces</b>, <b>Mes favoris</b>, <b>Mon profil</b> et <b>Préférences</b>. Un bandeau de synthèse affiche annonces, actives, vendues, favoris et <b>vues totales</b>.</p>

            <h3>La messagerie</h3>
            <p>Les échanges se font sur <code>/messages</code>, sans que personne n&apos;ait à divulguer son adresse e-mail. Les messages arrivent en temps réel et une notification par e-mail prévient le destinataire absent.</p>

            <h3>Les langues</h3>
            <p>Le site est disponible en <b>sept langues</b> : français, néerlandais, anglais, allemand, espagnol, ukrainien et russe. Le sélecteur se trouve dans la barre de navigation.</p>
            <div className="note">
              <span className="note-label">Visible du public</span>
              <p>Seule l&apos;<b>interface</b> est traduite. Le contenu déposé par les membres — titres, descriptions — reste dans la langue d&apos;écriture. C&apos;est la question de support la plus fréquente sur ce point.</p>
            </div>
          </section>

          {/* ══ 15 ══ */}
          <section id="parcours-pro">
            <p className="sec-kicker">Côté public</p>
            <h2>Le parcours professionnel</h2>
            <p>La partie qui génère le chiffre d&apos;affaires. Vous serez amené à l&apos;expliquer souvent : connaissez-la de bout en bout.</p>

            <h3>De la découverte à la fiche en ligne</h3>
            <ol className="steps">
              <li>Le professionnel découvre l&apos;offre sur <code>/devenir-pro</code> ou <code>/publicite</code>.</li>
              <li>Il lance la création sur <code>/mon-compte/profil-pro/create</code> — un assistant guidé, annoncé en quatre minutes.</li>
              <li>Il renseigne son activité, sa catégorie, sa ville, sa description et ses visuels.</li>
              <li>Il choisit sa formule : Smart, Pro ou VIP. Le paiement passe par Stripe.</li>
              <li>Sa fiche rejoint l&apos;annuaire <code>/professionnels</code> avec sa page dédiée.</li>
            </ol>

            <h3>Son tableau de bord</h3>
            <p>Sur <code>/mon-compte/profil-pro</code>, six onglets : <b>Aperçu</b>, <b>Fiche</b>, <b>Médias</b>, <b>Statistiques</b>, <b>Carte de visite</b> et <b>Abonnement</b>.</p>

            <h3>Les dix familles de métiers</h3>
            <p>L&apos;annuaire est structuré autour de : immobilier, juridique et fiscal, comptabilité, déménagement, assurance, santé, automobile, éducation, services et artisans, et autres professionnels.</p>
            <div className="note">
              <span className="note-label">Argument de vente</span>
              <p>Le professionnel n&apos;achète pas un encart : il achète une <b>audience francophone déjà en recherche active</b> en Belgique. Un déménageur touche des gens qui cherchent un logement au moment où ils le cherchent. C&apos;est cette simultanéité qui se vend, pas l&apos;affichage.</p>
            </div>
          </section>

          {/* ══ 16 ══ */}
          <section id="charte">
            <p className="sec-kicker">Identité</p>
            <h2>La charte graphique</h2>
            <p>À respecter dès que vous produisez un visuel, un document commercial ou une publication pour 1000Click.</p>

            <h3>Les couleurs</h3>
            <div className="swatches">
              <div className="swatch"><div className="chip" style={{ background: '#E8571A' }}></div><div className="meta"><b>Orange primaire</b><code>#E8571A</code></div></div>
              <div className="swatch"><div className="chip" style={{ background: '#1A1F36' }}></div><div className="meta"><b>Navy</b><code>#1A1F36</code></div></div>
              <div className="swatch"><div className="chip" style={{ background: '#4F46E5' }}></div><div className="meta"><b>Indigo</b><code>#4F46E5</code></div></div>
              <div className="swatch"><div className="chip" style={{ background: '#FDBE01' }}></div><div className="meta"><b>Jaune belge</b><code>#FDBE01</code></div></div>
              <div className="swatch"><div className="chip" style={{ background: '#EF0110' }}></div><div className="meta"><b>Rouge belge</b><code>#EF0110</code></div></div>
              <div className="swatch"><div className="chip" style={{ background: '#FFF3EE' }}></div><div className="meta"><b>Orange doux</b><code>#FFF3EE</code></div></div>
            </div>
            <p>L&apos;<b>orange</b> signale l&apos;action : boutons principaux, liens d&apos;appel, mises en avant. Le <b>navy</b> porte le texte et les fonds sombres. L&apos;<b>indigo</b> marque les univers thématiques. Le jaune et le rouge sont réservés au logo et aux touches belges — jamais en aplat de fond.</p>

            <h3>Les typographies</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Rôle</th><th>Police</th><th>Graisses</th></tr></thead>
                <tbody>
                  <tr><td>Titres</td><td><b>Nunito</b></td><td>800 et 900, jamais plus léger</td></tr>
                  <tr><td>Texte courant</td><td><b>Inter</b></td><td>400 à 700</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Le logo — deux fichiers, une seule règle</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Fichier</th><th>À utiliser sur</th></tr></thead>
                <tbody>
                  <tr><td><code>logo-1000click.png</code></td><td>Fond clair — lettrage noir</td></tr>
                  <tr><td><code>logo-1000click-white.png</code></td><td>Fond sombre — lettrage blanc</td></tr>
                </tbody>
              </table>
            </div>
            <div className="note stop">
              <span className="note-label">L&apos;erreur à ne jamais commettre</span>
              <p>Poser la version fond clair sur un fond sombre. Le lettrage noir disparaît et il ne reste que les ronds de couleur. C&apos;est le défaut le plus visible et le plus fréquent — vérifiez systématiquement avant d&apos;exporter.</p>
            </div>
            <p>Les deux fichiers sont recadrés au plus près, sans marge transparente : prévoyez vous-même une zone de respiration d&apos;au moins la hauteur du « 1 » autour du logo. Ne déformez jamais les proportions, ne recolorez pas le lettrage, n&apos;ajoutez pas d&apos;ombre portée.</p>

            <h3>Le ton</h3>
            <p>Vouvoiement, phrases courtes, pas de jargon technique face aux membres. On dit « votre annonce est en ligne », pas « le statut de la ressource est passé à actif ».</p>
          </section>

          {/* ══ 17 ══ */}
          <section id="avant-ouverture">
            <p className="sec-kicker">Mise en service</p>
            <h2>Avant l&apos;ouverture au public</h2>
            <p>À vérifier une fois, dans l&apos;ordre, avant d&apos;annoncer le site.</p>
            <ol className="steps">
              <li><b>Les paiements.</b> Vérifiez que la clé Stripe est valide et que les trois tarifs annuels — Smart, Pro, VIP — sont créés et reliés. Sans cela, un professionnel qui clique sur « souscrire » se heurte à une erreur.</li>
              <li><b>L&apos;e-mail de contact.</b> Renseignez-le dans les réglages : il s&apos;affiche sur les pages légales.</li>
              <li><b>Les catégories.</b> Parcourez l&apos;arborescence et vérifiez les traductions dans les sept langues.</li>
              <li><b>Le carrousel d&apos;accueil.</b> Chargez vos visuels définitifs et contrôlez le rendu sur téléphone.</li>
              <li><b>La modération.</b> Ouvrez avec la publication automatique <b>désactivée</b>. Vous l&apos;activerez une fois le rythme pris.</li>
              <li><b>Un test complet.</b> Depuis un compte ordinaire : inscription, dépôt d&apos;annonce, message, favori. C&apos;est le seul moyen de voir ce que voit un vrai utilisateur.</li>
            </ol>
          </section>

          {/* ══ 18 ══ */}
          <section id="depannage">
            <p className="sec-kicker">Support</p>
            <h2>Dépannage</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Symptôme</th><th>Cause probable</th><th>Que faire</th></tr></thead>
                <tbody>
                  <tr>
                    <td>« Mon annonce n&apos;apparaît pas »</td>
                    <td>En attente de validation, ou bloquée par le pare-feu</td>
                    <td>Cherchez-la dans <code>/admin/annonces</code>, puis dans <code>/admin/parefeu</code></td>
                  </tr>
                  <tr>
                    <td>Le compteur ne descend pas</td>
                    <td>Des signalements sont traités mais non clos</td>
                    <td>Cliquez sur <b>Clore les signalements</b></td>
                  </tr>
                  <tr>
                    <td>Le site affiche une page d&apos;indisponibilité</td>
                    <td>Le mode maintenance est actif</td>
                    <td>Désactivez-le dans les réglages</td>
                  </tr>
                  <tr>
                    <td>La nouvelle image d&apos;accueil ne s&apos;affiche pas</td>
                    <td>Image en cache dans votre navigateur</td>
                    <td>Rechargez en forçant le cache, ou testez en navigation privée</td>
                  </tr>
                  <tr>
                    <td>Un professionnel dit avoir payé sans rien voir</td>
                    <td>Le paiement a échoué, ou la formule n&apos;a pas basculé</td>
                    <td>Vérifiez dans <code>/admin/paiements</code>, puis dans Stripe</td>
                  </tr>
                  <tr>
                    <td>La bannière d&apos;annonce ne revient pas</td>
                    <td>Vous l&apos;aviez fermée, le message n&apos;a pas changé</td>
                    <td>Modifiez le texte du message</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="note admin">
              <span className="note-label">Le réflexe qui règle le plus de cas</span>
              <p>Ouvrez une <b>fenêtre de navigation privée</b>. Connecté en administrateur, vous ne voyez pas le site comme vos visiteurs : ni le mode maintenance, ni les annonces masquées, ni la bannière que vous aviez fermée.</p>
            </div>
          </section>

        </main>
      </div>

      <div className="tricolour" role="presentation"><i></i><i></i><i></i></div>
      <footer>
        <div>Manuel d&apos;administration 1000Click — document interne. Les tarifs mentionnés sont hors taxes.</div>
      </footer>
    </div>
  )
}
