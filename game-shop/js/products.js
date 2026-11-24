/*
 * Демо-каталог. Замініть на свої товари або завантажуйте з API/CMS.
 *
 * Поля:
 *  id        — унікальний ідентифікатор
 *  title     — назва
 *  price     — ціна, ₴
 *  oldPrice  — стара ціна (для знижки), або null
 *  genre     — жанр
 *  stock     — "in" | "preorder" | "out"
 *  condition — "new" | "used"
 *  lang      — "ua" | "en" (мова інтерфейсу/субтитрів)
 *  age       — вікове обмеження (PEGI)
 *  release   — дата релізу, YYYY-MM-DD
 *  rating    — популярність 0..100 (для сортування)
 *  image     — шлях до обкладинки (необовʼязково; якщо порожньо — малюється заглушка)
 *  colors    — два кольори для заглушки обкладинки
 */
window.PRODUCTS = [
  { id: 1,  title: "Starfall Odyssey",       price: 2499, oldPrice: null, genre: "RPG",       stock: "in",       condition: "new",  lang: "ua", age: 16, release: "2026-10-14", rating: 98, colors: ["#3b2ccf", "#ff6a3d"] },
  { id: 2,  title: "Neon Drift Racing",      price: 1799, oldPrice: 2299, genre: "Перегони",  stock: "in",       condition: "new",  lang: "ua", age: 3,  release: "2026-03-02", rating: 87, colors: ["#ff2d95", "#1b1446"] },
  { id: 3,  title: "Iron Valley",            price: 999,  oldPrice: null, genre: "Шутер",     stock: "in",       condition: "used", lang: "en", age: 18, release: "2024-11-20", rating: 74, colors: ["#4a5a3a", "#d9c27a"] },
  { id: 4,  title: "Kingdom of Ash II",      price: 2799, oldPrice: null, genre: "RPG",       stock: "preorder", condition: "new",  lang: "ua", age: 18, release: "2027-02-10", rating: 95, colors: ["#2b1a12", "#e0782b"] },
  { id: 5,  title: "Pocket Heroes Party",    price: 1499, oldPrice: 1899, genre: "Сімейні",   stock: "in",       condition: "new",  lang: "ua", age: 7,  release: "2025-12-05", rating: 81, colors: ["#ffcc33", "#2ec4b6"] },
  { id: 6,  title: "Silent Harbor",          price: 1299, oldPrice: null, genre: "Хорор",     stock: "in",       condition: "used", lang: "en", age: 18, release: "2025-05-30", rating: 79, colors: ["#0d1b2a", "#6c8ea4"] },
  { id: 7,  title: "Goal Rush 27",           price: 2599, oldPrice: null, genre: "Спорт",     stock: "preorder", condition: "new",  lang: "ua", age: 3,  release: "2026-12-12", rating: 92, colors: ["#00a86b", "#0b2545"] },
  { id: 8,  title: "Shadow Protocol",        price: 1999, oldPrice: 2499, genre: "Екшн",      stock: "in",       condition: "new",  lang: "ua", age: 18, release: "2026-06-18", rating: 89, colors: ["#111111", "#c0141b"] },
  { id: 9,  title: "Cloud Gardens",          price: 899,  oldPrice: null, genre: "Інді",      stock: "in",       condition: "new",  lang: "en", age: 3,  release: "2025-02-14", rating: 66, colors: ["#a8e6cf", "#3d84a8"] },
  { id: 10, title: "Titan Fist Arena",       price: 1199, oldPrice: 1599, genre: "Файтинг",   stock: "in",       condition: "used", lang: "en", age: 16, release: "2024-09-09", rating: 72, colors: ["#ff9f1c", "#2b2d42"] },
  { id: 11, title: "Lost Signal",            price: 2299, oldPrice: null, genre: "Пригоди",   stock: "in",       condition: "new",  lang: "ua", age: 16, release: "2026-09-01", rating: 90, colors: ["#5f0f40", "#fb8b24"] },
  { id: 12, title: "Mech Legion Tactics",    price: 1699, oldPrice: null, genre: "Стратегія", stock: "out",      condition: "new",  lang: "en", age: 12, release: "2025-08-22", rating: 63, colors: ["#264653", "#e9c46a"] },
  { id: 13, title: "Skyline Skater",         price: 1399, oldPrice: 1799, genre: "Спорт",     stock: "in",       condition: "new",  lang: "en", age: 7,  release: "2025-04-11", rating: 70, colors: ["#8338ec", "#3a86ff"] },
  { id: 14, title: "Wolfborn Saga",          price: 1599, oldPrice: null, genre: "Екшн",      stock: "in",       condition: "used", lang: "ua", age: 18, release: "2025-01-28", rating: 85, colors: ["#3c1518", "#d58936"] },
  { id: 15, title: "Little Lantern",         price: 699,  oldPrice: 999,  genre: "Інді",      stock: "in",       condition: "new",  lang: "ua", age: 7,  release: "2024-12-03", rating: 68, colors: ["#ffd166", "#073b4c"] },
  { id: 16, title: "Deep Core Rescue",       price: 2199, oldPrice: null, genre: "Шутер",     stock: "in",       condition: "new",  lang: "ua", age: 16, release: "2026-07-25", rating: 83, colors: ["#003049", "#f77f00"] },
  { id: 17, title: "Moonlit Detective",      price: 1499, oldPrice: null, genre: "Пригоди",   stock: "in",       condition: "new",  lang: "ua", age: 12, release: "2026-02-19", rating: 77, colors: ["#22223b", "#c9ada7"] },
  { id: 18, title: "Hollow Crown",           price: 2999, oldPrice: null, genre: "RPG",       stock: "preorder", condition: "new",  lang: "en", age: 18, release: "2027-03-28", rating: 88, colors: ["#540b0e", "#e09f3e"] },
  { id: 19, title: "Turbo Kart Mayhem",      price: 1099, oldPrice: null, genre: "Перегони",  stock: "in",       condition: "used", lang: "ua", age: 3,  release: "2024-10-15", rating: 75, colors: ["#e63946", "#f1faee"] },
  { id: 20, title: "Frostbound",             price: 1899, oldPrice: 2399, genre: "Хорор",     stock: "in",       condition: "new",  lang: "ua", age: 18, release: "2026-01-30", rating: 80, colors: ["#caf0f8", "#03045e"] },
  { id: 21, title: "City of Gears",          price: 1299, oldPrice: null, genre: "Стратегія", stock: "in",       condition: "new",  lang: "ua", age: 7,  release: "2025-10-07", rating: 71, colors: ["#6b4226", "#d9a441"] },
  { id: 22, title: "Rhythm Rebels",          price: 999,  oldPrice: 1299, genre: "Сімейні",   stock: "in",       condition: "new",  lang: "en", age: 3,  release: "2025-06-06", rating: 64, colors: ["#f72585", "#4cc9f0"] },
  { id: 23, title: "Blade of Ronin",         price: 1799, oldPrice: null, genre: "Файтинг",   stock: "in",       condition: "new",  lang: "ua", age: 18, release: "2026-04-24", rating: 84, colors: ["#1a1a1d", "#c3073f"] },
  { id: 24, title: "Orbit Station Zero",     price: 2399, oldPrice: null, genre: "Пригоди",   stock: "in",       condition: "new",  lang: "en", age: 12, release: "2026-11-03", rating: 86, colors: ["#0b132b", "#5bc0be"] }
];
