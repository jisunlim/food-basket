import * as Sharing from 'expo-sharing';
import { CartItemGroup, INGREDIENT_CATEGORIES, IngredientCategory } from '../types';

/**
 * 장바구니 아이템을 텍스트 형식으로 변환
 */
export const formatCartAsText = (cartItems: CartItemGroup[]): string => {
  if (cartItems.length === 0) {
    return '장바구니가 비어있습니다.';
  }

  let text = '[장보기 목록]\n\n';

  // 카테고리별로 그룹화
  const categoryMap = new Map<IngredientCategory, CartItemGroup[]>();
  
  cartItems.forEach((item) => {
    const category = item.ingredient.category || 'others';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(item);
  });

  // 카테고리 순서대로 출력
  const categoryOrder: IngredientCategory[] = [
    'meat',
    'seafood',
    'vegetables',
    'fruits',
    'dairy',
    'grains',
    'sauces',
    'seasonings',
    'processed',
    'others',
  ];

  categoryOrder.forEach((category) => {
    const items = categoryMap.get(category);
    if (items && items.length > 0) {
      text += `【${INGREDIENT_CATEGORIES[category]}】\n`;
      
      items.forEach((group) => {
        const { ingredient, totalAmount } = group;
        text += `• ${ingredient.name} ${totalAmount}${ingredient.unit}\n`;
      });
      
      text += '\n';
    }
  });

  return text.trim();
};

/**
 * 장바구니를 텍스트로 공유
 */
export const shareCartAsText = async (cartItems: CartItemGroup[]): Promise<boolean> => {
  try {
    const text = formatCartAsText(cartItems);
    
    // 공유 가능 여부 확인
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.error('공유 기능을 사용할 수 없습니다.');
      return false;
    }

    // 임시 파일로 저장하지 않고 직접 공유
    // (실제로는 파일 시스템에 저장 후 공유해야 함)
    console.log('공유할 텍스트:', text);
    
    // TODO: FileSystem을 사용하여 임시 파일 생성 후 공유
    // const fileUri = await FileSystem.writeAsStringAsync(...);
    // await Sharing.shareAsync(fileUri);
    
    return true;
  } catch (error) {
    console.error('공유 오류:', error);
    return false;
  }
};

