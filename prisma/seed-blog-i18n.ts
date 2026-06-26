import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const raw = process.env.DATABASE_URL!
const url = new URL(raw)
url.searchParams.delete('pgbouncer')
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url.toString() }),
})

const POSTS = [
  // ─── ENGLISH ────────────────────────────────────────────────────────────────
  {
    slug: 'moving-to-spain-complete-guide',
    title: 'Moving to Spain: The Complete Expat Guide for 2026',
    excerpt: 'Everything you need to know before moving to Spain — from getting your NIE to finding a flat, opening a bank account and registering with the town hall.',
    content: `# Moving to Spain: The Complete Expat Guide for 2026

Spain is one of the most popular destinations for expats worldwide, and for good reason: great weather, affordable cost of living, vibrant culture and excellent healthcare. But moving here involves a series of administrative steps that can feel overwhelming at first.

This guide walks you through everything you need to do in the right order.

## Before You Leave

- **Research the area** — Valencia, Madrid, Barcelona, Alicante and the Costa Blanca each have their own expat communities and cost of living
- **Secure accommodation** — even a short-term rental gives you an address for your first paperwork
- **Check your health coverage** — EU citizens can use the European Health Insurance Card (EHIC) temporarily

## Step 1 — NIE (Número de Identidad de Extranjero)

This is your tax identification number and the first thing you need. Without it you can't open a bank account, sign a lease or buy a car.

**Required documents:**
- Completed form EX-15
- Original passport + photocopy
- Proof of reason (job contract, property purchase promise, etc.)
- Paid tasa modelo 790 código 012 (~€10)

Book your appointment at the nearest Comisaría de Policía that handles foreigner affairs. Slots fill up fast — check early in the morning.

## Step 2 — Empadronamiento (Town Hall Registration)

Once you have a fixed address, register at your local Ayuntamiento. This is mandatory after 3 months and unlocks access to public services, schools and healthcare.

**Bring:** passport, NIE, and lease or property deed.

## Step 3 — Bank Account

With your NIE and empadronamiento you can open a Spanish bank account. Recommended options for expats:
- **CaixaBank** — widespread ATM network
- **BBVA** — English-speaking staff in tourist areas
- **Revolut / Wise** — great for managing multiple currencies while you settle in

## Step 4 — Spanish Social Security

If you work in Spain (employed or self-employed), you must register with the Seguridad Social. Your employer handles it if you're salaried; if you're self-employed (autónomo) you register yourself at the TGSS.

## Step 5 — Health Card (Tarjeta Sanitaria)

Once registered with Social Security, you're entitled to a public health card. Go to your local health centre (Centro de Salud) with your NIE, empadronamiento and social security number.

## Step 6 — EU Citizen Certificate

If you're an EU citizen staying more than 3 months, you need the **Certificado de Registro de Ciudadano de la UE** from the police. This replaces the old residence card.

---

**1000Click tip:** The expat community on 1000Click is full of people who have been through all of this. Don't hesitate to reach out — someone near you will have the answer.
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 8,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-01-20'),
  },
  {
    slug: 'renting-flat-spain-tips',
    title: 'Renting a Flat in Spain: What Every Expat Must Know',
    excerpt: 'Security deposits, rental contracts, tenant rights and the best neighbourhoods — everything you need to rent safely in Spain.',
    content: `# Renting a Flat in Spain: What Every Expat Must Know

The Spanish rental market can surprise expats used to other systems. Prices have risen sharply in cities like Valencia and Barcelona, and competition is fierce. Here's how to navigate it successfully.

## Preparing Your Rental Dossier

Landlords typically ask for:
- NIE
- Last 3 payslips or employment contract
- Bank statement
- Passport copy

Self-employed? Provide your last two tax declarations (declaración de la renta).

## Understanding the Fianza

Spanish law requires a **fianza** (security deposit) of one month's rent for residential properties. Landlords may legally ask for up to two additional months as extra guarantee. The fianza must be deposited by the landlord with the regional housing authority (in Valencia: IVAJ).

**At the end of the tenancy**, you're entitled to your full fianza back within 30 days if no damage has occurred.

## Rental Contract Essentials

The **Ley de Arrendamientos Urbanos (LAU)** protects tenants. Key points:
- Minimum rental period: **5 years** (7 years if the landlord is a company)
- Rent increases capped by the IPC (Consumer Price Index)
- 30 days' written notice required from tenant to leave early after year 1

Always get your contract in writing and **never pay cash** — use bank transfer for a paper trail.

## Utility Bills

Clarify what's included before signing:
- **Comunidad** (building maintenance fees) — usually paid by landlord
- **IBI** (property tax) — usually paid by landlord
- **Water, electricity, gas** — usually paid by tenant

## Best Areas in Valencia for Expats

| Neighbourhood | Vibe | Avg 2-bed rent |
|---------------|------|----------------|
| Ruzafa | Trendy, young | €950-1,200 |
| Benimaclet | Relaxed, university | €800-1,000 |
| El Cabanyal | Beach-adjacent, up-and-coming | €900-1,100 |
| Patraix | Quiet, residential | €700-900 |
| Malvarrosa | Beachfront | €950-1,300 |

## Red Flags to Avoid

- Landlord asks for cash only
- No formal contract offered
- Rent significantly below market rate
- Landlord refuses to show proof of property ownership

---

Found a flat but need furniture? Browse 1000Click — hundreds of expats sell quality second-hand items daily.
`,
    category: 'vie-pratique',
    author: '1000Click Team',
    readTime: 6,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-02-14'),
  },
  {
    slug: 'healthcare-spain-expats',
    title: 'Healthcare in Spain: Public, Private and How to Access It',
    excerpt: 'How does the Spanish healthcare system work? How do you get your health card? Is private insurance worth it? Everything expats need to know.',
    content: `# Healthcare in Spain: Public, Private and How to Access It

Spain has one of the best healthcare systems in the world, ranking consistently in the top 10 globally. As an expat, understanding how to access it will save you time and stress.

## The Public Healthcare System (Sistema Nacional de Salud)

Spain's public healthcare (SNS) is free at the point of use for registered residents. Coverage includes:
- GP visits and specialist referrals
- Emergency care
- Hospital stays
- Maternity care
- Prescription medicines (subsidised)

**To access it**, you need:
1. Be registered with Social Security (Seguridad Social) as a worker, or
2. Be registered at your town hall (empadronamiento) if you're a non-working EU citizen, or
3. Apply for the "convenio especial" if you don't qualify otherwise (monthly contribution ~€60-157)

### Getting Your Health Card

Go to your local **Centro de Salud** (health centre) with:
- NIE
- Empadronamiento
- Social Security number (or proof of eligibility)

You'll be assigned a GP (médico de cabecera) and given your **tarjeta sanitaria**.

## Private Health Insurance

Many expats opt for private insurance alongside (or instead of) the public system:

**Why go private?**
- No waiting lists for specialists
- English-speaking doctors in major cities
- Dental coverage (not included in public)
- Faster appointments

**Popular insurers for expats:**
- Sanitas
- AXA Salud
- Asisa
- DKV

Costs range from €50-150/month depending on age and coverage.

## Pharmacies (Farmacias)

Pharmacies are identified by a green cross and are open long hours. Pharmacists in Spain are highly qualified and can advise on many conditions without a GP visit. Many medicines available only on prescription in other countries are sold over the counter here.

## Emergency Services

Dial **112** for all emergencies. Hospitals with emergency departments are called **Urgencias**. In Spain, you can walk directly into Urgencias — no prior appointment needed.

---

The 1000Click community has expats from all walks of life in Spain. Ask questions, share experiences and help each other navigate life here.
`,
    category: 'vie-pratique',
    author: 'Emma R.',
    readTime: 7,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-03-10'),
  },
  {
    slug: 'selling-buying-second-hand-spain',
    title: 'Buying & Selling Second-Hand in Spain: The Expat Guide',
    excerpt: 'Moving in or moving out? Spain has a thriving second-hand market. Here\'s how to buy and sell safely as an expat, and why 1000Click is the best platform for French-speaking communities.',
    content: `# Buying & Selling Second-Hand in Spain: The Expat Guide

Whether you're arriving and need to furnish a flat on a budget, or leaving and want to sell everything before your flight home, Spain's second-hand market is your best friend.

## Why Buy Second-Hand?

- **Cost savings:** Furniture, appliances and electronics at 30-70% off retail
- **Environmental impact:** Less waste, more sustainability
- **Community:** Meet other expats and locals, share tips
- **Speed:** Available immediately, no delivery delays

## Where to Buy and Sell

### 1000Click — The Expat Marketplace
1000Click is the dedicated platform for the French-speaking expat community in Spain. Unlike generic platforms, everyone here understands the expat experience. You'll find:
- Quality items from people relocating back to France, Belgium or Switzerland
- Fair prices without the lowball culture of other platforms
- A safe, verified community

### Other Platforms
- **Wallapop** — Spain's most popular second-hand app (Spanish-language)
- **Milanuncios** — older but widely used, especially for furniture
- **Facebook Marketplace** — useful for local groups

## Tips for Selling Successfully

1. **Good photos are everything** — natural light, clean background, multiple angles
2. **Price fairly** — check similar listings before pricing
3. **Be responsive** — buyers move fast, especially for popular items
4. **Meet in public** — for safety, meet in a café or busy area for the handover
5. **Keep packaging** — electronics with original boxes sell 20-30% faster

## Tips for Buying Safely

- **Inspect before paying** — always test electronics before handing over money
- **Don't pay in advance** — scams exist; never pay bank transfer before seeing the item
- **Check for IKEA resale** — IKEA Spain has an "as-is" section with great deals
- **Timing matters** — late August and September (end of rental season) have the most listings from people leaving

## The Expat Cycle

One of the beautiful things about expat communities is the "passing it on" culture. An expat who arrived 3 years ago and furnished their flat with second-hand goods will sell everything to the next arrival. 1000Click facilitates exactly this cycle.

---

Post your first listing on 1000Click today — it's completely free and your item could be in someone's home by tomorrow.
`,
    category: 'conseils',
    author: '1000Click Team',
    readTime: 5,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-04-05'),
  },
  {
    slug: 'learning-spanish-fast-tips',
    title: 'Learning Spanish Fast: Practical Tips for Expats in Spain',
    excerpt: 'You don\'t need to be fluent before you arrive, but learning Spanish will transform your life in Spain. Here are the most effective strategies for busy expats.',
    content: `# Learning Spanish Fast: Practical Tips for Expats in Spain

One of the most common regrets expats have after a few years in Spain? Not learning Spanish sooner. The good news: you're already in the best possible classroom — you're surrounded by it every day.

## Why Spanish (Not Just English) Matters

In tourist areas and big cities, you can get by with English. But learning Spanish will:
- Help you in administrative offices (many staff don't speak English)
- Build genuine friendships with Spanish locals
- Make you feel at home rather than just a visitor
- Open up job opportunities

## Most Effective Learning Methods

### 1. Daily Immersion
You're in Spain — use it. Change your phone to Spanish, listen to Spanish radio in the car, watch Spanish TV with Spanish subtitles (not English).

### 2. Language Exchange (Intercambio)
Meet Spanish people who want to practise English. You speak Spanish for 30 minutes, then switch to English for 30 minutes. Free, fun and fast. Apps: **Tandem**, **HelloTalk**, or ask at your local café.

### 3. Apps (for structure)
- **Duolingo** — good for beginners, keeps habits
- **Babbel** — more structured, grammar-focused
- **Anki** — flashcards for vocabulary, very effective

### 4. Classes
- Language schools (academias de idiomas) are affordable in Spain
- Many municipalities offer cheap or free Spanish classes for residents
- Online options: iTalki for one-on-one lessons with native teachers

### 5. The "One New Word a Day" Rule
Sounds simple, but 365 new words a year adds up. Put a sticky note on your fridge. Learn the word, use it in a sentence, forget about it until tomorrow.

## Spanish for Daily Life

Some phrases that will immediately make your life easier:

| Situation | Phrase |
|-----------|--------|
| At the doctor | "Tengo una cita a las X" (I have an appointment at X) |
| At the supermarket | "¿Dónde están los…?" (Where are the…?) |
| With your landlord | "Hay una avería en…" (There's a breakdown in…) |
| At the bank | "Quiero abrir una cuenta" (I want to open an account) |

## Don't Fear Mistakes

Spanish people, especially outside tourist areas, genuinely appreciate when foreigners try to speak Spanish — even badly. A smile and a broken sentence will get you further than perfect grammar delivered with a dictionary look-up every 10 seconds.

---

1000Click's community speaks French, English, Spanish and more. Share your language tips and ask for help — we're all learning together.
`,
    category: 'conseils',
    author: '1000Click Team',
    readTime: 6,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-05-01'),
  },
  {
    slug: 'cost-of-living-spain-2026',
    title: 'Cost of Living in Spain 2026: What Expats Actually Spend',
    excerpt: 'How much does it really cost to live in Spain? We break down the real monthly expenses for expats in Valencia, Madrid and Barcelona.',
    content: `# Cost of Living in Spain 2026: What Expats Actually Spend

Spain is still significantly cheaper than France, Germany, the UK or the Netherlands — but prices have risen noticeably since 2020. Here's a realistic breakdown.

## Monthly Budget by City (Single Person)

| Expense | Valencia | Madrid | Barcelona |
|---------|----------|--------|-----------|
| Rent (1-bed, city centre) | €750-1,000 | €1,100-1,400 | €1,200-1,600 |
| Groceries | €200-300 | €250-350 | €250-350 |
| Utilities (electricity, water, gas) | €80-130 | €90-140 | €90-140 |
| Mobile phone | €15-30 | €15-30 | €15-30 |
| Public transport | €20-40 | €50-80 | €50-80 |
| Eating out (2-3x/week) | €150-250 | €180-300 | €200-350 |
| **Total** | **€1,215-1,750** | **€1,685-2,300** | **€1,805-2,550** |

## Where Spain Saves You Money

### Food
A **menú del día** (lunch menu) — starter, main, dessert, bread and drink — costs €10-14 even in city centres. Coffee is €1.20-1.80. Supermarket prices for fresh produce are very competitive.

### Healthcare
Public healthcare is essentially free once registered. Private insurance is available from €50-80/month — far cheaper than comparable cover in the UK or Germany.

### Childcare
Public schools are free. Nurseries (guarderías) range from €200-400/month, much less than in France or the Netherlands.

## What Costs More Than Expected

- **Electricity** — Spain has some of the most volatile electricity prices in Europe
- **Private Spanish classes** — €30-60/hour for good tutors
- **Imported goods** — French cheese, Dutch beer, British products at premium prices
- **Car ownership** — insurance, ITV (MOT), fuel

## Salary Benchmarks

Spanish salaries are lower than Northern Europe, but the cost of living is too. Average salaries:
- Office worker: €1,500-2,200/month net
- Teacher: €1,400-1,900/month net
- IT professional: €2,000-4,000/month net
- Doctor: €2,500-5,000/month net

Remote workers earning Northern European salaries while living in Spain have one of the highest quality-of-life ratios in Europe.

---

Reduce your moving costs by buying second-hand on 1000Click — from sofas to smartphones, the expat community has everything you need.
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 5,
    lang: 'en',
    published: true,
    publishedAt: new Date('2026-05-28'),
  },

  // ─── ESPAÑOL ────────────────────────────────────────────────────────────────
  {
    slug: 'guia-expatriados-espana-nie-empadronamiento',
    title: 'Guía para expatriados en España: NIE, empadronamiento y trámites esenciales',
    excerpt: 'Todo lo que necesitas saber para instalarte en España: NIE, empadronamiento, cuenta bancaria y seguridad social. Guía paso a paso para 2026.',
    content: `# Guía para expatriados en España: trámites esenciales

Mudarse a España puede parecer complicado al principio, pero con la información correcta y el orden adecuado de los trámites, todo fluye. Esta guía te explica los pasos clave.

## Paso 1 — El NIE (Número de Identidad de Extranjero)

El NIE es tu número de identificación fiscal en España. Es imprescindible para casi todo: abrir una cuenta bancaria, firmar un contrato de alquiler, comprar un coche o empezar a trabajar.

**Documentos necesarios:**
- Formulario EX-15 cumplimentado
- Pasaporte original + fotocopia
- Justificante del motivo (contrato de trabajo, promesa de compraventa, etc.)
- Tasa modelo 790 código 012 abonada (~10 €)

Pide cita previa en la comisaría de policía más cercana a través de la web del Ministerio del Interior. Las citas se agotan rápido — conéctate temprano por la mañana.

## Paso 2 — El empadronamiento

El empadronamiento es el registro en el padrón municipal de tu ayuntamiento. Es obligatorio si llevas más de 3 meses en España y es la llave para acceder a la sanidad pública, la escolarización de tus hijos y otras ayudas municipales.

**Necesitas:** pasaporte, NIE y contrato de alquiler o escritura de propiedad.

## Paso 3 — Cuenta bancaria

Con el NIE y el empadronamiento, abre una cuenta en un banco español. Algunos bancos recomendados para expatriados:
- **CaixaBank** — amplia red de cajeros y aplicación completa
- **BBVA** — atención al cliente multilingüe
- **Sabadell** — buena experiencia para autónomos

También puedes empezar con **Revolut** o **Wise** mientras terminas los trámites.

## Paso 4 — Seguridad Social

Si trabajas en España, debes registrarte en la Seguridad Social:
- **Trabajador por cuenta ajena**: lo gestiona tu empleador
- **Autónomo**: debes darte de alta tú mismo en el RETA (Régimen Especial de Trabajadores Autónomos)

## Paso 5 — Tarjeta sanitaria

Una vez dado de alta en la Seguridad Social, tienes derecho a la tarjeta sanitaria. Acude a tu centro de salud con el NIE, el empadronamiento y el número de afiliación a la Seguridad Social.

## Certificado de registro (ciudadanos UE)

Si eres ciudadano de la UE y llevas más de 3 meses en España, debes solicitar el **Certificado de Registro de Ciudadano de la Unión Europea** en la comisaría de policía. Este documento sustituye al antiguo permiso de residencia.

---

La comunidad 1000Click está llena de expatriados que han pasado por todo esto. ¡No dudes en preguntar!
`,
    category: 'guide',
    author: 'Equipo 1000Click',
    readTime: 7,
    lang: 'es',
    published: true,
    publishedAt: new Date('2026-01-25'),
  },
  {
    slug: 'alquilar-piso-valencia-consejos',
    title: 'Cómo alquilar un piso en Valencia: consejos para expatriados',
    excerpt: 'Fianza, contrato de arrendamiento, barrios y precios actualizados. Todo lo que necesitas saber para alquilar con seguridad en Valencia en 2026.',
    content: `# Cómo alquilar un piso en Valencia

El mercado de alquiler valenciano es dinámico pero competitivo. Estas son las claves para encontrar y alquilar un piso sin sorpresas.

## Prepara tu dossier

Antes de empezar a visitar pisos, ten preparados estos documentos:
- NIE
- Las 3 últimas nóminas o contrato de trabajo
- Extracto bancario
- Pasaporte

## La fianza

La ley española exige **1 mes de fianza** para viviendas. El propietario puede solicitar garantías adicionales (hasta 2 meses más). La fianza debe depositarse en el IVAJ (Institut Valencià de la Joventut).

Al finalizar el contrato, tienes derecho a recuperar la fianza íntegra en un plazo de 30 días si no hay daños.

## El contrato de arrendamiento

La Ley de Arrendamientos Urbanos (LAU) protege a los inquilinos:
- Duración mínima: **5 años** (7 si el propietario es empresa)
- La renta solo puede actualizarse según el IPC
- Para irse antes de tiempo: 30 días de preaviso tras el primer año

Nunca firmes sin contrato escrito y siempre paga mediante transferencia bancaria.

## Gastos incluidos o no

Aclara antes de firmar:
- **Comunidad de propietarios**: normalmente paga el propietario
- **IBI**: normalmente paga el propietario
- **Agua, luz, gas**: normalmente paga el inquilino

## Los mejores barrios de Valencia para expatriados

| Barrio | Ambiente | Precio medio 2 habitaciones |
|--------|----------|-----------------------------|
| Ruzafa | Cosmopolita, animado | 950-1.200 € |
| Benimaclet | Tranquilo, universitario | 800-1.000 € |
| El Cabanyal | Cerca del mar, en auge | 900-1.100 € |
| Patraix | Residencial, económico | 700-900 € |
| El Carmen | Histórico, bohemio | 900-1.200 € |

## Señales de alarma

- El propietario solo acepta efectivo
- No ofrece contrato escrito
- El precio es muy inferior al mercado
- Se niega a mostrar documentación de propiedad

---

¿Buscas muebles para tu nuevo piso? En 1000Click encontrarás cientos de artículos de segunda mano a precios razonables, ofrecidos por otros expatriados.
`,
    category: 'vie-pratique',
    author: 'Equipo 1000Click',
    readTime: 6,
    lang: 'es',
    published: true,
    publishedAt: new Date('2026-02-18'),
  },
  {
    slug: 'sanidad-espana-expatriados',
    title: 'Sanidad en España: cómo acceder al sistema público y privado',
    excerpt: 'Todo lo que necesitas saber sobre la sanidad española: cómo obtener la tarjeta sanitaria, qué cubre el sistema público y si merece la pena contratar un seguro privado.',
    content: `# Sanidad en España para expatriados

España cuenta con uno de los mejores sistemas sanitarios del mundo. Como expatriado, acceder a él es más sencillo de lo que crees.

## El Sistema Nacional de Salud (SNS)

La sanidad pública española es gratuita en el momento de la consulta para los residentes registrados. Cubre:
- Consultas con el médico de cabecera y especialistas (por derivación)
- Urgencias hospitalarias
- Hospitalización
- Maternidad
- Medicamentos (con copago según ingresos)

### Cómo obtener la tarjeta sanitaria

Acude a tu **Centro de Salud** más cercano con:
- NIE
- Empadronamiento
- Número de afiliación a la Seguridad Social

Se te asignará un médico de cabecera y recibirás tu tarjeta sanitaria individual.

## Seguro médico privado

Muchos expatriados optan por complementar la sanidad pública con un seguro privado:

**Ventajas:**
- Sin listas de espera para especialistas
- Médicos que hablan inglés o francés en las grandes ciudades
- Cobertura dental (no incluida en la pública)
- Citas más rápidas

**Aseguradoras más populares:**
- Sanitas
- Adeslas / Cigna
- AXA Salud
- DKV

Los precios oscilan entre 50 y 150 €/mes según edad y cobertura.

## Farmacias

Las farmacias se identifican con una cruz verde. En España, los farmacéuticos tienen alta formación y pueden orientarte en muchos casos sin necesidad de ir al médico. Muchos medicamentos de venta con receta en otros países se venden aquí sin ella.

## Emergencias

Marca el **112** para cualquier emergencia. Los hospitales con urgencias atienden sin cita previa. En zonas turísticas suele haber personal que habla inglés.

---

¿Tienes dudas sobre la sanidad española? La comunidad 1000Click puede ayudarte con experiencias de primera mano.
`,
    category: 'vie-pratique',
    author: 'Carmen L.',
    readTime: 6,
    lang: 'es',
    published: true,
    publishedAt: new Date('2026-03-15'),
  },
  {
    slug: 'coste-vida-valencia-2026',
    title: 'Coste de vida en Valencia en 2026: lo que gastan realmente los expatriados',
    excerpt: 'Alquiler, alimentación, transporte, ocio... ¿Cuánto cuesta vivir en Valencia? Desglose real y actualizado para expatriados en 2026.',
    content: `# Coste de vida en Valencia en 2026

Valencia es una de las ciudades más atractivas de Europa para los expatriados: tercer municipio de España, sol casi todo el año, gastronomía excepcional y precios aún más asequibles que Madrid o Barcelona.

## Presupuesto mensual aproximado (persona sola)

| Gasto | Precio estimado |
|-------|----------------|
| Alquiler (1 hab, zona céntrica) | 750-1.000 € |
| Alimentación (supermercado) | 200-280 € |
| Suministros (luz, agua, gas) | 80-130 € |
| Teléfono móvil | 15-25 € |
| Transporte público | 20-40 € |
| Comer fuera (2-3 veces/semana) | 150-250 € |
| Ocio y cultura | 80-150 € |
| **Total** | **1.295-1.875 €** |

## Dónde se ahorra dinero en Valencia

### Menú del día
Por 10-13 € tendrás primer plato, segundo, postre, bebida y pan. Una de las grandes ventajas de vivir en España.

### Transporte
El bono de 10 viajes del metro y bus sale a unos 8 €. En bici o a pie, los desplazamientos por el centro son cómodos y gratuitos.

### Mercados municipales
El Mercado Central, el de Ruzafa o el de Colón ofrecen fruta, verdura, carne y pescado frescos a precios muy competitivos, mucho mejores que el supermercado.

## Dónde se gasta más de lo esperado

- **La electricidad**: las tarifas eléctricas en España son de las más volátiles de Europa
- **Productos importados**: cerveza belga, queso francés, productos nórdicos tienen un sobreprecio importante
- **Guardería privada**: entre 400 y 700 €/mes si no consigues plaza pública
- **Coche**: seguro, ITV, gasolina y aparcamiento en el centro se suman rápido

## Salarios de referencia

Los sueldos en Valencia son inferiores a los de Madrid o Barcelona, pero el coste de vida también:
- Administrativo: 1.300-1.800 € neto/mes
- Docente: 1.400-1.900 € neto/mes
- Informático: 1.800-3.500 € neto/mes
- Teletrabajo (empresa extranjera): ventaja enorme

---

Ahorra en tu mudanza comprando de segunda mano en 1000Click. ¡Encuentra todo lo que necesitas a precios justos!
`,
    category: 'guide',
    author: 'Equipo 1000Click',
    readTime: 5,
    lang: 'es',
    published: true,
    publishedAt: new Date('2026-04-22'),
  },
  {
    slug: 'escolarizar-hijos-espana',
    title: 'Escolarizar a tus hijos en España: pública, concertada o internacional',
    excerpt: 'Colegio público, concertado, francés o internacional. Qué opción elegir para tus hijos expatriados en España, cómo matricularlos y qué esperar del sistema educativo español.',
    content: `# Escolarizar a tus hijos en España

Una de las decisiones más importantes para las familias expatriadas: ¿en qué tipo de colegio escolarizar a mis hijos? Te explicamos todas las opciones.

## El sistema educativo español

La educación en España es gratuita y obligatoria de los 6 a los 16 años. La estructura es:
- **Educación Infantil** (0-6 años): no obligatoria
- **Educación Primaria** (6-12 años): obligatoria
- **ESO** (12-16 años): obligatoria
- **Bachillerato** (16-18 años): voluntaria
- **FP** (Formación Profesional): alternativa al bachillerato

## Colegio público

**Ventajas:**
- Completamente gratuito (libros de texto a veces incluidos)
- Inmersión lingüística total en español
- Integración rápida con niños locales

**Inconvenientes:**
- Difícil si el niño no habla español al llegar
- Calidad variable según el centro y la zona

**Cómo matricularse:**
Necesitas el empadronamiento del menor. Las matrículas suelen abrirse en marzo-abril para septiembre. Presentas la solicitud en el ayuntamiento o directamente en el centro.

## Colegio concertado (privado-subvencionado)

Los colegios concertados son privados pero reciben financiación pública. Son gratuitos o casi gratuitos, aunque pueden pedir aportaciones voluntarias. Muchos son religiosos (católicos).

## Colegios bilingües (español-inglés)

En la Comunitat Valenciana existe el **Programa BRIT** (British Council) en colegios públicos, muy solicitado. El aprendizaje se divide entre español, valenciano e inglés.

## Colegio francés / Liceo francés

Para mantener el sistema educativo francés:
- **Madrid**: Lycée Français de Madrid
- **Barcelona**: Lycée Français de Barcelone
- En Valencia no hay liceo homologado, pero algunas familias optan por la educación a distancia (CNED)

**Precio**: entre 2.000 y 8.000 €/año según el centro e ingresos.

## Colegio internacional

Ofrecen el Bachillerato Internacional (IB) u otros programas. Precios elevados (5.000-15.000 €/año) pero buena preparación para universidades internacionales.

## Consejos prácticos

- Matricula a tus hijos lo antes posible: las plazas en los mejores centros se agotan
- Si hay dificultades con el idioma, pide apoyo de integración (clases de refuerzo de español)
- La jornada continua (de 9 a 14h) es habitual en muchos colegios españoles: planifica el horario de tarde

---

¿Tienes hijos que van al colegio y buscas material escolar de segunda mano? ¡Busca en 1000Click!
`,
    category: 'conseils',
    author: 'Equipo 1000Click',
    readTime: 6,
    lang: 'es',
    published: true,
    publishedAt: new Date('2026-05-10'),
  },

  // ─── DEUTSCH ────────────────────────────────────────────────────────────────
  {
    slug: 'umzug-nach-spanien-guide-2026',
    title: 'Umzug nach Spanien: Der vollständige Leitfaden für Expats 2026',
    excerpt: 'NIE, Anmeldung beim Einwohnermeldeamt, Bankkonto, Krankenversicherung — alle wichtigen Behördengänge nach Spanien Schritt für Schritt erklärt.',
    content: `# Umzug nach Spanien: Der vollständige Leitfaden 2026

Spanien ist das beliebteste Auswanderungsziel für Deutsche in Europa — und das aus gutem Grund: Sonne, günstigere Lebenshaltungskosten als in Deutschland, exzellentes Essen und eine entspannte Lebensqualität. Doch der bürokratische Einstieg erfordert Vorbereitung.

## Schritt 1 — NIE (Número de Identidad de Extranjero)

Das NIE ist Ihre Steueridentifikationsnummer in Spanien. Ohne sie können Sie kein Bankkonto eröffnen, keinen Mietvertrag unterschreiben und kein Auto kaufen.

**Benötigte Unterlagen:**
- Ausgefülltes Formular EX-15
- Reisepass (Original + Kopie)
- Nachweis des Aufenthaltsgrundes (Arbeitsvertrag, Kaufvertrag, Studienbescheinigung…)
- Bezahlte Steuergebühr modelo 790 código 012 (ca. 10 €)

Termin vereinbaren über die Website des Ministerio del Interior. **Tipp:** Termine sind oft sehr schnell vergriffen — melden Sie sich frühmorgens an.

## Schritt 2 — Empadronamiento (Einwohnermeldeamt)

Das Empadronamiento ist die Anmeldung beim Stadtrat (Ayuntamiento) Ihrer Gemeinde. Es ist nach 3 Monaten Aufenthalt gesetzlich vorgeschrieben und öffnet den Zugang zu:
- Öffentlicher Gesundheitsversorgung
- Schulen
- Kommunalen Leistungen

**Mitbringen:** Reisepass, NIE, Mietvertrag oder Eigentumsnachweis.

## Schritt 3 — Bankkonto eröffnen

Mit NIE und Empadronamiento können Sie ein spanisches Konto eröffnen. Empfehlenswert für Expats:
- **CaixaBank** — deutschsprachige Hilfe oft verfügbar
- **BBVA** — gute App und mehrsprachiger Service
- **N26 / Revolut** — als Übergangslösung sehr praktisch

## Schritt 4 — Sozialversicherung (Seguridad Social)

Wenn Sie in Spanien arbeiten, müssen Sie sich bei der Seguridad Social anmelden:
- **Angestellt**: Ihr Arbeitgeber kümmert sich darum
- **Selbstständig**: Selbst beim RETA anmelden (monatliche Mindestbeiträge ab ~200 €)

## Schritt 5 — Krankenversichertenkarte (Tarjeta Sanitaria)

Nach der Anmeldung bei der Sozialversicherung steht Ihnen die kostenlose öffentliche Gesundheitsversorgung zu. Gehen Sie in Ihr zuständiges Gesundheitszentrum (Centro de Salud) mit NIE, Empadronamiento und Sozialversicherungsnummer.

## EU-Bürger: Anmeldebescheinigung

Als EU-Bürger, der länger als 3 Monate bleibt, müssen Sie das **Certificado de Registro de Ciudadano de la UE** bei der Polizei beantragen. Es ersetzt die frühere Aufenthaltskarte.

---

Die 1000Click-Community hat viele Deutsche Mitglieder, die schon durch all das gegangen sind. Fragen Sie einfach — Sie sind nicht allein!
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 7,
    lang: 'de',
    published: true,
    publishedAt: new Date('2026-01-28'),
  },
  {
    slug: 'wohnung-mieten-spanien-tipps',
    title: 'Wohnung mieten in Spanien: Was Expats wissen müssen',
    excerpt: 'Kaution, Mietvertrag, Nebenkosten und die besten Stadtteile — alles, was Sie für eine sichere Wohnungssuche in Spanien brauchen.',
    content: `# Wohnung mieten in Spanien: Tipps für Expats

Der spanische Mietmarkt unterscheidet sich in einigen wichtigen Punkten von Deutschland und Österreich. Hier erfahren Sie, worauf Sie achten müssen.

## Ihre Unterlagen

Vermieter verlangen in der Regel:
- NIE
- Die letzten 3 Gehaltsabrechnungen oder einen Arbeitsvertrag
- Kontoauszug
- Reisepasskopie

## Die Kaution (Fianza)

Das spanische Gesetz schreibt **eine Monatsmiete als Kaution** vor. Vermieter können legal bis zu zwei weitere Monatsmieten als zusätzliche Sicherheit verlangen. Die Kaution muss vom Vermieter bei der regionalen Behörde hinterlegt werden.

**Wichtig:** Nach Auszug haben Sie Anspruch auf vollständige Rückzahlung innerhalb von 30 Tagen, sofern keine Schäden vorliegen.

## Der Mietvertrag

Das spanische Mietrecht (LAU) schützt Mieter:
- Mindestmietdauer: **5 Jahre** (7 Jahre bei gewerblichen Vermietern)
- Mieterhöhungen nur gemäß Verbraucherpreisindex (IPC)
- Kündigung durch Mieter: 30 Tage Vorankündigung nach dem ersten Jahr

Zahlen Sie immer per Überweisung — nie bar — und bestehen Sie auf einem schriftlichen Vertrag.

## Nebenkosten

Klären Sie vor der Unterschrift:
- **Comunidad de propietarios** (Hausgeldzahlungen): meist Vermieter
- **IBI** (Grundsteuer): meist Vermieter
- **Wasser, Strom, Gas**: meist Mieter

## Durchschnittliche Mietpreise (2026)

| Stadt | 1 Zimmer | 2 Zimmer | 3 Zimmer |
|-------|----------|----------|----------|
| Valencia | 750-950 € | 900-1.200 € | 1.100-1.500 € |
| Madrid | 1.100-1.400 € | 1.400-1.800 € | 1.700-2.500 € |
| Barcelona | 1.100-1.500 € | 1.400-1.900 € | 1.800-2.700 € |
| Alicante | 550-750 € | 700-950 € | 850-1.200 € |

## Warnsignale

- Vermieter besteht auf Barzahlung
- Kein schriftlicher Vertrag
- Miete deutlich unter Marktpreis
- Vermieter zeigt keine Eigentumsunterlagen

---

Brauchen Sie Möbel für Ihre neue Wohnung? Auf 1000Click finden Sie hochwertige Gebrauchtartikel von anderen Expats zu fairen Preisen.
`,
    category: 'vie-pratique',
    author: '1000Click Team',
    readTime: 6,
    lang: 'de',
    published: true,
    publishedAt: new Date('2026-02-22'),
  },
  {
    slug: 'gesundheitsversorgung-spanien',
    title: 'Gesundheitsversorgung in Spanien: öffentlich, privat und alles dazwischen',
    excerpt: 'Wie funktioniert das spanische Gesundheitssystem? Wie bekomme ich die Krankenversichertenkarte? Lohnt sich eine private Krankenversicherung? Alle Antworten für Expats.',
    content: `# Gesundheitsversorgung in Spanien

Spanien belegt im globalen Gesundheitssystem-Ranking regelmäßig einen der vorderen Plätze. Als Expat haben Sie Zugang zu einer ausgezeichneten Versorgung — wenn Sie wissen, wie.

## Das öffentliche Gesundheitssystem (SNS)

Die öffentliche Gesundheitsversorgung ist für registrierte Einwohner kostenlos. Abgedeckt sind:
- Hausarztbesuche und Facharztüberweisungen
- Notaufnahme
- Krankenhausaufenthalte
- Mutterschaftsleistungen
- Medikamente (mit einkommensabhängigem Eigenanteil)

**Voraussetzungen:**
1. Angestellt oder selbstständig in Spanien und bei der Seguridad Social gemeldet, oder
2. EU-Bürger mit Empadronamiento (nicht erwerbstätig), oder
3. Sondervereinbarung (Convenio Especial) für alle anderen (~60-157 €/Monat)

### Die Krankenversichertenkarte beantragen

Gehen Sie in Ihr **Centro de Salud** mit:
- NIE
- Empadronamiento
- Sozialversicherungsnummer

Sie erhalten eine Hausärztinnenpraxis zugeteilt und Ihre persönliche Tarjeta Sanitaria.

## Private Krankenversicherung

Viele Expats entscheiden sich für eine zusätzliche Privatversicherung:

**Vorteile:**
- Keine Wartelisten bei Fachärzten
- Englisch- oder deutschsprachige Ärzte in Großstädten
- Zahnversorgung (im öffentlichen System nicht enthalten)
- Schnellere Termine

**Bekannte Anbieter:**
- Sanitas
- Adeslas
- AXA Salud
- Asisa

Kosten: 50 bis 150 €/Monat je nach Alter und Leistungsumfang.

## Apotheken (Farmacias)

An der grünen Leuchtkranzkreuz-Werbung erkennbar, sind Apotheken in Spanien sehr kompetent. Viele Medikamente, die in Deutschland rezeptpflichtig sind, gibt es hier ohne Rezept. Öffnungszeiten oft bis 22 Uhr, in größeren Städten gibt es 24h-Notapotheken.

## Notruf

Wählen Sie **112** für alle Notfälle. Krankenhäuser mit Notaufnahme (Urgencias) nehmen Patienten ohne Voranmeldung an.

---

Haben Sie Erfahrungen mit dem spanischen Gesundheitssystem? Teilen Sie Ihre Tipps in der 1000Click-Community!
`,
    category: 'vie-pratique',
    author: '1000Click Team',
    readTime: 6,
    lang: 'de',
    published: true,
    publishedAt: new Date('2026-03-20'),
  },
  {
    slug: 'lebenshaltungskosten-spanien-2026',
    title: 'Lebenshaltungskosten in Spanien 2026: Was Expats wirklich ausgeben',
    excerpt: 'Wie viel kostet das Leben in Valencia, Madrid oder Barcelona wirklich? Realistische Budgetaufschlüsselung für deutsche Expats in Spanien.',
    content: `# Lebenshaltungskosten in Spanien 2026

Spanien ist immer noch deutlich günstiger als Deutschland, Österreich oder die Schweiz — aber die Preise sind in den letzten Jahren gestiegen. Hier eine realistische Übersicht.

## Monatliches Budget für eine Person

| Ausgabe | Valencia | Madrid | Barcelona |
|---------|----------|--------|-----------|
| Miete (1 Zi., Stadtzentrum) | 750-1.000 € | 1.100-1.400 € | 1.200-1.600 € |
| Lebensmittel | 200-300 € | 250-350 € | 250-350 € |
| Strom, Wasser, Gas | 80-130 € | 90-140 € | 90-140 € |
| Handy | 15-30 € | 15-30 € | 15-30 € |
| Öffentliche Verkehrsmittel | 20-40 € | 50-80 € | 50-80 € |
| Auswärts essen (2-3×/Woche) | 150-250 € | 180-300 € | 200-350 € |
| **Gesamt** | **1.215-1.750 €** | **1.685-2.300 €** | **1.805-2.550 €** |

## Wo Spanien Geld spart

### Das Menú del día
Für 10-14 € gibt es Vorspeise, Hauptgang, Dessert, Getränk und Brot. Täglich verfügbar in fast allen Restaurants — ein echter Geldspar-Tipp.

### Gesundheit
Die öffentliche Gesundheitsversorgung ist nach Anmeldung kostenlos. Private Versicherungen ab ca. 50 €/Monat — weit günstiger als in Deutschland.

### Frischprodukte
Märkte und Supermärkte bieten hervorragende Qualität zu sehr niedrigen Preisen, vor allem bei Obst, Gemüse, Fisch und Fleisch.

## Wo die Kosten überraschen

- **Strom**: Spanien hat eines der volatilsten Strommärkte Europas
- **Deutsche Produkte**: Sauerkraut, Schwarzbrot, Radeberger — teuer oder schwer zu finden
- **Kita/Krippe**: Ohne öffentlichen Platz 400-700 €/Monat
- **Auto**: Versicherung, ITV, Sprit und Stadtparkplatz summieren sich schnell

## Gehaltsniveau

Die spanischen Gehälter liegen unter deutschem Niveau, aber auch die Lebenshaltungskosten:
- Bürokraft: 1.300-1.800 € netto/Monat
- Lehrer/in: 1.400-1.900 € netto/Monat
- IT-Fachkraft: 1.800-3.500 € netto/Monat
- Remote-Arbeit mit deutschem Gehalt: enormer Lebensqualitätsvorteil

---

Sparen Sie beim Einzug mit Gebrauchtwaren von 1000Click — von der Couch bis zum Laptop findet sich alles in der Expat-Community!
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 5,
    lang: 'de',
    published: true,
    publishedAt: new Date('2026-04-28'),
  },
  {
    slug: 'spanisch-lernen-tipps-expats',
    title: 'Spanisch lernen: Die effektivsten Methoden für Expats in Spanien',
    excerpt: 'Sie leben jetzt in Spanien — nutzen Sie das! Hier sind die bewährtesten Methoden, um Spanisch schnell und nachhaltig zu lernen, auch mit wenig Zeit.',
    content: `# Spanisch lernen: Tipps für Expats in Spanien

Sie sind bereits im besten Sprachkurs der Welt — in Spanien selbst. Aber wie nutzen Sie diesen Vorteil optimal? Hier sind die effektivsten Strategien.

## Warum Spanisch unverzichtbar ist

In Touristenzentren kommt man mit Englisch zurecht. Aber für ein wirklich erfülltes Leben in Spanien brauchen Sie Spanisch:
- Behördengänge (NIE, Empadronamiento, Arzt)
- Echte Freundschaften mit Spaniern aufbauen
- Verstehen, was auf Mietverträgen steht
- Verhandeln auf dem Gebrauchtmarkt

## Die 5 wirksamsten Lernmethoden

### 1. Totale Immersion im Alltag
Stellen Sie Ihr Handy auf Spanisch, hören Sie spanisches Radio, schauen Sie Serien auf Spanisch mit spanischen Untertiteln (nicht deutschen!).

### 2. Intercambio (Sprachtandem)
Finden Sie einen Spanier, der Deutsch lernen möchte. 30 Minuten Spanisch, dann 30 Minuten Deutsch. Apps: **Tandem**, **HelloTalk** oder einfach im Café fragen.

### 3. Apps für Struktur
- **Duolingo** — gut für Anfänger, bildet Gewohnheiten
- **Babbel** — strukturierter, mehr Grammatik
- **Anki** — Karteikarten für Vokabeln, sehr effektiv

### 4. Spanischkurse
Sprachschulen (Academias de idiomas) sind in Spanien günstig. Viele Gemeinden bieten kostenlose oder vergünstigte Spanischkurse für Einwohner an. Online: iTalki für Einzelstunden mit Muttersprachlern.

### 5. Ein Wort pro Tag
Klingt simpel, macht aber 365 neue Wörter pro Jahr. Post-it ans Kühlschrankpinnen, nutzen, vergessen, weitermachen.

## Spanisch für den Alltag

| Situation | Satz |
|-----------|------|
| Beim Arzt | "Tengo una cita a las X" (Ich habe einen Termin um X Uhr) |
| Im Supermarkt | "¿Dónde están los…?" (Wo ist/sind die…?) |
| Beim Vermieter | "Hay una avería" (Es gibt eine Panne/einen Defekt) |
| Bei der Bank | "Quiero abrir una cuenta" (Ich möchte ein Konto eröffnen) |

## Keine Angst vor Fehlern

Spanier freuen sich aufrichtig, wenn Ausländer versuchen, Spanisch zu sprechen — auch fehlerhaft. Ein Lächeln und ein gebrochener Satz öffnen mehr Türen als perfektes Schweigen.

---

Die 1000Click-Community ist mehrsprachig. Stellen Sie Ihre Fragen auf Deutsch — jemand wird antworten!
`,
    category: 'conseils',
    author: '1000Click Team',
    readTime: 6,
    lang: 'de',
    published: true,
    publishedAt: new Date('2026-05-15'),
  },

  // ─── NEDERLANDS ─────────────────────────────────────────────────────────────
  {
    slug: 'verhuizen-naar-spanje-complete-gids',
    title: 'Verhuizen naar Spanje: Complete Gids voor Expats 2026',
    excerpt: 'NIE, inschrijving bij de gemeente, bankrekening, zorgverzekering — alle belangrijke stappen om je in Spanje te vestigen, stap voor stap uitgelegd.',
    content: `# Verhuizen naar Spanje: Complete Gids 2026

Spanje trekt jaarlijks tienduizenden Nederlandse en Belgische expats aan. Zonnig klimaat, lagere kosten en een ontspannen levensstijl zijn de grote aantrekkingskrachten. Maar er zijn ook heel wat administratieve stappen. Deze gids helpt je op weg.

## Stap 1 — NIE (Número de Identidad de Extranjero)

Het NIE is jouw belastingidentificatienummer in Spanje. Zonder NIE kun je geen bankrekening openen, geen huurcontract tekenen en geen auto kopen.

**Benodigde documenten:**
- Ingevuld formulier EX-15
- Paspoort (origineel + kopie)
- Bewijs van reden voor verblijf (arbeidscontract, koopbelofte, inschrijvingsbewijs studie…)
- Betaalde belastingbon modelo 790 código 012 (~€10)

Maak een afspraak bij het dichtstbijzijnde politiebureau dat buitenlandse zaken behandelt. **Tip:** Plekken zijn snel volgeboekt — probeer vroeg in de ochtend in te loggen.

## Stap 2 — Empadronamiento (Gemeentelijke inschrijving)

Het empadronamiento is de inschrijving bij jouw lokale gemeentehuis (Ayuntamiento). Verplicht na 3 maanden verblijf. Zonder dit geen toegang tot zorg, scholen of gemeentelijke diensten.

**Meenemen:** paspoort, NIE, huurcontract of eigendomsakte.

## Stap 3 — Bankrekening

Met NIE en empadronamiento open je een Spaanse bankrekening:
- **CaixaBank** — groot netwerk, moderne app
- **BBVA** — Nederlandstalige service soms beschikbaar
- **Bunq / Revolut** — ideaal als tussenoplossing

## Stap 4 — Sociale Verzekering (Seguridad Social)

Als je in Spanje werkt, moet je je aanmelden bij de Seguridad Social:
- **In loondienst**: werkgever regelt dit
- **Zelfstandige (autónomo)**: zelf aanmelden bij het RETA

## Stap 5 — Zorgpas (Tarjeta Sanitaria)

Na aanmelding bij de Seguridad Social heb je recht op gratis publieke gezondheidszorg. Ga naar jouw Centro de Salud met NIE, empadronamiento en sociaalverzekeringsnummer.

## EU-burger certificaat

Als EU-burger die langer dan 3 maanden blijft, moet je het **Certificado de Registro de Ciudadano de la UE** aanvragen bij de politie. Dit vervangt de vroegere verblijfskaart.

---

In de 1000Click-community vind je tientallen Nederlanders en Belgen die je kunnen helpen met al deze stappen. Stel gerust je vraag!
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 7,
    lang: 'nl',
    published: true,
    publishedAt: new Date('2026-02-02'),
  },
  {
    slug: 'woning-huren-spanje-tips',
    title: 'Een woning huren in Spanje: Alles wat expats moeten weten',
    excerpt: 'Borg, huurcontract, kosten en de beste wijken. Alles om veilig en goed een woning te huren in Spanje als expat.',
    content: `# Een woning huren in Spanje

De Spaanse huurmarkt heeft zijn eigen regels en gebruiken. Als expat is het belangrijk die te begrijpen voor je een contract tekent.

## Jouw huurdossier samenstellen

Verhuurders vragen doorgaans:
- NIE
- Laatste 3 loonstroken of arbeidscontract
- Bankafschrift
- Kopie van paspoort

## De Borg (Fianza)

De Spaanse wet schrijft **één maand huur als borg** voor bij woningverhuur. Verhuurders mogen wettelijk nog maximaal twee extra maanden vragen als aanvullende garantie. De borg moet door de verhuurder worden gestort bij de regionale overheid.

**Bij vertrek** heb je recht op volledige terugbetaling binnen 30 dagen, mits er geen schade is.

## Het huurcontract

De Spaanse huurwetgeving (LAU) beschermt huurders goed:
- Minimale huurperiode: **5 jaar** (7 jaar als de verhuurder een bedrijf is)
- Huurverhogingen beperkt tot de consumentenprijsindex (IPC)
- Opzegging door huurder: 30 dagen vooropzeg na jaar 1

Betaal altijd via bankoverschrijving en sta erop een schriftelijk contract te hebben.

## Nutskosten: wat is inbegrepen?

Controleer voor ondertekening:
- **Comunidad** (VvE-bijdragen): meestal verhuurder
- **IBI** (onroerendgoedbelasting): meestal verhuurder
- **Water, elektriciteit, gas**: meestal huurder

## Gemiddelde huurprijzen (2026)

| Stad | Studio | 2 kamers | 3 kamers |
|------|--------|----------|----------|
| Valencia | €700-950 | €900-1.200 | €1.100-1.500 |
| Madrid | €1.100-1.400 | €1.400-1.800 | €1.700-2.500 |
| Alicante | €550-750 | €700-950 | €850-1.200 |
| Málaga | €750-1.000 | €950-1.300 | €1.200-1.700 |

## Rode vlaggen

- Verhuurder wil alleen contant betaald worden
- Geen schriftelijk contract aangeboden
- Huurprijs ver onder marktwaarde
- Verhuurder weigert eigendomsdocumenten te tonen

---

Op zoek naar meubels voor je nieuwe woning? Op 1000Click vind je kwalitatieve tweedehands spullen van andere expats voor eerlijke prijzen!
`,
    category: 'vie-pratique',
    author: '1000Click Team',
    readTime: 6,
    lang: 'nl',
    published: true,
    publishedAt: new Date('2026-02-25'),
  },
  {
    slug: 'zorg-spanje-expats',
    title: 'Gezondheidszorg in Spanje: publiek, privé en hoe je er toegang toe krijgt',
    excerpt: 'Hoe werkt het Spaanse zorgstelsel? Hoe krijg je je zorgpas? Is een privéverzekering de moeite waard? Alle antwoorden voor expats in Spanje.',
    content: `# Gezondheidszorg in Spanje

Spanje heeft een van de beste gezondheidszorgstelsels ter wereld. Als expat heb je toegang tot uitstekende zorg — als je weet hoe.

## Het openbare zorgstelsel (SNS)

De publieke gezondheidszorg is gratis voor ingeschreven inwoners. Gedekt:
- Huisartsconsulten en verwijzingen naar specialisten
- Spoedeisende hulp
- Ziekenhuisopname
- Zwangerschapszorg
- Geneesmiddelen (met inkomensafhankelijke bijdrage)

**Vereisten:**
1. Werknemer of zelfstandige in Spanje met Seguridad Social, of
2. EU-burger met empadronamiento (niet-werkend), of
3. Speciale regeling (Convenio Especial) voor anderen (~€60-157/maand)

### Zorgpas aanvragen

Ga naar jouw lokale **Centro de Salud** met:
- NIE
- Empadronamiento
- Sociaalverzekeringsnummer

Je krijgt een vaste huisarts toegewezen en ontvangt je Tarjeta Sanitaria.

## Privé ziektekostenverzekering

Veel expats kiezen voor een aanvullende privéverzekering:

**Voordelen:**
- Geen wachttijden bij specialisten
- Nederlandstalige of Engelstalige artsen in grote steden
- Tandheelkundige zorg (niet gedekt door de publieke zorg)
- Snellere afspraken

**Bekende verzekeraars:**
- Sanitas
- Adeslas / Cigna
- AXA Salud
- DKV

Kosten: €50 tot €150/maand afhankelijk van leeftijd en dekking.

## Apotheken (Farmacias)

Herkenbaar aan het groene kruis. Spaanse apothekers zijn goed opgeleid en kunnen veel kleine kwalen behandelen zonder doktersbezoek. Veel medicijnen die in Nederland op recept zijn, zijn hier zonder recept verkrijgbaar.

## Noodgevallen

Bel **112** voor alle noodgevallen. Ziekenhuizen met een spoedeisende hulp (Urgencias) zijn 24/7 open zonder afspraak.

---

Heb je vragen over de Spaanse gezondheidszorg? Stel ze in de 1000Click-community — iemand heeft vast al dezelfde situatie meegemaakt!
`,
    category: 'vie-pratique',
    author: '1000Click Team',
    readTime: 6,
    lang: 'nl',
    published: true,
    publishedAt: new Date('2026-03-25'),
  },
  {
    slug: 'kosten-levensonderhoud-spanje-2026',
    title: 'Kosten van levensonderhoud in Spanje 2026: wat expats echt uitgeven',
    excerpt: 'Huur, boodschappen, vervoer, uitgaan... Hoeveel kost het leven in Valencia, Madrid of Barcelona? Realistische budgetopstelling voor Nederlandse en Belgische expats.',
    content: `# Kosten van levensonderhoud in Spanje 2026

Spanje is nog steeds aanzienlijk goedkoper dan Nederland of België — maar de prijzen zijn de afgelopen jaren gestegen. Hier een eerlijke overzicht.

## Maandelijks budget (alleenstaande)

| Uitgave | Valencia | Madrid | Barcelona |
|---------|----------|--------|-----------|
| Huur (1 kamer, stadscentrum) | €750-1.000 | €1.100-1.400 | €1.200-1.600 |
| Boodschappen | €200-280 | €250-350 | €250-350 |
| Nutskosten (stroom, water, gas) | €80-130 | €90-140 | €90-140 |
| Mobiele telefoon | €15-25 | €15-25 | €15-25 |
| Openbaar vervoer | €20-40 | €50-80 | €50-80 |
| Uit eten (2-3×/week) | €150-250 | €180-300 | €200-350 |
| **Totaal** | **€1.215-1.725** | **€1.685-2.295** | **€1.805-2.545** |

## Waar Spanje geld bespaart

### Het menú del día
Voor €10-13 krijg je voor-, hoofd- en nagerecht, brood en een drankje. Dagelijks in bijna elk restaurant.

### Gezondheidszorg
Publieke zorg is na aanmelding gratis. Privéverzekering vanaf ~€50/maand — veel goedkoper dan in Nederland.

### Verse producten
Markten en supermarkten bieden verse groenten, fruit, vis en vlees van uitstekende kwaliteit tegen zeer lage prijzen.

## Waar de kosten meevallen

- **Elektriciteit**: Spanje heeft een van de meest volatiele stroomprijzen van Europa
- **Nederlandse producten**: stroopwafels, hagelslag en jenever zijn duur of moeilijk te vinden
- **Kinderopvang privé**: €400-700/maand als je geen publieke plek krijgt
- **Auto**: verzekering, ITV, benzine en parkeren in het centrum lopen snel op

## Salarissen ter vergelijking

Spaanse salarissen liggen lager dan in Nederland, maar de kosten ook:
- Kantoormedewerker: €1.300-1.800 netto/maand
- Leerkracht: €1.400-1.900 netto/maand
- IT-professional: €1.800-3.500 netto/maand
- Remote werken met Nederlands salaris: enorm kwaliteitsvoordeel

---

Bespaar op je verhuizing met tweedehands spullen van 1000Click — van bankstel tot smartphone, de expat-community heeft alles!
`,
    category: 'guide',
    author: '1000Click Team',
    readTime: 5,
    lang: 'nl',
    published: true,
    publishedAt: new Date('2026-04-30'),
  },
  {
    slug: 'tweedehands-kopen-verkopen-spanje',
    title: 'Tweedehands kopen en verkopen in Spanje: de gids voor expats',
    excerpt: 'Verhuizen naar of uit Spanje? De tweedehandsmarkt is je beste vriend. Hoe je veilig koopt en verkoopt als expat, en waarom 1000Click de beste keuze is voor onze gemeenschap.',
    content: `# Tweedehands kopen en verkopen in Spanje

Of je nu aankomt en goedkoop wil inrichten, of vertrekt en alles wil verkopen — de tweedehandsmarkt in Spanje is levendig en biedt fantastische deals.

## Waarom tweedehands?

- **Kostenbesparing**: meubels, apparaten en elektronica 30-70% goedkoper
- **Direct beschikbaar**: geen wachttijden zoals bij nieuwe leveringen
- **Duurzaamheid**: minder afval, beter voor het milieu
- **Community**: ontmoet andere expats, wissel ervaringen uit

## Waar kopen en verkopen?

### 1000Click — De expat-marktplaats
1000Click is dé marktplaats voor de Franstalige expat-gemeenschap in Spanje, maar steeds meer ook gebruikt door Nederlanders en Belgen. Voordelen:
- Kwaliteitsartikelen van mensen die terugkeren naar huis
- Eerlijke prijzen zonder overdreven afpingen
- Veilige, geverifieerde gemeenschap

### Andere platformen
- **Wallapop** — meest populaire tweedehands-app in Spanje (Spaanstalig)
- **Milanuncios** — ouder platform, veel meubels en elektronica
- **Facebook Marketplace** — handig voor lokale groepen

## Tips om succesvol te verkopen

1. **Goede foto's zijn alles** — daglicht, neutrale achtergrond, meerdere hoeken
2. **Prijs eerlijk** — vergelijk soortgelijke advertenties
3. **Reageer snel** — kopers zijn ongeduldig
4. **Ontmoet op een openbare plek** — voor grotere transacties, kies een café of drukke locatie
5. **Bewaar originele verpakking** — elektronica met doos verkoopt 20-30% sneller

## Tips om veilig te kopen

- **Test voor betaling** — controleer elektronica altijd voor je geld geeft
- **Nooit vooraf betalen** — oplichterij bestaat; wacht tot je het artikel hebt gezien
- **Check IKEA Tweedekans** — IKEA Spanje heeft een "as-is" sectie met goede deals
- **Timing** — eind augustus/september (einde verhuurseizoen) zijn de meeste aanbiedingen van vertrekkende expats

## De expat-cirkel

Een van de mooie dingen van expat-gemeenschappen is de "doorgeven"-cultuur. Iemand die 3 jaar geleden aankwam en alles tweedehands kocht, verkoopt het nu aan de volgende nieuwkomer. 1000Click maakt precies die cirkel mogelijk.

---

Plaats vandaag nog je eerste advertentie op 1000Click — het is volledig gratis en jouw spullen kunnen morgen al een nieuw thuis hebben!
`,
    category: 'conseils',
    author: '1000Click Team',
    readTime: 5,
    lang: 'nl',
    published: true,
    publishedAt: new Date('2026-05-20'),
  },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const post of POSTS) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`⏭  Existant : ${post.slug}`)
      skipped++
      continue
    }
    await prisma.blogPost.create({ data: post })
    console.log(`✅ Créé [${post.lang.toUpperCase()}] : ${post.slug}`)
    created++
  }

  console.log(`\n✅ Blog i18n seeded: ${created} créés, ${skipped} ignorés`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
