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
    naver: { title: '', content: '', tags: '', official_link: '' },
    tistory: { title: '', content: '', tags: '', official_link: '' },
    wordpress: { title: '', content: '', tags: '', official_link: '' }
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
      const platformSchema = `{"title": "매력적인 제목", "content": "상세 본문", "tags": "#태그1 #태그2 (정확히 6개)", "official_link": "보안인증(https)이 완벽한 정부/공공기관 공식 사이트 URL만 입력. 오류 사이트 절대 금지"}`;
      
      if (platforms.naver) platformPrompts.push(`"naver": ${platformSchema.replace('상세 본문', `네이버 블로그 스타일 (어투: ${tones.naver}, 정보 해석 + 풍부한 디테일). 소제목은 반드시 ## 또는 ###를 사용해.`)}`);
      if (platforms.tistory) platformPrompts.push(`"tistory": ${platformSchema.replace('상세 본문', `티스토리 스타일 (어투: ${tones.tistory}, 상세 정보 가이드 + 전문적 해석). 소제목은 ## 또는 ### 사용.`)}`);
      if (platforms.wordpress) platformPrompts.push(`"wordpress": ${platformSchema.replace('상세 본문', `명쾌한 정보 전달자 스타일 (어투: ${tones.wordpress}, 실용적 정보 중심 + 읽기 편한 문체). 소제목은 ## 또는 ### 사용.`)}`);

      const combinedPrompt = `주제: "${topic}"

[필독: 생성 지침 - 미준수 시 작동 불가]

0. **보안 및 신뢰성 (최우선):**
   - **보안 경고 금지:** 현재 경기문화재단(ggcf.or.kr) 등 일부 사이트에서 보안 인증서 오류가 발생하고 있어. 이런 사이트는 공식이라도 절대 링크를 걸지 마.
   - **검증된 주소만:** 반드시 보안(https)이 완벽하게 작동하는 정부('go.kr'), 지자체 및 공공기관 공식 사이트 링크만 선별해. 불확실하면 차라리 비워둬.

1. **압도적인 정보량 (최소 1500자 이상):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자 이상의 풍성한 분량으로 작성해. 요약하지 말고 디테일하게 풀어써.
   - 주제와 관련된 구체적인 예시(장소 이름, 정책 수치, 이용 방법 등)를 최소 5개 이상 포함해.

2. **정보(70%) + 해석(30%)의 황금 비율:**
   - **네이버/티스토리:** 독자가 궁금해하는 '팩트(사용처, 기간, 대상)'를 아주 상세히 먼저 알려줘. 그 다음 대표님의 '2차 해석 로직(결과+감정+궁금증)'을 녹여내서 "그래서 이게 왜 대단한 건지"를 설명해.
   - **워드프레스:** 너무 딱딱한 설명서가 되지 않게 해. 정보는 명확하게 주되, 독자와 대화하듯 부드럽고 실용적인 문체를 사용해.

3. **네이버 2차 해석 제목 전략:**
   - 제목은 반드시 "결과 + 감정 + 궁금증"이 포함된 매력적인 2차 해석형으로 지어.
   - **중요:** 본문 내부에는 "2차 해석:", "나름의 해석:", "대표님의 로직:" 같은 **안내성 문구를 절대 직접 노출하지 마.** 자연스럽게 이야기하듯 풀어써야 해.

4. **금지 사항:**
   - '결론', '서론', '향후 전망' 같은 기계적인 소제목 절대 금지. 대신 "이걸 놓치면 왜 안 될까요? 💡", "실제로 가본 사람들의 반응은? 🔥" 처럼 매력적인 문장으로 소제목을 지어.
   - H2, H3 태그 명칭 노출 금지.

7. **가독성 극대화 (소제목 태그 활용):**
   - 모든 플랫폼 공통으로 모든 소제목은 반드시 마크다운의 **## (H2)** 태그로 통일해. (H3는 가독성이 떨어지니 사용 금지)
   - 소제목 뒤에는 반드시 한 줄의 빈 줄을 넣어 본문과 분리해.
   - 문단과 문단 사이에도 반드시 빈 줄을 삽입하여 가독성을 높여.

8. **JSON 안정성:**
   - 응답은 반드시 유효한 JSON 형식이어야 해.
   - **중요:** 본문 텍스트 내부에 쌍따옴표(")를 쓰고 싶다면 반드시 작은따옴표(')로 대체해서 출력해. JSON 구조가 깨지는 것을 막기 위함이야.

{
  ${platformPrompts.join(',\n  ')}
}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: combinedPrompt }] }],
          tools: [{ google_search: {} }] // 🔍 정정: 구글 검색 실시간 연동 (최신 명칭 적용)
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
      const emptyResult = { title: '', content: '생성 실패', tags: '', official_link: '' };

      setResults({
        naver: parsedData.naver ? { ...emptyResult, ...parsedData.naver } : emptyResult,
        tistory: parsedData.tistory ? { ...emptyResult, ...parsedData.tistory } : emptyResult,
        wordpress: parsedData.wordpress ? { ...emptyResult, ...parsedData.wordpress } : emptyResult
      });

    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      // 1. 마크다운을 HTML로 수동 변환 (네이버 스마트에디터 최적화: p > span 구조)
      const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
      let htmlContent = text
        .replace(/^2차 해석:.*$/gim, '') 
        .replace(/^나름의 해석:.*$/gim, '') 
        .replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`)
        .replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`)
        .replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`)
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .split('\n').map(line => {
          const trimmed = line.trim();
          if (trimmed === '') return '<p>&nbsp;</p>'; // 실제 공백 삽입으로 간격 확보
          if (trimmed.startsWith('<p') || trimmed.startsWith('<li')) return trimmed;
          return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
        }).filter(line => line !== '').join('');

      // 2. HTML과 일반 텍스트를 동시에 클립보드에 저장 (Rich Text 복사)
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      
      await navigator.clipboard.write(data);
      alert('서식이 포함된 상태로 복사되었습니다! 네이버 블로그에 바로 붙여넣으세요.');
    } catch (err) {
      navigator.clipboard.writeText(text);
      alert('텍스트로 복사되었습니다!');
    }
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
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider">Title</label>
                  <button 
                    onClick={() => copyToClipboard(results[activeTab].title)}
                    className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1"
                  >
                    📋 제목 복사
                  </button>
                </div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  {results[activeTab].title || '제목 생성 중...'}
                </h2>
              </div>

              {/* 본문 영역 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
                  <button 
                    onClick={() => copyToClipboard(results[activeTab].content)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1"
                  >
                    📋 본문 복사
                  </button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group">
                  {activeTab === 'wordpress' && (
                    <div className="mb-4 p-3 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
                      💡 꿀팁: 워드프레스 편집기에 복사해서 붙여넣으면 H2, H3 제목이 자동으로 적용됩니다!
                    </div>
                  )}
                  <div className="prose prose-slate max-w-none text-base leading-relaxed 
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                    prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4
                    prose-p:mb-6 prose-li:mb-2">
                    <ReactMarkdown>{results[activeTab].content}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* 팩트체크 안내 영역 */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-amber-800 font-bold text-sm mb-1">코다리의 팩트체크 알림</p>
                  <p className="text-amber-700 text-xs leading-relaxed mb-2">
                    본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 정책 변경이나 최신 정보 반영에 시차가 있을 수 있으니, 
                    <strong> 중요한 수치나 날짜 등은 반드시 공식 홈페이지를 통해 최종 확인</strong> 후 발행해 주세요!
                  </p>
                  {results[activeTab].official_link && (
                    <a 
                      href={results[activeTab].official_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition-all border border-amber-300"
                    >
                      🔗 공식 홈페이지 바로가기
                    </a>
                  )}
                </div>
              </div>

              {/* 해시태그 영역 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hashtags</label>
                  <button 
                    onClick={() => copyToClipboard(results[activeTab].tags)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1"
                  >
                    📋 태그 복사
                  </button>
                </div>
                <p className="text-blue-600 font-medium">
                  {results[activeTab].tags || '#해시태그 #추천 #중'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
