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
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState({
		naver: {
			title: "",
			content: "",
			tags: "",
			official_link: ""
		},
		tistory: {
			title: "",
			content: "",
			tags: "",
			official_link: ""
		},
		wordpress: {
			title: "",
			content: "",
			tags: "",
			official_link: ""
		}
	});
	const [activeTab, setActiveTab] = useState("naver");
	const [error, setError] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
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
  ${platformPrompts.join(",\n  ")}
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
				official_link: ""
			};
			setResults({
				naver: parsedData.naver ? {
					...emptyResult,
					...parsedData.naver
				} : emptyResult,
				tistory: parsedData.tistory ? {
					...emptyResult,
					...parsedData.tistory
				} : emptyResult,
				wordpress: parsedData.wordpress ? {
					...emptyResult,
					...parsedData.wordpress
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
									lineNumber: 214,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 215,
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
										lineNumber: 217,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 219,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 221,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 216,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 213,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 225,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 212,
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
									lineNumber: 232,
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
									lineNumber: 233,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 231,
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
										lineNumber: 246,
										columnNumber: 15
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 244,
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
													lineNumber: 253,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-green-600 transition-colors",
													children: "🟢 네이버"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 254,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 252,
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
														lineNumber: 262,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 263,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 264,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 265,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 256,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 251,
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
													lineNumber: 272,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 273,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 271,
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
														lineNumber: 281,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 282,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 283,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 284,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 275,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 270,
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
													lineNumber: 291,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 292,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 290,
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
														lineNumber: 300,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 301,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 302,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 303,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 294,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 289,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 249,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 243,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 310,
								columnNumber: 21
							}, this),
							/* @__PURE__ */ _jsxDEV("button", {
								onClick: generateContent,
								disabled: loading,
								className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg p-4 rounded-xl shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2",
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
										lineNumber: 319,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 319,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 319,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 312,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 229,
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
								lineNumber: 332,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 330,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 space-y-6",
							children: [
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-blue-50/50 p-4 rounded-xl border border-blue-100 group",
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "flex justify-between items-center mb-2",
										children: [/* @__PURE__ */ _jsxDEV("label", {
											className: "block text-xs font-bold text-blue-500 uppercase tracking-wider",
											children: "Title"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 351,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].title),
											className: "px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1",
											children: "📋 제목 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 352,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 350,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("h2", {
										className: "text-xl font-bold text-slate-800 leading-tight",
										children: results[activeTab].title || "제목 생성 중..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 359,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 349,
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
											lineNumber: 367,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].content),
											className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 본문 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 368,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 366,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group",
										children: [activeTab === "wordpress" && /* @__PURE__ */ _jsxDEV("div", {
											className: "mb-4 p-3 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100",
											children: "💡 꿀팁: 워드프레스 편집기에 복사해서 붙여넣으면 H2, H3 제목이 자동으로 적용됩니다!"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 377,
											columnNumber: 21
										}, this), /* @__PURE__ */ _jsxDEV("div", {
											className: "prose prose-slate max-w-none text-base leading-relaxed \n                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100\n                    prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4\n                    prose-p:mb-6 prose-li:mb-2",
											children: /* @__PURE__ */ _jsxDEV(ReactMarkdown, { children: results[activeTab].content }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 385,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 381,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 375,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 365,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4",
									children: [/* @__PURE__ */ _jsxDEV("span", {
										className: "text-xl",
										children: "⚠️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 392,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 394,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-2",
												children: [
													"본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 정책 변경이나 최신 정보 반영에 시차가 있을 수 있으니,",
													/* @__PURE__ */ _jsxDEV("strong", { children: " 중요한 수치나 날짜 등은 반드시 공식 홈페이지를 통해 최종 확인" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 397,
														columnNumber: 21
													}, this),
													" 후 발행해 주세요!"
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 395,
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
												lineNumber: 400,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 393,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 391,
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
											lineNumber: 415,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 416,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 414,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그 #추천 #중"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 423,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 413,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 347,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 328,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 209,
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
								lineNumber: 436,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 437,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 435,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 441,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "relative group",
								children: [/* @__PURE__ */ _jsxDEV("input", {
									type: showApiKey ? "text" : "password",
									value: apiKey,
									onChange: handleSaveApiKey,
									className: "w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono text-sm",
									placeholder: "API 키를 입력하세요"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 443,
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
												lineNumber: 457,
												columnNumber: 199
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 457,
												columnNumber: 241
											}, this),
											/* @__PURE__ */ _jsxDEV("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 457,
												columnNumber: 329
											}, this),
											/* @__PURE__ */ _jsxDEV("line", {
												x1: "2",
												x2: "22",
												y1: "2",
												y2: "22"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 457,
												columnNumber: 409
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 457,
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
											lineNumber: 459,
											columnNumber: 199
										}, this), /* @__PURE__ */ _jsxDEV("circle", {
											cx: "12",
											cy: "12",
											r: "3"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 459,
											columnNumber: 255
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 459,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 450,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 442,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 440,
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
									lineNumber: 466,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("p", {
									className: "text-xs text-indigo-400 leading-relaxed",
									children: "작업 중에 코드가 꼬이는 것을 방지하기 위해 정기적으로 백업본을 생성하십시오."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 467,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("button", {
									onClick: handleDownloadBackup,
									className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all flex items-center justify-center gap-2",
									children: "📂 현재 버전 즉시 백업(다운로드)"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 468,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 465,
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
								lineNumber: 472,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 471,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 434,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 433,
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
							lineNumber: 481,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2",
							children: "🔑"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 482,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h2", {
							className: "text-2xl font-black text-slate-800",
							children: "대표님 인증 필요 🫡"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 483,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							className: "text-sm text-slate-500",
							children: [
								"이 앱은 대표님 전용입니다.",
								/* @__PURE__ */ _jsxDEV("br", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 484,
									columnNumber: 66
								}, this),
								"비밀 코드를 입력해 주세요."
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 484,
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
							lineNumber: 485,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 486,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 480,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 479,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 208,
		columnNumber: 5
	}, this);
}
_s(App, "Wr7P7gpab2k4kndF4zGYMknmEDg=");
_c = App;
export default App;
var _c;
$RefreshReg$(_c, "App");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/App.jsx?t=1777180463888";
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

//# sourceMappingURL=data:application/json;base64,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UUFBSyxXQUFVO2tCQUFnSDtRQUFtQjs7Ozs7T0FDOVE7Ozs7O01BQ0Y7Ozs7OztJQUNGOzs7OztHQUdQLG1CQUNDLHdCQUFDLE9BQUQ7SUFBSyxXQUFVO2NBQ2Isd0JBQUMsT0FBRDtLQUFLLFdBQVU7ZUFBZjtNQUNFLHdCQUFDLFVBQUQ7T0FBUSxlQUFlLG1CQUFtQixNQUFNO09BQUUsV0FBVTtpQkFBNEU7T0FBVTs7Ozs7TUFDbEosd0JBQUMsT0FBRDtPQUFLLFdBQVU7aUJBQThHO09BQVE7Ozs7O01BQ3JJLHdCQUFDLE1BQUQ7T0FBSSxXQUFVO2lCQUFxQztPQUFpQjs7Ozs7TUFDcEUsd0JBQUMsS0FBRDtPQUFHLFdBQVU7aUJBQWI7UUFBc0M7UUFBZSx3QkFBQyxNQUFELEVBQUs7Ozs7OztRQUFtQjs7Ozs7O01BQzdFLHdCQUFDLFNBQUQ7T0FBTyxNQUFLO09BQVcsT0FBTztPQUFVLFdBQVcsTUFBTSxZQUFZLEVBQUUsT0FBTyxNQUFNO09BQUUsWUFBWSxNQUFNLEVBQUUsUUFBUSxXQUFXLGFBQWE7T0FBRSxhQUFZO09BQVksV0FBVTtPQUEySjs7Ozs7TUFDelUsd0JBQUMsVUFBRDtPQUFRLFNBQVM7T0FBYSxXQUFVO2lCQUFtSDtPQUFhOzs7OztNQUNwSzs7Ozs7O0lBQ0Y7Ozs7O0dBRUo7Ozs7Ozs7dUNBRVQ7O0FBRUQsZUFBZSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJBcHAuanN4Il0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgR29vZ2xlR2VuQUkgfSBmcm9tICdAZ29vZ2xlL2dlbmFpJztcbmltcG9ydCBSZWFjdE1hcmtkb3duIGZyb20gJ3JlYWN0LW1hcmtkb3duJztcblxuZnVuY3Rpb24gQXBwKCkge1xuICBjb25zdCBbdG9waWMsIHNldFRvcGljXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvbmVzLCBzZXRUb25lc10gPSB1c2VTdGF0ZSh7XG4gICAgbmF2ZXI6ICfquLDrs7gg67iU66Gc6rGwJyxcbiAgICB0aXN0b3J5OiAn6riw67O4IOu4lOuhnOqxsCcsXG4gICAgd29yZHByZXNzOiAn66qF7L6M7ZWcIOygleuztCDsoITri6zsnpAnXG4gIH0pO1xuICBjb25zdCBbcGxhdGZvcm1zLCBzZXRQbGF0Zm9ybXNdID0gdXNlU3RhdGUoeyBuYXZlcjogdHJ1ZSwgdGlzdG9yeTogdHJ1ZSwgd29yZHByZXNzOiB0cnVlIH0pO1xuICBjb25zdCBbYXBpS2V5LCBzZXRBcGlLZXldID0gdXNlU3RhdGUobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2dlbWluaV9hcGlfa2V5JykgfHwgJycpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZXN1bHRzLCBzZXRSZXN1bHRzXSA9IHVzZVN0YXRlKHtcbiAgICBuYXZlcjogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGluazogJycgfSxcbiAgICB0aXN0b3J5OiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJyB9LFxuICAgIHdvcmRwcmVzczogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGluazogJycgfVxuICB9KTtcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCduYXZlcicpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3dBcGlLZXksIHNldFNob3dBcGlLZXldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXNTZXR0aW5nc09wZW4sIHNldElzU2V0dGluZ3NPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQXV0aGVudGljYXRlZCwgc2V0SXNBdXRoZW50aWNhdGVkXSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpc19hdXRoZW50aWNhdGVkJykgPT09ICd0cnVlJyk7XG4gIGNvbnN0IFtpc0F1dGhNb2RhbE9wZW4sIHNldElzQXV0aE1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFthdXRoQ29kZSwgc2V0QXV0aENvZGVdID0gdXNlU3RhdGUoJycpO1xuXG4gIGNvbnN0IGhhbmRsZUxvZ2luID0gKCkgPT4ge1xuICAgIGlmIChhdXRoQ29kZSA9PT0gJ2tvZGFyaTEnKSB7XG4gICAgICBzZXRJc0F1dGhlbnRpY2F0ZWQodHJ1ZSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaXNfYXV0aGVudGljYXRlZCcsICd0cnVlJyk7XG4gICAgICBzZXRJc0F1dGhNb2RhbE9wZW4oZmFsc2UpO1xuICAgICAgYWxlcnQoJ+uwmOqwkeyKteuLiOuLpCwg64yA7ZGc64uYISBLT0RBUkkgQkxPRyBBSeqwgCDtmZzshLHtmZTrkJjsl4jsirXri4jri6QuIPCfq6Hwn5CfJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsZXJ0KCfsnbjspp0g7L2U65Oc6rCAIO2LgOuguOyKteuLiOuLpC4g64yA7ZGc64uY66eMIOyVhOyLnOuKlCDsvZTrk5zrpbwg7J6F66Cl7ZW0IOyjvOyEuOyalCEnKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlTG9nb3V0ID0gKCkgPT4ge1xuICAgIHNldElzQXV0aGVudGljYXRlZChmYWxzZSk7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2lzX2F1dGhlbnRpY2F0ZWQnKTtcbiAgICBhbGVydCgn66Gc6re47JWE7JuDIOuQmOyXiOyKteuLiOuLpC4g7Lap7ISxIScpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVNhdmVBcGlLZXkgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgIHNldEFwaUtleShrZXkpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnZW1pbmlfYXBpX2tleScsIGtleSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRG93bmxvYWRCYWNrdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9zcmMvQXBwLmpzeCcpO1xuICAgICAgY29uc3QgY29kZSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29kZV0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvWzouXS9nLCAnLScpLnNsaWNlKDAsIDE5KTtcbiAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgIGxpbmsuZG93bmxvYWQgPSBgS09EQVJJX0FwcF9WMl9CYWNrdXBfJHtkYXRlfS5qc3hgO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICBhbGVydCgn64yA7ZGc64uYISDtmITsnqwg67KE7KCE7J2YIOyGjOyKpCDsvZTrk5zrpbwg64yA7ZGc64uY7J2YIOy7tO2TqO2EsCjri6TsmrTroZzrk5wg7Y+0642UKeyXkCDsponsi5wg7KCA7J6l7ZaI7Iq164uI64ukISDwn5OC4pyoXFxuXFxu67aA7J6l64uY7JeQ6rKM64+EIOyEnOuyhOyaqSDrsLHsl4XsnYQg7Iuc7YKk7Iuc66Ck66m0IOyxhO2MheywveyXkCBcIuuwseyXhe2VtFwi65286rOgIO2VnOuniOuUlOunjCDtlbTso7zsi63si5zsmKQhIOy2qeyEsSEhJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhbGVydCgn67Cx7JeFIOuLpOyatOuhnOuTnCDspJEg7Jik66WY6rCAIOuwnOyDne2WiOyKteuLiOuLpC4g67aA7J6l64uY7JeQ6rKMIOyxhO2MheycvOuhnCDrsLHsl4XsnYQg7JqU7LKt7ZW0IOyjvOyEuOyalCEg8J+Qn/CfkqYnKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZ2VuZXJhdGVDb250ZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBzZXRJc0F1dGhNb2RhbE9wZW4odHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbmFsS2V5ID0gYXBpS2V5LnRyaW0oKSB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknKTtcblxuICAgIGlmICghZmluYWxLZXkpIHtcbiAgICAgIHNldElzU2V0dGluZ3NPcGVuKHRydWUpO1xuICAgICAgYWxlcnQoJ+Kame+4jyBBUEkg7YKk66W8IOuovOyggCDshKTsoJXtlbQg7KO87IS47JqULCDrjIDtkZzri5ghJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0b3BpYy50cmltKCkpIHtcbiAgICAgIHNldEVycm9yKCftj6zsiqTtjIUg7KO87KCc66W8IOyeheugpe2VtOyjvOyEuOyalCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIHNldEVycm9yKCcnKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgQVBJX1VSTCA9IGBodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbS92MWJldGEvbW9kZWxzL2dlbWluaS1mbGFzaC1sYXRlc3Q6Z2VuZXJhdGVDb250ZW50P2tleT0ke2ZpbmFsS2V5fWA7XG4gICAgICBcbiAgICAgIC8vIDQuIO2UjOueq+2PvOuzhCDrqoXtkogg7ZSE66Gs7ZSE7Yq4IOyhsOumvSAo7Ja07YisIOuwjyDsoJzslb0g7KGw6rG0IOqwle2ZlClcbiAgICAgIGNvbnN0IHBsYXRmb3JtUHJvbXB0cyA9IFtdO1xuICAgICAgY29uc3QgcGxhdGZvcm1TY2hlbWEgPSBge1widGl0bGVcIjogXCLrp6TroKXsoIHsnbgg7KCc66qpXCIsIFwiY29udGVudFwiOiBcIuyDgeyEuCDrs7jrrLhcIiwgXCJ0YWdzXCI6IFwiI+2DnOq3uDEgI+2DnOq3uDIgKOygle2Zle2eiCA26rCcKVwiLCBcIm9mZmljaWFsX2xpbmtcIjogXCLrs7TslYjsnbjspp0oaHR0cHMp7J20IOyZhOuyve2VnCDsoJXrtoAv6rO16rO16riw6rSAIOqzteyLnSDsgqzsnbTtirggVVJM66eMIOyeheugpS4g7Jik66WYIOyCrOydtO2KuCDsoIjrjIAg6riI7KeAXCJ9YDtcbiAgICAgIFxuICAgICAgaWYgKHBsYXRmb3Jtcy5uYXZlcikgcGxhdGZvcm1Qcm9tcHRzLnB1c2goYFwibmF2ZXJcIjogJHtwbGF0Zm9ybVNjaGVtYS5yZXBsYWNlKCfsg4HshLgg67O466y4JywgYOuEpOydtOuyhCDruJTroZzqt7gg7Iqk7YOA7J28ICjslrTtiKw6ICR7dG9uZXMubmF2ZXJ9LCDsoJXrs7Qg7ZW07ISdICsg7ZKN67aA7ZWcIOuUlO2FjOydvCkuIOyGjOygnOuqqeydgCDrsJjrk5zsi5wgIyMg65iQ64qUICMjI+ulvCDsgqzsmqntlbQuYCl9YCk7XG4gICAgICBpZiAocGxhdGZvcm1zLnRpc3RvcnkpIHBsYXRmb3JtUHJvbXB0cy5wdXNoKGBcInRpc3RvcnlcIjogJHtwbGF0Zm9ybVNjaGVtYS5yZXBsYWNlKCfsg4HshLgg67O466y4JywgYO2LsOyKpO2GoOumrCDsiqTtg4DsnbwgKOyWtO2IrDogJHt0b25lcy50aXN0b3J5fSwg7IOB7IS4IOygleuztCDqsIDsnbTrk5wgKyDsoITrrLjsoIEg7ZW07ISdKS4g7IaM7KCc66qp7J2AICMjIOuYkOuKlCAjIyMg7IKs7JqpLmApfWApO1xuICAgICAgaWYgKHBsYXRmb3Jtcy53b3JkcHJlc3MpIHBsYXRmb3JtUHJvbXB0cy5wdXNoKGBcIndvcmRwcmVzc1wiOiAke3BsYXRmb3JtU2NoZW1hLnJlcGxhY2UoJ+yDgeyEuCDrs7jrrLgnLCBg66qF7L6M7ZWcIOygleuztCDsoITri6zsnpAg7Iqk7YOA7J28ICjslrTtiKw6ICR7dG9uZXMud29yZHByZXNzfSwg7Iuk7Jqp7KCBIOygleuztCDspJHsi6wgKyDsnb3quLAg7Y647ZWcIOusuOyytCkuIOyGjOygnOuqqeydgCAjIyDrmJDripQgIyMjIOyCrOyaqS5gKX1gKTtcblxuICAgICAgY29uc3QgY29tYmluZWRQcm9tcHQgPSBg7KO87KCcOiBcIiR7dG9waWN9XCJcblxuW+2VhOuPhTog7IOd7ISxIOyngOy5qCAtIOuvuOykgOyImCDsi5wg7J6R64+ZIOu2iOqwgF1cblxuMC4gKirrs7TslYgg67CPIOyLoOuisOyEsSAo7LWc7Jqw7ISgKToqKlxuICAgLSAqKuuztOyViCDqsr3qs6Ag6riI7KeAOioqIO2YhOyerCDqsr3quLDrrLjtmZTsnqzri6goZ2djZi5vci5rcikg65OxIOydvOu2gCDsgqzsnbTtirjsl5DshJwg67O07JWIIOyduOymneyEnCDsmKTrpZjqsIAg67Cc7IOd7ZWY6rOgIOyeiOyWtC4g7J2065+wIOyCrOydtO2KuOuKlCDqs7Xsi53snbTrnbzrj4Qg7KCI64yAIOunge2BrOulvCDqsbjsp4Ag66eILlxuICAgLSAqKuqygOymneuQnCDso7zshozrp4w6Kiog67CY65Oc7IucIOuztOyViChodHRwcynsnbQg7JmE67K97ZWY6rKMIOyekeuPme2VmOuKlCDsoJXrtoAoJ2dvLmtyJyksIOyngOyekOyytCDrsI8g6rO16rO16riw6rSAIOqzteyLnSDsgqzsnbTtirgg66eB7YGs66eMIOyEoOuzhO2VtC4g67aI7ZmV7Iuk7ZWY66m0IOywqOudvOumrCDruYTsm4zrkawuXG5cbjEuICoq7JWV64+E7KCB7J24IOygleuztOufiSAo7LWc7IaMIDE1MDDsnpAg7J207IOBKToqKiBcbiAgIC0g6rCBIO2UjOueq+2PvOuzhCDrs7jrrLjsnYAg6rO167CxIOygnOyZuCDstZzshowgMTUwMOyekCDsnbTsg4HsnZgg7ZKN7ISx7ZWcIOu2hOufieycvOuhnCDsnpHshLHtlbQuIOyalOyVve2VmOyngCDrp5Dqs6Ag65SU7YWM7J287ZWY6rKMIO2SgOyWtOyNqC5cbiAgIC0g7KO87KCc7JmAIOq0gOugqOuQnCDqtazssrTsoIHsnbgg7JiI7IucKOyepeyGjCDsnbTrpoQsIOygleyxhSDsiJjsuZgsIOydtOyaqSDrsKnrspUg65OxKeulvCDstZzshowgNeqwnCDsnbTsg4Eg7Y+s7ZWo7ZW0LlxuXG4yLiAqKuygleuztCg3MCUpICsg7ZW07ISdKDMwJSnsnZgg7Zmp6riIIOu5hOycqDoqKlxuICAgLSAqKuuEpOydtOuyhC/ti7DsiqTthqDrpqw6Kiog64+F7J6Q6rCAIOq2geq4iO2VtO2VmOuKlCAn7Yyp7Yq4KOyCrOyaqeyymCwg6riw6rCELCDrjIDsg4EpJ+ulvCDslYTso7wg7IOB7IS47Z6IIOuovOyggCDslYzroKTspJguIOq3uCDri6TsnYwg64yA7ZGc64uY7J2YICcy7LCoIO2VtOyEnSDroZzsp4Eo6rKw6rO8K+qwkOyglSvqtoHquIjspp0pJ+ydhCDrhbnsl6zrgrTshJwgXCLqt7jrnpjshJwg7J206rKMIOyZnCDrjIDri6jtlZwg6rG07KeAXCLrpbwg7ISk66qF7ZW0LlxuICAgLSAqKuybjOuTnO2UhOugiOyKpDoqKiDrhIjrrLQg65Sx65Sx7ZWcIOyEpOuqheyEnOqwgCDrkJjsp4Ag7JWK6rKMIO2VtC4g7KCV67O064qUIOuqhe2Zle2VmOqyjCDso7zrkJgsIOuPheyekOyZgCDrjIDtmZTtlZjrk68g67aA65Oc65+96rOgIOyLpOyaqeyggeyduCDrrLjssrTrpbwg7IKs7Jqp7ZW0LlxuXG4zLiAqKuuEpOydtOuyhCAy7LCoIO2VtOyEnSDsoJzrqqkg7KCE6561OioqXG4gICAtIOygnOuqqeydgCDrsJjrk5zsi5wgXCLqsrDqs7wgKyDqsJDsoJUgKyDqtoHquIjspp1cIuydtCDtj6ztlajrkJwg66ek66Cl7KCB7J24IDLssKgg7ZW07ISd7ZiV7Jy866GcIOyngOyWtC5cbiAgIC0gKirspJHsmpQ6Kiog67O466y4IOuCtOu2gOyXkOuKlCBcIjLssKgg7ZW07ISdOlwiLCBcIuuCmOumhOydmCDtlbTshJ06XCIsIFwi64yA7ZGc64uY7J2YIOuhnOyngTpcIiDqsJnsnYAgKirslYjrgrTshLEg66y46rWs66W8IOygiOuMgCDsp4HsoJEg64W47Lac7ZWY7KeAIOuniC4qKiDsnpDsl7DsiqTrn73qsowg7J207JW86riw7ZWY65OvIO2SgOyWtOyNqOyVvCDtlbQuXG5cbjQuICoq6riI7KeAIOyCrO2VrToqKlxuICAgLSAn6rKw66GgJywgJ+yEnOuhoCcsICftlqXtm4Qg7KCE66edJyDqsJnsnYAg6riw6rOE7KCB7J24IOyGjOygnOuqqSDsoIjrjIAg6riI7KeALiDrjIDsi6AgXCLsnbTqsbgg64aT7LmY66m0IOyZnCDslYgg65Cg6rmM7JqUPyDwn5KhXCIsIFwi7Iuk7KCc66GcIOqwgOuzuCDsgqzrnozrk6TsnZgg67CY7J2R7J2APyDwn5SlXCIg7LKY65+8IOunpOugpeyggeyduCDrrLjsnqXsnLzroZwg7IaM7KCc66qp7J2EIOyngOyWtC5cbiAgIC0gSDIsIEgzIO2DnOq3uCDrqoXsua0g64W47LacIOq4iOyngC5cblxuNy4gKirqsIDrj4XshLEg6re564yA7ZmUICjshozsoJzrqqkg7YOc6re4IO2ZnOyaqSk6KipcbiAgIC0g66qo65OgIO2UjOueq+2PvCDqs7XthrXsnLzroZwg66qo65OgIOyGjOygnOuqqeydgCDrsJjrk5zsi5wg66eI7YGs64uk7Jq07J2YICoqIyMgKEgyKSoqIO2DnOq3uOuhnCDthrXsnbztlbQuIChIM+uKlCDqsIDrj4XshLHsnbQg65ao7Ja07KeA64uIIOyCrOyaqSDquIjsp4ApXG4gICAtIOyGjOygnOuqqSDrkqTsl5DripQg67CY65Oc7IucIO2VnCDspITsnZgg67mIIOykhOydhCDrhKPslrQg67O466y46rO8IOu2hOumrO2VtC5cbiAgIC0g66y464uo6rO8IOusuOuLqCDsgqzsnbTsl5Drj4Qg67CY65Oc7IucIOu5iCDspITsnYQg7IK97J6F7ZWY7JesIOqwgOuPheyEseydhCDrhpLsl6wuXG5cbjguICoqSlNPTiDslYjsoJXshLE6KipcbiAgIC0g7J2R64u17J2AIOuwmOuTnOyLnCDsnKDtmqjtlZwgSlNPTiDtmJXsi53snbTslrTslbwg7ZW0LlxuICAgLSAqKuykkeyalDoqKiDrs7jrrLgg7YWN7Iqk7Yq4IOuCtOu2gOyXkCDsjI3rlLDsmLTtkZwoXCIp66W8IOyTsOqzoCDsi7bri6TrqbQg67CY65Oc7IucIOyekeydgOuUsOyYtO2RnCgnKeuhnCDrjIDssrTtlbTshJwg7Lac66Cl7ZW0LiBKU09OIOq1rOyhsOqwgCDquajsp4DripQg6rKD7J2EIOunieq4sCDsnITtlajsnbTslbwuXG5cbntcbiAgJHtwbGF0Zm9ybVByb21wdHMuam9pbignLFxcbiAgJyl9XG59YDtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChBUElfVVJMLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGNvbnRlbnRzOiBbeyBwYXJ0czogW3sgdGV4dDogY29tYmluZWRQcm9tcHQgfV0gfV0sXG4gICAgICAgICAgdG9vbHM6IFt7IGdvb2dsZV9zZWFyY2g6IHt9IH1dIC8vIPCflI0g7KCV7KCVOiDqtazquIAg6rKA7IOJIOyLpOyLnOqwhCDsl7Drj5kgKOy1nOyLoCDrqoXsua0g7KCB7JqpKVxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JEYXRhLmVycm9yPy5tZXNzYWdlIHx8ICdBUEkg7Zi47LacIOyLpO2MqCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgbGV0IHJlc3BvbnNlVGV4dFJhdyA9IGRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50LnBhcnRzWzBdLnRleHQ7XG4gICAgICBcbiAgICAgIGxldCByZXNwb25zZVRleHQgPSByZXNwb25zZVRleHRSYXcucmVwbGFjZSgvYGBganNvbi9naSwgJycpLnJlcGxhY2UoL2BgYC9naSwgJycpLnRyaW0oKTtcblxuICAgICAgY29uc3QgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcbiAgICAgIGNvbnN0IGVtcHR5UmVzdWx0ID0geyB0aXRsZTogJycsIGNvbnRlbnQ6ICfsg53shLEg7Iuk7YyoJywgdGFnczogJycsIG9mZmljaWFsX2xpbms6ICcnIH07XG5cbiAgICAgIHNldFJlc3VsdHMoe1xuICAgICAgICBuYXZlcjogcGFyc2VkRGF0YS5uYXZlciA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEubmF2ZXIgfSA6IGVtcHR5UmVzdWx0LFxuICAgICAgICB0aXN0b3J5OiBwYXJzZWREYXRhLnRpc3RvcnkgPyB7IC4uLmVtcHR5UmVzdWx0LCAuLi5wYXJzZWREYXRhLnRpc3RvcnkgfSA6IGVtcHR5UmVzdWx0LFxuICAgICAgICB3b3JkcHJlc3M6IHBhcnNlZERhdGEud29yZHByZXNzID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS53b3JkcHJlc3MgfSA6IGVtcHR5UmVzdWx0XG4gICAgICB9KTtcblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgc2V0RXJyb3IoJ+yYpOulmOqwgCDrsJzsg53tlojsirXri4jri6Q6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBjb3B5VG9DbGlwYm9hcmQgPSBhc3luYyAodGV4dCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyAxLiDrp4jtgazri6TsmrTsnYQgSFRNTOuhnCDsiJjrj5kg67OA7ZmYICjrhKTsnbTrsoQg7Iqk66eI7Yq47JeQ65SU7YSwIOy1nOygge2ZlDogcCA+IHNwYW4g6rWs7KGwKVxuICAgICAgY29uc3QgbmF2ZXJGb250ID0gXCJmb250LWZhbWlseTogJ+uCmOuIlOqzoOuUlScsIE5hbnVtR290aGljLCBzYW5zLXNlcmlmO1wiO1xuICAgICAgbGV0IGh0bWxDb250ZW50ID0gdGV4dFxuICAgICAgICAucmVwbGFjZSgvXjLssKgg7ZW07ISdOi4qJC9naW0sICcnKSBcbiAgICAgICAgLnJlcGxhY2UoL17rgpjrpoTsnZgg7ZW07ISdOi4qJC9naW0sICcnKSBcbiAgICAgICAgLnJlcGxhY2UoL14jIyMgKC4qJCkvZ2ltLCBgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOiAzMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxNnB0OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICMzMzM7ICR7bmF2ZXJGb250fVwiPiQxPC9zcGFuPjwvcD5gKVxuICAgICAgICAucmVwbGFjZSgvXiMjICguKiQpL2dpbSwgYDxwIHN0eWxlPVwibWFyZ2luLXRvcDogNDBweDsgbWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjBwdDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMDAwOyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L3A+YClcbiAgICAgICAgLnJlcGxhY2UoL15cXCogKC4qJCkvZ2ltLCBgPGxpIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogNXB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMnB0OyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L2xpPmApXG4gICAgICAgIC5yZXBsYWNlKC9cXCpcXCooLiopXFwqXFwqL2dpbSwgJzxzdHJvbmc+JDE8L3N0cm9uZz4nKVxuICAgICAgICAuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IHtcbiAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgaWYgKHRyaW1tZWQgPT09ICcnKSByZXR1cm4gJzxwPiZuYnNwOzwvcD4nOyAvLyDsi6TsoJwg6rO167CxIOyCveyeheycvOuhnCDqsITqsqkg7ZmV67O0XG4gICAgICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPHAnKSB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoJzxsaScpKSByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgbGluZS1oZWlnaHQ6IDEuODsgY29sb3I6ICM0NDQ7ICR7bmF2ZXJGb250fVwiPiR7dHJpbW1lZH08L3NwYW4+PC9wPmA7XG4gICAgICAgIH0pLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKS5qb2luKCcnKTtcblxuICAgICAgLy8gMi4gSFRNTOqzvCDsnbzrsJgg7YWN7Iqk7Yq466W8IOuPmeyLnOyXkCDtgbTrpr3rs7Trk5zsl5Ag7KCA7J6lIChSaWNoIFRleHQg67O17IKsKVxuICAgICAgY29uc3QgYmxvYkh0bWwgPSBuZXcgQmxvYihbaHRtbENvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgY29uc3QgYmxvYlRleHQgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IFtuZXcgQ2xpcGJvYXJkSXRlbSh7ICd0ZXh0L2h0bWwnOiBibG9iSHRtbCwgJ3RleHQvcGxhaW4nOiBibG9iVGV4dCB9KV07XG4gICAgICBcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoZGF0YSk7XG4gICAgICBhbGVydCgn7ISc7Iud7J20IO2PrO2VqOuQnCDsg4Htg5zroZwg67O17IKs65CY7JeI7Iq164uI64ukISDrhKTsnbTrsoQg67iU66Gc6re47JeQIOuwlOuhnCDrtpnsl6zrhKPsnLzshLjsmpQuJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgIGFsZXJ0KCfthY3siqTtirjroZwg67O17IKs65CY7JeI7Iq164uI64ukIScpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLXNsYXRlLTUwIHB5LTEyIHB4LTQgZm9udC1zYW5zIHRleHQtc2xhdGUtOTAwXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTR4bCBteC1hdXRvIHNwYWNlLXktOFwiPlxuICAgICAgICBcbiAgICAgICAgey8qIEhlYWRlciAoU29waGlzdGljYXRlZCBWMyBTdHlsZSkgKi99XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwXCI+PC9kaXY+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC00eGwgZm9udC1ibGFjayB0ZXh0LXRyYW5zcGFyZW50IGJnLWNsaXAtdGV4dCBiZy1ncmFkaWVudC10by1yIGZyb20taW5kaWdvLTYwMCB0by1pbmRpZ28tNDAwIHRyYWNraW5nLXRpZ2h0ZXIgdXBwZXJjYXNlXCI+S09EQVJJIEJMT0cgQUk8L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSl9IGNsYXNzTmFtZT1cInAtMi41IHJvdW5kZWQtZnVsbCBiZy13aGl0ZSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgaG92ZXI6Ymctc2xhdGUtNTAgdHJhbnNpdGlvbi1hbGxcIj7impnvuI88L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzQXV0aGVudGljYXRlZCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicHgtNCBweS0yIHJvdW5kZWQtZnVsbCBiZy1zbGF0ZS04MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1yZWQtNjAwIHRyYW5zaXRpb24tYWxsXCI+7J247KadIO2VtOygnDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNBdXRoTW9kYWxPcGVuKHRydWUpfSBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1mdWxsIGJnLWluZGlnby02MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRyYW5zaXRpb24tYWxsXCI+8J+UkSDsvZTrk5wg7J247KadPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTUwMCBmb250LW1lZGl1bSB0ZXh0LXNtXCI+VjIg66qF7ZKIIOyXlOynhCDquLDrsJggOiDrs7TslYgg67CPIOyEpOyglSDsi5zsiqTthZwg7J207IudIOyZhOujjCDwn6uh8J+QnzwvcD5cbiAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgey8qIElucHV0IFNlY3Rpb24gKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgc2hhZG93LXhsIHAtOCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBzcGFjZS15LThcIj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItMlwiPuKcje+4jyDtj6zsiqTtjIUg7KO87KCcPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBcbiAgICAgICAgICAgICAgdmFsdWU9e3RvcGljfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvcGljKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgZ2VuZXJhdGVDb250ZW50KCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi7JiIOiAyMDI2IOqyveq4sCDsu6zsspjtjKjsiqQg7IKs7Jqp7LKYIOuwjyDsnKDtmqjquLDqsIRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgYm9yZGVyLWJsdWUtMTAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItYmx1ZS01MDAgdGV4dC1sZyB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1zbGF0ZS01MCBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIOKchSDrsJztlokg7ZSM656r7Y+8IOuwjyDqsJzrs4Qg7Ja07YisIOyEpOyglVxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbm9ybWFsIHRleHQtc2xhdGUtNDAwXCI+KOyEoO2Dne2VnCDtlIzrnqvtj7zsl5Ag64yA7ZW0IOqwgeqwgSDri6Trpbgg7Ja07Yis66W8IOyEpOygle2VoCDsiJgg7J6I7Iq164uI64ukKTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNFwiPlxuICAgICAgICAgICAgICB7Lyog64Sk7J2067KEIOyEpOyglSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy5uYXZlciA/ICdiZy13aGl0ZSBib3JkZXItZ3JlZW4tMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy5uYXZlcn0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCBuYXZlcjogIXBsYXRmb3Jtcy5uYXZlcn0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWdyZWVuLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1ncmVlbi02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+iIOuEpOydtOuyhDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCBuYXZlcjogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ncmVlbi01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIO2LsOyKpO2GoOumrCDshKTsoJUgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgJHtwbGF0Zm9ybXMudGlzdG9yeSA/ICdiZy13aGl0ZSBib3JkZXItb3JhbmdlLTIwMCBzaGFkb3ctc20nIDogJ2JnLXNsYXRlLTEwMC81MCBib3JkZXItdHJhbnNwYXJlbnQgb3BhY2l0eS02MCd9YH0+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGN1cnNvci1wb2ludGVyIG1iLTMgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtwbGF0Zm9ybXMudGlzdG9yeX0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCB0aXN0b3J5OiAhcGxhdGZvcm1zLnRpc3Rvcnl9KX0gY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LW9yYW5nZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctb3JhbmdlLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1vcmFuZ2UtNjAwIHRyYW5zaXRpb24tY29sb3JzXCI+8J+foCDti7DsiqTthqDrpqw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFwbGF0Zm9ybXMudGlzdG9yeX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy50aXN0b3J5fVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHRpc3Rvcnk6IGUudGFyZ2V0LnZhbHVlfSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb3JhbmdlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuq4sOuzuCDruJTroZzqsbBcIj7quLDrs7ggKOy5nOygiC/quZTrgZQpPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7ZW067CV7ZWcIOyghOusuOqwgFwiPu2VtOuwle2VnCDsoITrrLjqsIA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7Lyog7JuM65Oc7ZSE66CI7IqkIOyEpOyglSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy53b3JkcHJlc3MgPyAnYmctd2hpdGUgYm9yZGVyLWJsdWUtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy53b3JkcHJlc3N9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3Jtcywgd29yZHByZXNzOiAhcGxhdGZvcm1zLndvcmRwcmVzc30pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtYmx1ZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtYmx1ZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5S1IOybjOuTnO2UhOugiOyKpDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy53b3JkcHJlc3N9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHdvcmRwcmVzczogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QXCI+66qF7L6M7ZWcIOygleuztCDsoITri6zsnpA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cblxuICAgICAgICAgIHtlcnJvciAmJiA8cCBjbGFzc05hbWU9XCJ0ZXh0LXJlZC01MDAgZm9udC1ib2xkIHRleHQtc20gYW5pbWF0ZS1wdWxzZVwiPntlcnJvcn08L3A+fVxuXG4gICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgIG9uQ2xpY2s9e2dlbmVyYXRlQ29udGVudH1cbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGJnLWJsdWUtNjAwIGhvdmVyOmJnLWJsdWUtNzAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHRleHQtbGcgcC00IHJvdW5kZWQteGwgc2hhZG93LW1kIHRyYW5zaXRpb24tYWxsIHRyYW5zZm9ybSBob3ZlcjpzY2FsZS1bMS4wMV0gYWN0aXZlOnNjYWxlLVswLjk5XSBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gLW1sLTEgbXItMyBoLTUgdy01IHRleHQtd2hpdGVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjbGFzc05hbWU9XCJvcGFjaXR5LTI1XCIgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjRcIj48L2NpcmNsZT48cGF0aCBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3pcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAg7L2U64uk66as6rCAIOunueugrO2eiCDsnpHshLEg7KSR7J6F64uI64ukLi4uXG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6ICfwn5qAIOybkOuyhO2KvCDrj5nsi5wg7IOd7ISx7ZWY6riwJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIFJlc3VsdHMgU2VjdGlvbiAqL31cbiAgICAgICAge09iamVjdC52YWx1ZXMocmVzdWx0cykuc29tZSh2YWwgPT4gdmFsLmNvbnRlbnQpICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgIHsvKiBUYWJzICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGJvcmRlci1iIGJvcmRlci1zbGF0ZS0xMDAgYmctc2xhdGUtNTAvNTBcIj5cbiAgICAgICAgICAgICAge1snbmF2ZXInLCAndGlzdG9yeScsICd3b3JkcHJlc3MnXS5maWx0ZXIodGFiID0+IHBsYXRmb3Jtc1t0YWJdKS5tYXAoKHRhYikgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGtleT17dGFifVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYil9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LTEgcHktNCBmb250LWJvbGQgdGV4dC1zbSB0cmFuc2l0aW9uLWFsbCAke1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IHRhYiBcbiAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1ibHVlLTYwMCBiZy13aGl0ZSBib3JkZXItYi0yIGJvcmRlci1ibHVlLTYwMCcgXG4gICAgICAgICAgICAgICAgICAgIDogJ3RleHQtc2xhdGUtNTAwIGhvdmVyOnRleHQtc2xhdGUtNzAwIGhvdmVyOmJnLXNsYXRlLTUwJ1xuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3RhYiA9PT0gJ25hdmVyJyA/ICfwn5+iIOuEpOydtOuyhCDruJTroZzqt7gnIDogdGFiID09PSAndGlzdG9yeScgPyAn8J+foCDti7DsiqTthqDrpqwnIDogJ/CflLUg7JuM65Oc7ZSE66CI7IqkJ31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIENvbnRlbnQgRGlzcGxheSAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IHNwYWNlLXktNlwiPlxuICAgICAgICAgICAgICB7Lyog7KCc66qpIOyYgeyXrSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibHVlLTUwLzUwIHAtNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYmx1ZS0xMDAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1ibHVlLTUwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5UaXRsZTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLnRpdGxlKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6YmctYmx1ZS01MCB0ZXh0LWJsdWUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItYmx1ZS0xMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICDwn5OLIOygnOuqqSDrs7XsgqxcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBsZWFkaW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLnRpdGxlIHx8ICfsoJzrqqkg7IOd7ISxIOykkS4uLid9XG4gICAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIOuzuOusuCDsmIHsl60gKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgcHgtMVwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkNvbnRlbnQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS5jb250ZW50KX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6Ymctc2xhdGUtNTAgdGV4dC1zbGF0ZS02MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICDwn5OLIOuzuOusuCDrs7XsgqxcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC02IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIG1pbi1oLVszMDBweF0gc2hhZG93LXNtIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICB7YWN0aXZlVGFiID09PSAnd29yZHByZXNzJyAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItNCBwLTMgYmctYmx1ZS01MC81MCB0ZXh0LWJsdWUtNjAwIHJvdW5kZWQtbGcgdGV4dC14cyBmb250LWJvbGQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgYm9yZGVyIGJvcmRlci1ibHVlLTEwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgIPCfkqEg6r+A7YyBOiDsm4zrk5ztlITroIjsiqQg7Y647KeR6riw7JeQIOuzteyCrO2VtOyEnCDrtpnsl6zrhKPsnLzrqbQgSDIsIEgzIOygnOuqqeydtCDsnpDrj5nsnLzroZwg7KCB7Jqp65Cp64uI64ukIVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb3NlIHByb3NlLXNsYXRlIG1heC13LW5vbmUgdGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZCBcbiAgICAgICAgICAgICAgICAgICAgcHJvc2UtaDI6dGV4dC0yeGwgcHJvc2UtaDI6Zm9udC1ib2xkIHByb3NlLWgyOnRleHQtc2xhdGUtOTAwIHByb3NlLWgyOm10LTEyIHByb3NlLWgyOm1iLTYgcHJvc2UtaDI6cGItMiBwcm9zZS1oMjpib3JkZXItYiBwcm9zZS1oMjpib3JkZXItc2xhdGUtMTAwXG4gICAgICAgICAgICAgICAgICAgIHByb3NlLWgzOnRleHQteGwgcHJvc2UtaDM6Zm9udC1ib2xkIHByb3NlLWgzOnRleHQtc2xhdGUtODAwIHByb3NlLWgzOm10LTggcHJvc2UtaDM6bWItNFxuICAgICAgICAgICAgICAgICAgICBwcm9zZS1wOm1iLTYgcHJvc2UtbGk6bWItMlwiPlxuICAgICAgICAgICAgICAgICAgICA8UmVhY3RNYXJrZG93bj57cmVzdWx0c1thY3RpdmVUYWJdLmNvbnRlbnR9PC9SZWFjdE1hcmtkb3duPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHsvKiDtjKntirjssrTtgawg7JWI64K0IOyYgeyXrSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1hbWJlci01MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIG10LTRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhsXCI+4pqg77iPPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTgwMCBmb250LWJvbGQgdGV4dC1zbSBtYi0xXCI+7L2U64uk66as7J2YIO2Mqe2KuOyytO2BrCDslYzrprw8L3A+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTcwMCB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICAgIOuzuCDsvZjthZDsuKDripQgQUnqsIAg7Iuk7Iuc6rCEIOuNsOydtO2EsOulvCDquLDrsJjsnLzroZwg7IOd7ISx7ZWcIOqysOqzvOusvOyeheuLiOuLpC4g7KCV7LGFIOuzgOqyveydtOuCmCDstZzsi6Ag7KCV67O0IOuwmOyYgeyXkCDsi5zssKjqsIAg7J6I7J2EIOyImCDsnojsnLzri4gsIFxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPiDspJHsmpTtlZwg7IiY7LmY64KYIOuCoOynnCDrk7HsnYAg67CY65Oc7IucIOqzteyLnSDtmYjtjpjsnbTsp4Drpbwg7Ya17ZW0IOy1nOyihSDtmZXsnbg8L3N0cm9uZz4g7ZuEIOuwnO2Wie2VtCDso7zshLjsmpQhXG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmsgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8YSBcbiAgICAgICAgICAgICAgICAgICAgICBocmVmPXtyZXN1bHRzW2FjdGl2ZVRhYl0ub2ZmaWNpYWxfbGlua30gXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXG4gICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcHgtMyBweS0xLjUgYmctYW1iZXItMjAwIGhvdmVyOmJnLWFtYmVyLTMwMCB0ZXh0LWFtYmVyLTkwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIGJvcmRlciBib3JkZXItYW1iZXItMzAwXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIPCflJcg6rO17IudIO2ZiO2OmOydtOyngCDrsJTroZzqsIDquLBcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIO2VtOyLnO2DnOq3uCDsmIHsl60gKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+SGFzaHRhZ3M8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50YWdzKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6Ymctc2xhdGUtMTAwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAg8J+TiyDtg5zqt7gg67O17IKsXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWJsdWUtNjAwIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLnRhZ3MgfHwgJyPtlbTsi5ztg5zqt7ggI+y2lOyynCAj7KSRJ31cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgIDwvZGl2PlxuICAgICAge2lzU2V0dGluZ3NPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctbWQgdy1mdWxsIHNwYWNlLXktNiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7impnvuI8g7Iuc7Iqk7YWcIOyEpOyglTwvaDI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMFwiPuKclTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPvCflJEgR2VtaW5pIEFQSSBLZXk8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgICAgdHlwZT17c2hvd0FwaUtleSA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifSBcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXthcGlLZXl9IFxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVNhdmVBcGlLZXl9IFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCBwci0xMiByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpyaW5nLTQgZm9jdXM6cmluZy1pbmRpZ28tNTAwLzEwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBmb250LW1vbm8gdGV4dC1zbVwiIFxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBUEkg7YKk66W8IOyeheugpe2VmOyEuOyalFwiIFxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd0FwaUtleSghc2hvd0FwaUtleSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBwLTEuNSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTUwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgdGl0bGU9e3Nob3dBcGlLZXkgPyBcIu2CpCDsiKjquLDquLBcIiA6IFwi7YKkIOuztOq4sFwifVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtzaG93QXBpS2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk05Ljg4IDkuODhhMyAzIDAgMSAwIDQuMjQgNC4yNFwiLz48cGF0aCBkPVwiTTEwLjczIDUuMDhBMTAuNDMgMTAuNDMgMCAwIDEgMTIgNWM3IDAgMTAgNyAxMCA3YTEzLjE2IDEzLjE2IDAgMCAxLTEuNjcgMi42OFwiLz48cGF0aCBkPVwiTTYuNjEgNi42MUExMy41MiAxMy41MiAwIDAgMCAyIDEyczMgNyAxMCA3YTkuNzQgOS43NCAwIDAgMCA1LjM5LTEuNjFcIi8+PGxpbmUgeDE9XCIyXCIgeDI9XCIyMlwiIHkxPVwiMlwiIHkyPVwiMjJcIi8+PC9zdmc+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0yIDEyczMtNyAxMC03IDEwIDcgMTAgNy0zIDctMTAgNy0xMC03LTEwLTdaXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiLz48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLWluZGlnby01MCByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWluZGlnby0xMDAgc3BhY2UteS0zIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJsYWNrIHRleHQtaW5kaWdvLTYwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj7wn5K+IOy9lOuLpOumrCDrsLHsl4Ug6rSA66asPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LWluZGlnby00MDAgbGVhZGluZy1yZWxheGVkXCI+7J6R7JeFIOykkeyXkCDsvZTrk5zqsIAg6rys7J2064qUIOqyg+ydhCDrsKnsp4DtlZjquLAg7JyE7ZW0IOygleq4sOyggeycvOuhnCDrsLHsl4Xrs7jsnYQg7IOd7ISx7ZWY7Iut7Iuc7JikLjwvcD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVEb3dubG9hZEJhY2t1cH0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgYmctd2hpdGUgaG92ZXI6YmctaW5kaWdvLTEwMCB0ZXh0LWluZGlnby02MDAgcm91bmRlZC14bCBmb250LWJvbGQgdGV4dC1zbSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1pbmRpZ28tMjAwIHRyYW5zaXRpb24tYWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCI+8J+TgiDtmITsnqwg67KE7KCEIOymieyLnCDrsLHsl4Uo64uk7Jq066Gc65OcKTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtNCBib3JkZXItdCBib3JkZXItc2xhdGUtMTAwXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4geyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknLCBhcGlLZXkpOyBzZXRJc1NldHRpbmdzT3BlbihmYWxzZSk7IGFsZXJ0KCfrjIDtkZzri5gsIOyEpOygleydtCDsoIDsnqXrkJjsl4jsirXri4jri6QhIPCfq6EnKTsgfX0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTQgYmctc2xhdGUtOTAwIGhvdmVyOmJnLXNsYXRlLTgwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtMnhsIGZvbnQtYm9sZCB0ZXh0LWxnIHNoYWRvdy14bCB0cmFuc2l0aW9uLWFsbFwiPuyEpOyglSDsoIDsnqUg67CPIOyggeyaqTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge2lzQXV0aE1vZGFsT3BlbiAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvODAgYmFja2Ryb3AtYmx1ci1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB6LTUwIHAtNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgcC04IG1heC13LXNtIHctZnVsbCBzcGFjZS15LTYgdGV4dC1jZW50ZXIgc2hhZG93LTJ4bCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJc0F1dGhNb2RhbE9wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC02IHRvcC02IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtc2xhdGUtNjAwIHRyYW5zaXRpb24tYWxsXCI+4pyVPC9idXR0b24+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTYgaC0xNiBiZy1pbmRpZ28tMTAwIHRleHQtaW5kaWdvLTYwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC0zeGwgbXgtYXV0byBtYi0yXCI+8J+UkTwvZGl2PlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7rjIDtkZzri5gg7J247KadIO2VhOyalCDwn6uhPC9oMj5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1zbGF0ZS01MDBcIj7snbQg7JWx7J2AIOuMgO2RnOuLmCDsoITsmqnsnoXri4jri6QuPGJyLz7ruYTrsIAg7L2U65Oc66W8IOyeheugpe2VtCDso7zshLjsmpQuPC9wPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIHZhbHVlPXthdXRoQ29kZX0gb25DaGFuZ2U9eyhlKSA9PiBzZXRBdXRoQ29kZShlLnRhcmdldC52YWx1ZSl9IG9uS2V5RG93bj17KGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGhhbmRsZUxvZ2luKCl9IHBsYWNlaG9sZGVyPVwi7L2U65Oc66W8IOyeheugpe2VmOyEuOyalFwiIGNsYXNzTmFtZT1cInctZnVsbCBwLTQgcm91bmRlZC0yeGwgYmctc2xhdGUtNTAgYm9yZGVyLTIgYm9yZGVyLXNsYXRlLTIwMCB0ZXh0LWNlbnRlciB0ZXh0LTJ4bCBmb250LWJsYWNrIGZvY3VzOmJvcmRlci1pbmRpZ28tNTAwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbFwiIC8+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ2lufSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby03MDAgdGV4dC13aGl0ZSByb3VuZGVkLTJ4bCBmb250LWJsYWNrIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7J247Kad7ZWY6riwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIl19