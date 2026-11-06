# portfolio_lym

이영민(Yeongmin Lee) — Video Editing & Content Design 포트폴리오.
빌드 도구 없이 HTML·CSS·JavaScript만으로 만든 정적 사이트이며, GitHub Pages로 배포합니다.

## 구조

```
index.html                  HOME · WORKS · ABOUT · SKILLS & BACKGROUND · CONTACT
portfolio-details-1.html    V01 동백커피 홍보영상
portfolio-details-2.html    V02 운무산맥 제품 광고영상
portfolio-details-3.html    V03 브랜드 스토리텔링 광고영상 (완성 후 공개)
portfolio-details-4.html    D01 캐릭터 디자인
portfolio-details-5.html    D02 Figma 앱 UI 디자인
portfolio-details-6.html    D03 제품 상세페이지 디자인
assets/css/main.css         디자인 토큰(색상·서체·간격)과 전체 스타일
assets/js/main.js           메뉴, 타임코드, 등장 효과, 미리보기, YouTube 연결
assets/img/                 프로필·파비콘·확인서(개인정보 비공개 처리본)·공유 이미지(og-image.png)
assets/vendor/              Bootstrap Icons
```

모든 페이지는 같은 틀(상단 바 · 사이드바 · 본문 · 푸터)을 공유합니다.
사이드바나 푸터를 고칠 때는 7개 HTML 파일을 함께 수정해야 합니다.

## 콘텐츠 넣는 방법

- **영상 (YouTube)**: 영상 ID(11자)를 두 곳에 넣습니다.
  - `index.html`의 `.work-row` → `data-youtube-id`: 목록에 마우스를 올리면 썸네일 미리보기가 나타납니다.
  - 상세 페이지의 `.media-frame` → `data-youtube-id`: 클릭하면 재생되는 플레이어가 표시됩니다.
- **디자인 이미지**
  - `index.html`의 `.work-row` → `data-preview-img="assets/img/works/파일명.jpg"`: 목록 미리보기
  - 상세 페이지: `.media-placeholder`를 `<img src="assets/img/works/파일명.jpg" alt="설명">`으로 바꿉니다.
- **쇼릴**: `index.html`의 `#home`에 있는 `data-showreel-id`에 ID를 넣으면 'Showreel' 버튼이 나타납니다.
  배경 루프 영상은 `.hero-media` 안의 `<video>` 주석을 풀어 사용합니다(짧고 가벼운 파일 권장).
- **상세 설명**: 각 상세 페이지의 `<!-- TODO -->` 아래 '내용 작성 예정' 문단을 바꿉니다.
- **엔딩 크레딧 (Contact)**: `index.html`의 `.credits` 안에서 `<div class="credit"><dt>역할</dt><dd>이름</dd></div>` 한 줄이 크레딧 한 줄입니다. 줄을 더하거나 빼도 등장 순서가 자동으로 맞춰집니다.
- **공유 미리보기 (OG)**: 모든 페이지의 `<head>`에 `og:*` 태그가 있습니다. 링크를 카카오톡·메일·SNS에 붙이면 `assets/img/og-image.png`(1200×630)가 썸네일로 표시됩니다.
  - `og:url`과 `og:image`는 배포 주소(`https://wilhelmraum.github.io/portfolio_lym/`) 기준의 절대 주소입니다. 주소가 바뀌면 7개 파일을 함께 고칩니다.
  - 작업 영상이 생기면 상세 페이지의 `og:image`를 해당 작업의 대표 이미지로 바꾸면 더 좋습니다.
  - 카카오톡은 미리보기를 오래 저장해 둡니다. 이미지를 바꾼 뒤에는 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화합니다.

## 타임코드 콘셉트

사이트 전체를 한 편의 60초 영상으로 보고, 사이드바를 편집 타임라인처럼 표시합니다.
메뉴의 `data-in`(초)이 각 섹션의 시작 타임코드이며, 스크롤에 따라 재생 헤드와 타임코드(24fps)가 움직입니다.
Home은 편집 프로그램의 프로그램 모니터처럼 연출합니다(`.monitor`). 하단 재생 바(`data-tc-scrub`)도 같은 타임코드로 움직이고, 섹션 시작 지점 눈금은 `data-in` 값으로 자동 생성됩니다.
섹션을 추가하거나 순서를 바꾸면 `data-in` 값과 각 섹션 제목 위 `.meta-label`의 타임코드를 함께 맞춰 주세요.

## 코드 규칙

**CSS 클래스 이름**

| 종류 | 형식 | 예 |
|---|---|---|
| 블록·요소 | 하이픈으로 연결 | `.work-list`, `.work-row`, `.work-name` |
| 변형 | `--modifier` | `.work-list--design`, `.media-frame--4x3`, `.hero-bar--top` |
| 상태 (JS가 붙이고 뗌) | `is-*`, `has-*` | `.is-active`, `.is-visible`, `.is-revealed`, `.has-reveal` |
| 테마 | `theme-*` + `bg-*` | `class="theme-dark bg-works"` |

- 색상·서체·간격은 `main.css` 맨 위 `:root`의 변수로만 지정합니다. 값을 직접 쓰지 않습니다.
- 섹션은 `theme-dark` 또는 `theme-light` 하나와 `bg-*` 하나를 함께 씁니다.
- 배경색이 바뀌는 섹션에는 `data-wipe`를 붙이고, CSS에서 이전 섹션 색을 `--wipe-from`으로 지정하면 와이프 전환이 적용됩니다. (현재 About)
- 세리프(`--font-serif`, Instrument Serif)는 영문 제목 포인트에만 씁니다. 한글이 없으므로 한글 제목에는 쓰지 않습니다.
- 움직임은 모두 `prefers-reduced-motion: no-preference` 안에서만 동작합니다.

**JavaScript**

- 기능마다 `init*` 함수 하나로 나누고, 파일 맨 아래에서 차례로 실행합니다.
- 각 함수는 필요한 요소가 없으면 바로 끝나므로, 모든 페이지가 같은 `main.js`를 씁니다.
- 스크롤·리사이즈 처리는 `onFrame()`으로 감싸 프레임당 한 번만 실행합니다.

**HTML**

- 들여쓰기는 공백 2칸, 주석은 `<!-- ===== 이름 ===== -->` 형식으로 구역을 나눕니다.
- 아이콘처럼 읽을 필요 없는 요소에는 `aria-hidden="true"`, 아이콘만 있는 버튼에는 `.visually-hidden` 텍스트를 붙입니다.

## 주의

- **CSS·JS를 고친 뒤에는 버전을 올립니다.** 7개 HTML 파일의 `main.css?v=…`, `main.js?v=…` 값을 수정한 날짜(예: `20261106` → `20261120`)로 함께 바꿉니다.
  GitHub Pages는 파일을 최대 10분 동안 캐시하므로, 버전을 바꾸지 않으면 방문자가 새 HTML과 예전 CSS·JS를 섞어서 받을 수 있습니다.
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
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 아이콘 | MIT |
| [Pretendard](https://github.com/orioncactus/pretendard) | 본문 서체 (jsDelivr CDN) | SIL OFL 1.1 |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | 타임코드·보조 정보 서체 (Google Fonts) | SIL OFL 1.1 |
