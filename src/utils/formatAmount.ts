/**
 * 재료 양을 포맷팅하는 유틸리티 함수
 * 자연수인 경우 소숫점 없이, 실수인 경우 소숫점 첫째 자리까지 표시
 */
export const formatAmount = (amount: number): string => {
  if (Number.isInteger(amount)) {
    return amount.toString();
  }
  return amount.toFixed(1);
};

