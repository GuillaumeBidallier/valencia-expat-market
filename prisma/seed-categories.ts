import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Types ────────────────────────────────────────────────────────────────────

type T = { en: string; es: string; de: string; nl: string; uk: string; ru: string }

type Cat3 = { slug: string; label: string; t: T }
type Cat2 = { slug: string; label: string; t: T; children?: Cat3[] }
type Cat1 = { slug: string; label: string; icon: string; t: T; children: Cat2[] }

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Cat1[] = [
  // ── 1. Véhicules ──────────────────────────────────────────────────────────
  {
    slug: 'vehicules', label: 'Véhicules', icon: '🚗',
    t: { en: 'Vehicles', es: 'Vehículos', de: 'Fahrzeuge', nl: "Voertuigen", uk: 'Транспорт', ru: 'Транспорт' },
    children: [
      {
        slug: 'voitures', label: 'Voitures',
        t: { en: 'Cars', es: 'Coches', de: 'Autos', nl: "Auto's", uk: 'Автомобілі', ru: 'Автомобили' },
        children: [
          { slug: 'berlines-citadines', label: 'Berlines & Citadines', t: { en: 'Sedans & City Cars', es: 'Berlinas y Utilitarios', de: 'Limousinen & Stadtautos', nl: 'Sedans & Stadswagens', uk: 'Седани та міські авто', ru: 'Седаны и городские авто' } },
          { slug: 'suv-4x4', label: 'SUV & 4x4', t: { en: 'SUVs & 4x4', es: 'SUV y 4x4', de: 'SUVs & Geländewagen', nl: "SUV's & 4x4", uk: 'Позашляховики', ru: 'Внедорожники' } },
          { slug: 'breaks-monospaces', label: 'Breaks & Monospaces', t: { en: 'Estate Cars & Minivans', es: 'Familiares y Monovolúmenes', de: 'Kombis & Vans', nl: 'Stationwagens & Vans', uk: 'Універсали та мінівени', ru: 'Универсалы и минивэны' } },
          { slug: 'cabriolets-coupes', label: 'Cabriolets & Coupés', t: { en: 'Convertibles & Coupés', es: 'Descapotables y Cupés', de: 'Cabrios & Coupés', nl: 'Cabriolets & Coupés', uk: 'Кабріолети та купе', ru: 'Кабриолеты и купе' } },
          { slug: 'utilitaires', label: 'Utilitaires légers', t: { en: 'Light Vans & Trucks', es: 'Vehículos comerciales ligeros', de: 'Leichte Nutzfahrzeuge', nl: 'Lichte bedrijfswagens', uk: 'Легкі вантажівки', ru: 'Лёгкий коммерческий транспорт' } },
          { slug: 'voitures-collection', label: 'Voitures de collection', t: { en: 'Classic Cars', es: 'Coches clásicos', de: 'Oldtimer', nl: 'Oldtimers', uk: 'Колекційні авто', ru: 'Коллекционные авто' } },
        ],
      },
      {
        slug: 'motos-scooters', label: 'Motos & Scooters',
        t: { en: 'Motorcycles & Scooters', es: 'Motos y Scooters', de: 'Motorräder & Roller', nl: 'Motoren & Scooters', uk: 'Мотоцикли та скутери', ru: 'Мотоциклы и скутеры' },
        children: [
          { slug: 'motos', label: 'Motos', t: { en: 'Motorcycles', es: 'Motos', de: 'Motorräder', nl: 'Motoren', uk: 'Мотоцикли', ru: 'Мотоциклы' } },
          { slug: 'scooters', label: 'Scooters', t: { en: 'Scooters', es: 'Scooters', de: 'Roller', nl: 'Scooters', uk: 'Скутери', ru: 'Скутеры' } },
          { slug: 'quads-buggy', label: 'Quads & Buggy', t: { en: 'Quads & Buggies', es: 'Quads y Buggy', de: 'Quads & Buggys', nl: "Quad's & Buggy's", uk: 'Квадроцикли', ru: 'Квадроциклы' } },
        ],
      },
      {
        slug: 'caravaning', label: 'Caravaning & Camping',
        t: { en: 'Caravanning & Camping', es: 'Caravaning y Camping', de: 'Camping & Wohnmobile', nl: "Caravans & Kamperen", uk: 'Кемпінг та кемпери', ru: 'Кемпинг и автодома' },
        children: [
          { slug: 'camping-cars', label: 'Camping-cars', t: { en: 'Motorhomes', es: 'Autocaravanas', de: 'Wohnmobile', nl: 'Campers', uk: 'Будинки на колесах', ru: 'Автодома' } },
          { slug: 'caravanes', label: 'Caravanes', t: { en: 'Caravans', es: 'Caravanas', de: 'Wohnwagen', nl: 'Caravans', uk: 'Причепи', ru: 'Прицепы' } },
          { slug: 'vans-amenages', label: 'Vans aménagés', t: { en: 'Converted Vans', es: 'Furgonetas camper', de: 'Ausgebaute Vans', nl: 'Camperbestelwagens', uk: 'Кемпер-фургони', ru: 'Кемпер-фургоны' } },
        ],
      },
      {
        slug: 'nautisme', label: 'Nautisme',
        t: { en: 'Nautical', es: 'Náutica', de: 'Nautik', nl: 'Watersport', uk: 'Водний транспорт', ru: 'Водный транспорт' },
        children: [
          { slug: 'bateaux', label: 'Bateaux', t: { en: 'Boats', es: 'Barcos', de: 'Boote', nl: 'Boten', uk: 'Човни та яхти', ru: 'Лодки и яхты' } },
          { slug: 'jet-skis', label: 'Jet-skis', t: { en: 'Jet Skis', es: 'Motos de agua', de: 'Jetskis', nl: "Jetski's", uk: 'Гідроцикли', ru: 'Гидроциклы' } },
        ],
      },
      {
        slug: 'pieces-auto', label: 'Pièces & Équipements auto',
        t: { en: 'Parts & Car Accessories', es: 'Recambios y Accesorios', de: 'Teile & Kfz-Zubehör', nl: 'Onderdelen & Autoaccessoires', uk: 'Запчастини та автоаксесуари', ru: 'Запчасти и автоаксессуары' },
        children: [
          { slug: 'pieces-detachees', label: 'Pièces détachées', t: { en: 'Spare Parts', es: 'Piezas de repuesto', de: 'Ersatzteile', nl: 'Reserveonderdelen', uk: 'Запасні частини', ru: 'Запасные части' } },
          { slug: 'jantes-pneus', label: 'Jantes & Pneus', t: { en: 'Rims & Tyres', es: 'Llantas y Neumáticos', de: 'Felgen & Reifen', nl: 'Velgen & Banden', uk: 'Диски та шини', ru: 'Диски и шины' } },
          { slug: 'accessoires-auto', label: 'Accessoires auto', t: { en: 'Car Accessories', es: 'Accesorios de coche', de: 'Auto-Accessoires', nl: 'Autoaccessoires', uk: 'Автоаксесуари', ru: 'Автоаксессуары' } },
        ],
      },
    ],
  },

  // ── 2. Immobilier ──────────────────────────────────────────────────────────
  {
    slug: 'immobilier', label: 'Immobilier', icon: '🏠',
    t: { en: 'Real Estate', es: 'Inmuebles', de: 'Immobilien', nl: 'Vastgoed', uk: 'Нерухомість', ru: 'Недвижимость' },
    children: [
      {
        slug: 'vente-immo', label: 'Vente',
        t: { en: 'For Sale', es: 'En venta', de: 'Zu verkaufen', nl: 'Te koop', uk: 'Продаж', ru: 'Продажа' },
        children: [
          { slug: 'vente-appartements', label: 'Appartements', t: { en: 'Apartments', es: 'Pisos', de: 'Wohnungen', nl: 'Appartementen', uk: 'Квартири', ru: 'Квартиры' } },
          { slug: 'vente-maisons', label: 'Maisons & Villas', t: { en: 'Houses & Villas', es: 'Casas y Villas', de: 'Häuser & Villen', nl: "Huizen & Villa's", uk: 'Будинки та вілли', ru: 'Дома и виллы' } },
          { slug: 'vente-terrains', label: 'Terrains', t: { en: 'Land & Plots', es: 'Terrenos', de: 'Grundstücke', nl: 'Grond & Percelen', uk: 'Земельні ділянки', ru: 'Земельные участки' } },
          { slug: 'vente-commerces', label: 'Locaux commerciaux', t: { en: 'Commercial Properties', es: 'Locales comerciales', de: 'Gewerbeimmobilien', nl: 'Bedrijfspanden', uk: 'Комерційна нерухомість', ru: 'Коммерческая недвижимость' } },
        ],
      },
      {
        slug: 'location-immo', label: 'Location',
        t: { en: 'For Rent', es: 'En alquiler', de: 'Zur Miete', nl: 'Te huur', uk: 'Оренда', ru: 'Аренда' },
        children: [
          { slug: 'location-appartements', label: 'Appartements', t: { en: 'Apartments', es: 'Pisos', de: 'Wohnungen', nl: 'Appartementen', uk: 'Квартири', ru: 'Квартиры' } },
          { slug: 'location-maisons', label: 'Maisons & Villas', t: { en: 'Houses & Villas', es: 'Casas y Villas', de: 'Häuser & Villen', nl: "Huizen & Villa's", uk: 'Будинки та вілли', ru: 'Дома и виллы' } },
          { slug: 'colocations', label: 'Colocations', t: { en: 'Flatshares', es: 'Pisos compartidos', de: 'WG-Zimmer', nl: 'Kamerverhuur', uk: 'Спільне житло', ru: 'Совместное жильё' } },
          { slug: 'location-commerces', label: 'Locaux commerciaux', t: { en: 'Commercial Rentals', es: 'Locales en alquiler', de: 'Gewerberäume', nl: 'Bedrijfsruimte', uk: 'Оренда комерційних приміщень', ru: 'Аренда коммерческих помещений' } },
        ],
      },
      {
        slug: 'vacances-immo', label: 'Vacances & Court terme',
        t: { en: 'Holiday Rentals', es: 'Alquileres vacacionales', de: 'Ferienunterkünfte', nl: 'Vakantieverhuur', uk: 'Оренда для відпочинку', ru: 'Аренда для отдыха' },
        children: [
          { slug: 'locations-saisonnieres', label: 'Locations saisonnières', t: { en: 'Seasonal Rentals', es: 'Alquileres de temporada', de: 'Saisonale Vermietungen', nl: 'Seizoensverhuur', uk: 'Сезонна оренда', ru: 'Сезонная аренда' } },
          { slug: 'chambres-bnb', label: 'Chambres & B&B', t: { en: 'Rooms & B&B', es: 'Habitaciones y B&B', de: 'Zimmer & B&B', nl: 'Kamers & B&B', uk: 'Кімнати та B&B', ru: 'Комнаты и B&B' } },
        ],
      },
    ],
  },

  // ── 3. Maison & Mobilier ───────────────────────────────────────────────────
  {
    slug: 'meubles', label: 'Maison & Mobilier', icon: '🛋️',
    t: { en: 'Home & Furniture', es: 'Hogar y Muebles', de: 'Haus & Möbel', nl: 'Huis & Meubels', uk: 'Дім та Меблі', ru: 'Дом и Мебель' },
    children: [
      {
        slug: 'ameublement', label: 'Ameublement',
        t: { en: 'Furniture', es: 'Muebles', de: 'Möbel', nl: 'Meubels', uk: 'Меблі', ru: 'Мебель' },
        children: [
          { slug: 'canapes-salons', label: 'Canapés & Salons', t: { en: 'Sofas & Living Room', es: 'Sofás y Salón', de: 'Sofas & Wohnzimmer', nl: 'Banken & Woonkamer', uk: 'Дивани та вітальня', ru: 'Диваны и гостиная' } },
          { slug: 'chambres-literie', label: 'Chambres & Literie', t: { en: 'Bedrooms & Bedding', es: 'Dormitorios y Ropa de cama', de: 'Schlafzimmer & Bettwäsche', nl: 'Slaapkamers & Beddengoed', uk: 'Спальні та постіль', ru: 'Спальни и постельное бельё' } },
          { slug: 'cuisines-salle-manger', label: 'Cuisines & Salle à manger', t: { en: 'Kitchen & Dining', es: 'Cocina y Comedor', de: 'Küche & Esszimmer', nl: 'Keuken & Eetkamer', uk: 'Кухня та їдальня', ru: 'Кухня и столовая' } },
          { slug: 'rangements', label: 'Rangements & Bibliothèques', t: { en: 'Storage & Shelving', es: 'Almacenamiento y Estanterías', de: 'Aufbewahrung & Regale', nl: 'Opbergen & Kasten', uk: 'Зберігання та стелажі', ru: 'Хранение и стеллажи' } },
        ],
      },
      {
        slug: 'electromenager', label: 'Électroménager',
        t: { en: 'Appliances', es: 'Electrodomésticos', de: 'Haushaltsgeräte', nl: 'Huishoudapparaten', uk: 'Побутова техніка', ru: 'Бытовая техника' },
        children: [
          { slug: 'gros-electromenager', label: 'Gros électroménager', t: { en: 'Large Appliances', es: 'Grandes electrodomésticos', de: 'Große Haushaltsgeräte', nl: 'Grote huishoudapparaten', uk: 'Велика побутова техніка', ru: 'Крупная бытовая техника' } },
          { slug: 'petit-electromenager', label: 'Petit électroménager', t: { en: 'Small Appliances', es: 'Pequeños electrodomésticos', de: 'Kleine Haushaltsgeräte', nl: 'Kleine huishoudapparaten', uk: 'Дрібна побутова техніка', ru: 'Мелкая бытовая техника' } },
          { slug: 'climatisation-chauffage', label: 'Climatisation & Chauffage', t: { en: 'Air Conditioning & Heating', es: 'Climatización y Calefacción', de: 'Klima & Heizung', nl: 'Airconditioning & Verwarming', uk: 'Клімат-контроль', ru: 'Климат-контроль' } },
        ],
      },
      {
        slug: 'deco', label: 'Décoration',
        t: { en: 'Decoration', es: 'Decoración', de: 'Dekoration', nl: 'Decoratie', uk: 'Декор', ru: 'Декор' },
        children: [
          { slug: 'luminaires', label: 'Luminaires', t: { en: 'Lighting', es: 'Iluminación', de: 'Beleuchtung', nl: 'Verlichting', uk: 'Освітлення', ru: 'Освещение' } },
          { slug: 'vaisselle', label: 'Vaisselle & Arts de la table', t: { en: 'Tableware & Kitchen', es: 'Vajilla y Menaje', de: 'Geschirr & Tischdekoration', nl: 'Servies & Tafelgerei', uk: 'Посуд та столові прибори', ru: 'Посуда и столовые приборы' } },
          { slug: 'linge-maison', label: 'Linge de maison', t: { en: 'Home Textiles', es: 'Ropa de hogar', de: 'Heimtextilien', nl: 'Huistextiel', uk: 'Домашній текстиль', ru: 'Домашний текстиль' } },
        ],
      },
      {
        slug: 'bricolage-jardinage', label: 'Bricolage & Jardinage',
        t: { en: 'DIY & Gardening', es: 'Bricolaje y Jardinería', de: 'Heimwerken & Garten', nl: 'Klussen & Tuinieren', uk: 'Ремонт та Садівництво', ru: 'Ремонт и Садоводство' },
        children: [
          { slug: 'outillage', label: 'Outillage', t: { en: 'Tools', es: 'Herramientas', de: 'Werkzeug', nl: 'Gereedschap', uk: 'Інструменти', ru: 'Инструменты' } },
          { slug: 'jardinage', label: 'Jardinage', t: { en: 'Gardening', es: 'Jardinería', de: 'Gartenarbeit', nl: 'Tuinieren', uk: 'Садівництво', ru: 'Садоводство' } },
          { slug: 'piscine-spa', label: 'Piscine & Spa', t: { en: 'Pool & Spa', es: 'Piscina y Spa', de: 'Pool & Spa', nl: 'Zwembad & Spa', uk: 'Басейн та СПА', ru: 'Бассейн и СПА' } },
        ],
      },
    ],
  },

  // ── 4. Multimédia & Informatique ───────────────────────────────────────────
  {
    slug: 'multimedia', label: 'Multimédia & Informatique', icon: '💻',
    t: { en: 'Electronics & Computers', es: 'Electrónica e Informática', de: 'Elektronik & Computer', nl: 'Elektronica & Computers', uk: 'Електроніка та Комп\'ютери', ru: 'Электроника и Компьютеры' },
    children: [
      {
        slug: 'informatique', label: 'Informatique',
        t: { en: 'Computing', es: 'Informática', de: 'Computer', nl: 'Computers', uk: "Комп'ютери", ru: 'Компьютеры' },
        children: [
          { slug: 'ordinateurs-portables', label: 'Ordinateurs portables', t: { en: 'Laptops', es: 'Portátiles', de: 'Laptops', nl: 'Laptops', uk: 'Ноутбуки', ru: 'Ноутбуки' } },
          { slug: 'ordinateurs-fixes', label: 'Ordinateurs fixes', t: { en: 'Desktop PCs', es: 'Ordenadores de sobremesa', de: 'Desktop-PCs', nl: "Desktop-pc's", uk: 'Настільні комп\'ютери', ru: 'Настольные компьютеры' } },
          { slug: 'tablettes', label: 'Tablettes', t: { en: 'Tablets', es: 'Tabletas', de: 'Tablets', nl: 'Tablets', uk: 'Планшети', ru: 'Планшеты' } },
          { slug: 'composants-pc', label: 'Composants & Pièces', t: { en: 'Components & Parts', es: 'Componentes y Piezas', de: 'Komponenten & Teile', nl: 'Componenten & Onderdelen', uk: "Комплектуючі та запчастини", ru: 'Комплектующие и запчасти' } },
        ],
      },
      {
        slug: 'telephonie', label: 'Téléphonie',
        t: { en: 'Mobile Phones', es: 'Telefonía', de: 'Mobiltelefone', nl: 'Telefonie', uk: 'Телефони', ru: 'Телефоны' },
        children: [
          { slug: 'smartphones', label: 'Smartphones', t: { en: 'Smartphones', es: 'Smartphones', de: 'Smartphones', nl: 'Smartphones', uk: 'Смартфони', ru: 'Смартфоны' } },
          { slug: 'accessoires-telephone', label: 'Accessoires téléphone', t: { en: 'Phone Accessories', es: 'Accesorios de móvil', de: 'Handy-Zubehör', nl: 'Telefoonaccessoires', uk: 'Аксесуари для телефону', ru: 'Аксессуары для телефона' } },
        ],
      },
      {
        slug: 'photo-video', label: 'Photo & Vidéo',
        t: { en: 'Photo & Video', es: 'Foto y Vídeo', de: 'Foto & Video', nl: "Foto & Video", uk: 'Фото та Відео', ru: 'Фото и Видео' },
        children: [
          { slug: 'appareils-photo', label: 'Appareils photo', t: { en: 'Cameras', es: 'Cámaras fotográficas', de: 'Kameras', nl: "Camera's", uk: 'Фотоапарати', ru: 'Фотоаппараты' } },
          { slug: 'cameras-video', label: 'Caméras & Vidéo', t: { en: 'Video Cameras', es: 'Videocámaras', de: 'Videokameras', nl: "Videocamera's", uk: 'Відеокамери', ru: 'Видеокамеры' } },
          { slug: 'objectifs-accessoires-photo', label: 'Objectifs & Accessoires', t: { en: 'Lenses & Accessories', es: 'Objetivos y Accesorios', de: 'Objektive & Zubehör', nl: 'Lenzen & Accessoires', uk: 'Об\'єктиви та аксесуари', ru: 'Объективы и аксессуары' } },
        ],
      },
      {
        slug: 'jeux-video', label: 'Jeux vidéo',
        t: { en: 'Video Games', es: 'Videojuegos', de: 'Videospiele', nl: 'Videospellen', uk: 'Відеоігри', ru: 'Видеоигры' },
        children: [
          { slug: 'consoles', label: 'Consoles', t: { en: 'Consoles', es: 'Consolas', de: 'Spielkonsolen', nl: 'Spelconsoles', uk: 'Консолі', ru: 'Консоли' } },
          { slug: 'jeux-consoles', label: 'Jeux', t: { en: 'Games', es: 'Juegos', de: 'Spiele', nl: 'Spellen', uk: 'Ігри', ru: 'Игры' } },
          { slug: 'accessoires-gaming', label: 'Accessoires gaming', t: { en: 'Gaming Accessories', es: 'Accesorios gaming', de: 'Gaming-Zubehör', nl: 'Gamingaccessoires', uk: 'Аксесуари для ігор', ru: 'Игровые аксессуары' } },
        ],
      },
      {
        slug: 'tv-son', label: 'TV, Son & Image',
        t: { en: 'TV, Audio & Video', es: 'TV, Sonido e Imagen', de: 'TV, Audio & Video', nl: 'TV, Audio & Video', uk: 'Телевізори та Аудіо', ru: 'Телевизоры и Аудио' },
        children: [
          { slug: 'televiseurs', label: 'Téléviseurs', t: { en: 'TVs', es: 'Televisores', de: 'Fernseher', nl: 'Televisies', uk: 'Телевізори', ru: 'Телевизоры' } },
          { slug: 'enceintes-casques', label: 'Enceintes & Casques', t: { en: 'Speakers & Headphones', es: 'Altavoces y Auriculares', de: 'Lautsprecher & Kopfhörer', nl: 'Luidsprekers & Koptelefoons', uk: 'Колонки та навушники', ru: 'Колонки и наушники' } },
        ],
      },
    ],
  },

  // ── 5. Mode & Beauté ───────────────────────────────────────────────────────
  {
    slug: 'mode', label: 'Mode & Beauté', icon: '👗',
    t: { en: 'Fashion & Beauty', es: 'Moda y Belleza', de: 'Mode & Schönheit', nl: 'Mode & Schoonheid', uk: 'Мода та Краса', ru: 'Мода и Красота' },
    children: [
      { slug: 'vetements-femme', label: 'Vêtements femme', t: { en: "Women's Clothing", es: 'Ropa de mujer', de: 'Damenkleidung', nl: 'Dameskleding', uk: 'Жіночий одяг', ru: 'Женская одежда' } },
      { slug: 'vetements-homme', label: 'Vêtements homme', t: { en: "Men's Clothing", es: 'Ropa de hombre', de: 'Herrenkleidung', nl: 'Herenkleding', uk: 'Чоловічий одяг', ru: 'Мужская одежда' } },
      { slug: 'chaussures', label: 'Chaussures', t: { en: 'Shoes', es: 'Zapatos', de: 'Schuhe', nl: 'Schoenen', uk: 'Взуття', ru: 'Обувь' } },
      { slug: 'sacs-maroquinerie', label: 'Sacs & Maroquinerie', t: { en: 'Bags & Leather Goods', es: 'Bolsos y Marroquinería', de: 'Taschen & Lederwaren', nl: 'Tassen & Lederwaren', uk: 'Сумки та шкіргалантерея', ru: 'Сумки и кожгалантерея' } },
      { slug: 'bijoux-montres', label: 'Bijoux & Montres', t: { en: 'Jewellery & Watches', es: 'Joyería y Relojes', de: 'Schmuck & Uhren', nl: 'Sieraden & Horloges', uk: 'Ювелірні прикраси та Годинники', ru: 'Ювелирные украшения и Часы' } },
      { slug: 'beaute-parfums', label: 'Beauté & Parfums', t: { en: 'Beauty & Perfumes', es: 'Belleza y Perfumes', de: 'Schönheit & Parfüms', nl: 'Schoonheid & Parfums', uk: 'Краса та Парфуми', ru: 'Красота и Парфюмерия' } },
    ],
  },

  // ── 6. Loisirs & Sports ────────────────────────────────────────────────────
  {
    slug: 'livres', label: 'Loisirs & Sports', icon: '🎯',
    t: { en: 'Leisure & Sports', es: 'Ocio y Deportes', de: 'Freizeit & Sport', nl: 'Vrije tijd & Sport', uk: 'Дозвілля та Спорт', ru: 'Досуг и Спорт' },
    children: [
      {
        slug: 'sports-outdoor', label: 'Sports & Outdoor',
        t: { en: 'Sports & Outdoor', es: 'Deportes y Exterior', de: 'Sport & Outdoor', nl: 'Sport & Buiten', uk: 'Спорт та Активний відпочинок', ru: 'Спорт и Активный отдых' },
        children: [
          { slug: 'fitness-musculation', label: 'Fitness & Musculation', t: { en: 'Fitness & Gym', es: 'Fitness y Musculación', de: 'Fitness & Bodybuilding', nl: 'Fitness & Krachttraining', uk: 'Фітнес та Бодібілдинг', ru: 'Фитнес и Бодибилдинг' } },
          { slug: 'velos-trottinettes', label: 'Vélos & Trottinettes', t: { en: 'Bikes & Scooters', es: 'Bicicletas y Patinetes', de: 'Fahrräder & Roller', nl: 'Fietsen & Steps', uk: 'Велосипеди та самокати', ru: 'Велосипеды и самокаты' } },
          { slug: 'sports-collectifs', label: 'Sports collectifs', t: { en: 'Team Sports', es: 'Deportes de equipo', de: 'Mannschaftssport', nl: 'Teamsporten', uk: 'Командні види спорту', ru: 'Командные виды спорта' } },
          { slug: 'sports-nautiques', label: 'Sports nautiques & Ski', t: { en: 'Water Sports & Ski', es: 'Deportes acuáticos y Esquí', de: 'Wassersport & Ski', nl: 'Watersport & Ski', uk: 'Водні та Зимові види спорту', ru: 'Водные и Зимние виды спорта' } },
        ],
      },
      {
        slug: 'musique-instruments', label: 'Musique & Instruments',
        t: { en: 'Music & Instruments', es: 'Música e Instrumentos', de: 'Musik & Instrumente', nl: 'Muziek & Instrumenten', uk: 'Музика та Інструменти', ru: 'Музыка и Инструменты' },
        children: [
          { slug: 'guitares-basses', label: 'Guitares & Basses', t: { en: 'Guitars & Basses', es: 'Guitarras y Bajos', de: 'Gitarren & Bässe', nl: 'Gitaren & Bassen', uk: 'Гітари та баси', ru: 'Гитары и басы' } },
          { slug: 'claviers-pianos', label: 'Claviers & Pianos', t: { en: 'Keyboards & Pianos', es: 'Teclados y Pianos', de: 'Keyboards & Klaviere', nl: "Keyboards & Piano's", uk: 'Клавіші та Піаніно', ru: 'Клавиши и Пианино' } },
          { slug: 'sono-materiel', label: 'Sono & Matériel', t: { en: 'PA & Sound Equipment', es: 'Sonido y Equipos', de: 'Soundanlage & Equipment', nl: 'Geluidsapparatuur', uk: 'Звукове обладнання', ru: 'Звуковое оборудование' } },
        ],
      },
      {
        slug: 'livres-medias', label: 'Livres & Médias',
        t: { en: 'Books & Media', es: 'Libros y Medios', de: 'Bücher & Medien', nl: 'Boeken & Media', uk: 'Книги та Медіа', ru: 'Книги и Медиа' },
        children: [
          { slug: 'livres-neufs-occasion', label: 'Livres', t: { en: 'Books', es: 'Libros', de: 'Bücher', nl: 'Boeken', uk: 'Книги', ru: 'Книги' } },
          { slug: 'films-series', label: 'Films & Séries', t: { en: 'Movies & TV Shows', es: 'Películas y Series', de: 'Filme & Serien', nl: "Films & Series", uk: 'Фільми та Серіали', ru: 'Фильмы и Сериалы' } },
          { slug: 'musique-vinyles', label: 'Musique & Vinyles', t: { en: 'Music & Vinyl', es: 'Música y Vinilos', de: 'Musik & Vinyl', nl: 'Muziek & Vinyl', uk: 'Музика та Вінілові платівки', ru: 'Музыка и Винил' } },
        ],
      },
      {
        slug: 'collection-art', label: 'Collection & Art',
        t: { en: 'Collectibles & Art', es: 'Coleccionismo y Arte', de: 'Sammeln & Kunst', nl: 'Verzamelen & Kunst', uk: 'Колекціонування та Мистецтво', ru: 'Коллекционирование и Искусство' },
        children: [
          { slug: 'antiquites', label: 'Antiquités & Art', t: { en: 'Antiques & Art', es: 'Antigüedades y Arte', de: 'Antiquitäten & Kunst', nl: 'Antiek & Kunst', uk: 'Антикваріат та Мистецтво', ru: 'Антиквариат и Искусство' } },
          { slug: 'philatelie-numismatique', label: 'Philatélie & Numismatique', t: { en: 'Stamps & Coins', es: 'Filatelia y Numismática', de: 'Briefmarken & Münzen', nl: 'Postzegels & Munten', uk: 'Філателія та Нумізматика', ru: 'Филателия и Нумизматика' } },
        ],
      },
    ],
  },

  // ── 7. Enfants & Famille ───────────────────────────────────────────────────
  {
    slug: 'enfants', label: 'Enfants & Famille', icon: '👶',
    t: { en: 'Kids & Family', es: 'Niños y Familia', de: 'Kinder & Familie', nl: 'Kinderen & Familie', uk: "Діти та Сім'я", ru: 'Дети и Семья' },
    children: [
      {
        slug: 'puericulture', label: 'Puériculture',
        t: { en: 'Baby & Nursery', es: 'Puericultura', de: 'Babyausstattung', nl: 'Babyspullen', uk: 'Дитячі товари', ru: 'Товары для малышей' },
        children: [
          { slug: 'poussettes', label: 'Poussettes & Transports', t: { en: 'Prams & Carriers', es: 'Cochecitos y Portabebés', de: 'Kinderwagen & Babyträger', nl: 'Kinderwagens & Draagzakken', uk: 'Коляски та слінги', ru: 'Коляски и слинги' } },
          { slug: 'literie-bebe', label: 'Literie bébé', t: { en: 'Baby Bedding & Cots', es: 'Cuna y Ropa de cama bebé', de: 'Babybett & Bettwäsche', nl: 'Babybedje & Beddengoed', uk: 'Дитяче ліжечко та постіль', ru: 'Детская кроватка и постельное бельё' } },
          { slug: 'sieges-auto', label: 'Sièges auto', t: { en: 'Car Seats', es: 'Sillas de coche', de: 'Kindersitze', nl: 'Autostoeltjes', uk: 'Дитячі автокрісла', ru: 'Детские автокресла' } },
        ],
      },
      {
        slug: 'jouets-jeux', label: 'Jouets & Jeux',
        t: { en: 'Toys & Games', es: 'Juguetes y Juegos', de: 'Spielzeug & Spiele', nl: 'Speelgoed & Spellen', uk: 'Іграшки та Ігри', ru: 'Игрушки и Игры' },
        children: [
          { slug: 'jouets-eveil', label: "Jouets d'éveil", t: { en: 'Educational Toys', es: 'Juguetes educativos', de: 'Lernspielzeug', nl: 'Educatief speelgoed', uk: 'Розвиваючі іграшки', ru: 'Развивающие игрушки' } },
          { slug: 'jeux-societe', label: 'Jeux de société', t: { en: 'Board Games & Puzzles', es: 'Juegos de mesa y Puzzles', de: 'Brettspiele & Puzzles', nl: 'Bordspellen & Puzzels', uk: 'Настільні ігри та Пазли', ru: 'Настольные игры и Пазлы' } },
          { slug: 'jeux-exterieur', label: "Jeux d'extérieur", t: { en: 'Outdoor Toys', es: 'Juguetes de exterior', de: 'Outdoor-Spielzeug', nl: 'Buitenspeelgoed', uk: 'Вуличні іграшки', ru: 'Уличные игрушки' } },
        ],
      },
      { slug: 'vetements-enfant', label: 'Vêtements & Chaussures enfant', t: { en: "Children's Clothing & Shoes", es: 'Ropa y Calzado infantil', de: 'Kinderkleidung & -schuhe', nl: 'Kinderkleding & -schoenen', uk: 'Дитячий одяг та взуття', ru: 'Детская одежда и обувь' } },
      { slug: 'livres-educatifs', label: 'Livres & Jeux éducatifs', t: { en: "Children's Books & Learning Games", es: 'Libros y Juegos educativos', de: 'Kinderbücher & Lernspiele', nl: 'Kinderboeken & Leerspellen', uk: 'Дитячі книги та навчальні ігри', ru: 'Детские книги и обучающие игры' } },
    ],
  },

  // ── 8. Animaux ────────────────────────────────────────────────────────────
  {
    slug: 'animaux', label: 'Animaux', icon: '🐾',
    t: { en: 'Pets', es: 'Animales', de: 'Tiere', nl: 'Dieren', uk: 'Тварини', ru: 'Животные' },
    children: [
      {
        slug: 'chiens', label: 'Chiens',
        t: { en: 'Dogs', es: 'Perros', de: 'Hunde', nl: 'Honden', uk: 'Собаки', ru: 'Собаки' },
        children: [
          { slug: 'chiots-chiens', label: 'Chiots & Chiens', t: { en: 'Puppies & Dogs', es: 'Cachorros y Perros', de: 'Welpen & Hunde', nl: "Puppy's & Honden", uk: 'Цуценята та собаки', ru: 'Щенки и собаки' } },
          { slug: 'accessoires-chien', label: 'Accessoires chien', t: { en: 'Dog Accessories', es: 'Accesorios para perros', de: 'Hunde-Zubehör', nl: 'Hondenaccessoires', uk: 'Аксесуари для собак', ru: 'Аксессуары для собак' } },
        ],
      },
      {
        slug: 'chats', label: 'Chats',
        t: { en: 'Cats', es: 'Gatos', de: 'Katzen', nl: 'Katten', uk: 'Коти', ru: 'Кошки' },
        children: [
          { slug: 'chatons-chats', label: 'Chatons & Chats', t: { en: 'Kittens & Cats', es: 'Gatitos y Gatos', de: 'Kätzchen & Katzen', nl: 'Kittens & Katten', uk: 'Кошенята та коти', ru: 'Котята и кошки' } },
          { slug: 'accessoires-chat', label: 'Accessoires chat', t: { en: 'Cat Accessories', es: 'Accesorios para gatos', de: 'Katzen-Zubehör', nl: 'Kattenaccessoires', uk: 'Аксесуари для котів', ru: 'Аксессуары для кошек' } },
        ],
      },
      { slug: 'oiseaux', label: 'Oiseaux', t: { en: 'Birds', es: 'Pájaros', de: 'Vögel', nl: 'Vogels', uk: 'Птахи', ru: 'Птицы' } },
      { slug: 'rongeurs-lapins', label: 'Rongeurs & Lapins', t: { en: 'Rodents & Rabbits', es: 'Roedores y Conejos', de: 'Nagetiere & Kaninchen', nl: 'Knaagdieren & Konijnen', uk: 'Гризуни та кролики', ru: 'Грызуны и кролики' } },
      { slug: 'aquariophilie', label: 'Aquariophilie & Terrarium', t: { en: 'Fish, Reptiles & Aquariums', es: 'Peces, Reptiles y Acuarios', de: 'Fische, Reptilien & Aquaristik', nl: 'Vissen, Reptielen & Aquarium', uk: 'Акваріуми, Рибки та Рептилії', ru: 'Аквариумы, Рыбки и Рептилии' } },
    ],
  },

  // ── 9. Services ───────────────────────────────────────────────────────────
  {
    slug: 'services', label: 'Services', icon: '🔧',
    t: { en: 'Services', es: 'Servicios', de: 'Dienstleistungen', nl: 'Diensten', uk: 'Послуги', ru: 'Услуги' },
    children: [
      {
        slug: 'cours-formations', label: 'Cours & Formations',
        t: { en: 'Lessons & Training', es: 'Clases y Formación', de: 'Kurse & Schulungen', nl: 'Lessen & Trainingen', uk: 'Курси та Навчання', ru: 'Курсы и Обучение' },
        children: [
          { slug: 'cours-langue', label: 'Cours de langue', t: { en: 'Language Lessons', es: 'Clases de idiomas', de: 'Sprachkurse', nl: 'Talenlessen', uk: 'Мовні курси', ru: 'Языковые курсы' } },
          { slug: 'cours-particuliers', label: 'Cours particuliers', t: { en: 'Private Tutoring', es: 'Clases particulares', de: 'Nachhilfe', nl: 'Bijlessen', uk: 'Репетиторство', ru: 'Репетиторство' } },
          { slug: 'formations-pro', label: 'Formations professionnelles', t: { en: 'Professional Training', es: 'Formación profesional', de: 'Berufsausbildung', nl: 'Beroepsopleidingen', uk: 'Професійне навчання', ru: 'Профессиональное обучение' } },
        ],
      },
      {
        slug: 'aide-domicile', label: 'Aide à domicile',
        t: { en: 'Home Help', es: 'Ayuda a domicilio', de: 'Haushaltshilfe', nl: 'Thuishulp', uk: 'Домашня допомога', ru: 'Помощь по дому' },
        children: [
          { slug: 'menage-entretien', label: 'Ménage & Entretien', t: { en: 'Cleaning & Maintenance', es: 'Limpieza y Mantenimiento', de: 'Reinigung & Pflege', nl: 'Schoonmaak & Onderhoud', uk: 'Прибирання та обслуговування', ru: 'Уборка и обслуживание' } },
          { slug: 'garde-enfants', label: "Garde d'enfants", t: { en: 'Childcare', es: 'Cuidado de niños', de: 'Kinderbetreuung', nl: 'Kinderopvang', uk: 'Догляд за дітьми', ru: 'Уход за детьми' } },
          { slug: 'jardinage-services', label: 'Jardinage', t: { en: 'Gardening Services', es: 'Servicios de jardinería', de: 'Gartenarbeit', nl: 'Tuinonderhoud', uk: 'Садові послуги', ru: 'Садовые услуги' } },
        ],
      },
      {
        slug: 'artisans-travaux', label: 'Artisans & Travaux',
        t: { en: 'Tradespeople & Renovation', es: 'Artesanos y Reformas', de: 'Handwerker & Renovierung', nl: 'Aannemers & Renovatie', uk: 'Майстри та Ремонт', ru: 'Мастера и Ремонт' },
        children: [
          { slug: 'electricite-plomberie', label: 'Électricité & Plomberie', t: { en: 'Electrical & Plumbing', es: 'Electricidad y Fontanería', de: 'Elektro & Sanitär', nl: 'Elektra & Loodgieter', uk: 'Електрика та Сантехніка', ru: 'Электрика и Сантехника' } },
          { slug: 'peinture-decoration', label: 'Peinture & Décoration', t: { en: 'Painting & Decorating', es: 'Pintura y Decoración', de: 'Malen & Dekorieren', nl: 'Schilder & Decoratie', uk: 'Малярство та Декорування', ru: 'Покраска и Декорирование' } },
          { slug: 'renovation-maconnerie', label: 'Rénovation & Maçonnerie', t: { en: 'Renovation & Masonry', es: 'Renovación y Albañilería', de: 'Renovierung & Mauerwerk', nl: 'Renovatie & Metselwerk', uk: 'Ремонт та Мулярство', ru: 'Ремонт и Кладка' } },
        ],
      },
      { slug: 'demenagement-transport', label: 'Déménagement & Transport', t: { en: 'Moving & Transport', es: 'Mudanzas y Transporte', de: 'Umzug & Transport', nl: 'Verhuizen & Transport', uk: 'Переїзд та Транспорт', ru: 'Переезд и Транспорт' } },
      { slug: 'informatique-web', label: 'Informatique & Web', t: { en: 'IT & Web Services', es: 'Informática y Web', de: 'IT & Webdienste', nl: 'IT & Webdiensten', uk: 'ІТ та Веб-послуги', ru: 'ИТ и Веб-услуги' } },
      { slug: 'autres-services', label: 'Autres services', t: { en: 'Other Services', es: 'Otros servicios', de: 'Sonstige Dienstleistungen', nl: 'Overige diensten', uk: 'Інші послуги', ru: 'Другие услуги' } },
    ],
  },

  // ── 10. Dons ──────────────────────────────────────────────────────────────
  {
    slug: 'dons', label: 'Dons', icon: '🎁',
    t: { en: 'Free Stuff', es: 'Donaciones', de: 'Zu verschenken', nl: 'Gratis af te halen', uk: 'Безкоштовно', ru: 'Бесплатно' },
    children: [
      { slug: 'dons-objets', label: 'Objets & Mobilier', t: { en: 'Objects & Furniture', es: 'Objetos y Muebles', de: 'Gegenstände & Möbel', nl: 'Spullen & Meubels', uk: 'Речі та Меблі', ru: 'Вещи и Мебель' } },
      { slug: 'dons-vetements', label: 'Vêtements & Textile', t: { en: 'Clothing & Textiles', es: 'Ropa y Textil', de: 'Kleidung & Textilien', nl: 'Kleding & Textiel', uk: 'Одяг та Текстиль', ru: 'Одежда и Текстиль' } },
      { slug: 'dons-alimentation', label: 'Alimentation', t: { en: 'Food', es: 'Alimentación', de: 'Lebensmittel', nl: 'Voedsel', uk: 'Їжа', ru: 'Продукты питания' } },
      { slug: 'dons-livres', label: 'Livres & Médias', t: { en: 'Books & Media', es: 'Libros y Medios', de: 'Bücher & Medien', nl: 'Boeken & Media', uk: 'Книги та Медіа', ru: 'Книги и Медиа' } },
    ],
  },

  // ── 11. Autres ────────────────────────────────────────────────────────────
  {
    slug: 'autres', label: 'Autres', icon: '📦',
    t: { en: 'Other', es: 'Otros', de: 'Sonstiges', nl: 'Overige', uk: 'Інше', ru: 'Прочее' },
    children: [],
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding categories...\n')

  // Warn if listings exist
  const listingCount = await prisma.listing.count()
  if (listingCount > 0) {
    console.warn(`⚠️  ${listingCount} annonce(s) existent en base. Les slugs existants sont préservés (upsert). Les nouvelles catégories seront ajoutées.\n`)
  }

  // Truncate & recreate when no listings, otherwise upsert safely
  const force = process.argv.includes('--force')
  if (listingCount === 0 || force) {
    console.log('🗑️  Suppression des catégories existantes...')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "CategoryTranslation" CASCADE')
    // Delete leaves → children → roots to respect FK self-reference
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Category" WHERE "parentId" IN (
        SELECT id FROM "Category" WHERE "parentId" IN (
          SELECT id FROM "Category" WHERE "parentId" IS NOT NULL
        )
      )
    `)
    await prisma.$executeRawUnsafe(`DELETE FROM "Category" WHERE "parentId" IN (SELECT id FROM "Category" WHERE "parentId" IS NOT NULL)`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Category" WHERE "parentId" IS NOT NULL`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Category"`)
    console.log('✅ Nettoyage terminé\n')
  }

  let rootCount = 0, subCount = 0, subsubCount = 0, translationCount = 0

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat1 = CATEGORIES[i]

    const root = await prisma.category.upsert({
      where: { slug: cat1.slug },
      create: { slug: cat1.slug, label: cat1.label, icon: cat1.icon, order: i },
      update: { label: cat1.label, icon: cat1.icon, order: i },
    })
    rootCount++

    // Translations for root
    const rootTranslations = Object.entries(cat1.t).map(([locale, label]) => ({ categoryId: root.id, locale, label }))
    await Promise.all(rootTranslations.map(t =>
      prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: t.categoryId, locale: t.locale } },
        create: t, update: { label: t.label },
      })
    ))
    translationCount += rootTranslations.length

    for (let j = 0; j < cat1.children.length; j++) {
      const cat2 = cat1.children[j]

      const sub = await prisma.category.upsert({
        where: { slug: cat2.slug },
        create: { slug: cat2.slug, label: cat2.label, icon: '', order: j, parentId: root.id },
        update: { label: cat2.label, order: j, parentId: root.id },
      })
      subCount++

      const subTranslations = Object.entries(cat2.t).map(([locale, label]) => ({ categoryId: sub.id, locale, label }))
      await Promise.all(subTranslations.map(t =>
        prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: t.categoryId, locale: t.locale } },
          create: t, update: { label: t.label },
        })
      ))
      translationCount += subTranslations.length

      for (let k = 0; k < (cat2.children ?? []).length; k++) {
        const cat3 = cat2.children![k]

        const subsub = await prisma.category.upsert({
          where: { slug: cat3.slug },
          create: { slug: cat3.slug, label: cat3.label, icon: '', order: k, parentId: sub.id },
          update: { label: cat3.label, order: k, parentId: sub.id },
        })
        subsubCount++

        const subsubTranslations = Object.entries(cat3.t).map(([locale, label]) => ({ categoryId: subsub.id, locale, label }))
        await Promise.all(subsubTranslations.map(t =>
          prisma.categoryTranslation.upsert({
            where: { categoryId_locale: { categoryId: t.categoryId, locale: t.locale } },
            create: t, update: { label: t.label },
          })
        ))
        translationCount += subsubTranslations.length
      }
    }

    console.log(`  ✓ ${cat1.icon} ${cat1.label} (${cat1.children.length} sous-cat.)`)
  }

  console.log(`
✅ Seed terminé !
   ${rootCount} catégories racines
   ${subCount} sous-catégories
   ${subsubCount} sous-sous-catégories
   ${translationCount} traductions (en/es/de/nl/uk/ru)
  `)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
