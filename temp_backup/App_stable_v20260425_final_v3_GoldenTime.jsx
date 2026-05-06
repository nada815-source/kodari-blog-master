import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [topic, setTopic] = useState('');
  const [tones, setTones] = useState({
    naver: '기본 블로거',
    tistory: '기본 블로거',
    wordpress: '명쾌한 정보 전달자'
  });
  const [platforms, setPlatforms] = useState({ naver: true, tistory: true, wordpress: true });
  const [activeTab, setActiveTab] = useState('naver');
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [imageStyle, setImageStyle] = useState('실사/사진');
  const [imageModel, setImageModel] = useState('Gemini 2.5 Flash Image');
  const [imageCount, setImageCount] = useState('1개');
  const [useUnsplash, setUseUnsplash] = useState(localStorage.getItem('use_unsplash') === 'true');
  const [useStrategyA, setUseStrategyA] = useState(localStorage.getItem('use_strategy_a') === 'true');
  const [skipImage, setSkipImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    naver: { title: '', content: '', tags: '', official_link: '' },
    tistory: { title: '', content: '', tags: '', official_link: '' },
    wordpress: { title: '', content: '', tags: '', official_link: '' }
  });
  const [error, setError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('is_authenticated') === 'true');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');

  const handleLogin = () => {
    if (authCode === '2026') {
      setIsAuthenticated(true);
      localStorage.setItem('is_authenticated', 'true');
      setIsAuthModalOpen(false);
      alert('반갑습니다, 대표님! KODARI BLOG AI가 활성화되었습니다. 🫡🐟');
    } else {
      alert('인증 코드가 틀렸습니다. 대표님만 아시는 코드를 입력해 주세요!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_authenticated');
    alert('로그아웃 되었습니다. 충성!');
  };

  const generateContent = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    const finalKey = geminiApiKey || localStorage.getItem('gemini_api_key');
    if (!finalKey) {
      setIsSettingsOpen(true);
      alert('⚙️ API 키를 먼저 설정해 주세요, 대표님!');
      return;
    }
    if (!topic.trim()) {
      setError('포스팅 주제를 입력해 주십시오, 대표님!');
      return;
    }

    setLoading(true);
    setError('');

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${finalKey}`;

    const platformPrompts = [];
    const platformSchema = `{"title": "매력적인 제목", "tags": "#태그1 #태그2 #태그3 #태그4 #태그5 #태그6", "content": "상세 본문", "official_link": "보안인증(https)이 완벽한 정부/공공기관 공식 사이트 URL만 입력"}`;
    
    if (platforms.naver) platformPrompts.push(`"naver": ${platformSchema.replace('상세 본문', `네이버 블로그 스타일 (어투: ${tones.naver}, 정보 해석 + 풍부한 디테일). 소제목은 ## 사용. 안내성 문구 금지.`)}`);
    if (platforms.tistory) platformPrompts.push(`"tistory": ${platformSchema.replace('상세 본문', `티스토리 스타일 (어투: ${tones.tistory}, 상세 정보 가이드 + 전문적 해석). 소제목은 ## 사용. 안내성 문구 금지.`)}`);
    if (platforms.wordpress) platformPrompts.push(`"wordpress": ${platformSchema.replace('상세 본문', `명쾌한 정보 전달자 스타일 (어투: ${tones.wordpress}, 실용적 정보 중심 + 읽기 편한 문체). 소제목은 ## 사용. 안내성 문구 금지.`)}`);

    const prompt = `주제: "${topic}"

[필독: 생성 지침 - 마스터 지식 기반]

1. **압도적인 정보량 (최소 1500~2000자 이상):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자에서 2000자 이상의 풍성한 분량으로 작성해. (디테일이 생명!)
   - 주제와 관련된 구체적인 예시와 2차 해석을 아주 길게 풀어써.

2. **정보(70%) + 해석(30%)의 황금 비율:**
   - 팩트를 먼저 알려주고, 대표님의 '2차 해석 로직(결과+감정+궁금증)'을 자연스럽게 녹여내.
   - **[절대 금지]:** 본문 내부에 "2차 해석:", "결과와 감정:", "나름의 해석:" 같은 **안내성 문구나 기계적인 소제목을 절대 노출하지 마.** 자연스러운 이야기 흐름 속에 녹여내야 해.
   - 본문 내 모든 따옴표는 반드시 **작은따옴표(')**만 사용해. 쌍따옴표(") 절대 금지!

3. **가독성 극대화 (골든타임 규격):**
   - 모든 소제목은 반드시 **## (H2)** 태그로 작성해.
   - 소제목 앞뒤로는 반드시 **빈 줄 2개(\\n\\n)**를 넣어.
   - 문단 사이에도 반드시 빈 줄을 삽입하여 시원시원하게 구성해.

4. **JSON 형식 및 개별 태그 엄수:**
   - 응답은 반드시 지정된 JSON 구조를 지켜야 해. (코드 블록 금지)
   - **[중요]** 각 플랫폼별 'tags' 필드에는 반드시 주제와 가장 밀접한 해시태그를 **정확히 6개**씩 생성해서 넣어줘.

{
  ${platformPrompts.join(',\\n  ')},
  "image_search_term": "영어 검색어"
}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API 실패');

      let responseTextRaw = data.candidates[0].content.parts[0].text;
      let cleanContent = responseTextRaw.replace(/```json/gi, '').replace(/```/gi, '').trim();
      
      try {
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        const jsonOnly = cleanContent.substring(firstBrace, lastBrace + 1);
        const finalJson = jsonOnly.replace(/[\\x00-\\x1F\\x7F-\\x9F]/g, '');
        
        const parsedData = JSON.parse(finalJson);
        setResults({
          naver: parsedData.naver || results.naver,
          tistory: parsedData.tistory || results.tistory,
          wordpress: parsedData.wordpress || results.wordpress
        });
      } catch (parseErr) {
        // 백업 파서 (Recovery)
        const extractField = (field, text) => {
          const titleMatch = text.match(new RegExp(`"${field}"\\s*:\\s*\\{\\s*"title"\\s*:\\s*"(.*?)"`, 's'));
          const tagsMatch = text.match(new RegExp(`"${field}"\\s*:\\s*\\{.*? "tags"\\s*:\\s*"(.*?)"`, 's'));
          const contentMatch = text.match(new RegExp(`"${field}"\\s*:\\s*\\{.*? "content"\\s*:\\s*"(.*?)"`, 's'));
          const linkMatch = text.match(new RegExp(`"${field}"\\s*:\\s*\\{.*? "official_link"\\s*:\\s*"(.*?)"`, 's'));
          
          if (titleMatch || contentMatch) {
            return {
              title: titleMatch ? titleMatch[1] : '',
              tags: tagsMatch ? tagsMatch[1] : '',
              content: contentMatch ? contentMatch[1] : '',
              official_link: linkMatch ? linkMatch[1] : ''
            };
          }
          return null;
        };
        const recovered = {
          naver: extractField('naver', cleanContent),
          tistory: extractField('tistory', cleanContent),
          wordpress: extractField('wordpress', cleanContent)
        };
        if (recovered.naver || recovered.tistory || recovered.wordpress) {
          setResults({
            naver: recovered.naver || results.naver,
            tistory: recovered.tistory || results.tistory,
            wordpress: recovered.wordpress || results.wordpress
          });
        } else {
          throw new Error('데이터 파손이 심해 복구에 실패했습니다. 분량을 조절해 주세요.');
        }
      }
    } catch (err) {
      setError('오류: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPlainText = (text) => {
    navigator.clipboard.writeText(text);
    alert('텍스트가 복사되었습니다! 🫡');
  };

  const copyRichText = async (text) => {
    try {
      // 1. 마크다운을 HTML로 변환 (대표님 전수: p > span 하이브리드 구조)
      const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
      let htmlContent = text
        .replace(/^[\\d\\w]*차 해석:.*$/gim, '') // 안내 문구 자동 필터링
        .replace(/^나름의 해석:.*$/gim, '') 
        .replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`)
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .split('\\n').map(line => {
          const trimmed = line.trim();
          if (trimmed === '') return '<p>&nbsp;</p>'; // 물리적 공백 삽입
          if (trimmed.startsWith('<p')) return trimmed;
          return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
        }).filter(line => line !== '').join('');

      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      await navigator.clipboard.write(data);
      alert('네이버 전용 명품 서식이 적용되어 복사되었습니다! 🫡🐟');
    } catch (err) {
      navigator.clipboard.writeText(text);
      alert('텍스트로 복사되었습니다!');
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
              <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full bg-white shadow-sm border border-slate-200">⚙️</button>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600">인증 해제</button>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold">🔑 코드 인증</button>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">오후 8:37분 기준 모든 기술적 자산 복구 완료 🫡🐟</p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">✍️ 포스팅 주제</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 2026 경기 컬처패스 사용처 및 유효기간" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10" />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">✅ 발행 플랫폼 및 개별 어투 설정</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['naver', 'tistory', 'wordpress'].map(p => (
                <div key={p} className={`p-4 rounded-xl border-2 transition-all ${platforms[p] ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input type="checkbox" checked={platforms[p]} onChange={() => setPlatforms({...platforms, [p]: !platforms[p]})} className="w-5 h-5 text-indigo-500 rounded" />
                    <span className="font-bold text-slate-700 uppercase">{p === 'naver' ? '🟢 네이버' : p === 'tistory' ? '🟠 티스토리' : '🔵 워드프레스'}</span>
                  </label>
                  <select value={tones[p]} onChange={(e) => setTones({...tones, [p]: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white">
                    <option value="기본 블로거">기본 (친절/깔끔)</option>
                    <option value="명쾌한 정보 전달자">명쾌한 정보 전달자</option>
                    <option value="해박한 전문가">해박한 전문가</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 p-6 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">🎨 이미지 스타일 선택</label>
              <div className="flex flex-wrap gap-2">
                {['실사/사진', '3D 렌더링', '일러스트', '수채화', '유화', '미니멀리즘', '팝아트', '애니메이션'].map(style => (
                  <button key={style} onClick={() => setImageStyle(style)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${imageStyle === style ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{style}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider">🤖 이미지 생성 모델</label>
                {['Gemini 2.5 Flash Image', 'Nano Banana 2 (한글)', 'Nano Banana 2 (그림)', 'Imagen 4.0'].map(m => (
                  <button key={m} onClick={() => setImageModel(m)} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${imageModel === m ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>
                    <p className={`text-sm font-black ${imageModel === m ? 'text-indigo-400' : 'text-slate-100'}`}>{m}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider">🖼️ 이미지 생성 개수</label>
                <div className="grid grid-cols-2 gap-3">
                  {['1개', '3개', '5개', 'AI추천'].map(c => (
                    <button key={c} onClick={() => setImageCount(c)} className={`p-4 rounded-xl text-sm font-black border-2 transition-all ${imageCount === c ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${useUnsplash ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-xs font-black text-slate-100">📸 전략 C: 무료 이미지</span>
                  <input type="checkbox" checked={useUnsplash} onChange={(e) => setUseUnsplash(e.target.checked)} className="w-5 h-5" />
                </div>
                <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${useStrategyA ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-xs font-black text-slate-100">🧼 전략 A: 이미지 세탁</span>
                  <input type="checkbox" checked={useStrategyA} onChange={(e) => setUseStrategyA(e.target.checked)} className="w-5 h-5" />
                </div>
              </div>
              <div onClick={() => setSkipImage(!skipImage)} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 ${skipImage ? 'bg-red-600/20 border-red-500' : 'bg-slate-800 border-slate-700'}`}>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${skipImage ? 'bg-red-600 border-red-400' : 'border-slate-500'}`}>{skipImage && '✓'}</div>
                <p className="text-xs font-black text-slate-100">이미지 생성하지 않음</p>
              </div>
            </div>
          </div>

          <button onClick={generateContent} disabled={loading} className={`w-full py-6 rounded-2xl text-white font-black text-2xl shadow-2xl transition-all ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-600 to-blue-600 active:scale-[0.98]'}`}>
            {loading ? '🚀 코다리 부장이 맹렬히 집필 중...' : '🚀 원클릭 블로그 동시 생성하기'}
          </button>
        </div>

        {error && <p className="text-red-500 font-bold text-center">{error}</p>}

        {(results.naver.content || results.tistory.content || results.wordpress.content) && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {['naver', 'tistory', 'wordpress'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === tab ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'naver' ? '🟢 네이버' : tab === 'tistory' ? '🟠 티스토리' : '🔵 워드프레스'}</button>
              ))}
            </div>
            <div className="p-8 space-y-6">
              {/* 제목 영역 */}
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 group">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-indigo-500 uppercase tracking-wider">TITLE</label>
                  <button onClick={() => copyPlainText(results[activeTab].title)} className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs shadow-sm border border-indigo-100 flex items-center gap-1.5 transition-all">📋 제목 복사</button>
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{results[activeTab].title}</h3>
              </div>

              {/* 본문 영역 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">CONTENT</label>
                  <button onClick={() => copyRichText(results[activeTab].content)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all">📋 본문 복사 (명품 서식)</button>
                </div>
                <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed min-h-[400px]
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                  prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4
                  prose-p:mb-6 prose-li:mb-2">
                  <ReactMarkdown>{results[activeTab].content.replace(/\\n/g, '\n')}</ReactMarkdown>
                </div>
              </div>

              {/* 태그 영역 */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">HASHTAGS</label>
                  <button onClick={() => copyPlainText(results[activeTab].tags)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs shadow-sm border border-slate-200 flex items-center gap-1.5 transition-all">📋 태그 복사</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results[activeTab].tags.split(/[#, ]+/).filter(t => t).map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <h2 className="text-2xl font-black">⚙️ API 설정</h2>
            <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Gemini API Key" />
            <button onClick={() => { localStorage.setItem('gemini_api_key', geminiApiKey); setIsSettingsOpen(false); alert('대표님, 설정이 저장되었습니다! 🫡'); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">설정 저장</button>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 text-center">
            <h2 className="text-2xl font-black">인증 필요 🫡</h2>
            <input type="password" value={authCode} onChange={(e) => setAuthCode(e.target.value)} placeholder="인증 코드를 입력하세요" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center text-2xl font-black" />
            <button onClick={handleLogin} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">인증하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
