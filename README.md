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
404.html                    없는 주소로 들어왔을 때 'NO SIGNAL' 화면 (스타일 내장, 절대 주소 사용)
assets/css/main.css         디자인 토큰(색상·서체·간격)과 전체 스타일
assets/js/main.js           메뉴, 타임코드, 등장 효과, 미리보기, YouTube 연결
assets/img/                 프로필·파비콘·확인서(개인정보 비공개 처리본)·공유 이미지(og-image.png)
assets/vendor/              Bootstrap Icons
```

모든 페이지는 같은 틀(상단 바 · 사이드바 · 본문 · 푸터)을 공유합니다. (404.html은 따로 독립된 파일)
사이드바나 푸터를 고칠 때는 7개 HTML 파일을 함께 수정해야 합니다.

## 콘텐츠 넣는 방법

- **작업 공개 원칙**: 결과물(영상·이미지)이 있는 작업만 링크로 공개하고, 나머지는 '준비 중'으로 둡니다.
  공개 상태를 바꾸면 Works 상단 숫자(`공개 02 · 준비 중 04`)와 상세 페이지의 이전/다음 링크도 함께 맞춥니다. 방법은 `index.html` Works 주석 참고.
- **영상 (YouTube)**: 영상 ID(11자)를 두 곳에 넣습니다.
  - `index.html` 목록: `.work-thumb` 안의 `<img src="https://i.ytimg.com/vi/영상ID/sddefault.jpg">` — 항상 보이는 썸네일
  - 상세 페이지의 `.media-frame` → `data-youtube-id`: 클릭하면 재생되는 플레이어 (썸네일은 가장 큰 해상도부터 자동 선택)
  - YouTube에서 '공개' 또는 '일부 공개'여야 재생됩니다.
- **디자인 이미지**
  - `index.html` 목록: 행을 링크 구조로 바꾸고 `.work-thumb`에 `<img src="assets/img/works/파일명.jpg" alt="">`
  - 상세 페이지: `.media-placeholder`를 `<img src="assets/img/works/파일명.jpg" alt="설명">`으로 바꿉니다.
- **대표작 · 쇼릴 (Home)**: `#home`의 `data-showreel-id`·`data-showreel-title`에 넣은 영상이 '대표작 재생' 버튼으로 바로 재생됩니다. 지금은 V01.
  모니터 배경은 `.hero-media`의 `<img>`(대표작 장면)입니다. 쇼릴이 완성되면 ID·제목·버튼 문구·배경 이미지를 함께 바꿉니다.
- **상세 설명**: 상세 페이지의 각 항목(개요 → 담당 → 목적 → 제작 판단 → 과정 → AI 활용 → 회고)을 채우고 `hidden`을 지우면 나타납니다.
  하나라도 나타나면 '정리하고 있습니다' 안내는 자동으로 사라집니다. 실제로 하지 않은 과정이나 성과는 쓰지 않습니다.
- **페이지 전환**: 목록의 작업 이름(`.work-name`)과 상세 페이지 제목(`h1`)에 같은 `view-transition-name`(예: `work-v01`)이 있어 이름이 이어지듯 옮겨 갑니다.
  V03을 공개하거나 작업을 추가할 때는 두 곳에 같은 이름(`work-v03` 등)을 붙입니다. 페이지마다 이름이 겹치면 안 됩니다.
- **엔딩 크레딧 (Contact)**: 연락처 아래 `.credits-line`의 역할 목록(`.credits-roles`)을 고치면 됩니다.
- **공유 미리보기 (OG)**: 모든 페이지의 `<head>`에 `og:*` 태그가 있습니다. 링크를 카카오톡·메일·SNS에 붙이면 `assets/img/og-image.png`(1200×630)가 썸네일로 표시됩니다.
  - `og:url`과 `og:image`는 배포 주소(`https://wilhelmraum.github.io/portfolio_lym/`) 기준의 절대 주소입니다. 주소가 바뀌면 7개 파일을 함께 고칩니다.
  - 작업 영상이 생기면 상세 페이지의 `og:image`를 해당 작업의 대표 이미지로 바꾸면 더 좋습니다.
  - 카카오톡은 미리보기를 오래 저장해 둡니다. 이미지를 바꾼 뒤에는 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화합니다.

## 타임코드 콘셉트

사이트 전체를 한 편의 60초 영상으로 보고, 사이드바를 편집 타임라인처럼 표시합니다.
메뉴의 `data-in`(초)이 각 섹션의 시작 타임코드이며, 스크롤에 따라 재생 헤드와 타임코드(24fps)가 움직입니다.
상세 페이지에서는 스크롤해도 움직이지 않고 Works 시작 지점(00:00:08:00)에 고정됩니다.
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
