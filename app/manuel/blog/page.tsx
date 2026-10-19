import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { plexMono, MANUEL_CSS } from '../manuel-shared'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Le blog, expliqué',
  robots: { index: false, follow: false },
}

export default async function ManuelBlogPage() {
  const session = await auth()
  if (!session?.user) redirect('/connexion?redirect=/manuel/blog')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  return (
    <div className={`manuel ${plexMono.variable}`}>
      <style>{MANUEL_CSS}</style>
      <header className="masthead">
        <div className="masthead-inner">
          <Link href="/admin/blog" className="backlink">&#8592; Retour au blog de l&apos;administration</Link>
          <p className="eyebrow">Guide · Espace d&apos;administration</p>
          <h1>Le blog de 1000Click, expliqué simplement</h1>
          <p className="lede" style={{ color: 'var(--masthead-body)' }}>À quoi sert le blog, pourquoi il compte 26 articles, ce qu&apos;il apporte au site, et comment écrire vos propres articles, étape par étape.</p>
          <div className="masthead-meta">
            <span><b>Écran</b> · /admin/blog</span>
            <span><b>Côté public</b> · www.1000click.be/blog</span>
            <span><b>Lecture</b> · 10 minutes</span>
          </div>
        </div>
      </header>
      <div className="tricolour" role="presentation"><i></i><i></i><i></i></div>

      <div className="shell">
        <nav className="toc" aria-label="Sommaire">
          <h2>Sommaire</h2>
          <ol>
            <li><a href="#principe"><span>01</span>Le principe en une phrase</a></li>
            <li><a href="#parcours"><span>02</span>Le parcours d&apos;un visiteur</a></li>
            <li><a href="#vingt-six"><span>03</span>Pourquoi 26 articles</a></li>
            <li><a href="#apports"><span>04</span>Ce que le blog apporte</a></li>
            <li><a href="#patience"><span>05</span>Ce qu&apos;il ne fait pas</a></li>
            <li><a className="toc-admin" href="#ecrire"><span>06</span>Écrire un article</a></li>
            <li><a className="toc-admin" href="#mise-en-forme"><span>07</span>La mise en forme</a></li>
            <li><a href="#bons-articles"><span>08</span>Un article qui fonctionne</a></li>
            <li><a href="#idees"><span>09</span>Idées de sujets</a></li>
            <li><a href="#questions"><span>10</span>Questions fréquentes</a></li>
          </ol>
        </nav>

        <main>
          <section id="principe">
            <p className="sec-kicker">01 · Le principe</p>
            <h2>Le principe en une phrase</h2>
            <p className="lede">Le blog sert à amener sur 1000Click des personnes qui ne cherchaient pas un site d&apos;annonces, en répondant aux questions qu&apos;elles posent à Google.</p>
            <p>Presque personne ne tape « site de petites annonces » dans Google. En revanche, chaque jour, beaucoup de gens y posent des questions concrètes : « comment louer un appartement à Bruxelles », « faut-il une mutuelle en Belgique », « comment immatriculer sa voiture en Belgique ».</p>
            <p>Chaque article du blog répond à l&apos;une de ces questions. Quand Google juge la réponse utile, il l&apos;affiche dans ses résultats. La personne clique, lit l&apos;article… et découvre le site au passage.</p>
            <div className="note">
              <span className="note-label">Une image pour s&apos;en souvenir</span>
              <p>Le site d&apos;annonces, c&apos;est le magasin. Chaque article de blog, c&apos;est une vitrine dans une rue différente. Plus il y a de vitrines bien placées, plus de passants entrent dans le magasin, sans avoir cherché un magasin.</p>
            </div>
          </section>

          <section id="parcours">
            <p className="sec-kicker">02 · Exemple concret</p>
            <h2>Le parcours d&apos;un visiteur, étape par étape</h2>
            <ol className="steps">
              <li><b>Sophie vient de s&apos;installer à Bruxelles.</b> Elle tape dans Google : « louer un appartement Bruxelles garantie locative ».</li>
              <li><b>Google lui propose l&apos;article</b> « Louer un appartement à Bruxelles : bail, garantie et état des lieux », publié sur 1000Click.</li>
              <li><b>Elle lit l&apos;article.</b> Il répond à sa question ; il mentionne au passage les annonces de location et d&apos;ameublement du site.</li>
              <li><b>Elle clique vers les annonces</b> pour voir les appartements, ou les meubles d&apos;occasion pour équiper son logement.</li>
              <li><b>Elle crée un compte</b> pour contacter un vendeur, mettre une annonce en favori, ou vendre ses propres affaires.</li>
            </ol>
            <p>Sophie n&apos;a jamais cherché « 1000Click ». C&apos;est l&apos;article qui l&apos;a amenée. C&apos;est exactement le rôle du blog.</p>
          </section>

          <section id="vingt-six">
            <p className="sec-kicker">03 · Les chiffres</p>
            <h2>Pourquoi le blog compte 26 articles</h2>
            <p>Le site existe en plusieurs langues, et chaque visiteur ne voit que les articles de <b>sa</b> langue. Les 26 articles sont donc répartis ainsi :</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Langue</th><th>Articles</th><th>Qui les voit</th></tr></thead>
                <tbody>
                  <tr><td>Français</td><td className="num">5</td><td>Les visiteurs qui naviguent en français</td></tr>
                  <tr><td>Anglais</td><td className="num">6</td><td>Les visiteurs qui naviguent en anglais</td></tr>
                  <tr><td>Néerlandais</td><td className="num">5</td><td>Les visiteurs qui naviguent en néerlandais</td></tr>
                  <tr><td>Allemand</td><td className="num">5</td><td>Les visiteurs qui naviguent en allemand</td></tr>
                  <tr><td>Espagnol</td><td className="num">5</td><td>Les visiteurs qui naviguent en espagnol</td></tr>
                </tbody>
              </table>
            </div>
            <p>Un visiteur francophone voit donc <b>5 articles</b>, pas 26. Les autres existent pour toucher, sur Google, les personnes qui font leurs recherches dans une autre langue.</p>
            <p>Les 5 articles en français :</p>
            <ul>
              <li>S&apos;installer en Belgique : les démarches essentielles</li>
              <li>Louer un appartement à Bruxelles : bail, garantie et état des lieux</li>
              <li>Mutualité et soins de santé en Belgique : comment ça marche</li>
              <li>Voiture en Belgique : immatriculation, assurance et contrôle technique</li>
              <li>Scolariser ses enfants en Belgique : le guide pour les familles</li>
            </ul>
            <div className="note admin">
              <span className="note-label">Dans l&apos;administration</span>
              <p>L&apos;écran <code>/admin/blog</code> affiche les 26 articles ensemble, toutes langues confondues. C&apos;est normal : chaque ligne indique sa langue (FR, EN, NL, DE, ES).</p>
            </div>
          </section>

          <section id="apports">
            <p className="sec-kicker">04 · Les bénéfices</p>
            <h2>Ce que le blog apporte au site</h2>
            <ul>
              <li><b>Des visiteurs gratuits et durables.</b> Un article bien placé sur Google continue d&apos;amener du monde pendant des mois, voire des années, sans publicité payante.</li>
              <li><b>De la crédibilité.</b> Un site qui donne des conseils utiles inspire confiance : les visiteurs osent davantage y déposer une annonce ou y contacter un professionnel.</li>
              <li><b>Du contenu pour vos réseaux sociaux.</b> Chaque article est une publication toute prête pour Facebook ou Instagram, avec un lien qui ramène vers le site.</li>
              <li><b>Un meilleur classement de tout le site.</b> Google valorise les sites qui publient régulièrement du contenu utile : les pages d&apos;annonces en profitent aussi.</li>
            </ul>
          </section>

          <section id="patience">
            <p className="sec-kicker">05 · À savoir</p>
            <h2>Ce que le blog ne fait pas</h2>
            <div className="note warn">
              <span className="note-label">Un travail de fond, pas un effet immédiat</span>
              <p>Google met en général <b>plusieurs semaines à plusieurs mois</b> pour découvrir un article, le juger et le faire monter dans ses résultats. Un article publié aujourd&apos;hui n&apos;amène pas de visiteurs demain : c&apos;est un investissement qui grandit avec le temps et avec la régularité des publications.</p>
            </div>
            <p>Le blog ne remplace pas non plus la communication directe (réseaux sociaux, bouche-à-oreille, partenaires) : il la complète, en travaillant pour vous en arrière-plan.</p>
          </section>

          <section id="ecrire">
            <p className="sec-kicker admin">06 · Pas à pas</p>
            <h2>Écrire et publier un article</h2>
            <ol className="steps">
              <li>Ouvrez <code>/admin/blog</code> (menu de gauche, rubrique <b>Blog</b>), puis cliquez sur <b>Nouvel article</b>.</li>
              <li><b>Titre</b> : la question à laquelle l&apos;article répond, formulée comme quelqu&apos;un la taperait dans Google. Le <b>Slug</b> (la fin de l&apos;adresse de l&apos;article) se remplit tout seul à partir du titre.</li>
              <li><b>Résumé</b> : deux phrases qui donnent envie de lire. Il s&apos;affiche dans la liste des articles et souvent dans Google.</li>
              <li><b>Contenu</b> : le texte de l&apos;article (voir la mise en forme ci-dessous).</li>
              <li><b>Image de couverture</b> : l&apos;adresse d&apos;une image en ligne, qui apparaît en haut de l&apos;article et dans la liste.</li>
              <li><b>Catégorie</b> : <code>guide</code>, <code>conseils</code>, <code>vie-pratique</code> ou <code>actualites</code>. <b>Langue</b> : FR pour un article en français. <b>Temps de lecture</b> : en minutes, à titre indicatif.</li>
              <li>Cliquez sur <b>Aperçu</b> pour voir le rendu, puis sur <b>Enregistrer</b> : l&apos;article est gardé en <b>brouillon</b>, invisible du public.</li>
              <li>Quand il est prêt, cliquez sur <b>Publier</b> : il apparaît immédiatement sur <code>/blog</code>. Le bouton <b>Dépublier</b> le retire à tout moment, sans le supprimer.</li>
            </ol>
          </section>

          <section id="mise-en-forme">
            <p className="sec-kicker admin">07 · Mise en forme</p>
            <h2>La mise en forme du texte</h2>
            <p>Le contenu s&apos;écrit en texte simple, avec quelques signes pour la mise en forme (on appelle ce format « Markdown »). Les plus utiles :</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Vous tapez</th><th>Vous obtenez</th></tr></thead>
                <tbody>
                  <tr><td><code>## Le dépôt de garantie</code></td><td>Un intertitre</td></tr>
                  <tr><td><code>**deux mois de loyer**</code></td><td>Du texte en <b>gras</b></td></tr>
                  <tr><td><code>- premier point</code></td><td>Une liste à puces</td></tr>
                  <tr><td><code>1. première étape</code></td><td>Une liste numérotée</td></tr>
                  <tr><td><code>[voir les annonces](/annonces)</code></td><td>Un lien cliquable</td></tr>
                </tbody>
              </table>
            </div>
            <p>Laissez une ligne vide entre deux paragraphes. En cas de doute, le bouton <b>Aperçu</b> montre exactement le résultat avant publication.</p>
          </section>

          <section id="bons-articles">
            <p className="sec-kicker">08 · Les bonnes pratiques</p>
            <h2>Ce qui fait un article qui fonctionne</h2>
            <ul>
              <li><b>Une question, une réponse.</b> Chaque article traite un seul sujet précis, plutôt que plusieurs à la fois.</li>
              <li><b>Un titre qui ressemble à une recherche.</b> « Comment trouver une crèche à Bruxelles » plutôt que « Nos conseils famille ».</li>
              <li><b>Une vraie réponse, complète.</b> Visez au moins 600 mots, avec des intertitres : Google privilégie les contenus qui répondent vraiment.</li>
              <li><b>Ancré en Belgique.</b> Noms de communes, démarches belges, prix en euros : c&apos;est ce qui distingue votre article des contenus génériques.</li>
              <li><b>Un lien vers le site.</b> Terminez par un lien vers la catégorie d&apos;annonces liée au sujet, par exemple <code>/annonces?cat=immobilier</code>.</li>
              <li><b>La régularité.</b> Un article par mois, tenu dans la durée, vaut mieux que dix articles d&apos;un coup puis plus rien.</li>
            </ul>
          </section>

          <section id="idees">
            <p className="sec-kicker">09 · Inspiration</p>
            <h2>Idées de sujets pour vos prochains articles</h2>
            <ul>
              <li>Vendre ses meubles avant un déménagement : les bons réflexes</li>
              <li>Acheter une voiture d&apos;occasion en Belgique sans mauvaise surprise</li>
              <li>Les arnaques aux petites annonces les plus courantes, et comment les éviter</li>
              <li>Bien photographier un objet pour le vendre plus vite</li>
              <li>Trouver un artisan de confiance dans sa commune</li>
              <li>Équiper un logement étudiant à petit budget</li>
            </ul>
            <p>Une bonne source d&apos;idées : les questions que vous posent vos utilisateurs et vos proches. Si une personne se la pose, beaucoup d&apos;autres la tapent dans Google.</p>
          </section>

          <section id="questions">
            <p className="sec-kicker">10 · Questions fréquentes</p>
            <h2>Questions fréquentes</h2>
            <h3>Dois-je écrire chaque article dans toutes les langues ?</h3>
            <p>Non. Un article en français suffit pour toucher le public francophone. Les traductions sont un plus, à envisager pour les articles qui fonctionnent le mieux.</p>
            <h3>Puis-je modifier ou supprimer les articles existants ?</h3>
            <p>Oui, depuis <code>/admin/blog</code>. Pour retirer un article sans le perdre, préférez <b>Dépublier</b>.</p>
            <h3>Comment savoir si le blog fonctionne ?</h3>
            <p>Dans Google Analytics, regardez les pages <code>/blog/…</code> les plus visitées et d&apos;où viennent leurs visiteurs (« Recherche organique » = Google). Comptez quelques mois avant de tirer des conclusions.</p>
            <h3>Où les visiteurs trouvent-ils le blog sur le site ?</h3>
            <p>Par le lien <b>Blog</b> en bas de toutes les pages, à l&apos;adresse <code>/blog</code>. Mais la plupart des lecteurs arriveront directement sur un article, depuis Google ou depuis vos réseaux sociaux.</p>
          </section>
        </main>
      </div>

      <div className="tricolour" role="presentation"><i></i><i></i><i></i></div>
      <footer>
        <div>Guide du blog 1000Click — document interne, réservé à l&apos;administration. <Link href="/manuel">Ouvrir le manuel complet</Link>.</div>
      </footer>
    </div>
  )
}
