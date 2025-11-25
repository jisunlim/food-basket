import * as SQLite from 'expo-sqlite';
import {
  Recipe,
  Ingredient,
  RecipeIngredient,
  RecipeTag,
  CartItem,
  RecipeDetail,
  CartItemGroup,
  RecipeRecommendation,
} from '../types';

// UUID 생성 함수
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ===== 요리 관련 함수 =====

export const getRecipes = async (
  db: SQLite.SQLiteDatabase,
  filters?: { tag?: string; ingredientId?: string; isFavorite?: boolean }
): Promise<Recipe[]> => {
  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params: any[] = [];

  if (filters?.isFavorite !== undefined) {
    query += ' AND is_favorite = ?';
    params.push(filters.isFavorite ? 1 : 0);
  }

  if (filters?.tag) {
    query += ' AND id IN (SELECT recipe_id FROM recipe_tags WHERE tag = ?)';
    params.push(filters.tag);
  }

  if (filters?.ingredientId) {
    query +=
      ' AND id IN (SELECT recipe_id FROM recipe_ingredients WHERE ingredient_id = ?)';
    params.push(filters.ingredientId);
  }

  query += ' ORDER BY is_favorite DESC, updated_at DESC';

  const result = await db.getAllAsync<any>(query, params);
  return result.map(dbRowToRecipe);
};

export const getRecipeById = async (
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<RecipeDetail | null> => {
  const recipeRow = await db.getFirstAsync<any>(
    'SELECT * FROM recipes WHERE id = ?',
    [id]
  );

  if (!recipeRow) return null;

  const recipe = dbRowToRecipe(recipeRow);

  // 재료 조회
  const ingredientRows = await db.getAllAsync<any>(
    `SELECT ri.*, i.name, i.unit 
     FROM recipe_ingredients ri 
     JOIN ingredients i ON ri.ingredient_id = i.id 
     WHERE ri.recipe_id = ?`,
    [id]
  );

  const ingredients: RecipeIngredient[] = ingredientRows.map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    ingredientId: row.ingredient_id,
    amount: row.amount,
    isRequired: row.is_required === 1,
    ingredient: {
      id: row.ingredient_id,
      name: row.name,
      unit: row.unit,
    },
  }));

  // 태그 조회
  const tagRows = await db.getAllAsync<any>(
    'SELECT * FROM recipe_tags WHERE recipe_id = ?',
    [id]
  );

  const tags: RecipeTag[] = tagRows.map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    tag: row.tag,
  }));

  return {
    ...recipe,
    ingredients,
    tags,
  };
};

export const createRecipe = async (
  db: SQLite.SQLiteDatabase,
  data: {
    name: string;
    servings: number;
    instructions?: string;
    ingredients: { ingredientId: string; amount: number; isRequired: boolean }[];
    tags: string[];
  }
): Promise<string> => {
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO recipes (id, name, servings, is_favorite, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.servings, 0, data.instructions || '', now, now]
  );

  // 재료 추가
  for (const ingredient of data.ingredients) {
    const riId = generateId();
    await db.runAsync(
      'INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
      [
        riId,
        id,
        ingredient.ingredientId,
        ingredient.amount,
        ingredient.isRequired ? 1 : 0,
      ]
    );
  }

  // 태그 추가
  for (const tag of data.tags) {
    const tagId = generateId();
    await db.runAsync(
      'INSERT INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)',
      [tagId, id, tag]
    );
  }

  return id;
};

export const updateRecipe = async (
  db: SQLite.SQLiteDatabase,
  id: string,
  data: {
    name?: string;
    servings?: number;
    instructions?: string;
    isFavorite?: boolean;
    ingredients?: { ingredientId: string; amount: number; isRequired: boolean }[];
    tags?: string[];
  }
): Promise<void> => {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.servings !== undefined) {
    updates.push('servings = ?');
    params.push(data.servings);
  }
  if (data.instructions !== undefined) {
    updates.push('instructions = ?');
    params.push(data.instructions);
  }
  if (data.isFavorite !== undefined) {
    updates.push('is_favorite = ?');
    params.push(data.isFavorite ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await db.runAsync(
      `UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // 재료 업데이트
  if (data.ingredients) {
    await db.runAsync('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
    for (const ingredient of data.ingredients) {
      const riId = generateId();
      await db.runAsync(
        'INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, amount, is_required) VALUES (?, ?, ?, ?, ?)',
        [
          riId,
          id,
          ingredient.ingredientId,
          ingredient.amount,
          ingredient.isRequired ? 1 : 0,
        ]
      );
    }
  }

  // 태그 업데이트
  if (data.tags) {
    await db.runAsync('DELETE FROM recipe_tags WHERE recipe_id = ?', [id]);
    for (const tag of data.tags) {
      const tagId = generateId();
      await db.runAsync(
        'INSERT INTO recipe_tags (id, recipe_id, tag) VALUES (?, ?, ?)',
        [tagId, id, tag]
      );
    }
  }
};

export const deleteRecipe = async (
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<void> => {
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
};

// ===== 식재료 관련 함수 =====

export const getIngredients = async (
  db: SQLite.SQLiteDatabase
): Promise<Ingredient[]> => {
  const result = await db.getAllAsync<any>('SELECT * FROM ingredients ORDER BY name');
  return result.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
  }));
};

export const createIngredient = async (
  db: SQLite.SQLiteDatabase,
  data: { name: string; unit: string }
): Promise<string> => {
  const id = generateId();
  await db.runAsync(
    'INSERT INTO ingredients (id, name, unit) VALUES (?, ?, ?)',
    [id, data.name, data.unit]
  );
  return id;
};

// ===== 장바구니 관련 함수 =====

export const addToCart = async (
  db: SQLite.SQLiteDatabase,
  recipeId: string,
  servings: number
): Promise<void> => {
  const recipe = await getRecipeById(db, recipeId);
  if (!recipe) throw new Error('Recipe not found');

  const multiplier = servings / recipe.servings;
  const now = new Date().toISOString();

  for (const ingredient of recipe.ingredients) {
    const id = generateId();
    await db.runAsync(
      'INSERT INTO cart_items (id, recipe_id, ingredient_id, amount, servings, added_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        recipeId,
        ingredient.ingredientId,
        ingredient.amount * multiplier,
        servings,
        now,
      ]
    );
  }
};

export const getCartItems = async (
  db: SQLite.SQLiteDatabase
): Promise<CartItemGroup[]> => {
  const rows = await db.getAllAsync<any>(
    `SELECT 
      ci.*,
      i.name as ingredient_name,
      i.unit as ingredient_unit,
      r.name as recipe_name
     FROM cart_items ci
     JOIN ingredients i ON ci.ingredient_id = i.id
     JOIN recipes r ON ci.recipe_id = r.id
     ORDER BY i.name`
  );

  // 재료별로 그룹화
  const groupMap = new Map<string, CartItemGroup>();

  for (const row of rows) {
    const ingredientId = row.ingredient_id;

    if (!groupMap.has(ingredientId)) {
      groupMap.set(ingredientId, {
        ingredient: {
          id: ingredientId,
          name: row.ingredient_name,
          unit: row.ingredient_unit,
        },
        totalAmount: 0,
        recipes: [],
      });
    }

    const group = groupMap.get(ingredientId)!;
    group.totalAmount += row.amount;
    group.recipes.push({
      recipe: {
        id: row.recipe_id,
        name: row.recipe_name,
        servings: row.servings,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      amount: row.amount,
      servings: row.servings,
    });
  }

  return Array.from(groupMap.values());
};

export const clearCart = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.runAsync('DELETE FROM cart_items');
};

export const removeCartItemsByRecipe = async (
  db: SQLite.SQLiteDatabase,
  recipeId: string
): Promise<void> => {
  await db.runAsync('DELETE FROM cart_items WHERE recipe_id = ?', [recipeId]);
};

// ===== 추천 시스템 =====

export const getRecommendations = async (
  db: SQLite.SQLiteDatabase
): Promise<RecipeRecommendation[]> => {
  // 장바구니에 있는 재료 ID 조회
  const cartIngredients = await db.getAllAsync<any>(
    'SELECT DISTINCT ingredient_id FROM cart_items'
  );
  const cartIngredientIds = cartIngredients.map((row) => row.ingredient_id);

  if (cartIngredientIds.length === 0) return [];

  // 모든 요리 조회
  const recipes = await getRecipes(db);
  const recommendations: RecipeRecommendation[] = [];

  for (const recipe of recipes) {
    const detail = await getRecipeById(db, recipe.id);
    if (!detail) continue;

    const requiredIngredients = detail.ingredients.filter((i) => i.isRequired);
    const missingRequired = requiredIngredients.filter(
      (i) => !cartIngredientIds.includes(i.ingredientId)
    );

    // 필수 재료가 최대 2개까지만 부족한 경우
    if (missingRequired.length <= 2) {
      const matchingCount = detail.ingredients.filter((i) =>
        cartIngredientIds.includes(i.ingredientId)
      ).length;

      recommendations.push({
        recipe: detail,
        missingRequiredCount: missingRequired.length,
        matchingIngredientCount: matchingCount,
      });
    }
  }

  // 부족한 재료가 적고, 겹치는 재료가 많은 순으로 정렬
  recommendations.sort((a, b) => {
    if (a.missingRequiredCount !== b.missingRequiredCount) {
      return a.missingRequiredCount - b.missingRequiredCount;
    }
    return b.matchingIngredientCount - a.matchingIngredientCount;
  });

  return recommendations;
};

// ===== 태그 관련 함수 =====

export const getAllTags = async (db: SQLite.SQLiteDatabase): Promise<string[]> => {
  const result = await db.getAllAsync<any>(
    'SELECT DISTINCT tag FROM recipe_tags ORDER BY tag'
  );
  return result.map((row) => row.tag);
};

// ===== 유틸리티 함수 =====

const dbRowToRecipe = (row: any): Recipe => ({
  id: row.id,
  name: row.name,
  servings: row.servings,
  isFavorite: row.is_favorite === 1,
  instructions: row.instructions,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

