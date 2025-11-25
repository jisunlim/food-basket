# FoodBasket 🛒

요리로부터 식재료 목록을 추출하여 장보기를 간편하게 만드는 크로스 플랫폼 모바일 앱

## 📱 앱 개요

FoodBasket은 요리 레시피를 관리하고, 필요한 식재료를 자동으로 장바구니에 담아 공유할 수 있는 앱입니다. 여러 요리를 선택하면 필요한 재료를 한눈에 보고, 카카오톡으로 공유하여 편리하게 장을 볼 수 있습니다.

## ✨ 주요 기능

### 1. 요리 관리
- ✅ 요리 등록 및 수정
- ✅ 필수 재료 / 선택 재료 구분
- ✅ n인분 설정 및 자동 재료 계산
- ✅ 즐겨찾기 기능
- ✅ 요리 과정 메모
- ✅ 태그 시스템 (분류 및 필터링)

### 2. 필터링 및 검색
- ✅ 특정 식재료를 사용하는 요리 검색
- ✅ 태그 기반 필터링
- ✅ 즐겨찾기 요리만 보기

### 3. 스마트 추천
- ✅ 장바구니 재료 기반 요리 추천
- ✅ 필수 재료가 최대 2개까지만 부족한 요리 추천
- ✅ 재료 겹침률 표시

### 4. 장바구니
- ✅ 요리별 재료 자동 추가
- ✅ 재료별 그룹화 및 사용처 표시
- ✅ 재료-요리 매핑 테이블 뷰
- ✅ 텍스트 형식으로 공유 (카카오톡 등)

## 🛠 기술 스택

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Navigation**: React Navigation
- **Platform**: iOS / Android

## 📂 프로젝트 구조

```
food-basket/
├── src/
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── screens/         # 화면 컴포넌트
│   ├── navigation/      # 네비게이션 설정
│   ├── database/        # SQLite 스키마 및 쿼리
│   ├── hooks/           # 커스텀 훅
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 유틸리티 함수
│   └── constants/       # 상수 정의
├── assets/              # 이미지, 폰트 등
├── app.json             # Expo 설정
└── package.json         # 패키지 의존성
```

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js (v18 이상)
- npm 또는 yarn
- Expo Go 앱 (iOS/Android 실기기 테스트용)
- Xcode (iOS 개발 시) 또는 Android Studio (Android 개발 시)

### 설치

```bash
# 저장소 클론
git clone https://github.com/jisunlim/food-basket.git
cd food-basket

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 실행

```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web

# Expo Go로 실기기 테스트
npm start
# QR 코드를 Expo Go 앱으로 스캔
```

## 📊 데이터베이스 스키마

- **recipes**: 요리 정보 (이름, 인분, 즐겨찾기, 요리과정)
- **ingredients**: 식재료 마스터 (이름, 단위)
- **recipe_ingredients**: 요리-재료 연결 (양, 필수/선택 여부)
- **recipe_tags**: 요리-태그 연결
- **cart_items**: 장바구니 아이템

## 🔮 향후 계획 (백로그)

### UI/UX 개선
- 다크 모드 지원
- 애니메이션 및 트랜지션 개선
- 레시피 이미지 추가 기능
- 필터링 기능 재구현 (재료/태그 필터)

### 보유 재료 관리
- 냉장고 재고 관리 (유통기한 알림)
- 보유 재료 기반 추천 시스템
- 재료 소진 추적

### 고급 기능
- 요리 타이머 통합
- 요리 평가 및 메모 기능
- 주간/월간 식단 계획
- 영양 정보 자동 계산
- 알레르기 정보 필터링

### 클라우드 및 동기화
- 아이클라우드 백업/동기화 (iOS)
- Google Drive 백업 (Android)
- 계정 시스템 및 크로스 디바이스 동기화

### 레시피 마켓플레이스
- 백엔드 API 서버 구축
- 사용자 간 레시피 공유 및 거래
- 레시피 업로드/다운로드 기능
- 결제 시스템 통합
- 레시피 평점 및 리뷰 시스템

### 기타 아이디어
- 음성 입력으로 레시피 등록
- OCR을 통한 레시피 스캔
- 다국어 지원
- 소셜 기능 (친구와 레시피 공유)
- 요리 영상 튜토리얼 링크 연동

## 📄 라이선스

MIT License

## 👥 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📞 문의

- GitHub: [@jisunlim](https://github.com/jisunlim)
- Repository: [food-basket](https://github.com/jisunlim/food-basket)

