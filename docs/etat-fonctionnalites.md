# État des fonctionnalités — Vendo

> Document de clarification technique — état actuel de la plateforme et points à développer.  
> Mis à jour : juin 2026

---

## 1. Annonces et catégories

### Catégorie "Animaux"

**✅ Supprimée.** La catégorie a été retirée de la liste. Les annonces existantes avec ce slug ne remontent plus dans les filtres.

**Catégories actives :**
Maison & Mobilier · Électroménager · Enfants & Famille · Véhicules · Mode & Vêtements · Services · Dons · Livres & Loisirs · Déco & Jardin · Autres

---

### Publication des annonces : automatique ou manuelle ?

**⚡ Actuellement : publication automatique.**

Dès qu'un utilisateur valide le formulaire, l'annonce reçoit le statut `ACTIVE` et est immédiatement visible sur le site. Il n'y a pas de file de validation manuelle.

**Statuts existants dans la base :**

| Statut | Description |
|---|---|
| `ACTIVE` | Visible publiquement |
| `SOLD` | Marquée comme vendue (masquée des résultats) |
| `EXPIRED` | Expirée automatiquement |

**À prévoir si modération souhaitée :** ajouter les statuts `PENDING` (en attente de validation) et `REJECTED` (refusée), et un écran admin de validation.

---

### Système de blocage / modération

**❌ Pas encore implémenté.**

Il n'existe pas de système de signalement, blocage ou modération des annonces. Points à développer selon le besoin :

- Bouton "Signaler" sur les fiches annonces
- Statut `BLOCKED` en base + interface admin pour traiter les signalements
- Notification à l'auteur en cas de retrait

---

## 2. Professionnels

### "Sponsorisé" vs "Recommandé"

**Actuellement, un seul label est utilisé : "Sponsorisé"** — affiché sur les cartes professionnels dans les encarts publicitaires du site (colonnes latérales, bannières).

Il n'existe pas encore de label "Recommandé" distinct. La distinction peut être introduite comme suit :

| Label | Signification suggérée |
|---|---|
| **Sponsorisé** | Pro qui apparaît dans les encarts publicitaires (PREMIUM / PREMIUM_PLUS) |
| **Recommandé** | Pro vérifié et mis en avant manuellement par l'équipe Vendo (badge éditorial) |

Cette distinction est à confirmer selon la politique commerciale.

---

### Géo Pub — mise en avant géolocalisée par quartier

**❌ Non implémentée — fonctionnalité future.**

La base technique existe (les annonces ont des champs `lat`, `lng`, `neighborhood`), mais le ciblage publicitaire par quartier ou secteur n'est pas encore développé.

**Ce qu'il faudrait construire :**
- Associer un ou plusieurs quartiers/zones à chaque professionnel
- Dans `/api/ads`, filtrer d'abord les pros dont la zone correspond au quartier de l'annonce consultée
- Interface admin pour définir la zone de chalandise du pro (rayon en km ou liste de quartiers)

Tarif à définir selon la granularité géographique proposée.

---

## 3. Dépôt d'annonces

### Nombre de photos

**⚠️ Actuellement : jusqu'à 5 photos, toutes gratuites.**

Le formulaire accepte jusqu'à 5 photos (JPG, PNG, WebP, max 5 Mo chacune). Il n'y a pas de limite payante en place.

**Ce qui est prévu :**
- 3 photos gratuites incluses
- Photos supplémentaires (jusqu'à 6 total) en option payante
- Tarif à définir (ex : 1 €/photo supplémentaire ou pack 3 photos à 2 €)

À implémenter : bloquer l'ajout au-delà de 3 photos et afficher un CTA d'upgrade.

---

### Localisation : uniquement Valencia ?

**⚠️ Actuellement : limité aux quartiers de Valencia.**

La liste de quartiers disponibles est fixe :

```
Valencia · Ruzafa · Benimaclet · Campanar · Paterna · Alboraya
El Carmen · Eixample · La Malva-rosa
```

La géolocalisation libre (ville saisie librement via Nominatim) est disponible dans la **barre de recherche** mais pas dans le formulaire de dépôt.

**Pour ouvrir à d'autres villes :** remplacer le select fixe par un champ texte avec autocomplétion Nominatim (même composant que `GeoModal` dans la recherche).

---

## 4. Tarification

### État actuel

**Aucune tarification n'est en place.** Tout est gratuit : dépôt d'annonces, photos, compte utilisateur.

### Ce qui est à construire

| Fonctionnalité | Modèle suggéré |
|---|---|
| 3 photos gratuites | Inclus de base |
| +3 photos supplémentaires | À définir (ex : 1,99 € / lot) |
| Annonce boostée (remontée en tête) | À définir (ex : 2,99 €/semaine) |
| Professionnel PREMIUM | 50 €/an (estimé) |
| Professionnel PREMIUM_PLUS | 100 €/an (estimé) |

L'intégration Stripe est à prévoir pour gérer les paiements one-shot et abonnements.

---

## 5. Inscription et gestion des comptes

### Processus d'inscription

**✅ Fonctionnel** — formulaire `/inscription` avec email + mot de passe (hashé bcrypt), création du compte en base.

### Mail de confirmation d'inscription

**❌ Non implémenté.** Aucun système d'email (SMTP, SendGrid, Resend) n'est configuré. L'utilisateur est connecté directement après inscription sans vérification d'email.

### Mot de passe oublié

**❌ Non implémenté.** Pas de flux de réinitialisation de mot de passe.

### Points à développer (priorité haute)

- [ ] Intégration d'un service email (recommandé : **Resend** — API simple, bon plan gratuit)
- [ ] Email de confirmation à l'inscription avec lien de vérification
- [ ] Page `/mot-de-passe-oublie` + email avec lien de reset
- [ ] Gestion du profil utilisateur dans `/mon-compte` (modifier nom, email, mot de passe)

---

## 6. Administration — Back-office

### Accès

**✅ Back-office disponible** à `/admin/professionnels` (lien bouclier dans la navbar une fois connecté en ADMIN).

### Fonctionnalités disponibles aujourd'hui

| Fonctionnalité | Statut |
|---|---|
| Créer un professionnel | ✅ |
| Modifier un professionnel | ✅ |
| Supprimer un professionnel | ✅ |
| Définir le tier (FREE / PREMIUM / PREMIUM_PLUS) | ✅ |
| Marquer vérifié / featured | ✅ |

### Fonctionnalités à construire

| Fonctionnalité | Priorité | Notes |
|---|---|---|
| **Validation manuelle des annonces** | Haute | Nécessite statut `PENDING` + liste de modération |
| **Gestion des utilisateurs** | Moyenne | Liste, suspension, changement de rôle |
| **Traitement des signalements** | Moyenne | Si bouton "Signaler" ajouté |
| **Statistiques** | Basse | Nb annonces, inscriptions, vues par catégorie |
| **Gestion des paiements** | Haute (si monétisation) | Historique abonnements pros |

---

## Récapitulatif des priorités de développement

### Court terme (avant lancement)
1. Email de confirmation d'inscription (Resend)
2. Mot de passe oublié
3. Limitation à 3 photos gratuites + upgrade payant

### Moyen terme (post-lancement)
4. Modération des annonces (statut PENDING + interface admin)
5. Gestion des utilisateurs en back-office
6. Bouton "Signaler une annonce"
7. Statistiques admin basiques

### Long terme
8. Géo Pub (ciblage par quartier)
9. Extension géographique au-delà de Valencia
10. Intégration Stripe (paiements pros + boosts)

---

*Document maintenu par Guillaume Bidallier — NovaTeck Studio*  
*Dernière mise à jour : juin 2026*
