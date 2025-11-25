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
      unit TEXT NOT NULL
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
    { id: '1', name: '돼지고기', unit: 'g' },
    { id: '2', name: '김치', unit: 'g' },
    { id: '3', name: '두부', unit: '모' },
    { id: '4', name: '파', unit: '뿌리' },
    { id: '5', name: '양파', unit: '개' },
    { id: '6', name: '간장', unit: 'ml' },
    { id: '7', name: '설탕', unit: 'g' },
    { id: '8', name: '참기름', unit: 'ml' },
  ];

  for (const ingredient of sampleIngredients) {
    await db.runAsync(
      'INSERT OR IGNORE INTO ingredients (id, name, unit) VALUES (?, ?, ?)',
      [ingredient.id, ingredient.name, ingredient.unit]
    );
  }

  // 샘플 요리
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT OR IGNORE INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['recipe1', '김치찌개', 2, 1, '1. 냄비에 돼지고기와 김치를 넣고 볶는다.\n2. 물을 붓고 두부를 넣는다.\n3. 간장으로 간을 맞춘다.', now, now]
  );

  // 샘플 요리-재료 연결
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
    ['ri1', 'recipe1', '1', 200, 1]
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
    ['ri2', 'recipe1', '2', 300, 1]
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
    ['ri3', 'recipe1', '3', 1, 1]
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
    ['ri4', 'recipe1', '4', 1, 0]
  );

  // 샘플 태그
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)',
    ['tag1', 'recipe1', '한식']
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)',
    ['tag2', 'recipe1', '찌개']
  );
};

