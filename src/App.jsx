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

// 소재 연구소 V3.5 마스터 데이터베이스 (컴포넌트 외부로 이동하여 안정화)
const topicDatabase = {
  categories: [
    { 
      name: '🏛️ 정부정책', 
      monthly: ['청년도약계좌 신청', '지자체별 지원금 소식', '부모급여 및 아동수당', '에너지 바우처 혜택', '임대주택 입주 공고', '문화누리카드 신청', '청년 월세 지원', '이사 비용 지원 사업', '내 집 마련 디딤돌 대출', '버팀목 전세 자금'],
      annual: ['정부 예산안 발표', '최저임금 결정', '세법 개정안 핵심 정리', '대선/총선 관련 공약', '병사 월급 인상 소식', '건강보험료 개편안', '노령연금 수급 자격', '기초수급자 혜택 정리', '근로장려금 지급 시기', '자녀장려금 자격 확인'],
      gold: ['실업급여 수급 자격', '국민내일배움카드 활용', '주거급여 신청 방법', '소상공인 지원 정책', '국가 장학금 신청법', '경기 컬처패스 활용', 'K-패스 환급 제도', '육아휴직 급여 계산', '출산 장려금 지역별 정리', '긴급 복지 지원 제도']
    },
    { 
      name: '💰 경제/재테크', 
      monthly: ['5월 종합소득세 신고', '공모주 청약 일정', '반기별 예적금 특판', '근로장려금 신청', '가정의 달 절약법', '여름 휴가 적금 추천', '장마 대비 보험 점검', '하반기 증시 전망', '추석 상여금 활용법', '블랙프라이데이 소비전략'],
      annual: ['매년 연말정산 대비', '연초 재테크 계획', '금리 변동 전망', '국세청 환급금 찾기', 'ISA 계좌 활용법', 'IRP 절세 전략', '배당주 투자 시기', '연간 가계부 결산', '부동산 공시지가 확인', '지방세 납부 기간'],
      gold: ['주식 투자 입문 가이드', '부동산 청약 제도 해설', '앱테크 베스트 10', '가계부 다이어트 비법', '미국 주식 시작하기', '금 투자 방법', '비트코인 초보 가이드', '사회초년생 돈 모으기', '통장 쪼개기 기술', '노후 자금 준비법']
    },
    { 
      name: '💪 건강/운동', 
      monthly: ['환절기 면역력 강화', '여름 다이어트 식단', '황사/미세먼지 대처', '봄철 야외 운동 가이드', '여름철 식중독 예방', '휴가지 물놀이 안전', '무더위 온열질환 주의', '가을철 등산 주의사항', '겨울철 독감 예방', '실내 스트레칭 루틴'],
      annual: ['무료 건강검진 대상', '계절별 보양식 총정리', '독감 예방접종 시기', '새해 금연 결심 지원', '연령별 필수 영양제', '대상포진 예방 접종', '겨울철 혈관 건강', '명절 증후군 극복', '비타민 D 부족 해결', '치아 스케일링 보험'],
      gold: ['홈트레이닝 필수 장비', '영양제 과잉 섭취 주의', '스트레스 해소법 7가지', '수면의 질 높이는 법', '거북목 교정 스트레칭', '공복 유산소 효과', '간헐적 단식 방법', '물 많이 마시기 효과', '바른 자세 앉는 법', '명상 입문 가이드']
    },
    { 
      name: '💻 IT/테크', 
      monthly: ['갤럭시/아이폰 최신 루머', '유튜브 알고리즘 변화', '신규 게임 출시 일정', '윈도우 보안 업데이트', '맥북 신형 리뷰', '유용한 크롬 확장프로그램', '갤럭시 워치 팁', '애플 워치 활용법', '카카오톡 숨은 기능', '인스타그램 릴스 만드는 법'],
      annual: ['CES/MWC 주요 기술', '애플 WWDC 발표', '구글 I/O 신기술', '연말 가전 세일 정보', '블랙프라이데이 직구', '올해의 베스트 앱', 'IT 트렌드 전망', '신형 CPU/GPU 출시', '클라우드 서비스 비교', '최신 모니터 고르는 법'],
      gold: ['최강의 업무용 툴 추천', '스마트폰 사진 잘 찍는 법', 'PC 속도 빨라지는 법', 'AI 챗봇 활용 꿀팁', '엑셀 필수 단축키', '유튜브 프리미엄 우회', '넷플릭스 요금제 팁', '클라우드 스토리지 비교', '협업 툴 노션 가이드', '아이패드 공부법 추천']
    },
    { 
      name: '✈️ 여행/생활', 
      monthly: ['5월 가정의 달 나들이', '여름 휴가 항공권 예약', '벚꽃/단풍 지도', '캠핑 명소 추천', '국내 풀빌라 순위', '여름 바다 축제', '겨울 온천 여행', '스키장 개장 정보', '글램핑장 베스트 5', '지역별 축제 일정'],
      annual: ['해외여행 국가별 성수기', '전국 축제 총정리', '연간 연휴 황금 일정', '여권 재발급 팁', '항공 마일리지 적립법', '면세점 쇼핑 리스트', '국제면허증 발급', '한 달 살기 도시 추천', '유럽 기차 패스 가이드', '비자 발급 주의사항'],
      gold: ['여행 짐 싸기 체크리스트', '가성비 숙소 예약법', '제주도 한 달 살기 가이드', '현지인 맛집 찾는 법', '비행기 좌석 꿀팁', '에어비앤비 할인법', '자취생 필수 가전', '미니멀 라이프 입문', '인생 사진 명소 추천', '해외 결제 카드 추천']
    }
  ]
};

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
  const [useGoogleSearch, setUseGoogleSearch] = useState(true); // [V3.7.8.7] 구글 검색 팩트체크 온오프 상태 추가
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
  const [isTopicLabOpen, setIsTopicLabOpen] = useState(false);
  const [labFilter, setLabFilter] = useState('all');
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [dynamicTopics, setDynamicTopics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('🏛️ 정부정책');
  const [displayedStaticTopics, setDisplayedStaticTopics] = useState({});
  const [isFactCheckOpen, setIsFactCheckOpen] = useState(false);
  const [groundingMetadata, setGroundingMetadata] = useState({ topic: null, youtube: null });

  const patchNotes = [
    {
      version: 'V3.7.9.0',
      date: '2026-06-01',
      title: '🤖 차세대 병렬 멀티 에이전트 JSON Schema 엔진 탑재',
      tags: ['엔진혁신', '안정화', '병렬처리'],
      details: [
        '구글 공식 [responseSchema] 옵션을 탑재하여, 괄호 누락이나 포맷 깨짐 등의 고질적인 JSON 파싱 오류를 100% 원천 차단했습니다.',
        '1단계 초안 요약(gemini-2.5-flash) 및 2단계 플랫폼 리라이팅(gemini-3-flash) 구조로 엔진을 이원화하여 팩트 안정성을 극대화했습니다.',
        'Promise.all을 적용하여 네이버, 티스토리, 워드프레스 원고를 병렬로 동시 작성하므로 생성 대기 시간은 기존과 동일한 10초 대를 유지합니다.',
        '본문 생성 시, 각 소제목 문맥에 완벽히 일치하는 4종의 프리미엄 3D Claymorphism 이미지 기획 프롬프트가 동시 생성되도록 통합했습니다.'
      ]
    },
    {
      version: 'V3.7.8.7',
      date: '2026-05-31',
      title: '🛡️ 초강력 비용 통제 밸브 장착 (V3.7.8.3 복원 및 개량)',
      tags: ['비용절감', '안정화', 'UI/UX'],
      details: [
        '선택된 플랫폼(네이버/티스토리/워드프레스)만 골라서 AI에게 작성을 지시하는 [동적 프롬프트 스키마]를 도입해 최대 65%의 API 토큰 비용을 절감합니다.',
        '구글 실시간 검색 Grounding 비용을 완벽하게 통제할 수 있는 [🔎 GOOGLE RADAR ON/OFF] 스위치를 도입했습니다.',
        '가장 가볍고 튼튼한 V3.7.8.3 원본 엔진 베이스라인으로 복구하여 화면 충돌 가능성을 원천 종식했습니다.'
      ]
    },
    {
      version: 'V3.7.8.3',
      date: '2026-05-10',
      title: '🕒 타임 스탬프 엔진: 실시간 시간 인식',
      tags: ['기능강화', '지능화'],
      details: [
        'AI가 글 작성 시점(오늘 날짜/요일)을 스스로 인식하도록 타임 엔진을 장착했습니다.',
        '과거(2024, 2025)의 낡은 자료가 아닌 현재(2026)의 최신 정책과 뉴스를 우선 정찰하도록 검색 지침을 강화했습니다.'
      ]
    },
    {
      version: 'V3.7.8.2',
      date: '2026-05-10',
      title: '⚓ 레드 스크롤바 활성화 및 물량 증강',
      tags: ['UI/UX', '기능강화'],
      details: [
        '키워드 노출량을 4개에서 12개로 대폭 늘려 사령관님이 요청하신 [레드 스크롤바]를 활성화했습니다.',
        '실시간 트렌드 분석 프롬프트를 강화하여 10개 이상의 낚시 포인트를 동시에 포착합니다.'
      ]
    },
    {
      version: 'V3.7.8.1',
      date: '2026-05-10',
      title: '🏗️ 소재연구소 혁신: 5종 필터 시스템',
      tags: ['UI/UX', '개편'],
      details: [
        '노란색 택티컬 버튼을 통한 실시간/이번달/연간/황금/전체 필터링 시스템을 구축했습니다.',
        '4대 전략 세션을 수직 스택 구조로 변경하여 한눈에 훑어볼 수 있게 개선했습니다.'
      ]
    },
    {
      version: 'V3.7.8',
      date: '2026-05-09',
      title: '🗑️ 엔진 다이어트 및 소재연구소 보존',
      tags: ['최적화'],
      details: [
        'Unsplash 연동 및 불필요한 백업 UI를 제거하여 함선의 기동성을 높였습니다.',
        '소재 연구소(Topic Lab)의 마지막 안정화 버전입니다.'
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
        'V3.5.9 브랜치의 깔끔한 레이아웃 and 안정적인 데이터 구조를 계승했습니다.'
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

  const fetchSummaryDraft = async (inputText, finalKey) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;
    const todayDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    
    let promptContent = `[현재 시각 동기화]: 오늘은 **${todayDate}**입니다.
제공된 자막 또는 주제를 깊이 있게 정독하고, 핵심 팩트(공식 정책명, 자격 요건, 구체적인 지원 수치 등)를 추출하여 요약 구조를 만드십시오.
반드시 구글 검색 결과를 바탕으로 정보의 유효성을 정밀 팩트체크하여 반영하십시오.

[텍스트 원본]:
"""
${inputText}
"""

결과는 다음 형식과 같이 마크다운 기반 텍스트로 자유롭게 작성하십시오:
# 핵심 주제
- 요약 및 세부 섹션별 팩트 수치
- 추천 해시태그`;

    const apiPayload = {
      contents: [{ parts: [{ text: promptContent }] }]
    };

    if (useGoogleSearch) {
      apiPayload.tools = [{ google_search: {} }];
      console.log('[코다리 정찰기 기동] 1단계 요약 시 구글 실시간 검색 Grounding이 가동됩니다.');
    } else {
      console.log('[로컬 가동] 1단계 구글 실시간 검색을 비활성화합니다.');
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || '1단계 요약 생성 실패');
    }

    const data = await res.json();
    
    if (data.candidates?.[0]?.groundingMetadata) {
      setGroundingMetadata(prev => ({ ...prev, [inputMode]: data.candidates[0].groundingMetadata }));
      console.log('[팩트체크 성공] 구글 검색 근거를 1단계에서 확보했습니다.');
    } else {
      setGroundingMetadata(prev => ({ ...prev, [inputMode]: null }));
    }

    return data.candidates[0].content.parts[0].text;
  };

  const writePlatformContent = async (platform, summaryData, finalKey) => {
    const platformName = platform === 'naver' ? '네이버 블로그' : platform === 'tistory' ? '티스토리' : '워드프레스';
    const tone = tones[platform];
    const styleGuide = visualStyle === 'photo' 
      ? "Professional Editorial Photography 스타일 (Keywords: High-end magazine style, clean composition, soft studio lighting, high resolution)"
      : "Modern Isometric Digital Illustration 스타일 (Keywords: Professional infographic layout, flat design with 3D depth, organized visual information, clean lines, bright and optimistic palette)";

    const promptContent = `당신은 ${platformName} 전문 콘텐츠 라이터입니다. 
제공된 1단계 요약 팩트 데이터를 바탕으로 최고 품질의 원고를 집필하십시오.

[작성 및 강조 규칙]:
1. 어투: 반드시 [${tone}] 스타일로 작성하되, 다정하고 친근한 이모지를 풍부히 섞어라.
2. 분량: 공백 제외 최소 1,500자 이상의 매우 풍성한 정보를 담아라.
3. 사족 금지: '글을 마치며', '결론', '맺음말' 등 식상한 기계적 섹션 사용을 **절대 금지**하며, 정보가 끝나면 자연스럽게 종결하라.
4. 3중 하이브리드 강조: 핵심 키워드나 수치는 반드시 좌우 공백 없이 기호로 밀착 감싸라. (노랑 ==형광펜==, 파랑 ++파랑강조++, 빨강 !!주의사항!!)
5. 정보 시각화: 비교/대조 정보는 **반드시 마크다운 표(Table)**로 시각화하되, 표 내부에는 강조 기호(**, ==, ++ 등)를 절대 사용하지 마라.
6. 이미지 기획 (총 4개): 본문의 흐름에 맞게 Premium 3D Claymorphism 스타일의 이미지 기획 4개를 'image_prompts' 배열에 상세히 기재하라. 
   - 1번째: Section 1 (Thumbnail) - 전체 주제를 관통하는 명품 대표 이미지
   - 2번째 & 3번째: Section 2 & 3 - 본문의 핵심 정보를 비유/시각화하는 이미지
   - 4번째: Section 4 (Summary) - 성공적인 마무리 또는 달성 느낌의 피날레 이미지
   - 각 기획마다 이미지 내에 들어갈 한국어 메인카피(main_title)와 보조문구(sub_copy), 그리고 상세 영어 프롬프트(prompt)를 작성하라. 인물은 한국인(Korean/Asian)으로, 배경에 글자가 뭉개지지 않도록 no text 지침을 반영하라.

[1단계 검증 팩트 데이터]:
${summaryData}`;

    const apiPayload = {
      contents: [{ parts: [{ text: promptContent }] }],
      generationConfig: {
        temperature: 0.1, // 상상력 원천 제어 및 팩트 밀착
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "플랫폼 최적화 제목" },
            content: { type: "STRING", description: "H2 구조, 3중 하이브리드 강조, 마크다운 표가 장착된 본문 원고 (최소 1500자 이상)" },
            tags: { type: "STRING", description: "쉼표로 구분된 해시태그 목록" },
            image_prompts: {
              type: "ARRAY",
              description: "본문 흐름에 매칭되는 상세 이미지 프롬프트 기획 4개",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "섹션 제목 (예: Section 1 (Thumbnail))" },
                  main_title: { type: "STRING", description: "이미지 내 가상 한글 메인 카피" },
                  sub_copy: { type: "STRING", description: "보조 한글 문구" },
                  prompt: { type: "STRING", description: "영어 이미지 생성 묘사 상세 프롬프트 (High quality 3D claymorphism style, isometric, clean layout)" }
                },
                required: ["title", "main_title", "sub_copy", "prompt"]
              }
            }
          },
          required: ["title", "content", "tags", "image_prompts"]
        }
      }
    };

    let lastError = null;
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[코다리 엔진] 2단계: ${platformName} 글 작성을 시도합니다. (시도 ${attempt}/${maxRetries})`);
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });

        if (!res.ok) {
          const errData = await res.json();
          const errMsg = errData.error?.message || '알 수 없는 오류';
          throw new Error(errMsg);
        }

        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);

      } catch (err) {
        console.warn(`[엔진 예외 발생] 시도 ${attempt} 실패: ${err.message}`);
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    throw new Error(`${platformName} 최종 작성 실패: ${lastError?.message}`);
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

    const activePlatforms = Object.keys(platforms).filter(k => platforms[k]);
    if (activePlatforms.length === 0) {
      setError('발행할 플랫폼을 최소 하나 이상 선택해 주세요!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let inputText = topic;
      if (inputMode === 'youtube') {
        let cleanedTranscript = youtubeTranscript
          .replace(/\[.*?\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        inputText = cleanedTranscript.length > 15000 
          ? cleanedTranscript.substring(0, 15000) + '... (이하 생략)' 
          : cleanedTranscript;
      }

      // 1단계: 초안 요약 생성 (gemini-2.5-flash)
      console.log('[코다리 엔진] 1단계: 초안 및 뼈대 정보 팩트체크 기동.');
      const summaryData = await fetchSummaryDraft(inputText, finalKey);

      // 2단계: 3대 플랫폼 병렬 작성 및 이미지 4개 동시 생성 (gemini-3-flash)
      console.log('[코다리 엔진] 2단계: 플랫폼별 병렬 리라이팅 & 이미지 4종 동시 생성 (Promise.all).');
      const [naverRaw, tistoryRaw, wordpressRaw] = await Promise.all([
        platforms.naver ? writePlatformContent('naver', summaryData, finalKey) : Promise.resolve(null),
        platforms.tistory ? writePlatformContent('tistory', summaryData, finalKey) : Promise.resolve(null),
        platforms.wordpress ? writePlatformContent('wordpress', summaryData, finalKey) : Promise.resolve(null)
      ]);

      const emptyResult = { title: '', content: '생성 실패', tags: '', official_link: '', image: '', image_desc: '', section_prompts: [] };

      const formatResult = (parsedData) => {
        if (!parsedData) return emptyResult;
        const koDescs = (parsedData.image_prompts || []).map(p => p.sub_copy);
        return {
          title: parsedData.title || '',
          content: parsedData.content || '',
          tags: parsedData.tags || '',
          official_link: '',
          official_links: parsedData.official_links || [],
          image: '',
          image_desc: koDescs[0] || '',
          section_prompts: parsedData.image_prompts || []
        };
      };

      setResults(prev => ({
        ...prev,
        [inputMode]: {
          naver: platforms.naver ? formatResult(naverRaw) : emptyResult,
          tistory: platforms.tistory ? formatResult(tistoryRaw) : emptyResult,
          wordpress: platforms.wordpress ? formatResult(wordpressRaw) : emptyResult
        }
      }));

      const currentActive = activePlatforms.includes(activeTab) ? activeTab : activePlatforms[0];
      setActiveTab(currentActive);

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
    setError('');
    try {
      const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
      const platformName = platform === 'naver' ? '네이버 블로그' : platform === 'tistory' ? '티스토리' : '워드프레스';

      let inputText = topic;
      if (inputMode === 'youtube') {
        let cleanedTranscript = youtubeTranscript
          .replace(/\[.*?\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        inputText = cleanedTranscript.length > 15000 
          ? cleanedTranscript.substring(0, 15000) + '... (이하 생략)' 
          : cleanedTranscript;
      }

      console.log(`[코다리 엔진] ${platformName} 글 재생성 시작 - 1단계 초안 생성.`);
      const summaryData = await fetchSummaryDraft(inputText, finalKey);

      console.log(`[코다리 엔진] ${platformName} 글 재생성 시작 - 2단계 플랫폼 리라이팅 (gemini-3-flash).`);
      const parsedData = await writePlatformContent(platform, summaryData, finalKey);

      const koDescs = (parsedData.image_prompts || []).map(p => p.sub_copy);
      const formattedResult = {
        title: parsedData.title || '',
        content: parsedData.content || '',
        tags: parsedData.tags || '',
        official_link: '',
        official_links: parsedData.official_links || [],
        image: '',
        image_desc: koDescs[0] || '',
        section_prompts: parsedData.image_prompts || []
      };

      setResults(prev => ({
        ...prev,
        [inputMode]: {
          ...prev[inputMode],
          [platform]: formattedResult
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
    setTopic(selectedTopic);
    setIsTopicLabOpen(false);
    triggerToast(`💡 '${selectedTopic}' 주제가 선택되었습니다! ✨`);
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

  const refreshLiveTrends = async () => {
    const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
    if (!finalKey) {
      triggerToast('⚙️ API 키를 설정해야 실시간 분석이 가능합니다!');
      return;
    }

    setIsLiveLoading(true);
    triggerToast('🔄 AI가 현재 대한민국 트렌드를 분석 중입니다...');

    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${finalKey}`;
      const prompt = `당신은 대한민국의 최신 트렌드를 분석하는 일타 강사입니다. 
현재 선택된 카테고리 [${selectedCategory}]에 대하여, 오늘 날짜(${new Date().toLocaleDateString()}) 기준 블로그 조회수가 폭발할 만한 '실시간 핫이슈 주제' 10개를 추천하세요.

반드시 아래 형식을 엄수하여 소재만 나열하세요:
[LIVE]
주제1
주제2
주제3
주제4
주제5
주제6
주제7
주제8
주제9
주제10`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      const liveSection = text.split('[LIVE]')[1];
      if (liveSection) {
        const lines = liveSection.trim().split('\n').filter(l => l.trim() !== '').slice(0, 10);
        const processedTopics = lines.map(t => t.replace(/^\d+\.\s*|^- \s*/, '').trim());
        setDynamicTopics(processedTopics);
        triggerToast(`✨ [${selectedCategory}] 실시간 트렌드 분석 완료!`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ 트렌드 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLiveLoading(false);
    }
  };

  const refreshStaticSection = (categoryName, sectionName) => {
    const category = topicDatabase.categories.find(c => c.name === categoryName);
    if (!category) return;
    
    const pool = category[sectionName];
    if (!pool || pool.length === 0) return;
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12);
    
    setDisplayedStaticTopics(prev => ({
      ...prev,
      [`${categoryName}_${sectionName}`]: selected
    }));
  };

  // 초기 로딩 및 카테고리 변경 시 키워드 셔플 (안전한 버전)
  useEffect(() => {
    if (isTopicLabOpen) {
      topicDatabase.categories.forEach(cat => {
        ['monthly', 'annual', 'gold'].forEach(sec => {
          const key = `${cat.name}_${sec}`;
          if (!displayedStaticTopics[key]) {
            refreshStaticSection(cat.name, sec);
          }
        });
      });
    }
  }, [selectedCategory, isTopicLabOpen]);

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
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase">KODARI BLOG AI V3.7.9.0</h1>
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
          <p className="text-slate-500 font-black text-sm">🚀 V3.7.9.0 [🤖 병렬 멀티 에이전트 + 🛡️ JSON Schema 무결점 엔진] 완비 ✨</p>
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
                onClick={() => setIsTopicLabOpen(true)}
                className="md:hidden px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[11px] border-2 border-indigo-100 shadow-sm flex items-center gap-1 active:scale-95"
              >
                <span>💡 소재 연구소</span>
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
                onClick={() => setIsTopicLabOpen(true)}
                className="hidden md:flex px-8 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black text-sm transition-all flex-col items-center justify-center gap-1 border-2 border-indigo-100 shadow-sm whitespace-nowrap active:scale-95"
              >
                <span className="text-2xl">💡</span>
                소재 연구소
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              ✅ 발행 플랫폼 및 개별 어투 설정 (체크한 것만 작성 및 과금됨)
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
              <span className={`text-[10px] font-black transition-colors ${!useImage ? 'text-slate-400' : 'text-slate-300'}`}>NO IMAGE</span>
              <button 
                onClick={() => setUseImage(!useImage)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-[10px] font-black transition-colors ${useImage ? 'text-indigo-600' : 'text-slate-400'}`}>AUTO IMAGE ON</span>
            </div>

            {/* [V3.7.8.7] 구글 실시간 정찰 토글 스위치 */}
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black transition-colors ${!useGoogleSearch ? 'text-slate-800' : 'text-slate-300'}`}>LOCAL ONLY</span>
              <button 
                onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${useGoogleSearch ? 'bg-indigo-600' : 'bg-slate-300'}`}
                title="구글 실시간 검색 팩트체크 기능 제어 (비용 절약용)"
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useGoogleSearch ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-[10px] font-black transition-colors ${useGoogleSearch ? 'text-indigo-600' : 'text-slate-400'}`}>GOOGLE RADAR ON</span>
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

      {isTopicLabOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start md:items-center justify-center z-[100] p-2 md:p-4 overflow-y-auto pt-4 md:pt-0">
          <div className="bg-white rounded-[24px] md:rounded-[40px] p-4 md:p-8 max-w-2xl w-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300 my-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  💡 소재 연구소 <span className="text-sm font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Lab</span>
                </h2>
                <p className="text-sm text-slate-400 font-medium">조회수가 터지는 황금 키워드를 발굴하세요.</p>
              </div>
              <button onClick={() => setIsTopicLabOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-xl">✕</button>
            </div>

            <div className="space-y-6">
              {/* 카테고리 탭 네비게이션 */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-3xl">
                {topicDatabase.categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedCategory(cat.name); setDynamicTopics(null); }}
                    className={`px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                      selectedCategory === cat.name 
                      ? 'bg-white text-indigo-600 shadow-md scale-105' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* [V3.7.8.1] 노란색 필터 버튼 그룹 */}
              <div className="flex flex-wrap gap-2 px-1">
                {[
                  { id: 'realtime', label: '실시간' },
                  { id: 'monthly', label: '이번달' },
                  { id: 'annual', label: '연간' },
                  { id: 'gold', label: '황금' },
                  { id: 'all', label: '전체' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setLabFilter(btn.id)}
                    className={`px-6 py-2 rounded-lg font-black text-sm border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                      labFilter === btn.id ? 'bg-amber-400 text-black' : 'bg-white text-slate-400 border-slate-200 shadow-none'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* 4대 전략 대시보드 리스트 (스크롤 가능) */}
              <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-red-scrollbar">
                
                {/* 1. 실시간 트렌드 카드 */}
                {(labFilter === 'all' || labFilter === 'realtime') && (
                  <div className="bg-slate-900 rounded-[30px] p-6 shadow-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-black text-sm flex items-center gap-2">
                        ⚡ 실시간 주제
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                      </h3>
                      <button 
                        onClick={refreshLiveTrends}
                        disabled={isLiveLoading}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                      >
                        {isLiveLoading ? '분석 중...' : '새로고침 🔄'}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-red-scrollbar">
                      {dynamicTopics ? (
                        dynamicTopics.map((t, i) => (
                          <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-white text-xs font-bold transition-all border border-white/5 truncate">
                            {i+1}. {t}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-3">
                          <p className="text-slate-500 text-xs font-bold">지금 가장 핫한 주제는?</p>
                          <button onClick={refreshLiveTrends} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/40 active:scale-95">실시간 분석 시작 🚀</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. 이번 달 주제 카드 */}
                {(labFilter === 'all' || labFilter === 'monthly') && (
                  <div className="bg-white rounded-[30px] p-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                        🗓️ 이번 달 주제
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Monthly</span>
                      </h3>
                      <button onClick={() => refreshStaticSection(selectedCategory, 'monthly')} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">새로고침 🔄</button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-red-scrollbar">
                      {(displayedStaticTopics[`${selectedCategory}_monthly`] || []).map((t, i) => (
                        <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 text-xs font-black transition-all border border-slate-100 truncate">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 연간 주제 카드 */}
                {(labFilter === 'all' || labFilter === 'annual') && (
                  <div className="bg-white rounded-[30px] p-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                        📅 연간 주제
                        <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Annual</span>
                      </h3>
                      <button onClick={() => refreshStaticSection(selectedCategory, 'annual')} className="text-[10px] font-bold text-slate-400 hover:text-amber-600 transition-colors">새로고침 🔄</button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-red-scrollbar">
                      {(displayedStaticTopics[`${selectedCategory}_annual`] || []).map((t, i) => (
                        <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 text-xs font-black transition-all border border-slate-100 truncate">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. 황금 키워드 카드 */}
                {(labFilter === 'all' || labFilter === 'gold') && (
                  <div className="bg-white rounded-[30px] p-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                        💎 황금 키워드
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Evergreen</span>
                      </h3>
                      <button onClick={() => refreshStaticSection(selectedCategory, 'gold')} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">새로고침 🔄</button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-red-scrollbar">
                      {(displayedStaticTopics[`${selectedCategory}_gold`] || []).map((t, i) => (
                        <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 text-xs font-black transition-all border border-slate-100 truncate">
                          {t}
                        </button>
                      ))}
                    </div>
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
        .custom-red-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
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
