const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// 색상
const DARK_NAVY = '#1A1A2E';
const BLUE = '#3B82F6';
const WHITE = '#FFFFFF';

// ─── 아이콘 SVG (1024x1024) ───────────────────────────────────────────────
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="1024" height="1024" rx="220" fill="${DARK_NAVY}"/>

  <!-- 차트 라인 (주식 상승 모양) -->
  <polyline
    points="160,680 300,560 420,610 540,420 660,340 860,200"
    fill="none"
    stroke="${BLUE}"
    stroke-width="52"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- 차트 아래 그라데이션 fill -->
  <defs>
    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon
    points="160,680 300,560 420,610 540,420 660,340 860,200 860,820 160,820"
    fill="url(#chartFill)"
  />

  <!-- Q 텍스트 -->
  <text
    x="512"
    y="920"
    font-family="Arial Black, Arial, sans-serif"
    font-size="100"
    font-weight="900"
    fill="${WHITE}"
    text-anchor="middle"
    opacity="0.9"
  >QuizOn</text>
</svg>
`;

// ─── 스플래시 SVG (1284x2778) ─────────────────────────────────────────────
const splashSvg = `
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="1284" height="2778" fill="${DARK_NAVY}"/>

  <!-- 아이콘 배경 원 -->
  <circle cx="642" cy="1200" r="220" fill="#2D2D44"/>

  <!-- 차트 라인 (작게) -->
  <polyline
    points="490,1290 552,1230 602,1255 660,1180 720,1155 790,1110"
    fill="none"
    stroke="${BLUE}"
    stroke-width="22"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- 앱 이름 -->
  <text
    x="642"
    y="1520"
    font-family="Arial Black, Arial, sans-serif"
    font-size="96"
    font-weight="900"
    fill="${WHITE}"
    text-anchor="middle"
  >QuizOn</text>

  <!-- 슬로건 -->
  <text
    x="642"
    y="1620"
    font-family="Arial, sans-serif"
    font-size="44"
    fill="#9CA3AF"
    text-anchor="middle"
  >매일 10문제로 끝내는 주식공부</text>

  <!-- 하단 점 장식 -->
  <circle cx="602" cy="1700" r="8" fill="${BLUE}" opacity="0.5"/>
  <circle cx="642" cy="1700" r="8" fill="${BLUE}"/>
  <circle cx="682" cy="1700" r="8" fill="${BLUE}" opacity="0.5"/>
</svg>
`;

// ─── 어댑티브 아이콘 (포그라운드, 1024x1024) ─────────────────────────────
const adaptiveSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="transparent"/>

  <!-- 차트 라인 -->
  <polyline
    points="160,680 300,560 420,610 540,420 660,340 860,200"
    fill="none"
    stroke="${BLUE}"
    stroke-width="52"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <defs>
    <linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon
    points="160,680 300,560 420,610 540,420 660,340 860,200 860,820 160,820"
    fill="url(#fill2)"
  />
  <text
    x="512" y="940"
    font-family="Arial Black, Arial, sans-serif"
    font-size="100"
    font-weight="900"
    fill="${WHITE}"
    text-anchor="middle"
  >QuizOn</text>
</svg>
`;

async function generate() {
  console.log('🎨 아이콘 & 스플래시 생성 중...');

  // 아이콘 (1024x1024)
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png 생성 완료');

  // 스플래시 (1284x2778)
  await sharp(Buffer.from(splashSvg))
    .resize(1284, 2778)
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('✅ splash.png 생성 완료');

  // 어댑티브 아이콘 (1024x1024)
  await sharp(Buffer.from(adaptiveSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('✅ adaptive-icon.png 생성 완료');

  // 파비콘 (48x48)
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✅ favicon.png 생성 완료');

  console.log('\n🚀 모든 에셋 생성 완료!');
}

generate().catch(console.error);
