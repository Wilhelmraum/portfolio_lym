# portfolio_lym

이영민(YEONGMIN LEE) — Video Editing & Content Design 포트폴리오.
정적 HTML/CSS/JS로 만든 사이트이며 GitHub Pages로 배포합니다.

## 구조

```
index.html                  HOME · WORKS · ABOUT · SKILLS & BACKGROUND · CONTACT
portfolio-details-1.html    V01 동백커피 홍보영상
portfolio-details-2.html    V02 운무산맥 제품 광고영상
portfolio-details-3.html    V03 브랜드 스토리텔링 광고영상 (완성 후 공개)
portfolio-details-4.html    D01 캐릭터 디자인
portfolio-details-5.html    D02 Figma 앱 UI 디자인
portfolio-details-6.html    D03 제품 상세페이지 디자인
assets/css/main.css         디자인 토큰(색상·서체) + 전체 스타일
assets/js/main.js           사이드바, 스크롤 위치 표시, YouTube 연결
```

## 콘텐츠 넣는 방법

- **영상 (YouTube)**: `.media-frame` 의 `data-youtube-id=""` 에 영상 ID(11자)를 넣습니다.
  - `index.html` 카드: 썸네일이 자동 표시됩니다.
  - 상세 페이지: 클릭하면 재생되는 플레이어가 표시됩니다.
- **쇼릴**: `index.html` 의 `#home` 에 있는 `data-showreel-id` 에 ID를 넣으면 'Showreel 재생' 버튼이 나타납니다.
  배경 루프 영상은 `.hero-media` 안의 `<video>` 주석을 해제해 사용합니다(짧고 가벼운 파일 권장).
- **이미지**: `.media-placeholder` 를 `<img src="assets/img/works/파일명.jpg" alt="설명">` 로 교체합니다.
- **상세 설명**: 각 상세 페이지의 `<!-- TODO -->` 아래 '내용 작성 예정' 문단을 교체합니다.

## 주의

- 파일·폴더 이름은 영문 소문자와 하이픈을 사용합니다. (GitHub Pages는 대소문자를 구분합니다)
- 개인정보가 담긴 원본 문서는 올리지 않습니다. `.gitignore` 참고.

## 저작권

© 2026 이영민 (Yeongmin Lee). All rights reserved.

이 저장소와 사이트에 포함된 작업물(영상·이미지·디자인), 사진, 글의 저작권은 이영민에게 있으며,
사전 동의 없이 복제·수정·배포하거나 다른 용도로 사용할 수 없습니다.
클라이언트 작업물의 권리는 각 의뢰처와의 약정을 따릅니다.

## 사용한 오픈소스

각 라이브러리는 해당 라이선스를 따르며, 저작권 표기는 각 파일에 포함되어 있습니다.

| 이름 | 용도 | 라이선스 |
|---|---|---|
| [Bootstrap](https://getbootstrap.com/) 5 | 기본 스타일·그리드 | MIT |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 아이콘 | MIT |
| [AOS](https://github.com/michalsnik/aos) | 스크롤 등장 효과 | MIT |
| [Pretendard](https://github.com/orioncactus/pretendard) | 서체 (jsDelivr CDN) | SIL OFL 1.1 |
