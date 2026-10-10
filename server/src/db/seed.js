const bcrypt = require("bcryptjs");
const db = require("./database");
const { initializeSchema } = require("./schema");
const crypto = require("crypto");

function seedDatabase() {
  initializeSchema();

  console.log("Seeding database...");

  // 1. Users
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync("admin123", salt);
    const cashierHash = bcrypt.hashSync("kasir123", salt);

    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, role, name)
      VALUES (?, ?, ?, ?)
    `);

    insertUser.run("admin", adminHash, "admin", "Owner / Administrator");
    insertUser.run("kasir", cashierHash, "cashier", "Kasir Ruang Namu");
    console.log("Users seeded (admin/admin123, kasir/kasir123)");
  }

  // 2. Categories
  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get().count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, icon, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    insertCat.run("Coffee Signature", "coffee-signature", "Coffee", 1);
    insertCat.run("Manual Brew", "manual-brew", "Flame", 2);
    insertCat.run("Non-Coffee", "non-coffee", "CupSoda", 3);
    insertCat.run("Mocktails & Refresher", "mocktails", "Sparkles", 4);
    insertCat.run("Main Course", "main-course", "Utensils", 5);
    insertCat.run("Light Bites & Pastry", "light-bites", "Cookie", 6);
    console.log("Categories seeded");
  }

  // 3. Products
  const prodCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
  if (prodCount === 0) {
    const cats = db.prepare("SELECT id, slug FROM categories").all();
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    const insertProd = db.prepare(`
      INSERT INTO products (category_id, name, description, price, stock, image_url, is_featured, is_popular, is_promo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        cat: "coffee-signature",
        name: "Kopi Namu Signature",
        desc: "Espresso house blend gayo, aren organik lebak, susu segar creamy dengan sea salt cream gurih lembut di atasnya.",
        price: 28000,
        stock: 50,
        img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 1,
        promo: 0
      },
      {
        cat: "coffee-signature",
        name: "Spanish Latte Namu",
        desc: "Kombinasi espresso bold dengan susu kental manis artisan dan taburan kayu manis aromatik.",
        price: 30000,
        stock: 40,
        img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 1,
        promo: 0
      },
      {
        cat: "coffee-signature",
        name: "Cold Brew Ruang Sunyi",
        desc: "Ekstraksi dingin 16 jam biji Arabica Ijen Honey. Body jernih dengan note citrus, peach, dan aftertaste manis madu.",
        price: 32000,
        stock: 25,
        img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 0,
        promo: 0
      },
      {
        cat: "manual-brew",
        name: "V60 Flores Bajawa Honey",
        desc: "Hand-poured filter coffee dengan profil rasa cokelat lembut, caramel, dan floral aroma khas tanah Bajawa.",
        price: 32000,
        stock: 30,
        img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
        featured: 0,
        popular: 1,
        promo: 0
      },
      {
        cat: "non-coffee",
        name: "Kyoto Matcha Oat Latte",
        desc: "Ceremonial grade Uji Matcha dipadukan dengan creamy oat milk bebas laktosa dan sentuhan vanila.",
        price: 34000,
        stock: 35,
        img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 1,
        promo: 0
      },
      {
        cat: "non-coffee",
        name: "Dark Chocolate Artisan",
        desc: "Cokelat murni single origin 70% Jawa Barat dengan steamed milk hangat dan marshmallow lembut.",
        price: 28000,
        stock: 45,
        img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80",
        featured: 0,
        popular: 0,
        promo: 0
      },
      {
        cat: "mocktails",
        name: "Namu Berry Sparkler",
        desc: "Racikan artisan cold brew, sari buah blackberry segar, tonic water, dan daun mint yang menyegarkan dahaga.",
        price: 30000,
        stock: 30,
        img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 1,
        promo: 1
      },
      {
        cat: "main-course",
        name: "Nasi Goreng Kecombrang Namu",
        desc: "Nasi goreng rempah khas nusantara dengan aroma bunga kecombrang segar, suwiran ayam, sate lilit, dan telur mata sapi.",
        price: 38000,
        stock: 25,
        img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 1,
        promo: 0
      },
      {
        cat: "main-course",
        name: "Spaghetti Aglio Olio Smoked Beef",
        desc: "Pasta al dente dimasak dengan minyak zaitun extra virgin, bawang putih cincang, chili flakes, dan irisan daging asap gurih.",
        price: 36000,
        stock: 20,
        img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
        featured: 0,
        popular: 1,
        promo: 0
      },
      {
        cat: "light-bites",
        name: "Croissant Butter & Frangipane Almond",
        desc: "Croissant panggang mentega Prancis renyah berlapis dengan isian krim almond manis dan taburan almond panggang.",
        price: 26000,
        stock: 20,
        img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
        featured: 1,
        popular: 0,
        promo: 1
      },
      {
        cat: "light-bites",
        name: "Platter Gurih Ruang Namu",
        desc: "Kombinasi camilan hangat: Tahu cabe garam krispi, Singkong keju mekar renyah, dan Cireng bumbu rujak pedas manis.",
        price: 32000,
        stock: 30,
        img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80",
        featured: 0,
        popular: 1,
        promo: 0
      }
    ];

    for (const p of products) {
      insertProd.run(catMap[p.cat], p.name, p.desc, p.price, p.stock, p.img, p.featured, p.popular, p.promo);
    }
    console.log("Products seeded");
  }

  // 4. Tables (12 Meja)
  const tableCount = db.prepare("SELECT COUNT(*) as count FROM tables").get().count;
  if (tableCount === 0) {
    const insertTable = db.prepare(`
      INSERT INTO tables (table_number, token, qr_code_data, capacity)
      VALUES (?, ?, ?, ?)
    `);

    for (let i = 1; i <= 12; i++) {
      const tableNum = String(i).padStart(2, "0");
      const token = crypto.randomBytes(8).toString("hex");
      const qrData = `http://localhost:5173/order?table=${tableNum}&token=${token}`;
      const cap = i <= 6 ? 2 : (i <= 10 ? 4 : 8);
      insertTable.run(`Meja ${tableNum}`, token, qrData, cap);
    }
    console.log("Tables seeded (12 tables)");
  }

  // 5. Cafe Settings
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM cafe_settings").get().count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO cafe_settings (key, value)
      VALUES (?, ?)
    `);

    const profileData = {
      name: "Cafe Ruang Namu",
      tagline: "Tempat Singgah, Merajut Asa & Menikmati Waktu",
      description: "Cafe Ruang Namu adalah ruang kreatif dan tempat berkumpul UMKM yang memadukan kehangatan kopi nusantara dengan kenyamanan ruang kerja dan diskusi modern.",
      story: "Didirikan dari kecintaan mendalam akan budaya ngopi Indonesia, Ruang Namu hadir sebagai rumah kedua bagi para penikmat kopi, pekerja kreatif, komunitas, dan mahasiswa yang mencari ketenangan di tengah hiruk pikuk kota. Setiap cangkir diseduh dari biji kopi lokal pilihan yang dibeli langsung dari petani binaan di Jawa, Sumatra, dan Flores.",
      vision: "Menjadi ruang bertumbuh bagi komunitas lokal dan menghadirkan pengalaman kopi spesialti nusantara yang ramah, hangat, dan inklusif bagi semua kalangan.",
      concepts: "Slow Living Cafe • Creative Workspace • Specialty Indonesian Beans",
      established_year: "2023",
      phone: "+62 812-3456-7890",
      whatsapp: "6281234567890",
      instagram: "@ruangnamu.cafe",
      email: "halo@ruangnamu.id",
      address: "Jl. Margonda Raya No. 418, Pondok Cina, Beji, Kota Depok, Jawa Barat 16424",
      coordinates: "-6.3688, 106.8335",
      gmaps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2341421458045!2d106.8315264!3d-6.3637213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ec0691535491%3A0x6b490799ea4ea778!2sDepok!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid",
      cover_image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop&q=80",
      logo_image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
      seo_title: "Cafe Ruang Namu | Specialty Coffee & Creative Space",
      seo_description: "Nikmati kopi spesialti terbaik nusantara dan kenyamanan ruang kreatif di Cafe Ruang Namu. Pesan langsung dari meja via QRIS dinamis otomatis.",
      social_share_image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80"
    };

    const facilitiesData = [
      { id: "wifi", name: "High-Speed Wi-Fi", desc: "Koneksi 100 Mbps stabil cocok untuk WFC & remote work", icon: "Wifi", available: true },
      { id: "ac", name: "Ruang Indoor AC", desc: "Area sejuk bebas polusi dan asap rokok untuk fokus kerja", icon: "Wind", available: true },
      { id: "outdoor", name: "Outdoor & Smoking Area", desc: "Suasana terbuka yang asri dengan sirkulasi udara alami", icon: "TreePine", available: true },
      { id: "power", name: "Colokan Listrik Lengkap", desc: "Tersedia stopkontak di setiap sudut meja", icon: "Zap", available: true },
      { id: "musholla", name: "Musholla Nyaman", desc: "Fasilitas ibadah bersih dilengkapi sarung & mukena", icon: "Heart", available: true },
      { id: "parking", name: "Parkir Luas & Aman", desc: "Area parkir motor & mobil dengan pengawasan kamera CCTV", icon: "Car", available: true }
    ];

    const operatingHoursData = [
      { day: "Senin", open: "08:00", close: "22:00", is_closed: false },
      { day: "Selasa", open: "08:00", close: "22:00", is_closed: false },
      { day: "Rabu", open: "08:00", close: "22:00", is_closed: false },
      { day: "Kamis", open: "08:00", close: "22:00", is_closed: false },
      { day: "Jumat", open: "08:00", close: "23:00", is_closed: false },
      { day: "Sabtu", open: "07:00", close: "23:00", is_closed: false },
      { day: "Minggu", open: "07:00", close: "22:00", is_closed: false }
    ];

    const taxSettings = {
      enable_tax: true,
      tax_percent: 10, // PB1 Restoran 10%
      enable_service: false,
      service_percent: 0
    };

    const orderingPolicy = {
      allow_table_change: true,
      require_table_qr: false, // Pelanggan bisa pilih meja jika walk-in tanpa scan
      min_order_amount: 10000
    };

    const paymentConfig = {
      active_provider: "MOCK_SANDBOX", // Default sandbox testing hingga merchant memasukkan key resmi
      midtrans: {
        is_production: false,
        merchant_id: "",
        client_key: "",
        server_key: ""
      }
    };

    insertSetting.run("profile", JSON.stringify(profileData));
    insertSetting.run("facilities", JSON.stringify(facilitiesData));
    insertSetting.run("operating_hours", JSON.stringify(operatingHoursData));
    insertSetting.run("tax_and_fees", JSON.stringify(taxSettings));
    insertSetting.run("ordering_policy", JSON.stringify(orderingPolicy));
    insertSetting.run("payment_config", JSON.stringify(paymentConfig));
    console.log("Cafe settings seeded");
  }

  // 6. Promotions
  const promoCount = db.prepare("SELECT COUNT(*) as count FROM promotions").get().count;
  if (promoCount === 0) {
    const insertPromo = db.prepare(`
      INSERT INTO promotions (title, description, banner_image, discount_type, discount_value, min_spend, valid_from, valid_until, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPromo.run(
      "Promo Semangat Awal Pekan - Diskon 15%",
      "Nikmati diskon 15% untuk seluruh menu kopi signature setiap hari Senin dan Selasa.",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop&q=80",
      "PERCENT",
      15,
      50000,
      "2026-01-01",
      "2026-12-31",
      1
    );

    insertPromo.run(
      "Bundling Sarapan Sehat: Kopi + Croissant Rp 45.000",
      "Paket hemat kopi signature dan croissant almond renyah sebelum jam 11:00 WIB.",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&auto=format&fit=crop&q=80",
      "FIXED",
      9000,
      45000,
      "2026-01-01",
      "2026-12-31",
      1
    );
    console.log("Promotions seeded");
  }

  console.log("Seeding completed successfully!");
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
