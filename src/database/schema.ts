import * as SQLite from 'expo-sqlite';

// 데이터베이스 초기화 및 스키마 생성
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync('foodbasket.db');

  // 개발 모드에서만 테이블 재생성 (환경 변수로 제어)
  // 프로덕션에서는 이 부분이 실행되지 않아야 함
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // 개발 중에만 테이블 DROP
    await db.execAsync(`
      DROP TABLE IF EXISTS cart_items;
      DROP TABLE IF EXISTS recipe_tags;
      DROP TABLE IF EXISTS recipe_ingredients;
      DROP TABLE IF EXISTS ingredients;
      DROP TABLE IF EXISTS recipes;
    `);
  }

  // 요리 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'others'
    );
  `);

  // 요리-재료 연결 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  // 장바구니 테이블
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      servings INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      has_at_home INTEGER DEFAULT 0,
      skip_purchase INTEGER DEFAULT 0,
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
  // 이미 데이터가 있는지 확인
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM ingredients'
  );
  
  if (existing && existing.count > 0) {
    return; // 이미 데이터가 있으면 스킵
  }

  // 샘플 식재료
  const sampleIngredients = [
    { name: '돼지고기', unit: 'g', category: 'meat' },
    { name: '김치', unit: 'g', category: 'vegetables' },
    { name: '두부', unit: '모', category: 'processed' },
    { name: '파', unit: '뿌리', category: 'vegetables' },
    { name: '양파', unit: '개', category: 'vegetables' },
    { name: '간장', unit: 'ml', category: 'sauces' },
    { name: '설탕', unit: 'g', category: 'seasonings' },
    { name: '참기름', unit: 'ml', category: 'sauces' },
    { name: '계란', unit: '개', category: 'dairy' },
    { name: '밥', unit: 'g', category: 'grains' },
    { name: '당근', unit: '개', category: 'vegetables' },
    { name: '소금', unit: 'g', category: 'seasonings' },
    { name: '후추', unit: 'g', category: 'seasonings' },
    { name: '마늘', unit: '쪽', category: 'vegetables' },
    { name: '고추장', unit: 'g', category: 'sauces' },
    { name: '된장', unit: 'g', category: 'sauces' },
    { name: '감자', unit: '개', category: 'vegetables' },
    { name: '애호박', unit: '개', category: 'vegetables' },
    { name: '청양고추', unit: '개', category: 'vegetables' },
    { name: '닭고기', unit: 'g', category: 'meat' },
    { name: '고춧가루', unit: 'g', category: 'seasonings' },
    { name: '물엿', unit: 'ml', category: 'seasonings' },
    { name: '생강', unit: 'g', category: 'seasonings' },
    { name: '쌀', unit: 'g', category: 'grains' },
    { name: '참치캔', unit: '캔', category: 'processed' },
    { name: '마요네즈', unit: 'g', category: 'sauces' },
    { name: '식빵', unit: '장', category: 'grains' },
    { name: '버터', unit: 'g', category: 'dairy' },
  ];

  for (const ingredient of sampleIngredients) {
    await db.runAsync(
      'INSERT INTO ingredients (name, unit, category) VALUES (?, ?, ?)',
      [ingredient.name, ingredient.unit, ingredient.category]
    );
  }

  const now = new Date().toISOString();

  // 레시피 1: 김치찌개
  const recipe1Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['김치찌개', 2, 1, '1. 냄비에 돼지고기와 김치를 넣고 볶는다.\n2. 물을 붓고 두부를 넣는다.\n3. 간장으로 간을 맞춘다.', now, now]
  );
  const recipe1Id = recipe1Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe1Id, 1, 200, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe1Id, 2, 300, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe1Id, 3, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe1Id, 4, 1, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe1Id, '한식']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe1Id, '찌개']);

  // 레시피 2: 김치볶음밥
  const recipe2Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['김치볶음밥', 1, 0, '1. 팬에 김치와 밥을 넣고 볶는다.\n2. 간장과 참기름으로 간을 맞춘다.\n3. 계란 후라이를 올린다.', now, now]
  );
  const recipe2Id = recipe2Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe2Id, 2, 150, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe2Id, 10, 200, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe2Id, 9, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe2Id, 6, 10, 0]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe2Id, 8, 5, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe2Id, '한식']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe2Id, '볶음밥']);

  // 레시피 3: 된장찌개
  const recipe3Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['된장찌개', 2, 1, '1. 냄비에 물을 끓인다.\n2. 된장을 풀고 두부, 감자, 애호박을 넣는다.\n3. 파와 청양고추를 넣고 끓인다.', now, now]
  );
  const recipe3Id = recipe3Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 16, 50, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 3, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 17, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 18, 1, 0]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 4, 1, 0]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe3Id, 19, 2, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe3Id, '한식']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe3Id, '찌개']);

  // 레시피 4: 닭볶음탕
  const recipe4Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['닭볶음탕', 3, 0, '1. 닭고기를 양념에 재운다.\n2. 감자, 당근, 양파를 넣고 볶는다.\n3. 물을 붓고 조린다.', now, now]
  );
  const recipe4Id = recipe4Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 20, 500, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 17, 2, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 11, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 5, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 6, 30, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 21, 20, 0]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe4Id, 14, 5, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe4Id, '한식']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe4Id, '매운맛']);

  // 레시피 5: 계란말이
  const recipe5Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['계란말이', 1, 0, '1. 계란을 풀고 소금으로 간한다.\n2. 팬에 기름을 두르고 계란을 부어 말아준다.', now, now]
  );
  const recipe5Id = recipe5Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe5Id, 9, 3, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe5Id, 12, 2, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe5Id, 4, 1, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe5Id, '반찬']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe5Id, '간단']);

  // 레시피 6: 참치마요덮밥
  const recipe6Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['참치마요덮밥', 1, 0, '1. 참치를 기름을 빼고 마요네즈와 섞는다.\n2. 밥 위에 올린다.', now, now]
  );
  const recipe6Id = recipe6Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe6Id, 25, 1, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe6Id, 26, 30, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe6Id, 10, 200, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe6Id, 4, 1, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe6Id, '간단']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe6Id, '한그릇']);

  // 레시피 7: 마늘빵
  const recipe7Result = await db.runAsync(
    'INSERT INTO recipes (name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['마늘빵', 2, 1, '1. 버터에 다진 마늘을 섞는다.\n2. 식빵에 발라 오븐에 굽는다.', now, now]
  );
  const recipe7Id = recipe7Result.lastInsertRowId;
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe7Id, 27, 4, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe7Id, 28, 50, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe7Id, 14, 3, 1]);
  await db.runAsync('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?)', [recipe7Id, 4, 1, 0]);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe7Id, '간식']);
  await db.runAsync('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)', [recipe7Id, '간단']);
};

