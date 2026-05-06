import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

function App() {
  const [topic, setTopic] = useState('');
  const [tones, setTones] = useState({
    naver: '기본 블로거',
    tistory: '기본 블로거',
    wordpress: '명쾌한 정보 전달자'
  });
  const [platforms, setPlatforms] = useState({ naver: true, tistory: true, wordpress: true });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    naver: { title: '', content: '', tags: '' },
    tistory: { title: '', content: '', tags: '' },
    wordpress: { title: '', content: '', tags: '' }
  });
  const [activeTab, setActiveTab] = useState('naver');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const generateContent = async () => {
    const finalKey = apiKey.trim() || localStorage.getItem('gemini_api_key');

    if (!finalKey) {
      alert('⚠️ API 키가 없습니다. 키를 입력하고 눈 아이콘을 눌러 확인해 주세요.');
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
      
      // 4. 플랫폼별 명품 프롬프트 조립 (어투 및 제약 조건 강화)
      const platformPrompts = [];
      const platformSchema = `{"title": "매력적인 제목", "content": "상세 본문", "tags": "#태그1 #태그2 (정확히 6개)"}`;
      
      if (platforms.naver) platformPrompts.push(`"naver": ${platformSchema.replace('상세 본문', `네이버 블로그 스타일 (어투: ${tones.naver}, 정보 해석 + 풍부한 디테일)`)}`);
      if (platforms.tistory) platformPrompts.push(`"tistory": ${platformSchema.replace('상세 본문', `티스토리 스타일 (어투: ${tones.tistory}, 상세 정보 가이드 + 전문적 해석)`)}`);
      if (platforms.wordpress) platformPrompts.push(`"wordpress": ${platformSchema.replace('상세 본문', `워드프레스 스타일 (어투: ${tones.wordpress}, 실용적 정보 중심 + 읽기 편한 문체)`)}`);

      const combinedPrompt = `주제: "${topic}"

[필독: 생성 지침 - 미준수 시 작동 불가]

1. **압도적인 정보량 (최소 1500자 이상):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자 이상의 풍성한 분량으로 작성해. 요약하지 말고 디테일하게 풀어써.
   - 주제와 관련된 구체적인 예시(장소 이름, 정책 수치, 이용 방법 등)를 최소 5개 이상 포함해.

2. **정보(70%) + 해석(30%)의 황금 비율:**
   - **네이버/티스토리:** 독자가 궁금해하는 '팩트(사용처, 기간, 대상)'를 아주 상세히 먼저 알려줘. 그 다음 대표님의 '2차 해석 로직(결과+감정+궁금증)'을 녹여내서 "그래서 이게 왜 대단한 건지"를 설명해.
   - **워드프레스:** 너무 딱딱한 설명서가 되지 않게 해. 정보는 명확하게 주되, 독자와 대화하듯 부드럽고 실용적인 문체를 사용해.

3. **네이버 2차 해석 제목 전략:**
   - 제목은 반드시 "결과 + 감정 + 궁금증"이 포함된 매력적인 2차 해석형으로 지어.

4. **금지 사항:**
   - '결론', '서론', '향후 전망' 같은 기계적인 소제목 절대 금지. 대신 "이걸 놓치면 왜 안 될까요? 💡", "실제로 가본 사람들의 반응은? 🔥" 처럼 매력적인 문장으로 소제목을 지어.
   - H2, H3 태그 명칭 노출 금지.

5. **공통:**
   - 해시태그는 정확히 6개.
   - 한국어로만 작성.

{
  ${platformPrompts.join(',\n  ')}
}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: combinedPrompt }] }]
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
      const emptyResult = { title: '', content: '생성 실패', tags: '' };

      setResults({
        naver: parsedData.naver || emptyResult,
        tistory: parsedData.tistory || emptyResult,
        wordpress: parsedData.wordpress || emptyResult
      });

    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="text-4xl mb-4">🐟</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">원소스 멀티유즈 블로그 생성기</h1>
          <p className="text-slate-500">주제 하나만 던져주시면 3가지 맛(네이버/티스토리/워드프레스)으로 뽑아드립니다!</p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">🔑 Gemini API 키</label>
            <div className="relative group">
              <input 
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={handleSaveApiKey}
                placeholder="AI Studio에서 발급받은 API 키를 입력하세요"
                className="w-full p-4 pr-12 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 transition-all bg-slate-50/30 font-mono text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title={showApiKey ? "키 숨기기" : "키 보기"}
              >
                {showApiKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">* API 키는 브라우저에만 안전하게 저장됩니다.</p>
          </div>

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
              <span className="text-xs font-normal text-slate-400">(선택한 플랫폼에 대해 각각 다른 어투를 설정할 수 있습니다)</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 네이버 설정 */}
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

              {/* 티스토리 설정 */}
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

              {/* 워드프레스 설정 */}
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

          <button 
            onClick={generateContent}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg p-4 rounded-xl shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                코다리가 맹렬히 작성 중입니다...
              </>
            ) : '🚀 원버튼 동시 생성하기'}
          </button>
        </div>

        {/* Results Section */}
        {Object.values(results).some(val => val.content) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tabs */}
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

            {/* Content Display */}
            <div className="p-6 space-y-6">
              {/* 제목 영역 */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative group">
                <label className="block text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">Title</label>
                <h2 className="text-xl font-bold text-slate-800 pr-24 leading-tight">
                  {results[activeTab].title || '제목 생성 중...'}
                </h2>
                <button 
                  onClick={() => copyToClipboard(results[activeTab].title)}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1"
                >
                  📋 제목 복사
                </button>
              </div>

              {/* 본문 영역 */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">Content</label>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm relative group">
                  <button 
                    onClick={() => copyToClipboard(results[activeTab].content)}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1 z-10"
                  >
                    📋 본문 복사
                  </button>
                  {activeTab === 'wordpress' && (
                    <div className="mb-4 p-3 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
                      💡 꿀팁: 워드프레스 편집기에 복사해서 붙여넣으면 H2, H3 제목이 자동으로 적용됩니다!
                    </div>
                  )}
                  <div className="prose prose-slate max-w-none text-base leading-relaxed">
                    <ReactMarkdown>{results[activeTab].content}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* 해시태그 영역 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Hashtags</label>
                <p className="text-blue-600 font-medium pr-24">
                  {results[activeTab].tags || '#해시태그 #추천 #중'}
                </p>
                <button 
                  onClick={() => copyToClipboard(results[activeTab].tags)}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1"
                >
                  📋 태그 복사
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
