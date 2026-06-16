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

const fetchWithRetry = async (url, options = {}, maxRetries = 2, delayMs = 2500) => {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP 에러 ${res.status}`);
      }
      return res;
    } catch (err) {
      console.warn(`[네트워크 재시도] ${attempt}/${maxRetries} 실패: ${err.message}`);
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
};

function App() {
  const [inputMode, setInputMode] = useState('topic'); // 'topic' or 'youtube'
  const [youtubeTranscript, setYoutubeTranscript] = useState('');
  const [topic, setTopic] = useState('');
  
  // [V3.7.9.4] TDZ 호이스팅 오류 해결을 위해 소재연구소 상태 변수 선언부를 상단으로 긴급 인양
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [dynamicTopics, setDynamicTopics] = useState({}); // [V3.7.9.4] 카테고리별 개별 독립 서랍 구조로 리팩토링 ({ '🏛️ 정부정책': [...] })
  const [dynamicTopicsTimestamps, setDynamicTopicsTimestamps] = useState({}); // ⏱️ [V3.7.9.7] 카테고리별 실시간 주제 수집 시간 기록 ({ '🏛️ 경제/재테크': '2026-06-16 22:15' })
  const [selectedCategory, setSelectedCategory] = useState('🏛️ 정부정책');
  const [displayedStaticTopics, setDisplayedStaticTopics] = useState({});

  const [tones, setTones] = useState({
    naver: '기본 블로거',
    tistory: '기본 블로거',
    wordpress: '명쾌한 정보 전달자'
  });
  const [platforms, setPlatforms] = useState({ naver: true, tistory: true, wordpress: true });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 🧭 [V3.7.9.8] 독립형 소재연구소(Standalone Lab Mode) 판단 및 쿼리 주입 로직
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isStandaloneLab = queryParams.get('mode') === 'lab';

  // 🧭 [V3.7.9.8] URL 파라미터 topic 주입 및 postMessage 리스너 가동
  useEffect(() => {
    // 1. 주소창 ?topic= 값 주입
    const paramTopic = queryParams.get('topic');
    if (paramTopic) {
      setTopic(decodeURIComponent(paramTopic));
      setInputMode('topic');
      // 브라우저 주소창 청소 (새로고침 시 중복 주입 방지)
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.warn(e);
      }
    }

    // 2. postMessage 수신 리스너 (자식 소재연구소 탭에서 주제 주입)
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'KODARI_SELECT_TOPIC') {
        setTopic(e.data.topic);
        setInputMode('topic');
        triggerToast(`💡 '${e.data.topic}' 주제가 소재연구소에서 주입되었습니다! ✨`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 🧭 [V3.7.9.8] 소재연구소 새 창(새 탭) 띄우기 함수
  const handleOpenTopicLab = () => {
    window.open('/?mode=lab', '_blank');
  };
  const emptyPlatformResult = { title: '', content: '', tags: '', official_links: [], image: '', image_desc: '', section_prompts: [] };
  const [results, setResults] = useState({
    topic: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
    youtube: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
    fact: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult }
  });
  
  // 🔍 [V3.7.9.7] 1단계 팩트 검증/기획 데이터 상태 추가
  const [summaryData, setSummaryData] = useState({ topic: '', youtube: '', fact: '' });
  const [activeTab, setActiveTab] = useState('naver');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // 💾 [V3.7.9.1] 로컬 스토리지 백업 및 복원 헬퍼 함수 (V3.7.9.7 summaryData 저장 확장)
  const saveCurrentSession = (
    updatedResults, 
    updatedActiveTab, 
    updatedInputMode, 
    updatedTopic, 
    updatedYoutube,
    updatedCategory = selectedCategory,
    updatedDynamic = dynamicTopics,
    updatedStatic = displayedStaticTopics,
    updatedSummary = summaryData,
    updatedTimestamps = dynamicTopicsTimestamps
  ) => {
    try {
      const sessionData = {
        timestamp: Date.now(),
        results: updatedResults,
        activeTab: updatedActiveTab,
        inputMode: updatedInputMode,
        topic: updatedTopic,
        youtubeTranscript: updatedYoutube,
        selectedCategory: updatedCategory,
        dynamicTopics: updatedDynamic,
        displayedStaticTopics: updatedStatic,
        summaryData: updatedSummary, // 🔍 [V3.7.9.7] 1단계 팩트체크 기획서 데이터 백업 추가
        dynamicTopicsTimestamps: updatedTimestamps // ⏱️ [V3.7.9.7] 실시간 주제 수집 시간 기록 추가
      };
      localStorage.setItem('kodari_saved_session', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('[코다리 엔진] 자동 백업 저장 실패 (시크릿 모드 가능성):', e);
    }
  };

  // 💾 [V3.7.9.1] 컴포넌트 최초 마운트 시 세션 복구 및 24시간 만료 체크
  useEffect(() => {
    const savedSessionRaw = localStorage.getItem('kodari_saved_session');
    if (savedSessionRaw) {
      try {
        const session = JSON.parse(savedSessionRaw);
        const now = Date.now();
        const expiryLimit = 24 * 60 * 60 * 1000; // 24시간
        
        if (now - session.timestamp < expiryLimit) {
          if (session.results) {
            setResults({
              topic: session.results.topic || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
              youtube: session.results.youtube || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
              fact: session.results.fact || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult }
            });
          }
          if (session.activeTab) setActiveTab(session.activeTab);
          if (session.inputMode) setInputMode(session.inputMode);
          if (session.topic) setTopic(session.topic);
          if (session.youtubeTranscript) setYoutubeTranscript(session.youtubeTranscript);
          
          if (session.summaryData) {
            if (typeof session.summaryData === 'string') {
              setSummaryData({ topic: '', youtube: session.summaryData, fact: '' });
            } else {
              setSummaryData({
                topic: session.summaryData.topic || '',
                youtube: session.summaryData.youtube || '',
                fact: session.summaryData.fact || ''
              });
            }
          }
          
          if (session.selectedCategory) setSelectedCategory(session.selectedCategory);
          if (session.dynamicTopics) {
            if (Array.isArray(session.dynamicTopics)) {
              const initCat = session.selectedCategory || '🏛️ 정부정책';
              setDynamicTopics({ [initCat]: session.dynamicTopics });
            } else {
              setDynamicTopics(session.dynamicTopics);
            }
          }
          if (session.dynamicTopicsTimestamps) setDynamicTopicsTimestamps(session.dynamicTopicsTimestamps);
          if (session.displayedStaticTopics) setDisplayedStaticTopics(session.displayedStaticTopics);
          
          console.log('[코다리 엔진] 24시간 이내 백업 세션 복구 완료 (이중 호환 보정 및 수집시각 복원 적용)! 🫡');
        } else {
          localStorage.removeItem('kodari_saved_session');
          console.log('[코다리 엔진] 24시간이 경과한 임시 백업 세션을 자동 파기했습니다. 🧹');
        }
      } catch (e) {
        console.error('[코다리 엔진] 백업 세션 복구 실패:', e);
        localStorage.removeItem('kodari_saved_session');
      }
    }
  }, []);

  // 💾 [V3.7.9.5] 결과, 활성화 탭, 입력 모드, 키워드 및 [소재연구소/팩트 데이터] 변경 시 오토세이브 실시간 갱신 (전수 감시)
  useEffect(() => {
    const hasDynamicData = dynamicTopics && Object.keys(dynamicTopics).length > 0;
    
    // 🛡️ 호환성 안전 장치: results[inputMode]가 복구 과정에서 누락되어 undefined가 된 경우 방어
    const currentModeResults = results[inputMode] || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult };
    const currentModeSummary = summaryData[inputMode] || '';

    const hasData = Object.values(currentModeResults).some(val => val.content) || 
                    topic.trim() || 
                    youtubeTranscript.trim() || 
                    currentModeSummary ||
                    hasDynamicData || 
                    Object.keys(displayedStaticTopics).length > 0;
    if (hasData) {
      saveCurrentSession(
        results, 
        activeTab, 
        inputMode, 
        topic, 
        youtubeTranscript,
        selectedCategory,
        dynamicTopics,
        displayedStaticTopics,
        summaryData,
        dynamicTopicsTimestamps
      );
    }
  }, [results, activeTab, inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, summaryData, dynamicTopicsTimestamps]);

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
  const [isFactCheckOpen, setIsFactCheckOpen] = useState(false);
  const [groundingMetadata, setGroundingMetadata] = useState({ topic: null, youtube: null, fact: null });
  const [backupInputCode, setBackupInputCode] = useState('');

  // 🔍 [V3.7.9.7] 상태 감지: 1단계 팩트가 수확되었고, 체크된 플랫폼 중 비어있거나 실패한 글이 있는지 감지
  const hasDraft = !!summaryData[inputMode];
  const checkedActivePlatforms = Object.keys(platforms).filter(k => platforms[k]);
  const missingResults = checkedActivePlatforms.some(p => !results[inputMode][p]?.content || results[inputMode][p]?.content === '생성 실패' || results[inputMode][p]?.content === '');
  const isPartialState = hasDraft && missingResults;

  // 🌀 [V3.7.9.6] 백업 포탈 데이터 압축/인코딩 헬퍼 함수
  const generateBackupCode = () => {
    try {
      const backupObj = {
        results,
        activeTab,
        inputMode,
        topic,
        youtubeTranscript,
        selectedCategory,
        dynamicTopics,
        dynamicTopicsTimestamps, // ⏱️ [V3.7.9.7] 실시간 주제 수집 시간 기록 백업 추가
        displayedStaticTopics,
        summaryData, // 🔍 [V3.7.9.7] 1단계 팩트 데이터 패키징 포함
        version: 'V3.7.9.8',
        timestamp: Date.now()
      };
      
      const jsonStr = JSON.stringify(backupObj);
      const encodedData = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      
      // ⏱️ [V3.7.9.8] 백업코드 생성 시점 날짜와 시간 포맷팅 (YYYYMMDD_HHMM)
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      const finalCode = `KODARI_V3798_${formattedDate}_${encodedData}`;
      copyToClipboard(finalCode);
      triggerToast('🌀 백업 포탈 코드가 클립보드에 복사되었습니다! 카톡 등으로 PC에 보내세요. 🫡');
    } catch (e) {
      console.error('[코다리 엔진] 백업 코드 생성 실패:', e);
      triggerToast('❌ 백업 코드 생성에 실패했습니다.');
    }
  };

  const loadBackupCode = (code) => {
    if (!code || !code.trim()) {
      triggerToast('⚠️ 입력된 코드가 비어 있습니다.');
      return;
    }
    const cleanCode = code.trim();
    
    // 🌀 [미래 대비형 영구 호환 센서] KODARI_V[버전숫자]_[선택적날짜시간_]?[알맹이] 구조를 유연하게 자동 감지 (하위호환 유지)
    const match = cleanCode.match(/^KODARI_V(\d+)(?:_(\d{8}_\d{4}))?_(.+)$/);
    if (!match) {
      triggerToast('❌ 올바른 코다리 백업 코드가 아닙니다.');
      return;
    }
    
    try {
      // match[3]은 날짜시간 주입 여부에 관계없이 항상 순수한 암호화 Base64 데이터만 골라냅니다.
      const base64Data = match[3]; 
      const jsonStr = decodeURIComponent(atob(base64Data).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const backupObj = JSON.parse(jsonStr);
      
      // 상태 복원
      if (backupObj.results) {
        setResults({
          topic: backupObj.results.topic || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
          youtube: backupObj.results.youtube || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
          fact: backupObj.results.fact || { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult }
        });
      }
      if (backupObj.activeTab) setActiveTab(backupObj.activeTab);
      if (backupObj.inputMode) setInputMode(backupObj.inputMode);
      if (backupObj.topic) setTopic(backupObj.topic);
      if (backupObj.youtubeTranscript) setYoutubeTranscript(backupObj.youtubeTranscript);
      if (backupObj.selectedCategory) setSelectedCategory(backupObj.selectedCategory);
      if (backupObj.summaryData) {
        if (typeof backupObj.summaryData === 'string') {
          setSummaryData({ topic: '', youtube: backupObj.summaryData, fact: '' });
        } else {
          setSummaryData({
            topic: backupObj.summaryData.topic || '',
            youtube: backupObj.summaryData.youtube || '',
            fact: backupObj.summaryData.fact || ''
          });
        }
      }
      
      if (backupObj.dynamicTopics) {
        if (Array.isArray(backupObj.dynamicTopics)) {
          const initCat = backupObj.selectedCategory || '🏛️ 정부정책';
          setDynamicTopics({ [initCat]: backupObj.dynamicTopics });
        } else {
          setDynamicTopics(backupObj.dynamicTopics);
        }
      }
      if (backupObj.dynamicTopicsTimestamps) setDynamicTopicsTimestamps(backupObj.dynamicTopicsTimestamps);
      if (backupObj.displayedStaticTopics) setDisplayedStaticTopics(backupObj.displayedStaticTopics);
      
      // 즉각적인 세션 세이브 동기화 가동
      saveCurrentSession(
        backupObj.results,
        backupObj.activeTab,
        backupObj.inputMode,
        backupObj.topic,
        backupObj.youtubeTranscript,
        backupObj.selectedCategory,
        backupObj.dynamicTopics,
        backupObj.displayedStaticTopics,
        backupObj.summaryData || summaryData,
        backupObj.dynamicTopicsTimestamps || dynamicTopicsTimestamps
      );
      
      setBackupInputCode(''); // 입력창 청소
      triggerToast('🌀 백업 포탈 복원 완료! 24시간 저장 방패도 이중 가동되었습니다. 🫡🚀');
    } catch (e) {
      console.error('[코다리 엔진] 백업 코드 디코딩 실패:', e);
      triggerToast('❌ 백업 코드 해독에 실패했습니다. 코드가 온전한지 확인해 주세요.');
    }
  };

  const patchNotes = [
    {
      version: 'V3.7.9.8',
      date: '2026-06-16',
      title: '⏱️ 소재연구소 실시간 추천 주제 검색 시각 탑재 및 백업 포탈 완비',
      tags: ['소재연구소', '타임스탬프', '백업연동', 'UX개선'],
      details: [
        '⏱️ 소재연구소 실시간 주제 검색 완료 시각 기록: 이제 각 카테고리별로 실시간 트렌드를 언제 분석 완료했는지 날짜와 시각(YYYY-MM-DD HH:MM)을 실시간으로 저장합니다.',
        '📡 실시간 주제 LIVE 타이틀 우측 시간 표시: 대표님이 실시간 트렌드의 신선도를 한눈에 인지할 수 있도록, ⚡ 실시간 주제 [LIVE] 우측에 검색 완료 시각을 표시했습니다.',
        '🌀 이중 백업 포탈 및 세션 동적 싱크: 기기간 백업 포탈(백업 코드)을 통해 복사 및 복원을 하거나 로컬 오토세이브로 자동 보존할 때, 소재연구소 카테고리별 검색 완료 시각까지 단 한 톨의 유실 없이 완벽히 동기화해 줍니다.'
      ]
    },
    {
      version: 'V3.7.9.7',
      date: '2026-06-07',
      title: '🔍 1단계 팩트 검증 탭 & ⏱️ 실시간 부분 누적 저장 및 📋 팩트 직접 입력 모드 완비',
      tags: ['이중안전벨트', '비용최적화', '부분저장', '팩트직접입력', '상황인지버튼'],
      details: [
        '🔍 [팩트 검증 데이터] 전용 탭 신설: 1단계가 완료되면 팩트 기획서 데이터(summaryData)를 탭에 실시간 렌더링하고 즉각 로컬 저장소에 1차 오토세이브합니다. 2단계 도중 에러가 터져도 비싼 구글 검색 데이터를 완전 보존합니다.',
        '📋 [📋 팩트 직접 입력] 신규 포스팅 소스 탑재: 다른 AI(제미나이, GPT 등)에서 미리 팩트체크가 완료된 텍스트 기획서를 그대로 가져와 뼈대로 사용할 수 있는 전용 3번째 입력 모드를 추가했습니다.',
        '⚡ 1단계 정찰 요약 완전 건너뛰기: 팩트 직접 입력 모드로 작동 시 구글 실시간 검색 및 요약 API를 전면 스킵하여 대기 시간 0초 실현 및 API 과금 비용을 제로화(0원)시켰습니다.',
        '📡 GOOGLE RADAR ON/OFF 뱃지 실시간 낙인: 1단계 기획서 텍스트 자체에 레이더 작동 상태를 마크다운 인용구 형태로 박제하고, 🔍 팩트 검증 탭 상단에 초록색 [📡 GOOGLE RADAR: ON] 또는 회색 [💾 GOOGLE RADAR: OFF] 뱃지로 가시화했습니다. 외부 팩트 주입 시에는 [📋 EXTERNAL FACT] 뱃지가 표시됩니다.',
        '⏱️ 플랫폼별 실시간 부분 저장 (Partial Update) & 에러 격리: 3개 플랫폼이 다 집필될 때까지 기다리지 않고, 네이버/티스토리/워드프레스 중 작성이 완료되는 플랫폼 순서대로 화면에 즉시 원고를 뿌리고 누적 세이브를 실행합니다.',
        '⚡ 상황 인지형 스마트 실행 버튼 구현: 일부 플랫폼 작성이 실패했거나 누락되어 로컬에 1단계 팩트만 남았을 경우, 실행 버튼이 [⚡ 수집된 팩트로 원고만 이어서 작성하기] 주황색 버튼으로 자동 변환됩니다.',
        '🔄 처음부터 다시 검색 버튼 신설: 1단계 팩트 캐시 상태를 무시하고 구글 레이더를 켜서 1단계부터 완전히 새 판을 짜고 싶을 때 누르는 독립적인 리셋 기능을 버튼 우측에 배치했습니다.'
      ]
    },
    {
      version: 'V3.7.9.6',
      date: '2026-06-07',
      title: '📱 모바일 가독성(빈 줄) 복원 & 📊 마크다운 표(Table) 렌더링 무결성 패치',
      tags: ['가독성복구', '렌더링개선', '표깨짐픽스', '도메인격리', '백업호환'],
      details: [
        'V3.5.9 오리지널 버전의 시원시원한 문단 여백 가이드를 복구 이식하여, 모바일 환경에서도 글이 뭉개지지 않고 2~3문장 단위로 쾌적하게 띄어쓰기가 적용되도록 지침을 개량했습니다.',
        '마크다운 표(Table) 렌더링 무결성 패치: JSON 스키마 응답 구조 내에서 표 구조가 깨지지 않도록, 표 앞뒤에 강제로 더블 개행(\\n\\n)을 보장하는 [Table Rendering Rule] 방어막을 설계/삽입하여 모바일 뷰어와 네이버 복사 시 표 렌더링 무결성을 100% 확보했습니다.',
        '미래 대비형 영구 호환 백업 센서 탑재: 정규식 패턴 분석을 적용하여 V3.7.9.5, V3.7.9.6 및 미래의 하위/상위 릴리즈 백업 코드가 들어와도 수동 글자 수정 없이 자동으로 디코딩 및 복원을 통과시키는 영구 호환 게이트웨이를 설계했습니다.',
        '독립형 멀티 브라우저 작업 보장: 백업 포탈 데이터는 브라우저별 로컬 저장소(LocalStorage)에 격리 저장됩니다. 모바일 크롬 ⇄ 사파리, 혹은 시크릿 모드 간에 서로 다른 백업 코드를 복원하여 혼선 없이 여러 원고를 동시에 멀티태스킹할 수 있습니다.',
        '도메인 격리 및 영구 고정: Vercel 자동 Assign 및 Alias 라우팅 보호를 위해 vercel.json 설정을 튜닝하여 v3796 정식 프로덕션 도메인(kodari-v3796.vercel.app) 항로를 공식 고정 배포 완료했습니다.'
      ]
    },
    {
      version: 'V3.7.9.5',
      date: '2026-06-07',
      title: '🌀 백업 포탈(수동 기기간 복구) 도입 & 🛡️ 로컬 이중 잠금 오토세이브 완성',
      tags: ['주요업데이트', '기능추가', '편의성', '도메인격리'],
      details: [
        '기기간 고속 연동을 지원하는 [백업 코드 복사/불러오기(백업 포탈)] 시스템을 탑재하여, 모바일에서 작성한 원고/서식 데이터 원본을 텍스트 코드로 추출해 PC로 즉시 순간 이동시킬 수 있도록 구현했습니다.',
        '로컬 자동 오토세이브 엔진과 백업 포탈 복제 로드가 완벽히 연쇄 반응하여, PC에서 불러오는 즉시 PC 로컬 보관소에도 24시간 자동 백업되도록 이중 보호막을 완성했습니다.',
        '도메인 자동 갱신(Re-assign) 오버라이딩을 완벽히 비껴가기 위한 [Vercel Preview 격리 배포 지침]에 의거하여 v3790/v3791/v3793 하위 도메인들을 영구 격리 보존하고, v3795 전용 정식 프로덕션 도메인(kodari-v3795.vercel.app) 항로를 공식 기동했습니다.'
      ]
    },
    {
      version: 'V3.7.9.4',
      date: '2026-06-06',
      title: '🏛️ 소재연구소 로컬 보관소 연동 & 🎨 하이브리드 비주얼 밸브 개조 (📱 모바일 가독성 강화)',
      tags: ['주요업데이트', '자동백업', '비주얼개선', '편의성', '모바일최적화'],
      details: [
        '소재연구소의 AI 실시간 핫이슈 주제(dynamicTopics) 및 카테고리 상태를 로컬 보관소에 자동 연동하여 새로고침 시에도 소중한 분석 데이터가 완벽히 보존되게 보강했습니다.',
        '소재연구소 모바일 가독성 강화: 추천 키워드 최대 2줄 줄바꿈 지원(line-clamp-2) 및 스크롤 영역 높이 2배(max-h-[460px]) 확장으로 모바일 화면 가시성을 시원하게 확보했습니다.',
        '전체 초기화(Reset) 시 본문 입력창만 청소하고, 애써 도출한 소재연구소 추천 목록은 안전하게 보호하도록 밸런스를 튜닝했습니다.',
        'KODARI Visual Engine 3.3 하이브리드 튜닝을 통해 1번(썸네일) 및 4번(요약)에는 한국인 캐릭터를 강제 배치하고, 2번/3번 본문용 이미지에는 인물을 원천 배제(NO PEOPLE)하여 정보형 차트/기기만 깔끔하게 시각화했습니다.',
        '웹앱 로고, package.json, KODARI_PERSONA 명세 및 브랜치 사양을 V3.7.9.4로 통일하여 kodari-v3794.vercel.app 경로로 정식 릴리즈 배포를 완료했습니다.'
      ]
    },
    {
      version: 'V3.7.9.3',
      date: '2026-06-06',
      title: '💾 실시간 오토세이브 보강 & 🎨 하이브리드 비주얼 밸브 탑재',
      tags: ['주요업데이트', '버그수정', '비주얼개선', '편의성'],
      details: [
        '기존 오토세이브 엔진이 탭을 전환할 때만 한정적으로 백업되던 누락 버그를 긴급 수정하여, 글 작성 완료 및 키워드 입력 시 실시간 전수 백업되게 보강했습니다.',
        'KODARI Visual Engine 3.3 하이브리드 튜닝을 통해 1번(썸네일) 및 4번(요약)에는 한국인 캐릭터를 강제 주입하고, 2번/3번 본문 이미지에는 인물을 완전 배제(NO PEOPLE)하여 정보형 차트/사물만 깔끔하게 나오도록 비주얼 밸브를 개조했습니다.',
        '버전에 정합하여 웹앱 로고, package.json, KODARI_PERSONA 명세를 V3.7.9.3으로 정렬하고 전용 독립 도메인(kodari-v3793.vercel.app)에 최종 배포했습니다.'
      ]
    },
    {
      version: 'V3.7.9.2',
      date: '2026-06-05',
      title: '🎨 KODARI Visual Engine 3.3 복원 탑재 (V2.7.3 비주얼 회귀)',
      tags: ['비주얼개선', '레이아웃', '디자인'],
      details: [
        '대표님의 명품 시각 디자인 선호를 반영하여, 이미지 내에 타이포디자인과 스토리텔링 비유가 풍성히 담기던 V2.7.3의 [KODARI Visual Engine 3.3]을 복원 탑재했습니다.',
        '단조롭던 무텍스트(no text) 방식에서 탈피하여, 이미지 내부에 가상 한글 카피가 자연스럽게 렌더링되도록 돕는 Information Card Layout and STRICTLY RENDER THE EXACT KOREAN CHARACTERS 규칙을 복원 적용했습니다.',
        '버전 상향에 맞춰 전용 독립 도메인(kodari-v3792.vercel.app) 항로를 신규 개설 및 배포했습니다.'
      ]
    },
    {
      version: 'V3.7.9.1',
      date: '2026-06-05',
      title: '💾 모바일 자동 백업 및 쉼표 제거/IT 소스코드 방어막 완비',
      tags: ['자동백업', '보안강화', '품질개선', '편의성'],
      details: [
        '모바일 브라우저의 백그라운드 메모리 해제로 인한 강제 새로고침 시 데이터 소실을 방지하는 [로컬 스토리지 자동 백업] 엔진 및 24시간 자동 파기 시스템을 구축했습니다.',
        '결과 창에 [🔄 전체 초기화] 버튼을 신설하여, 언제든 간편하게 모든 데이터를 수동으로 청소할 수 있게 개선했습니다.',
        'IT/기술 원고 작성 시 실제 프로그래밍 코드(Javascript, HTML 등)가 본문에 불필요하게 섞여 나오는 것을 원천 차단하는 [IT 소스코드 방어 지침]을 이식했습니다.',
        '해시태그 끝자락에 붙던 쉼표(,)를 깨끗하게 제거하고, 띄어쓰기로만 구분되게 정제하여 가독성을 극대화했습니다.'
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

    const res = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    }, 2, 2500);

    const data = await res.json();
    
    if (data.candidates?.[0]?.groundingMetadata) {
      setGroundingMetadata(prev => ({ ...prev, [inputMode]: data.candidates[0].groundingMetadata }));
      console.log('[팩트체크 성공] 구글 검색 근거를 1단계에서 확보했습니다.');
    } else {
      setGroundingMetadata(prev => ({ ...prev, [inputMode]: null }));
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const badgeText = useGoogleSearch 
      ? `> 📡 **GOOGLE RADAR: ON** (실시간 구글 검색으로 교차 검증 및 최신 팩트 반영 완료)\n\n`
      : `> 💾 **GOOGLE RADAR: OFF** (입력된 원본 데이터 기반 팩트 요약 완료)\n\n`;
    
    return badgeText + rawText;
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
2. 모바일 가독성 최적화: 스마트폰 화면에서 가독성을 확보하기 위해, 문장이 2~3개 이어질 때마다 반드시 줄바꿈을 적용하고 문단과 문단 사이에는 빈 줄(\\n\\n)을 하나 더 삽입하여 시원한 여백을 보장하라.
3. 분량: 공백 제외 최소 1,500자 이상의 매우 풍성한 정보를 담아라.
4. 사족 금지: '글을 마치며', '결론', '맺음말' 등 식상한 기계적 섹션 사용을 **절대 금지**하며, 정보가 끝나면 자연스럽게 종결하라.
5. 3중 하이브리드 강조: 핵심 키워드나 수치는 반드시 좌우 공백 없이 기호로 밀착 감싸라. (노랑 ==형광펜==, 파랑 ++파랑강조++, 빨강 !!주의사항!!)
6. 정보 시각화 및 [Table Rendering Rule]: 비교/대조 정보는 **반드시 마크다운 표(Table)**로 시각화하되, 표 내부에는 강조 기호(**, ==, ++ 등)를 절대 사용하지 마라. 또한, 표가 본문 텍스트와 붙어 뭉개지지 않도록 표를 출력하기 전과 표 출력이 완전히 끝난 직후에는 반드시 두 번의 줄바꿈(\\n\\n)을 넣어 확실한 개행을 보장하라.
7. 이미지 기획 (총 4개, KODARI Visual Engine 3.3 하이브리드 개조판): 본문의 흐름에 맞게 아래의 지침을 완벽히 적용하여 'image_prompts' 배열에 상세히 기재하라.
   - [1단계: 상상]: 각 플랫폼 성격에 맞춰 본문을 가장 잘 설명하는 최적의 시각적 장면을 상상해라.
   - [2단계: 스타일 적용]: ${styleGuide}
   - [3단계: 인물 배치 규칙 (하이브리드 밸브)]:
     - **1번째 이미지(Section 1 (Thumbnail)) 및 4번째 이미지(Section 4 (Summary))**: 주제를 대표하고 성공적인 분위기(celebratory)를 보여주기 위해, 반드시 **한국인 인물 캐릭터(A friendly Korean person / Korean people)**를 이미지 중심부에 배치하여 친근하고 성취감 있는 무드로 기획해라.
     - **2번째 및 3번째 이미지(Section 2 & 3)**: 정보의 명확성과 가독성이 중요하므로, **인물을 절대로 그리지 말고(NO PEOPLE/NO HUMAN)**, 주제를 상징하는 **사물, 데이터 정보기기(차트, 태블릿, 달력, 스마트폰, 아이콘, 소품 등)**만을 배치하여 깨끗하게 시각화해라.
   - [4단계: 이미지 생성 지침 (Storytelling Branding Rule)]:
     1) 1번째: Section 1 (Thumbnail) - Create a grand masterpiece thumbnail representing the overall topic. (Must include Korean character)
     2) 2번째 & 3번째: Section 2 & 3 - Visualize the most important informative parts of the content. (Strictly objects and devices only, NO human figures)
     3) 4번째: Section 4 (Summary) - Show a celebratory or concluding scene with a sense of achievement. (Must include Korean character)
     4) 각 이미지마다 한국어 메인카피(main_title)와 보조문구(sub_copy)를 반드시 생성해라.
     5) Visual Metaphor: 본문 주제를 상징하는 스토리텔링형 시각적 비유(Metaphor)를 적용해라.
     6) Layout Strategy: 글씨가 이미지 안에 디자인의 일부처럼 자연스럽게 얹어질 수 있는 'Premium Information Card' 레이아웃으로 영어 프롬프트를 설계해라.
     7) Visual Style: Keep the 'Premium 3D Claymorphism' style.
     8) Safety & Typography: **STRICTLY RENDER THE EXACT KOREAN CHARACTERS.** 이미지 내부에 가상의 메인카피와 서브카피 한글이 직접 렌더링되어 박히도록 영어 프롬프트 묘사에 기재해라.
8. 소스코드 노출 절대 금지: 본문 내에 실제 작동하는 프로그래밍 소스 코드(예: Javascript, HTML 태그 등)를 기재하거나 노출하는 것을 엄격히 금지하며, 개발자 관점의 코드 예시 대신 일반 대중이 이해하기 쉬운 한글 텍스트 설명으로 풀어써라.

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

    try {
      console.log(`[코다리 엔진] 2단계: ${platformName} 글 작성을 시도합니다.`);
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`;

      const res = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      }, 2, 2500);

      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (err) {
      console.error(`[엔진 예외 최종 발생] ${platformName} 작성 실패:`, err);
      throw new Error(`${platformName} 최종 작성 실패: ${err.message}`);
    }
  };

  const formatResult = (parsedData) => {
    if (!parsedData) return { title: '', content: '생성 실패', tags: '', official_link: '', official_links: [], image: '', image_desc: '', section_prompts: [] };
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

  // 🔍 [V3.7.9.7] 동시 생성 및 이어쓰기 핵심 핸들러
  const generateContent = async (forceRestart = false) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
    if (!finalKey) {
      setIsSettingsOpen(true);
      triggerToast('⚙️ API 키를 먼저 설정해 주세요, representative!');
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
    if (inputMode === 'fact' && !summaryData.fact.trim()) {
      setError('다른 AI에서 검증 완료한 팩트 텍스트를 입력해 주세요!');
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

      // 🔍 1단계: 초안/기획 요약 결정 (강제 리셋이거나 이어서 쓰기가 불가능한 경우에만 신규 요약 기동)
      let summary = summaryData[inputMode];
      
      if (inputMode === 'fact') {
        summary = summaryData.fact;
        if (!summary.includes('EXTERNAL FACT') && !summary.includes('GOOGLE RADAR')) {
          summary = `> 📋 **EXTERNAL FACT** (외부 검증 완료된 팩트 데이터 직접 주입)\n\n` + summary;
          setSummaryData(prev => ({ ...prev, fact: summary }));
        }
        setActiveTab('factcheck');
      } else if (forceRestart || !isPartialState || !summary) {
        console.log('[코다리 엔진] 1단계: 초안 및 뼈대 정보 팩트체크 신규 기동.');
        setStatusMessage('🔎 1단계: 실시간 구글 교차 검증 및 팩트 요약 중...');
        summary = await fetchSummaryDraft(inputText, finalKey);
        
        const newSummaryData = { ...summaryData, [inputMode]: summary };
        setSummaryData(newSummaryData);
        setActiveTab('factcheck');
        
        // 💾 1단계 성공 직후 즉시 로컬 백업 저장 (2단계 에러 방어)
        saveCurrentSession(results, 'factcheck', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, newSummaryData);
        
        if (activePlatforms.length > 0) {
          setStatusMessage('⏳ 1단계 요약 성공! 2단계 전이 전 1.0초 대기 중...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.log('[코다리 엔진] 이어서 쓰기 모드 기동: 1단계 구글 검색 및 팩트체크를 생략합니다.');
        triggerToast('⚡ 보관된 팩트 검증 데이터를 기반으로 이어쓰기를 실행합니다.');
      }

      const freshSummaryData = { ...summaryData, [inputMode]: summary };
      let currentResults = { ...results[inputMode] };

      // 2단계 플랫폼별 개별 예외 처리 & 실시간 누적 저장
      // 2.1 네이버
      if (platforms.naver) {
        const isNaverReady = currentResults.naver?.content && currentResults.naver?.content !== '생성 실패' && currentResults.naver?.content !== '';
        if (!isNaverReady) {
          setStatusMessage('✍️ 2단계: [네이버 블로그] 맞춤 원고 집필 및 이미지 기획 중...');
          try {
            const naverRaw = await writePlatformContent('naver', summary, finalKey);
            const formatted = formatResult(naverRaw);
            currentResults.naver = formatted;
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], naver: formatted } };
              saveCurrentSession(updated, 'naver', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
            setActiveTab('naver');
          } catch (err) {
            console.error(err);
            setError(prev => prev ? prev + '\n' + err.message : err.message);
            currentResults.naver = { ...emptyPlatformResult, content: '생성 실패' };
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], naver: currentResults.naver } };
              saveCurrentSession(updated, 'factcheck', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
          }

          if (platforms.tistory || platforms.wordpress) {
            setStatusMessage('⏳ 구글 API 과부하 방지를 위해 2.2초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 2200));
          }
        } else {
          console.log('[스킵] 네이버 블로그 원고가 이미 완성되어 있으므로 재생성을 생략합니다.');
        }
      }

      // 2.2 티스토리
      if (platforms.tistory) {
        const isTistoryReady = currentResults.tistory?.content && currentResults.tistory?.content !== '생성 실패' && currentResults.tistory?.content !== '';
        if (!isTistoryReady) {
          setStatusMessage('✍️ 2단계: [티스토리] 맞춤 원고 집필 및 이미지 기획 중...');
          try {
            const tistoryRaw = await writePlatformContent('tistory', summary, finalKey);
            const formatted = formatResult(tistoryRaw);
            currentResults.tistory = formatted;
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], tistory: formatted } };
              saveCurrentSession(updated, 'tistory', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
            setActiveTab('tistory');
          } catch (err) {
            console.error(err);
            setError(prev => prev ? prev + '\n' + err.message : err.message);
            currentResults.tistory = { ...emptyPlatformResult, content: '생성 실패' };
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], tistory: currentResults.tistory } };
              saveCurrentSession(updated, 'factcheck', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
          }

          if (platforms.wordpress) {
            setStatusMessage('⏳ 구글 API 과부하 방지를 위해 2.2초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 2200));
          }
        } else {
          console.log('[스킵] 티스토리 원고가 이미 완성되어 있으므로 재생성을 생략합니다.');
        }
      }

      // 2.3 워드프레스
      if (platforms.wordpress) {
        const isWordpressReady = currentResults.wordpress?.content && currentResults.wordpress?.content !== '생성 실패' && currentResults.wordpress?.content !== '';
        if (!isWordpressReady) {
          setStatusMessage('✍️ 2단계: [워드프레스] 맞춤 원고 집필 및 이미지 기획 중...');
          try {
            const wordpressRaw = await writePlatformContent('wordpress', summary, finalKey);
            const formatted = formatResult(wordpressRaw);
            currentResults.wordpress = formatted;
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], wordpress: formatted } };
              saveCurrentSession(updated, 'wordpress', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
            setActiveTab('wordpress');
          } catch (err) {
            console.error(err);
            setError(prev => prev ? prev + '\n' + err.message : err.message);
            currentResults.wordpress = { ...emptyPlatformResult, content: '생성 실패' };
            setResults(prev => {
              const updated = { ...prev, [inputMode]: { ...prev[inputMode], wordpress: currentResults.wordpress } };
              saveCurrentSession(updated, 'factcheck', inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, freshSummaryData);
              return updated;
            });
          }
        } else {
          console.log('[스킵] 워드프레스 원고가 이미 완성되어 있으므로 재생성을 생략합니다.');
        }
      }

      setStatusMessage('✨ 3단계: 최종 포스팅 결과물 정제 및 렌더링 완료 중...');

    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 [V3.7.9.7] 이 글만 다시 쓰기 작동 시 1단계 요약본(summaryData) 존재 여부 분기
  const regeneratePlatform = async (platform) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');
      const platformName = platform === 'naver' ? '네이버 블로그' : platform === 'tistory' ? '티스토리' : '워드프레스';

      let summary = summaryData[inputMode];
      
      // 1단계 요약이 아예 없거나 완전히 빈 상태이면 재생성을 위해 1단계 빌드
      if (!summary) {
        if (inputMode === 'fact') {
          setError('입력된 외부 팩트 데이터가 없습니다. 팩트를 먼저 입력해 주세요.');
          setLoading(false);
          return;
        }
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
        setStatusMessage(`🔎 [${platformName}] 1단계: 실시간 구글 교차 검증 및 팩트 요약 중...`);
        summary = await fetchSummaryDraft(inputText, finalKey);
        setSummaryData(prev => ({ ...prev, [inputMode]: summary }));
      } else {
        console.log(`[코다리 엔진] ${platformName} 글 재생성 시작 - 보관된 팩트 데이터 [${summary.substring(0, 20)}...] 를 재사용합니다.`);
      }

      console.log(`[코다리 엔진] ${platformName} 글 재생성 시작 - 2단계 플랫폼 리라이팅.`);
      setStatusMessage(`✍️ [${platformName}] 2단계: 맞춤 원고 집필 및 이미지 기획 중...`);
      const parsedData = await writePlatformContent(platform, summary, finalKey);

      const formattedResult = formatResult(parsedData);
      const newResults = {
        ...results,
        [inputMode]: {
          ...results[inputMode],
          [platform]: formattedResult
        }
      };

      setResults(newResults);
      triggerToast(`${platformName} 글이 성공적으로 리필되었습니다! ✨`);

      // 💾 [V3.7.9.1] 일부 플랫폼 재생성 완료 시 백업 갱신
      saveCurrentSession(newResults, activeTab, inputMode, topic, youtubeTranscript, selectedCategory, dynamicTopics, displayedStaticTopics, { ...summaryData, [inputMode]: summary });
      
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
      photoKeywords.forEach(k => { transformed = transformed.replace(new RegExp(k, 'gi'), ''); });
      transformed = `A vibrant 3D isometric illustration showing ${transformed.trim()}, claymorphism style, soft rounded shapes, trendy digital art, high-quality 3D render`;
    } else {
      graphicsKeywords.forEach(k => { transformed = transformed.replace(new RegExp(k, 'gi'), ''); });
      transformed = `A photorealistic image showing ${transformed.trim()}, cinematic lighting, 8k, professional photography, natural skin texture, realistic style`;
    }

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
    // A. 부모 창(window.opener)이 존재할 때 (새 창/새 탭 연동 모드)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: 'KODARI_SELECT_TOPIC', topic: selectedTopic }, '*');
        window.close();
        return;
      } catch (err) {
        console.error('부모 창 postMessage 전송 실패, fallback 작동:', err);
      }
    }

    // B. 단독 모드로 기동 중일 때 (주소창 직접 접속)
    // 1. 공용 금고(LocalStorage) 세션 우선 갱신
    try {
      const savedSessionRaw = localStorage.getItem('kodari_saved_session');
      let session = {};
      if (savedSessionRaw) {
        session = JSON.parse(savedSessionRaw);
      }
      session.topic = selectedTopic;
      session.inputMode = 'topic';
      session.timestamp = Date.now();
      localStorage.setItem('kodari_saved_session', JSON.stringify(session));
    } catch (e) {
      console.warn(e);
    }

    // 2. 클립보드 자동 복사
    try {
      navigator.clipboard.writeText(selectedTopic);
    } catch (e) {
      console.warn(e);
    }

    alert(`📋 '${selectedTopic}' 주제가 복사되었습니다!\n메인 블로그 AI 화면으로 이동하여 자동 주입합니다. ✨`);
    
    // 3. 메인 화면으로 이동하며 파라미터 주입
    window.location.href = `/?topic=${encodeURIComponent(selectedTopic)}`;
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

 must follow this format:
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
        
        setDynamicTopics(prev => ({
          ...prev,
          [selectedCategory]: processedTopics
        }));
        
        // ⏱️ 현재 시간 포맷팅 기록 (YYYY-MM-DD HH:MM)
        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setDynamicTopicsTimestamps(prev => ({
          ...prev,
          [selectedCategory]: formattedTime
        }));
        
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

  // 🧭 [V3.7.9.8] 소재연구소 UI 단독 렌더러 함수 분리 정의 (코드 재활용 극대화)
  const renderTopicLabContent = (standalone = false) => {
    return (
      <div className={standalone ? "bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8" : "bg-white rounded-[24px] md:rounded-[40px] p-4 md:p-8 max-w-2xl w-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300 my-auto"}>
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              💡 소재 연구소 <span className="text-sm font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Lab</span>
            </h2>
            <p className="text-sm text-slate-400 font-medium">조회수가 터지는 황금 키워드를 발굴하세요.</p>
          </div>
          {!standalone && (
            <button onClick={() => setIsTopicLabOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-xl">✕</button>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-3xl">
            {topicDatabase.categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => { setSelectedCategory(cat.name); }}
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

          {/* 노란색 필터 버튼 그룹 */}
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
              <div className="bg-slate-900 rounded-[30px] py-8 px-6 shadow-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-black text-sm flex items-center gap-2">
                    ⚡ 실시간 주제
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                    {dynamicTopicsTimestamps[selectedCategory] && (
                      <span className="text-[10px] font-bold text-slate-400">
                        ({dynamicTopicsTimestamps[selectedCategory]} 검색)
                      </span>
                    )}
                  </h3>
                  <button 
                    onClick={refreshLiveTrends}
                    disabled={isLiveLoading}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    {isLiveLoading ? '분석 중...' : '새로고침 🔄'}
                  </button>
                </div>
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-red-scrollbar">
                  {dynamicTopics[selectedCategory] ? (
                    dynamicTopics[selectedCategory].map((t, i) => (
                      <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left py-3.5 px-4 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-white text-xs font-bold transition-all border border-white/5 whitespace-normal break-keep line-clamp-2 leading-relaxed">
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
              <div className="bg-white rounded-[30px] py-8 px-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                    🗓️ 이번 달 주제
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Monthly</span>
                  </h3>
                  <button onClick={() => refreshStaticSection(selectedCategory, 'monthly')} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">새로고침 🔄</button>
                </div>
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-red-scrollbar">
                  {(displayedStaticTopics[`${selectedCategory}_monthly`] || []).map((t, i) => (
                    <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 text-xs font-black transition-all border border-slate-100 whitespace-normal break-keep line-clamp-2 leading-relaxed">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 연간 주제 카드 */}
            {(labFilter === 'all' || labFilter === 'annual') && (
              <div className="bg-white rounded-[30px] py-8 px-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                    📅 연간 주제
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Annual</span>
                  </h3>
                  <button onClick={() => refreshStaticSection(selectedCategory, 'annual')} className="text-[10px] font-bold text-slate-400 hover:text-amber-600 transition-colors">새로고침 🔄</button>
                </div>
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-red-scrollbar">
                  {(displayedStaticTopics[`${selectedCategory}_annual`] || []).map((t, i) => (
                    <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 text-xs font-black transition-all border border-slate-100 whitespace-normal break-keep line-clamp-2 leading-relaxed">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 황금 키워드 카드 */}
            {(labFilter === 'all' || labFilter === 'gold') && (
              <div className="bg-white rounded-[30px] py-8 px-6 border-2 border-slate-50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
                    💎 황금 키워드
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Evergreen</span>
                  </h3>
                  <button onClick={() => refreshStaticSection(selectedCategory, 'gold')} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">새로고침 🔄</button>
                </div>
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-red-scrollbar">
                  {(displayedStaticTopics[`${selectedCategory}_gold`] || []).map((t, i) => (
                    <button key={i} onClick={() => handleSelectTopic(t)} className="w-full text-left py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 text-xs font-black transition-all border border-slate-100 whitespace-normal break-keep line-clamp-2 leading-relaxed">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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

  // 💾 [V3.7.9.5] 모바일 전체 초기화 및 백업 삭제 함수 (소재연구소 데이터는 대표님의 편리함을 위해 보존)
  const handleReset = () => {
    if (window.confirm('정말 현재 생성된 모든 글과 입력을 초기화하시겠습니까? 🌊')) {
      const resetResults = {
        topic: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult },
        youtube: { naver: emptyPlatformResult, tistory: emptyPlatformResult, wordpress: emptyPlatformResult }
      };
      setResults(resetResults);
      setTopic('');
      setYoutubeTranscript('');
      
      const resetSummary = { topic: '', youtube: '' };
      setSummaryData(resetSummary); // 🔍 [V3.7.9.7] 팩트 검증 데이터도 완전 초기화
      
      // 리셋 시 본문 작성 세션 데이터만 부분 리셋하여 오토세이브 금고에 갱신
      saveCurrentSession(
        resetResults, 
        activeTab, 
        inputMode, 
        '', 
        '', 
        selectedCategory, 
        dynamicTopics, 
        displayedStaticTopics,
        resetSummary,
        dynamicTopicsTimestamps
      );
      
      triggerToast('본문 데이터가 맑게 청소되었습니다! 소재연구소 추천은 보존됩니다. 🧹✨');
    }
  };

  // 🏷️ [V3.7.9.2] 해시태그 쉼표 제거 및 공백 구분 포맷팅 헬퍼 함수
  const getCleanTags = (tagsStr) => {
    if (!tagsStr) return '';
    return tagsStr
      .split(',')
      .map(tag => {
        let t = tag.trim();
        if (!t) return '';
        if (!t.startsWith('#')) t = '#' + t;
        return t;
      })
      .filter(Boolean)
      .join(' ');
  };

  // 🧭 [V3.7.9.8] 독립형 기동(Standalone Lab Mode) 분기 렌더링
  if (isStandaloneLab) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 font-sans text-slate-900">
        <div className="max-w-4xl mx-auto">
          {renderTopicLabContent(true)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        <header className="text-center space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10"></div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase">KODARI BLOG AI V3.7.9.8</h1>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <p className="text-slate-500 font-black text-sm">🚀 V3.7.9.8 [🔍 팩트 검증 탭 ⇄ ⏱️ 실시간 부분 누적 저장 ⇄ 📋 팩트 직접 입력] 완비 ✨</p>
            <a 
              href="/converter.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-full text-xs font-black transition-all shadow-sm active:scale-95 animate-pulse hover:animate-none"
            >
              🐟 1초 웹 변환기 바로가기 🔗
            </a>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex gap-4 items-center">
                <label className="block text-sm font-bold text-slate-700">✍️ 포스팅 소스</label>
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                  <button onClick={() => setInputMode('topic')} className={`px-2.5 py-1.5 text-xs font-black rounded-md transition-all ${inputMode === 'topic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-750'}`}>일반 주제</button>
                  <button onClick={() => setInputMode('youtube')} className={`px-2.5 py-1.5 text-xs font-black rounded-md transition-all ${inputMode === 'youtube' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-750'}`}>유튜브 자막</button>
                  <button onClick={() => setInputMode('fact')} className={`px-2.5 py-1.5 text-xs font-black rounded-md transition-all ${inputMode === 'fact' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-750'}`}>📋 팩트 직접 입력</button>
                </div>
              </div>
              <button 
                onClick={handleOpenTopicLab}
                className="md:hidden px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[11px] border-2 border-indigo-100 shadow-sm flex items-center gap-1 active:scale-95"
              >
                <span>💡 소재 연구소</span>
              </button>
            </div>
            <div className="flex gap-3">
              <div className={`relative flex-1 group ${inputMode !== 'topic' ? 'flex flex-col' : ''}`}>
                {inputMode === 'topic' ? (
                  <>
                    <textarea 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          generateContent(false);
                        }
                      }}
                      placeholder="예: 2026 경기 컬처패스 사용처 및 유효기간"
                      className="w-full h-20 p-4 md:p-5 pl-12 md:pl-14 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-base md:text-lg font-bold transition-all shadow-sm resize-none custom-red-scrollbar"
                    />
                    <span className="absolute left-4 md:left-5 top-5 text-xl md:text-2xl group-focus-within:scale-110 transition-transform">✨</span>
                  </>
                ) : inputMode === 'youtube' ? (
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
                ) : (
                  <>
                    <textarea 
                      value={summaryData.fact || ''}
                      onChange={(e) => setSummaryData(prev => ({ ...prev, fact: e.target.value }))}
                      placeholder="다른 AI(제미나이, GPT 등)에서 검증을 마친 팩트체크 기획서 마크다운 텍스트를 여기에 붙여넣어 주세요..."
                      className="w-full h-48 p-4 md:p-5 rounded-2xl border-2 border-emerald-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm md:text-base font-normal transition-all shadow-sm resize-y"
                    />
                    <div className="absolute top-2 right-4 text-xs font-black text-emerald-600">
                      📋 외부 팩트 데이터 주입창
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={handleOpenTopicLab}
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

          {error && <p className="text-red-500 font-bold text-sm whitespace-pre-line animate-pulse">{error}</p>}

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

          {loading && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center animate-pulse">
              <span className="text-sm font-bold text-indigo-700 flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {statusMessage}
              </span>
            </div>
          )}

          {/* 🔍 [V3.7.9.7] 스마트 상황 인지형 이원화 버튼 컨테이너 */}
          <div className="flex gap-4">
            <button 
              onClick={() => generateContent(false)}
              disabled={loading}
              className={`flex-1 font-black text-lg p-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-white ${
                isPartialState 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  원고 릴레이 집필 중...
                </>
              ) : isPartialState ? '⚡ 수집된 팩트로 원고만 이어서 작성하기' : '🚀 원버튼 동시 생성하기'}
            </button>
            
            {/* 🔍 [V3.7.9.7] 이어서 쓰기 상태일 때만 노출되는 수동 완전 재시작 버튼 */}
            {isPartialState && (
              <button
                onClick={() => {
                  if (window.confirm('기존 1단계 팩트 데이터를 폐기하고 완전히 처음부터 새로 정찰하여 생성하시겠습니까? 🔄')) {
                    generateContent(true);
                  }
                }}
                disabled={loading}
                className="px-6 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                title="기존 기획을 지우고 1단계 구글 검색부터 새로 시작"
              >
                <span>🔄 처음부터 다시 검색</span>
              </button>
            )}
          </div>
        </div>

        {/* 🔍 [V3.7.9.7] 탭 노출 검사 확장: 1단계 요약본(summaryData)이 존재하거나 플랫폼 원고가 있을 때 활성화 */}
        {(hasDraft || Object.values(results[inputMode]).some(val => val.content)) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 bg-slate-50/50 pr-4">
              <div className="flex flex-1">
                {/* 🔍 [V3.7.9.7] 'factcheck' 탭 최우선 노출 */}
                {['factcheck', 'naver', 'tistory', 'wordpress']
                  .filter(tab => tab === 'factcheck' ? hasDraft : platforms[tab])
                  .map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 font-bold text-sm transition-all ${
                        activeTab === tab 
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tab === 'factcheck' ? '🔍 팩트 검증' : tab === 'naver' ? '🟢 네이버' : tab === 'tistory' ? '🟠 티스토리' : '🔵 워드프레스'}
                    </button>
                  ))}
              </div>
              <button 
                onClick={handleReset} 
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-black text-slate-500 transition-all flex items-center gap-1 active:scale-95"
                title="화면 및 백업 데이터 전체 초기화"
              >
                🔄 전체 초기화
              </button>
            </div>

            {/* 🔍 [V3.7.9.7] 1단계 팩트 검증 단독 탭 렌더링 영역 */}
            {activeTab === 'factcheck' && summaryData[inputMode] && (
              <div className="p-6 space-y-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5 flex-wrap">
                      <span>🔍</span> 팩트 검증 및 기획서 데이터
                      {summaryData[inputMode]?.includes('GOOGLE RADAR: ON') ? (
                        <span className="text-[9px] md:text-[10px] bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-black ml-1.5">📡 GOOGLE RADAR: ON</span>
                      ) : summaryData[inputMode]?.includes('GOOGLE RADAR: OFF') ? (
                        <span className="text-[9px] md:text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-black ml-1.5">💾 GOOGLE RADAR: OFF</span>
                      ) : summaryData[inputMode]?.includes('EXTERNAL FACT') || inputMode === 'fact' ? (
                        <span className="text-[9px] md:text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black ml-1.5">📋 EXTERNAL FACT</span>
                      ) : null}
                    </h3>
                    <p className="text-[11px] text-indigo-600 font-bold mt-0.5">이 팩트 데이터는 로컬 보관소에 영구 보존되어 원고 작성의 기반이 됩니다.</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(summaryData[inputMode])} 
                    className="px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs transition-all shadow-sm border border-indigo-200 flex items-center gap-1 shrink-0"
                  >
                    📋 팩트 원본 복사
                  </button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm">
                  <div className="prose prose-slate max-w-none text-base leading-relaxed prose-h1:text-2xl prose-h1:font-bold prose-h1:text-slate-900 prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-800 prose-h2:mt-8 prose-h2:mb-4 prose-p:mb-4 prose-li:mb-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {summaryData[inputMode]}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* 기존 플랫폼별 글쓰기 탭 렌더링 영역 */}
            {activeTab !== 'factcheck' && (
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
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">{results[inputMode][activeTab].title || (loading ? '원고 집필 중...' : '원고가 실패했습니다. [이 글만 다시 쓰기]를 시도해 주세요.')}</h2>
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
                    <button onClick={() => copyToClipboard(getCleanTags(results[inputMode][activeTab].tags))} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1">📋 태그 복사</button>
                  </div>
                  <p className="text-blue-600 font-medium">{getCleanTags(results[inputMode][activeTab].tags) || '#해시태그'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🌀 [V3.7.9.5] 기기간 백업 포탈 연동 시스템 */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border-2 border-slate-800 space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2 text-indigo-400">
                🌀 기기간 백업 포탈
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">MOBILE ⇄ PC</span>
              </h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                모바일에서 하던 포스팅 작업을 PC로 통째로 전송하여 서식과 함께 이어서 발행해 보세요.
              </p>
            </div>
            <button 
              onClick={generateBackupCode}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              📥 현재 작업 백업 코드 복사
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full relative">
              <input 
                type="text"
                placeholder="카톡 등으로 전달받은 백업 코드를 여기에 입력하세요..."
                value={backupInputCode}
                onChange={(e) => setBackupInputCode(e.target.value)}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
              />
            </div>
            <button
              onClick={() => loadBackupCode(backupInputCode)}
              className="w-full md:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap"
            >
              📤 작업 불러오기 및 복원
            </button>
          </div>
        </div>
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
          {renderTopicLabContent(false)}
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
