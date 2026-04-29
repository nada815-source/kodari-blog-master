import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.jsx");const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport3_react_jsxDevRuntime["Fragment"];const useState = __vite__cjsImport0_react["useState"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=3822dc14";
import { GoogleGenAI } from "/node_modules/.vite/deps/@google_genai.js?v=af550dd3";
import ReactMarkdown from "/node_modules/.vite/deps/react-markdown.js?v=50815514";
var _jsxFileName = "D:/초보프로젝트/blog-generator/src/App.jsx";
import __vite__cjsImport3_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=3822dc14";
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
			official_links: [],
			image: ""
		},
		tistory: {
			title: "",
			content: "",
			tags: "",
			official_links: [],
			image: ""
		},
		wordpress: {
			title: "",
			content: "",
			tags: "",
			official_links: [],
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
			const combinedPrompt = `주제: "${topic}"

[필독: 생성 지침 - 미준수 시 작동 불가]

0. **이미지 검색 키워드 생성 (전략 C):**
   - 주제를 분석하여 Unsplash에서 검색할 **영어 키워드 3개**를 생성해. 키워드는 "Korea, Seoul, Modern, Minimal" 느낌이 나도록 조합해.

1. **보안 및 신뢰성 (최우선):**
   - 반드시 보안(https)이 완벽하게 작동하는 정부('go.kr'), 공공기관 공식 사이트 링크만 선별해.

2. **압도적인 정보량 (최소 1500자 이상):** 
   - 각 플랫폼별 본문은 공백 제외 최소 1500자 이상의 풍성한 분량으로 작성해.

3. **가독성 극대화 및 표(Table) 생성 전략 (필수):**
   - 모든 소제목은 반드시 마크다운의 **## (H2)** 태그로 통일해.
   - **[표(Table) 생성 강제]:** 단순 리스트(1. 2. 3...)나 불렛 포인트로 나열할 수 있는 정보(예: 사용처 리스트, 혜택 항목, 일정 등)가 3개 이상이라면, 이를 **무조건 Markdown Table 형식**으로 시각화하여 본문 중간에 배치해. 
   - 표는 최소 2열 이상으로 구성하고(예: | 항목명 | 상세 내용 | 비고 |), 독자가 한눈에 정보를 파악할 수 있게 만들어.
   - **[형광펜 강조 강제]:** 본문 내에서 독자가 반드시 주목해야 할 핵심 문장(섹션당 1~2개)은 반드시 **== 강조할 핵심 문장 ==** 형식으로 감싸서 강조해. 
   - 이 강조 효과는 전체 글에서 3~5번 정도 적절히 분산해서 사용해.

4. **JSON 안정성:**
   - 응답은 반드시 유효한 JSON 형식이어야 해. 본문 텍스트 내부에 쌍따옴표(")는 작은따옴표(')로 대체해.

결과는 반드시 아래의 JSON 형식으로만 답변해:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "naver": { 
    "title": "...", 
    "content": "본문에 '결론', '맺음말', '관련 링크' 같은 제목이나 섹션을 절대 포함하지 마라. 순수 정보성 문단으로만 구성해.", 
    "tags": "...", 
    "official_links": [{"name": "경기도청 공식 홈페이지", "url": "https://www.gg.go.kr"}, {"name": "경기도문화재단", "url": "https://www.ggcf.kr"}]
  },
  "tistory": { ...위와 동일한 구조... },
  "wordpress": { ...위와 동일한 구조... }
}

[필독: '결론', '맺음말', '마지막으로' 등의 기계적 섹션 이름 사용을 절대 엄금함.]
[필독: 모든 해시태그(tags)는 반드시 **한국어**로만 생성하고, 각 태그 앞에 반드시 **'#' 기호**를 붙여서 한 줄로 나열해. (예: #키워드1 #키워드2)]`;
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
					image: finalImages[0],
					official_links: parsedData.naver.official_links || []
				} : emptyResult,
				tistory: parsedData.tistory ? {
					...emptyResult,
					...parsedData.tistory,
					image: finalImages[1],
					official_links: parsedData.tistory.official_links || []
				} : emptyResult,
				wordpress: parsedData.wordpress ? {
					...emptyResult,
					...parsedData.wordpress,
					image: finalImages[2],
					official_links: parsedData.wordpress.official_links || []
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
			let processedText = text;
			const tableRegex = /^\|(.+)\|\n\|([ :|-]+)\|\n((\|.+\|\n?)+)/gm;
			const markdownToHtmlTable = (match) => {
				const lines = match.trim().split("\n");
				const headers = lines[0].split("|").filter((cell) => cell.trim() !== "").map((cell) => cell.trim());
				const rows = lines.slice(2).map((line) => line.split("|").filter((cell) => cell.trim() !== "").map((cell) => cell.trim()));
				let html = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd; ${naverFont}">`;
				html += "<thead style=\"background-color: #f8f9fa;\"><tr>";
				headers.forEach((h) => {
					html += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold; background-color: #f2f2f2;">${h}</th>`;
				});
				html += "</tr></thead><tbody>";
				rows.forEach((row) => {
					html += "<tr>";
					row.forEach((cell) => {
						html += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cell}</td>`;
					});
					html += "</tr>";
				});
				html += "</tbody></table>";
				return html;
			};
			let htmlContent = processedText.replace(tableRegex, markdownToHtmlTable);
			htmlContent = htmlContent.replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`).replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`).replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`).replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>").replace(/== (.*?) ==/g, "<span style=\"background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;\">$1</span>").replace(/==(.*?)==/g, "<span style=\"background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;\">$1</span>").split("\n").map((line) => {
				const trimmed = line.trim();
				if (trimmed === "") return "<p>&nbsp;</p>";
				if (trimmed.startsWith("<p") || trimmed.startsWith("<li") || trimmed.startsWith("<table")) return trimmed;
				return `<p style="margin-bottom: 15px;"><span style="font-size: 12pt; line-height: 1.8; color: #444; ${naverFont}">${trimmed}</span></p>`;
			}).filter((line) => line !== "").join("");
			const blobHtml = new Blob([htmlContent], { type: "text/html" });
			const blobText = new Blob([text], { type: "text/plain" });
			const data = [new ClipboardItem({
				"text/html": blobHtml,
				"text/plain": blobText
			})];
			await navigator.clipboard.write(data);
			triggerToast("서식과 표가 포함된 상태로 복사되었습니다! 📋📊✨");
		} catch (err) {
			console.error("Clipboard error:", err);
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
									lineNumber: 272,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 273,
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
										lineNumber: 275,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 277,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 279,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 274,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 271,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 283,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 270,
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
									lineNumber: 288,
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
									lineNumber: 289,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 287,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "bg-slate-50 p-6 rounded-2xl border border-slate-200",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									className: "block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2",
									children: "✅ 발행 플랫폼 및 개별 어투 설정"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 300,
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
													lineNumber: 306,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-green-600 transition-colors",
													children: "🟢 네이버"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 307,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 305,
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
														lineNumber: 315,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 316,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 317,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 318,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 309,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 304,
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
													lineNumber: 324,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 325,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 323,
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
														lineNumber: 333,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 334,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 335,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 336,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 327,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 322,
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
													lineNumber: 342,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 343,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 341,
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
														lineNumber: 351,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 352,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 353,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 354,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 345,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 340,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 303,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 299,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 360,
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
										lineNumber: 363,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setUseImage(!useImage),
										className: `relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? "bg-indigo-600" : "bg-slate-300"}`,
										children: /* @__PURE__ */ _jsxDEV("div", { className: `absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? "translate-x-6" : "translate-x-0"}` }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 368,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 364,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${useImage ? "text-indigo-600" : "text-slate-400"}`,
										children: "이미지 자동 삽입 ON"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 370,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 362,
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
										lineNumber: 380,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 380,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 380,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 373,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 286,
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
								lineNumber: 391,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 389,
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
										lineNumber: 408,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
										children: "📸 Photo via Unsplash (AI 추천 이미지)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 409,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 407,
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
											lineNumber: 414,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].title),
											className: "px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1",
											children: "📋 제목 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 415,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 413,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("h2", {
										className: "text-xl font-bold text-slate-800 leading-tight",
										children: results[activeTab].title || "제목 생성 중..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 417,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 412,
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
											lineNumber: 421,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].content),
											className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 본문 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 422,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 420,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "bg-white p-6 rounded-2xl border border-slate-200 min-h-[300px] shadow-sm group",
										children: /* @__PURE__ */ _jsxDEV("div", {
											className: "prose prose-slate max-w-none text-base leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6 prose-li:mb-2",
											children: /* @__PURE__ */ _jsxDEV(ReactMarkdown, {
												components: { 
												// ==강조== 를 미리보기에서도 노란색 배경으로 표시
code: ({ node, inline, className, children, ...props }) => {
													const match = /^\^==(.*)==\^$/.exec(children);
													return inline ? /* @__PURE__ */ _jsxDEV("code", {
														className,
														...props,
														children
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 431,
														columnNumber: 43
													}, this) : /* @__PURE__ */ _jsxDEV("pre", {
														className,
														...props,
														children
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 431,
														columnNumber: 102
													}, this);
												} },
												children: results[activeTab].content
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 426,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 425,
											columnNumber: 19
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 424,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 419,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4",
									children: [/* @__PURE__ */ _jsxDEV("span", {
										className: "text-xl",
										children: "⚠️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 441,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 443,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-3",
												children: "본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 중요한 수치나 날짜 등은 반드시 아래 공식 관련 링크를 통해 최종 확인 후 발행해 주세요!"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 444,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("div", {
												className: "flex flex-wrap gap-2",
												children: results[activeTab].official_links && results[activeTab].official_links.map((link, idx) => /* @__PURE__ */ _jsxDEV("a", {
													href: link.url,
													target: "_blank",
													rel: "noopener noreferrer",
													className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition-all border border-amber-300",
													children: [
														"🔗 ",
														link.name,
														" 바로가기"
													]
												}, idx, true, {
													fileName: _jsxFileName,
													lineNumber: 447,
													columnNumber: 23
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 445,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 442,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 440,
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
											lineNumber: 462,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 463,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 461,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 465,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 460,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 405,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 388,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 268,
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
								lineNumber: 476,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 477,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 475,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 480,
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
									lineNumber: 482,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowApiKey(!showApiKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showApiKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 483,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 481,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 479,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "📸 Unsplash Access Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 487,
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
									lineNumber: 489,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowUnsplashKey(!showUnsplashKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showUnsplashKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 490,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 488,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 486,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left",
							children: [/* @__PURE__ */ _jsxDEV("h3", {
								className: "text-sm font-black text-indigo-600 uppercase tracking-wider",
								children: "💾 코다리 백업 관리"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 494,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: handleDownloadBackup,
								className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all",
								children: "📂 현재 버전 즉시 백업(다운로드)"
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
								lineNumber: 498,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 497,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 474,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 473,
				columnNumber: 9
			}, this),
			isAuthModalOpen && /* @__PURE__ */ _jsxDEV("div", {
				className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 text-center shadow-2xl border border-slate-100 relative",
					children: [
						/* @__PURE__ */ _jsxDEV("h2", {
							className: "text-2xl font-black text-slate-800",
							children: "대표님 인증 필요 🫡"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 507,
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
							lineNumber: 508,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 509,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 506,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 505,
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
				lineNumber: 515,
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
				lineNumber: 520,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 267,
		columnNumber: 5
	}, this);
}
_s(App, "m2lyfQVXQsYgMA5kmgjNqFuTSMk=");
_c = App;
export default App;
var _c;
$RefreshReg$(_c, "App");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/App.jsx?t=1777298728488";
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

//# sourceMappingURL=data:application/json;base64,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OEIsUUFBUTtLQUFtQyxnQkFBZ0I7S0FBYSxXQUFXO0tBQXVDLFlBQVk7S0FBVSxTQUFTO0tBQVEsWUFBWTtLQUFVLEtBQUs7S0FBTztjQUNqZTtJQUNHOzs7OztHQUdSLHdCQUFDLFNBQUQsWUFBUTs7Ozs7OztTQU9FOzs7OztHQUNOOzs7Ozs7O3VDQUVUOztBQUVELGVBQWUiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiQXBwLmpzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEdvb2dsZUdlbkFJIH0gZnJvbSAnQGdvb2dsZS9nZW5haSc7XG5pbXBvcnQgUmVhY3RNYXJrZG93biBmcm9tICdyZWFjdC1tYXJrZG93bic7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcbiAgY29uc3QgW3RvcGljLCBzZXRUb3BpY10gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFt0b25lcywgc2V0VG9uZXNdID0gdXNlU3RhdGUoe1xuICAgIG5hdmVyOiAn6riw67O4IOu4lOuhnOqxsCcsXG4gICAgdGlzdG9yeTogJ+q4sOuzuCDruJTroZzqsbAnLFxuICAgIHdvcmRwcmVzczogJ+uqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QJ1xuICB9KTtcbiAgY29uc3QgW3BsYXRmb3Jtcywgc2V0UGxhdGZvcm1zXSA9IHVzZVN0YXRlKHsgbmF2ZXI6IHRydWUsIHRpc3Rvcnk6IHRydWUsIHdvcmRwcmVzczogdHJ1ZSB9KTtcbiAgY29uc3QgW2FwaUtleSwgc2V0QXBpS2V5XSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpIHx8ICcnKTtcbiAgY29uc3QgW3Vuc3BsYXNoS2V5LCBzZXRVbnNwbGFzaEtleV0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndW5zcGxhc2hfa2V5JykgfHwgJycpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZXN1bHRzLCBzZXRSZXN1bHRzXSA9IHVzZVN0YXRlKHtcbiAgICBuYXZlcjogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGlua3M6IFtdLCBpbWFnZTogJycgfSxcbiAgICB0aXN0b3J5OiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rczogW10sIGltYWdlOiAnJyB9LFxuICAgIHdvcmRwcmVzczogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGlua3M6IFtdLCBpbWFnZTogJycgfVxuICB9KTtcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCduYXZlcicpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3dBcGlLZXksIHNldFNob3dBcGlLZXldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd1Vuc3BsYXNoS2V5LCBzZXRTaG93VW5zcGxhc2hLZXldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbdXNlSW1hZ2UsIHNldFVzZUltYWdlXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbaXNTZXR0aW5nc09wZW4sIHNldElzU2V0dGluZ3NPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQXV0aGVudGljYXRlZCwgc2V0SXNBdXRoZW50aWNhdGVkXSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpc19hdXRoZW50aWNhdGVkJykgPT09ICd0cnVlJyk7XG4gIGNvbnN0IFtpc0F1dGhNb2RhbE9wZW4sIHNldElzQXV0aE1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFthdXRoQ29kZSwgc2V0QXV0aENvZGVdID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbdG9hc3QsIHNldFRvYXN0XSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3dUb2FzdCwgc2V0U2hvd1RvYXN0XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCB0cmlnZ2VyVG9hc3QgPSAobXNnKSA9PiB7XG4gICAgc2V0VG9hc3QobXNnKTtcbiAgICBzZXRTaG93VG9hc3QodHJ1ZSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTaG93VG9hc3QoZmFsc2UpO1xuICAgIH0sIDI1MDApO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ2luID0gKCkgPT4ge1xuICAgIGlmIChhdXRoQ29kZSA9PT0gJ2tvZGFyaTEnKSB7XG4gICAgICBzZXRJc0F1dGhlbnRpY2F0ZWQodHJ1ZSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaXNfYXV0aGVudGljYXRlZCcsICd0cnVlJyk7XG4gICAgICBzZXRJc0F1dGhNb2RhbE9wZW4oZmFsc2UpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfrsJjqsJHsirXri4jri6QsIOuMgO2RnOuLmCEgS09EQVJJIEJMT0cgQUnqsIAg7Zmc7ISx7ZmU65CY7JeI7Iq164uI64ukLiDwn6uh8J+QnycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+yduOymnSDsvZTrk5zqsIAg7YuA66C47Iq164uI64ukLiDrjIDtkZzri5jrp4wg7JWE7Iuc64qUIOy9lOuTnOulvCDsnoXroKXtlbQg7KO87IS47JqUIScpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVMb2dvdXQgPSAoKSA9PiB7XG4gICAgc2V0SXNBdXRoZW50aWNhdGVkKGZhbHNlKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnaXNfYXV0aGVudGljYXRlZCcpO1xuICAgIHRyaWdnZXJUb2FzdCgn66Gc6re47JWE7JuDIOuQmOyXiOyKteuLiOuLpC4g7Lap7ISxIScpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVNhdmVBcGlLZXkgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgIHNldEFwaUtleShrZXkpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnZW1pbmlfYXBpX2tleScsIGtleSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRG93bmxvYWRCYWNrdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9zcmMvQXBwLmpzeCcpO1xuICAgICAgY29uc3QgY29kZSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29kZV0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gYCR7bm93LmdldEZ1bGxZZWFyKCl9JHtTdHJpbmcobm93LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9XyR7U3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgICAgIFxuICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgbGluay5kb3dubG9hZCA9IGBLT0RBUklfQXBwX1YyX0JhY2t1cF8ke2Zvcm1hdHRlZERhdGV9LmpzeGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5jbGljaygpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgIHRyaWdnZXJUb2FzdCgn64yA7ZGc64uYISDtmITsnqwg67KE7KCE7J2YIOyGjOyKpCDsvZTrk5zrpbwg7Lu07ZOo7YSw7JeQIOymieyLnCDsoIDsnqXtlojsirXri4jri6QhIPCfk4LinKgnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRyaWdnZXJUb2FzdCgn67Cx7JeFIOuLpOyatOuhnOuTnCDspJEg7Jik66WY6rCAIOuwnOyDne2WiOyKteuLiOuLpC4g67aA7J6l64uY7JeQ6rKMIOyxhO2MheycvOuhnCDsmpTssq3tlbQg7KO87IS47JqUISDwn5Cf8J+SpicpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBmZXRjaEltYWdlcyA9IGFzeW5jIChrZXl3b3JkcykgPT4ge1xuICAgIGlmICghdW5zcGxhc2hLZXkpIHJldHVybiBbJycsICcnLCAnJ107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZldGNoSW1hZ2UgPSBhc3luYyAoa2V5d29yZCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXl3b3JkICsgJyBLb3JlYSBTZW91bCBNb2Rlcm4nKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLnVuc3BsYXNoLmNvbS9zZWFyY2gvcGhvdG9zP3F1ZXJ5PSR7cXVlcnl9JnBlcl9wYWdlPTEmY2xpZW50X2lkPSR7dW5zcGxhc2hLZXl9YCk7XG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBpZiAoIWRhdGEucmVzdWx0cyB8fCBkYXRhLnJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkudW5zcGxhc2guY29tL3NlYXJjaC9waG90b3M/cXVlcnk9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Nlb3VsIE1vZGVybiBMaWZlc3R5bGUnKX0mcGVyX3BhZ2U9MSZjbGllbnRfaWQ9JHt1bnNwbGFzaEtleX1gKTtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhLnJlc3VsdHM/LlswXT8udXJscz8ucmVndWxhciB8fCAnJztcbiAgICAgIH07XG4gICAgICBjb25zdCBrd3MgPSBBcnJheS5pc0FycmF5KGtleXdvcmRzKSA/IGtleXdvcmRzIDogW3RvcGljLCB0b3BpYywgdG9waWNdO1xuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGt3cy5tYXAoa3cgPT4gZmV0Y2hJbWFnZShrdykpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ltYWdlIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gWycnLCAnJywgJyddO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZW5lcmF0ZUNvbnRlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHNldElzQXV0aE1vZGFsT3Blbih0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmluYWxLZXkgPSBhcGlLZXkudHJpbSgpIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpO1xuICAgIGlmICghZmluYWxLZXkpIHtcbiAgICAgIHNldElzU2V0dGluZ3NPcGVuKHRydWUpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfimpnvuI8gQVBJIO2CpOulvCDrqLzsoIAg7ISk7KCV7ZW0IOyjvOyEuOyalCwg64yA7ZGc64uYIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRvcGljLnRyaW0oKSkge1xuICAgICAgc2V0RXJyb3IoJ+2PrOyKpO2MhSDso7zsoJzrpbwg7J6F66Cl7ZW07KO87IS47JqUIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IoJycpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBBUElfVVJMID0gYGh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLWZsYXNoLWxhdGVzdDpnZW5lcmF0ZUNvbnRlbnQ/a2V5PSR7ZmluYWxLZXl9YDtcbiAgICAgIFxuICAgICAgY29uc3QgY29tYmluZWRQcm9tcHQgPSBg7KO87KCcOiBcIiR7dG9waWN9XCJcblxuW+2VhOuPhTog7IOd7ISxIOyngOy5qCAtIOuvuOykgOyImCDsi5wg7J6R64+ZIOu2iOqwgF1cblxuMC4gKirsnbTrr7jsp4Ag6rKA7IOJIO2CpOybjOuTnCDsg53shLEgKOyghOuetSBDKToqKlxuICAgLSDso7zsoJzrpbwg67aE7ISd7ZWY7JesIFVuc3BsYXNo7JeQ7IScIOqygOyDie2VoCAqKuyYgeyWtCDtgqTsm4zrk5wgM+qwnCoq66W8IOyDneyEse2VtC4g7YKk7JuM65Oc64qUIFwiS29yZWEsIFNlb3VsLCBNb2Rlcm4sIE1pbmltYWxcIiDripDrgozsnbQg64KY64+E66GdIOyhsO2Vqe2VtC5cblxuMS4gKirrs7TslYgg67CPIOyLoOuisOyEsSAo7LWc7Jqw7ISgKToqKlxuICAgLSDrsJjrk5zsi5wg67O07JWIKGh0dHBzKeydtCDsmYTrsr3tlZjqsowg7J6R64+Z7ZWY64qUIOygleu2gCgnZ28ua3InKSwg6rO16rO16riw6rSAIOqzteyLnSDsgqzsnbTtirgg66eB7YGs66eMIOyEoOuzhO2VtC5cblxuMi4gKirslZXrj4TsoIHsnbgg7KCV67O065+JICjstZzshowgMTUwMOyekCDsnbTsg4EpOioqIFxuICAgLSDqsIEg7ZSM656r7Y+867OEIOuzuOusuOydgCDqs7XrsLEg7KCc7Jm4IOy1nOyGjCAxNTAw7J6QIOydtOyDgeydmCDtko3shLHtlZwg67aE65+J7Jy866GcIOyekeyEse2VtC5cblxuMy4gKirqsIDrj4XshLEg6re564yA7ZmUIOuwjyDtkZwoVGFibGUpIOyDneyEsSDsoITrnrUgKO2VhOyImCk6KipcbiAgIC0g66qo65OgIOyGjOygnOuqqeydgCDrsJjrk5zsi5wg66eI7YGs64uk7Jq07J2YICoqIyMgKEgyKSoqIO2DnOq3uOuhnCDthrXsnbztlbQuXG4gICAtICoqW+2RnChUYWJsZSkg7IOd7ISxIOqwleygnF06Kiog64uo7IicIOumrOyKpO2KuCgxLiAyLiAzLi4uKeuCmCDrtojroJsg7Y+s7J247Yq466GcIOuCmOyXtO2VoCDsiJgg7J6I64qUIOygleuztCjsmIg6IOyCrOyaqeyymCDrpqzsiqTtirgsIO2YnO2DnSDtla3rqqksIOydvOyglSDrk7Ep6rCAIDPqsJwg7J207IOB7J20652866m0LCDsnbTrpbwgKirrrLTsobDqsbQgTWFya2Rvd24gVGFibGUg7ZiV7IudKirsnLzroZwg7Iuc6rCB7ZmU7ZWY7JesIOuzuOusuCDspJHqsITsl5Ag67Cw7LmY7ZW0LiBcbiAgIC0g7ZGc64qUIOy1nOyGjCAy7Je0IOydtOyDgeycvOuhnCDqtazshLHtlZjqs6Ao7JiIOiB8IO2VreuqqeuqhSB8IOyDgeyEuCDrgrTsmqkgfCDruYTqs6AgfCksIOuPheyekOqwgCDtlZzriIjsl5Ag7KCV67O066W8IO2MjOyVhe2VoCDsiJgg7J6I6rKMIOunjOuTpOyWtC5cbiAgIC0gKipb7ZiV6rSR7Y6cIOqwleyhsCDqsJXsoJxdOioqIOuzuOusuCDrgrTsl5DshJwg64+F7J6Q6rCAIOuwmOuTnOyLnCDso7zrqqntlbTslbwg7ZWgIO2VteyLrCDrrLjsnqUo7IS57IWY64u5IDF+MuqwnCnsnYAg67CY65Oc7IucICoqPT0g6rCV7KGw7ZWgIO2VteyLrCDrrLjsnqUgPT0qKiDtmJXsi53snLzroZwg6rCQ7Iu47IScIOqwleyhsO2VtC4gXG4gICAtIOydtCDqsJXsobAg7Zqo6rO864qUIOyghOyytCDquIDsl5DshJwgM34167KIIOygleuPhCDsoIHsoIjtnogg67aE7IKw7ZW07IScIOyCrOyaqe2VtC5cblxuNC4gKipKU09OIOyViOygleyEsToqKlxuICAgLSDsnZHri7XsnYAg67CY65Oc7IucIOycoO2aqO2VnCBKU09OIO2YleyLneydtOyWtOyVvCDtlbQuIOuzuOusuCDthY3siqTtirgg64K067aA7JeQIOyMjeuUsOyYtO2RnChcIinripQg7J6R7J2A65Sw7Ji07ZGcKCcp66GcIOuMgOyytO2VtC5cblxu6rKw6rO864qUIOuwmOuTnOyLnCDslYTrnpjsnZggSlNPTiDtmJXsi53snLzroZzrp4wg64u167OA7ZW0Olxue1xuICBcImtleXdvcmRzXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIiwgXCJrZXl3b3JkM1wiXSxcbiAgXCJuYXZlclwiOiB7IFxuICAgIFwidGl0bGVcIjogXCIuLi5cIiwgXG4gICAgXCJjb250ZW50XCI6IFwi67O466y47JeQICfqsrDroaAnLCAn66e67J2M66eQJywgJ+q0gOugqCDrp4HtgawnIOqwmeydgCDsoJzrqqnsnbTrgpgg7IS57IWY7J2EIOygiOuMgCDtj6ztlajtlZjsp4Ag66eI6528LiDsiJzsiJgg7KCV67O07ISxIOusuOuLqOycvOuhnOunjCDqtazshLHtlbQuXCIsIFxuICAgIFwidGFnc1wiOiBcIi4uLlwiLCBcbiAgICBcIm9mZmljaWFsX2xpbmtzXCI6IFt7XCJuYW1lXCI6IFwi6rK96riw64+E7LKtIOqzteyLnSDtmYjtjpjsnbTsp4BcIiwgXCJ1cmxcIjogXCJodHRwczovL3d3dy5nZy5nby5rclwifSwge1wibmFtZVwiOiBcIuqyveq4sOuPhOusuO2ZlOyerOuLqFwiLCBcInVybFwiOiBcImh0dHBzOi8vd3d3LmdnY2Yua3JcIn1dXG4gIH0sXG4gIFwidGlzdG9yeVwiOiB7IC4uLuychOyZgCDrj5nsnbztlZwg6rWs7KGwLi4uIH0sXG4gIFwid29yZHByZXNzXCI6IHsgLi4u7JyE7JmAIOuPmeydvO2VnCDqtazsobAuLi4gfVxufVxuXG5b7ZWE64+FOiAn6rKw66GgJywgJ+unuuydjOunkCcsICfrp4jsp4Drp4nsnLzroZwnIOuTseydmCDquLDqs4TsoIEg7IS57IWYIOydtOumhCDsgqzsmqnsnYQg7KCI64yAIOyXhOq4iO2VqC5dXG5b7ZWE64+FOiDrqqjrk6Ag7ZW07Iuc7YOc6re4KHRhZ3Mp64qUIOuwmOuTnOyLnCAqKu2VnOq1reyWtCoq66Gc66eMIOyDneyEse2VmOqzoCwg6rCBIO2DnOq3uCDslZ7sl5Ag67CY65Oc7IucICoqJyMnIOq4sO2YuCoq66W8IOu2meyXrOyEnCDtlZwg7KSE66GcIOuCmOyXtO2VtC4gKOyYiDogI+2CpOybjOuTnDEgI+2CpOybjOuTnDIpXWA7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goQVBJX1VSTCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjb250ZW50czogW3sgcGFydHM6IFt7IHRleHQ6IGNvbWJpbmVkUHJvbXB0IH1dIH1dLFxuICAgICAgICAgIHRvb2xzOiBbeyBnb29nbGVfc2VhcmNoOiB7fSB9XSBcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yRGF0YS5lcnJvcj8ubWVzc2FnZSB8fCAnQVBJIO2YuOy2nCDsi6TtjKgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGxldCByZXNwb25zZVRleHRSYXcgPSBkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudC5wYXJ0c1swXS50ZXh0O1xuICAgICAgbGV0IHJlc3BvbnNlVGV4dCA9IHJlc3BvbnNlVGV4dFJhdy5yZXBsYWNlKC9gYGBqc29uL2dpLCAnJykucmVwbGFjZSgvYGBgL2dpLCAnJykudHJpbSgpO1xuXG4gICAgICBjb25zdCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xuICAgICAgY29uc3QgZW1wdHlSZXN1bHQgPSB7IHRpdGxlOiAnJywgY29udGVudDogJ+yDneyEsSDsi6TtjKgnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGluazogJycsIGltYWdlOiAnJyB9O1xuXG4gICAgICBsZXQgZmluYWxJbWFnZXMgPSBbJycsICcnLCAnJ107XG4gICAgICBpZiAodXNlSW1hZ2UgJiYgdW5zcGxhc2hLZXkpIHtcbiAgICAgICAgZmluYWxJbWFnZXMgPSBhd2FpdCBmZXRjaEltYWdlcyhwYXJzZWREYXRhLmtleXdvcmRzIHx8IFt0b3BpYywgdG9waWMsIHRvcGljXSk7XG4gICAgICB9XG5cbiAgICAgIHNldFJlc3VsdHMoe1xuICAgICAgICBuYXZlcjogcGFyc2VkRGF0YS5uYXZlciA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEubmF2ZXIsIGltYWdlOiBmaW5hbEltYWdlc1swXSwgb2ZmaWNpYWxfbGlua3M6IHBhcnNlZERhdGEubmF2ZXIub2ZmaWNpYWxfbGlua3MgfHwgW10gfSA6IGVtcHR5UmVzdWx0LFxuICAgICAgICB0aXN0b3J5OiBwYXJzZWREYXRhLnRpc3RvcnkgPyB7IC4uLmVtcHR5UmVzdWx0LCAuLi5wYXJzZWREYXRhLnRpc3RvcnksIGltYWdlOiBmaW5hbEltYWdlc1sxXSwgb2ZmaWNpYWxfbGlua3M6IHBhcnNlZERhdGEudGlzdG9yeS5vZmZpY2lhbF9saW5rcyB8fCBbXSB9IDogZW1wdHlSZXN1bHQsXG4gICAgICAgIHdvcmRwcmVzczogcGFyc2VkRGF0YS53b3JkcHJlc3MgPyB7IC4uLmVtcHR5UmVzdWx0LCAuLi5wYXJzZWREYXRhLndvcmRwcmVzcywgaW1hZ2U6IGZpbmFsSW1hZ2VzWzJdLCBvZmZpY2lhbF9saW5rczogcGFyc2VkRGF0YS53b3JkcHJlc3Mub2ZmaWNpYWxfbGlua3MgfHwgW10gfSA6IGVtcHR5UmVzdWx0XG4gICAgICB9KTtcblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgc2V0RXJyb3IoJ+yYpOulmOqwgCDrsJzsg53tlojsirXri4jri6Q6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBjb3B5VG9DbGlwYm9hcmQgPSBhc3luYyAodGV4dCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBuYXZlckZvbnQgPSBcImZvbnQtZmFtaWx5OiAn64KY64iU6rOg65SVJywgTmFudW1Hb3RoaWMsIHNhbnMtc2VyaWY7XCI7XG4gICAgICBcbiAgICAgIGxldCBwcm9jZXNzZWRUZXh0ID0gdGV4dDtcbiAgICAgIGNvbnN0IHRhYmxlUmVnZXggPSAvXlxcfCguKylcXHxcXG5cXHwoWyA6fC1dKylcXHxcXG4oKFxcfC4rXFx8XFxuPykrKS9nbTtcbiAgICAgIFxuICAgICAgY29uc3QgbWFya2Rvd25Ub0h0bWxUYWJsZSA9IChtYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCBsaW5lcyA9IG1hdGNoLnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBsaW5lc1swXS5zcGxpdCgnfCcpLmZpbHRlcihjZWxsID0+IGNlbGwudHJpbSgpICE9PSAnJykubWFwKGNlbGwgPT4gY2VsbC50cmltKCkpO1xuICAgICAgICBjb25zdCByb3dzID0gbGluZXMuc2xpY2UoMikubWFwKGxpbmUgPT4gbGluZS5zcGxpdCgnfCcpLmZpbHRlcihjZWxsID0+IGNlbGwudHJpbSgpICE9PSAnJykubWFwKGNlbGwgPT4gY2VsbC50cmltKCkpKTtcblxuICAgICAgICBsZXQgaHRtbCA9IGA8dGFibGUgc3R5bGU9XCJ3aWR0aDogMTAwJTsgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgbWFyZ2luOiAyMHB4IDA7IGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7ICR7bmF2ZXJGb250fVwiPmA7XG4gICAgICAgIGh0bWwgKz0gJzx0aGVhZCBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7XCI+PHRyPic7XG4gICAgICAgIGhlYWRlcnMuZm9yRWFjaChoID0+IHtcbiAgICAgICAgICBodG1sICs9IGA8dGggc3R5bGU9XCJib3JkZXI6IDFweCBzb2xpZCAjZGRkOyBwYWRkaW5nOiAxMnB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtd2VpZ2h0OiBib2xkOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1wiPiR7aH08L3RoPmA7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9ICc8L3RyPjwvdGhlYWQ+PHRib2R5Pic7XG4gICAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgIGh0bWwgKz0gJzx0cj4nO1xuICAgICAgICAgIHJvdy5mb3JFYWNoKGNlbGwgPT4ge1xuICAgICAgICAgICAgaHRtbCArPSBgPHRkIHN0eWxlPVwiYm9yZGVyOiAxcHggc29saWQgI2RkZDsgcGFkZGluZzogMTBweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPiR7Y2VsbH08L3RkPmA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaHRtbCArPSAnPC90cj4nO1xuICAgICAgICB9KTtcbiAgICAgICAgaHRtbCArPSAnPC90Ym9keT48L3RhYmxlPic7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfTtcblxuICAgICAgbGV0IGh0bWxDb250ZW50ID0gcHJvY2Vzc2VkVGV4dC5yZXBsYWNlKHRhYmxlUmVnZXgsIG1hcmtkb3duVG9IdG1sVGFibGUpO1xuXG4gICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50XG4gICAgICAgIC5yZXBsYWNlKC9eIyMjICguKiQpL2dpbSwgYDxwIHN0eWxlPVwibWFyZ2luLXRvcDogMzBweDsgbWFyZ2luLWJvdHRvbTogMTBweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTZwdDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMzMzOyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L3A+YClcbiAgICAgICAgLnJlcGxhY2UoL14jIyAoLiokKS9naW0sIGA8cCBzdHlsZT1cIm1hcmdpbi10b3A6IDQwcHg7IG1hcmdpbi1ib3R0b206IDE1cHg7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDIwcHQ7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogIzAwMDsgJHtuYXZlckZvbnR9XCI+JDE8L3NwYW4+PC9wPmApXG4gICAgICAgIC5yZXBsYWNlKC9eXFwqICguKiQpL2dpbSwgYDxsaSBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgJHtuYXZlckZvbnR9XCI+JDE8L3NwYW4+PC9saT5gKVxuICAgICAgICAucmVwbGFjZSgvXFwqXFwqKC4qKVxcKlxcKi9naW0sICc8c3Ryb25nPiQxPC9zdHJvbmc+JylcbiAgICAgICAgLnJlcGxhY2UoLz09ICguKj8pID09L2csICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICNmZmY1YjE7IGZvbnQtd2VpZ2h0OiBib2xkOyBwYWRkaW5nOiAycHggNHB4OyBib3JkZXItcmFkaXVzOiAzcHg7XCI+JDE8L3NwYW4+JylcbiAgICAgICAgLnJlcGxhY2UoLz09KC4qPyk9PS9nLCAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmNWIxOyBmb250LXdlaWdodDogYm9sZDsgcGFkZGluZzogMnB4IDRweDsgYm9yZGVyLXJhZGl1czogM3B4O1wiPiQxPC9zcGFuPicpXG4gICAgICAgIC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4ge1xuICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICBpZiAodHJpbW1lZCA9PT0gJycpIHJldHVybiAnPHA+Jm5ic3A7PC9wPic7IFxuICAgICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJzxwJykgfHwgdHJpbW1lZC5zdGFydHNXaXRoKCc8bGknKSB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoJzx0YWJsZScpKSByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgbGluZS1oZWlnaHQ6IDEuODsgY29sb3I6ICM0NDQ7ICR7bmF2ZXJGb250fVwiPiR7dHJpbW1lZH08L3NwYW4+PC9wPmA7XG4gICAgICAgIH0pLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKS5qb2luKCcnKTtcblxuICAgICAgY29uc3QgYmxvYkh0bWwgPSBuZXcgQmxvYihbaHRtbENvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgY29uc3QgYmxvYlRleHQgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IFtuZXcgQ2xpcGJvYXJkSXRlbSh7ICd0ZXh0L2h0bWwnOiBibG9iSHRtbCwgJ3RleHQvcGxhaW4nOiBibG9iVGV4dCB9KV07XG4gICAgICBcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoZGF0YSk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+yEnOyLneqzvCDtkZzqsIAg7Y+s7ZWo65CcIOyDge2DnOuhnCDrs7XsgqzrkJjsl4jsirXri4jri6QhIPCfk4vwn5OK4pyoJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDbGlwYm9hcmQgZXJyb3I6JywgZXJyKTtcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfthY3siqTtirjroZwg67O17IKs65CY7JeI7Iq164uI64ukISDinIUnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1zbGF0ZS01MCBweS0xMiBweC00IGZvbnQtc2FucyB0ZXh0LXNsYXRlLTkwMFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy00eGwgbXgtYXV0byBzcGFjZS15LThcIj5cbiAgICAgICAgXG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwXCI+PC9kaXY+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC00eGwgZm9udC1ibGFjayB0ZXh0LXRyYW5zcGFyZW50IGJnLWNsaXAtdGV4dCBiZy1ncmFkaWVudC10by1yIGZyb20taW5kaWdvLTYwMCB0by1pbmRpZ28tNDAwIHRyYWNraW5nLXRpZ2h0ZXIgdXBwZXJjYXNlXCI+S09EQVJJIEJMT0cgQUk8L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSl9IGNsYXNzTmFtZT1cInAtMi41IHJvdW5kZWQtZnVsbCBiZy13aGl0ZSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgaG92ZXI6Ymctc2xhdGUtNTAgdHJhbnNpdGlvbi1hbGxcIj7impnvuI88L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzQXV0aGVudGljYXRlZCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicHgtNCBweS0yIHJvdW5kZWQtZnVsbCBiZy1zbGF0ZS04MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1yZWQtNjAwIHRyYW5zaXRpb24tYWxsXCI+7J247KadIO2VtOygnDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNBdXRoTW9kYWxPcGVuKHRydWUpfSBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1mdWxsIGJnLWluZGlnby02MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRyYW5zaXRpb24tYWxsXCI+8J+UkSDsvZTrk5wg7J247KadPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTUwMCBmb250LW1lZGl1bSB0ZXh0LXNtXCI+VjIg66qF7ZKIIOyXlOynhCDquLDrsJggOiDrs7TslYgg67CPIOyEpOyglSDsi5zsiqTthZwg7J207IudIOyZhOujjCDwn6uh8J+QnzwvcD5cbiAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBzaGFkb3cteGwgcC04IGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHNwYWNlLXktOFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItMlwiPuKcje+4jyDtj6zsiqTtjIUg7KO87KCcPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBcbiAgICAgICAgICAgICAgdmFsdWU9e3RvcGljfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvcGljKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgZ2VuZXJhdGVDb250ZW50KCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi7JiIOiAyMDI2IOqyveq4sCDsu6zsspjtjKjsiqQg7IKs7Jqp7LKYIOuwjyDsnKDtmqjquLDqsIRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgYm9yZGVyLWJsdWUtMTAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItYmx1ZS01MDAgdGV4dC1sZyB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1zbGF0ZS01MCBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIOKchSDrsJztlokg7ZSM656r7Y+8IOuwjyDqsJzrs4Qg7Ja07YisIOyEpOyglVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIHRyYW5zaXRpb24tYWxsICR7cGxhdGZvcm1zLm5hdmVyID8gJ2JnLXdoaXRlIGJvcmRlci1ncmVlbi0yMDAgc2hhZG93LXNtJyA6ICdiZy1zbGF0ZS0xMDAvNTAgYm9yZGVyLXRyYW5zcGFyZW50IG9wYWNpdHktNjAnfWB9PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlciBtYi0zIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17cGxhdGZvcm1zLm5hdmVyfSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIG5hdmVyOiAhcGxhdGZvcm1zLm5hdmVyfSl9IGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1ncmVlbi01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctZ3JlZW4tNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LWdyZWVuLTYwMCB0cmFuc2l0aW9uLWNvbG9yc1wiPvCfn6Ig64Sk7J2067KEPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshcGxhdGZvcm1zLm5hdmVyfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLm5hdmVyfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIG5hdmVyOiBlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWdyZWVuLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuq4sOuzuCDruJTroZzqsbBcIj7quLDrs7ggKOy5nOygiC/quZTrgZQpPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7ZW067CV7ZWcIOyghOusuOqwgFwiPu2VtOuwle2VnCDsoITrrLjqsIA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIHRyYW5zaXRpb24tYWxsICR7cGxhdGZvcm1zLnRpc3RvcnkgPyAnYmctd2hpdGUgYm9yZGVyLW9yYW5nZS0yMDAgc2hhZG93LXNtJyA6ICdiZy1zbGF0ZS0xMDAvNTAgYm9yZGVyLXRyYW5zcGFyZW50IG9wYWNpdHktNjAnfWB9PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlciBtYi0zIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17cGxhdGZvcm1zLnRpc3Rvcnl9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3JtcywgdGlzdG9yeTogIXBsYXRmb3Jtcy50aXN0b3J5fSl9IGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1vcmFuZ2UtNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLW9yYW5nZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtb3JhbmdlLTYwMCB0cmFuc2l0aW9uLWNvbG9yc1wiPvCfn6Ag7Yuw7Iqk7Yag66asPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshcGxhdGZvcm1zLnRpc3Rvcnl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMudGlzdG9yeX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCB0aXN0b3J5OiBlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9yYW5nZS01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy53b3JkcHJlc3MgPyAnYmctd2hpdGUgYm9yZGVyLWJsdWUtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy53b3JkcHJlc3N9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3Jtcywgd29yZHByZXNzOiAhcGxhdGZvcm1zLndvcmRwcmVzc30pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtYmx1ZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtYmx1ZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5S1IOybjOuTnO2UhOugiOyKpDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy53b3JkcHJlc3N9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHdvcmRwcmVzczogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QXCI+66qF7L6M7ZWcIOygleuztCDsoITri6zsnpA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7ZXJyb3IgJiYgPHAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNTAwIGZvbnQtYm9sZCB0ZXh0LXNtIGFuaW1hdGUtcHVsc2VcIj57ZXJyb3J9PC9wPn1cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTMgcHktMlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgJHshdXNlSW1hZ2UgPyAndGV4dC1zbGF0ZS00MDAnIDogJ3RleHQtc2xhdGUtMzAwJ31gfT7snbTrr7jsp4Ag7IKs7JqpIOyViO2VqDwvc3Bhbj5cbiAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFVzZUltYWdlKCF1c2VJbWFnZSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHJlbGF0aXZlIHctMTIgaC02IHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgJHt1c2VJbWFnZSA/ICdiZy1pbmRpZ28tNjAwJyA6ICdiZy1zbGF0ZS0zMDAnfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgYWJzb2x1dGUgdG9wLTEgbGVmdC0xIHctNCBoLTQgYmctd2hpdGUgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tdHJhbnNmb3JtIGR1cmF0aW9uLTMwMCAke3VzZUltYWdlID8gJ3RyYW5zbGF0ZS14LTYnIDogJ3RyYW5zbGF0ZS14LTAnfWB9IC8+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1ib2xkIHRyYW5zaXRpb24tY29sb3JzICR7dXNlSW1hZ2UgPyAndGV4dC1pbmRpZ28tNjAwJyA6ICd0ZXh0LXNsYXRlLTQwMCd9YH0+7J2066+47KeAIOyekOuPmSDsgr3snoUgT048L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDb250ZW50fVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgYmctaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRleHQtd2hpdGUgZm9udC1ibGFjayB0ZXh0LWxnIHAtNSByb3VuZGVkLTJ4bCBzaGFkb3cteGwgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLVswLjk4XSBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBnYXAtM1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gLW1sLTEgbXItMyBoLTUgdy01IHRleHQtd2hpdGVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjbGFzc05hbWU9XCJvcGFjaXR5LTI1XCIgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjRcIj48L2NpcmNsZT48cGF0aCBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3pcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAg7L2U64uk66as6rCAIOunueugrO2eiCDsnpHshLEg7KSR7J6F64uI64ukLi4uXG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6ICfwn5qAIOybkOuyhO2KvCDrj5nsi5wg7IOd7ISx7ZWY6riwJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge09iamVjdC52YWx1ZXMocmVzdWx0cykuc29tZSh2YWwgPT4gdmFsLmNvbnRlbnQpICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGJnLXNsYXRlLTUwLzUwXCI+XG4gICAgICAgICAgICAgIHtbJ25hdmVyJywgJ3Rpc3RvcnknLCAnd29yZHByZXNzJ10uZmlsdGVyKHRhYiA9PiBwbGF0Zm9ybXNbdGFiXSkubWFwKCh0YWIpID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e3RhYn1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYih0YWIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIHB5LTQgZm9udC1ib2xkIHRleHQtc20gdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSB0YWIgXG4gICAgICAgICAgICAgICAgICAgID8gJ3RleHQtYmx1ZS02MDAgYmctd2hpdGUgYm9yZGVyLWItMiBib3JkZXItYmx1ZS02MDAnIFxuICAgICAgICAgICAgICAgICAgICA6ICd0ZXh0LXNsYXRlLTUwMCBob3Zlcjp0ZXh0LXNsYXRlLTcwMCBob3ZlcjpiZy1zbGF0ZS01MCdcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHt0YWIgPT09ICduYXZlcicgPyAn8J+foiDrhKTsnbTrsoQg67iU66Gc6re4JyA6IHRhYiA9PT0gJ3Rpc3RvcnknID8gJ/Cfn6Ag7Yuw7Iqk7Yag66asJyA6ICfwn5S1IOybjOuTnO2UhOugiOyKpCd9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IHNwYWNlLXktNlwiPlxuICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmltYWdlICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgbWItNlwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3Jlc3VsdHNbYWN0aXZlVGFiXS5pbWFnZX0gYWx0PVwiQmxvZyBCYWNrZ3JvdW5kXCIgY2xhc3NOYW1lPVwidy1mdWxsIGgtWzM1MHB4XSBvYmplY3QtY292ZXIgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tNzAwIGdyb3VwLWhvdmVyOnNjYWxlLTEwNVwiIC8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0wIGxlZnQtMCByaWdodC0wIHAtMyBiZy1ncmFkaWVudC10by10IGZyb20tYmxhY2svNjAgdG8tdHJhbnNwYXJlbnQgdGV4dC13aGl0ZSB0ZXh0LVsxMHB4XSBmb250LW1lZGl1bSBvcGFjaXR5LTAgZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5XCI+8J+TuCBQaG90byB2aWEgVW5zcGxhc2ggKEFJIOy2lOyynCDsnbTrr7jsp4ApPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmx1ZS01MC81MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtYmx1ZS01MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+VGl0bGU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLnRpdGxlKX0gY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6YmctYmx1ZS01MCB0ZXh0LWJsdWUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItYmx1ZS0xMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj7wn5OLIOygnOuqqSDrs7Xsgqw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgbGVhZGluZy10aWdodFwiPntyZXN1bHRzW2FjdGl2ZVRhYl0udGl0bGUgfHwgJ+ygnOuqqSDsg53shLEg7KSRLi4uJ308L2gyPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBweC0xXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+Q29udGVudDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IGNvcHlUb0NsaXBib2FyZChyZXN1bHRzW2FjdGl2ZVRhYl0uY29udGVudCl9IGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+8J+TiyDrs7jrrLgg67O17IKsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgbWluLWgtWzMwMHB4XSBzaGFkb3ctc20gZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvc2UgcHJvc2Utc2xhdGUgbWF4LXctbm9uZSB0ZXh0LWJhc2UgbGVhZGluZy1yZWxheGVkIHByb3NlLWgyOnRleHQtMnhsIHByb3NlLWgyOmZvbnQtYm9sZCBwcm9zZS1oMjp0ZXh0LXNsYXRlLTkwMCBwcm9zZS1oMjptdC0xMiBwcm9zZS1oMjptYi02IHByb3NlLWgyOnBiLTIgcHJvc2UtaDI6Ym9yZGVyLWIgcHJvc2UtaDI6Ym9yZGVyLXNsYXRlLTEwMCBwcm9zZS1oMzp0ZXh0LXhsIHByb3NlLWgzOmZvbnQtYm9sZCBwcm9zZS1oMzp0ZXh0LXNsYXRlLTgwMCBwcm9zZS1oMzptdC04IHByb3NlLWgzOm1iLTQgcHJvc2UtcDptYi02IHByb3NlLWxpOm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJlYWN0TWFya2Rvd24gXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50cz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gPT3qsJXsobA9PSDrpbwg66+466as67O06riw7JeQ7ISc64+EIOuFuOuegOyDiSDrsLDqsr3snLzroZwg7ZGc7IucXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAoe25vZGUsIGlubGluZSwgY2xhc3NOYW1lLCBjaGlsZHJlbiwgLi4ucHJvcHN9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gL15cXF49PSguKik9PVxcXiQvLmV4ZWMoY2hpbGRyZW4pOyAvLyDsnoTsi5wg67Cp7Y64XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmxpbmUgPyA8Y29kZSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gey4uLnByb3BzfT57Y2hpbGRyZW59PC9jb2RlPiA6IDxwcmUgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHsuLi5wcm9wc30+e2NoaWxkcmVufTwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmNvbnRlbnR9XG4gICAgICAgICAgICAgICAgICAgIDwvUmVhY3RNYXJrZG93bj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1hbWJlci01MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIG10LTRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhsXCI+4pqg77iPPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTgwMCBmb250LWJvbGQgdGV4dC1zbSBtYi0xXCI+7L2U64uk66as7J2YIO2Mqe2KuOyytO2BrCDslYzrprw8L3A+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTcwMCB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBtYi0zXCI+67O4IOy9mO2FkOy4oOuKlCBBSeqwgCDsi6Tsi5zqsIQg642w7J207YSw66W8IOq4sOuwmOycvOuhnCDsg53shLHtlZwg6rKw6rO866y87J6F64uI64ukLiDspJHsmpTtlZwg7IiY7LmY64KYIOuCoOynnCDrk7HsnYAg67CY65Oc7IucIOyVhOuemCDqs7Xsi50g6rSA66CoIOunge2BrOulvCDthrXtlbQg7LWc7KKFIO2ZleyduCDtm4Qg67Cc7ZaJ7ZW0IOyjvOyEuOyalCE8L3A+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtyZXN1bHRzW2FjdGl2ZVRhYl0ub2ZmaWNpYWxfbGlua3MgJiYgcmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmtzLm1hcCgobGluaywgaWR4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2lkeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2xpbmsudXJsfSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcHgtMyBweS0xLjUgYmctYW1iZXItMjAwIGhvdmVyOmJnLWFtYmVyLTMwMCB0ZXh0LWFtYmVyLTkwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIGJvcmRlciBib3JkZXItYW1iZXItMzAwXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5SXIHtsaW5rLm5hbWV9IOuwlOuhnOqwgOq4sFxuICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+SGFzaHRhZ3M8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLnRhZ3MpfSBjbGFzc05hbWU9XCJweC0zIHB5LTEuNSBiZy13aGl0ZSBob3ZlcjpiZy1zbGF0ZS0xMDAgdGV4dC1zbGF0ZS02MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj7wn5OLIO2DnOq3uCDrs7Xsgqw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWJsdWUtNjAwIGZvbnQtbWVkaXVtXCI+e3Jlc3VsdHNbYWN0aXZlVGFiXS50YWdzIHx8ICcj7ZW07Iuc7YOc6re4J308L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cblxuICAgICAge2lzU2V0dGluZ3NPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctbWQgdy1mdWxsIHNwYWNlLXktNiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7impnvuI8g7Iuc7Iqk7YWcIOyEpOyglTwvaDI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMFwiPuKclTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj7wn5SRIEdlbWluaSBBUEkgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPXtzaG93QXBpS2V5ID8gXCJ0ZXh0XCIgOiBcInBhc3N3b3JkXCJ9IHZhbHVlPXthcGlLZXl9IG9uQ2hhbmdlPXtoYW5kbGVTYXZlQXBpS2V5fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHByLTEyIHJvdW5kZWQtMnhsIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOnJpbmctNCBmb2N1czpyaW5nLWluZGlnby01MDAvMTAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsIGZvbnQtbW9ubyB0ZXh0LXNtXCIgcGxhY2Vob2xkZXI9XCJHZW1pbmkgQVBJIO2CpOulvCDsnoXroKXtlZjshLjsmpRcIiAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dBcGlLZXkoIXNob3dBcGlLZXkpfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBwLTEuNSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTUwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGxcIj57c2hvd0FwaUtleSA/IFwi8J+Rge+4j1wiIDogXCLwn5GB77iP4oCN8J+XqO+4j1wifTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+8J+TuCBVbnNwbGFzaCBBY2Nlc3MgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPXtzaG93VW5zcGxhc2hLZXkgPyBcInRleHRcIiA6IFwicGFzc3dvcmRcIn0gdmFsdWU9e3Vuc3BsYXNoS2V5fSBvbkNoYW5nZT17KGUpID0+IHsgc2V0VW5zcGxhc2hLZXkoZS50YXJnZXQudmFsdWUpOyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndW5zcGxhc2hfa2V5JywgZS50YXJnZXQudmFsdWUpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHByLTEyIHJvdW5kZWQtMnhsIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOnJpbmctNCBmb2N1czpyaW5nLWluZGlnby01MDAvMTAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsIGZvbnQtbW9ubyB0ZXh0LXNtXCIgcGxhY2Vob2xkZXI9XCJVbnNwbGFzaCDtgqTrpbwg7J6F66Cl7ZWY7IS47JqUXCIgLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93VW5zcGxhc2hLZXkoIXNob3dVbnNwbGFzaEtleSl9IGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTQgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHAtMS41IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNTAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWFsbFwiPntzaG93VW5zcGxhc2hLZXkgPyBcIvCfkYHvuI9cIiA6IFwi8J+Rge+4j+KAjfCfl6jvuI9cIn08L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLWluZGlnby01MCByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWluZGlnby0xMDAgc3BhY2UteS0zIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJsYWNrIHRleHQtaW5kaWdvLTYwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj7wn5K+IOy9lOuLpOumrCDrsLHsl4Ug6rSA66asPC9oMz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVEb3dubG9hZEJhY2t1cH0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgYmctd2hpdGUgaG92ZXI6YmctaW5kaWdvLTEwMCB0ZXh0LWluZGlnby02MDAgcm91bmRlZC14bCBmb250LWJvbGQgdGV4dC1zbSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1pbmRpZ28tMjAwIHRyYW5zaXRpb24tYWxsXCI+8J+TgiDtmITsnqwg67KE7KCEIOymieyLnCDrsLHsl4Uo64uk7Jq066Gc65OcKTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTQgYm9yZGVyLXQgYm9yZGVyLXNsYXRlLTEwMFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dlbWluaV9hcGlfa2V5JywgYXBpS2V5KTsgc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpOyB0cmlnZ2VyVG9hc3QoJ+uMgO2RnOuLmCwg7ISk7KCV7J20IOyggOyepeuQmOyXiOyKteuLiOuLpCEg8J+roScpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtODAwIHRleHQtd2hpdGUgcm91bmRlZC0yeGwgZm9udC1ib2xkIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7ISk7KCVIOyggOyepSDrsI8g7KCB7JqpPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7aXNBdXRoTW9kYWxPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctc20gdy1mdWxsIHNwYWNlLXktNiB0ZXh0LWNlbnRlciBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ibGFjayB0ZXh0LXNsYXRlLTgwMFwiPuuMgO2RnOuLmCDsnbjspp0g7ZWE7JqUIPCfq6E8L2gyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIHZhbHVlPXthdXRoQ29kZX0gb25DaGFuZ2U9eyhlKSA9PiBzZXRBdXRoQ29kZShlLnRhcmdldC52YWx1ZSl9IG9uS2V5RG93bj17KGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGhhbmRsZUxvZ2luKCl9IHBsYWNlaG9sZGVyPVwi7L2U65Oc66W8IOyeheugpe2VmOyEuOyalFwiIGNsYXNzTmFtZT1cInctZnVsbCBwLTQgcm91bmRlZC0yeGwgYmctc2xhdGUtNTAgYm9yZGVyLTIgYm9yZGVyLXNsYXRlLTIwMCB0ZXh0LWNlbnRlciB0ZXh0LTJ4bCBmb250LWJsYWNrIGZvY3VzOmJvcmRlci1pbmRpZ28tNTAwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbFwiIC8+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ2lufSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby03MDAgdGV4dC13aGl0ZSByb3VuZGVkLTJ4bCBmb250LWJsYWNrIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7J247Kad7ZWY6riwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge3Nob3dUb2FzdCAmJiAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdmaXhlZCcsIGJvdHRvbTogJzQwcHgnLCBsZWZ0OiAnNTAlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtNTAlKScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC44NSknLCBjb2xvcjogJ3doaXRlJywgcGFkZGluZzogJzEycHggMjRweCcsIGJvcmRlclJhZGl1czogJzUwcHgnLCB6SW5kZXg6IDEwMDAwLCBmb250U2l6ZTogJzAuOTVyZW0nLCBmb250V2VpZ2h0OiAnNTAwJywgYm94U2hhZG93OiAnMCA4cHggMzJweCByZ2JhKDAsMCwwLDAuMyknLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjEpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDhweCknLCBhbmltYXRpb246ICdmYWRlSW5PdXQgMi41cyBlYXNlLWluLW91dCBmb3J3YXJkcycsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxuICAgICAgICAgIHt0b2FzdH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICA8c3R5bGU+e2BcbiAgICAgICAgQGtleWZyYW1lcyBmYWRlSW5PdXQge1xuICAgICAgICAgIDAlIHsgb3BhY2l0eTogMDsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgMjBweCk7IH1cbiAgICAgICAgICAxNSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTsgfVxuICAgICAgICAgIDg1JSB7IG9wYWNpdHk6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDApOyB9XG4gICAgICAgICAgMTAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC0xMHB4KTsgfVxuICAgICAgICB9XG4gICAgICBgfTwvc3R5bGU+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDtcbiJdfQ==