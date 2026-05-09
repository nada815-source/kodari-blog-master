import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// 🛡️ KODARI 내장 아이콘 컴포넌트 (외부 의존성 제거)
const Copy = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const Image = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// 키워드 낚시왕 V3.8.0 - 동적 실시간 트렌드 분석기로 교체됨 (기존 topicDatabase 삭제됨)

function App() {
  const [inputMode, setInputMode] = useState('topic'); // 'topic' or 'youtube'
  const [youtubeTranscript, setYoutubeTranscript] = useState('');
  const [topic, setTopic] = useState('');
  const [tones, setTones] = useState({
    naver: '기본 블로거',
    tistory: '기본 블로거',
    wordpress: '명쾌한 정보 전달자'
  });
  const [platforms, setPlatforms] = useState({ naver: true, tistory: true, wordpress: true });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const [loading, setLoading] = useState(false);
  const emptyPlatformResult = { title: '', content: '', tags: '', official_links: [], image: '', image_desc: '', section_prompts: [] };
  const [results, setResults] = useState({
    topic: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
    youtube: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult }
  });
  const [activeTab, setActiveTab] = useState('naver');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [useImage, setUseImage] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('is_authenticated') === 'true');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);
  const [visualStyle, setVisualStyle] = useState('3d'); // 'photo' or '3d'
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [customImageKeyword, setCustomImageKeyword] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isKeywordFishingOpen, setIsKeywordFishingOpen] = useState(false);
  const [fishingCategory, setFishingCategory] = useState('🏛️ 정부정책');
  const [fishingResults, setFishingResults] = useState({ realTime: [], monthly: [], annual: [], evergreen: [] });
  const [isFishingLoading, setIsFishingLoading] = useState(false);
  const [activeFishingTab, setActiveFishingTab] = useState('all');
  const [isFactCheckOpen, setIsFactCheckOpen] = useState(false);
  const [experienceQuote, setExperienceQuote] = useState('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [groundingMetadata, setGroundingMetadata] = useState({ topic: null, youtube: null });

  const patchNotes = [
    {
      version: 'V4.0.8',
      date: '2026-05-10',
      title: '📱 모바일 풀-뷰 탭 [Visibility]',
      tags: ['UX최적화', '반응형그리드'],
      details: [
        '모바일 세로모드에서 버튼이 잘리던 문제를 해결하기 위해 3열 그리드 시스템 도입.',
        '모든 어장(실시간/이달/연간/황금/전체)과 새로고침 버튼을 한눈에 보이도록 배치.',
        'PC 환경에서는 기존의 슬림한 가로 한 줄 레이아웃 유지 (반응형 최적화).'
      ]
    },
    {
      version: 'V4.0.7',
      date: '2026-05-10',
      title: '📱 모바일 레이더 정상화 [Full Sync]',
      tags: ['모바일최적화', '버그픽스'],
      details: [
        '모바일 화면의 구형 [소재 연구소] 버튼을 최신 [키워드 낚시왕] 레이더로 전면 교체.',
        '끊어져 있던 모바일 버튼의 이벤트 핸들러를 최신 낚시 엔진 모달과 재연결.',
        '기존 버전(V3.8.1, V3.9.0)부터 이어진 모바일 작동 불능 현상 완벽 해결.'
      ]
    },
    {
      version: 'V4.0.6',
      date: '2026-05-10',
      title: '💎 클린 네비게이션 시스템',
      tags: ['UI다이어트', '직관성강화'],
      details: [
        '중복되었던 상단 [타임슬라이스] 영역을 삭제하여 화면 공간 확보 및 혼선 방지.',
        '레이더 가동 버튼을 카테고리 선택 옆으로 배치하여 동선 최적화.',
        '하단의 포커스 탭이 모든 시간대 제어를 전담하도록 인터페이스 구조 단일화.'
      ]
    },
    {
      version: 'V4.0.5',
      date: '2026-05-10',
      title: '💎 심리스 표적 낚시 엔진',
      tags: ['UX최적화', '중단없는데이터'],
      details: [
        '새로고침 시 기존 데이터를 유지하며 백그라운드에서 교체하는 [심리스 렌더링] 도입.',
        '로딩 중에는 화면의 투명도를 조절하여 탐색 중임을 시각적으로 알림.',
        '표적 낚시 매칭 로직 보강으로 개별 구역 최신화 안정성 대폭 강화.'
      ]
    },
    {
      version: 'V4.0.4',
      date: '2026-05-10',
      title: '💎 표적 낚시 시스템 & 프리미엄 가독성',
      tags: ['정밀타격', '가독성끝판왕'],
      details: [
        '현재 보고 있는 탭의 데이터만 핀포인트로 업데이트하는 [표적 낚시 엔진] 탑재.',
        '전체보기를 포함한 모든 모드에 P-8 패딩과 text-xl 대형 폰트 기본 적용.',
        '탭 순서 재배치: [실시간-이달-연간-황금-전체] 순으로 전략적 어장 구성.'
      ]
    },
    {
      version: 'V4.0.3',
      date: '2026-05-10',
      title: '💎 딥다이브 & 퀵 리프레시 엔진',
      tags: ['가독성최적화', '기동성강화'],
      details: [
        '개별 탭 선택 시 카드 크기와 폰트를 자동으로 키우는 [딥다이브 모드] 탑재.',
        '탭 바 우측에 즉시 재탐색이 가능한 [🔄 새로고침] 버튼 추가로 동선 최소화.',
        '정밀 분석을 위한 최적의 패딩과 타이포그래피 스케일 적용.'
      ]
    },
    {
      version: 'V4.0.2',
      date: '2026-05-10',
      title: '💎 포커스 탭 엔진 [Deep Focus Mode]',
      tags: ['인터페이스혁명', '집중력강화'],
      details: [
        '필요한 어장만 선별해서 보여주는 [포커스 탭] 시스템 도입으로 분석 효율성 극대화.',
        '전체보기/실시간/이달/연간/황금 탭 전환 시 불필요한 데이터를 숨겨 가독성 한계 돌파.',
        '활성 탭 하이라이트 기능을 통해 현재 탐색 중인 어장을 직관적으로 파악 가능.'
      ]
    },
    {
      version: 'V4.0.1',
      date: '2026-05-10',
      title: '🚀 가독성 끝판왕 [순간이동 네비게이터]',
      tags: ['UX최적화', '가독성혁명'],
      details: [
        '복잡했던 4분할 격자를 시원한 [버티컬 피드] 구조로 개편하여 텍스트 가독성 대폭 향상.',
        '원하는 구역으로 즉시 이동하는 [순간이동 네비게이터] 버튼 및 스무스 스크롤 기능 탑재.',
        '스티키 헤더(Sticky Header) 적용으로 스크롤 중에도 현재 섹션 정보를 상단에 고정.'
      ]
    },
    {
      version: 'V4.0.0',
      date: '2026-05-10',
      title: '💎 하이브리드 쿼드런트 엔진 [소재연구소 x 낚시왕]',
      tags: ['대규모패치', 'UI혁명'],
      details: [
        '소재 연구소의 [4분할 그리드]와 키워드 낚시왕의 [AIO 데이터 분석]을 하나로 합친 완전체 엔진 탑재.',
        '실시간/이번달/연간/황금 키워드를 한 번에 탐지하며, 각 구역에 독립적인 [슬림 스크롤 바]를 적용하여 무한 탐색 가능.',
        '정부 정책 데이터 추출 로직을 하이브리드 구조에 맞게 최적화하여 4개 구역 모두에서 정책 월척을 낚아옵니다.'
      ]
    },
    {
      version: 'V3.9.0',
      date: '2026-05-09',
      title: '🏛️ 정부 정책 자동 난시 엔진 탑재',
      tags: ['실시간', 'AI검색'],
      details: [
        '키워드 낙시왕 레이더에서 🏛️ 정부정책 선택 시, AI가 2026년 최신 정부 지원 사업을 자동 분석합니다.',
        '정책 키워드에는 낙은 AIO 침투지수를 자동 부여하여 블루오션 작성 기회를 직관적으로 판별합니다.',
        'AI 응답 안정성 및 오류 진단 로직을 전면 개선하여 레이더 무결점 가동을 보장합니다.'
      ]
    },
    {
      version: 'V3.8.1',
      date: '2026-05-09',
      title: '💡 체감 후기 추천기 탑재',
      tags: ['신기능', 'SEO최적화'],
      details: [
        'AIO 시대를 돌파할 E-E-A-T 확보용 [코다리의 체감 후기 한 줄 추천] 박스가 추가되었습니다.',
        '글 생성 시 구글 트렌드를 반영한 자연스러운 구어체 감상평 1~2줄을 자동 생성합니다.',
        '원하는 뉘앙스가 나올 때까지 무한 새로고침 및 원클릭 복사가 가능합니다.'
      ]
    },
    {
      version: 'V3.8.0',
      date: '2026-05-09',
      title: '🎣 키워드 낚시왕 레이더 탑재',
      tags: ['신기능', 'AI분석'],
      details: [
        '구식 소재 연구소를 폐기하고 최첨단 트렌드 분석기인 [키워드 낚시왕] 레이더를 탑재했습니다.',
        'AIO(AI Overview) 침투지수를 통해 트래픽을 독식할 수 있는 블루오션 키워드를 색상(초록/노랑/빨강)으로 직관적으로 판별합니다.',
        '실시간, 이번 달, 연간 타임슬라이스 필터와 나노 단위 취향을 반영한 세부 키워드 발굴이 가능해졌습니다.'
      ]
    },
    {
      version: 'V3.7.8',
      date: '2026-05-09',
      title: '🗑️ KODARI 엔진 다이어트 (Unsplash 퇴출)',
      tags: ['최적화', 'UI개편'],
      details: [
        '사용 빈도가 낮고 품질을 저하시키는 무료 이미지(Unsplash) 기능을 엔진에서 과감히 도려냈습니다.',
        '본문 상단에 [🎨 AI 이미지 프롬프트 보기] 버튼을 거대하게 배치하여 고품질 이미지 생성 동선을 최적화했습니다.',
        '로컬 개발용이었던 무용지물 [즉시 백업] 버튼을 설정창에서 제거하여 시스템을 가볍게 만들었습니다.',
        'AI 이미지 스타일의 기본값을 세련된 [3D 일러스트]로 변경했습니다.'
      ]
    },
    {
      version: 'V3.7.7',
      date: '2026-05-09',
      title: '🌐 글로벌 플랫폼 100% 한글화 강제',
      tags: ['품질향상', '프롬프트'],
      details: [
        '워드프레스 등 특정 글로벌 플랫폼명에 반응하여 AI가 임의로 영문 본문을 출력하던 현상을 원천 차단했습니다.',
        '수동 이미지 변경 시 발생하는 참조 에러를 해결했습니다.'
      ]
    },
    {
      version: 'V3.7.6',
      date: '2026-05-09',
      title: '🏠 듀얼 워크스페이스 (작업실 완전 분리)',
      tags: ['기능개선', 'UI/UX'],
      details: [
        '일반 주제와 유튜브 자막 입력 모드 간의 결과창이 완전히 분리되었습니다.',
        '이제 탭을 전환해도 기존에 생성해 둔 글이 날아가지 않고 안전하게 보존됩니다.'
      ]
    },
    {
      version: 'V3.7.5',
      date: '2026-05-09',
      title: '🧠 컨텍스트 치매 완치 및 영문 태그 픽스',
      tags: ['버그수정', '품질향상'],
      details: [
        '유튜브 자막 모드에서 [이 글만 다시 쓰기] 버튼을 누르면 원본 자막을 잊어버리고 엉뚱한 글을 쓰던 치명적인 버그를 수정했습니다.',
        '워드프레스 등 글로벌 플랫폼 생성 시 AI가 임의로 영어 해시태그를 다는 현상을 원천 차단했습니다.'
      ]
    },
    {
      version: 'V3.7.4',
      date: '2026-05-09',
      title: '📊 마크다운 표(Table) 렌더링 엔진 장착',
      tags: ['기능개선', 'UI/UX'],
      details: [
        '화면 미리보기에서 표(Table)가 텍스트로 깨져서 보이던 현상을 해결했습니다.',
        'remark-gfm 플러그인을 도입하여 화면에서도 완벽한 디자인의 표를 확인할 수 있습니다.'
      ]
    },
    {
      version: 'V3.7.3',
      date: '2026-05-09',
      title: '📺 Tube-Master: 스마트 자막 정제 필터 탑재',
      tags: ['기능개선', '유튜브', '품질향상'],
      details: [
        '유튜브 자막에 섞여 들어오는 [음악], [박수] 등의 불필요한 효과음 텍스트를 자동으로 삭제하는 정규식 필터를 적용했습니다.',
        '문맥에 맞지 않는 자동 자막의 오탈자를 AI가 스스로 판단하여 자연스럽게 교정하도록 프롬프트를 강화했습니다.'
      ]
    },
    {
      version: 'V3.7.2',
      date: '2026-05-08',
      title: '🐛 렌더링 버그 픽스 (True-Visual 복원)',
      tags: ['버그수정', '렌더링', '가독성'],
      details: [
        'ReactMarkdown의 렌더러가 강조 태그(<strong>, <mark> 등)를 문자열로 출력하던 심각한 시각적 버그를 수정했습니다.',
        'rehype-raw 플러그인을 도입하여 HTML 기반의 3중 하이브리드 강조 시스템이 화면에 정상적으로 출력되도록 복구했습니다.'
      ]
    },
    {
      version: 'V3.7.1',
      date: '2026-05-08',
      title: '📺 Tube-Master: 수동 주입 모드 탑재 (서버 우회)',
      tags: ['기능개선', '유튜브', '안정성'],
      details: [
        '유튜브의 클라우드 서버 차단 문제를 완벽하게 우회하기 위해 자막 "수동 주입 모드"로 전환했습니다.',
        '크롬 확장 프로그램(YouTube Summary)의 복사 기능을 활용하여 빈칸에 자막을 붙여넣기만 하면 자동으로 분석합니다.',
        '이제 모바일/PC 상관없이 언제 어디서든 가장 안정적으로 유튜브 영상을 연성할 수 있습니다.'
      ]
    },
    {
      version: 'V3.7.0',
      date: '2026-05-08',
      title: '📺 Tube-Master: 유튜브 영상 블로그 자동 연성',
      tags: ['신기능', '유튜브', 'OSMU'],
      details: [
        '유튜브 영상 URL만 입력하면 자막을 정밀하게 추출하는 Vercel 기반의 백엔드 추출기(API)를 장착했습니다.',
        '자막 텍스트를 바탕으로 블로그 주인의 시선이 담긴 고밀도 큐레이션 포스팅을 자동 생성합니다.',
        '입력 모드를 전환할 수 있는 직관적인 UI(일반 주제 / 유튜브 URL)를 추가했습니다.'
      ]
    },
    {
      version: 'V3.6.7',
      date: '2026-05-07',
      title: '🛡️ Fresh-Radar: 최신성 강화 정찰 시스템',
      tags: ['정찰', '신뢰도', '업데이트'],
      details: [
        '정찰 쿼리 생성 시 현재 연도(2026)와 "최신" 키워드를 자동 삽입하여 과거 데이터 노출을 원천 차단했습니다.',
        '개인 블로그의 오래된 정보를 배제하고 .go.kr, .or.kr 등 공식 공공기관 출처를 최우선하도록 지침을 강화했습니다.',
        '정보의 신선도를 기준으로 정찰 보고서의 신뢰도를 한 차원 더 격상시켰습니다.'
      ]
    },
    {
      version: 'V3.6.6',
      date: '2026-05-07',
      title: '🎨 True-Visual: 강조 무결성 및 렌더링 혁신',
      tags: ['디자인', '가독성', '수정'],
      details: [
        '별표(**), 형광펜(==), 파란색(++) 기호가 서로 섞여도 완벽하게 렌더링되도록 처리 엔진을 전면 개편했습니다.',
        '강조 기호가 문장 중간에 끊기거나 노출되는 현상을 원천 차단했습니다.',
        'AI 지침에 "밀착 강조 규칙"을 도입하여 시각적 리듬감을 극대화했습니다.'
      ]
    },
    {
      version: 'V3.6.5',
      date: '2026-05-07',
      title: '🛡️ 철벽 파싱(Iron-Parser) 및 안정성 강화',
      tags: ['버그 수정', '안정성', '시스템'],
      details: [
        'AI 응답에 불필요한 사족이나 문자가 섞여도 JSON 데이터만 정밀하게 골라내는 추출 로직을 도입했습니다.',
        '방대한 데이터 생성 시 발생하던 "Unexpected character" 파싱 오류를 원천 차단했습니다.',
        '시스템 안정성을 극대화하여 대용량 포스팅 생성 시의 신뢰도를 높였습니다.'
      ]
    },
    {
      version: 'V3.6.3',
      date: '2026-05-07',
      title: '🛡️ 정찰 보고서 무결성 복구 (Grounding Fix)',
      tags: ['버그 수정', '신뢰도', '레이더'],
      details: [
        '정찰 보고서 모달에서 검색 쿼리가 표시되지 않던 데이터 경로 오류를 완벽하게 수정했습니다.',
        '구글 공식 renderedContent 통로를 복구하여 어떤 정찰 결과도 누락 없이 표시되도록 안정성을 강화했습니다.',
        '정찰 레이더 시스템의 UI 응답 속도와 가시성을 최적화했습니다.'
      ]
    },
    {
      version: 'V3.6.2',
      date: '2026-05-07',
      title: '🎨 비주얼 엔진 3.3 복구 및 하이브리드 최적화',
      tags: ['버그 수정', '비주얼', '성능'],
      details: [
        'V3.6.1에서 소실되었던 [AI 이미지 생성 가이드] 전용 섹션 프롬프트 생성 로직을 완벽 복구했습니다.',
        'V3.5.9의 강력한 이미지 전략과 V3.6.1의 고밀도 본문 지능을 결합한 하이브리드 엔진을 구축했습니다.',
        '메인 제목, 보조 문구, 상세 영어 프롬프트가 모달 창에 정상적으로 노출되도록 지침을 강화했습니다.'
      ]
    },
    {
      version: 'V3.6.1',
      date: '2026-05-06',
      title: '🛡️ 실시간 팩트체크 리포트(Shield) UI 오픈',
      tags: ['UI/UX', '신뢰도', '신기능'],
      details: [
        '본문 상단에 [🛡️ 팩트체크 리포트] 버튼을 추가하여 검증 내역을 투명하게 공개합니다.',
        'AI가 정찰 시 사용한 검색 쿼리와 참고한 공식 출처(Source)를 한눈에 볼 수 있는 전문 모달 창을 구축했습니다.',
        '검증된 정보임을 알리는 "KODARI Verified" 배지를 적용하여 블로그의 권위를 높였습니다.'
      ]
    },
    {
      version: 'V3.6.1',
      date: '2026-05-06',
      title: '🏗️ KODARI Compact-Master: 고밀도 전문가 에디션',
      tags: ['최적화', '디자인'],
      details: [
        "'글을 마치며', '맺음말' 등 기계적인 사족 섹션을 완전히 제거하여 전문성을 높였습니다.",
        '1,500자 이상의 고밀도 정보 중심 스타일로 최적화하여 독자의 몰입감을 극대화했습니다.',
        '불필요한 미사여구 대신 실전 팁과 핵심 팩트 위주의 리포트 형식을 강화했습니다.',
        'V3.5.9 브랜치의 깔끔한 레이아웃과 안정적인 데이터 구조를 계승했습니다.'
      ]
    },
    {
      version: 'V3.6.0',
      date: '2026-05-06',
      title: '✨ KODARI Soft-Power: 황금 밸런스 에디션',
      tags: ['주요 업데이트', '하이브리드'],
      details: [
        'V3.5.8의 자연스러운 문장 구조와 이모지 리듬감을 완벽하게 복원했습니다.',
        'V3.5.9의 강력한 팩트체크 시스템을 Soft하게 튜닝하여 정확성과 유연성을 동시에 잡았습니다.',
        '2,000자 이상의 최적화된 화력 지침으로 안정적인 명품 리포트 생성을 보장합니다.',
        '3중 하이브리드 강조(볼드, 파랑, 노랑) 시스템의 최적 배합비를 적용했습니다.'
      ]
    },
    {
      version: 'V3.5.9',
      date: '2026-05-06',
      title: '🛡️ 무결점 팩트 체크 시스템(Grounding) 탑재',
      tags: ['신기능', '신뢰도', '무결점'],
      details: [
        '구글 실시간 검색 그라운딩(Grounding) 기술을 도입하여 할루시네이션(환각)을 원천 차단했습니다.',
        '정부 정책, 숫자, 날짜 등 민감한 정보를 작성 전 반드시 구글 검색으로 선제 정찰하도록 지침을 강화했습니다.',
        '포스팅 하단에 정보의 출처(Official Sources)를 자동으로 표기하여 블로그의 권위와 신뢰도를 높였습니다.'
      ]
    },
    {
      version: 'V3.5.8',
      date: '2026-05-05',
      title: '🏛️ 정부정책 우선순위 전략 배치',
      tags: ['전략 변경', '데이터 최적화', 'UX'],
      details: [
        '소재 연구소의 최우선 카테고리를 "정부정책"으로 변경하여 진입 시 즉시 노출되도록 했습니다.',
        '경제/재테크 카테고리와 정부정책 카테고리의 위치를 스왑하여 전략적 중요도를 높였습니다.',
        '기본 선택값을 변경하여 대표님의 분석 흐름을 최적화했습니다.'
      ]
    },
    {
      version: 'V3.5.7',
      date: '2026-05-05',
      title: '💡 소재 연구소 모바일 화면 최적화',
      tags: ['모달 수정', 'UX 개선', '모바일'],
      details: [
        '소재 연구소 진입 시 모바일에서 화면이 잘리던 현상을 완벽하게 해결했습니다.',
        '모바일 모달 정렬을 상단 위주로 재조정하여 스크롤 가독성을 극대화했습니다.',
        '테두리 여백과 곡률을 슬림화하여 정보 노출 영역을 대폭 확대했습니다.'
      ]
    },
    {
      version: 'V3.5.6',
      date: '2026-05-05',
      title: '⚓ 레이아웃 안정성 복구 및 가로 모드 완결',
      tags: ['안정화', '구조 복구', 'UX'],
      details: [
        '가장 안정적이었던 V2.8.0 기반의 블록 레이아웃(mx-auto)으로 구조를 복구했습니다.',
        '복잡한 flex/grid 설정을 제거하여 사파리 가로 모드 호환성을 100% 확보했습니다.',
        '대표님께서 요청하신 소재 연구소 버튼 슬림화 디자인은 그대로 유지했습니다.',
        '버전명을 V3.5.6으로 업데이트하여 최종 안착을 확인합니다.'
      ]
    },
    {
      version: 'V3.5.4',
      date: '2026-05-05',
      title: '⚓ 가로 모드 뷰포트 최종 봉인 완료',
      tags: ['Viewport Fix', 'Safari Ultimate', 'UX'],
      details: [
        '아이폰 사파리 가로 모드에서 레이아웃이 50%로 고정되는 현상을 shrink-to-fit=no 설정으로 해결했습니다.',
        'html, body에 min-width: 100vw를 강제 주입하여 배경색 잘림을 원천 차단했습니다.',
        '#root 래퍼 기반의 세이프 에리어 인셋(Safe Area Insets) 패딩을 적용했습니다.',
        '버전명을 V3.5.4로 업데이트하여 최신 패치 적용 여부를 즉시 확인할 수 있게 했습니다.'
      ]
    },
    {
      version: 'V3.5.2',
      date: '2026-05-05',
      title: '💎 가로 모드 완전 대응 및 레이아웃 안정화',
      tags: ['UX 완결', '최종 수정', '명품 UI'],
      details: [
        '아이폰 가로 모드에서 화면이 반쪽만 나오던 현상을 100vw 강제 주입으로 해결했습니다.',
        '배경색 유실을 방지하기 위해 CSS 기초 골조(!important)를 대대적으로 보강했습니다.',
        'grid 정렬 시스템을 도입하여 어떤 회전 상황에서도 중앙 정렬을 유지합니다.',
        '모바일 사용성을 위한 버튼 슬림화 패치가 최종 안착되었습니다.'
      ]
    },
    {
      version: 'V2.7.3 Final',
      date: '2026-04-30',
      title: '💎 KODARI 명품 생산성 패키지 완성 (Final)',
      tags: ['신기능', '생산성', '최적화'],
      details: [
        '플랫폼별 [🔄 이 글만 다시 쓰기] 기능을 탑재하여, 원하는 플랫폼 본문만 콕 집어 재생성할 수 있습니다.',
        '재생성 에러를 원천 차단하는 [무결성 구분자 파싱] 로직을 도입하여 안정성을 100% 확보했습니다.',
        '표(Table) 내부의 불필요한 특수문자를 제거하는 [Clean-Table] 지침을 강화하여 가독성을 극대화했습니다.',
        '모바일 사용성을 극대화한 [📱 모바일 복사 전용] 미리보기 창과 [📋 전체 선택 및 복사] 버튼을 추가했습니다.',
        'V2.5.1의 자연스러운 문장 단위 강조 스타일을 V2.7.3 엔진에 완벽하게 이식했습니다.',
        'Vercel Deployment Protection 해제를 통해 모바일에서도 로그인 없이 즉시 접속이 가능해졌습니다.',
        '상단 헤더에 실시간 작동 상태를 알리는 Pulse 애니메이션 뱃지를 적용했습니다.'
      ]
    },
    {
      version: 'V2.7.3',
      date: '2026-04-29',
      title: '🎨 KODARI Storytelling Branding 엔진 공식 오픈',
      tags: ['대규모 업데이트', '브랜딩', 'AI 상상력'],
      details: [
        '단일 단어(Impact Word)를 넘어선 [메인 제목 + 보조 문구] 이중 카피라이팅 시스템을 도입했습니다.',
        '본문 맥락을 분석하여 금화, 악수, 성장 차트 등 "시각적 비유(Metaphor)"를 자동으로 설계하는 지능형 프롬프트를 탑재했습니다.',
        '어떤 주제에서도 [썸네일1 + 본문3]의 완벽한 4종 세트 이미지를 보장하는 Perfect 4-Set 로직을 강제했습니다.',
        '외부 라이브러리 의존성을 제거한 "Zero-Error 인라인 아이콘 시스템"으로 엔진 안정성을 극대화했습니다.',
        '명품 정보 카드 레이아웃을 적용하여 블로그의 시각적 신뢰도와 브랜딩 가치를 한 차원 높였습니다.'
      ]
    },
    {
      version: 'V2.6.0',
      date: '2026-04-29',
      title: '💎 KODARI 명품 비주얼 엔진 V2.6 업그레이드',
      tags: ['신기능', '디자인'],
      details: [
        '보케(Bokeh) 효과와 시네마틱 조명 지침을 도입하여 텍스트 가독성과 이미지 깊이감을 극대화했습니다.',
        '3D 일러스트 생성 시 글라스모피즘, 골드 빛 줄기, 테크 파티클 등 럭셔리 요소를 기본 탑재했습니다.',
        '핵심 단어(Impact Word)를 Massive Bold로 강조하고 배경을 흐리게 하는 타이포 위계 로직을 강화했습니다.',
        '모바일 환경에서의 가독성을 보장하는 "Mobile-optimized" 지침을 모든 프롬프트에 적용했습니다.'
      ]
    },
    {
      version: 'V2.5.1',
      date: '2026-04-29',
      title: '🧹 지능형 프롬프트 클린 시스템 도입',
      tags: ['최적화', '지능화'],
      details: [
        'Impact Word 삭제 시 프롬프트 내의 불필요한 구문을 자동으로 제거하는 지능형 클린 로직을 추가했습니다.',
        '텍스트 없는 순수 이미지를 원할 때 더욱 깔끔하고 정확한 일러스트 생성을 보장합니다.',
        '프롬프트 내의 따옴표 및 중복 쉼표를 정제하여 AI의 이해도를 극대화했습니다.'
      ]
    },
    {
      version: 'V2.5.0',
      date: '2026-04-29',
      title: '🔠 KODARI Impact Typo 엔진 탑재',
      tags: ['신기능', '타이포그래피'],
      details: [
        '3D 일러스트 내에 블로그 주제를 관통하는 "핵심 한글 단어"를 삽입할 수 있는 기능이 추가되었습니다.',
        'AI가 섹션별로 최적의 단어(1~4글자)를 자동 추천하며, 대표님이 직접 수정하여 개성을 더할 수 있습니다.',
        '수정된 단어는 프롬프트에 실시간으로 반영되어, 생성 시 이미지 속에 자연스럽게 녹아듭니다.',
        '썸네일의 가시성을 극대화하고 독자의 클릭을 유도하는 강력한 시각 도구입니다.'
      ]
    },
    {
      version: 'V2.4.5',
      date: '2026-04-29',
      title: '🔄 스타일 반전 복사 기능 도입',
      tags: ['생산성', '하이브리드'],
      details: [
        'AI 이미지 가이드 모달에서 현재 생성된 프롬프트를 즉석에서 다른 스타일(실사 ↔ 3D)로 변환하여 복사할 수 있는 기능을 추가했습니다.',
        '복사 시 3D 관련 키워드와 실사 관련 키워드를 지능적으로 교체하여 별도의 생성 과정 없이도 스타일 전환이 가능합니다.',
        '하나의 포스팅 안에서 다양한 스타일의 이미지를 섞어 사용하고자 하는 대표님의 니즈를 반영했습니다.'
      ]
    },
    {
      version: 'V2.4.1',
      date: '2026-04-29',
      title: '💡 KODARI Visual Style Guide 탑재',
      tags: ['편의성', '가이드'],
      details: [
        '스타일 스위치 옆에 "스타일 선택 가이드(💡)" 버튼을 추가했습니다.',
        '주제별로 실사 사진과 3D 일러스트 중 어떤 것이 더 적합한지 한눈에 알 수 있는 전문 팝업 가이드를 제공합니다.',
        '대표님의 생산성 향상을 위한 비주얼 의사결정 지원 시스템을 구축했습니다.'
      ]
    },
    {
      version: 'V2.4.0',
      date: '2026-04-29',
      title: '🎨 KODARI Visual Style Switch 오픈',
      tags: ['신기능', 'UI/UX'],
      details: [
        '이미지 스타일 선택 스위치를 통해 "실사 사진"과 "3D 일러스트" 스타일을 자유롭게 선택할 수 있습니다.',
        '선택된 스타일에 맞춰 AI가 각 섹션별 이미지 생성 프롬프트를 맞춤형으로 제작합니다.',
        '메인 컨트롤 패널의 디자인을 더 직관적이고 세련된 스타일로 개편했습니다.'
      ]
    },
    {
      version: 'V2.3.3',
      date: '2026-04-29',
      title: '🏗️ 팩트체크 시스템 및 오리지널 UI 복원',
      tags: ['기능 복구', 'UI/UX'],
      details: [
        'AI 지침 정밀 수정을 통해 누락되었던 "공식 관련 링크(official_links)" 생성 기능을 완벽하게 복구했습니다.',
        '팩트체크 알림 박스를 대표님이 가장 선호하시던 초기 안정 버전의 오리지널 디자인으로 되돌렸습니다.',
        '멀티 섹션 프롬프트 기능과 팩트체크 시스템 간의 데이터 충돌을 해결했습니다.'
      ]
    },
    {
      version: 'V2.3.2',
      date: '2026-04-28',
      title: '💎 UI 최적화 및 보안 강화',
      tags: ['UI/UX', '보안'],
      details: [
        '대표님 인증 팝업창의 디자인을 더 컴팩트하고 세련되게 개선했습니다.',
        '모든 모달 창에 우측 상단 닫기(X) 버튼을 추가하여 사용 편의성을 높였습니다.'
      ]
    },
    {
      version: 'V2.3.1',
      date: '2026-04-28',
      title: '🩹 Hotfix: AI 프롬프트 버튼 노출 수정',
      tags: ['버그 수정', 'UI/UX'],
      details: [
        '데이터 구조 변경으로 인해 일시적으로 사라졌던 "AI 이미지 생성 프롬프트 보기" 버튼을 긴급 복구했습니다.'
      ]
    },
    {
      version: 'V2.3.0',
      date: '2026-04-28',
      title: '🎬 KODARI Multi-Section Director 오픈',
      tags: ['주요 업데이트', '이미지 에디팅'],
      details: [
        '블로그의 4개 핵심 소제목별로 최적화된 "개별 이미지 생성 프롬프트" 기능을 도입했습니다.',
        '글의 흐름에 따라 각 섹션에 딱 맞는 서로 다른 4가지 이미지를 생성하고 배치할 수 있습니다.',
        'UI 모달 내에서 섹션별 프롬프트를 확인하고 각각 복사할 수 있는 전문 에디터 모드를 지원합니다.'
      ]
    },
    {
      version: 'V2.2.0',
      date: '2026-04-28',
      title: '🎨 KODARI Creator Mode: AI 프롬프트 생성기',
      tags: ['신규 기능', '이미지 생성'],
      details: [
        'Unsplash 검색 결과가 만족스럽지 않을 때 사용할 수 있는 "AI 이미지 생성 프롬프트" 기능을 추가했습니다.',
        '각 플랫폼별 본문에 딱 맞는 고해상도 이미지 생성 전용 영어 프롬프트를 자동으로 제작합니다.',
        '생성된 프롬프트를 한 번의 클릭으로 복사하여 Gemini, DALL-E 3 등에 즉시 사용할 수 있습니다.'
      ]
    },
    {
      version: 'V2.1.7',
      date: '2026-04-28',
      title: '🔍 이미지 매칭 엔진 최적화 (Keyword 3.0)',
      tags: ['성능 개선', '이미지 매칭'],
      details: [
        'Unsplash 검색 정확도를 높이기 위해 문장형 검색어를 2~3단어의 핵심 키워드로 자동 압축하는 로직을 도입했습니다.',
        '엉뚱한 사진이 나올 확률을 대폭 줄이고, 사물 중심의 정확한 매칭 성능을 확보했습니다.'
      ]
    },
    {
      version: 'V2.1.6',
      date: '2026-04-28',
      title: '🎬 KODARI Visual Engine 3.0: Visual Director',
      tags: ['기능 추가', 'AI 상상력'],
      details: [
        'AI가 최적의 사진 구도를 먼저 "상상"한 뒤 검색하는 "Visual Director" 로직을 도입했습니다.',
        '한국인 모델(Korean/Asian) 우선 배정 옵션을 강화하여 국내 블로그 최적화 품질을 높였습니다.',
        '배경 내 지저분한 영어 텍스트를 배제하고 깨끗한 이미지를 선별하는 필터링 기능을 추가했습니다.'
      ]
    },
    {
      version: 'V2.1.5',
      date: '2026-04-28',
      title: '⚓ KODARI 이미지 엔진 2.0 도입',
      tags: ['기능 추가', '알고리즘'],
      details: [
        '플랫폼별 특성에 최적화된 "3중 교차 이미지 검색 전략"을 도입했습니다.',
        '네이버(감성), 티스토리(정보), 워드프레스(전문성) 각기 다른 시각적 컨셉의 이미지가 배정됩니다.',
        '추상적 키워드 대신 실제 사물/행위 중심의 검색 로직을 적용하여 매칭 정확도를 획기적으로 높였습니다.'
      ]
    },
    {
      version: 'V2.1.4',
      date: '2026-04-28',
      title: '🖼️ 이미지 컨셉 가이드 및 재검색 도입',
      tags: ['기능 추가', 'UI/UX'],
      details: [
        'AI가 선택한 이미지의 의도를 한국어로 설명해 주는 "현재 이미지 컨셉" 표시 기능을 추가했습니다.',
        '결과 화면에서 원하는 키워드로 즉시 사진을 교체할 수 있는 실시간 재검색 UI를 구축했습니다.'
      ]
    },
    {
      version: 'V2.1.3',
      date: '2026-04-28',
      title: '🧠 AI 이미지 검색 지능 고도화',
      tags: ['로직 개선', '품질 향상'],
      details: [
        '단순 단어 검색에서 벗어나 본문 맥락을 분석한 정교한 문장형 검색 쿼리를 생성하도록 개선했습니다.',
        '주제에 따라 한국(Korea) 또는 특정 시각적 배경을 유연하게 조합하여 이미지 적합도를 획기적으로 높였습니다.'
      ]
    },
    {
      version: 'v2.1.2',
      date: '2026-04-28',
      title: '📜 코다리의 항해일지(패치노트) 도입',
      tags: ['기능 추가', 'UI/UX'],
      details: [
        '혁신 블로그 AI의 장점을 벤치마킹하여 서비스 업데이트 내역을 한눈에 볼 수 있는 타임라인 UI를 추가했습니다.',
        '헤더의 📜 버튼을 통해 언제든지 코다리 엔진의 진화 과정을 확인하실 수 있습니다.'
      ]
    },
    {
      version: 'v2.1.1',
      date: '2026-04-28',
      title: '⚖️ 황금 밸런스 가독성 튜닝',
      tags: ['성능 개선', '가독성'],
      details: [
        '모바일 최적화의 정점! 한 문단 길이를 2~3문장으로 조절하여 가독성과 논리적 흐름을 모두 잡았습니다.',
        '문단 사이 시각적 여백을 강화하여 독자가 느끼는 피로도를 획기적으로 줄였습니다.'
      ]
    },
    {
      version: 'v2.1.0',
      date: '2026-04-28',
      title: '📱 모바일 복사 전용 시스템 도입',
      tags: ['기능 추가'],
      details: [
        '네이버 블로그 앱 서식 깨짐 방지를 위한 "모바일 복사 전용 미리보기" 기능을 추가했습니다.',
        '새 창에서 전체 선택 후 복사하여 서식을 100% 보존할 수 있습니다.'
      ]
    },
    {
      version: 'v2.0.0',
      date: '2026-04-27',
      title: '🇰🇷 한국어 완벽 통일 및 3색 강조',
      tags: ['시스템'],
      details: [
        '워드프레스 포함 모든 플랫폼의 출력 언어를 한국어로 100% 고정했습니다.',
        '3색(노랑 형광펜, 파랑 강조, 빨강 주의) 컬러 시스템을 완성했습니다.'
      ]
    }
  ];

  const triggerToast = (msg) => {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleLogin = () => {
    if (authCode === 'kodari1') {
      setIsAuthenticated(true);
      localStorage.setItem('is_authenticated', 'true');
      setIsAuthModalOpen(false);
      triggerToast('반갑습니다, 대표님! KODARI BLOG AI가 활성화되었습니다. 🫡🐟');
    } else {
      triggerToast('인증 코드가 틀렸습니다. 대표님만 아시는 코드를 입력해 주세요!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_authenticated');
    triggerToast('로그아웃 되었습니다. 충성!');
  };

  const handleSaveApiKey = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };


  const generateExperienceQuote = async (targetTopic) => {
    if (!targetTopic) return;
    setIsQuoteLoading(true);
    try {
      const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;
      const prompt = `주제: "${targetTopic}"\n\n위 주제를 직접 겪은 일반인의 생생한 후기나 감상평을 블로그 본문 첫머리나 마지막에 바로 복사해서 쓸 수 있게 구어체로 딱 1~2줄만 작성해줘. 이모지도 1~2개 넣어줘. (예: 저도 어제 직접 해봤는데 생각보다 너무 편해서 깜짝 놀랐어요! 😲 진작 해볼 걸 그랬네요.)`;
      const req = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 100 }
        })
      });
      const data = await req.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setExperienceQuote(data.candidates[0].content.parts[0].text.trim().replace(/^"|"$/g, ''));
      }
    } catch (err) {
      console.error(err);
      setExperienceQuote('추천 문구를 불러오지 못했습니다. 😢');
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const generateContent = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
    if (!finalKey) {
      setIsSettingsOpen(true);
      triggerToast('⚙️ API 키를 먼저 설정해 주세요, 대표님!');
      return;
    }
    if (inputMode === 'topic' && !topic.trim()) {
      setError('포스팅 주제를 입력해주세요!');
      return;
    }
    if (inputMode === 'youtube' && !youtubeTranscript.trim()) {
      setError('유튜브 자막 텍스트를 붙여넣어 주세요!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let finalTopicContext = `주제: "${topic}"`;
      
      if (inputMode === 'youtube') {
        // [V3.7.3] 자막 정제 로직 (대괄호 효과음 제거 및 공백 압축)
        let cleanedTranscript = youtubeTranscript
          .replace(/\[.*?\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const truncatedTranscript = cleanedTranscript.length > 15000 
          ? cleanedTranscript.substring(0, 15000) + '... (이하 생략)' 
          : cleanedTranscript;
          
        finalTopicContext = `[특별 임무: 유튜브 영상 요약 및 큐레이션]
아래 제공된 유튜브 영상 자막을 완벽하게 분석하고, 단순 요약이 아닌 전문가의 시선이 담긴 깊이 있는 블로그 글로 연성해. 원본 영상의 핵심을 짚어주고 독자가 궁금해할 만한 인사이트를 반드시 추가해. 영상의 제목이나 분위기도 유추해서 글에 녹여내.

[필독: 자막 교정 지침]
유튜브 자동 생성 자막의 특성상 오탈자나 문맥에 맞지 않는 엉뚱한 단어가 다수 포함되어 있을 수 있어. 전체 문맥을 파악하여 이상한 단어나 오탈자는 자연스럽고 올바른 단어로 완벽하게 교정해서 글을 작성해.

[영상 자막 원본]:
"""
${truncatedTranscript}
"""`;
      }

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;
      
      const styleGuide = visualStyle === 'photo' 
        ? "스타일: 반드시 'Professional Editorial Photography' 스타일로 묘사해. (Keywords: High-end magazine style, clean composition, soft studio lighting, high resolution)"
        : "스타일: 반드시 'Modern Isometric Digital Illustration' 스타일로 묘사해. (Keywords: Professional infographic layout, flat design with 3D depth, organized visual information, clean lines, bright and optimistic palette)";

      const combinedPrompt = `${finalTopicContext}
이미지 스타일: ${visualStyle === 'photo' ? '실사 사진' : '3D 일러스트'}

[필독: 생성 지침 - 고밀도 콤팩트 리포트 스타일]
[필독: 사족 금지 - '글을 마치며', '결론', '맺음말', '요약' 등의 기계적이고 뻔한 섹션 제목을 사용하는 것을 **절대 엄금**해. 정보 전달이 끝나면 자연스럽고 깔끔하게 글을 맺어.]
[필독: 팩트 체크 - 반드시 '구글 검색' 결과를 바탕으로 정확한 정보만 기록해. 확실하지 않은 수치는 절대 지어내지 마.]
[필독: 언어 설정 - 모든 텍스트(특히 워드프레스 본문을 포함한 전체 데이터)는 무조건 **한국어(Korean)**로만 작성해. 절대 영어로 번역하거나 답변하지 마.]

0. **이미지 검색 및 생성 전략 (KODARI Visual Engine 3.3):**
   - **[1단계: 상상]**: 각 플랫폼 성격에 맞춰 본문을 가장 잘 설명하는 **최적의 시각적 장면**을 먼저 상상해.
   - **[2단계: 스타일 적용]**: ${styleGuide}
   - **[3단계: 제약 조건]**: 인물은 반드시 **한국인(Korean/Asian)**으로, 배경은 외국어 없이 **깨끗하게** 구성해.
   - **[4단계: 이미지 생성 지침(section_prompts)]**: 본문 소제목(H2) 개수와 상관없이, 아래의 **Storytelling Branding Rule**을 적용한 **총 4개**의 상세 영어 프롬프트를 반드시 생성해.
      1) **Section 1 (Thumbnail)**: Create a grand masterpiece thumbnail representing the overall topic.
      2) **Section 2 & 3 (Main Content)**: Visualize the most important informative parts of the content.
      3) **Section 4 (Summary/Conclusion)**: Show a celebratory or concluding scene with a sense of achievement.
      4) **Text Hierarchy**: Generate a **main_title** and a **sub_copy** for EACH of the 4 images.
      5) **Visual Metaphor**: Use 'Storytelling Visual Metaphors' that symbolize the content.
      6) **Layout Strategy**: Create a 'Premium Information Card' layout where the **main_title** and **sub_copy** can be placed naturally as part of the design.
      7) **Visual Style**: Keep the 'Premium 3D Claymorphism' style.
      8) **Safety**: **STRICTLY RENDER THE EXACT KOREAN CHARACTERS.**

1. **[정밀 화력] 콤팩트한 정보 밀도 (V3.5.9 스타일 계승):** 
   - 본문은 공백 제외 **최소 1500자 이상의 풍성한 분량**으로 작성해. 
   - 불필요한 미사여구는 빼고, **'핵심 정보'와 '실전 팁'** 중심으로 밀도 높게 구성해.
   - **[구조]**: 소제목에 번호를 붙이지 말고, ## 기호를 사용하여 깔끔한 제목 스타일로 구성해. 

2. **가독성 극대화 및 [3중 하이브리드 강조 - 밀착 강조 규칙]:**
   - 모든 기호는 **반드시 강조할 대상에 공백 없이 1:1로 밀착**시켜라. (예: ==문장 전체==, ++파란색키워드++, **강조단어**, !!주의사항!!)
   - 기호를 문장 중간에 끊기거나 어설프게 남기지 말고, 반드시 감싸는 구조로 정밀하게 작성해.
   - **[형광펜]**: ==문장 전체를 감싸서 노란색 색칠== (중간에 끊지 마)
   - **[파랑강조]**: ++핵심단어/수치++
   - **[빨강주의]**: !!필독정보!!

3. **[경고] 표(Table) 내부 기호 절대 금지 (Zero-Symbol Policy):**
   - 모든 정보성 데이터는 **무조건 Markdown Table 형식**으로 시각화해. 
   - **[절대 엄금]: 표 내부에는 절대로 강조 기호(**, ==, ++, !!)를 사용하지 마라.** 순수한 텍스트만 입력해.

4. **JSON 및 말투 가이드:**
   - 독자와 직접 대화하듯 다정하고 친근한 블로거의 말투를 사용해. 문장 곳곳에 세련된 이모지를 적절히 섞어줘.

결과는 반드시 아래의 JSON 형식으로만 답변해:
{
  "image_queries": [ {"en": "...", "ko": "..." }, ... ],
  "section_prompts": [
    {
      "title": "소제목",
      "main_title": "메인 제목 (한글)",
      "sub_copy": "보조 문구 (한글)",
      "prompt": "상세 영어 프롬프트"
    },
    ... (총 4개 생성)
  ],
  "naver": { "title": "...", "content": "...", "tags": "...", "official_links": [{"name": "링크이름", "url": "https://..."}] },
  "tistory": { "title": "...", "content": "...", "tags": "...", "official_links": [{"name": "링크이름", "url": "https://..."}] },
  "wordpress": { "title": "...", "content": "...", "tags": "...", "official_links": [{"name": "링크이름", "url": "https://..."}] }
}

[필독: 해시태그는 '#'을 붙여 한 줄로 나열하고, 워드프레스를 포함한 모든 플랫폼의 해시태그는 무조건 **한국어**로만 작성해.]`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: combinedPrompt }] }],
          tools: [{ google_search: {} }] 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 호출 실패');
      }

      const data = await response.json();
      
      // 구글 검색 근거(Grounding) 메타데이터 추출 및 저장
      if (data.candidates?.[0]?.groundingMetadata) {
        setGroundingMetadata(prev => ({ ...prev, [inputMode]: data.candidates[0].groundingMetadata }));
        console.log('[팩트체크 성공] 구글 검색 근거를 확보했습니다.');
      } else {
        setGroundingMetadata(prev => ({ ...prev, [inputMode]: null }));
      }

      let responseTextRaw = data.candidates[0].content.parts[0].text;
      
      // [철벽 파싱] JSON 블록만 정밀 추출
      let responseText = "";
      const jsonMatch = responseTextRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      } else {
        responseText = responseTextRaw.replace(/```json/gi, '').replace(/```/gi, '').trim();
      }

      const parsedData = JSON.parse(responseText);
      const emptyResult = { title: '', content: '생성 실패', tags: '', official_link: '', image: '', image_desc: '' };

      let finalImages = ['', '', ''];

      const koDescs = (parsedData.image_queries || []).map(q => q.ko);
      const sectionPrompts = parsedData.section_prompts || [];

      setResults(prev => ({
        ...prev,
        [inputMode]: {
          naver: parsedData.naver ? { ...emptyResult, ...parsedData.naver, image: finalImages[0], image_desc: koDescs[0] || '', section_prompts: sectionPrompts, official_links: parsedData.naver.official_links || [] } : emptyResult,
          tistory: parsedData.tistory ? { ...emptyResult, ...parsedData.tistory, image: finalImages[1], image_desc: koDescs[1] || '', section_prompts: sectionPrompts, official_links: parsedData.tistory.official_links || [] } : emptyResult,
          wordpress: parsedData.wordpress ? { ...emptyResult, ...parsedData.wordpress, image: finalImages[2], image_desc: koDescs[2] || '', section_prompts: sectionPrompts, official_links: parsedData.wordpress.official_links || [] } : emptyResult
        }
      }));

      // 체감 후기 추천 자동 생성
      generateExperienceQuote(inputMode === 'topic' ? topic : "유튜브 영상 요약");

    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const regeneratePlatform = async (platform) => {
    if (loading) return;
    setLoading(true);
    try {
      const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;
      
      const platformName = platform === 'naver' ? '네이버 블로그' : platform === 'tistory' ? '티스토리' : '워드프레스';
      
      // [V3.7.5] 재생성 시 컨텍스트 유지 (치매 방지)
      let regenerateContext = `주제: "${topic}"`;
      if (inputMode === 'youtube') {
        const truncatedTranscript = youtubeTranscript.length > 15000 
          ? youtubeTranscript.substring(0, 15000) + '... (이하 생략)' 
          : youtubeTranscript;
        regenerateContext = `[특별 임무: 유튜브 영상 요약 및 큐레이션]\n[영상 자막 원본]:\n"""\n${truncatedTranscript}\n"""`;
      }

      const prompt = `다음 내용을 바탕으로 "${platformName}" 전용 포스팅 본문을 다시 작성해줘.
      
      ${regenerateContext}
      
      아래 형식을 엄격히 지켜서 답변해 (다른 설명 금지):
      
      [TITLE]
      여기에 새로운 제목 작성
      
      [CONTENT]
      여기에 새로운 본문 작성
      - 반드시 ## 소제목으로 섹션 구분
      - 표(Table)를 포함하되, 표 셀 내부에는 절대 강조 기호(**, ==, ++, !!) 사용 금지
      - 표 밖의 본문에는 ==형광펜==, ++파란색++, !!빨간색!! 적극 사용
      
      [TAGS]
      #태그1 #태그2 #태그3 (무조건 한국어로만 나열)
      
      [LINKS]
      공식사이트명 | https://url
      공식블로그 | https://url2`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }] 
        })
      });

      if (!response.ok) throw new Error('네트워크 응답 오류');
      
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // 정규표현식 기반 정밀 추출 (split보다 훨씬 강력함)
      const titleMatch = rawText.match(/\[TITLE\]\s*([\s\S]*?)\s*\[CONTENT\]/i);
      const contentMatch = rawText.match(/\[CONTENT\]\s*([\s\S]*?)\s*\[TAGS\]/i);
      const tagsMatch = rawText.match(/\[TAGS\]\s*([\s\S]*?)\s*\[LINKS\]/i) || rawText.match(/\[TAGS\]\s*([\s\S]*)/i);
      const linksMatch = rawText.match(/\[LINKS\]\s*([\s\S]*)/i);
      
      const title = titleMatch ? titleMatch[1].trim() : (rawText.split('[TITLE]')[1]?.split('[CONTENT]')[0]?.trim() || '');
      const content = contentMatch ? contentMatch[1].trim() : (rawText.split('[CONTENT]')[1]?.split('[TAGS]')[0]?.trim() || '');
      const tags = tagsMatch ? tagsMatch[1].trim() : '';
      const linksStr = linksMatch ? linksMatch[1].trim() : '';
      
      if (!title || !content) throw new Error('데이터 추출 실패');

      const official_links = linksStr.split('\n')
        .filter(line => line.includes('|'))
        .map(line => {
          const [name, url] = line.split('|').map(s => s.trim());
          return { name, url };
        });
      
      setResults(prev => ({
        ...prev,
        [inputMode]: {
          ...prev[inputMode],
          [platform]: {
            ...prev[inputMode][platform],
            title,
            content,
            tags,
            official_links
          }
        }
      }));
      triggerToast(`${platformName} 글이 성공적으로 리필되었습니다! ✨`);
      
    } catch (err) {
      console.error('재생성 상세 오류:', err);
      triggerToast('AI 응답이 일시적으로 불안정합니다. 한 번 더 눌러주세요! 💦');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSwapCopy = (originalPrompt, currentStyle, idx) => {
    let transformed = originalPrompt;
    
    // 3D/그래픽 관련 키워드 셋
    const graphicsKeywords = ['3D isometric illustration', 'claymorphism', '3D render', 'soft rounded shapes', 'trendy digital art', 'vibrant colors', 'stylized', '3D illustration'];
    // 실사/사진 관련 키워드 셋
    const photoKeywords = ['Photorealistic', 'Cinematic lighting', '8k', 'professional photography', 'natural skin texture', 'real life photo', 'high-quality photography', 'realistic style'];

    if (currentStyle === 'photo') {
      // 사진 -> 3D 변환
      photoKeywords.forEach(k => { transformed = transformed.replace(new RegExp(k, 'gi'), ''); });
      transformed = `A vibrant 3D isometric illustration showing ${transformed.trim()}, claymorphism style, soft rounded shapes, trendy digital art, high-quality 3D render`;
    } else {
      // 3D -> 사진 변환
      graphicsKeywords.forEach(k => { transformed = transformed.replace(new RegExp(k, 'gi'), ''); });
      transformed = `A photorealistic image showing ${transformed.trim()}, cinematic lighting, 8k, professional photography, natural skin texture, realistic style`;
    }

    // 연속된 쉼표나 공백 정리
    transformed = transformed.replace(/,\s*,/g, ',').replace(/\s\s+/g, ' ').replace(/,\s*\./g, '.').trim();
    
    navigator.clipboard.writeText(transformed);
    triggerToast(`[섹션 ${idx + 1}] ${currentStyle === 'photo' ? '🎨 3D' : '📸 사진'} 스타일로 변환 복사 완료! ✨`);
  };

  const handleMainTitleChange = (idx, newTitle) => {
    setResults(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        title: newTitle
      }
    }));
  };

  const handleSelectTopic = (selectedTopic) => {
    setInputMode('topic');
    setTopic(selectedTopic);
    setIsKeywordFishingOpen(false);
    triggerToast(`🎣 '${selectedTopic}' 낚시 성공! 월척입니다! ✨`);
  };

  const handleSubCopyChange = (idx, newCopy) => {
    setResults(prev => {
      const currentSectionPrompts = prev[activeTab].section_prompts;
      if (!currentSectionPrompts) return prev;
      const updatedPrompts = [...currentSectionPrompts];
      updatedPrompts[idx].sub_copy = newCopy;
      return { ...prev, [activeTab]: { ...prev[activeTab], section_prompts: updatedPrompts } };
    });
  };

  const runKeywordFishing = async () => {
    const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
    if (!finalKey) {
      triggerToast('⚙️ API 키를 설정해야 낚시 레이더를 가동할 수 있습니다!');
      return;
    }

    setIsFishingLoading(true);
    const target = activeFishingTab; // 현재 탭 인식
    triggerToast(target === 'all' ? '🔄 4대 어장 전체 스캔 중...' : `🔄 [${target}] 구역 정밀 타격 중...`);

    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;

      let prompt = `당신은 대한민국 최고의 SEO 전문가이자 데이터 분석가입니다.
사용자가 선택한 카테고리: [${fishingCategory}]

[구역 정의]
1. realTime: 지금 이 순간 급상승 중인 핫이슈
2. monthly: 이번 달 내내 조회수가 높을 트렌드
3. annual: 매년 이맘때 반복되는 시즌/공고/이벤트
4. evergreen: 시기와 상관없이 꾸준히 사랑받는 황금 키워드

[정부정책 특화 지침]
- 카테고리가 '🏛️ 정부정책'인 경우, 실제 2026년 정부 지원 사업명을 정확히 기재하세요.
- aio_index는 10~25 사이(블루오션)로 부여하고 reason에는 [기한/지원금/대상]을 포함하세요.

`;

      if (target === 'all') {
        prompt += `위 4가지 구역별로 각각 5~8개씩 발굴하여 아래 JSON 구조로 응답하세요.
{
  "realTime": [ { "keyword": "...", "aio_index": 20, "reason": "..." }, ... ],
  "monthly": [ ... ],
  "annual": [ ... ],
  "evergreen": [ ... ]
}`;
      } else {
        prompt += `현재 [${target}] 구역에 대해서만 월척 키워드 8~10개를 발굴하여 아래 JSON 구조로 응답하세요.
{
  "${target}": [ { "keyword": "...", "aio_index": 20, "reason": "..." }, ... ]
}`;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('AI 응답이 비어있습니다.');
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResults = JSON.parse(jsonMatch[0]);
        if (target === 'all') {
          setFishingResults(parsedResults);
        } else {
          setFishingResults(prev => ({ ...prev, [target]: parsedResults[target] || [] }));
        }
        triggerToast(`✨ [V4.0.4] ${target === 'all' ? '전체 어장' : target} 탐지 완료!`);
      } else {
        throw new Error('데이터 파싱 오류');
      }
    } catch (err) {
      console.error(err);
      triggerToast(`❌ ${err.message}`);
    } finally {
      setIsFishingLoading(false);
    }
  };

  const convertMarkdownToHtml = (text) => {
    const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
    
    // 1. 표 변환 (가장 먼저 처리)
    const tableRegex = /((?:^|\n)\|.+(?:\n\|[ :|-]+)+\n(?:\|.+\|(?:\n|$))+)/g;
    let processed = text.replace(tableRegex, (match) => {
      const lines = match.trim().split(/\r?\n/);
      if (lines.length < 2) return match;
      const headers = lines[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
      const rows = lines.slice(2).map(line => line.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
      let html = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd; ${naverFont}"><thead><tr>`;
      headers.forEach(h => html += `<th style="border: 1px solid #ddd; padding: 12px; background: #f2f2f2;">${h}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(row => {
        html += '<tr>';
        headers.forEach((_, i) => html += `<td style="border: 1px solid #ddd; padding: 10px;">${row[i] || ''}</td>`);
        html += '</tr>';
      });
      return html + '</tbody></table>';
    });

    // 2. 강조 기호 (밀착 기호 우선 처리)
    processed = processed
      .replace(/==([\s\S]*?)==/g, '<span style="background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;">$1</span>')
      .replace(/\+\+([\s\S]*?)\+\+/g, '<span style="color: #0047b3; font-weight: bold;">$1</span>')
      .replace(/!!([\s\S]*?)!!/g, '<span style="color: #e60000; font-weight: bold;">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. 헤더 및 일반 텍스트 변환
    return processed.split(/\r?\n/).map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<p>&nbsp;</p>';
      if (trimmed.startsWith('## ')) return `<p style="margin: 30px 0 10px;"><span style="font-size: 20pt; font-weight: bold; ${naverFont}">${trimmed.slice(3)}</span></p>`;
      if (trimmed.startsWith('<table') || trimmed.startsWith('<li')) return trimmed;
      return `<p style="margin: 10px 0;"><span style="font-size: 12pt; line-height: 1.8; ${naverFont}">${trimmed}</span></p>`;
    }).join('');
  };

  const openPreviewWindow = (text) => {
    const htmlContent = convertMarkdownToHtml(text);
    const previewWin = window.open('', '_blank');
    if (!previewWin) {
      triggerToast('팝업 차단을 해제해 주세요! 🐟💦');
      return;
    }
    previewWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KODARI 모바일 복사 전용</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { padding: 20px; line-height: 1.8; font-family: '나눔고딕', sans-serif; background-color: #fff; color: #333; }
            .action-bar { position: sticky; top: 0; background: #fff; padding: 10px 0; border-bottom: 2px solid #6366f1; margin-bottom: 20px; display: flex; gap: 10px; z-index: 100; }
            button { background: #6366f1; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; flex: 1; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          </style>
          <script>
            function selectAllAndCopy() {
              const content = document.getElementById('content');
              const range = document.createRange();
              range.selectNodeContents(content);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              document.execCommand('copy');
              alert('복사 완료! 네이버 블로그 앱에 붙여넣으세요! ✨');
            }
          </script>
        </head>
        <body>
          <div class="action-bar"><button onclick="selectAllAndCopy()">📋 전체 선택 및 복사</button></div>
          <div id="content">${htmlContent}</div>
        </body>
      </html>
    `);
    previewWin.document.close();
  };

  const copyToClipboard = async (text) => {
    try {
      const htmlContent = convertMarkdownToHtml(text);
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      await navigator.clipboard.write(data);
      triggerToast('서식과 표가 포함된 상태로 복사되었습니다! 📋📊✨');
    } catch (err) {
      navigator.clipboard.writeText(text);
      triggerToast('텍스트로 복사되었습니다! ✅');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        <header className="text-center space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10"></div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase">KODARI BLOG AI V4.0.8</h1>
            <div className="flex gap-2">
              <button onClick={() => setIsPatchNotesOpen(true)} className="p-2.5 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-indigo-50 transition-all flex items-center gap-1 group">
                <span className="text-lg group-hover:scale-110 transition-transform">📜</span>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 uppercase tracking-tighter">Log</span>
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">⚙️</button>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all">인증 해제</button>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all">🔑 코드 인증</button>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-black text-sm">🚀 V4.0.8 [📱 모바일 풀-뷰 탭] 세로모드에서도 모든 어장을 한눈에 포착 ✨</p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex gap-4 items-center">
                <label className="block text-sm font-bold text-slate-700">✍️ 포스팅 소스</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setInputMode('topic')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'topic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>일반 주제</button>
                  <button onClick={() => setInputMode('youtube')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'youtube' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>유튜브 자막</button>
                </div>
              </div>
              <button 
                onClick={() => setIsKeywordFishingOpen(true)}
                className="md:hidden px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[11px] border-2 border-indigo-100 shadow-sm flex items-center gap-1 active:scale-95"
              >
                <span>🎣 키워드 낚시왕</span>
              </button>
            </div>
            <div className="flex gap-3">
              <div className={`relative flex-1 group ${inputMode === 'youtube' ? 'flex flex-col' : ''}`}>
                {inputMode === 'topic' ? (
                  <>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateContent()}
                      placeholder="예: 2026 경기 컬처패스 사용처 및 유효기간"
                      className="w-full p-4 md:p-5 pl-12 md:pl-14 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-base md:text-lg font-bold transition-all shadow-sm"
                    />
                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-xl md:text-2xl group-focus-within:scale-110 transition-transform">✨</span>
                  </>
                ) : (
                  <>
                    <textarea 
                      value={youtubeTranscript}
                      onChange={(e) => setYoutubeTranscript(e.target.value)}
                      placeholder="YouTube Summary 확장 프로그램에서 복사한 자막 텍스트를 여기에 붙여넣어 주세요..."
                      className="w-full h-32 p-4 md:p-5 rounded-2xl border-2 border-red-100 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm md:text-base font-normal transition-all shadow-sm resize-y"
                    />
                    <div className="absolute top-2 right-4 text-xs font-bold text-red-400">
                      📺 복사된 자막 텍스트
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={() => setIsKeywordFishingOpen(true)}
                className="hidden md:flex px-8 py-4 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 text-indigo-700 rounded-2xl font-black text-sm transition-all flex-col items-center justify-center gap-1 border-2 border-indigo-200 shadow-md whitespace-nowrap active:scale-95 group"
              >
                <span className="text-2xl group-hover:animate-bounce">🎣</span>
                키워드 낚시왕
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              ✅ 발행 플랫폼 및 개별 어투 설정
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 transition-all ${platforms.naver ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                <label className="flex items-center gap-2 cursor-pointer mb-3 group">
                  <input type="checkbox" checked={platforms.naver} onChange={() => setPlatforms({...platforms, naver: !platforms.naver})} className="w-5 h-5 text-green-500 rounded border-slate-300 focus:ring-green-500" />
                  <span className="font-bold text-slate-700 group-hover:text-green-600 transition-colors">🟢 네이버</span>
                </label>
                <select 
                  disabled={!platforms.naver}
                  value={tones.naver}
                  onChange={(e) => setTones({...tones, naver: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="기본 블로거">기본 (친절/깔끔)</option>
                  <option value="해박한 전문가">해박한 전문가</option>
                  <option value="MZ세대 유행어">MZ세대 유행어</option>
                  <option value="감성적인 에세이">감성적인 에세이</option>
                </select>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all ${platforms.tistory ? 'bg-white border-orange-200 shadow-sm' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                <label className="flex items-center gap-2 cursor-pointer mb-3 group">
                  <input type="checkbox" checked={platforms.tistory} onChange={() => setPlatforms({...platforms, tistory: !platforms.tistory})} className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500" />
                  <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">🟠 티스토리</span>
                </label>
                <select 
                  disabled={!platforms.tistory}
                  value={tones.tistory}
                  onChange={(e) => setTones({...tones, tistory: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="기본 블로거">기본 (친절/깔끔)</option>
                  <option value="해박한 전문가">해박한 전문가</option>
                  <option value="MZ세대 유행어">MZ세대 유행어</option>
                  <option value="감성적인 에세이">감성적인 에세이</option>
                </select>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all ${platforms.wordpress ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                <label className="flex items-center gap-2 cursor-pointer mb-3 group">
                  <input type="checkbox" checked={platforms.wordpress} onChange={() => setPlatforms({...platforms, wordpress: !platforms.wordpress})} className="w-5 h-5 text-blue-500 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">🔵 워드프레스</span>
                </label>
                <select 
                  disabled={!platforms.wordpress}
                  value={tones.wordpress}
                  onChange={(e) => setTones({...tones, wordpress: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="명쾌한 정보 전달자">명쾌한 정보 전달자</option>
                  <option value="기본 블로거">기본 (친절/깔끔)</option>
                  <option value="MZ세대 유행어">MZ세대 유행어</option>
                  <option value="감성적인 에세이">감성적인 에세이</option>
                </select>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 font-bold text-sm animate-pulse">{error}</p>}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            {/* 이미지 사용 토글 */}
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black transition-colors ${!useImage ? 'text-slate-400' : 'text-slate-200'}`}>NO IMAGE</span>
              <button 
                onClick={() => setUseImage(!useImage)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-[10px] font-black transition-colors ${useImage ? 'text-indigo-600' : 'text-slate-400'}`}>AUTO IMAGE ON</span>
            </div>

            {/* 스타일 선택 스위치 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 bg-slate-200 rounded-xl">
                <button 
                  onClick={() => setVisualStyle('photo')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${visualStyle === 'photo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📸 실사 사진
                </button>
                <button 
                  onClick={() => setVisualStyle('3d')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${visualStyle === '3d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  🎨 3D 일러스트
                </button>
              </div>
              <button 
                onClick={() => setIsStyleGuideOpen(true)}
                className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-200 transition-all group"
                title="이미지 스타일 선택 가이드"
              >
                <span className="text-sm group-hover:scale-110 transition-transform block">💡</span>
              </button>
            </div>
          </div>

          <button 
            onClick={generateContent}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg p-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                코다리가 맹렬히 작성 중입니다...
              </>
            ) : '🚀 원버튼 동시 생성하기'}
          </button>
        </div>

        {Object.values(results[inputMode]).some(val => val.content) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {['naver', 'tistory', 'wordpress'].filter(tab => platforms[tab]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 font-bold text-sm transition-all ${
                    activeTab === tab 
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'naver' ? '🟢 네이버 블로그' : tab === 'tistory' ? '🟠 티스토리' : '🔵 워드프레스'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {results[inputMode][activeTab].section_prompts && results[inputMode][activeTab].section_prompts.length > 0 && (
                <div className="mb-6">
                  <button 
                    onClick={() => setIsAiPromptOpen(true)}
                    className="w-full py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-black rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <span className="text-2xl animate-bounce">🎨</span> AI 이미지 생성 프롬프트 보기
                  </button>
                </div>
              )}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider">Title</label>
                  <button onClick={() => copyToClipboard(results[inputMode][activeTab].title)} className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1">📋 제목 복사</button>
                </div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{results[inputMode][activeTab].title || '제목 생성 중...'}</h2>
              </div>

              {/* [신규] 체감 후기 추천 박스 */}
              {results[inputMode][activeTab].title && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider">💡 코다리의 체감 후기 한 줄 추천 (E-E-A-T 확보용)</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => generateExperienceQuote(inputMode === 'topic' ? topic : "유튜브 영상 요약")} 
                        disabled={isQuoteLoading}
                        className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-amber-200 flex items-center gap-1"
                      >
                        {isQuoteLoading ? '⏳ 생성 중...' : '🔄 다른 문구 추천'}
                      </button>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(experienceQuote); triggerToast('추천 문구 복사 완료!'); }} 
                        className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-amber-200 flex items-center gap-1"
                      >
                        📋 복사
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-amber-900 bg-white/50 p-3 rounded-lg border border-amber-100/50">
                    {isQuoteLoading ? '구글 트렌드를 분석하여 찰진 후기를 생성하고 있습니다...' : (experienceQuote || '문구를 생성하려면 새로고침을 눌러주세요.')}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => regeneratePlatform(activeTab)} 
                      disabled={loading}
                      className={`px-3 py-1.5 font-bold rounded-lg text-xs transition-all shadow-sm border flex items-center gap-1 ${loading ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100 animate-pulse'}`}
                    >
                      {loading ? '⏳ 생성 중...' : '🔄 이 글만 다시 쓰기'}
                    </button>
                    <button onClick={() => openPreviewWindow(results[inputMode][activeTab].content)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-indigo-100 flex items-center gap-1">📱 모바일 복사 전용</button>
                    <button onClick={() => copyToClipboard(results[inputMode][activeTab].content)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1">📋 본문 복사</button>
                    <button onClick={() => setIsFactCheckOpen(true)} className={`px-3 py-1.5 font-bold rounded-lg text-xs transition-all shadow-sm flex items-center gap-1 ${groundingMetadata[inputMode] ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      🛡️ 팩트체크 리포트 {groundingMetadata[inputMode] ? '✅' : '(데이터 확인 중)'}
                    </button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group">
                  <div className="prose prose-slate max-w-none text-base leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6 prose-li:mb-2 prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-th:bg-indigo-50 prose-th:text-indigo-900 prose-th:border prose-th:border-indigo-100 prose-th:p-3 prose-td:border prose-td:border-slate-200 prose-td:p-3 prose-td:text-slate-700 hover:prose-tr:bg-slate-50">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {results[inputMode][activeTab].content
                        .replace(/==([^=]+)==/g, '<mark class="bg-yellow-200 text-slate-900 px-1 rounded">$1</mark>')
                        .replace(/\+\+([^+]+)\+\+/g, '<span class="text-blue-600 font-black">$1</span>')
                        .replace(/!!([^!]+)!!/g, '<span class="text-red-600 font-black">$1</span>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>')
                      }
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-amber-800 font-bold text-sm mb-1">코다리의 팩트체크 알림</p>
                  <p className="text-amber-700 text-xs leading-relaxed mb-3">본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 중요한 수치나 날짜 등은 반드시 아래 공식 관련 링크를 통해 최종 확인 후 발행해 주세요!</p>
                  <div className="flex flex-wrap gap-2">
                    {results[inputMode][activeTab].official_links && results[inputMode][activeTab].official_links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition-all border border-amber-300"
                      >
                        🔗 {link.name} 바로가기
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hashtags</label>
                  <button onClick={() => copyToClipboard(results[inputMode][activeTab].tags)} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1">📋 태그 복사</button>
                </div>
                <p className="text-blue-600 font-medium">{results[inputMode][activeTab].tags || '#해시태그'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 패치노트 모달 */}
      {isPatchNotesOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">📜 코다리의 항해일지</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Update History</p>
              </div>
              <button onClick={() => setIsPatchNotesOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-12 pb-4">
                {patchNotes.map((note, idx) => (
                  <div key={idx} className="relative pl-8 border-l-2 border-slate-100 last:border-transparent">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm"></div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md uppercase">{note.version}</span>
                        <span className="text-xs font-bold text-slate-400">{note.date}</span>
                        {note.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded-sm">#{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{note.title}</h3>
                      <ul className="space-y-2">
                        {note.details.map((detail, dIdx) => (
                          <li key={dIdx} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                            <span className="text-indigo-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-50 text-center">
              <p className="text-[11px] font-bold text-slate-400 italic">더 나은 성과를 위해 오늘도 코다리는 항해 중입니다. 🫡🐟</p>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 스타일 가이드 모달 */}
      {isStyleGuideOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setIsStyleGuideOpen(false)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all z-10"
            >✕</button>
            
            <div className="text-center space-y-2">
              <span className="text-3xl">💡</span>
              <h2 className="text-xl font-black text-slate-800">이미지 스타일 선택 가이드</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">How to choose the best visual style</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* 실사 사진 카드 */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📸</span>
                  <h3 className="font-black text-slate-800 text-sm">실사 사진</h3>
                </div>
                <p className="text-[11px] text-indigo-600 font-bold italic">"현장감, 신뢰, 생생한 감성"</p>
                <ul className="space-y-1.5">
                  {['맛집 / 여행 / 숙박', '금융 / 부동산 / 정책', '건강 / 운동 / 라이프', '리뷰 / 언박싱'].map((item, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3D 일러스트 카드 */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <h3 className="font-black text-indigo-600 text-sm">3D 일러스트</h3>
                </div>
                <p className="text-[11px] text-indigo-600 font-bold italic">"트렌디, IT 서비스, 추상적 개념"</p>
                <ul className="space-y-1.5">
                  {['IT / 앱 서비스 / SW', '보험 / 법률 / 연금', 'MZ세대 타겟 콘텐츠', '교육 / 자기계발'].map((item, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-indigo-300 rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                💡 **부장의 팁**: 독자가 "나도 저기에 있고 싶다"고 느끼게 하려면 **실사 사진**을, "이 서비스 참 스마트하네"라고 느끼게 하려면 **3D 일러스트**를 추천합니다!
              </p>
            </div>

            <button onClick={() => setIsStyleGuideOpen(false)} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl">알겠습니다</button>
          </div>
        </div>
      )}
      {/* AI 프롬프트 모달 */}
      {isAiPromptOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-white pb-4 z-10 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">AI 이미지 생성 가이드</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Section-Specific Prompts</p>
                </div>
              </div>
              <button onClick={() => setIsAiPromptOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium px-1 italic">"본문의 각 소제목 흐름에 딱 맞는 4가지 이미지를 생성해 보세요!"</p>
              
              <div className="grid grid-cols-1 gap-4">
                {results[inputMode][activeTab].section_prompts && results[inputMode][activeTab].section_prompts.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-slate-900 text-white text-[10px] font-black flex items-center justify-center rounded-full">0{idx + 1}</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Section Target</span>
                          <span className="text-xs font-bold text-slate-700">{item.title}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(item.prompt); triggerToast(`[섹션 ${idx + 1}] 프롬프트 복사 완료!`); }} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleStyleSwapCopy(item.prompt, visualStyle, idx)} className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl border border-slate-100 transition-all">
                          <Image size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-indigo-500 uppercase">Main Title</span>
                          <button onClick={() => { navigator.clipboard.writeText(item.main_title); triggerToast('메인 제목 복사!'); }} className="text-indigo-300 hover:text-indigo-500 transition-colors"><Copy size={10} /></button>
                        </div>
                        <input 
                          type="text" 
                          value={item.main_title || ''} 
                          onChange={(e) => handleMainTitleChange(idx, e.target.value)}
                          className="w-full p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-blue-500 uppercase">Sub Copy</span>
                          <button onClick={() => { navigator.clipboard.writeText(item.sub_copy); triggerToast('보조 문구 복사!'); }} className="text-blue-300 hover:text-blue-500 transition-colors"><Copy size={10} /></button>
                        </div>
                        <input 
                          type="text" 
                          value={item.sub_copy || ''} 
                          onChange={(e) => handleSubCopyChange(idx, e.target.value)}
                          className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-medium text-slate-600 italic focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">"{item.prompt}"</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                <p className="text-[10px] text-slate-400 font-bold leading-tight">💡 위 프롬프트들을 순서대로 **Gemini**나 **ChatGPT**에 입력하여 이미지를 만든 뒤, 블로그 본문의 각 소제목 사이에 삽입하면 전문가의 글처럼 보입니다!</p>
              </div>
            </div>

            <button onClick={() => setIsAiPromptOpen(false)} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl">확인했습니다</button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-100 text-left">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">⚙️ 시스템 설정</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">🔑 Gemini API Key</label>
              <div className="relative group">
                <input type={showApiKey ? "text" : "password"} value={apiKey} onChange={handleSaveApiKey} className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono text-sm" placeholder="Gemini API 키를 입력하세요" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">{showApiKey ? "👁️" : "👁️‍🗨️"}</button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button onClick={() => { localStorage.setItem('gemini_api_key', apiKey); setIsSettingsOpen(false); triggerToast('대표님, 설정이 저장되었습니다! 🫡'); }} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all">설정 저장 및 적용</button>
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              ✕
            </button>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
                대표님 인증 필요 <span className="text-xl">🧐</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">코다리 보안을 위해 인증 코드를 입력해 주세요.</p>
            </div>
            <input 
              type="password"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="코드를 입력하세요"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold text-lg tracking-[0.5em]"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
            >
              인증하기
            </button>
          </div>
        </div>
      )}

      {isKeywordFishingOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-start md:items-center justify-center z-[100] p-2 md:p-4 overflow-y-auto pt-4 md:pt-0">
          <div className="bg-white rounded-[24px] md:rounded-[40px] p-4 md:p-8 max-w-4xl w-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300 my-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  🎣 키워드 낚시왕 <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">Radar</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium">AIO(AI Overview) 시대를 돌파할 나만의 황금 어장을 탐색하세요.</p>
              </div>
              <button onClick={() => setIsKeywordFishingOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-xl">✕</button>
            </div>

            <div className="space-y-8">
              {/* 컨트롤 패널 */}
              {/* 컨트롤 패널 (V4.0.6 최적화) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="w-full md:w-auto space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">분석 카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {['🏛️ 정부정책', '💻 IT/테크', '💰 경제/재테크', '💪 건강/운동', '✈️ 여행/생활'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFishingCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          fishingCategory === cat ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={runKeywordFishing}
                  disabled={isFishingLoading}
                  className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isFishingLoading ? '🔄 탐색 중...' : '🎣 전체 레이더 가동'}
                </button>
              </div>

              {/* 결과 보드 */}
              <div className="bg-slate-900 rounded-[30px] p-6 shadow-2xl border border-slate-800 min-h-[300px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <h3 className="text-white font-black">AIO 침투지수 분석 보드</h3>
                  <div className="ml-auto flex gap-3 text-[10px] font-bold">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">🟢 침투 가능 (0~39)</span>
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">🟡 경쟁 치열 (40~69)</span>
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md">🔴 진입 금지 (70~100)</span>
                  </div>
                </div>

                {/* 🚀 포커스 탭 & 퀵 리프레시 그리드 (V4.0.8 반응형 최적화) */}
                {Object.values(fishingResults).some(arr => arr.length > 0) && !isFishingLoading && (
                  <div className="mb-6 p-2 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <div className="grid grid-cols-3 md:flex md:gap-2 gap-2">
                      {[
                        { id: 'realTime', title: '실시간', icon: '⚡' },
                        { id: 'monthly', title: '이달', icon: '📅' },
                        { id: 'annual', title: '연간', icon: '🌟' },
                        { id: 'evergreen', title: '황금', icon: '💎' },
                        { id: 'all', title: '전체', icon: '🌊' }
                      ].map(nav => (
                        <button
                          key={nav.id}
                          onClick={() => setActiveFishingTab(nav.id)}
                          className={`py-3 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                            activeFishingTab === nav.id 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' 
                              : 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/60'
                          }`}
                        >
                          <span className="text-sm">{nav.icon}</span> {nav.title}
                        </button>
                      ))}
                      {/* 새로고침 버튼을 그리드 마지막 칸으로 통합 */}
                      <button
                        onClick={runKeywordFishing}
                        className="py-3 px-2 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 group"
                        title="즉시 재탐색"
                      >
                        <span className="text-sm group-hover:rotate-180 transition-transform duration-500">🔄</span>
                        <span className="text-[11px] font-black md:hidden">새로고침</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 🚀 렌더링 로직: 데이터가 있으면 로딩 중이라도 화면 유지 (V4.0.5) */}
                {isFishingLoading && Object.values(fishingResults).every(arr => arr.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">심해의 트렌드를 스캔하고 있습니다...</p>
                  </div>
                ) : Object.values(fishingResults).some(arr => arr.length > 0) ? (
                  <div className={`max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar space-y-10 transition-opacity duration-300 ${isFishingLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {[
                      { id: 'realTime', title: '실시간 핫이슈 (HOT)', icon: '⚡', color: 'text-orange-400' },
                      { id: 'monthly', title: '이달의 트렌드 (TREND)', icon: '📅', color: 'text-blue-400' },
                      { id: 'annual', title: '연간 공고/이벤트 (ANNUAL)', icon: '🌟', color: 'text-yellow-400' },
                      { id: 'evergreen', title: '황금 키워드 (EVERGREEN)', icon: '💎', color: 'text-emerald-400' }
                    ].filter(quad => activeFishingTab === 'all' || activeFishingTab === quad.id)
                     .map(quad => fishingResults[quad.id]?.length > 0 && (
                      <div key={quad.id} id={`section-${quad.id}`} className="space-y-4">
                        <div className="flex items-center gap-3 sticky top-0 bg-slate-900/95 backdrop-blur-sm py-2 z-10 border-b border-slate-800">
                          <span className="text-xl">{quad.icon}</span>
                          <h4 className={`text-sm font-black ${quad.color} tracking-tight`}>{quad.title}</h4>
                          <span className="text-[10px] text-slate-500 font-bold ml-auto">{fishingResults[quad.id].length}개의 월척 탐지</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {fishingResults[quad.id].map((item, idx) => {
                            const score = parseInt(item.aio_index);
                            const isGreen = score < 40;
                            const isYellow = score >= 40 && score < 70;
                            const isRed = score >= 70;
                            
                            const colorClass = isGreen ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 
                                               isYellow ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10' : 
                                               'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 opacity-60';
                            
                            return (
                              <button 
                                key={idx} 
                                onClick={() => !isRed && handleSelectTopic(item.keyword)}
                                disabled={isRed}
                                className={`w-full text-left rounded-2xl border transition-all ${colorClass} group flex justify-between items-center gap-6 p-8`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h5 className={`font-black truncate text-xl ${isRed ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-indigo-300 transition-colors'}`}>
                                      {item.keyword}
                                    </h5>
                                    <span className={`shrink-0 font-black px-2 py-0.5 rounded-md ${isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-500' : 'bg-red-500'} text-white shadow-lg text-xs`}>
                                      AIO {score}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    {item.reason}
                                  </p>
                                </div>
                                {!isRed && (
                                  <div className="shrink-0 w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner text-xl">
                                    <span className="font-black">➔</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 space-y-3 opacity-50">
                    <span className="text-5xl">⚓</span>
                    <p className="text-slate-400 text-sm font-black tracking-widest uppercase">RADAR STANDBY: PRESS START BUTTON</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: 10000, fontSize: '0.95rem', fontWeight: '500', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', animation: 'fadeInOut 2.5s ease-in-out forwards', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      `}</style>
      {/* 🛡️ 팩트체크 리포트 모달 */}
      {isFactCheckOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter">무결점 정찰 보고서</h3>
                  <p className="text-xs text-indigo-600 font-bold">KODARI Verified Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsFactCheckOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <span className="text-xl text-slate-400">✕</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  "대표님, 본 보고서는 AI가 작성 전 **실시간 구글 검색**을 통해 확보한 팩트 데이터의 근거를 담고 있습니다. 지어낸 이야기가 아닌 정찰된 정보임을 보증합니다!"
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                  정찰 쿼리 (Search Queries)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {groundingMetadata[inputMode]?.searchEntryPoint?.renderedContent ? (
                    <div 
                      className="w-full"
                      dangerouslySetInnerHTML={{ __html: groundingMetadata[inputMode].searchEntryPoint.renderedContent }} 
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groundingMetadata[inputMode]?.searchEntryPoint?.sdkBlob?.googleSearchEntryPoint?.searchQueries?.map((query, idx) => (
                        <a 
                          key={idx} 
                          href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-xl text-xs hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 shadow-sm group"
                        >
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
                          </div>
                          <span className="font-bold">{query}</span>
                          <svg className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )) || (
                        <p className="text-xs text-slate-400 italic">정찰된 정보의 근거를 분석 중입니다...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                  신뢰 출처 (Reliable Sources)
                </h4>
                <div className="space-y-2">
                  {groundingMetadata[inputMode]?.groundingChunks?.map((chunk, idx) => (
                    chunk.web && (
                      <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-bold text-slate-800 line-clamp-2">{chunk.web.title}</p>
                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors shrink-0">방문하기</a>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{chunk.web.uri}</p>
                      </div>
                    )
                  )) || <p className="text-xs text-slate-400 italic">직접적인 웹 출처를 인양 중입니다...</p>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-medium italic">
                ⚓ KODARI V3.5.9 Grounding Radar System 가동 중
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
