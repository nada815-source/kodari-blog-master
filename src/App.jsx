import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
// 인라인 SVG 아이콘 컴포넌트 (설치 없이 작동)
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

function App() {
  const [topic, setTopic] = useState('');
  const [tones, setTones] = useState({
    naver: '기본 블로거',
    tistory: '기본 블로거',
    wordpress: '명쾌한 정보 전달자'
  });
  const [platforms, setPlatforms] = useState({ naver: true, tistory: true, wordpress: true });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [unsplashKey, setUnsplashKey] = useState(localStorage.getItem('unsplash_key') || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    naver: { title: '', content: '', tags: '', official_links: [], image: '', image_desc: '' },
    tistory: { title: '', content: '', tags: '', official_links: [], image: '', image_desc: '' },
    wordpress: { title: '', content: '', tags: '', official_links: [], image: '', image_desc: '' }
  });
  const [activeTab, setActiveTab] = useState('naver');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showUnsplashKey, setShowUnsplashKey] = useState(false);
  const [useImage, setUseImage] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('is_authenticated') === 'true');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);
  const [visualStyle, setVisualStyle] = useState('photo'); // 'photo' or '3d'
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [customImageKeyword, setCustomImageKeyword] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);

  const patchNotes = [
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

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch('/src/App.jsx');
      const code = await response.text();
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      link.href = url;
      link.download = `KODARI_App_V2_Backup_${formattedDate}.jsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('대표님! 현재 버전의 소스 코드를 컴퓨터에 즉시 저장했습니다! 📂✨');
    } catch (err) {
      triggerToast('백업 다운로드 중 오류가 발생했습니다. 부장님에게 채팅으로 요청해 주세요! 🐟💦');
    }
  };

  const fetchImages = async (keywords) => {
    if (!unsplashKey) return ['', '', ''];
    try {
      const fetchImage = async (keyword) => {
        const query = encodeURIComponent(keyword);
        let response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashKey}`);
        let data = await response.json();
        if (!data.results || data.results.length === 0) {
          response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent('Modern lifestyle')}&per_page=1&client_id=${unsplashKey}`);
          data = await response.json();
        }
        return data.results?.[0]?.urls?.regular || '';
      };
      const kws = Array.isArray(keywords) ? keywords : [topic, topic, topic];
      return await Promise.all(kws.map(kw => fetchImage(kw)));
    } catch (err) {
      console.error('Image fetch error:', err);
      return ['', '', ''];
    }
  };

  const refreshImage = async () => {
    if (!customImageKeyword.trim()) {
      triggerToast('검색어를 입력해 주세요! 🔍');
      return;
    }
    if (!unsplashKey) {
      setIsSettingsOpen(true);
      triggerToast('⚙️ Unsplash API 키를 먼저 설정해 주세요!');
      return;
    }

    setIsImageLoading(true);
    try {
      const query = encodeURIComponent(customImageKeyword);
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashKey}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const newImageUrl = data.results[0].urls.regular;
        setResults(prev => ({
          ...prev,
          [activeTab]: { 
            ...prev[activeTab], 
            image: newImageUrl,
            image_desc: customImageKeyword
          }
        }));
        triggerToast('이미지가 교체되었습니다! ✨');
        setCustomImageKeyword('');
      } else {
        triggerToast('검색 결과가 없습니다. 💦');
      }
    } catch (err) {
      triggerToast('이미지 검색 중 오류가 발생했습니다.');
    } finally {
      setIsImageLoading(false);
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
    if (!topic.trim()) {
      setError('포스팅 주제를 입력해주세요!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${finalKey}`;
      
      const styleGuide = visualStyle === 'photo' 
        ? "스타일: 반드시 'Professional Editorial Photography' 스타일로 묘사해. (Keywords: High-end magazine style, clean composition, soft studio lighting, high resolution)"
        : "스타일: 반드시 'Modern Isometric Digital Illustration' 스타일로 묘사해. (Keywords: Professional infographic layout, flat design with 3D depth, organized visual information, clean lines, bright and optimistic palette)";

      const combinedPrompt = `주제: "${topic}"
이미지 스타일: ${visualStyle === 'photo' ? '실사 사진' : '3D 일러스트'}

[필독: 생성 지침 - 미준수 시 작동 불가]

[필독: 언어 설정 - 모든 플랫폼(네이버, 티스토리, 워드프레스)의 모든 텍스트(제목, 본문, 태그, 공식 링크 이름 등)는 반드시 **한국어**로만 작성해. 영어를 섞지 마라.]

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

   - **[출력 포맷]**: 반드시 아래와 같은 순수한 JSON 배열 형식으로만 답변해. 다른 설명은 생략해.
     [
       {
         "title": "소제목",
         "main_title": "메인 제목 (예: 상생페이백 완벽 가이드)",
         "sub_copy": "보조 문구 (예: 카드 쓰고 최대 30만원 환급)",
         "prompt": "상세 영어 프롬프트"
       },
       ...
     ]

1. **보안 및 신뢰성 (최우선):**
   - 반드시 보안(https)이 완벽하게 작동하는 정부('go.kr'), 공공기관 공식 사이트 링크만 선별해.

2. **압도적인 정보량 및 호흡 조절 (필수):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자 이상의 풍성한 분량으로 작성하되, **모바일 가독성과 글의 흐름을 위해 한 문단은 최대 2~3문장** 정도로 구성해. 문단 사이에는 반드시 빈 줄을 두어 시원하면서도 안정적인 리듬감을 만들어.

3. **가독성 극대화 및 표(Table) 생성 전략 (필수):**
   - 모든 소제목은 반드시 마크다운의 **## (H2)** 태그로 통일해.
   - **[형광펜 및 컬러 강조 강제]:** 독자의 가독성을 위해 반드시 아래 기호를 **본문 문장 곳곳에 적극적으로** 섞어서 화려하게 구성해. (매 섹션마다 최소 2~3회 이상 사용 필수)
      1) **== 강조할 내용 ==**: 노란색 형광펜 효과 (핵심 키워드)
      2) **++ 강조할 내용 ++**: 파란색 글자 강조 (신뢰 정보)
      3) **!! 강조할 내용 !!**: 빨간색 글자 강조 (핵심 경고)
   - **[표(Table) 생성 강제]:** 단순 리스트(1. 2. 3...)나 불렛 포인트로 나열할 수 있는 정보(예: 사용처 리스트, 혜택 항목, 일정 등)가 3개 이상이라면, 이를 **무조건 Markdown Table 형식**으로 시각화하여 본문 중간에 배치해. 
   - 표는 최소 2열 이상으로 구성하고(예: | 항목명 | 상세 내용 | 비고 |), 독자가 한눈에 정보를 파악할 수 있게 만들어.

4. **JSON 안정성:**
   - 응답은 반드시 유효한 JSON 형식이어야 해. 본문 텍스트 내부에 쌍따옴표(")는 작은따옴표(')로 대체해.

결과는 반드시 아래의 JSON 형식으로만 답변해:
{
  "image_queries": [
    {"en": "...", "ko": "..." },
    {"en": "...", "ko": "..." },
    {"en": "...", "ko": "..." }
  ],
  "section_prompts": [ ... ],
  "naver": { 
    "title": "...", 
    "content": "...", 
    "tags": "...", 
    "official_links": [{"name": "링크이름", "url": "https://..."}]
  },
  "tistory": { 
    "title": "...", 
    "content": "...", 
    "tags": "...", 
    "official_links": [{"name": "링크이름", "url": "https://..."}]
  },
  "wordpress": { 
    "title": "...", 
    "content": "...", 
    "tags": "...", 
    "official_links": [{"name": "링크이름", "url": "https://..."}]
  }
}

[필독: '결론', '맺음말', '마지막으로' 등의 기계적 섹션 이름 사용을 절대 엄금함.]
[필독: 모든 해시태그(tags)는 반드시 **한국어**로만 생성하고, 각 태그 앞에 반드시 **'#' 기호**를 붙여서 한 줄로 나열해. (예: #키워드1 #키워드2)]
[말투 가이드: 독자와 직접 대화하듯 다정하고 친근한 블로거의 말투를 사용해. 문장 곳곳에 주제와 어울리는 이모지(🌸, ✨, 📍, ✅ 등)를 적절히 섞어서 글에 생동감과 리듬감을 불어넣어줘. 정보는 날카롭게, 말투는 따뜻하게!]`;

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
      let responseTextRaw = data.candidates[0].content.parts[0].text;
      let responseText = responseTextRaw.replace(/```json/gi, '').replace(/```/gi, '').trim();

      const parsedData = JSON.parse(responseText);
      const emptyResult = { title: '', content: '생성 실패', tags: '', official_link: '', image: '', image_desc: '' };

      let finalImages = ['', '', ''];
      if (useImage && unsplashKey) {
        const enQueries = (parsedData.image_queries || []).map(q => q.en);
        finalImages = await fetchImages(enQueries.length > 0 ? enQueries : [topic, topic, topic]);
      }

      const koDescs = (parsedData.image_queries || []).map(q => q.ko);
      const sectionPrompts = parsedData.section_prompts || [];

      setResults({
        naver: parsedData.naver ? { ...emptyResult, ...parsedData.naver, image: finalImages[0], image_desc: koDescs[0] || '', section_prompts: sectionPrompts, official_links: parsedData.naver.official_links || [] } : emptyResult,
        tistory: parsedData.tistory ? { ...emptyResult, ...parsedData.tistory, image: finalImages[1], image_desc: koDescs[1] || '', section_prompts: sectionPrompts, official_links: parsedData.tistory.official_links || [] } : emptyResult,
        wordpress: parsedData.wordpress ? { ...emptyResult, ...parsedData.wordpress, image: finalImages[2], image_desc: koDescs[2] || '', section_prompts: sectionPrompts, official_links: parsedData.wordpress.official_links || [] } : emptyResult
      });

    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다: ' + err.message);
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
    setResults(prev => {
      const currentSectionPrompts = prev[activeTab].section_prompts;
      if (!currentSectionPrompts) return prev;
      const updatedPrompts = [...currentSectionPrompts];
      updatedPrompts[idx].main_title = newTitle;
      return { ...prev, [activeTab]: { ...prev[activeTab], section_prompts: updatedPrompts } };
    });
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

  const convertMarkdownToHtml = (text) => {
    const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
    const tableRegex = /^\|(.+)\|\n\|([ :|-]+)\|\n((\|.+\|\n?)+)/gm;
    
    const markdownToHtmlTable = (match) => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
      const rows = lines.slice(2).map(line => line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim()));

      let html = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd; ${naverFont}">`;
      html += '<thead style="background-color: #f8f9fa;"><tr>';
      headers.forEach(h => {
        html += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold; background-color: #f2f2f2;">${h}</th>`;
      });
      html += '</tr></thead><tbody>';
      rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    };

    let htmlContent = text.replace(tableRegex, markdownToHtmlTable);

    return htmlContent
      .replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`)
      .replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`)
      .replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`)
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/==\s*([\s\S]*?)\s*==/g, '<span style="background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;">$1</span>')
      .replace(/\+\+\s*([\s\S]*?)\s*\+\+/g, '<span style="color: #0047b3; font-weight: bold;">$1</span>')
      .replace(/!!\s*([\s\S]*?)\s*!!/g, '<span style="color: #e60000; font-weight: bold;">$1</span>')
      .split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '<p>&nbsp;</p>'; 
        if (trimmed.startsWith('<p') || trimmed.startsWith('<li') || trimmed.startsWith('<table')) return trimmed;
        return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
      }).filter(line => line !== '').join('');
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
            button:active { transform: scale(0.98); }
            #content { padding-top: 10px; }
            table { width: 100% !important; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
          <script>
            function selectAllAndCopy() {
              const content = document.getElementById('content');
              const range = document.createRange();
              range.selectNodeContents(content);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              try {
                document.execCommand('copy');
                alert('전체 선택 및 복사가 완료되었습니다! 네이버 블로그 앱에 붙여넣으세요! ✨');
              } catch (err) {
                alert('브라우저 보안 설정으로 인해 직접 복사가 실패했습니다. 선택된 영역을 길게 눌러 복사해 주세요! 💦');
              }
            }
          </script>
        </head>
        <body>
          <div class="action-bar">
            <button onclick="selectAllAndCopy()">📋 전체 선택 및 복사</button>
            <button onclick="window.close()" style="background: #64748b;">닫기</button>
          </div>
          <div id="content">${htmlContent}</div>
        </body>
      </html>
    `);
    previewWin.document.close();
    triggerToast('미리보기 창이 열렸습니다. 버튼을 눌러 한 번에 복사하세요! 📱✨');
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
      console.error('Clipboard error:', err);
      navigator.clipboard.writeText(text);
      triggerToast('텍스트로 복사되었습니다! ✅');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="text-center space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10"></div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase">KODARI BLOG AI</h1>
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
          <p className="text-slate-500 font-medium text-sm">V2.1 명품 엔진 기반 : 황금 밸런스 가독성 및 모바일 복사 최적화 🫡🐟</p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">✍️ 포스팅 주제</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateContent()}
              placeholder="예: 2026 경기 컬처패스 사용처 및 유효기간"
              className="w-full p-4 rounded-xl border-2 border-blue-100 focus:outline-none focus:border-blue-500 text-lg transition-all"
            />
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

        {Object.values(results).some(val => val.content) && (
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
              {results[activeTab].image && (
                <div className="space-y-3 mb-6">
                  <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                    <img src={results[activeTab].image} alt="Blog Background" className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105" />
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          <span className="text-xs font-bold text-indigo-600">이미지 교체 중...</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                      <span>📸 Photo via Unsplash (AI 추천 이미지)</span>
                      {results[activeTab].image_desc && (
                        <span className="bg-indigo-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">컨셉: {results[activeTab].image_desc}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* 이미지 재검색 UI */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Current Concept</span>
                      <span className="text-xs font-bold text-slate-600">{results[activeTab].image_desc || '지정된 키워드 없음'}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={customImageKeyword}
                        onChange={(e) => setCustomImageKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refreshImage()}
                        placeholder="새로운 검색어 입력 (영문 추천)"
                        className="flex-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs px-3 py-2 shadow-sm"
                      />
                      <button 
                        onClick={refreshImage}
                        disabled={isImageLoading}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
                      >
                        {isImageLoading ? '...' : '🔍 사진 변경'}
                      </button>
                    </div>
                    
                    {results[activeTab].section_prompts && results[activeTab].section_prompts.length > 0 && (
                      <button 
                        onClick={() => setIsAiPromptOpen(true)}
                        className="w-full mt-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-[10px] transition-all border border-indigo-100 flex items-center justify-center gap-1.5"
                      >
                        🎨 AI 이미지 생성 프롬프트 보기
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider">Title</label>
                  <button onClick={() => copyToClipboard(results[activeTab].title)} className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1">📋 제목 복사</button>
                </div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{results[activeTab].title || '제목 생성 중...'}</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
                  <div className="flex gap-2">
                    <button onClick={() => openPreviewWindow(results[activeTab].content)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-indigo-100 flex items-center gap-1">📱 모바일 복사 전용</button>
                    <button onClick={() => copyToClipboard(results[activeTab].content)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1">📋 본문 복사</button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group">
                  <div className="prose prose-slate max-w-none text-base leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6 prose-li:mb-2">
                    <ReactMarkdown 
                      components={{
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /^\^==(.*)==\^$/.exec(children);
                          return inline ? <code className={className} {...props}>{children}</code> : <pre className={className} {...props}>{children}</pre>
                        }
                      }}
                    >
                      {results[activeTab].content}
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
                    {results[activeTab].official_links && results[activeTab].official_links.map((link, idx) => (
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
                  <button onClick={() => copyToClipboard(results[activeTab].tags)} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1">📋 태그 복사</button>
                </div>
                <p className="text-blue-600 font-medium">{results[activeTab].tags || '#해시태그'}</p>
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
                {results[activeTab].section_prompts && results[activeTab].section_prompts.map((item, idx) => (
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
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">📸 Unsplash Access Key</label>
              <div className="relative group">
                <input type={showUnsplashKey ? "text" : "password"} value={unsplashKey} onChange={(e) => { setUnsplashKey(e.target.value); localStorage.setItem('unsplash_key', e.target.value); }} className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono text-sm" placeholder="Unsplash 키를 입력하세요" />
                <button type="button" onClick={() => setShowUnsplashKey(!showUnsplashKey)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">{showUnsplashKey ? "👁️" : "👁️‍🗨️"}</button>
              </div>
            </div>
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider">💾 코다리 백업 관리</h3>
              <button onClick={handleDownloadBackup} className="w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all">📂 현재 버전 즉시 백업(다운로드)</button>
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
    </div>
  );
}

export default App;
