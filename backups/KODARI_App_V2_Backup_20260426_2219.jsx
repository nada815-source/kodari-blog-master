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
	const [toast, setToast] = useState("");
	const [showToast, setShowToast] = useState(false);
	// 🔔 자동 소멸형 명품 알림 (Toast) 로직
	const triggerToast = (msg) => {
		setToast(msg);
		setShowToast(true);
		setTimeout(() => {
			setShowToast(false);
		}, 2500);
	};
	const handleLogin = () => {
		if (authCode === "kodari1") {
			setIsAuthenticated(true);
			localStorage.setItem("is_authenticated", "true");
			setIsAuthModalOpen(false);
			triggerToast("반갑습니다, 대표님! KODARI BLOG AI가 활성화되었습니다. 🫡🐟");
		} else {
			triggerToast("인증 코드가 틀렸습니다. 대표님만 아시는 코드를 입력해 주세요!");
		}
	};
	const handleLogout = () => {
		setIsAuthenticated(false);
		localStorage.removeItem("is_authenticated");
		triggerToast("로그아웃 되었습니다. 충성!");
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
			const now = new Date();
			const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
			link.href = url;
			link.download = `KODARI_App_V2_Backup_${formattedDate}.jsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			triggerToast("대표님! 현재 버전의 소스 코드를 컴퓨터에 즉시 저장했습니다! 📂✨");
		} catch (err) {
			triggerToast("백업 다운로드 중 오류가 발생했습니다. 부장님에게 채팅으로 요청해 주세요! 🐟💦");
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
			triggerToast("⚙️ API 키를 먼저 설정해 주세요, 대표님!");
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
			const platformSchema = `{"title": "매력적인 제목", "content": "상세 본문", "tags": "#태그1 #태그2 (정확히 6개)", "official_link": "보안인증(https)이 완벽한 정부/공공기관 공식 사이트 URL만 입력. 오류 사이트 절대 금지"}`;
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
			const naverFont = "font-family: '나눔고딕', NanumGothic, sans-serif;";
			let htmlContent = text.replace(/^2차 해석:.*$/gim, "").replace(/^나름의 해석:.*$/gim, "").replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`).replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`).replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`).replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>").split("\n").map((line) => {
				const trimmed = line.trim();
				if (trimmed === "") return "<p>&nbsp;</p>";
				if (trimmed.startsWith("<p") || trimmed.startsWith("<li")) return trimmed;
				return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
			}).filter((line) => line !== "").join("");
			const blobHtml = new Blob([htmlContent], { type: "text/html" });
			const blobText = new Blob([text], { type: "text/plain" });
			const data = [new ClipboardItem({
				"text/html": blobHtml,
				"text/plain": blobText
			})];
			await navigator.clipboard.write(data);
			triggerToast("서식이 포함된 상태로 복사되었습니다! 📋✨");
		} catch (err) {
			navigator.clipboard.writeText(text);
			triggerToast("텍스트로 복사되었습니다! ✅");
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
									lineNumber: 259,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 260,
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
										lineNumber: 262,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 264,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 266,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 261,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 258,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 270,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 257,
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
									lineNumber: 276,
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
									lineNumber: 277,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 275,
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
										lineNumber: 290,
										columnNumber: 15
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 288,
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
													lineNumber: 314,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 315,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 313,
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
														lineNumber: 323,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 324,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 325,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 326,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 317,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 312,
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
													lineNumber: 332,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 333,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 331,
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
														lineNumber: 341,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 342,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 343,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 344,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 335,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 330,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 293,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 287,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 351,
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
										lineNumber: 354,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setUseImage(!useImage),
										className: `relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? "bg-indigo-600" : "bg-slate-300"}`,
										children: /* @__PURE__ */ _jsxDEV("div", { className: `absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? "translate-x-6" : "translate-x-0"}` }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 359,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 355,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${useImage ? "text-indigo-600" : "text-slate-400"}`,
										children: "이미지 자동 삽입 ON"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 361,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 353,
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
										lineNumber: 371,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 371,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 371,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 364,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 273,
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
								lineNumber: 382,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 380,
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
										lineNumber: 399,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
										children: "📸 Photo via Unsplash (AI 추천 이미지)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 404,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 398,
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
											lineNumber: 412,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].title),
											className: "px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1",
											children: "📋 제목 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 413,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 411,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("h2", {
										className: "text-xl font-bold text-slate-800 leading-tight",
										children: results[activeTab].title || "제목 생성 중..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 420,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 410,
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
											lineNumber: 427,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].content),
											className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 본문 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 428,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 426,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group",
										children: [activeTab === "wordpress" && /* @__PURE__ */ _jsxDEV("div", {
											className: "mb-4 p-3 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100",
											children: "💡 꿀팁: 워드프레스 편집기에 복사해서 붙여넣으면 H2, H3 제목이 자동으로 적용됩니다!"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 437,
											columnNumber: 21
										}, this), /* @__PURE__ */ _jsxDEV("div", {
											className: "prose prose-slate max-w-none text-base leading-relaxed \n                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100\n                    prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4\n                    prose-p:mb-6 prose-li:mb-2",
											children: /* @__PURE__ */ _jsxDEV(ReactMarkdown, { children: results[activeTab].content }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 445,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 441,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 435,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 425,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4",
									children: [/* @__PURE__ */ _jsxDEV("span", {
										className: "text-xl",
										children: "⚠️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 451,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 453,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-2",
												children: [
													"본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 정책 변경이나 최신 정보 반영에 시차가 있을 수 있으니,",
													/* @__PURE__ */ _jsxDEV("strong", { children: " 중요한 수치나 날짜 등은 반드시 공식 홈페이지를 통해 최종 확인" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 456,
														columnNumber: 21
													}, this),
													" 후 발행해 주세요!"
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 454,
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
												lineNumber: 459,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 452,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 450,
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
											lineNumber: 473,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 474,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 472,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그 #추천 #중"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 481,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 471,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 396,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 379,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 255,
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
								lineNumber: 494,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 495,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 493,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 499,
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
									lineNumber: 501,
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
												lineNumber: 515,
												columnNumber: 199
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 515,
												columnNumber: 241
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 515,
												columnNumber: 329
											}, this),
											/* @__PURE__ */ _jsxDEV("line", {
												x1: "2",
												x2: "22",
												y1: "2",
												y2: "22"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 515,
												columnNumber: 409
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 515,
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
											lineNumber: 517,
											columnNumber: 199
										}, this), /* @__PURE__ */ _jsxDEV("circle", {
											cx: "12",
											cy: "12",
											r: "3"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 517,
											columnNumber: 255
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 517,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 508,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 500,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 498,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "📸 Unsplash Access Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 524,
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
									lineNumber: 526,
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
												lineNumber: 540,
												columnNumber: 199
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 540,
												columnNumber: 241
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 540,
												columnNumber: 329
											}, this),
											/* @__PURE__ */ _jsxDEV("line", {
												x1: "2",
												x2: "22",
												y1: "2",
												y2: "22"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 540,
												columnNumber: 409
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 540,
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
											lineNumber: 542,
											columnNumber: 199
										}, this), /* @__PURE__ */ _jsxDEV("circle", {
											cx: "12",
											cy: "12",
											r: "3"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 542,
											columnNumber: 255
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 542,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 533,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 525,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 523,
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
									lineNumber: 549,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("p", {
									className: "text-xs text-indigo-400 leading-relaxed",
									children: "작업 중에 코드가 꼬이는 것을 방지하기 위해 정기적으로 백업본을 생성하십시오."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 550,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("button", {
									onClick: handleDownloadBackup,
									className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all flex items-center justify-center gap-2",
									children: "📂 현재 버전 즉시 백업(다운로드)"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 551,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 548,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "pt-4 border-t border-slate-100",
							children: /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => {
									localStorage.setItem("gemini_api_key", apiKey);
									setIsSettingsOpen(false);
									triggerToast("대표님, 설정이 저장되었습니다! 🫡");
								},
								className: "w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all",
								children: "설정 저장 및 적용"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 555,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 554,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 492,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 491,
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
							lineNumber: 564,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2",
							children: "🔑"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 565,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							className: "text-2xl font-black text-slate-800",
							children: "대표님 인증 필요 🫡"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 566,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							className: "text-sm text-slate-500",
							children: [
								"이 앱은 대표님 전용입니다.",
								/* @__PURE__ */ _jsxDEV("br", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 567,
									columnNumber: 66
								}, this),
								"비밀 코드를 입력해 주세요."
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 567,
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
							lineNumber: 568,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 569,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 563,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 562,
				columnNumber: 9
			}, this),
			showToast && /* @__PURE__ */ _jsxDEV("div", {
				style: {
					position: "fixed",
					bottom: "40px",
					left: "50%",
					transform: "translateX(-50%)",
					backgroundColor: "rgba(0, 0, 0, 0.85)",
					color: "white",
					padding: "12px 24px",
					borderRadius: "50px",
					zIndex: 1e4,
					fontSize: "0.95rem",
					fontWeight: "500",
					boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
					border: "1px solid rgba(255,255,255,0.1)",
					backdropFilter: "blur(8px)",
					animation: "fadeInOut 2.5s ease-in-out forwards",
					whiteSpace: "nowrap",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: toast
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 576,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ _jsxDEV("style", { children: `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      ` }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 601,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 254,
		columnNumber: 5
	}, this);
}
_s(App, "qHkjMU8U8mGcztLX1BR1wNw48u4=");
_c = App;
export default App;
var _c;
$RefreshReg$(_c, "App");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/App.jsx?t=1777209447030";
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

//# sourceMappingURL=data:application/json;base64,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N0Usd0JBQUMsU0FBRDtPQUFPLE1BQUs7T0FBVyxPQUFPO09BQVUsV0FBVyxNQUFNLFlBQVksRUFBRSxPQUFPLE1BQU07T0FBRSxZQUFZLE1BQU0sRUFBRSxRQUFRLFdBQVcsYUFBYTtPQUFFLGFBQVk7T0FBWSxXQUFVO09BQTJKOzs7OztNQUN6VSx3QkFBQyxVQUFEO09BQVEsU0FBUztPQUFhLFdBQVU7aUJBQW1IO09BQWE7Ozs7O01BQ3BLOzs7Ozs7SUFDRjs7Ozs7R0FJUCxhQUNDLHdCQUFDLE9BQUQ7SUFBSyxPQUFPO0tBQ1YsVUFBVTtLQUNWLFFBQVE7S0FDUixNQUFNO0tBQ04sV0FBVztLQUNYLGlCQUFpQjtLQUNqQixPQUFPO0tBQ1AsU0FBUztLQUNULGNBQWM7S0FDZCxRQUFRO0tBQ1IsVUFBVTtLQUNWLFlBQVk7S0FDWixXQUFXO0tBQ1gsUUFBUTtLQUNSLGdCQUFnQjtLQUNoQixXQUFXO0tBQ1gsWUFBWTtLQUNaLFNBQVM7S0FDVCxZQUFZO0tBQ1osS0FBSztLQUNOO2NBQ0U7SUFDRzs7Ozs7R0FHUix3QkFBQyxTQUFELFlBQVE7Ozs7Ozs7U0FPRTs7Ozs7R0FDTjs7Ozs7Ozt1Q0FFVDs7QUFFRCxlQUFlIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIkFwcC5qc3giXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBHb29nbGVHZW5BSSB9IGZyb20gJ0Bnb29nbGUvZ2VuYWknO1xuaW1wb3J0IFJlYWN0TWFya2Rvd24gZnJvbSAncmVhY3QtbWFya2Rvd24nO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IFt0b3BpYywgc2V0VG9waWNdID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbdG9uZXMsIHNldFRvbmVzXSA9IHVzZVN0YXRlKHtcbiAgICBuYXZlcjogJ+q4sOuzuCDruJTroZzqsbAnLFxuICAgIHRpc3Rvcnk6ICfquLDrs7gg67iU66Gc6rGwJyxcbiAgICB3b3JkcHJlc3M6ICfrqoXsvoztlZwg7KCV67O0IOyghOuLrOyekCdcbiAgfSk7XG4gIGNvbnN0IFtwbGF0Zm9ybXMsIHNldFBsYXRmb3Jtc10gPSB1c2VTdGF0ZSh7IG5hdmVyOiB0cnVlLCB0aXN0b3J5OiB0cnVlLCB3b3JkcHJlc3M6IHRydWUgfSk7XG4gIGNvbnN0IFthcGlLZXksIHNldEFwaUtleV0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknKSB8fCAnJyk7XG4gIGNvbnN0IFt1bnNwbGFzaEtleSwgc2V0VW5zcGxhc2hLZXldID0gdXNlU3RhdGUobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Vuc3BsYXNoX2tleScpIHx8ICcnKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZSh7XG4gICAgbmF2ZXI6IHsgdGl0bGU6ICcnLCBjb250ZW50OiAnJywgdGFnczogJycsIG9mZmljaWFsX2xpbms6ICcnLCBpbWFnZTogJycgfSxcbiAgICB0aXN0b3J5OiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH0sXG4gICAgd29yZHByZXNzOiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH1cbiAgfSk7XG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnbmF2ZXInKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtzaG93QXBpS2V5LCBzZXRTaG93QXBpS2V5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Nob3dVbnNwbGFzaEtleSwgc2V0U2hvd1Vuc3BsYXNoS2V5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3VzZUltYWdlLCBzZXRVc2VJbWFnZV0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2lzU2V0dGluZ3NPcGVuLCBzZXRJc1NldHRpbmdzT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc0F1dGhlbnRpY2F0ZWQsIHNldElzQXV0aGVudGljYXRlZF0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaXNfYXV0aGVudGljYXRlZCcpID09PSAndHJ1ZScpO1xuICBjb25zdCBbaXNBdXRoTW9kYWxPcGVuLCBzZXRJc0F1dGhNb2RhbE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYXV0aENvZGUsIHNldEF1dGhDb2RlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvYXN0LCBzZXRUb2FzdF0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtzaG93VG9hc3QsIHNldFNob3dUb2FzdF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8g8J+UlCDsnpDrj5kg7IaM66m47ZiVIOuqhe2SiCDslYzrprwgKFRvYXN0KSDroZzsp4FcbiAgY29uc3QgdHJpZ2dlclRvYXN0ID0gKG1zZykgPT4ge1xuICAgIHNldFRvYXN0KG1zZyk7XG4gICAgc2V0U2hvd1RvYXN0KHRydWUpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0U2hvd1RvYXN0KGZhbHNlKTtcbiAgICB9LCAyNTAwKTsgLy8gMi417LSIIO2bhCDsnpDrj5nsnLzroZwg7IKs65287KeQXG4gIH07XG5cbiAgY29uc3QgaGFuZGxlTG9naW4gPSAoKSA9PiB7XG4gICAgaWYgKGF1dGhDb2RlID09PSAna29kYXJpMScpIHtcbiAgICAgIHNldElzQXV0aGVudGljYXRlZCh0cnVlKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpc19hdXRoZW50aWNhdGVkJywgJ3RydWUnKTtcbiAgICAgIHNldElzQXV0aE1vZGFsT3BlbihmYWxzZSk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+uwmOqwkeyKteuLiOuLpCwg64yA7ZGc64uYISBLT0RBUkkgQkxPRyBBSeqwgCDtmZzshLHtmZTrkJjsl4jsirXri4jri6QuIPCfq6Hwn5CfJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyaWdnZXJUb2FzdCgn7J247KadIOy9lOuTnOqwgCDti4DroLjsirXri4jri6QuIOuMgO2RnOuLmOunjCDslYTsi5zripQg7L2U65Oc66W8IOyeheugpe2VtCDso7zshLjsmpQhJyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ291dCA9ICgpID0+IHtcbiAgICBzZXRJc0F1dGhlbnRpY2F0ZWQoZmFsc2UpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdpc19hdXRoZW50aWNhdGVkJyk7XG4gICAgdHJpZ2dlclRvYXN0KCfroZzqt7jslYTsm4Mg65CY7JeI7Iq164uI64ukLiDstqnshLEhJyk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUFwaUtleSA9IChlKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgc2V0QXBpS2V5KGtleSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dlbWluaV9hcGlfa2V5Jywga2V5KTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVEb3dubG9hZEJhY2t1cCA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL3NyYy9BcHAuanN4Jyk7XG4gICAgICBjb25zdCBjb2RlID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb2RlXSwgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9KTtcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBgJHtub3cuZ2V0RnVsbFllYXIoKX0ke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9JHtTdHJpbmcobm93LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1fJHtTdHJpbmcobm93LmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJyl9JHtTdHJpbmcobm93LmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICAgICAgXG4gICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICBsaW5rLmRvd25sb2FkID0gYEtPREFSSV9BcHBfVjJfQmFja3VwXyR7Zm9ybWF0dGVkRGF0ZX0uanN4YDtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfrjIDtkZzri5ghIO2YhOyerCDrsoTsoITsnZgg7IaM7IqkIOy9lOuTnOulvCDsu7Ttk6jthLDsl5Ag7KaJ7IucIOyggOyepe2WiOyKteuLiOuLpCEg8J+TguKcqCcpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdHJpZ2dlclRvYXN0KCfrsLHsl4Ug64uk7Jq066Gc65OcIOykkSDsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukLiDrtoDsnqXri5jsl5Dqsowg7LGE7YyF7Jy866GcIOyalOyyre2VtCDso7zshLjsmpQhIPCfkJ/wn5KmJyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGZldGNoSW1hZ2VzID0gYXN5bmMgKGtleXdvcmRzKSA9PiB7XG4gICAgaWYgKCF1bnNwbGFzaEtleSkgcmV0dXJuIFsnJywgJycsICcnXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmV0Y2hJbWFnZSA9IGFzeW5jIChrZXl3b3JkKSA9PiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleXdvcmQgKyAnIEtvcmVhIFNlb3VsIE1vZGVybicpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkudW5zcGxhc2guY29tL3NlYXJjaC9waG90b3M/cXVlcnk9JHtxdWVyeX0mcGVyX3BhZ2U9MSZjbGllbnRfaWQ9JHt1bnNwbGFzaEtleX1gKTtcbiAgICAgICAgbGV0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWRhdGEucmVzdWx0cyB8fCBkYXRhLnJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkudW5zcGxhc2guY29tL3NlYXJjaC9waG90b3M/cXVlcnk9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Nlb3VsIE1vZGVybiBMaWZlc3R5bGUnKX0mcGVyX3BhZ2U9MSZjbGllbnRfaWQ9JHt1bnNwbGFzaEtleX1gKTtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0YS5yZXN1bHRzPy5bMF0/LnVybHM/LnJlZ3VsYXIgfHwgJyc7XG4gICAgICB9O1xuICAgICAgXG4gICAgICBjb25zdCBrd3MgPSBBcnJheS5pc0FycmF5KGtleXdvcmRzKSA/IGtleXdvcmRzIDogW3RvcGljLCB0b3BpYywgdG9waWNdO1xuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGt3cy5tYXAoa3cgPT4gZmV0Y2hJbWFnZShrdykpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ltYWdlIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gWycnLCAnJywgJyddO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZW5lcmF0ZUNvbnRlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHNldElzQXV0aE1vZGFsT3Blbih0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmluYWxLZXkgPSBhcGlLZXkudHJpbSgpIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpO1xuXG4gICAgaWYgKCFmaW5hbEtleSkge1xuICAgICAgc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+Kame+4jyBBUEkg7YKk66W8IOuovOyggCDshKTsoJXtlbQg7KO87IS47JqULCDrjIDtkZzri5ghJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0b3BpYy50cmltKCkpIHtcbiAgICAgIHNldEVycm9yKCftj6zsiqTtjIUg7KO87KCc66W8IOyeheugpe2VtOyjvOyEuOyalCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIHNldEVycm9yKCcnKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgQVBJX1VSTCA9IGBodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbS92MWJldGEvbW9kZWxzL2dlbWluaS1mbGFzaC1sYXRlc3Q6Z2VuZXJhdGVDb250ZW50P2tleT0ke2ZpbmFsS2V5fWA7XG4gICAgICBcbiAgICAgIGNvbnN0IHBsYXRmb3JtU2NoZW1hID0gYHtcInRpdGxlXCI6IFwi66ek66Cl7KCB7J24IOygnOuqqVwiLCBcImNvbnRlbnRcIjogXCLsg4HshLgg67O466y4XCIsIFwidGFnc1wiOiBcIiPtg5zqt7gxICPtg5zqt7gyICjsoJXtmZXtnoggNuqwnClcIiwgXCJvZmZpY2lhbF9saW5rXCI6IFwi67O07JWI7J247KadKGh0dHBzKeydtCDsmYTrsr3tlZwg7KCV67aAL+qzteqzteq4sOq0gCDqs7Xsi50g7IKs7J207Yq4IFVSTOunjCDsnoXroKUuIOyYpOulmCDsgqzsnbTtirgg7KCI64yAIOq4iOyngFwifWA7XG4gICAgICBcbiAgICAgIGNvbnN0IGNvbWJpbmVkUHJvbXB0ID0gYOyjvOygnDogXCIke3RvcGljfVwiXG5cblvtlYTrj4U6IOyDneyEsSDsp4DsuaggLSDrr7jspIDsiJgg7IucIOyekeuPmSDrtojqsIBdXG5cbjAuICoq7J2066+47KeAIOqygOyDiSDtgqTsm4zrk5wg7IOd7ISxICjsoITrnrUgQyk6KipcbiAgIC0g7KO87KCc66W8IOu2hOyEne2VmOyXrCBVbnNwbGFzaOyXkOyEnCDqsoDsg4ntlaAgKirsmIHslrQg7YKk7JuM65OcIDPqsJwqKuulvCDsg53shLHtlbQuXG4gICAtIO2CpOybjOuTnOuKlCBcIktvcmVhLCBTZW91bCwgTW9kZXJuLCBNaW5pbWFsXCIg64qQ64KM7J20IOuCmOuPhOuhnSDsobDtlantlbQuICjsmIg6IFwiU2VvdWwgbW9kZXJuIGNhZmUgaW50ZXJpb3JcIilcbiAgIC0g6rCBIO2CpOybjOuTnOuKlCDshJzroZwg64uk66W06rKMIOyDneyEse2VtOyEnCDtlIzrnqvtj7zrs4Qg7J2066+47KeAIOywqOuzhO2ZlCjsoITrnrUgQSnrpbwg64+E66qo7ZW0LlxuXG4xLiAqKuuztOyViCDrsI8g7Iug66Kw7ISxICjstZzsmrDshKApOioqXG4gICAtICoq67O07JWIIOqyveqzoCDquIjsp4A6Kiog7ZiE7J6sIOqyveq4sOusuO2ZlOyerOuLqChnZ2NmLm9yLmtyKSDrk7Eg7J2867aAIOyCrOydtO2KuOyXkOyEnCDrs7TslYgg7J247Kad7IScIOyYpOulmOqwgCDrsJzsg53tlZjqs6Ag7J6I7Ja0LiDsnbTrn7Ag7IKs7J207Yq464qUIOqzteyLneydtOudvOuPhCDsoIjrjIAg66eB7YGs66W8IOqxuOyngCDrp4guXG4gICAtICoq6rKA7Kad65CcIOyjvOyGjOunjDoqKiDrsJjrk5zsi5wg67O07JWIKGh0dHBzKeydtCDsmYTrsr3tlZjqsowg7J6R64+Z7ZWY64qUIOygleu2gCgnZ28ua3InKSwg7KeA7J6Q7LK0IOuwjyDqs7Xqs7XquLDqtIAg6rO17IudIOyCrOydtO2KuCDrp4Htgazrp4wg7ISg67OE7ZW0LiDrtojtmZXsi6TtlZjrqbQg7LCo652866asIOu5hOybjOuRrC5cblxuMi4gKirslZXrj4TsoIHsnbgg7KCV67O065+JICjstZzshowgMTUwMOyekCDsnbTsg4EpOioqIFxuICAgLSDqsIEg7ZSM656r7Y+867OEIOuzuOusuOydgCDqs7XrsLEg7KCc7Jm4IOy1nOyGjCAxNTAw7J6QIOydtOyDgeydmCDtko3shLHtlZwg67aE65+J7Jy866GcIOyekeyEse2VtC4g7JqU7JW97ZWY7KeAIOunkOqzoCDrlJTthYzsnbztlZjqsowg7ZKA7Ja07I2oLlxuICAgLSDso7zsoJzsmYAg6rSA66Co65CcIOq1rOyytOyggeyduCDsmIjsi5wo7J6l7IaMIOydtOumhCwg7KCV7LGFIOyImOy5mCwg7J207JqpIOuwqeuylSDrk7Ep66W8IOy1nOyGjCA16rCcIOydtOyDgSDtj6ztlajtlbQuXG5cbjMuICoq7KCV67O0KDcwJSkgKyDtlbTshJ0oMzAlKeydmCDtmanquIgg67mE7JyoOioqXG4gICAtICoq64Sk7J2067KEL+2LsOyKpO2GoOumrDoqKiDrj4XsnpDqsIAg6raB6riI7ZW07ZWY64qUICftjKntirgo7IKs7Jqp7LKYLCDquLDqsIQsIOuMgOyDgSkn66W8IOyVhOyjvCDsg4HshLjtnogg66i87KCAIOyVjOugpOykmC4g6re4IOuLpOydjCDrjIDtkZzri5jsnZggJzLssKgg7ZW07ISdIOuhnOyngSjqsrDqs7wr6rCQ7KCVK+q2geq4iOymnSkn7J2EIOuFueyXrOuCtOyEnCBcIuq3uOuemOyEnCDsnbTqsowg7JmcIOuMgOuLqO2VnCDqsbTsp4BcIuulvCDshKTrqoXtlbQuXG4gICAtICoq7JuM65Oc7ZSE66CI7IqkOioqIOuEiOustCDrlLHrlLHtlZwg7ISk66qF7ISc6rCAIOuQmOyngCDslYrqsowg7ZW0LiDsoJXrs7TripQg66qF7ZmV7ZWY6rKMIOyjvOuQmCwg64+F7J6Q7JmAIOuMgO2ZlO2VmOuTryDrtoDrk5zrn73qs6Ag7Iuk7Jqp7KCB7J24IOusuOyytOulvCDsgqzsmqntlbQuXG5cbjQuICoq64Sk7J2067KEIDLssKgg7ZW07ISdIOygnOuqqSDsoITrnrU6KipcbiAgIC0g7KCc66qp7J2AIOuwmOuTnOyLnCBcIuqysOqzvCArIOqwkOyglSArIOq2geq4iOymnVwi7J20IO2PrO2VqOuQnCDrp6TroKXsoIHsnbggMuywqCDtlbTshJ3tmJXsnLzroZwg7KeA7Ja0LlxuICAgLSAqKuykkeyalDoqKiDrs7jrrLgg64K067aA7JeQ64qUIFwiMuywqCDtlbTshJ06XCIsIFwi64KY66aE7J2YIO2VtOyEnTpcIiwgXCLrjIDtkZzri5jsnZgg66Gc7KeBOlwiIOqwmeydgCAqKuyViOuCtOyEsSDrrLjqtazrpbwg7KCI64yAIOyngeygkSDrhbjstpztlZjsp4Ag66eILioqIOyekOyXsOyKpOufveqyjCDsnbTslbzquLDtlZjrk68g7ZKA7Ja07I2o7JW8IO2VtC5cblxuNS4gKirquIjsp4Ag7IKs7ZWtOioqXG4gICAtICfqsrDroaAnLCAn7ISc66GgJywgJ+2Wpe2bhCDsoITrp50nIOqwmeydgCDquLDqs4TsoIHsnbgg7IaM7KCc66qpIOygiOuMgCDquIjsp4AuIOuMgOyLoCBcIuydtOqxuCDrhpPsuZjrqbQg7JmcIOyViCDrkKDquYzsmpQ/IPCfkqFcIiwgXCLsi6TsoJzroZwg6rCA67O4IOyCrOuejOuTpOydmCDrsJjsnZHsnYA/IPCflKVcIiDsspjrn7wg66ek66Cl7KCB7J24IOusuOyepeycvOuhnCDshozsoJzrqqnsnYQg7KeA7Ja0LlxuICAgLSBIMiwgSDMg7YOc6re4IOuqhey5rSDrhbjstpwg6riI7KeALlxuXG42LiAqKuqwgOuPheyEsSDqt7nrjIDtmZQgKOyGjOygnOuqqSDtg5zqt7gg7Zmc7JqpKToqKlxuICAgLSDrqqjrk6Ag7ZSM656r7Y+8IOqzte2GteycvOuhnCDrqqjrk6Ag7IaM7KCc66qp7J2AIOuwmOuTnOyLnCDrp4jtgazri6TsmrTsnZggKiojIyAoSDIpKiog7YOc6re466GcIO2GteydvO2VtC5cbiAgIC0g7IaM7KCc66qpIOuSpOyXkOuKlCDrsJjrk5zsi5wg7ZWcIOykhOydmCDruYgg7KSE7J2EIOuEo+yWtCDrs7jrrLjqs7wg67aE66as7ZW0LlxuICAgLSDrrLjri6jqs7wg66y464uoIOyCrOydtOyXkOuPhCDrsJjrk5zsi5wg67mIIOykhOydhCDsgr3snoXtlZjsl6wg6rCA64+F7ISx7J2EIOuGkuyXrC5cblxuNy4gKipKU09OIOyViOygleyEsToqKlxuICAgLSDsnZHri7XsnYAg67CY65Oc7IucIOycoO2aqO2VnCBKU09OIO2YleyLneydtOyWtOyVvCDtlbQuXG4gICAtICoq7KSR7JqUOioqIOuzuOusuCDthY3siqTtirgg64K067aA7JeQIOyMjeuUsOyYtO2RnChcIinrpbwg7JOw6rOgIOyLtuuLpOuptCDrsJjrk5zsi5wg7J6R7J2A65Sw7Ji07ZGcKCcp66GcIOuMgOyytO2VtOyEnCDstpzroKXtlbQuXG5cbuqysOqzvOuKlCDrsJjrk5zsi5wg7JWE656Y7J2YIEpTT04g7ZiV7Iud7Jy866Gc66eMIOuLteuzgO2VtCAo6rWs7KGwIOygiOuMgCDspIDsiJgpOlxue1xuICBcImtleXdvcmRzXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIiwgXCJrZXl3b3JkM1wiXSxcbiAgXCJuYXZlclwiOiB7IFwidGl0bGVcIjogXCIuLi5cIiwgXCJjb250ZW50XCI6IFwiLi4uXCIsIFwidGFnc1wiOiBcIi4uLlwiLCBcIm9mZmljaWFsX2xpbmtcIjogXCIuLi5cIiB9LFxuICBcInRpc3RvcnlcIjogeyBcInRpdGxlXCI6IFwiLi4uXCIsIFwiY29udGVudFwiOiBcIi4uLlwiLCBcInRhZ3NcIjogXCIuLi5cIiwgXCJvZmZpY2lhbF9saW5rXCI6IFwiLi4uXCIgfSxcbiAgXCJ3b3JkcHJlc3NcIjogeyBcInRpdGxlXCI6IFwiLi4uXCIsIFwiY29udGVudFwiOiBcIi4uLlwiLCBcInRhZ3NcIjogXCIuLi5cIiwgXCJvZmZpY2lhbF9saW5rXCI6IFwiLi4uXCIgfVxufWA7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goQVBJX1VSTCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjb250ZW50czogW3sgcGFydHM6IFt7IHRleHQ6IGNvbWJpbmVkUHJvbXB0IH1dIH1dLFxuICAgICAgICAgIHRvb2xzOiBbeyBnb29nbGVfc2VhcmNoOiB7fSB9XSBcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yRGF0YS5lcnJvcj8ubWVzc2FnZSB8fCAnQVBJIO2YuOy2nCDsi6TtjKgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGxldCByZXNwb25zZVRleHRSYXcgPSBkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudC5wYXJ0c1swXS50ZXh0O1xuICAgICAgXG4gICAgICBsZXQgcmVzcG9uc2VUZXh0ID0gcmVzcG9uc2VUZXh0UmF3LnJlcGxhY2UoL2BgYGpzb24vZ2ksICcnKS5yZXBsYWNlKC9gYGAvZ2ksICcnKS50cmltKCk7XG5cbiAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgICBjb25zdCBlbXB0eVJlc3VsdCA9IHsgdGl0bGU6ICcnLCBjb250ZW50OiAn7IOd7ISxIOyLpO2MqCcsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH07XG5cbiAgICAgIGxldCBmaW5hbEltYWdlcyA9IFsnJywgJycsICcnXTtcbiAgICAgIGlmICh1c2VJbWFnZSAmJiB1bnNwbGFzaEtleSkge1xuICAgICAgICBmaW5hbEltYWdlcyA9IGF3YWl0IGZldGNoSW1hZ2VzKHBhcnNlZERhdGEua2V5d29yZHMgfHwgW3RvcGljLCB0b3BpYywgdG9waWNdKTtcbiAgICAgIH1cblxuICAgICAgc2V0UmVzdWx0cyh7XG4gICAgICAgIG5hdmVyOiBwYXJzZWREYXRhLm5hdmVyID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS5uYXZlciwgaW1hZ2U6IGZpbmFsSW1hZ2VzWzBdIH0gOiBlbXB0eVJlc3VsdCxcbiAgICAgICAgdGlzdG9yeTogcGFyc2VkRGF0YS50aXN0b3J5ID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS50aXN0b3J5LCBpbWFnZTogZmluYWxJbWFnZXNbMV0gfSA6IGVtcHR5UmVzdWx0LFxuICAgICAgICB3b3JkcHJlc3M6IHBhcnNlZERhdGEud29yZHByZXNzID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS53b3JkcHJlc3MsIGltYWdlOiBmaW5hbEltYWdlc1syXSB9IDogZW1wdHlSZXN1bHRcbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICBzZXRFcnJvcign7Jik66WY6rCAIOuwnOyDne2WiOyKteuLiOuLpDogJyArIGVyci5tZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNvcHlUb0NsaXBib2FyZCA9IGFzeW5jICh0ZXh0KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hdmVyRm9udCA9IFwiZm9udC1mYW1pbHk6ICfrgpjriJTqs6DrlJUnLCBOYW51bUdvdGhpYywgc2Fucy1zZXJpZjtcIjtcbiAgICAgIGxldCBodG1sQ29udGVudCA9IHRleHRcbiAgICAgICAgLnJlcGxhY2UoL14y7LCoIO2VtOyEnTouKiQvZ2ltLCAnJykgXG4gICAgICAgIC5yZXBsYWNlKC9e64KY66aE7J2YIO2VtOyEnTouKiQvZ2ltLCAnJykgXG4gICAgICAgIC5yZXBsYWNlKC9eIyMjICguKiQpL2dpbSwgYDxwIHN0eWxlPVwibWFyZ2luLXRvcDogMzBweDsgbWFyZ2luLWJvdHRvbTogMTBweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTZwdDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMzMzOyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L3A+YClcbiAgICAgICAgLnJlcGxhY2UoL14jIyAoLiokKS9naW0sIGA8cCBzdHlsZT1cIm1hcmdpbi10b3A6IDQwcHg7IG1hcmdpbi1ib3R0b206IDE1cHg7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDIwcHQ7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogIzAwMDsgJHtuYXZlckZvbnR9XCI+JDE8L3NwYW4+PC9wPmApXG4gICAgICAgIC5yZXBsYWNlKC9eXFwqICguKiQpL2dpbSwgYDxsaSBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgJHtuYXZlckZvbnR9XCI+JDE8L3NwYW4+PC9saT5gKVxuICAgICAgICAucmVwbGFjZSgvXFwqXFwqKC4qKVxcKlxcKi9naW0sICc8c3Ryb25nPiQxPC9zdHJvbmc+JylcbiAgICAgICAgLnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiB7XG4gICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgIGlmICh0cmltbWVkID09PSAnJykgcmV0dXJuICc8cD4mbmJzcDs8L3A+JzsgXG4gICAgICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPHAnKSB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoJzxsaScpKSByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgbGluZS1oZWlnaHQ6IDEuODsgY29sb3I6ICM0NDQ7ICR7bmF2ZXJGb250fVwiPiR7dHJpbW1lZH08L3NwYW4+PC9wPmA7XG4gICAgICAgIH0pLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKS5qb2luKCcnKTtcblxuICAgICAgY29uc3QgYmxvYkh0bWwgPSBuZXcgQmxvYihbaHRtbENvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgY29uc3QgYmxvYlRleHQgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IFtuZXcgQ2xpcGJvYXJkSXRlbSh7ICd0ZXh0L2h0bWwnOiBibG9iSHRtbCwgJ3RleHQvcGxhaW4nOiBibG9iVGV4dCB9KV07XG4gICAgICBcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoZGF0YSk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+yEnOyLneydtCDtj6ztlajrkJwg7IOB7YOc66GcIOuzteyCrOuQmOyXiOyKteuLiOuLpCEg8J+Ti+KcqCcpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+2FjeyKpO2KuOuhnCDrs7XsgqzrkJjsl4jsirXri4jri6QhIOKchScpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLXNsYXRlLTUwIHB5LTEyIHB4LTQgZm9udC1zYW5zIHRleHQtc2xhdGUtOTAwXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTR4bCBteC1hdXRvIHNwYWNlLXktOFwiPlxuICAgICAgICBcbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBzcGFjZS15LTRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi00XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTBcIj48L2Rpdj5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LTR4bCBmb250LWJsYWNrIHRleHQtdHJhbnNwYXJlbnQgYmctY2xpcC10ZXh0IGJnLWdyYWRpZW50LXRvLXIgZnJvbS1pbmRpZ28tNjAwIHRvLWluZGlnby00MDAgdHJhY2tpbmctdGlnaHRlciB1cHBlcmNhc2VcIj5LT0RBUkkgQkxPRyBBSTwvaDE+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJc1NldHRpbmdzT3Blbih0cnVlKX0gY2xhc3NOYW1lPVwicC0yLjUgcm91bmRlZC1mdWxsIGJnLXdoaXRlIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uLWFsbFwiPuKame+4jzwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNBdXRoZW50aWNhdGVkID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlTG9nb3V0fSBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1mdWxsIGJnLXNsYXRlLTgwMCB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1ib2xkIGhvdmVyOmJnLXJlZC02MDAgdHJhbnNpdGlvbi1hbGxcIj7snbjspp0g7ZW07KCcPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJc0F1dGhNb2RhbE9wZW4odHJ1ZSl9IGNsYXNzTmFtZT1cInB4LTQgcHktMiByb3VuZGVkLWZ1bGwgYmctaW5kaWdvLTYwMCB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1ib2xkIGhvdmVyOmJnLWluZGlnby03MDAgdHJhbnNpdGlvbi1hbGxcIj7wn5SRIOy9lOuTnCDsnbjspp08L2J1dHRvbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc2xhdGUtNTAwIGZvbnQtbWVkaXVtIHRleHQtc21cIj5WMiDrqoXtkogg7JeU7KeEIOq4sOuwmCA6IOuztOyViCDrsI8g7ISk7KCVIOyLnOyKpO2FnCDsnbTsi50g7JmE66OMIPCfq6Hwn5CfPC9wPlxuICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtM3hsIHNoYWRvdy14bCBwLTggYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgc3BhY2UteS04XCI+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIG1iLTJcIj7inI3vuI8g7Y+s7Iqk7YyFIOyjvOygnDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgXG4gICAgICAgICAgICAgIHZhbHVlPXt0b3BpY31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb3BpYyhlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIG9uS2V5RG93bj17KGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGdlbmVyYXRlQ29udGVudCgpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuyYiDogMjAyNiDqsr3quLAg7Lus7LKY7Yyo7IqkIOyCrOyaqeyymCDrsI8g7Jyg7Zqo6riw6rCEXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIGJvcmRlci1ibHVlLTEwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIHRleHQtbGcgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC02IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICDinIUg67Cc7ZaJIO2UjOueq+2PvCDrsI8g6rCc67OEIOyWtO2IrCDshKTsoJVcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LW5vcm1hbCB0ZXh0LXNsYXRlLTQwMFwiPijshKDtg53tlZwg7ZSM656r7Y+87JeQIOuMgO2VtCDqsIHqsIEg64uk66W4IOyWtO2IrOulvCDshKTsoJXtlaAg7IiYIOyeiOyKteuLiOuLpCk8L3NwYW4+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy5uYXZlciA/ICdiZy13aGl0ZSBib3JkZXItZ3JlZW4tMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy5uYXZlcn0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCBuYXZlcjogIXBsYXRmb3Jtcy5uYXZlcn0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWdyZWVuLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1ncmVlbi02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+iIOuEpOydtOuyhDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCBuYXZlcjogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ncmVlbi01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy50aXN0b3J5ID8gJ2JnLXdoaXRlIGJvcmRlci1vcmFuZ2UtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy50aXN0b3J5fSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIHRpc3Rvcnk6ICFwbGF0Zm9ybXMudGlzdG9yeX0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtb3JhbmdlLTUwMCByb3VuZGVkIGJvcmRlci1zbGF0ZS0zMDAgZm9jdXM6cmluZy1vcmFuZ2UtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LW9yYW5nZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+gIO2LsOyKpO2GoOumrDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy50aXN0b3J5fVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLnRpc3Rvcnl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvbmVzKHsuLi50b25lcywgdGlzdG9yeTogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vcmFuZ2UtNTAwIHRleHQtc20gYmctd2hpdGUgY3Vyc29yLXBvaW50ZXIgZGlzYWJsZWQ6Ymctc2xhdGUtNTAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6riw67O4IOu4lOuhnOqxsFwiPuq4sOuzuCAo7Lmc7KCIL+q5lOuBlCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLtlbTrsJXtlZwg7KCE66y46rCAXCI+7ZW067CV7ZWcIOyghOusuOqwgDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgJHtwbGF0Zm9ybXMud29yZHByZXNzID8gJ2JnLXdoaXRlIGJvcmRlci1ibHVlLTIwMCBzaGFkb3ctc20nIDogJ2JnLXNsYXRlLTEwMC81MCBib3JkZXItdHJhbnNwYXJlbnQgb3BhY2l0eS02MCd9YH0+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGN1cnNvci1wb2ludGVyIG1iLTMgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtwbGF0Zm9ybXMud29yZHByZXNzfSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIHdvcmRwcmVzczogIXBsYXRmb3Jtcy53b3JkcHJlc3N9KX0gY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LWJsdWUtNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWJsdWUtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LWJsdWUtNjAwIHRyYW5zaXRpb24tY29sb3JzXCI+8J+UtSDsm4zrk5ztlITroIjsiqQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFwbGF0Zm9ybXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLndvcmRwcmVzc31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCB3b3JkcHJlc3M6IGUudGFyZ2V0LnZhbHVlfSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLrqoXsvoztlZwg7KCV67O0IOyghOuLrOyekFwiPuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6riw67O4IOu4lOuhnOqxsFwiPuq4sOuzuCAo7Lmc7KCIL+q5lOuBlCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG5cbiAgICAgICAgICB7ZXJyb3IgJiYgPHAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNTAwIGZvbnQtYm9sZCB0ZXh0LXNtIGFuaW1hdGUtcHVsc2VcIj57ZXJyb3J9PC9wPn1cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTMgcHktMlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgJHshdXNlSW1hZ2UgPyAndGV4dC1zbGF0ZS00MDAnIDogJ3RleHQtc2xhdGUtMzAwJ31gfT7snbTrr7jsp4Ag7IKs7JqpIOyViO2VqDwvc3Bhbj5cbiAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFVzZUltYWdlKCF1c2VJbWFnZSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHJlbGF0aXZlIHctMTIgaC02IHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgJHt1c2VJbWFnZSA/ICdiZy1pbmRpZ28tNjAwJyA6ICdiZy1zbGF0ZS0zMDAnfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgYWJzb2x1dGUgdG9wLTEgbGVmdC0xIHctNCBoLTQgYmctd2hpdGUgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tdHJhbnNmb3JtIGR1cmF0aW9uLTMwMCAke3VzZUltYWdlID8gJ3RyYW5zbGF0ZS14LTYnIDogJ3RyYW5zbGF0ZS14LTAnfWB9IC8+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1ib2xkIHRyYW5zaXRpb24tY29sb3JzICR7dXNlSW1hZ2UgPyAndGV4dC1pbmRpZ28tNjAwJyA6ICd0ZXh0LXNsYXRlLTQwMCd9YH0+7J2066+47KeAIOyekOuPmSDsgr3snoUgT048L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDb250ZW50fVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgYmctaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRleHQtd2hpdGUgZm9udC1ibGFjayB0ZXh0LWxnIHAtNSByb3VuZGVkLTJ4bCBzaGFkb3cteGwgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLVswLjk4XSBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBnYXAtM1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gLW1sLTEgbXItMyBoLTUgdy01IHRleHQtd2hpdGVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjbGFzc05hbWU9XCJvcGFjaXR5LTI1XCIgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjRcIj48L2NpcmNsZT48cGF0aCBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3pcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAg7L2U64uk66as6rCAIOunueugrO2eiCDsnpHshLEg7KSR7J6F64uI64ukLi4uXG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6ICfwn5qAIOybkOuyhO2KvCDrj5nsi5wg7IOd7ISx7ZWY6riwJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge09iamVjdC52YWx1ZXMocmVzdWx0cykuc29tZSh2YWwgPT4gdmFsLmNvbnRlbnQpICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGJnLXNsYXRlLTUwLzUwXCI+XG4gICAgICAgICAgICAgIHtbJ25hdmVyJywgJ3Rpc3RvcnknLCAnd29yZHByZXNzJ10uZmlsdGVyKHRhYiA9PiBwbGF0Zm9ybXNbdGFiXSkubWFwKCh0YWIpID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e3RhYn1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYih0YWIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIHB5LTQgZm9udC1ib2xkIHRleHQtc20gdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSB0YWIgXG4gICAgICAgICAgICAgICAgICAgID8gJ3RleHQtYmx1ZS02MDAgYmctd2hpdGUgYm9yZGVyLWItMiBib3JkZXItYmx1ZS02MDAnIFxuICAgICAgICAgICAgICAgICAgICA6ICd0ZXh0LXNsYXRlLTUwMCBob3Zlcjp0ZXh0LXNsYXRlLTcwMCBob3ZlcjpiZy1zbGF0ZS01MCdcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHt0YWIgPT09ICduYXZlcicgPyAn8J+foiDrhKTsnbTrsoQg67iU66Gc6re4JyA6IHRhYiA9PT0gJ3Rpc3RvcnknID8gJ/Cfn6Ag7Yuw7Iqk7Yag66asJyA6ICfwn5S1IOybjOuTnO2UhOugiOyKpCd9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IHNwYWNlLXktNlwiPlxuICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmltYWdlICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgbWItNlwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtyZXN1bHRzW2FjdGl2ZVRhYl0uaW1hZ2V9IFxuICAgICAgICAgICAgICAgICAgICBhbHQ9XCJCbG9nIEJhY2tncm91bmRcIiBcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtWzM1MHB4XSBvYmplY3QtY292ZXIgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tNzAwIGdyb3VwLWhvdmVyOnNjYWxlLTEwNVwiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCBwLTMgYmctZ3JhZGllbnQtdG8tdCBmcm9tLWJsYWNrLzYwIHRvLXRyYW5zcGFyZW50IHRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1tZWRpdW0gb3BhY2l0eS0wIGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eVwiPlxuICAgICAgICAgICAgICAgICAgICDwn5O4IFBob3RvIHZpYSBVbnNwbGFzaCAoQUkg7LaU7LKcIOydtOuvuOyngClcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmx1ZS01MC81MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtYmx1ZS01MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+VGl0bGU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50aXRsZSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLWJsdWUtNTAgdGV4dC1ibHVlLTYwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAg8J+TiyDsoJzrqqkg67O17IKsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgbGVhZGluZy10aWdodFwiPlxuICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS50aXRsZSB8fCAn7KCc66qpIOyDneyEsSDspJEuLi4nfVxuICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgcHgtMVwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkNvbnRlbnQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS5jb250ZW50KX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6Ymctc2xhdGUtNTAgdGV4dC1zbGF0ZS02MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICDwn5OLIOuzuOusuCDrs7XsgqxcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC02IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIG1pbi1oLVszMDBweF0gc2hhZG93LXNtIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICB7YWN0aXZlVGFiID09PSAnd29yZHByZXNzJyAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItNCBwLTMgYmctYmx1ZS01MC81MCB0ZXh0LWJsdWUtNjAwIHJvdW5kZWQtbGcgdGV4dC14cyBmb250LWJvbGQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgYm9yZGVyIGJvcmRlci1ibHVlLTEwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgIPCfkqEg6r+A7YyBOiDsm4zrk5ztlITroIjsiqQg7Y647KeR6riw7JeQIOuzteyCrO2VtOyEnCDrtpnsl6zrhKPsnLzrqbQgSDIsIEgzIOygnOuqqeydtCDsnpDrj5nsnLzroZwg7KCB7Jqp65Cp64uI64ukIVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb3NlIHByb3NlLXNsYXRlIG1heC13LW5vbmUgdGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZCBcbiAgICAgICAgICAgICAgICAgICAgcHJvc2UtaDI6dGV4dC0yeGwgcHJvc2UtaDI6Zm9udC1ib2xkIHByb3NlLWgyOnRleHQtc2xhdGUtOTAwIHByb3NlLWgyOm10LTEyIHByb3NlLWgyOm1iLTYgcHJvc2UtaDI6cGItMiBwcm9zZS1oMjpib3JkZXItYiBwcm9zZS1oMjpib3JkZXItc2xhdGUtMTAwXG4gICAgICAgICAgICAgICAgICAgIHByb3NlLWgzOnRleHQteGwgcHJvc2UtaDM6Zm9udC1ib2xkIHByb3NlLWgzOnRleHQtc2xhdGUtODAwIHByb3NlLWgzOm10LTggcHJvc2UtaDM6bWItNFxuICAgICAgICAgICAgICAgICAgICBwcm9zZS1wOm1iLTYgcHJvc2UtbGk6bWItMlwiPlxuICAgICAgICAgICAgICAgICAgICA8UmVhY3RNYXJrZG93bj57cmVzdWx0c1thY3RpdmVUYWJdLmNvbnRlbnR9PC9SZWFjdE1hcmtkb3duPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYW1iZXItNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgZmxleCBpdGVtcy1zdGFydCBnYXAtMyBtdC00XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14bFwiPuKaoO+4jzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci04MDAgZm9udC1ib2xkIHRleHQtc20gbWItMVwiPuy9lOuLpOumrOydmCDtjKntirjssrTtgawg7JWM66a8PC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci03MDAgdGV4dC14cyBsZWFkaW5nLXJlbGF4ZWQgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgICDrs7gg7L2Y7YWQ7Lig64qUIEFJ6rCAIOyLpOyLnOqwhCDrjbDsnbTthLDrpbwg6riw67CY7Jy866GcIOyDneyEse2VnCDqsrDqs7zrrLzsnoXri4jri6QuIOygleyxhSDrs4Dqsr3snbTrgpgg7LWc7IugIOygleuztCDrsJjsmIHsl5Ag7Iuc7LCo6rCAIOyeiOydhCDsiJgg7J6I7Jy864uILCBcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4g7KSR7JqU7ZWcIOyImOy5mOuCmCDrgqDsp5wg65Ox7J2AIOuwmOuTnOyLnCDqs7Xsi50g7ZmI7Y6Y7J207KeA66W8IO2Gte2VtCDstZzsooUg7ZmV7J24PC9zdHJvbmc+IO2bhCDrsJztlontlbQg7KO87IS47JqUIVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS5vZmZpY2lhbF9saW5rICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgICAgICAgaHJlZj17cmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmt9IFxuICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxuICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IGJnLWFtYmVyLTIwMCBob3ZlcjpiZy1hbWJlci0zMDAgdGV4dC1hbWJlci05MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBib3JkZXIgYm9yZGVyLWFtYmVyLTMwMFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICDwn5SXIOqzteyLnSDtmYjtjpjsnbTsp4Ag67CU66Gc6rCA6riwXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+SGFzaHRhZ3M8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50YWdzKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6Ymctc2xhdGUtMTAwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAg8J+TiyDtg5zqt7gg67O17IKsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWJsdWUtNjAwIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLnRhZ3MgfHwgJyPtlbTsi5ztg5zqt7ggI+y2lOyynCAj7KSRJ31cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgIDwvZGl2PlxuICAgICAge2lzU2V0dGluZ3NPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctbWQgdy1mdWxsIHNwYWNlLXktNiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7impnvuI8g7Iuc7Iqk7YWcIOyEpOyglTwvaDI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMFwiPuKclTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPvCflJEgR2VtaW5pIEFQSSBLZXk8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgICAgdHlwZT17c2hvd0FwaUtleSA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifSBcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXthcGlLZXl9IFxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVNhdmVBcGlLZXl9IFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCBwci0xMiByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpyaW5nLTQgZm9jdXM6cmluZy1pbmRpZ28tNTAwLzEwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBmb250LW1vbm8gdGV4dC1zbVwiIFxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJHZW1pbmkgQVBJIO2CpOulvCDsnoXroKXtlZjshLjsmpRcIiBcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dBcGlLZXkoIXNob3dBcGlLZXkpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtNCB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgcC0xLjUgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby01MCByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICAgICAgICAgIHRpdGxlPXtzaG93QXBpS2V5ID8gXCLtgqQg7Iio6riw6riwXCIgOiBcIu2CpCDrs7TquLBcIn1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7c2hvd0FwaUtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNOS44OCA5Ljg4YTMgMyAwIDEgMCA0LjI0IDQuMjRcIi8+PHBhdGggZD1cIk0xMC43MyA1LjA4QTEwLjQzIDEwLjQzIDAgMCAxIDEyIDVjNyAwIDEwIDcgMTAgN2ExMy4xNiAxMy4xNiAwIDAgMS0xLjY3IDIuNjhcIi8+PHBhdGggZD1cIk02LjYxIDYuNjFBMTMuNTIgMTMuNTIgMCAwIDAgMiAxMnMzIDcgMTAgN2E5Ljc0IDkuNzQgMCAwIDAgNS4zOS0xLjYxXCIvPjxsaW5lIHgxPVwiMlwiIHgyPVwiMjJcIiB5MT1cIjJcIiB5Mj1cIjIyXCIvPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMiAxMnMzLTcgMTAtNyAxMCA3IDEwIDctMyA3LTEwIDctMTAtNy0xMC03WlwiLz48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIi8+PC9zdmc+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj7wn5O4IFVuc3BsYXNoIEFjY2VzcyBLZXk8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgICAgdHlwZT17c2hvd1Vuc3BsYXNoS2V5ID8gXCJ0ZXh0XCIgOiBcInBhc3N3b3JkXCJ9IFxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3Vuc3BsYXNoS2V5fSBcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4geyBzZXRVbnNwbGFzaEtleShlLnRhcmdldC52YWx1ZSk7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1bnNwbGFzaF9rZXknLCBlLnRhcmdldC52YWx1ZSk7IH19IFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCBwci0xMiByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpyaW5nLTQgZm9jdXM6cmluZy1pbmRpZ28tNTAwLzEwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBmb250LW1vbm8gdGV4dC1zbVwiIFxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJVbnNwbGFzaCDtgqTrpbwg7J6F66Cl7ZWY7IS47JqUXCIgXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93VW5zcGxhc2hLZXkoIXNob3dVbnNwbGFzaEtleSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBwLTEuNSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTUwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgdGl0bGU9e3Nob3dVbnNwbGFzaEtleSA/IFwi7YKkIOyIqOq4sOq4sFwiIDogXCLtgqQg67O06riwXCJ9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3Nob3dVbnNwbGFzaEtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNOS44OCA5Ljg4YTMgMyAwIDEgMCA0LjI0IDQuMjRcIi8+PHBhdGggZD1cIk0xMC43MyA1LjA4QTEwLjQzIDEwLjQzIDAgMCAxIDEyIDVjNyAwIDEwIDcgMTAgN2ExMy4xNiAxMy4xNiAwIDAgMS0xLjY3IDIuNjhcIi8+PHBhdGggZD1cIk02LjYxIDYuNjFBMTMuNTIgMTMuNTIgMCAwIDAgMiAxMnMzIDcgMTAgN2E5Ljc0IDkuNzQgMCAwIDAgNS4zOS0xLjYxXCIvPjxsaW5lIHgxPVwiMlwiIHgyPVwiMjJcIiB5MT1cIjJcIiB5Mj1cIjIyXCIvPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMiAxMnMzLTcgMTAtNyAxMCA3IDEwIDctMyA3LTEwIDctMTAtNy0xMC03WlwiLz48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIi8+PC9zdmc+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBiZy1pbmRpZ28tNTAgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1pbmRpZ28tMTAwIHNwYWNlLXktMyB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ibGFjayB0ZXh0LWluZGlnby02MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+8J+SviDsvZTri6Trpqwg67Cx7JeFIOq0gOumrDwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1pbmRpZ28tNDAwIGxlYWRpbmctcmVsYXhlZFwiPuyekeyXhSDspJHsl5Ag7L2U65Oc6rCAIOq8rOydtOuKlCDqsoPsnYQg67Cp7KeA7ZWY6riwIOychO2VtCDsoJXquLDsoIHsnLzroZwg67Cx7JeF67O47J2EIOyDneyEse2VmOyLreyLnOyYpC48L3A+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlRG93bmxvYWRCYWNrdXB9IGNsYXNzTmFtZT1cInctZnVsbCBweS0zIGJnLXdoaXRlIGhvdmVyOmJnLWluZGlnby0xMDAgdGV4dC1pbmRpZ28tNjAwIHJvdW5kZWQteGwgZm9udC1ib2xkIHRleHQtc20gc2hhZG93LXNtIGJvcmRlciBib3JkZXItaW5kaWdvLTIwMCB0cmFuc2l0aW9uLWFsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiPvCfk4Ig7ZiE7J6sIOuyhOyghCDsponsi5wg67Cx7JeFKOuLpOyatOuhnOuTnCk8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTQgYm9yZGVyLXQgYm9yZGVyLXNsYXRlLTEwMFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dlbWluaV9hcGlfa2V5JywgYXBpS2V5KTsgc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpOyB0cmlnZ2VyVG9hc3QoJ+uMgO2RnOuLmCwg7ISk7KCV7J20IOyggOyepeuQmOyXiOyKteuLiOuLpCEg8J+roScpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtODAwIHRleHQtd2hpdGUgcm91bmRlZC0yeGwgZm9udC1ib2xkIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7ISk7KCVIOyggOyepSDrsI8g7KCB7JqpPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7aXNBdXRoTW9kYWxPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctc20gdy1mdWxsIHNwYWNlLXktNiB0ZXh0LWNlbnRlciBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzQXV0aE1vZGFsT3BlbihmYWxzZSl9IGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTYgdG9wLTYgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgdHJhbnNpdGlvbi1hbGxcIj7inJU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTE2IGJnLWluZGlnby0xMDAgdGV4dC1pbmRpZ28tNjAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LTN4bCBteC1hdXRvIG1iLTJcIj7wn5SRPC9kaXY+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ibGFjayB0ZXh0LXNsYXRlLTgwMFwiPuuMgO2RnOuLmCDsnbjspp0g7ZWE7JqUIPCfq6E8L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXNsYXRlLTUwMFwiPuydtCDslbHsnYAg64yA7ZGc64uYIOyghOyaqeyeheuLiOuLpC48YnIvPuu5hOuwgCDsvZTrk5zrpbwg7J6F66Cl7ZW0IOyjvOyEuOyalC48L3A+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgdmFsdWU9e2F1dGhDb2RlfSBvbkNoYW5nZT17KGUpID0+IHNldEF1dGhDb2RlKGUudGFyZ2V0LnZhbHVlKX0gb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgaGFuZGxlTG9naW4oKX0gcGxhY2Vob2xkZXI9XCLsvZTrk5zrpbwg7J6F66Cl7ZWY7IS47JqUXCIgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXItMiBib3JkZXItc2xhdGUtMjAwIHRleHQtY2VudGVyIHRleHQtMnhsIGZvbnQtYmxhY2sgZm9jdXM6Ym9yZGVyLWluZGlnby01MDAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsXCIgLz5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlTG9naW59IGNsYXNzTmFtZT1cInctZnVsbCBweS00IGJnLWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTcwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtMnhsIGZvbnQtYmxhY2sgdGV4dC1sZyBzaGFkb3cteGwgdHJhbnNpdGlvbi1hbGxcIj7snbjspp3tlZjquLA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7Lyog8J+UlCDrqoXtkogg7Yag7Iqk7Yq4IOyVjOumvCDsu7Ttj6zrhIztirggKi99XG4gICAgICB7c2hvd1RvYXN0ICYmIChcbiAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgIGJvdHRvbTogJzQwcHgnLFxuICAgICAgICAgIGxlZnQ6ICc1MCUnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoLTUwJSknLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC44NSknLFxuICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDI0cHgnLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwcHgnLFxuICAgICAgICAgIHpJbmRleDogMTAwMDAsXG4gICAgICAgICAgZm9udFNpemU6ICcwLjk1cmVtJyxcbiAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJyxcbiAgICAgICAgICBib3hTaGFkb3c6ICcwIDhweCAzMnB4IHJnYmEoMCwwLDAsMC4zKScsXG4gICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKScsXG4gICAgICAgICAgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDhweCknLFxuICAgICAgICAgIGFuaW1hdGlvbjogJ2ZhZGVJbk91dCAyLjVzIGVhc2UtaW4tb3V0IGZvcndhcmRzJyxcbiAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgZ2FwOiAnOHB4J1xuICAgICAgICB9fT5cbiAgICAgICAgICB7dG9hc3R9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAgPHN0eWxlPntgXG4gICAgICAgIEBrZXlmcmFtZXMgZmFkZUluT3V0IHtcbiAgICAgICAgICAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDIwcHgpOyB9XG4gICAgICAgICAgMTUlIHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgMCk7IH1cbiAgICAgICAgICA4NSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTsgfVxuICAgICAgICAgIDEwMCUgeyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtMTBweCk7IH1cbiAgICAgICAgfVxuICAgICAgYH08L3N0eWxlPlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iXX0=