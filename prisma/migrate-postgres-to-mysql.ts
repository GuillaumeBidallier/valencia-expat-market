import { neon } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client'

const pg = neon(process.env.OLD_POSTGRES_DATABASE_URL!)
const mysql = new PrismaClient() // reads DATABASE_URL — must be the MySQL URL when this runs

async function main() {
  console.log('Migrating Users...')
  const users = await pg`SELECT * FROM "User"`
  for (const u of users) {
    await mysql.user.upsert({
      where: { id: u.id as string },
      update: {},
      create: {
        id: u.id as string, name: u.name as string, email: u.email as string,
        passwordHash: u.passwordHash as string, role: u.role as 'USER' | 'PREMIUM' | 'ADMIN',
        blocked: u.blocked as boolean, createdAt: u.createdAt as Date,
        showPhone: u.showPhone as boolean, showWhatsapp: u.showWhatsapp as boolean,
      },
    })
  }
  console.log(`  ${users.length} users`)

  console.log('Migrating Categories (2 passes to handle N-level hierarchy — create all with no parent, then wire up parentId once every row exists)...')
  const categories = await pg`SELECT * FROM "Category"`
  for (const c of categories) {
    await mysql.category.upsert({
      where: { id: c.id as string },
      update: {},
      create: {
        id: c.id as string, slug: c.slug as string, label: c.label as string, icon: c.icon as string,
        order: c.order as number, parentId: null, // wired up in the second pass below
        createdAt: c.createdAt as Date, updatedAt: c.updatedAt as Date,
      },
    })
  }
  for (const c of categories) {
    if (c.parentId) {
      await mysql.category.update({ where: { id: c.id as string }, data: { parentId: c.parentId as string } })
    }
  }
  console.log(`  ${categories.length} categories`)

  console.log('Migrating CategoryTranslations...')
  const catTranslations = await pg`SELECT * FROM "CategoryTranslation"`
  for (const t of catTranslations) {
    await mysql.categoryTranslation.upsert({
      where: { id: t.id as string },
      update: {},
      create: {
        id: t.id as string, categoryId: t.categoryId as string, locale: t.locale as string,
        label: t.label as string, createdAt: t.createdAt as Date, updatedAt: t.updatedAt as Date,
      },
    })
  }
  console.log(`  ${catTranslations.length} category translations`)

  console.log('Migrating Listings...')
  const listings = await pg`SELECT * FROM "Listing"`
  for (const l of listings) {
    await mysql.listing.upsert({
      where: { id: l.id as string },
      update: {},
      create: {
        id: l.id as string, title: l.title as string, description: l.description as string,
        price: l.price as number | null, categorySlug: l.categorySlug as string,
        city: l.city as string, neighborhood: l.neighborhood as string,
        status: l.status as 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED' | 'DELETED',
        userId: l.userId as string, phone: l.phone as string | null, views: l.views as number,
        isPremium: l.isPremium as boolean, boostExpiresAt: l.boostExpiresAt as Date | null,
        featuredAt: l.featuredAt as Date | null, publishedAt: l.publishedAt as Date,
        updatedAt: l.updatedAt as Date, lat: l.lat as number | null, lng: l.lng as number | null,
        blockedReason: l.blockedReason as string | null,
      },
    })
  }
  console.log(`  ${listings.length} listings`)

  console.log('Migrating ListingImages...')
  const images = await pg`SELECT * FROM "ListingImage"`
  for (const img of images) {
    await mysql.listingImage.upsert({
      where: { id: img.id as string },
      update: {},
      create: { id: img.id as string, listingId: img.listingId as string, url: img.url as string, order: img.order as number },
    })
  }
  console.log(`  ${images.length} listing images`)

  console.log('Migrating Favorites...')
  const favorites = await pg`SELECT * FROM "Favorite"`
  for (const f of favorites) {
    await mysql.favorite.upsert({
      where: { id: f.id as string },
      update: {},
      create: { id: f.id as string, userId: f.userId as string, listingId: f.listingId as string, createdAt: f.createdAt as Date },
    })
  }
  console.log(`  ${favorites.length} favorites`)

  console.log('Migrating Messages...')
  const messages = await pg`SELECT * FROM "Message"`
  for (const m of messages) {
    await mysql.message.upsert({
      where: { id: m.id as string },
      update: {},
      create: {
        id: m.id as string, listingId: m.listingId as string, senderId: m.senderId as string,
        receiverId: m.receiverId as string, body: m.body as string,
        readAt: m.readAt as Date | null, createdAt: m.createdAt as Date,
      },
    })
  }
  console.log(`  ${messages.length} messages`)

  console.log('Migrating Reports...')
  const reports = await pg`SELECT * FROM "Report"`
  for (const r of reports) {
    await mysql.report.upsert({
      where: { id: r.id as string },
      update: {},
      create: { id: r.id as string, listingId: r.listingId as string, userId: r.userId as string | null, reason: r.reason as string, createdAt: r.createdAt as Date },
    })
  }
  console.log(`  ${reports.length} reports`)

  console.log('Migrating Professionals (+ photos/zones)...')
  const pros = await pg`SELECT * FROM "Professional"`
  for (const p of pros) {
    await mysql.professional.upsert({
      where: { id: p.id as string },
      update: {},
      create: {
        id: p.id as string, slug: p.slug as string, name: p.name as string, category: p.category as string,
        city: p.city as string, description: p.description as string | null, phone: p.phone as string | null,
        whatsapp: p.whatsapp as string | null, website: p.website as string | null, logo: p.logo as string | null,
        banner: p.banner as string | null,
        tier: p.tier as 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS',
        verified: p.verified as boolean, featured: p.featured as boolean, recommended: p.recommended as boolean,
        phoneHidden: p.phoneHidden as boolean, userId: p.userId as string | null,
        stripeCustomerId: p.stripeCustomerId as string | null, stripeSubscriptionId: p.stripeSubscriptionId as string | null,
        subscriptionStatus: p.subscriptionStatus as string | null, subscriptionPeriod: p.subscriptionPeriod as string | null,
        subscriptionCurrentPeriodEnd: p.subscriptionCurrentPeriodEnd as Date | null,
        createdAt: p.createdAt as Date, updatedAt: p.updatedAt as Date,
        photos: { create: ((p.photos as string[]) ?? []).map((url, order) => ({ url, order })) },
        zones: { create: ((p.zones as string[]) ?? []).map(zone => ({ zone })) },
      },
    })
  }
  console.log(`  ${pros.length} professionals`)

  console.log('Migrating ProClicks...')
  const clicks = await pg`SELECT * FROM "ProClick"`
  for (const c of clicks) {
    await mysql.proClick.upsert({
      where: { id: c.id as string },
      update: {},
      create: { id: c.id as string, professionalId: c.professionalId as string, type: c.type as string, createdAt: c.createdAt as Date },
    })
  }
  console.log(`  ${clicks.length} pro clicks`)

  console.log('Migrating BusinessCards...')
  const cards = await pg`SELECT * FROM "BusinessCard"`
  for (const bc of cards) {
    await mysql.businessCard.upsert({
      where: { id: bc.id as string },
      update: {},
      create: {
        id: bc.id as string, professionalId: bc.professionalId as string,
        headline: bc.headline as string | null, tagline: bc.tagline as string | null,
        primaryColor: bc.primaryColor as string, showEmail: bc.showEmail as boolean,
        showPhone: bc.showPhone as boolean, showWhatsapp: bc.showWhatsapp as boolean,
        showWebsite: bc.showWebsite as boolean, email: bc.email as string | null,
        plan: bc.plan as string | null, active: bc.active as boolean,
        stripeSessionId: bc.stripeSessionId as string | null, stripeSubscriptionId: bc.stripeSubscriptionId as string | null,
        stripeCustomerId: bc.stripeCustomerId as string | null, subscriptionStatus: bc.subscriptionStatus as string | null,
        subscriptionCurrentPeriodEnd: bc.subscriptionCurrentPeriodEnd as Date | null,
        createdAt: bc.createdAt as Date, updatedAt: bc.updatedAt as Date,
      },
    })
  }
  console.log(`  ${cards.length} business cards`)

  console.log('Migrating PasswordResetTokens...')
  const tokens = await pg`SELECT * FROM "PasswordResetToken"`
  for (const t of tokens) {
    await mysql.passwordResetToken.upsert({
      where: { id: t.id as string },
      update: {},
      create: { id: t.id as string, userId: t.userId as string, token: t.token as string, expiresAt: t.expiresAt as Date, usedAt: t.usedAt as Date | null, createdAt: t.createdAt as Date },
    })
  }
  console.log(`  ${tokens.length} password reset tokens`)

  console.log('Migrating PhotoUpgrades...')
  const upgrades = await pg`SELECT * FROM "PhotoUpgrade"`
  for (const pu of upgrades) {
    await mysql.photoUpgrade.upsert({
      where: { id: pu.id as string },
      update: {},
      create: { id: pu.id as string, userId: pu.userId as string, stripeSessionId: pu.stripeSessionId as string, paid: pu.paid as boolean, used: pu.used as boolean, createdAt: pu.createdAt as Date },
    })
  }
  console.log(`  ${upgrades.length} photo upgrades`)

  console.log('Migrating BlogPosts...')
  const posts = await pg`SELECT * FROM "BlogPost"`
  for (const bp of posts) {
    await mysql.blogPost.upsert({
      where: { id: bp.id as string },
      update: {},
      create: {
        id: bp.id as string, slug: bp.slug as string, lang: bp.lang as string, title: bp.title as string,
        excerpt: bp.excerpt as string, content: bp.content as string, coverImage: bp.coverImage as string | null,
        category: bp.category as string, author: bp.author as string, published: bp.published as boolean,
        publishedAt: bp.publishedAt as Date | null, readTime: bp.readTime as number,
        createdAt: bp.createdAt as Date, updatedAt: bp.updatedAt as Date,
      },
    })
  }
  console.log(`  ${posts.length} blog posts`)

  console.log('Migrating SiteSettings...')
  const settings = await pg`SELECT * FROM "SiteSettings"`
  for (const s of settings) {
    await mysql.siteSettings.upsert({
      where: { id: s.id as string },
      update: {},
      create: {
        id: s.id as string, autoPublish: s.autoPublish as boolean,
        heroImages: s.heroImages as object, announcementText: s.announcementText as string | null,
        announcementEnabled: s.announcementEnabled as boolean, contactEmail: s.contactEmail as string | null,
        maintenanceMode: s.maintenanceMode as boolean,
      },
    })
  }
  console.log(`  ${settings.length} site settings rows`)

  // RateLimitHit is intentionally NOT migrated — it's a rolling, short-lived
  // rate-limit log with no downstream relations; starting empty on MySQL is correct.

  console.log('\nVerifying row counts...')
  const expectedPhotoCount = pros.reduce((sum, p) => sum + (((p.photos as string[]) ?? []).length), 0)
  const expectedZoneCount = pros.reduce((sum, p) => sum + (((p.zones as string[]) ?? []).length), 0)
  const checks: [string, number, () => Promise<number>][] = [
    ['User', users.length, () => mysql.user.count()],
    ['Category', categories.length, () => mysql.category.count()],
    ['CategoryTranslation', catTranslations.length, () => mysql.categoryTranslation.count()],
    ['Listing', listings.length, () => mysql.listing.count()],
    ['ListingImage', images.length, () => mysql.listingImage.count()],
    ['Favorite', favorites.length, () => mysql.favorite.count()],
    ['Message', messages.length, () => mysql.message.count()],
    ['Report', reports.length, () => mysql.report.count()],
    ['Professional', pros.length, () => mysql.professional.count()],
    ['ProfessionalPhoto', expectedPhotoCount, () => mysql.professionalPhoto.count()],
    ['ProfessionalZone', expectedZoneCount, () => mysql.professionalZone.count()],
    ['ProClick', clicks.length, () => mysql.proClick.count()],
    ['BusinessCard', cards.length, () => mysql.businessCard.count()],
    ['PasswordResetToken', tokens.length, () => mysql.passwordResetToken.count()],
    ['PhotoUpgrade', upgrades.length, () => mysql.photoUpgrade.count()],
    ['BlogPost', posts.length, () => mysql.blogPost.count()],
    ['SiteSettings', settings.length, () => mysql.siteSettings.count()],
  ]
  let allOk = true
  for (const [table, expected, countFn] of checks) {
    const actual = await countFn()
    const ok = actual === expected
    if (!ok) allOk = false
    console.log(`  ${table}: source=${expected} mysql=${actual} ${ok ? '✅' : '❌'}`)
  }
  if (!allOk) throw new Error('Row count mismatch — see ❌ above. Do not proceed to cutover.')
  console.log('\n✅ Migration complete, all row counts match.')
}

main().catch(err => { console.error(err); process.exit(1) }).finally(() => mysql.$disconnect())
