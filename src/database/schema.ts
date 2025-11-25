import * as SQLite from 'expo-sqlite';

// 데이터베이스 초기화 및 스키마 생성
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync('foodbasket.db');

  // 요리 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      servings INTEGER NOT NULL DEFAULT 1,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      instructions TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 식재료 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'others'
    );
  `);

  // 요리-재료 연결 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      ingredient_id TEXT NOT NULL,
      amount REAL NOT NULL,
      is_required INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
      UNIQUE(recipe_id, ingredient_id)
    );
  `);

  // 요리 태그 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_tags (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  // 장바구니 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      ingredient_id TEXT NOT NULL,
      amount REAL NOT NULL,
      servings INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );
  `);

  // 인덱스 생성 (성능 최적화)
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe 
    ON recipe_ingredients(recipe_id);
    
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient 
    ON recipe_ingredients(ingredient_id);
    
    CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe 
    ON recipe_tags(recipe_id);
    
    CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag 
    ON recipe_tags(tag);
    
    CREATE INDEX IF NOT EXISTS idx_cart_items_recipe 
    ON cart_items(recipe_id);
    
    CREATE INDEX IF NOT EXISTS idx_cart_items_ingredient 
    ON cart_items(ingredient_id);
    
    CREATE INDEX IF NOT EXISTS idx_recipes_favorite 
    ON recipes(is_favorite);
  `);

  return db;
};

// 데이터베이스 초기화 (개발용 샘플 데이터)
export const seedDatabase = async (db: SQLite.SQLiteDatabase) => {
  // 샘플 식재료
  const sampleIngredients = [
    { id: '1', name: '돼지고기', unit: 'g', category: 'meat' },
    { id: '2', name: '김치', unit: 'g', category: 'vegetables' },
    { id: '3', name: '두부', unit: '모', category: 'processed' },
    { id: '4', name: '파', unit: '뿌리', category: 'vegetables' },
    { id: '5', name: '양파', unit: '개', category: 'vegetables' },
    { id: '6', name: '간장', unit: 'ml', category: 'sauces' },
    { id: '7', name: '설탕', unit: 'g', category: 'seasonings' },
    { id: '8', name: '참기름', unit: 'ml', category: 'sauces' },
    { id: '9', name: '계란', unit: '개', category: 'dairy' },
    { id: '10', name: '밥', unit: 'g', category: 'grains' },
    { id: '11', name: '당근', unit: '개', category: 'vegetables' },
    { id: '12', name: '소금', unit: 'g', category: 'seasonings' },
    { id: '13', name: '후추', unit: 'g', category: 'seasonings' },
    { id: '14', name: '마늘', unit: '쪽', category: 'vegetables' },
    { id: '15', name: '고추장', unit: 'g', category: 'sauces' },
    { id: '16', name: '된장', unit: 'g', category: 'sauces' },
    { id: '17', name: '감자', unit: '개', category: 'vegetables' },
    { id: '18', name: '애호박', unit: '개', category: 'vegetables' },
    { id: '19', name: '청양고추', unit: '개', category: 'vegetables' },
    { id: '20', name: '닭고기', unit: 'g', category: 'meat' },
    { id: '21', name: '고춧가루', unit: 'g', category: 'seasonings' },
    { id: '22', name: '물엿', unit: 'ml', category: 'seasonings' },
    { id: '23', name: '생강', unit: 'g', category: 'seasonings' },
    { id: '24', name: '쌀', unit: 'g', category: 'grains' },
    { id: '25', name: '참치캔', unit: '캔', category: 'processed' },
    { id: '26', name: '마요네즈', unit: 'g', category: 'sauces' },
    { id: '27', name: '식빵', unit: '장', category: 'grains' },
    { id: '28', name: '버터', unit: 'g', category: 'dairy' },
  ];

  for (const ingredient of sampleIngredients) {
    await db.runAsync(
      'INSERT OR IGNORE INTO ingredients (id, name, unit, category) VALUES (?, ?, ?, ?)',
      [ingredient.id, ingredient.name, ingredient.unit, ingredient.category]
    );
  }

  const now = new Date().toISOString();

  // 레시피 1: 김치찌개
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe1', '김치찌개', 2, 1, '1. 냄비에 돼지고기와 김치를 넣고 볶는다.\n2. 물을 붓고 두부를 넣는다.\n3. 간장으로 간을 맞춘다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri1', 'recipe1', '1', 200, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri2', 'recipe1', '2', 300, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri3', 'recipe1', '3', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri4', 'recipe1', '4', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag1', 'recipe1', '한식']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag2', 'recipe1', '찌개']);

  // 레시피 2: 김치볶음밥
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe2', '김치볶음밥', 1, 0, '1. 팬에 김치와 밥을 넣고 볶는다.\n2. 간장과 참기름으로 간을 맞춘다.\n3. 계란 후라이를 올린다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri5', 'recipe2', '2', 150, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri6', 'recipe2', '10', 200, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri7', 'recipe2', '9', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri8', 'recipe2', '6', 10, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri9', 'recipe2', '8', 5, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag3', 'recipe2', '한식']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag4', 'recipe2', '볶음밥']);

  // 레시피 3: 된장찌개
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe3', '된장찌개', 2, 1, '1. 냄비에 물을 끓인다.\n2. 된장을 풀고 두부, 감자, 애호박을 넣는다.\n3. 파와 청양고추를 넣고 끓인다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri10', 'recipe3', '16', 50, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri11', 'recipe3', '3', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri12', 'recipe3', '17', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri13', 'recipe3', '18', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri14', 'recipe3', '4', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri15', 'recipe3', '19', 2, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag5', 'recipe3', '한식']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag6', 'recipe3', '찌개']);

  // 레시피 4: 닭볶음탕
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe4', '닭볶음탕', 3, 0, '1. 닭고기를 양념에 재운다.\n2. 감자, 당근, 양파를 넣고 볶는다.\n3. 물을 붓고 조린다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri16', 'recipe4', '20', 500, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri17', 'recipe4', '17', 2, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri18', 'recipe4', '11', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri19', 'recipe4', '5', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri20', 'recipe4', '6', 30, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri21', 'recipe4', '21', 20, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri22', 'recipe4', '14', 5, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag7', 'recipe4', '한식']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag8', 'recipe4', '매운맛']);

  // 레시피 5: 계란말이
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe5', '계란말이', 1, 0, '1. 계란을 풀고 소금으로 간한다.\n2. 팬에 기름을 두르고 계란을 부어 말아준다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri23', 'recipe5', '9', 3, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri24', 'recipe5', '12', 2, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri25', 'recipe5', '4', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag9', 'recipe5', '반찬']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag10', 'recipe5', '간단']);

  // 레시피 6: 참치마요덮밥
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe6', '참치마요덮밥', 1, 0, '1. 참치를 기름을 빼고 마요네즈와 섞는다.\n2. 밥 위에 올린다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri26', 'recipe6', '25', 1, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri27', 'recipe6', '26', 30, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri28', 'recipe6', '10', 200, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri29', 'recipe6', '4', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag11', 'recipe6', '간단']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag12', 'recipe6', '한그릇']);

  // 레시피 7: 마늘빵
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe7', '마늘빵', 2, 1, '1. 버터에 다진 마늘을 섞는다.\n2. 식빵에 발라 오븐에 굽는다.', now, now]
  );
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri30', 'recipe7', '27', 4, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri31', 'recipe7', '28', 50, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri32', 'recipe7', '14', 3, 1]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)', ['ri33', 'recipe7', '4', 1, 0]);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag13', 'recipe7', '간식']);
  await db.runAsync('INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)', ['tag14', 'recipe7', '간단']);
};

