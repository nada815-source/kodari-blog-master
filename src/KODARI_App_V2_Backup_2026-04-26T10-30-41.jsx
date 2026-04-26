import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.jsx");const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport3_react_jsxDevRuntime["Fragment"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=a24ab947";
import { GoogleGenAI } from "/node_modules/.vite/deps/@google_genai.js?v=a24ab947";
import ReactMarkdown from "/node_modules/.vite/deps/react-markdown.js?v=a24ab947";
var _jsxFileName = "D:/초보프로젝트/blog-generator/src/App.jsx";
import __vite__cjsImport3_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a24ab947";
var _s = $RefreshSig$();
function App() {
	_s();
	const [topic, setTopic] = useState("");
	const [tones, setTones] = useState({
		naver: "기본 블로거",
		tistory: "기본 블로거",
		wordpress: "명쾌한 정보 전달자"
	});
	const [platforms, setPlatforms] = useState({
		naver: true,
		tistory: true,
		wordpress: true
	});
	const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
	const [unsplashKey, setUnsplashKey] = useState(localStorage.getItem("unsplash_key") || "");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState({
		naver: {
			title: "",
			content: "",
			tags: "",
			official_link: "",
			image: ""
		},
		tistory: {
			title: "",
			content: "",
			tags: "",
			official_link: "",
			image: ""
		},
		wordpress: {
			title: "",
			content: "",
			tags: "",
			official_link: "",
			image: ""
		}
	});
	const [activeTab, setActiveTab] = useState("naver");
	const [error, setError] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [showUnsplashKey, setShowUnsplashKey] = useState(false);
	const [useImage, setUseImage] = useState(true);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("is_authenticated") === "true");
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authCode, setAuthCode] = useState("");
	const handleLogin = () => {
		if (authCode === "kodari1") {
			setIsAuthenticated(true);
			localStorage.setItem("is_authenticated", "true");
			setIsAuthModalOpen(false);
			alert("반갑습니다, 대표님! KODARI BLOG AI가 활성화되었습니다. 🫡🐟");
		} else {
			alert("인증 코드가 틀렸습니다. 대표님만 아시는 코드를 입력해 주세요!");
		}
	};
	const handleLogout = () => {
		setIsAuthenticated(false);
		localStorage.removeItem("is_authenticated");
		alert("로그아웃 되었습니다. 충성!");
	};
	const handleSaveApiKey = (e) => {
		const key = e.target.value;
		setApiKey(key);
		localStorage.setItem("gemini_api_key", key);
	};
	const handleDownloadBackup = async () => {
		try {
			const response = await fetch("/src/App.jsx");
			const code = await response.text();
			const blob = new Blob([code], { type: "text/javascript" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
			link.href = url;
			link.download = `KODARI_App_V2_Backup_${date}.jsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			alert("대표님! 현재 버전의 소스 코드를 대표님의 컴퓨터(다운로드 폴더)에 즉시 저장했습니다! 📂✨\n\n부장님에게도 서버용 백업을 시키시려면 채팅창에 \"백업해\"라고 한마디만 해주십시오! 충성!!");
		} catch (err) {
			alert("백업 다운로드 중 오류가 발생했습니다. 부장님에게 채팅으로 백업을 요청해 주세요! 🐟💦");
		}
	};
	const fetchImages = async (keywords) => {
		if (!unsplashKey) return [
			"",
			"",
			""
		];
		try {
			const fetchImage = async (keyword) => {
				const query = encodeURIComponent(keyword + " Korea Seoul Modern");
				let response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashKey}`);
				let data = await response.json();
				// 검색 결과가 없으면 더 넓은 범위의 키워드로 재시도
				if (!data.results || data.results.length === 0) {
					response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent("Seoul Modern Lifestyle")}&per_page=1&client_id=${unsplashKey}`);
					data = await response.json();
				}
				return data.results?.[0]?.urls?.regular || "";
			};
			const kws = Array.isArray(keywords) ? keywords : [
				topic,
				topic,
				topic
			];
			return await Promise.all(kws.map((kw) => fetchImage(kw)));
		} catch (err) {
			console.error("Image fetch error:", err);
			return [
				"",
				"",
				""
			];
		}
	};
	const generateContent = async () => {
		if (!isAuthenticated) {
			setIsAuthModalOpen(true);
			return;
		}
		const finalKey = apiKey.trim() || localStorage.getItem("gemini_api_key");
		if (!finalKey) {
			setIsSettingsOpen(true);
			alert("⚙️ API 키를 먼저 설정해 주세요, 대표님!");
			return;
		}
		if (!topic.trim()) {
			setError("포스팅 주제를 입력해주세요!");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${finalKey}`;
			// 4. 플랫폼별 명품 프롬프트 조립 (어투 및 제약 조건 강화)
			const platformPrompts = [];
			const platformSchema = `{"title": "매력적인 제목", "content": "상세 본문", "tags": "#태그1 #태그2 (정확히 6개)", "official_link": "보안인증(https)이 완벽한 정부/공공기관 공식 사이트 URL만 입력. 오류 사이트 절대 금지"}`;
			if (platforms.naver) platformPrompts.push(`"naver": ${platformSchema.replace("상세 본문", `네이버 블로그 스타일 (어투: ${tones.naver}, 정보 해석 + 풍부한 디테일). 소제목은 반드시 ## 또는 ###를 사용해.`)}`);
			if (platforms.tistory) platformPrompts.push(`"tistory": ${platformSchema.replace("상세 본문", `티스토리 스타일 (어투: ${tones.tistory}, 상세 정보 가이드 + 전문적 해석). 소제목은 ## 또는 ### 사용.`)}`);
			if (platforms.wordpress) platformPrompts.push(`"wordpress": ${platformSchema.replace("상세 본문", `명쾌한 정보 전달자 스타일 (어투: ${tones.wordpress}, 실용적 정보 중심 + 읽기 편한 문체). 소제목은 ## 또는 ### 사용.`)}`);
			const combinedPrompt = `주제: "${topic}"

[필독: 생성 지침 - 미준수 시 작동 불가]

0. **이미지 검색 키워드 생성 (전략 C):**
   - 주제를 분석하여 Unsplash에서 검색할 **영어 키워드 3개**를 생성해.
   - 키워드는 "Korea, Seoul, Modern, Minimal" 느낌이 나도록 조합해. (예: "Seoul modern cafe interior")
   - 각 키워드는 서로 다르게 생성해서 플랫폼별 이미지 차별화(전략 A)를 도모해.

1. **보안 및 신뢰성 (최우선):**
   - **보안 경고 금지:** 현재 경기문화재단(ggcf.or.kr) 등 일부 사이트에서 보안 인증서 오류가 발생하고 있어. 이런 사이트는 공식이라도 절대 링크를 걸지 마.
   - **검증된 주소만:** 반드시 보안(https)이 완벽하게 작동하는 정부('go.kr'), 지자체 및 공공기관 공식 사이트 링크만 선별해. 불확실하면 차라리 비워둬.

2. **압도적인 정보량 (최소 1500자 이상):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자 이상의 풍성한 분량으로 작성해. 요약하지 말고 디테일하게 풀어써.
   - 주제와 관련된 구체적인 예시(장소 이름, 정책 수치, 이용 방법 등)를 최소 5개 이상 포함해.

3. **정보(70%) + 해석(30%)의 황금 비율:**
   - **네이버/티스토리:** 독자가 궁금해하는 '팩트(사용처, 기간, 대상)'를 아주 상세히 먼저 알려줘. 그 다음 대표님의 '2차 해석 로직(결과+감정+궁금증)'을 녹여내서 "그래서 이게 왜 대단한 건지"를 설명해.
   - **워드프레스:** 너무 딱딱한 설명서가 되지 않게 해. 정보는 명확하게 주되, 독자와 대화하듯 부드럽고 실용적인 문체를 사용해.

4. **네이버 2차 해석 제목 전략:**
   - 제목은 반드시 "결과 + 감정 + 궁금증"이 포함된 매력적인 2차 해석형으로 지어.
   - **중요:** 본문 내부에는 "2차 해석:", "나름의 해석:", "대표님의 로직:" 같은 **안내성 문구를 절대 직접 노출하지 마.** 자연스럽게 이야기하듯 풀어써야 해.

5. **금지 사항:**
   - '결론', '서론', '향후 전망' 같은 기계적인 소제목 절대 금지. 대신 "이걸 놓치면 왜 안 될까요? 💡", "실제로 가본 사람들의 반응은? 🔥" 처럼 매력적인 문장으로 소제목을 지어.
   - H2, H3 태그 명칭 노출 금지.

6. **가독성 극대화 (소제목 태그 활용):**
   - 모든 플랫폼 공통으로 모든 소제목은 반드시 마크다운의 **## (H2)** 태그로 통일해.
   - 소제목 뒤에는 반드시 한 줄의 빈 줄을 넣어 본문과 분리해.
   - 문단과 문단 사이에도 반드시 빈 줄을 삽입하여 가독성을 높여.

7. **JSON 안정성:**
   - 응답은 반드시 유효한 JSON 형식이어야 해.
   - **중요:** 본문 텍스트 내부에 쌍따옴표(")를 쓰고 싶다면 반드시 작은따옴표(')로 대체해서 출력해.

결과는 반드시 아래의 JSON 형식으로만 답변해 (구조 절대 준수):
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "naver": { "title": "...", "content": "...", "tags": "...", "official_link": "..." },
  "tistory": { "title": "...", "content": "...", "tags": "...", "official_link": "..." },
  "wordpress": { "title": "...", "content": "...", "tags": "...", "official_link": "..." }
}`;
			const response = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [{ parts: [{ text: combinedPrompt }] }],
					tools: [{ google_search: {} }]
				})
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || "API 호출 실패");
			}
			const data = await response.json();
			let responseTextRaw = data.candidates[0].content.parts[0].text;
			let responseText = responseTextRaw.replace(/```json/gi, "").replace(/```/gi, "").trim();
			const parsedData = JSON.parse(responseText);
			const emptyResult = {
				title: "",
				content: "생성 실패",
				tags: "",
				official_link: "",
				image: ""
			};
			let finalImages = [
				"",
				"",
				""
			];
			if (useImage && unsplashKey) {
				// 전략 A: AI가 추천한 키워드로 플랫폼별 개별 이미지 가져오기
				finalImages = await fetchImages(parsedData.keywords || [
					topic,
					topic,
					topic
				]);
			}
			setResults({
				naver: parsedData.naver ? {
					...emptyResult,
					...parsedData.naver,
					image: finalImages[0]
				} : emptyResult,
				tistory: parsedData.tistory ? {
					...emptyResult,
					...parsedData.tistory,
					image: finalImages[1]
				} : emptyResult,
				wordpress: parsedData.wordpress ? {
					...emptyResult,
					...parsedData.wordpress,
					image: finalImages[2]
				} : emptyResult
			});
		} catch (err) {
			console.error(err);
			setError("오류가 발생했습니다: " + err.message);
		} finally {
			setLoading(false);
		}
	};
	const copyToClipboard = async (text) => {
		try {
			// 1. 마크다운을 HTML로 수동 변환 (네이버 스마트에디터 최적화: p > span 구조)
			const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
			let htmlContent = text.replace(/^2차 해석:.*$/gim, "").replace(/^나름의 해석:.*$/gim, "").replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`).replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`).replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`).replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>").split("\n").map((line) => {
				const trimmed = line.trim();
				if (trimmed === "") return "<p>&nbsp;</p>";
				if (trimmed.startsWith("<p") || trimmed.startsWith("<li")) return trimmed;
				return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
			}).filter((line) => line !== "").join("");
			// 2. HTML과 일반 텍스트를 동시에 클립보드에 저장 (Rich Text 복사)
			const blobHtml = new Blob([htmlContent], { type: "text/html" });
			const blobText = new Blob([text], { type: "text/plain" });
			const data = [new ClipboardItem({
				"text/html": blobHtml,
				"text/plain": blobText
			})];
			await navigator.clipboard.write(data);
			alert("서식이 포함된 상태로 복사되었습니다! 네이버 블로그에 바로 붙여넣으세요.");
		} catch (err) {
			navigator.clipboard.writeText(text);
			alert("텍스트로 복사되었습니다!");
		}
	};
	return /* @__PURE__ */ _jsxDEV("div", {
		className: "min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900",
		children: [
			/* @__PURE__ */ _jsxDEV("div", {
				className: "max-w-4xl mx-auto space-y-8",
				children: [
					/* @__PURE__ */ _jsxDEV("header", {
						className: "text-center space-y-4",
						children: [/* @__PURE__ */ _jsxDEV("div", {
							className: "flex justify-between items-center mb-4",
							children: [
								/* @__PURE__ */ _jsxDEV("div", { className: "w-10" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 257,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 258,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsSettingsOpen(true),
										className: "p-2.5 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all",
										children: "⚙️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 260,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 262,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 264,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 259,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 256,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 268,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 255,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-8",
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									className: "block text-sm font-bold text-slate-700 mb-2",
									children: "✍️ 포스팅 주제"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 275,
									columnNumber: 13
								}, this), /* @__PURE__ */ _jsxDEV("input", {
									type: "text",
									value: topic,
									onChange: (e) => setTopic(e.target.value),
									onKeyDown: (e) => e.key === "Enter" && generateContent(),
									placeholder: "예: 2026 경기 컬처패스 사용처 및 유효기간",
									className: "w-full p-4 rounded-xl border-2 border-blue-100 focus:outline-none focus:border-blue-500 text-lg transition-all"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 276,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 274,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "bg-slate-50 p-6 rounded-2xl border border-slate-200",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									className: "block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2",
									children: ["✅ 발행 플랫폼 및 개별 어투 설정", /* @__PURE__ */ _jsxDEV("span", {
										className: "text-xs font-normal text-slate-400",
										children: "(선택한 플랫폼에 대해 각각 다른 어투를 설정할 수 있습니다)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 289,
										columnNumber: 15
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 287,
									columnNumber: 13
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ _jsxDEV("div", {
											className: `p-4 rounded-xl border-2 transition-all ${platforms.naver ? "bg-white border-green-200 shadow-sm" : "bg-slate-100/50 border-transparent opacity-60"}`,
											children: [/* @__PURE__ */ _jsxDEV("label", {
												className: "flex items-center gap-2 cursor-pointer mb-3 group",
												children: [/* @__PURE__ */ _jsxDEV("input", {
													type: "checkbox",
													checked: platforms.naver,
													onChange: () => setPlatforms({
														...platforms,
														naver: !platforms.naver
													}),
													className: "w-5 h-5 text-green-500 rounded border-slate-300 focus:ring-green-500"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 296,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-green-600 transition-colors",
													children: "🟢 네이버"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 297,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 295,
												columnNumber: 17
											}, this), /* @__PURE__ */ _jsxDEV("select", {
												disabled: !platforms.naver,
												value: tones.naver,
												onChange: (e) => setTones({
													...tones,
													naver: e.target.value
												}),
												className: "w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed",
												children: [
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 305,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 306,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 307,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 308,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 299,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 294,
											columnNumber: 15
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											className: `p-4 rounded-xl border-2 transition-all ${platforms.tistory ? "bg-white border-orange-200 shadow-sm" : "bg-slate-100/50 border-transparent opacity-60"}`,
											children: [/* @__PURE__ */ _jsxDEV("label", {
												className: "flex items-center gap-2 cursor-pointer mb-3 group",
												children: [/* @__PURE__ */ _jsxDEV("input", {
													type: "checkbox",
													checked: platforms.tistory,
													onChange: () => setPlatforms({
														...platforms,
														tistory: !platforms.tistory
													}),
													className: "w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 315,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 316,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 314,
												columnNumber: 17
											}, this), /* @__PURE__ */ _jsxDEV("select", {
												disabled: !platforms.tistory,
												value: tones.tistory,
												onChange: (e) => setTones({
													...tones,
													tistory: e.target.value
												}),
												className: "w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed",
												children: [
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 324,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 325,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 326,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 327,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 318,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 313,
											columnNumber: 15
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											className: `p-4 rounded-xl border-2 transition-all ${platforms.wordpress ? "bg-white border-blue-200 shadow-sm" : "bg-slate-100/50 border-transparent opacity-60"}`,
											children: [/* @__PURE__ */ _jsxDEV("label", {
												className: "flex items-center gap-2 cursor-pointer mb-3 group",
												children: [/* @__PURE__ */ _jsxDEV("input", {
													type: "checkbox",
													checked: platforms.wordpress,
													onChange: () => setPlatforms({
														...platforms,
														wordpress: !platforms.wordpress
													}),
													className: "w-5 h-5 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 334,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 335,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 333,
												columnNumber: 17
											}, this), /* @__PURE__ */ _jsxDEV("select", {
												disabled: !platforms.wordpress,
												value: tones.wordpress,
												onChange: (e) => setTones({
													...tones,
													wordpress: e.target.value
												}),
												className: "w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed",
												children: [
													/* @__PURE__ */ _jsxDEV("option", {
														value: "명쾌한 정보 전달자",
														children: "명쾌한 정보 전달자"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 343,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 344,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 345,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 346,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 337,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 332,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 292,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 286,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 353,
								columnNumber: 21
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "flex items-center justify-center gap-3 py-2",
								children: [
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${!useImage ? "text-slate-400" : "text-slate-300"}`,
										children: "이미지 사용 안함"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 357,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setUseImage(!useImage),
										className: `relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? "bg-indigo-600" : "bg-slate-300"}`,
										children: /* @__PURE__ */ _jsxDEV("div", { className: `absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? "translate-x-6" : "translate-x-0"}` }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 362,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 358,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${useImage ? "text-indigo-600" : "text-slate-400"}`,
										children: "이미지 자동 삽입 ON"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 364,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 356,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("button", {
								onClick: generateContent,
								disabled: loading,
								className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg p-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3",
								children: loading ? /* @__PURE__ */ _jsxDEV(_Fragment, { children: [/* @__PURE__ */ _jsxDEV("svg", {
									className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
									xmlns: "http://www.w3.org/2000/svg",
									fill: "none",
									viewBox: "0 0 24 24",
									children: [/* @__PURE__ */ _jsxDEV("circle", {
										className: "opacity-25",
										cx: "12",
										cy: "12",
										r: "10",
										stroke: "currentColor",
										strokeWidth: "4"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 374,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 374,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 374,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 367,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 272,
						columnNumber: 9
					}, this),
					Object.values(results).some((val) => val.content) && /* @__PURE__ */ _jsxDEV("div", {
						className: "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden",
						children: [/* @__PURE__ */ _jsxDEV("div", {
							className: "flex border-b border-slate-100 bg-slate-50/50",
							children: [
								"naver",
								"tistory",
								"wordpress"
							].filter((tab) => platforms[tab]).map((tab) => /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setActiveTab(tab),
								className: `flex-1 py-4 font-bold text-sm transition-all ${activeTab === tab ? "text-blue-600 bg-white border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`,
								children: tab === "naver" ? "🟢 네이버 블로그" : tab === "tistory" ? "🟠 티스토리" : "🔵 워드프레스"
							}, tab, false, {
								fileName: _jsxFileName,
								lineNumber: 387,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 385,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 space-y-6",
							children: [
								results[activeTab].image && /* @__PURE__ */ _jsxDEV("div", {
									className: "relative group rounded-2xl overflow-hidden shadow-lg border border-slate-100 mb-6",
									children: [/* @__PURE__ */ _jsxDEV("img", {
										src: results[activeTab].image,
										alt: "Blog Background",
										className: "w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 407,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
										children: "📸 Photo via Unsplash (AI 추천 이미지)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 412,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 406,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-blue-50/50 p-4 rounded-xl border border-blue-100 group",
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "flex justify-between items-center mb-2",
										children: [/* @__PURE__ */ _jsxDEV("label", {
											className: "block text-xs font-bold text-blue-500 uppercase tracking-wider",
											children: "Title"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 420,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].title),
											className: "px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1",
											children: "📋 제목 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 421,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 419,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("h2", {
										className: "text-xl font-bold text-slate-800 leading-tight",
										children: results[activeTab].title || "제목 생성 중..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 428,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 418,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "flex justify-between items-center px-1",
										children: [/* @__PURE__ */ _jsxDEV("label", {
											className: "block text-xs font-bold text-slate-400 uppercase tracking-wider",
											children: "Content"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 436,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].content),
											className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 본문 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 437,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 435,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group",
										children: [activeTab === "wordpress" && /* @__PURE__ */ _jsxDEV("div", {
											className: "mb-4 p-3 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100",
											children: "💡 꿀팁: 워드프레스 편집기에 복사해서 붙여넣으면 H2, H3 제목이 자동으로 적용됩니다!"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 446,
											columnNumber: 21
										}, this), /* @__PURE__ */ _jsxDEV("div", {
											className: "prose prose-slate max-w-none text-base leading-relaxed \n                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100\n                    prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4\n                    prose-p:mb-6 prose-li:mb-2",
											children: /* @__PURE__ */ _jsxDEV(ReactMarkdown, { children: results[activeTab].content }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 454,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 450,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 444,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 434,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4",
									children: [/* @__PURE__ */ _jsxDEV("span", {
										className: "text-xl",
										children: "⚠️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 461,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 463,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-2",
												children: [
													"본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 정책 변경이나 최신 정보 반영에 시차가 있을 수 있으니,",
													/* @__PURE__ */ _jsxDEV("strong", { children: " 중요한 수치나 날짜 등은 반드시 공식 홈페이지를 통해 최종 확인" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 466,
														columnNumber: 21
													}, this),
													" 후 발행해 주세요!"
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 464,
												columnNumber: 19
											}, this),
											results[activeTab].official_link && /* @__PURE__ */ _jsxDEV("a", {
												href: results[activeTab].official_link,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition-all border border-amber-300",
												children: "🔗 공식 홈페이지 바로가기"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 469,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 462,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 460,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-slate-50 p-4 rounded-xl border border-slate-200 group",
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "flex justify-between items-center mb-2",
										children: [/* @__PURE__ */ _jsxDEV("label", {
											className: "block text-xs font-bold text-slate-400 uppercase tracking-wider",
											children: "Hashtags"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 484,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 485,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 483,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그 #추천 #중"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 492,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 482,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 402,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 383,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 252,
				columnNumber: 7
			}, this),
			isSettingsOpen && /* @__PURE__ */ _jsxDEV("div", {
				className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-100 text-left",
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ _jsxDEV("h2", {
								className: "text-2xl font-black text-slate-800",
								children: "⚙️ 시스템 설정"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 505,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 506,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 504,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 510,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "relative group",
								children: [/* @__PURE__ */ _jsxDEV("input", {
									type: showApiKey ? "text" : "password",
									value: apiKey,
									onChange: handleSaveApiKey,
									className: "w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono text-sm",
									placeholder: "Gemini API 키를 입력하세요"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 512,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowApiKey(!showApiKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									title: showApiKey ? "키 숨기기" : "키 보기",
									children: showApiKey ? /* @__PURE__ */ _jsxDEV("svg", {
										xmlns: "http://www.w3.org/2000/svg",
										width: "20",
										height: "20",
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [
											/* @__PURE__ */ _jsxDEV("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 526,
												columnNumber: 199
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 526,
												columnNumber: 241
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 526,
												columnNumber: 329
											}, this),
											/* @__PURE__ */ _jsxDEV("line", {
												x1: "2",
												x2: "22",
												y1: "2",
												y2: "22"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 526,
												columnNumber: 409
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 526,
										columnNumber: 21
									}, this) : /* @__PURE__ */ _jsxDEV("svg", {
										xmlns: "http://www.w3.org/2000/svg",
										width: "20",
										height: "20",
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [/* @__PURE__ */ _jsxDEV("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 528,
											columnNumber: 199
										}, this), /* @__PURE__ */ _jsxDEV("circle", {
											cx: "12",
											cy: "12",
											r: "3"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 528,
											columnNumber: 255
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 528,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 519,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 511,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 509,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "📸 Unsplash Access Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 535,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "relative group",
								children: [/* @__PURE__ */ _jsxDEV("input", {
									type: showUnsplashKey ? "text" : "password",
									value: unsplashKey,
									onChange: (e) => {
										setUnsplashKey(e.target.value);
										localStorage.setItem("unsplash_key", e.target.value);
									},
									className: "w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono text-sm",
									placeholder: "Unsplash 키를 입력하세요"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 537,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowUnsplashKey(!showUnsplashKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									title: showUnsplashKey ? "키 숨기기" : "키 보기",
									children: showUnsplashKey ? /* @__PURE__ */ _jsxDEV("svg", {
										xmlns: "http://www.w3.org/2000/svg",
										width: "20",
										height: "20",
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [
											/* @__PURE__ */ _jsxDEV("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 551,
												columnNumber: 199
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 551,
												columnNumber: 241
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 551,
												columnNumber: 329
											}, this),
											/* @__PURE__ */ _jsxDEV("line", {
												x1: "2",
												x2: "22",
												y1: "2",
												y2: "22"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 551,
												columnNumber: 409
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 551,
										columnNumber: 21
									}, this) : /* @__PURE__ */ _jsxDEV("svg", {
										xmlns: "http://www.w3.org/2000/svg",
										width: "20",
										height: "20",
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [/* @__PURE__ */ _jsxDEV("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 553,
											columnNumber: 199
										}, this), /* @__PURE__ */ _jsxDEV("circle", {
											cx: "12",
											cy: "12",
											r: "3"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 553,
											columnNumber: 255
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 553,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 544,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 536,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 534,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left",
							children: [
								/* @__PURE__ */ _jsxDEV("h3", {
									className: "text-sm font-black text-indigo-600 uppercase tracking-wider",
									children: "💾 코다리 백업 관리"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 560,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("p", {
									className: "text-xs text-indigo-400 leading-relaxed",
									children: "작업 중에 코드가 꼬이는 것을 방지하기 위해 정기적으로 백업본을 생성하십시오."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 561,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("button", {
									onClick: handleDownloadBackup,
									className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all flex items-center justify-center gap-2",
									children: "📂 현재 버전 즉시 백업(다운로드)"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 562,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 559,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "pt-4 border-t border-slate-100",
							children: /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => {
									localStorage.setItem("gemini_api_key", apiKey);
									setIsSettingsOpen(false);
									alert("대표님, 설정이 저장되었습니다! 🫡");
								},
								className: "w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all",
								children: "설정 저장 및 적용"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 566,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 565,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 503,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 502,
				columnNumber: 9
			}, this),
			isAuthModalOpen && /* @__PURE__ */ _jsxDEV("div", {
				className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 text-center shadow-2xl border border-slate-100 relative",
					children: [
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: () => setIsAuthModalOpen(false),
							className: "absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-all",
							children: "✕"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 575,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2",
							children: "🔑"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 576,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							className: "text-2xl font-black text-slate-800",
							children: "대표님 인증 필요 🫡"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 577,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							className: "text-sm text-slate-500",
							children: [
								"이 앱은 대표님 전용입니다.",
								/* @__PURE__ */ _jsxDEV("br", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 578,
									columnNumber: 66
								}, this),
								"비밀 코드를 입력해 주세요."
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 578,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("input", {
							type: "password",
							value: authCode,
							onChange: (e) => setAuthCode(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && handleLogin(),
							placeholder: "코드를 입력하세요",
							className: "w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center text-2xl font-black focus:border-indigo-500 focus:outline-none transition-all"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 579,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 580,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 574,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 573,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 251,
		columnNumber: 5
	}, this);
}
_s(App, "ddGD1xKUoeAC7BsHmy1keN+kwW4=");
_c = App;
export default App;
var _c;
$RefreshReg$(_c, "App");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/App.jsx?t=1777199381220";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("D:/초보프로젝트/blog-generator/src/App.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("D:/초보프로젝트/blog-generator/src/App.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "D:/초보프로젝트/blog-generator/src/App.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxtQkFBbUI7QUFDNUIsT0FBTyxtQkFBbUI7Ozs7QUFFMUIsU0FBUyxNQUFNOztDQUNiLE1BQU0sQ0FBQyxPQUFPLFlBQVksU0FBUyxHQUFHO0NBQ3RDLE1BQU0sQ0FBQyxPQUFPLFlBQVksU0FBUztFQUNqQyxPQUFPO0VBQ1AsU0FBUztFQUNULFdBQVc7RUFDWixDQUFDO0NBQ0YsTUFBTSxDQUFDLFdBQVcsZ0JBQWdCLFNBQVM7RUFBRSxPQUFPO0VBQU0sU0FBUztFQUFNLFdBQVc7RUFBTSxDQUFDO0NBQzNGLE1BQU0sQ0FBQyxRQUFRLGFBQWEsU0FBUyxhQUFhLFFBQVEsaUJBQWlCLElBQUksR0FBRztDQUNsRixNQUFNLENBQUMsYUFBYSxrQkFBa0IsU0FBUyxhQUFhLFFBQVEsZUFBZSxJQUFJLEdBQUc7Q0FDMUYsTUFBTSxDQUFDLFNBQVMsY0FBYyxTQUFTLE1BQU07Q0FDN0MsTUFBTSxDQUFDLFNBQVMsY0FBYyxTQUFTO0VBQ3JDLE9BQU87R0FBRSxPQUFPO0dBQUksU0FBUztHQUFJLE1BQU07R0FBSSxlQUFlO0dBQUksT0FBTztHQUFJO0VBQ3pFLFNBQVM7R0FBRSxPQUFPO0dBQUksU0FBUztHQUFJLE1BQU07R0FBSSxlQUFlO0dBQUksT0FBTztHQUFJO0VBQzNFLFdBQVc7R0FBRSxPQUFPO0dBQUksU0FBUztHQUFJLE1BQU07R0FBSSxlQUFlO0dBQUksT0FBTztHQUFJO0VBQzlFLENBQUM7Q0FDRixNQUFNLENBQUMsV0FBVyxnQkFBZ0IsU0FBUyxRQUFRO0NBQ25ELE1BQU0sQ0FBQyxPQUFPLFlBQVksU0FBUyxHQUFHO0NBQ3RDLE1BQU0sQ0FBQyxZQUFZLGlCQUFpQixTQUFTLE1BQU07Q0FDbkQsTUFBTSxDQUFDLGlCQUFpQixzQkFBc0IsU0FBUyxNQUFNO0NBQzdELE1BQU0sQ0FBQyxVQUFVLGVBQWUsU0FBUyxLQUFLO0NBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IscUJBQXFCLFNBQVMsTUFBTTtDQUMzRCxNQUFNLENBQUMsaUJBQWlCLHNCQUFzQixTQUFTLGFBQWEsUUFBUSxtQkFBbUIsS0FBSyxPQUFPO0NBQzNHLE1BQU0sQ0FBQyxpQkFBaUIsc0JBQXNCLFNBQVMsTUFBTTtDQUM3RCxNQUFNLENBQUMsVUFBVSxlQUFlLFNBQVMsR0FBRztDQUU1QyxNQUFNLG9CQUFvQjtBQUN4QixNQUFJLGFBQWEsV0FBVztBQUMxQixzQkFBbUIsS0FBSztBQUN4QixnQkFBYSxRQUFRLG9CQUFvQixPQUFPO0FBQ2hELHNCQUFtQixNQUFNO0FBQ3pCLFNBQU0sNkNBQTZDO1NBQzlDO0FBQ0wsU0FBTSxzQ0FBc0M7OztDQUloRCxNQUFNLHFCQUFxQjtBQUN6QixxQkFBbUIsTUFBTTtBQUN6QixlQUFhLFdBQVcsbUJBQW1CO0FBQzNDLFFBQU0sa0JBQWtCOztDQUcxQixNQUFNLG9CQUFvQixNQUFNO0VBQzlCLE1BQU0sTUFBTSxFQUFFLE9BQU87QUFDckIsWUFBVSxJQUFJO0FBQ2QsZUFBYSxRQUFRLGtCQUFrQixJQUFJOztDQUc3QyxNQUFNLHVCQUF1QixZQUFZO0FBQ3ZDLE1BQUk7R0FDRixNQUFNLFdBQVcsTUFBTSxNQUFNLGVBQWU7R0FDNUMsTUFBTSxPQUFPLE1BQU0sU0FBUyxNQUFNO0dBQ2xDLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0dBQzFELE1BQU0sTUFBTSxJQUFJLGdCQUFnQixLQUFLO0dBQ3JDLE1BQU0sT0FBTyxTQUFTLGNBQWMsSUFBSTtHQUN4QyxNQUFNLE9BQU8sSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsU0FBUyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUc7QUFDeEUsUUFBSyxPQUFPO0FBQ1osUUFBSyxXQUFXLHdCQUF3QixLQUFLO0FBQzdDLFlBQVMsS0FBSyxZQUFZLEtBQUs7QUFDL0IsUUFBSyxPQUFPO0FBQ1osWUFBUyxLQUFLLFlBQVksS0FBSztBQUMvQixPQUFJLGdCQUFnQixJQUFJO0FBQ3hCLFNBQU0sK0dBQTZHO1dBQzVHLEtBQUs7QUFDWixTQUFNLHFEQUFxRDs7O0NBSS9ELE1BQU0sY0FBYyxPQUFPLGFBQWE7QUFDdEMsTUFBSSxDQUFDLFlBQWEsUUFBTztHQUFDO0dBQUk7R0FBSTtHQUFHO0FBQ3JDLE1BQUk7R0FDRixNQUFNLGFBQWEsT0FBTyxZQUFZO0lBQ3BDLE1BQU0sUUFBUSxtQkFBbUIsVUFBVSxzQkFBc0I7SUFDakUsSUFBSSxXQUFXLE1BQU0sTUFBTSxnREFBZ0QsTUFBTSx3QkFBd0IsY0FBYztJQUN2SCxJQUFJLE9BQU8sTUFBTSxTQUFTLE1BQU07O0FBR2hDLFFBQUksQ0FBQyxLQUFLLFdBQVcsS0FBSyxRQUFRLFdBQVcsR0FBRztBQUM5QyxnQkFBVyxNQUFNLE1BQU0sZ0RBQWdELG1CQUFtQix5QkFBeUIsQ0FBQyx3QkFBd0IsY0FBYztBQUMxSixZQUFPLE1BQU0sU0FBUyxNQUFNOztBQUc5QixXQUFPLEtBQUssVUFBVSxJQUFJLE1BQU0sV0FBVzs7R0FHN0MsTUFBTSxNQUFNLE1BQU0sUUFBUSxTQUFTLEdBQUcsV0FBVztJQUFDO0lBQU87SUFBTztJQUFNO0FBQ3RFLFVBQU8sTUFBTSxRQUFRLElBQUksSUFBSSxLQUFJLE9BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztXQUNoRCxLQUFLO0FBQ1osV0FBUSxNQUFNLHNCQUFzQixJQUFJO0FBQ3hDLFVBQU87SUFBQztJQUFJO0lBQUk7SUFBRzs7O0NBSXZCLE1BQU0sa0JBQWtCLFlBQVk7QUFDbEMsTUFBSSxDQUFDLGlCQUFpQjtBQUNwQixzQkFBbUIsS0FBSztBQUN4Qjs7RUFFRixNQUFNLFdBQVcsT0FBTyxNQUFNLElBQUksYUFBYSxRQUFRLGlCQUFpQjtBQUV4RSxNQUFJLENBQUMsVUFBVTtBQUNiLHFCQUFrQixLQUFLO0FBQ3ZCLFNBQU0sNkJBQTZCO0FBQ25DOztBQUdGLE1BQUksQ0FBQyxNQUFNLE1BQU0sRUFBRTtBQUNqQixZQUFTLGtCQUFrQjtBQUMzQjs7QUFHRixhQUFXLEtBQUs7QUFDaEIsV0FBUyxHQUFHO0FBRVosTUFBSTtHQUNGLE1BQU0sVUFBVSxtR0FBbUc7O0dBR25ILE1BQU0sa0JBQWtCLEVBQUU7R0FDMUIsTUFBTSxpQkFBaUI7QUFFdkIsT0FBSSxVQUFVLE1BQU8saUJBQWdCLEtBQUssWUFBWSxlQUFlLFFBQVEsU0FBUyxvQkFBb0IsTUFBTSxNQUFNLDhDQUE4QyxHQUFHO0FBQ3ZLLE9BQUksVUFBVSxRQUFTLGlCQUFnQixLQUFLLGNBQWMsZUFBZSxRQUFRLFNBQVMsaUJBQWlCLE1BQU0sUUFBUSwyQ0FBMkMsR0FBRztBQUN2SyxPQUFJLFVBQVUsVUFBVyxpQkFBZ0IsS0FBSyxnQkFBZ0IsZUFBZSxRQUFRLFNBQVMsdUJBQXVCLE1BQU0sVUFBVSw2Q0FBNkMsR0FBRztHQUV6TCxNQUFNLGlCQUFpQixRQUFRLE1BQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThDakMsTUFBTSxXQUFXLE1BQU0sTUFBTSxTQUFTO0lBQ3BDLFFBQVE7SUFDUixTQUFTLEVBQUUsZ0JBQWdCLG9CQUFvQjtJQUMvQyxNQUFNLEtBQUssVUFBVTtLQUNuQixVQUFVLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRSxNQUFNLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztLQUNqRCxPQUFPLENBQUMsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDO0tBQy9CLENBQUM7SUFDSCxDQUFDO0FBRUYsT0FBSSxDQUFDLFNBQVMsSUFBSTtJQUNoQixNQUFNLFlBQVksTUFBTSxTQUFTLE1BQU07QUFDdkMsVUFBTSxJQUFJLE1BQU0sVUFBVSxPQUFPLFdBQVcsWUFBWTs7R0FHMUQsTUFBTSxPQUFPLE1BQU0sU0FBUyxNQUFNO0dBQ2xDLElBQUksa0JBQWtCLEtBQUssV0FBVyxHQUFHLFFBQVEsTUFBTSxHQUFHO0dBRTFELElBQUksZUFBZSxnQkFBZ0IsUUFBUSxhQUFhLEdBQUcsQ0FBQyxRQUFRLFNBQVMsR0FBRyxDQUFDLE1BQU07R0FFdkYsTUFBTSxhQUFhLEtBQUssTUFBTSxhQUFhO0dBQzNDLE1BQU0sY0FBYztJQUFFLE9BQU87SUFBSSxTQUFTO0lBQVMsTUFBTTtJQUFJLGVBQWU7SUFBSSxPQUFPO0lBQUk7R0FFM0YsSUFBSSxjQUFjO0lBQUM7SUFBSTtJQUFJO0lBQUc7QUFDOUIsT0FBSSxZQUFZLGFBQWE7O0FBRTNCLGtCQUFjLE1BQU0sWUFBWSxXQUFXLFlBQVk7S0FBQztLQUFPO0tBQU87S0FBTSxDQUFDOztBQUcvRSxjQUFXO0lBQ1QsT0FBTyxXQUFXLFFBQVE7S0FBRSxHQUFHO0tBQWEsR0FBRyxXQUFXO0tBQU8sT0FBTyxZQUFZO0tBQUksR0FBRztJQUMzRixTQUFTLFdBQVcsVUFBVTtLQUFFLEdBQUc7S0FBYSxHQUFHLFdBQVc7S0FBUyxPQUFPLFlBQVk7S0FBSSxHQUFHO0lBQ2pHLFdBQVcsV0FBVyxZQUFZO0tBQUUsR0FBRztLQUFhLEdBQUcsV0FBVztLQUFXLE9BQU8sWUFBWTtLQUFJLEdBQUc7SUFDeEcsQ0FBQztXQUVLLEtBQUs7QUFDWixXQUFRLE1BQU0sSUFBSTtBQUNsQixZQUFTLGlCQUFpQixJQUFJLFFBQVE7WUFDOUI7QUFDUixjQUFXLE1BQU07OztDQUlyQixNQUFNLGtCQUFrQixPQUFPLFNBQVM7QUFDdEMsTUFBSTs7R0FFRixNQUFNLFlBQVk7R0FDbEIsSUFBSSxjQUFjLEtBQ2YsUUFBUSxpQkFBaUIsR0FBRyxDQUM1QixRQUFRLGtCQUFrQixHQUFHLENBQzdCLFFBQVEsaUJBQWlCLG1IQUFtSCxVQUFVLGlCQUFpQixDQUN2SyxRQUFRLGdCQUFnQixtSEFBbUgsVUFBVSxpQkFBaUIsQ0FDdEssUUFBUSxnQkFBZ0IsaUVBQWlFLFVBQVUsa0JBQWtCLENBQ3JILFFBQVEsbUJBQW1CLHNCQUFzQixDQUNqRCxNQUFNLEtBQUssQ0FBQyxLQUFJLFNBQVE7SUFDdkIsTUFBTSxVQUFVLEtBQUssTUFBTTtBQUMzQixRQUFJLFlBQVksR0FBSSxRQUFPO0FBQzNCLFFBQUksUUFBUSxXQUFXLEtBQUssSUFBSSxRQUFRLFdBQVcsTUFBTSxDQUFFLFFBQU87QUFDbEUsV0FBTyxnR0FBZ0csVUFBVSxJQUFJLFFBQVE7S0FDN0gsQ0FBQyxRQUFPLFNBQVEsU0FBUyxHQUFHLENBQUMsS0FBSyxHQUFHOztHQUd6QyxNQUFNLFdBQVcsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7R0FDL0QsTUFBTSxXQUFXLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sY0FBYyxDQUFDO0dBQ3pELE1BQU0sT0FBTyxDQUFDLElBQUksY0FBYztJQUFFLGFBQWE7SUFBVSxjQUFjO0lBQVUsQ0FBQyxDQUFDO0FBRW5GLFNBQU0sVUFBVSxVQUFVLE1BQU0sS0FBSztBQUNyQyxTQUFNLDJDQUEyQztXQUMxQyxLQUFLO0FBQ1osYUFBVSxVQUFVLFVBQVUsS0FBSztBQUNuQyxTQUFNLGdCQUFnQjs7O0FBSTFCLFFBQ0Usd0JBQUMsT0FBRDtFQUFLLFdBQVU7WUFBZjtHQUNFLHdCQUFDLE9BQUQ7SUFBSyxXQUFVO2NBQWY7S0FHRSx3QkFBQyxVQUFEO01BQVEsV0FBVTtnQkFBbEIsQ0FDRSx3QkFBQyxPQUFEO09BQUssV0FBVTtpQkFBZjtRQUNFLHdCQUFDLE9BQUQsRUFBSyxXQUFVLFFBQWE7Ozs7O1FBQzVCLHdCQUFDLE1BQUQ7U0FBSSxXQUFVO21CQUE4SDtTQUFtQjs7Ozs7UUFDL0osd0JBQUMsT0FBRDtTQUFLLFdBQVU7bUJBQWYsQ0FDRSx3QkFBQyxVQUFEO1VBQVEsZUFBZSxrQkFBa0IsS0FBSztVQUFFLFdBQVU7b0JBQWlHO1VBQVc7Ozs7bUJBQ3JLLGtCQUNDLHdCQUFDLFVBQUQ7VUFBUSxTQUFTO1VBQWMsV0FBVTtvQkFBbUc7VUFBYzs7OztvQkFFMUosd0JBQUMsVUFBRDtVQUFRLGVBQWUsbUJBQW1CLEtBQUs7VUFBRSxXQUFVO29CQUF1RztVQUFpQjs7OztrQkFFakw7Ozs7OztRQUNGOzs7OztnQkFDTix3QkFBQyxLQUFEO09BQUcsV0FBVTtpQkFBcUM7T0FBd0M7Ozs7ZUFDbkY7Ozs7OztLQUdULHdCQUFDLE9BQUQ7TUFBSyxXQUFVO2dCQUFmO09BRUUsd0JBQUMsT0FBRDtRQUFLLFdBQVU7a0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1NBQU8sV0FBVTttQkFBOEM7U0FBaUI7Ozs7a0JBQ2hGLHdCQUFDLFNBQUQ7U0FDRSxNQUFLO1NBQ0wsT0FBTztTQUNQLFdBQVcsTUFBTSxTQUFTLEVBQUUsT0FBTyxNQUFNO1NBQ3pDLFlBQVksTUFBTSxFQUFFLFFBQVEsV0FBVyxpQkFBaUI7U0FDeEQsYUFBWTtTQUNaLFdBQVU7U0FDVjs7OztpQkFDRTs7Ozs7O09BRU4sd0JBQUMsT0FBRDtRQUFLLFdBQVU7a0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1NBQU8sV0FBVTttQkFBakIsQ0FBdUYsdUJBRXJGLHdCQUFDLFFBQUQ7VUFBTSxXQUFVO29CQUFxQztVQUF5Qzs7OztrQkFDeEY7Ozs7O2tCQUVSLHdCQUFDLE9BQUQ7U0FBSyxXQUFVO21CQUFmO1VBRUUsd0JBQUMsT0FBRDtXQUFLLFdBQVcsMENBQTBDLFVBQVUsUUFBUSx3Q0FBd0M7cUJBQXBILENBQ0Usd0JBQUMsU0FBRDtZQUFPLFdBQVU7c0JBQWpCLENBQ0Usd0JBQUMsU0FBRDthQUFPLE1BQUs7YUFBVyxTQUFTLFVBQVU7YUFBTyxnQkFBZ0IsYUFBYTtjQUFDLEdBQUc7Y0FBVyxPQUFPLENBQUMsVUFBVTtjQUFNLENBQUM7YUFBRSxXQUFVO2FBQXlFOzs7O3NCQUMzTSx3QkFBQyxRQUFEO2FBQU0sV0FBVTt1QkFBd0U7YUFBYTs7OztxQkFDL0Y7Ozs7O3FCQUNSLHdCQUFDLFVBQUQ7WUFDRSxVQUFVLENBQUMsVUFBVTtZQUNyQixPQUFPLE1BQU07WUFDYixXQUFXLE1BQU0sU0FBUzthQUFDLEdBQUc7YUFBTyxPQUFPLEVBQUUsT0FBTzthQUFNLENBQUM7WUFDNUQsV0FBVTtzQkFKWjthQU1FLHdCQUFDLFVBQUQ7Y0FBUSxPQUFNO3dCQUFTO2NBQW1COzs7OzthQUMxQyx3QkFBQyxVQUFEO2NBQVEsT0FBTTt3QkFBVTtjQUFnQjs7Ozs7YUFDeEMsd0JBQUMsVUFBRDtjQUFRLE9BQU07d0JBQVc7Y0FBaUI7Ozs7O2FBQzFDLHdCQUFDLFVBQUQ7Y0FBUSxPQUFNO3dCQUFXO2NBQWlCOzs7OzthQUNuQzs7Ozs7b0JBQ0w7Ozs7OztVQUdOLHdCQUFDLE9BQUQ7V0FBSyxXQUFXLDBDQUEwQyxVQUFVLFVBQVUseUNBQXlDO3FCQUF2SCxDQUNFLHdCQUFDLFNBQUQ7WUFBTyxXQUFVO3NCQUFqQixDQUNFLHdCQUFDLFNBQUQ7YUFBTyxNQUFLO2FBQVcsU0FBUyxVQUFVO2FBQVMsZ0JBQWdCLGFBQWE7Y0FBQyxHQUFHO2NBQVcsU0FBUyxDQUFDLFVBQVU7Y0FBUSxDQUFDO2FBQUUsV0FBVTthQUEyRTs7OztzQkFDbk4sd0JBQUMsUUFBRDthQUFNLFdBQVU7dUJBQXlFO2FBQWM7Ozs7cUJBQ2pHOzs7OztxQkFDUix3QkFBQyxVQUFEO1lBQ0UsVUFBVSxDQUFDLFVBQVU7WUFDckIsT0FBTyxNQUFNO1lBQ2IsV0FBVyxNQUFNLFNBQVM7YUFBQyxHQUFHO2FBQU8sU0FBUyxFQUFFLE9BQU87YUFBTSxDQUFDO1lBQzlELFdBQVU7c0JBSlo7YUFNRSx3QkFBQyxVQUFEO2NBQVEsT0FBTTt3QkFBUztjQUFtQjs7Ozs7YUFDMUMsd0JBQUMsVUFBRDtjQUFRLE9BQU07d0JBQVU7Y0FBZ0I7Ozs7O2FBQ3hDLHdCQUFDLFVBQUQ7Y0FBUSxPQUFNO3dCQUFXO2NBQWlCOzs7OzthQUMxQyx3QkFBQyxVQUFEO2NBQVEsT0FBTTt3QkFBVztjQUFpQjs7Ozs7YUFDbkM7Ozs7O29CQUNMOzs7Ozs7VUFHTix3QkFBQyxPQUFEO1dBQUssV0FBVywwQ0FBMEMsVUFBVSxZQUFZLHVDQUF1QztxQkFBdkgsQ0FDRSx3QkFBQyxTQUFEO1lBQU8sV0FBVTtzQkFBakIsQ0FDRSx3QkFBQyxTQUFEO2FBQU8sTUFBSzthQUFXLFNBQVMsVUFBVTthQUFXLGdCQUFnQixhQUFhO2NBQUMsR0FBRztjQUFXLFdBQVcsQ0FBQyxVQUFVO2NBQVUsQ0FBQzthQUFFLFdBQVU7YUFBdUU7Ozs7c0JBQ3JOLHdCQUFDLFFBQUQ7YUFBTSxXQUFVO3VCQUF1RTthQUFlOzs7O3FCQUNoRzs7Ozs7cUJBQ1Isd0JBQUMsVUFBRDtZQUNFLFVBQVUsQ0FBQyxVQUFVO1lBQ3JCLE9BQU8sTUFBTTtZQUNiLFdBQVcsTUFBTSxTQUFTO2FBQUMsR0FBRzthQUFPLFdBQVcsRUFBRSxPQUFPO2FBQU0sQ0FBQztZQUNoRSxXQUFVO3NCQUpaO2FBTUUsd0JBQUMsVUFBRDtjQUFRLE9BQU07d0JBQWE7Y0FBbUI7Ozs7O2FBQzlDLHdCQUFDLFVBQUQ7Y0FBUSxPQUFNO3dCQUFTO2NBQW1COzs7OzthQUMxQyx3QkFBQyxVQUFEO2NBQVEsT0FBTTt3QkFBVztjQUFpQjs7Ozs7YUFDMUMsd0JBQUMsVUFBRDtjQUFRLE9BQU07d0JBQVc7Y0FBaUI7Ozs7O2FBQ25DOzs7OztvQkFDTDs7Ozs7O1VBQ0Y7Ozs7O2lCQUNGOzs7Ozs7T0FHTCxTQUFTLHdCQUFDLEtBQUQ7UUFBRyxXQUFVO2tCQUFnRDtRQUFVOzs7OztPQUdqRix3QkFBQyxPQUFEO1FBQUssV0FBVTtrQkFBZjtTQUNFLHdCQUFDLFFBQUQ7VUFBTSxXQUFXLHVDQUF1QyxDQUFDLFdBQVcsbUJBQW1CO29CQUFvQjtVQUFnQjs7Ozs7U0FDM0gsd0JBQUMsVUFBRDtVQUNFLGVBQWUsWUFBWSxDQUFDLFNBQVM7VUFDckMsV0FBVyw4REFBOEQsV0FBVyxrQkFBa0I7b0JBRXRHLHdCQUFDLE9BQUQsRUFBSyxXQUFXLHlGQUF5RixXQUFXLGtCQUFrQixtQkFBcUI7Ozs7O1VBQ3BKOzs7OztTQUNULHdCQUFDLFFBQUQ7VUFBTSxXQUFXLHVDQUF1QyxXQUFXLG9CQUFvQjtvQkFBb0I7VUFBbUI7Ozs7O1NBQzFIOzs7Ozs7T0FFTix3QkFBQyxVQUFEO1FBQ0UsU0FBUztRQUNULFVBQVU7UUFDVixXQUFVO2tCQUVULFVBQ0MsZ0RBQ0Usd0JBQUMsT0FBRDtTQUFLLFdBQVU7U0FBNkMsT0FBTTtTQUE2QixNQUFLO1NBQU8sU0FBUTttQkFBbkgsQ0FBK0gsd0JBQUMsVUFBRDtVQUFRLFdBQVU7VUFBYSxJQUFHO1VBQUssSUFBRztVQUFLLEdBQUU7VUFBSyxRQUFPO1VBQWUsYUFBWTtVQUFhOzs7OzJDQUFDLFFBQUQ7VUFBTSxXQUFVO1VBQWEsTUFBSztVQUFlLEdBQUU7VUFBeUg7Ozs7a0JBQU07Ozs7O3dDQUVyWixvQkFDRDtRQUNHOzs7OztPQUNMOzs7Ozs7S0FHTCxPQUFPLE9BQU8sUUFBUSxDQUFDLE1BQUssUUFBTyxJQUFJLFFBQVEsSUFDOUMsd0JBQUMsT0FBRDtNQUFLLFdBQVU7Z0JBQWYsQ0FFRSx3QkFBQyxPQUFEO09BQUssV0FBVTtpQkFDWjtRQUFDO1FBQVM7UUFBVztRQUFZLENBQUMsUUFBTyxRQUFPLFVBQVUsS0FBSyxDQUFDLEtBQUssUUFDcEUsd0JBQUMsVUFBRDtRQUVFLGVBQWUsYUFBYSxJQUFJO1FBQ2hDLFdBQVcsZ0RBQ1QsY0FBYyxNQUNaLHNEQUNBO2tCQUdILFFBQVEsVUFBVSxlQUFlLFFBQVEsWUFBWSxZQUFZO1FBQzNELEVBVEY7Ozs7ZUFTRSxDQUNUO09BQ0U7Ozs7Z0JBR04sd0JBQUMsT0FBRDtPQUFLLFdBQVU7aUJBQWY7UUFHRyxRQUFRLFdBQVcsU0FDbEIsd0JBQUMsT0FBRDtTQUFLLFdBQVU7bUJBQWYsQ0FDRSx3QkFBQyxPQUFEO1VBQ0UsS0FBSyxRQUFRLFdBQVc7VUFDeEIsS0FBSTtVQUNKLFdBQVU7VUFDVjs7OzttQkFDRix3QkFBQyxPQUFEO1VBQUssV0FBVTtvQkFBNks7VUFFdEw7Ozs7a0JBQ0Y7Ozs7OztRQUdSLHdCQUFDLE9BQUQ7U0FBSyxXQUFVO21CQUFmLENBQ0Usd0JBQUMsT0FBRDtVQUFLLFdBQVU7b0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1dBQU8sV0FBVTtxQkFBaUU7V0FBYTs7OztvQkFDL0Ysd0JBQUMsVUFBRDtXQUNFLGVBQWUsZ0JBQWdCLFFBQVEsV0FBVyxNQUFNO1dBQ3hELFdBQVU7cUJBQ1g7V0FFUTs7OzttQkFDTDs7Ozs7bUJBQ04sd0JBQUMsTUFBRDtVQUFJLFdBQVU7b0JBQ1gsUUFBUSxXQUFXLFNBQVM7VUFDMUI7Ozs7a0JBQ0Q7Ozs7OztRQUdOLHdCQUFDLE9BQUQ7U0FBSyxXQUFVO21CQUFmLENBQ0Usd0JBQUMsT0FBRDtVQUFLLFdBQVU7b0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1dBQU8sV0FBVTtxQkFBa0U7V0FBZTs7OztvQkFDbEcsd0JBQUMsVUFBRDtXQUNFLGVBQWUsZ0JBQWdCLFFBQVEsV0FBVyxRQUFRO1dBQzFELFdBQVU7cUJBQ1g7V0FFUTs7OzttQkFDTDs7Ozs7bUJBQ04sd0JBQUMsT0FBRDtVQUFLLFdBQVU7b0JBQWYsQ0FDRyxjQUFjLGVBQ2Isd0JBQUMsT0FBRDtXQUFLLFdBQVU7cUJBQW1IO1dBRTVIOzs7O29CQUVSLHdCQUFDLE9BQUQ7V0FBSyxXQUFVO3FCQUliLHdCQUFDLGVBQUQsWUFBZ0IsUUFBUSxXQUFXLFNBQXdCOzs7OztXQUN2RDs7OzttQkFDRjs7Ozs7a0JBQ0Y7Ozs7OztRQUdOLHdCQUFDLE9BQUQ7U0FBSyxXQUFVO21CQUFmLENBQ0Usd0JBQUMsUUFBRDtVQUFNLFdBQVU7b0JBQVU7VUFBUzs7OzttQkFDbkMsd0JBQUMsT0FBRDtVQUFLLFdBQVU7b0JBQWY7V0FDRSx3QkFBQyxLQUFEO1lBQUcsV0FBVTtzQkFBd0M7WUFBZ0I7Ozs7O1dBQ3JFLHdCQUFDLEtBQUQ7WUFBRyxXQUFVO3NCQUFiO2FBQTJEO2FBRXpELHdCQUFDLFVBQUQsWUFBUSx3Q0FBNkM7Ozs7OzthQUNuRDs7Ozs7O1dBQ0gsUUFBUSxXQUFXLGlCQUNsQix3QkFBQyxLQUFEO1lBQ0UsTUFBTSxRQUFRLFdBQVc7WUFDekIsUUFBTztZQUNQLEtBQUk7WUFDSixXQUFVO3NCQUNYO1lBRUc7Ozs7O1dBRUY7Ozs7O2tCQUNGOzs7Ozs7UUFHTix3QkFBQyxPQUFEO1NBQUssV0FBVTttQkFBZixDQUNFLHdCQUFDLE9BQUQ7VUFBSyxXQUFVO29CQUFmLENBQ0Usd0JBQUMsU0FBRDtXQUFPLFdBQVU7cUJBQWtFO1dBQWdCOzs7O29CQUNuRyx3QkFBQyxVQUFEO1dBQ0UsZUFBZSxnQkFBZ0IsUUFBUSxXQUFXLEtBQUs7V0FDdkQsV0FBVTtxQkFDWDtXQUVROzs7O21CQUNMOzs7OzttQkFDTix3QkFBQyxLQUFEO1VBQUcsV0FBVTtvQkFDVixRQUFRLFdBQVcsUUFBUTtVQUMxQjs7OztrQkFDQTs7Ozs7O1FBQ0Y7Ozs7O2VBQ0Y7Ozs7OztLQUdKOzs7Ozs7R0FDTCxrQkFDQyx3QkFBQyxPQUFEO0lBQUssV0FBVTtjQUNiLHdCQUFDLE9BQUQ7S0FBSyxXQUFVO2VBQWY7TUFDRSx3QkFBQyxPQUFEO09BQUssV0FBVTtpQkFBZixDQUNFLHdCQUFDLE1BQUQ7UUFBSSxXQUFVO2tCQUFxQztRQUFjOzs7O2lCQUNqRSx3QkFBQyxVQUFEO1FBQVEsZUFBZSxrQkFBa0IsTUFBTTtRQUFFLFdBQVU7a0JBQXNDO1FBQVU7Ozs7Z0JBQ3ZHOzs7Ozs7TUFFTix3QkFBQyxPQUFEO09BQUssV0FBVTtpQkFBZixDQUNFLHdCQUFDLFNBQUQ7UUFBTyxXQUFVO2tCQUEyRDtRQUF5Qjs7OztpQkFDckcsd0JBQUMsT0FBRDtRQUFLLFdBQVU7a0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1NBQ0UsTUFBTSxhQUFhLFNBQVM7U0FDNUIsT0FBTztTQUNQLFVBQVU7U0FDVixXQUFVO1NBQ1YsYUFBWTtTQUNaOzs7O2tCQUNGLHdCQUFDLFVBQUQ7U0FDRSxNQUFLO1NBQ0wsZUFBZSxjQUFjLENBQUMsV0FBVztTQUN6QyxXQUFVO1NBQ1YsT0FBTyxhQUFhLFVBQVU7bUJBRTdCLGFBQ0Msd0JBQUMsT0FBRDtVQUFLLE9BQU07VUFBNkIsT0FBTTtVQUFLLFFBQU87VUFBSyxTQUFRO1VBQVksTUFBSztVQUFPLFFBQU87VUFBZSxhQUFZO1VBQUksZUFBYztVQUFRLGdCQUFlO29CQUExSztXQUFrTCx3QkFBQyxRQUFELEVBQU0sR0FBRSxrQ0FBa0M7Ozs7O21DQUFDLFFBQUQsRUFBTSxHQUFFLGdGQUFnRjs7Ozs7bUNBQUMsUUFBRCxFQUFNLEdBQUUsd0VBQXdFOzs7OzttQ0FBQyxRQUFEO1lBQU0sSUFBRztZQUFJLElBQUc7WUFBSyxJQUFHO1lBQUksSUFBRztZQUFNOzs7OztXQUFNOzs7OztvQkFFL2Esd0JBQUMsT0FBRDtVQUFLLE9BQU07VUFBNkIsT0FBTTtVQUFLLFFBQU87VUFBSyxTQUFRO1VBQVksTUFBSztVQUFPLFFBQU87VUFBZSxhQUFZO1VBQUksZUFBYztVQUFRLGdCQUFlO29CQUExSyxDQUFrTCx3QkFBQyxRQUFELEVBQU0sR0FBRSxnREFBZ0Q7Ozs7NENBQUMsVUFBRDtXQUFRLElBQUc7V0FBSyxJQUFHO1dBQUssR0FBRTtXQUFLOzs7O21CQUFNOzs7Ozs7U0FFMVE7Ozs7aUJBQ0w7Ozs7O2dCQUNGOzs7Ozs7TUFFTix3QkFBQyxPQUFEO09BQUssV0FBVTtpQkFBZixDQUNFLHdCQUFDLFNBQUQ7UUFBTyxXQUFVO2tCQUEyRDtRQUE4Qjs7OztpQkFDMUcsd0JBQUMsT0FBRDtRQUFLLFdBQVU7a0JBQWYsQ0FDRSx3QkFBQyxTQUFEO1NBQ0UsTUFBTSxrQkFBa0IsU0FBUztTQUNqQyxPQUFPO1NBQ1AsV0FBVyxNQUFNO0FBQUUseUJBQWUsRUFBRSxPQUFPLE1BQU07QUFBRSx1QkFBYSxRQUFRLGdCQUFnQixFQUFFLE9BQU8sTUFBTTs7U0FDdkcsV0FBVTtTQUNWLGFBQVk7U0FDWjs7OztrQkFDRix3QkFBQyxVQUFEO1NBQ0UsTUFBSztTQUNMLGVBQWUsbUJBQW1CLENBQUMsZ0JBQWdCO1NBQ25ELFdBQVU7U0FDVixPQUFPLGtCQUFrQixVQUFVO21CQUVsQyxrQkFDQyx3QkFBQyxPQUFEO1VBQUssT0FBTTtVQUE2QixPQUFNO1VBQUssUUFBTztVQUFLLFNBQVE7VUFBWSxNQUFLO1VBQU8sUUFBTztVQUFlLGFBQVk7VUFBSSxlQUFjO1VBQVEsZ0JBQWU7b0JBQTFLO1dBQWtMLHdCQUFDLFFBQUQsRUFBTSxHQUFFLGtDQUFrQzs7Ozs7bUNBQUMsUUFBRCxFQUFNLEdBQUUsZ0ZBQWdGOzs7OzttQ0FBQyxRQUFELEVBQU0sR0FBRSx3RUFBd0U7Ozs7O21DQUFDLFFBQUQ7WUFBTSxJQUFHO1lBQUksSUFBRztZQUFLLElBQUc7WUFBSSxJQUFHO1lBQU07Ozs7O1dBQU07Ozs7O29CQUUvYSx3QkFBQyxPQUFEO1VBQUssT0FBTTtVQUE2QixPQUFNO1VBQUssUUFBTztVQUFLLFNBQVE7VUFBWSxNQUFLO1VBQU8sUUFBTztVQUFlLGFBQVk7VUFBSSxlQUFjO1VBQVEsZ0JBQWU7b0JBQTFLLENBQWtMLHdCQUFDLFFBQUQsRUFBTSxHQUFFLGdEQUFnRDs7Ozs0Q0FBQyxVQUFEO1dBQVEsSUFBRztXQUFLLElBQUc7V0FBSyxHQUFFO1dBQUs7Ozs7bUJBQU07Ozs7OztTQUUxUTs7OztpQkFDTDs7Ozs7Z0JBQ0Y7Ozs7OztNQUVOLHdCQUFDLE9BQUQ7T0FBSyxXQUFVO2lCQUFmO1FBQ0Usd0JBQUMsTUFBRDtTQUFJLFdBQVU7bUJBQThEO1NBQWlCOzs7OztRQUM3Rix3QkFBQyxLQUFEO1NBQUcsV0FBVTttQkFBMEM7U0FBK0M7Ozs7O1FBQ3RHLHdCQUFDLFVBQUQ7U0FBUSxTQUFTO1NBQXNCLFdBQVU7bUJBQWlMO1NBQTZCOzs7OztRQUMzUDs7Ozs7O01BRU4sd0JBQUMsT0FBRDtPQUFLLFdBQVU7aUJBQ2Isd0JBQUMsVUFBRDtRQUFRLGVBQWU7QUFBRSxzQkFBYSxRQUFRLGtCQUFrQixPQUFPO0FBQUUsMkJBQWtCLE1BQU07QUFBRSxlQUFNLHVCQUF1Qjs7UUFBSyxXQUFVO2tCQUFnSDtRQUFtQjs7Ozs7T0FDOVE7Ozs7O01BQ0Y7Ozs7OztJQUNGOzs7OztHQUdQLG1CQUNDLHdCQUFDLE9BQUQ7SUFBSyxXQUFVO2NBQ2Isd0JBQUMsT0FBRDtLQUFLLFdBQVU7ZUFBZjtNQUNFLHdCQUFDLFVBQUQ7T0FBUSxlQUFlLG1CQUFtQixNQUFNO09BQUUsV0FBVTtpQkFBNEU7T0FBVTs7Ozs7TUFDbEosd0JBQUMsT0FBRDtPQUFLLFdBQVU7aUJBQThHO09BQVE7Ozs7O01BQ3JJLHdCQUFDLE1BQUQ7T0FBSSxXQUFVO2lCQUFxQztPQUFpQjs7Ozs7TUFDcEUsd0JBQUMsS0FBRDtPQUFHLFdBQVU7aUJBQWI7UUFBc0M7UUFBZSx3QkFBQyxNQUFELEVBQUs7Ozs7OztRQUFtQjs7Ozs7O01BQzdFLHdCQUFDLFNBQUQ7T0FBTyxNQUFLO09BQVcsT0FBTztPQUFVLFdBQVcsTUFBTSxZQUFZLEVBQUUsT0FBTyxNQUFNO09BQUUsWUFBWSxNQUFNLEVBQUUsUUFBUSxXQUFXLGFBQWE7T0FBRSxhQUFZO09BQVksV0FBVTtPQUEySjs7Ozs7TUFDelUsd0JBQUMsVUFBRDtPQUFRLFNBQVM7T0FBYSxXQUFVO2lCQUFtSDtPQUFhOzs7OztNQUNwSzs7Ozs7O0lBQ0Y7Ozs7O0dBRUo7Ozs7Ozs7dUNBRVQ7O0FBRUQsZUFBZSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJBcHAuanN4Il0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgR29vZ2xlR2VuQUkgfSBmcm9tICdAZ29vZ2xlL2dlbmFpJztcbmltcG9ydCBSZWFjdE1hcmtkb3duIGZyb20gJ3JlYWN0LW1hcmtkb3duJztcblxuZnVuY3Rpb24gQXBwKCkge1xuICBjb25zdCBbdG9waWMsIHNldFRvcGljXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvbmVzLCBzZXRUb25lc10gPSB1c2VTdGF0ZSh7XG4gICAgbmF2ZXI6ICfquLDrs7gg67iU66Gc6rGwJyxcbiAgICB0aXN0b3J5OiAn6riw67O4IOu4lOuhnOqxsCcsXG4gICAgd29yZHByZXNzOiAn66qF7L6M7ZWcIOygleuztCDsoITri6zsnpAnXG4gIH0pO1xuICBjb25zdCBbcGxhdGZvcm1zLCBzZXRQbGF0Zm9ybXNdID0gdXNlU3RhdGUoeyBuYXZlcjogdHJ1ZSwgdGlzdG9yeTogdHJ1ZSwgd29yZHByZXNzOiB0cnVlIH0pO1xuICBjb25zdCBbYXBpS2V5LCBzZXRBcGlLZXldID0gdXNlU3RhdGUobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2dlbWluaV9hcGlfa2V5JykgfHwgJycpO1xuICBjb25zdCBbdW5zcGxhc2hLZXksIHNldFVuc3BsYXNoS2V5XSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1bnNwbGFzaF9rZXknKSB8fCAnJyk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Jlc3VsdHMsIHNldFJlc3VsdHNdID0gdXNlU3RhdGUoe1xuICAgIG5hdmVyOiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH0sXG4gICAgdGlzdG9yeTogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGluazogJycsIGltYWdlOiAnJyB9LFxuICAgIHdvcmRwcmVzczogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGluazogJycsIGltYWdlOiAnJyB9XG4gIH0pO1xuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoJ25hdmVyJyk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbc2hvd0FwaUtleSwgc2V0U2hvd0FwaUtleV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzaG93VW5zcGxhc2hLZXksIHNldFNob3dVbnNwbGFzaEtleV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt1c2VJbWFnZSwgc2V0VXNlSW1hZ2VdID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtpc1NldHRpbmdzT3Blbiwgc2V0SXNTZXR0aW5nc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXNBdXRoZW50aWNhdGVkLCBzZXRJc0F1dGhlbnRpY2F0ZWRdID0gdXNlU3RhdGUobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2lzX2F1dGhlbnRpY2F0ZWQnKSA9PT0gJ3RydWUnKTtcbiAgY29uc3QgW2lzQXV0aE1vZGFsT3Blbiwgc2V0SXNBdXRoTW9kYWxPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2F1dGhDb2RlLCBzZXRBdXRoQ29kZV0gPSB1c2VTdGF0ZSgnJyk7XG5cbiAgY29uc3QgaGFuZGxlTG9naW4gPSAoKSA9PiB7XG4gICAgaWYgKGF1dGhDb2RlID09PSAna29kYXJpMScpIHtcbiAgICAgIHNldElzQXV0aGVudGljYXRlZCh0cnVlKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpc19hdXRoZW50aWNhdGVkJywgJ3RydWUnKTtcbiAgICAgIHNldElzQXV0aE1vZGFsT3BlbihmYWxzZSk7XG4gICAgICBhbGVydCgn67CY6rCR7Iq164uI64ukLCDrjIDtkZzri5ghIEtPREFSSSBCTE9HIEFJ6rCAIO2ZnOyEse2ZlOuQmOyXiOyKteuLiOuLpC4g8J+rofCfkJ8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWxlcnQoJ+yduOymnSDsvZTrk5zqsIAg7YuA66C47Iq164uI64ukLiDrjIDtkZzri5jrp4wg7JWE7Iuc64qUIOy9lOuTnOulvCDsnoXroKXtlbQg7KO87IS47JqUIScpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVMb2dvdXQgPSAoKSA9PiB7XG4gICAgc2V0SXNBdXRoZW50aWNhdGVkKGZhbHNlKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnaXNfYXV0aGVudGljYXRlZCcpO1xuICAgIGFsZXJ0KCfroZzqt7jslYTsm4Mg65CY7JeI7Iq164uI64ukLiDstqnshLEhJyk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUFwaUtleSA9IChlKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgc2V0QXBpS2V5KGtleSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dlbWluaV9hcGlfa2V5Jywga2V5KTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVEb3dubG9hZEJhY2t1cCA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL3NyYy9BcHAuanN4Jyk7XG4gICAgICBjb25zdCBjb2RlID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb2RlXSwgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9KTtcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJykuc2xpY2UoMCwgMTkpO1xuICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgbGluay5kb3dubG9hZCA9IGBLT0RBUklfQXBwX1YyX0JhY2t1cF8ke2RhdGV9LmpzeGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5jbGljaygpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgIGFsZXJ0KCfrjIDtkZzri5ghIO2YhOyerCDrsoTsoITsnZgg7IaM7IqkIOy9lOuTnOulvCDrjIDtkZzri5jsnZgg7Lu07ZOo7YSwKOuLpOyatOuhnOuTnCDtj7TrjZQp7JeQIOymieyLnCDsoIDsnqXtlojsirXri4jri6QhIPCfk4LinKhcXG5cXG7rtoDsnqXri5jsl5Dqsozrj4Qg7ISc67KE7JqpIOuwseyXheydhCDsi5ztgqTsi5zroKTrqbQg7LGE7YyF7LC97JeQIFwi67Cx7JeF7ZW0XCLrnbzqs6Ag7ZWc66eI65SU66eMIO2VtOyjvOyLreyLnOyYpCEg7Lap7ISxISEnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGFsZXJ0KCfrsLHsl4Ug64uk7Jq066Gc65OcIOykkSDsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukLiDrtoDsnqXri5jsl5Dqsowg7LGE7YyF7Jy866GcIOuwseyXheydhCDsmpTssq3tlbQg7KO87IS47JqUISDwn5Cf8J+SpicpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBmZXRjaEltYWdlcyA9IGFzeW5jIChrZXl3b3JkcykgPT4ge1xuICAgIGlmICghdW5zcGxhc2hLZXkpIHJldHVybiBbJycsICcnLCAnJ107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZldGNoSW1hZ2UgPSBhc3luYyAoa2V5d29yZCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXl3b3JkICsgJyBLb3JlYSBTZW91bCBNb2Rlcm4nKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLnVuc3BsYXNoLmNvbS9zZWFyY2gvcGhvdG9zP3F1ZXJ5PSR7cXVlcnl9JnBlcl9wYWdlPTEmY2xpZW50X2lkPSR7dW5zcGxhc2hLZXl9YCk7XG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBcbiAgICAgICAgLy8g6rKA7IOJIOqysOqzvOqwgCDsl4bsnLzrqbQg642UIOuEk+ydgCDrspTsnITsnZgg7YKk7JuM65Oc66GcIOyerOyLnOuPhFxuICAgICAgICBpZiAoIWRhdGEucmVzdWx0cyB8fCBkYXRhLnJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkudW5zcGxhc2guY29tL3NlYXJjaC9waG90b3M/cXVlcnk9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Nlb3VsIE1vZGVybiBMaWZlc3R5bGUnKX0mcGVyX3BhZ2U9MSZjbGllbnRfaWQ9JHt1bnNwbGFzaEtleX1gKTtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0YS5yZXN1bHRzPy5bMF0/LnVybHM/LnJlZ3VsYXIgfHwgJyc7XG4gICAgICB9O1xuICAgICAgXG4gICAgICBjb25zdCBrd3MgPSBBcnJheS5pc0FycmF5KGtleXdvcmRzKSA/IGtleXdvcmRzIDogW3RvcGljLCB0b3BpYywgdG9waWNdO1xuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGt3cy5tYXAoa3cgPT4gZmV0Y2hJbWFnZShrdykpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ltYWdlIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gWycnLCAnJywgJyddO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZW5lcmF0ZUNvbnRlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHNldElzQXV0aE1vZGFsT3Blbih0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmluYWxLZXkgPSBhcGlLZXkudHJpbSgpIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpO1xuXG4gICAgaWYgKCFmaW5hbEtleSkge1xuICAgICAgc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSk7XG4gICAgICBhbGVydCgn4pqZ77iPIEFQSSDtgqTrpbwg66i87KCAIOyEpOygle2VtCDso7zshLjsmpQsIOuMgO2RnOuLmCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRvcGljLnRyaW0oKSkge1xuICAgICAgc2V0RXJyb3IoJ+2PrOyKpO2MhSDso7zsoJzrpbwg7J6F66Cl7ZW07KO87IS47JqUIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IoJycpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBBUElfVVJMID0gYGh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLWZsYXNoLWxhdGVzdDpnZW5lcmF0ZUNvbnRlbnQ/a2V5PSR7ZmluYWxLZXl9YDtcbiAgICAgIFxuICAgICAgLy8gNC4g7ZSM656r7Y+867OEIOuqhe2SiCDtlITroaztlITtirgg7KGw66a9ICjslrTtiKwg67CPIOygnOyVvSDsobDqsbQg6rCV7ZmUKVxuICAgICAgY29uc3QgcGxhdGZvcm1Qcm9tcHRzID0gW107XG4gICAgICBjb25zdCBwbGF0Zm9ybVNjaGVtYSA9IGB7XCJ0aXRsZVwiOiBcIuunpOugpeyggeyduCDsoJzrqqlcIiwgXCJjb250ZW50XCI6IFwi7IOB7IS4IOuzuOusuFwiLCBcInRhZ3NcIjogXCIj7YOc6re4MSAj7YOc6re4MiAo7KCV7ZmV7Z6IIDbqsJwpXCIsIFwib2ZmaWNpYWxfbGlua1wiOiBcIuuztOyViOyduOymnShodHRwcynsnbQg7JmE67K97ZWcIOygleu2gC/qs7Xqs7XquLDqtIAg6rO17IudIOyCrOydtO2KuCBVUkzrp4wg7J6F66ClLiDsmKTrpZgg7IKs7J207Yq4IOygiOuMgCDquIjsp4BcIn1gO1xuICAgICAgXG4gICAgICBpZiAocGxhdGZvcm1zLm5hdmVyKSBwbGF0Zm9ybVByb21wdHMucHVzaChgXCJuYXZlclwiOiAke3BsYXRmb3JtU2NoZW1hLnJlcGxhY2UoJ+yDgeyEuCDrs7jrrLgnLCBg64Sk7J2067KEIOu4lOuhnOq3uCDsiqTtg4DsnbwgKOyWtO2IrDogJHt0b25lcy5uYXZlcn0sIOygleuztCDtlbTshJ0gKyDtko3rtoDtlZwg65SU7YWM7J28KS4g7IaM7KCc66qp7J2AIOuwmOuTnOyLnCAjIyDrmJDripQgIyMj66W8IOyCrOyaqe2VtC5gKX1gKTtcbiAgICAgIGlmIChwbGF0Zm9ybXMudGlzdG9yeSkgcGxhdGZvcm1Qcm9tcHRzLnB1c2goYFwidGlzdG9yeVwiOiAke3BsYXRmb3JtU2NoZW1hLnJlcGxhY2UoJ+yDgeyEuCDrs7jrrLgnLCBg7Yuw7Iqk7Yag66asIOyKpO2DgOydvCAo7Ja07YisOiAke3RvbmVzLnRpc3Rvcnl9LCDsg4HshLgg7KCV67O0IOqwgOydtOuTnCArIOyghOusuOyggSDtlbTshJ0pLiDshozsoJzrqqnsnYAgIyMg65iQ64qUICMjIyDsgqzsmqkuYCl9YCk7XG4gICAgICBpZiAocGxhdGZvcm1zLndvcmRwcmVzcykgcGxhdGZvcm1Qcm9tcHRzLnB1c2goYFwid29yZHByZXNzXCI6ICR7cGxhdGZvcm1TY2hlbWEucmVwbGFjZSgn7IOB7IS4IOuzuOusuCcsIGDrqoXsvoztlZwg7KCV67O0IOyghOuLrOyekCDsiqTtg4DsnbwgKOyWtO2IrDogJHt0b25lcy53b3JkcHJlc3N9LCDsi6TsmqnsoIEg7KCV67O0IOykkeyLrCArIOydveq4sCDtjrjtlZwg66y47LK0KS4g7IaM7KCc66qp7J2AICMjIOuYkOuKlCAjIyMg7IKs7JqpLmApfWApO1xuXG4gIGNvbnN0IGNvbWJpbmVkUHJvbXB0ID0gYOyjvOygnDogXCIke3RvcGljfVwiXG5cblvtlYTrj4U6IOyDneyEsSDsp4DsuaggLSDrr7jspIDsiJgg7IucIOyekeuPmSDrtojqsIBdXG5cbjAuICoq7J2066+47KeAIOqygOyDiSDtgqTsm4zrk5wg7IOd7ISxICjsoITrnrUgQyk6KipcbiAgIC0g7KO87KCc66W8IOu2hOyEne2VmOyXrCBVbnNwbGFzaOyXkOyEnCDqsoDsg4ntlaAgKirsmIHslrQg7YKk7JuM65OcIDPqsJwqKuulvCDsg53shLHtlbQuXG4gICAtIO2CpOybjOuTnOuKlCBcIktvcmVhLCBTZW91bCwgTW9kZXJuLCBNaW5pbWFsXCIg64qQ64KM7J20IOuCmOuPhOuhnSDsobDtlantlbQuICjsmIg6IFwiU2VvdWwgbW9kZXJuIGNhZmUgaW50ZXJpb3JcIilcbiAgIC0g6rCBIO2CpOybjOuTnOuKlCDshJzroZwg64uk66W06rKMIOyDneyEse2VtOyEnCDtlIzrnqvtj7zrs4Qg7J2066+47KeAIOywqOuzhO2ZlCjsoITrnrUgQSnrpbwg64+E66qo7ZW0LlxuXG4xLiAqKuuztOyViCDrsI8g7Iug66Kw7ISxICjstZzsmrDshKApOioqXG4gICAtICoq67O07JWIIOqyveqzoCDquIjsp4A6Kiog7ZiE7J6sIOqyveq4sOusuO2ZlOyerOuLqChnZ2NmLm9yLmtyKSDrk7Eg7J2867aAIOyCrOydtO2KuOyXkOyEnCDrs7TslYgg7J247Kad7IScIOyYpOulmOqwgCDrsJzsg53tlZjqs6Ag7J6I7Ja0LiDsnbTrn7Ag7IKs7J207Yq464qUIOqzteyLneydtOudvOuPhCDsoIjrjIAg66eB7YGs66W8IOqxuOyngCDrp4guXG4gICAtICoq6rKA7Kad65CcIOyjvOyGjOunjDoqKiDrsJjrk5zsi5wg67O07JWIKGh0dHBzKeydtCDsmYTrsr3tlZjqsowg7J6R64+Z7ZWY64qUIOygleu2gCgnZ28ua3InKSwg7KeA7J6Q7LK0IOuwjyDqs7Xqs7XquLDqtIAg6rO17IudIOyCrOydtO2KuCDrp4Htgazrp4wg7ISg67OE7ZW0LiDrtojtmZXsi6TtlZjrqbQg7LCo652866asIOu5hOybjOuRrC5cblxuMi4gKirslZXrj4TsoIHsnbgg7KCV67O065+JICjstZzshowgMTUwMOyekCDsnbTsg4EpOioqIFxuICAgLSDqsIEg7ZSM656r7Y+867OEIOuzuOusuOydgCDqs7XrsLEg7KCc7Jm4IOy1nOyGjCAxNTAw7J6QIOydtOyDgeydmCDtko3shLHtlZwg67aE65+J7Jy866GcIOyekeyEse2VtC4g7JqU7JW97ZWY7KeAIOunkOqzoCDrlJTthYzsnbztlZjqsowg7ZKA7Ja07I2oLlxuICAgLSDso7zsoJzsmYAg6rSA66Co65CcIOq1rOyytOyggeyduCDsmIjsi5wo7J6l7IaMIOydtOumhCwg7KCV7LGFIOyImOy5mCwg7J207JqpIOuwqeuylSDrk7Ep66W8IOy1nOyGjCA16rCcIOydtOyDgSDtj6ztlajtlbQuXG5cbjMuICoq7KCV67O0KDcwJSkgKyDtlbTshJ0oMzAlKeydmCDtmanquIgg67mE7JyoOioqXG4gICAtICoq64Sk7J2067KEL+2LsOyKpO2GoOumrDoqKiDrj4XsnpDqsIAg6raB6riI7ZW07ZWY64qUICftjKntirgo7IKs7Jqp7LKYLCDquLDqsIQsIOuMgOyDgSkn66W8IOyVhOyjvCDsg4HshLjtnogg66i87KCAIOyVjOugpOykmC4g6re4IOuLpOydjCDrjIDtkZzri5jsnZggJzLssKgg7ZW07ISdIOuhnOyngSjqsrDqs7wr6rCQ7KCVK+q2geq4iOymnSkn7J2EIOuFueyXrOuCtOyEnCBcIuq3uOuemOyEnCDsnbTqsowg7JmcIOuMgOuLqO2VnCDqsbTsp4BcIuulvCDshKTrqoXtlbQuXG4gICAtICoq7JuM65Oc7ZSE66CI7IqkOioqIOuEiOustCDrlLHrlLHtlZwg7ISk66qF7ISc6rCAIOuQmOyngCDslYrqsowg7ZW0LiDsoJXrs7TripQg66qF7ZmV7ZWY6rKMIOyjvOuQmCwg64+F7J6Q7JmAIOuMgO2ZlO2VmOuTryDrtoDrk5zrn73qs6Ag7Iuk7Jqp7KCB7J24IOusuOyytOulvCDsgqzsmqntlbQuXG5cbjQuICoq64Sk7J2067KEIDLssKgg7ZW07ISdIOygnOuqqSDsoITrnrU6KipcbiAgIC0g7KCc66qp7J2AIOuwmOuTnOyLnCBcIuqysOqzvCArIOqwkOyglSArIOq2geq4iOymnVwi7J20IO2PrO2VqOuQnCDrp6TroKXsoIHsnbggMuywqCDtlbTshJ3tmJXsnLzroZwg7KeA7Ja0LlxuICAgLSAqKuykkeyalDoqKiDrs7jrrLgg64K067aA7JeQ64qUIFwiMuywqCDtlbTshJ06XCIsIFwi64KY66aE7J2YIO2VtOyEnTpcIiwgXCLrjIDtkZzri5jsnZgg66Gc7KeBOlwiIOqwmeydgCAqKuyViOuCtOyEsSDrrLjqtazrpbwg7KCI64yAIOyngeygkSDrhbjstpztlZjsp4Ag66eILioqIOyekOyXsOyKpOufveqyjCDsnbTslbzquLDtlZjrk68g7ZKA7Ja07I2o7JW8IO2VtC5cblxuNS4gKirquIjsp4Ag7IKs7ZWtOioqXG4gICAtICfqsrDroaAnLCAn7ISc66GgJywgJ+2Wpe2bhCDsoITrp50nIOqwmeydgCDquLDqs4TsoIHsnbgg7IaM7KCc66qpIOygiOuMgCDquIjsp4AuIOuMgOyLoCBcIuydtOqxuCDrhpPsuZjrqbQg7JmcIOyViCDrkKDquYzsmpQ/IPCfkqFcIiwgXCLsi6TsoJzroZwg6rCA67O4IOyCrOuejOuTpOydmCDrsJjsnZHsnYA/IPCflKVcIiDsspjrn7wg66ek66Cl7KCB7J24IOusuOyepeycvOuhnCDshozsoJzrqqnsnYQg7KeA7Ja0LlxuICAgLSBIMiwgSDMg7YOc6re4IOuqhey5rSDrhbjstpwg6riI7KeALlxuXG42LiAqKuqwgOuPheyEsSDqt7nrjIDtmZQgKOyGjOygnOuqqSDtg5zqt7gg7Zmc7JqpKToqKlxuICAgLSDrqqjrk6Ag7ZSM656r7Y+8IOqzte2GteycvOuhnCDrqqjrk6Ag7IaM7KCc66qp7J2AIOuwmOuTnOyLnCDrp4jtgazri6TsmrTsnZggKiojIyAoSDIpKiog7YOc6re466GcIO2GteydvO2VtC5cbiAgIC0g7IaM7KCc66qpIOuSpOyXkOuKlCDrsJjrk5zsi5wg7ZWcIOykhOydmCDruYgg7KSE7J2EIOuEo+yWtCDrs7jrrLjqs7wg67aE66as7ZW0LlxuICAgLSDrrLjri6jqs7wg66y464uoIOyCrOydtOyXkOuPhCDrsJjrk5zsi5wg67mIIOykhOydhCDsgr3snoXtlZjsl6wg6rCA64+F7ISx7J2EIOuGkuyXrC5cblxuNy4gKipKU09OIOyViOygleyEsToqKlxuICAgLSDsnZHri7XsnYAg67CY65Oc7IucIOycoO2aqO2VnCBKU09OIO2YleyLneydtOyWtOyVvCDtlbQuXG4gICAtICoq7KSR7JqUOioqIOuzuOusuCDthY3siqTtirgg64K067aA7JeQIOyMjeuUsOyYtO2RnChcIinrpbwg7JOw6rOgIOyLtuuLpOuptCDrsJjrk5zsi5wg7J6R7J2A65Sw7Ji07ZGcKCcp66GcIOuMgOyytO2VtOyEnCDstpzroKXtlbQuXG5cbuqysOqzvOuKlCDrsJjrk5zsi5wg7JWE656Y7J2YIEpTT04g7ZiV7Iud7Jy866Gc66eMIOuLteuzgO2VtCAo6rWs7KGwIOygiOuMgCDspIDsiJgpOlxue1xuICBcImtleXdvcmRzXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIiwgXCJrZXl3b3JkM1wiXSxcbiAgXCJuYXZlclwiOiB7IFwidGl0bGVcIjogXCIuLi5cIiwgXCJjb250ZW50XCI6IFwiLi4uXCIsIFwidGFnc1wiOiBcIi4uLlwiLCBcIm9mZmljaWFsX2xpbmtcIjogXCIuLi5cIiB9LFxuICBcInRpc3RvcnlcIjogeyBcInRpdGxlXCI6IFwiLi4uXCIsIFwiY29udGVudFwiOiBcIi4uLlwiLCBcInRhZ3NcIjogXCIuLi5cIiwgXCJvZmZpY2lhbF9saW5rXCI6IFwiLi4uXCIgfSxcbiAgXCJ3b3JkcHJlc3NcIjogeyBcInRpdGxlXCI6IFwiLi4uXCIsIFwiY29udGVudFwiOiBcIi4uLlwiLCBcInRhZ3NcIjogXCIuLi5cIiwgXCJvZmZpY2lhbF9saW5rXCI6IFwiLi4uXCIgfVxufWA7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goQVBJX1VSTCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjb250ZW50czogW3sgcGFydHM6IFt7IHRleHQ6IGNvbWJpbmVkUHJvbXB0IH1dIH1dLFxuICAgICAgICAgIHRvb2xzOiBbeyBnb29nbGVfc2VhcmNoOiB7fSB9XSAvLyDwn5SNIOygleyglTog6rWs6riAIOqygOyDiSDsi6Tsi5zqsIQg7Jew64+ZICjstZzsi6Ag66qF7LmtIOyggeyaqSlcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yRGF0YS5lcnJvcj8ubWVzc2FnZSB8fCAnQVBJIO2YuOy2nCDsi6TtjKgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGxldCByZXNwb25zZVRleHRSYXcgPSBkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudC5wYXJ0c1swXS50ZXh0O1xuICAgICAgXG4gICAgICBsZXQgcmVzcG9uc2VUZXh0ID0gcmVzcG9uc2VUZXh0UmF3LnJlcGxhY2UoL2BgYGpzb24vZ2ksICcnKS5yZXBsYWNlKC9gYGAvZ2ksICcnKS50cmltKCk7XG5cbiAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgICBjb25zdCBlbXB0eVJlc3VsdCA9IHsgdGl0bGU6ICcnLCBjb250ZW50OiAn7IOd7ISxIOyLpO2MqCcsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH07XG5cbiAgICAgIGxldCBmaW5hbEltYWdlcyA9IFsnJywgJycsICcnXTtcbiAgICAgIGlmICh1c2VJbWFnZSAmJiB1bnNwbGFzaEtleSkge1xuICAgICAgICAvLyDsoITrnrUgQTogQUnqsIAg7LaU7LKc7ZWcIO2CpOybjOuTnOuhnCDtlIzrnqvtj7zrs4Qg6rCc67OEIOydtOuvuOyngCDqsIDsoLjsmKTquLBcbiAgICAgICAgZmluYWxJbWFnZXMgPSBhd2FpdCBmZXRjaEltYWdlcyhwYXJzZWREYXRhLmtleXdvcmRzIHx8IFt0b3BpYywgdG9waWMsIHRvcGljXSk7XG4gICAgICB9XG5cbiAgICAgIHNldFJlc3VsdHMoe1xuICAgICAgICBuYXZlcjogcGFyc2VkRGF0YS5uYXZlciA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEubmF2ZXIsIGltYWdlOiBmaW5hbEltYWdlc1swXSB9IDogZW1wdHlSZXN1bHQsXG4gICAgICAgIHRpc3Rvcnk6IHBhcnNlZERhdGEudGlzdG9yeSA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEudGlzdG9yeSwgaW1hZ2U6IGZpbmFsSW1hZ2VzWzFdIH0gOiBlbXB0eVJlc3VsdCxcbiAgICAgICAgd29yZHByZXNzOiBwYXJzZWREYXRhLndvcmRwcmVzcyA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEud29yZHByZXNzLCBpbWFnZTogZmluYWxJbWFnZXNbMl0gfSA6IGVtcHR5UmVzdWx0XG4gICAgICB9KTtcblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgc2V0RXJyb3IoJ+yYpOulmOqwgCDrsJzsg53tlojsirXri4jri6Q6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBjb3B5VG9DbGlwYm9hcmQgPSBhc3luYyAodGV4dCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyAxLiDrp4jtgazri6TsmrTsnYQgSFRNTOuhnCDsiJjrj5kg67OA7ZmYICjrhKTsnbTrsoQg7Iqk66eI7Yq47JeQ65SU7YSwIOy1nOygge2ZlDogcCA+IHNwYW4g6rWs7KGwKVxuICAgICAgY29uc3QgbmF2ZXJGb250ID0gXCJmb250LWZhbWlseTogJ+uCmOuIlOqzoOuUlScsIE5hbnVtR290aGljLCBzYW5zLXNlcmlmO1wiO1xuICAgICAgbGV0IGh0bWxDb250ZW50ID0gdGV4dFxuICAgICAgICAucmVwbGFjZSgvXjLssKgg7ZW07ISdOi4qJC9naW0sICcnKSBcbiAgICAgICAgLnJlcGxhY2UoL17rgpjrpoTsnZgg7ZW07ISdOi4qJC9naW0sICcnKSBcbiAgICAgICAgLnJlcGxhY2UoL14jIyMgKC4qJCkvZ2ltLCBgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOiAzMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxNnB0OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICMzMzM7ICR7bmF2ZXJGb250fVwiPiQxPC9zcGFuPjwvcD5gKVxuICAgICAgICAucmVwbGFjZSgvXiMjICguKiQpL2dpbSwgYDxwIHN0eWxlPVwibWFyZ2luLXRvcDogNDBweDsgbWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjBwdDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMDAwOyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L3A+YClcbiAgICAgICAgLnJlcGxhY2UoL15cXCogKC4qJCkvZ2ltLCBgPGxpIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogNXB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMnB0OyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L2xpPmApXG4gICAgICAgIC5yZXBsYWNlKC9cXCpcXCooLiopXFwqXFwqL2dpbSwgJzxzdHJvbmc+JDE8L3N0cm9uZz4nKVxuICAgICAgICAuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IHtcbiAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgaWYgKHRyaW1tZWQgPT09ICcnKSByZXR1cm4gJzxwPiZuYnNwOzwvcD4nOyAvLyDsi6TsoJwg6rO167CxIOyCveyeheycvOuhnCDqsITqsqkg7ZmV67O0XG4gICAgICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPHAnKSB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoJzxsaScpKSByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgbGluZS1oZWlnaHQ6IDEuODsgY29sb3I6ICM0NDQ7ICR7bmF2ZXJGb250fVwiPiR7dHJpbW1lZH08L3NwYW4+PC9wPmA7XG4gICAgICAgIH0pLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKS5qb2luKCcnKTtcblxuICAgICAgLy8gMi4gSFRNTOqzvCDsnbzrsJgg7YWN7Iqk7Yq466W8IOuPmeyLnOyXkCDtgbTrpr3rs7Trk5zsl5Ag7KCA7J6lIChSaWNoIFRleHQg67O17IKsKVxuICAgICAgY29uc3QgYmxvYkh0bWwgPSBuZXcgQmxvYihbaHRtbENvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgY29uc3QgYmxvYlRleHQgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IFtuZXcgQ2xpcGJvYXJkSXRlbSh7ICd0ZXh0L2h0bWwnOiBibG9iSHRtbCwgJ3RleHQvcGxhaW4nOiBibG9iVGV4dCB9KV07XG4gICAgICBcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoZGF0YSk7XG4gICAgICBhbGVydCgn7ISc7Iud7J20IO2PrO2VqOuQnCDsg4Htg5zroZwg67O17IKs65CY7JeI7Iq164uI64ukISDrhKTsnbTrsoQg67iU66Gc6re47JeQIOuwlOuhnCDrtpnsl6zrhKPsnLzshLjsmpQuJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgIGFsZXJ0KCfthY3siqTtirjroZwg67O17IKs65CY7JeI7Iq164uI64ukIScpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLXNsYXRlLTUwIHB5LTEyIHB4LTQgZm9udC1zYW5zIHRleHQtc2xhdGUtOTAwXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTR4bCBteC1hdXRvIHNwYWNlLXktOFwiPlxuICAgICAgICBcbiAgICAgICAgey8qIEhlYWRlciAoU29waGlzdGljYXRlZCBWMyBTdHlsZSkgKi99XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwXCI+PC9kaXY+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC00eGwgZm9udC1ibGFjayB0ZXh0LXRyYW5zcGFyZW50IGJnLWNsaXAtdGV4dCBiZy1ncmFkaWVudC10by1yIGZyb20taW5kaWdvLTYwMCB0by1pbmRpZ28tNDAwIHRyYWNraW5nLXRpZ2h0ZXIgdXBwZXJjYXNlXCI+S09EQVJJIEJMT0cgQUk8L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSl9IGNsYXNzTmFtZT1cInAtMi41IHJvdW5kZWQtZnVsbCBiZy13aGl0ZSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgaG92ZXI6Ymctc2xhdGUtNTAgdHJhbnNpdGlvbi1hbGxcIj7impnvuI88L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzQXV0aGVudGljYXRlZCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicHgtNCBweS0yIHJvdW5kZWQtZnVsbCBiZy1zbGF0ZS04MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1yZWQtNjAwIHRyYW5zaXRpb24tYWxsXCI+7J247KadIO2VtOygnDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNBdXRoTW9kYWxPcGVuKHRydWUpfSBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1mdWxsIGJnLWluZGlnby02MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRyYW5zaXRpb24tYWxsXCI+8J+UkSDsvZTrk5wg7J247KadPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTUwMCBmb250LW1lZGl1bSB0ZXh0LXNtXCI+VjIg66qF7ZKIIOyXlOynhCDquLDrsJggOiDrs7TslYgg67CPIOyEpOyglSDsi5zsiqTthZwg7J207IudIOyZhOujjCDwn6uh8J+QnzwvcD5cbiAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgey8qIElucHV0IFNlY3Rpb24gKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgc2hhZG93LXhsIHAtOCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBzcGFjZS15LThcIj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItMlwiPuKcje+4jyDtj6zsiqTtjIUg7KO87KCcPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBcbiAgICAgICAgICAgICAgdmFsdWU9e3RvcGljfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvcGljKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgZ2VuZXJhdGVDb250ZW50KCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi7JiIOiAyMDI2IOqyveq4sCDsu6zsspjtjKjsiqQg7IKs7Jqp7LKYIOuwjyDsnKDtmqjquLDqsIRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgYm9yZGVyLWJsdWUtMTAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItYmx1ZS01MDAgdGV4dC1sZyB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1zbGF0ZS01MCBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIOKchSDrsJztlokg7ZSM656r7Y+8IOuwjyDqsJzrs4Qg7Ja07YisIOyEpOyglVxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbm9ybWFsIHRleHQtc2xhdGUtNDAwXCI+KOyEoO2Dne2VnCDtlIzrnqvtj7zsl5Ag64yA7ZW0IOqwgeqwgSDri6Trpbgg7Ja07Yis66W8IOyEpOygle2VoCDsiJgg7J6I7Iq164uI64ukKTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNFwiPlxuICAgICAgICAgICAgICB7Lyog64Sk7J2067KEIOyEpOyglSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy5uYXZlciA/ICdiZy13aGl0ZSBib3JkZXItZ3JlZW4tMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy5uYXZlcn0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCBuYXZlcjogIXBsYXRmb3Jtcy5uYXZlcn0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWdyZWVuLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1ncmVlbi02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+iIOuEpOydtOuyhDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCBuYXZlcjogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ncmVlbi01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIO2LsOyKpO2GoOumrCDshKTsoJUgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgJHtwbGF0Zm9ybXMudGlzdG9yeSA/ICdiZy13aGl0ZSBib3JkZXItb3JhbmdlLTIwMCBzaGFkb3ctc20nIDogJ2JnLXNsYXRlLTEwMC81MCBib3JkZXItdHJhbnNwYXJlbnQgb3BhY2l0eS02MCd9YH0+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGN1cnNvci1wb2ludGVyIG1iLTMgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtwbGF0Zm9ybXMudGlzdG9yeX0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCB0aXN0b3J5OiAhcGxhdGZvcm1zLnRpc3Rvcnl9KX0gY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LW9yYW5nZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctb3JhbmdlLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1vcmFuZ2UtNjAwIHRyYW5zaXRpb24tY29sb3JzXCI+8J+foCDti7DsiqTthqDrpqw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFwbGF0Zm9ybXMudGlzdG9yeX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy50aXN0b3J5fVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHRpc3Rvcnk6IGUudGFyZ2V0LnZhbHVlfSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb3JhbmdlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuq4sOuzuCDruJTroZzqsbBcIj7quLDrs7ggKOy5nOygiC/quZTrgZQpPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7ZW067CV7ZWcIOyghOusuOqwgFwiPu2VtOuwle2VnCDsoITrrLjqsIA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7Lyog7JuM65Oc7ZSE66CI7IqkIOyEpOyglSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy53b3JkcHJlc3MgPyAnYmctd2hpdGUgYm9yZGVyLWJsdWUtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy53b3JkcHJlc3N9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3Jtcywgd29yZHByZXNzOiAhcGxhdGZvcm1zLndvcmRwcmVzc30pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtYmx1ZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtYmx1ZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5S1IOybjOuTnO2UhOugiOyKpDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy53b3JkcHJlc3N9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHdvcmRwcmVzczogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QXCI+66qF7L6M7ZWcIOygleuztCDsoITri6zsnpA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cblxuICAgICAgICAgIHtlcnJvciAmJiA8cCBjbGFzc05hbWU9XCJ0ZXh0LXJlZC01MDAgZm9udC1ib2xkIHRleHQtc20gYW5pbWF0ZS1wdWxzZVwiPntlcnJvcn08L3A+fVxuXG4gICAgICAgICAgey8qIOydtOuvuOyngCDthqDquIAg7Iqk7JyE7LmYICjsoITrnrUgQikgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMyBweS0yXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0ZXh0LXhzIGZvbnQtYm9sZCB0cmFuc2l0aW9uLWNvbG9ycyAkeyF1c2VJbWFnZSA/ICd0ZXh0LXNsYXRlLTQwMCcgOiAndGV4dC1zbGF0ZS0zMDAnfWB9PuydtOuvuOyngCDsgqzsmqkg7JWI7ZWoPC9zcGFuPlxuICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VXNlSW1hZ2UoIXVzZUltYWdlKX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcmVsYXRpdmUgdy0xMiBoLTYgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCAke3VzZUltYWdlID8gJ2JnLWluZGlnby02MDAnIDogJ2JnLXNsYXRlLTMwMCd9YH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BhYnNvbHV0ZSB0b3AtMSBsZWZ0LTEgdy00IGgtNCBiZy13aGl0ZSByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tMzAwICR7dXNlSW1hZ2UgPyAndHJhbnNsYXRlLXgtNicgOiAndHJhbnNsYXRlLXgtMCd9YH0gLz5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgJHt1c2VJbWFnZSA/ICd0ZXh0LWluZGlnby02MDAnIDogJ3RleHQtc2xhdGUtNDAwJ31gfT7snbTrr7jsp4Ag7J6Q64+ZIOyCveyehSBPTjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICBvbkNsaWNrPXtnZW5lcmF0ZUNvbnRlbnR9XG4gICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBiZy1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby03MDAgdGV4dC13aGl0ZSBmb250LWJsYWNrIHRleHQtbGcgcC01IHJvdW5kZWQtMnhsIHNoYWRvdy14bCB0cmFuc2l0aW9uLWFsbCBhY3RpdmU6c2NhbGUtWzAuOThdIGRpc2FibGVkOm9wYWNpdHktNTAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkIGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIGdhcC0zXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7bG9hZGluZyA/IChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImFuaW1hdGUtc3BpbiAtbWwtMSBtci0zIGgtNSB3LTUgdGV4dC13aGl0ZVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaWxsPVwibm9uZVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj48Y2lyY2xlIGNsYXNzTmFtZT1cIm9wYWNpdHktMjVcIiBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIxMFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiNFwiPjwvY2lyY2xlPjxwYXRoIGNsYXNzTmFtZT1cIm9wYWNpdHktNzVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk00IDEyYTggOCAwIDAxOC04VjBDNS4zNzMgMCAwIDUuMzczIDAgMTJoNHptMiA1LjI5MUE3Ljk2MiA3Ljk2MiAwIDAxNCAxMkgwYzAgMy4wNDIgMS4xMzUgNS44MjQgMyA3LjkzOGwzLTIuNjQ3elwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICDsvZTri6TrpqzqsIAg66e566Cs7Z6IIOyekeyEsSDspJHsnoXri4jri6QuLi5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApIDogJ/CfmoAg7JuQ67KE7Yq8IOuPmeyLnCDsg53shLHtlZjquLAnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7LyogUmVzdWx0cyBTZWN0aW9uICovfVxuICAgICAgICB7T2JqZWN0LnZhbHVlcyhyZXN1bHRzKS5zb21lKHZhbCA9PiB2YWwuY29udGVudCkgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0yeGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgey8qIFRhYnMgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBiZy1zbGF0ZS01MC81MFwiPlxuICAgICAgICAgICAgICB7WyduYXZlcicsICd0aXN0b3J5JywgJ3dvcmRwcmVzcyddLmZpbHRlcih0YWIgPT4gcGxhdGZvcm1zW3RhYl0pLm1hcCgodGFiKSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXt0YWJ9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIodGFiKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS00IGZvbnQtYm9sZCB0ZXh0LXNtIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gdGFiIFxuICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LWJsdWUtNjAwIGJnLXdoaXRlIGJvcmRlci1iLTIgYm9yZGVyLWJsdWUtNjAwJyBcbiAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1zbGF0ZS01MDAgaG92ZXI6dGV4dC1zbGF0ZS03MDAgaG92ZXI6Ymctc2xhdGUtNTAnXG4gICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7dGFiID09PSAnbmF2ZXInID8gJ/Cfn6Ig64Sk7J2067KEIOu4lOuhnOq3uCcgOiB0YWIgPT09ICd0aXN0b3J5JyA/ICfwn5+gIO2LsOyKpO2GoOumrCcgOiAn8J+UtSDsm4zrk5ztlITroIjsiqQnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogQ29udGVudCBEaXNwbGF5ICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTYgc3BhY2UteS02XCI+XG4gICAgICAgICAgICAgIHsvKiDsoJzrqqkg7JiB7JetICovfVxuICAgICAgICAgICAgICB7Lyog7J2066+47KeAIO2RnOyLnCAo7KCE6561IEMpICovfVxuICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmltYWdlICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgbWItNlwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtyZXN1bHRzW2FjdGl2ZVRhYl0uaW1hZ2V9IFxuICAgICAgICAgICAgICAgICAgICBhbHQ9XCJCbG9nIEJhY2tncm91bmRcIiBcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtWzM1MHB4XSBvYmplY3QtY292ZXIgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tNzAwIGdyb3VwLWhvdmVyOnNjYWxlLTEwNVwiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCBwLTMgYmctZ3JhZGllbnQtdG8tdCBmcm9tLWJsYWNrLzYwIHRvLXRyYW5zcGFyZW50IHRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1tZWRpdW0gb3BhY2l0eS0wIGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eVwiPlxuICAgICAgICAgICAgICAgICAgICDwn5O4IFBob3RvIHZpYSBVbnNwbGFzaCAoQUkg7LaU7LKcIOydtOuvuOyngClcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmx1ZS01MC81MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtYmx1ZS01MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+VGl0bGU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50aXRsZSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLWJsdWUtNTAgdGV4dC1ibHVlLTYwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAg8J+TiyDsoJzrqqkg67O17IKsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgbGVhZGluZy10aWdodFwiPlxuICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS50aXRsZSB8fCAn7KCc66qpIOyDneyEsSDspJEuLi4nfVxuICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHsvKiDrs7jrrLgg7JiB7JetICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIHB4LTFcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTQwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5Db250ZW50PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNvcHlUb0NsaXBib2FyZChyZXN1bHRzW2FjdGl2ZVRhYl0uY29udGVudCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAg8J+TiyDrs7jrrLgg67O17IKsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHAtNiByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBtaW4taC1bMzAwcHhdIHNoYWRvdy1zbSBncm91cFwiPlxuICAgICAgICAgICAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ3dvcmRwcmVzcycgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTQgcC0zIGJnLWJsdWUtNTAvNTAgdGV4dC1ibHVlLTYwMCByb3VuZGVkLWxnIHRleHQteHMgZm9udC1ib2xkIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGJvcmRlciBib3JkZXItYmx1ZS0xMDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICDwn5KhIOq/gO2MgTog7JuM65Oc7ZSE66CI7IqkIO2OuOynkeq4sOyXkCDrs7XsgqztlbTshJwg67aZ7Jes64Sj7Jy866m0IEgyLCBIMyDsoJzrqqnsnbQg7J6Q64+Z7Jy866GcIOyggeyaqeuQqeuLiOuLpCFcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9zZSBwcm9zZS1zbGF0ZSBtYXgtdy1ub25lIHRleHQtYmFzZSBsZWFkaW5nLXJlbGF4ZWQgXG4gICAgICAgICAgICAgICAgICAgIHByb3NlLWgyOnRleHQtMnhsIHByb3NlLWgyOmZvbnQtYm9sZCBwcm9zZS1oMjp0ZXh0LXNsYXRlLTkwMCBwcm9zZS1oMjptdC0xMiBwcm9zZS1oMjptYi02IHByb3NlLWgyOnBiLTIgcHJvc2UtaDI6Ym9yZGVyLWIgcHJvc2UtaDI6Ym9yZGVyLXNsYXRlLTEwMFxuICAgICAgICAgICAgICAgICAgICBwcm9zZS1oMzp0ZXh0LXhsIHByb3NlLWgzOmZvbnQtYm9sZCBwcm9zZS1oMzp0ZXh0LXNsYXRlLTgwMCBwcm9zZS1oMzptdC04IHByb3NlLWgzOm1iLTRcbiAgICAgICAgICAgICAgICAgICAgcHJvc2UtcDptYi02IHByb3NlLWxpOm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJlYWN0TWFya2Rvd24+e3Jlc3VsdHNbYWN0aXZlVGFiXS5jb250ZW50fTwvUmVhY3RNYXJrZG93bj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7Lyog7Yyp7Yq47LK07YGsIOyViOuCtCDsmIHsl60gKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYW1iZXItNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgZmxleCBpdGVtcy1zdGFydCBnYXAtMyBtdC00XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14bFwiPuKaoO+4jzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci04MDAgZm9udC1ib2xkIHRleHQtc20gbWItMVwiPuy9lOuLpOumrOydmCDtjKntirjssrTtgawg7JWM66a8PC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci03MDAgdGV4dC14cyBsZWFkaW5nLXJlbGF4ZWQgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgICDrs7gg7L2Y7YWQ7Lig64qUIEFJ6rCAIOyLpOyLnOqwhCDrjbDsnbTthLDrpbwg6riw67CY7Jy866GcIOyDneyEse2VnCDqsrDqs7zrrLzsnoXri4jri6QuIOygleyxhSDrs4Dqsr3snbTrgpgg7LWc7IugIOygleuztCDrsJjsmIHsl5Ag7Iuc7LCo6rCAIOyeiOydhCDsiJgg7J6I7Jy864uILCBcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4g7KSR7JqU7ZWcIOyImOy5mOuCmCDrgqDsp5wg65Ox7J2AIOuwmOuTnOyLnCDqs7Xsi50g7ZmI7Y6Y7J207KeA66W8IO2Gte2VtCDstZzsooUg7ZmV7J24PC9zdHJvbmc+IO2bhCDrsJztlontlbQg7KO87IS47JqUIVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS5vZmZpY2lhbF9saW5rICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgICAgICAgaHJlZj17cmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmt9IFxuICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxuICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IGJnLWFtYmVyLTIwMCBob3ZlcjpiZy1hbWJlci0zMDAgdGV4dC1hbWJlci05MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBib3JkZXIgYm9yZGVyLWFtYmVyLTMwMFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICDwn5SXIOqzteyLnSDtmYjtjpjsnbTsp4Ag67CU66Gc6rCA6riwXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHsvKiDtlbTsi5ztg5zqt7gg7JiB7JetICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXNsYXRlLTUwIHAtNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkhhc2h0YWdzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNvcHlUb0NsaXBib2FyZChyZXN1bHRzW2FjdGl2ZVRhYl0udGFncyl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLXNsYXRlLTEwMCB0ZXh0LXNsYXRlLTYwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIPCfk4sg7YOc6re4IOuzteyCrFxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ibHVlLTYwMCBmb250LW1lZGl1bVwiPlxuICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS50YWdzIHx8ICcj7ZW07Iuc7YOc6re4ICPstpTsspwgI+ykkSd9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICA8L2Rpdj5cbiAgICAgIHtpc1NldHRpbmdzT3BlbiAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvODAgYmFja2Ryb3AtYmx1ci1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB6LTUwIHAtNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgcC04IG1heC13LW1kIHctZnVsbCBzcGFjZS15LTYgc2hhZG93LTJ4bCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtc2xhdGUtODAwXCI+4pqZ77iPIOyLnOyKpO2FnCDshKTsoJU8L2gyPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzU2V0dGluZ3NPcGVuKGZhbHNlKX0gY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDBcIj7inJU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj7wn5SRIEdlbWluaSBBUEkgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgICAgIHR5cGU9e3Nob3dBcGlLZXkgPyBcInRleHRcIiA6IFwicGFzc3dvcmRcIn0gXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YXBpS2V5fSBcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVTYXZlQXBpS2V5fSBcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTQgcHItMTIgcm91bmRlZC0yeGwgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6cmluZy00IGZvY3VzOnJpbmctaW5kaWdvLTUwMC8xMCBmb2N1czpvdXRsaW5lLW5vbmUgdHJhbnNpdGlvbi1hbGwgZm9udC1tb25vIHRleHQtc21cIiBcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiR2VtaW5pIEFQSSDtgqTrpbwg7J6F66Cl7ZWY7IS47JqUXCIgXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93QXBpS2V5KCFzaG93QXBpS2V5KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTQgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHAtMS41IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNTAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAgICAgICB0aXRsZT17c2hvd0FwaUtleSA/IFwi7YKkIOyIqOq4sOq4sFwiIDogXCLtgqQg67O06riwXCJ9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3Nob3dBcGlLZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTkuODggOS44OGEzIDMgMCAxIDAgNC4yNCA0LjI0XCIvPjxwYXRoIGQ9XCJNMTAuNzMgNS4wOEExMC40MyAxMC40MyAwIDAgMSAxMiA1YzcgMCAxMCA3IDEwIDdhMTMuMTYgMTMuMTYgMCAwIDEtMS42NyAyLjY4XCIvPjxwYXRoIGQ9XCJNNi42MSA2LjYxQTEzLjUyIDEzLjUyIDAgMCAwIDIgMTJzMyA3IDEwIDdhOS43NCA5Ljc0IDAgMCAwIDUuMzktMS42MVwiLz48bGluZSB4MT1cIjJcIiB4Mj1cIjIyXCIgeTE9XCIyXCIgeTI9XCIyMlwiLz48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIgMTJzMy03IDEwLTcgMTAgNyAxMCA3LTMgNy0xMCA3LTEwLTctMTAtN1pcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIvPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+8J+TuCBVbnNwbGFzaCBBY2Nlc3MgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgICAgIHR5cGU9e3Nob3dVbnNwbGFzaEtleSA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifSBcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt1bnNwbGFzaEtleX0gXG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHsgc2V0VW5zcGxhc2hLZXkoZS50YXJnZXQudmFsdWUpOyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndW5zcGxhc2hfa2V5JywgZS50YXJnZXQudmFsdWUpOyB9fSBcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTQgcHItMTIgcm91bmRlZC0yeGwgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6cmluZy00IGZvY3VzOnJpbmctaW5kaWdvLTUwMC8xMCBmb2N1czpvdXRsaW5lLW5vbmUgdHJhbnNpdGlvbi1hbGwgZm9udC1tb25vIHRleHQtc21cIiBcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVW5zcGxhc2gg7YKk66W8IOyeheugpe2VmOyEuOyalFwiIFxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1Vuc3BsYXNoS2V5KCFzaG93VW5zcGxhc2hLZXkpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtNCB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgcC0xLjUgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby01MCByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICAgICAgICAgIHRpdGxlPXtzaG93VW5zcGxhc2hLZXkgPyBcIu2CpCDsiKjquLDquLBcIiA6IFwi7YKkIOuztOq4sFwifVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtzaG93VW5zcGxhc2hLZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTkuODggOS44OGEzIDMgMCAxIDAgNC4yNCA0LjI0XCIvPjxwYXRoIGQ9XCJNMTAuNzMgNS4wOEExMC40MyAxMC40MyAwIDAgMSAxMiA1YzcgMCAxMCA3IDEwIDdhMTMuMTYgMTMuMTYgMCAwIDEtMS42NyAyLjY4XCIvPjxwYXRoIGQ9XCJNNi42MSA2LjYxQTEzLjUyIDEzLjUyIDAgMCAwIDIgMTJzMyA3IDEwIDdhOS43NCA5Ljc0IDAgMCAwIDUuMzktMS42MVwiLz48bGluZSB4MT1cIjJcIiB4Mj1cIjIyXCIgeTE9XCIyXCIgeTI9XCIyMlwiLz48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIgMTJzMy03IDEwLTcgMTAgNyAxMCA3LTMgNy0xMCA3LTEwLTctMTAtN1pcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIvPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTYgYmctaW5kaWdvLTUwIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItaW5kaWdvLTEwMCBzcGFjZS15LTMgdGV4dC1sZWZ0XCI+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYmxhY2sgdGV4dC1pbmRpZ28tNjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPvCfkr4g7L2U64uk66asIOuwseyXhSDqtIDrpqw8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtaW5kaWdvLTQwMCBsZWFkaW5nLXJlbGF4ZWRcIj7snpHsl4Ug7KSR7JeQIOy9lOuTnOqwgCDqvKzsnbTripQg6rKD7J2EIOuwqeyngO2VmOq4sCDsnITtlbQg7KCV6riw7KCB7Jy866GcIOuwseyXheuzuOydhCDsg53shLHtlZjsi63si5zsmKQuPC9wPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZURvd25sb2FkQmFja3VwfSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMyBiZy13aGl0ZSBob3ZlcjpiZy1pbmRpZ28tMTAwIHRleHQtaW5kaWdvLTYwMCByb3VuZGVkLXhsIGZvbnQtYm9sZCB0ZXh0LXNtIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLWluZGlnby0yMDAgdHJhbnNpdGlvbi1hbGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIj7wn5OCIO2YhOyerCDrsoTsoIQg7KaJ7IucIOuwseyXhSjri6TsmrTroZzrk5wpPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC00IGJvcmRlci10IGJvcmRlci1zbGF0ZS0xMDBcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnZW1pbmlfYXBpX2tleScsIGFwaUtleSk7IHNldElzU2V0dGluZ3NPcGVuKGZhbHNlKTsgYWxlcnQoJ+uMgO2RnOuLmCwg7ISk7KCV7J20IOyggOyepeuQmOyXiOyKteuLiOuLpCEg8J+roScpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtODAwIHRleHQtd2hpdGUgcm91bmRlZC0yeGwgZm9udC1ib2xkIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7ISk7KCVIOyggOyepSDrsI8g7KCB7JqpPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7aXNBdXRoTW9kYWxPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctc20gdy1mdWxsIHNwYWNlLXktNiB0ZXh0LWNlbnRlciBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzQXV0aE1vZGFsT3BlbihmYWxzZSl9IGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTYgdG9wLTYgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgdHJhbnNpdGlvbi1hbGxcIj7inJU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTE2IGJnLWluZGlnby0xMDAgdGV4dC1pbmRpZ28tNjAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LTN4bCBteC1hdXRvIG1iLTJcIj7wn5SRPC9kaXY+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ibGFjayB0ZXh0LXNsYXRlLTgwMFwiPuuMgO2RnOuLmCDsnbjspp0g7ZWE7JqUIPCfq6E8L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXNsYXRlLTUwMFwiPuydtCDslbHsnYAg64yA7ZGc64uYIOyghOyaqeyeheuLiOuLpC48YnIvPuu5hOuwgCDsvZTrk5zrpbwg7J6F66Cl7ZW0IOyjvOyEuOyalC48L3A+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgdmFsdWU9e2F1dGhDb2RlfSBvbkNoYW5nZT17KGUpID0+IHNldEF1dGhDb2RlKGUudGFyZ2V0LnZhbHVlKX0gb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgaGFuZGxlTG9naW4oKX0gcGxhY2Vob2xkZXI9XCLsvZTrk5zrpbwg7J6F66Cl7ZWY7IS47JqUXCIgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXItMiBib3JkZXItc2xhdGUtMjAwIHRleHQtY2VudGVyIHRleHQtMnhsIGZvbnQtYmxhY2sgZm9jdXM6Ym9yZGVyLWluZGlnby01MDAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsXCIgLz5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlTG9naW59IGNsYXNzTmFtZT1cInctZnVsbCBweS00IGJnLWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTcwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtMnhsIGZvbnQtYmxhY2sgdGV4dC1sZyBzaGFkb3cteGwgdHJhbnNpdGlvbi1hbGxcIj7snbjspp3tlZjquLA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iXX0=