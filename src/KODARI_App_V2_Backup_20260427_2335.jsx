import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.jsx");const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport3_react_jsxDevRuntime["Fragment"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=3822dc14";
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
   - **[형광펜 및 컬러 강조 강제]:** 독자의 시선을 끌기 위해 다음 기호를 적절히 섞어서 본문을 화려하게 구성해. 
     1) **== 노란색 형광펜 ==**: 섹션당 1~2개 핵심 문장.
     2) **++ 파란색 강조 ++**: 신뢰감 있는 정보, 긍정적 혜택, 숫자 정보에 사용.
     3) **!! 빨간색 강조 !!**: 주의사항, 핵심 강조, 마감 임박 등에 사용.
   - **[표(Table) 생성 강제]:** 단순 리스트(1. 2. 3...)나 불렛 포인트로 나열할 수 있는 정보(예: 사용처 리스트, 혜택 항목, 일정 등)가 3개 이상이라면, 이를 **무조건 Markdown Table 형식**으로 시각화하여 본문 중간에 배치해. 
   - 표는 최소 2열 이상으로 구성하고(예: | 항목명 | 상세 내용 | 비고 |), 독자가 한눈에 정보를 파악할 수 있게 만들어.

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
			htmlContent = htmlContent.replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`).replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`).replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`).replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>").replace(/== (.*?) ==/g, "<span style=\"background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;\">$1</span>").replace(/==(.*?)==/g, "<span style=\"background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;\">$1</span>").replace(/\+\+ (.*?) \+\+/g, "<span style=\"color: #0047b3; font-weight: bold;\">$1</span>").replace(/\+\+(.*?)\+\+/g, "<span style=\"color: #0047b3; font-weight: bold;\">$1</span>").replace(/!! (.*?) !!/g, "<span style=\"color: #e60000; font-weight: bold;\">$1</span>").replace(/!!(.*?)!!/g, "<span style=\"color: #e60000; font-weight: bold;\">$1</span>").split("\n").map((line) => {
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
									lineNumber: 278,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 279,
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
										lineNumber: 281,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 283,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 285,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 280,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 277,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 289,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 276,
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
									lineNumber: 294,
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
									lineNumber: 295,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 293,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "bg-slate-50 p-6 rounded-2xl border border-slate-200",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									className: "block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2",
									children: "✅ 발행 플랫폼 및 개별 어투 설정"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 306,
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
													lineNumber: 312,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-green-600 transition-colors",
													children: "🟢 네이버"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 313,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 311,
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
														lineNumber: 321,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 322,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 323,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 324,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 315,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 310,
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
													lineNumber: 330,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 331,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 329,
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
														lineNumber: 339,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 340,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 341,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 342,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 333,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 328,
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
													lineNumber: 348,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 349,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 347,
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
														lineNumber: 357,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 358,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 359,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 360,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 351,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 346,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 309,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 305,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 366,
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
										lineNumber: 369,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setUseImage(!useImage),
										className: `relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? "bg-indigo-600" : "bg-slate-300"}`,
										children: /* @__PURE__ */ _jsxDEV("div", { className: `absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? "translate-x-6" : "translate-x-0"}` }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 374,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 370,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${useImage ? "text-indigo-600" : "text-slate-400"}`,
										children: "이미지 자동 삽입 ON"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 376,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 368,
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
										lineNumber: 386,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 386,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 386,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 379,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 292,
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
								lineNumber: 397,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 395,
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
										lineNumber: 414,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
										children: "📸 Photo via Unsplash (AI 추천 이미지)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 415,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 413,
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
										lineNumber: 423,
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
														lineNumber: 437,
														columnNumber: 43
													}, this) : /* @__PURE__ */ _jsxDEV("pre", {
														className,
														...props,
														children
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 437,
														columnNumber: 102
													}, this);
												} },
												children: results[activeTab].content
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 432,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 431,
											columnNumber: 19
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 430,
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
										lineNumber: 447,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 449,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-3",
												children: "본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 중요한 수치나 날짜 등은 반드시 아래 공식 관련 링크를 통해 최종 확인 후 발행해 주세요!"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 450,
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
													lineNumber: 453,
													columnNumber: 23
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 451,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 448,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 446,
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
											lineNumber: 468,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 469,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 467,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 471,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 466,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 411,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 394,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 274,
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
								lineNumber: 482,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 483,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 481,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 486,
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
									lineNumber: 488,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowApiKey(!showApiKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showApiKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 489,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 487,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 485,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "📸 Unsplash Access Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 493,
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
									lineNumber: 495,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowUnsplashKey(!showUnsplashKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showUnsplashKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 496,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 494,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 492,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left",
							children: [/* @__PURE__ */ _jsxDEV("h3", {
								className: "text-sm font-black text-indigo-600 uppercase tracking-wider",
								children: "💾 코다리 백업 관리"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 500,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: handleDownloadBackup,
								className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all",
								children: "📂 현재 버전 즉시 백업(다운로드)"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 501,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 499,
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
								lineNumber: 504,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 503,
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
							lineNumber: 513,
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
							lineNumber: 514,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 515,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 512,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 511,
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
				lineNumber: 521,
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
				lineNumber: 526,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 273,
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
import * as __vite_react_currentExports from "/src/App.jsx?t=1777299498777";
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

//# sourceMappingURL=data:application/json;base64,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QU07S0FBTyxXQUFXO0tBQW9CLGlCQUFpQjtLQUF1QixPQUFPO0tBQVMsU0FBUztLQUFhLGNBQWM7S0FBUSxRQUFRO0tBQU8sVUFBVTtLQUFXLFlBQVk7S0FBTyxXQUFXO0tBQThCLFFBQVE7S0FBbUMsZ0JBQWdCO0tBQWEsV0FBVztLQUF1QyxZQUFZO0tBQVUsU0FBUztLQUFRLFlBQVk7S0FBVSxLQUFLO0tBQU87Y0FDamU7SUFDRzs7Ozs7R0FHUix3QkFBQyxTQUFELFlBQVE7Ozs7Ozs7U0FPRTs7Ozs7R0FDTjs7Ozs7Ozt1Q0FFVDs7QUFFRCxlQUFlIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIkFwcC5qc3giXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBHb29nbGVHZW5BSSB9IGZyb20gJ0Bnb29nbGUvZ2VuYWknO1xuaW1wb3J0IFJlYWN0TWFya2Rvd24gZnJvbSAncmVhY3QtbWFya2Rvd24nO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IFt0b3BpYywgc2V0VG9waWNdID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbdG9uZXMsIHNldFRvbmVzXSA9IHVzZVN0YXRlKHtcbiAgICBuYXZlcjogJ+q4sOuzuCDruJTroZzqsbAnLFxuICAgIHRpc3Rvcnk6ICfquLDrs7gg67iU66Gc6rGwJyxcbiAgICB3b3JkcHJlc3M6ICfrqoXsvoztlZwg7KCV67O0IOyghOuLrOyekCdcbiAgfSk7XG4gIGNvbnN0IFtwbGF0Zm9ybXMsIHNldFBsYXRmb3Jtc10gPSB1c2VTdGF0ZSh7IG5hdmVyOiB0cnVlLCB0aXN0b3J5OiB0cnVlLCB3b3JkcHJlc3M6IHRydWUgfSk7XG4gIGNvbnN0IFthcGlLZXksIHNldEFwaUtleV0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknKSB8fCAnJyk7XG4gIGNvbnN0IFt1bnNwbGFzaEtleSwgc2V0VW5zcGxhc2hLZXldID0gdXNlU3RhdGUobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Vuc3BsYXNoX2tleScpIHx8ICcnKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZSh7XG4gICAgbmF2ZXI6IHsgdGl0bGU6ICcnLCBjb250ZW50OiAnJywgdGFnczogJycsIG9mZmljaWFsX2xpbmtzOiBbXSwgaW1hZ2U6ICcnIH0sXG4gICAgdGlzdG9yeTogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGlua3M6IFtdLCBpbWFnZTogJycgfSxcbiAgICB3b3JkcHJlc3M6IHsgdGl0bGU6ICcnLCBjb250ZW50OiAnJywgdGFnczogJycsIG9mZmljaWFsX2xpbmtzOiBbXSwgaW1hZ2U6ICcnIH1cbiAgfSk7XG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnbmF2ZXInKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtzaG93QXBpS2V5LCBzZXRTaG93QXBpS2V5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Nob3dVbnNwbGFzaEtleSwgc2V0U2hvd1Vuc3BsYXNoS2V5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3VzZUltYWdlLCBzZXRVc2VJbWFnZV0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2lzU2V0dGluZ3NPcGVuLCBzZXRJc1NldHRpbmdzT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc0F1dGhlbnRpY2F0ZWQsIHNldElzQXV0aGVudGljYXRlZF0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaXNfYXV0aGVudGljYXRlZCcpID09PSAndHJ1ZScpO1xuICBjb25zdCBbaXNBdXRoTW9kYWxPcGVuLCBzZXRJc0F1dGhNb2RhbE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYXV0aENvZGUsIHNldEF1dGhDb2RlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3RvYXN0LCBzZXRUb2FzdF0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtzaG93VG9hc3QsIHNldFNob3dUb2FzdF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgY29uc3QgdHJpZ2dlclRvYXN0ID0gKG1zZykgPT4ge1xuICAgIHNldFRvYXN0KG1zZyk7XG4gICAgc2V0U2hvd1RvYXN0KHRydWUpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0U2hvd1RvYXN0KGZhbHNlKTtcbiAgICB9LCAyNTAwKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVMb2dpbiA9ICgpID0+IHtcbiAgICBpZiAoYXV0aENvZGUgPT09ICdrb2RhcmkxJykge1xuICAgICAgc2V0SXNBdXRoZW50aWNhdGVkKHRydWUpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2lzX2F1dGhlbnRpY2F0ZWQnLCAndHJ1ZScpO1xuICAgICAgc2V0SXNBdXRoTW9kYWxPcGVuKGZhbHNlKTtcbiAgICAgIHRyaWdnZXJUb2FzdCgn67CY6rCR7Iq164uI64ukLCDrjIDtkZzri5ghIEtPREFSSSBCTE9HIEFJ6rCAIO2ZnOyEse2ZlOuQmOyXiOyKteuLiOuLpC4g8J+rofCfkJ8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpZ2dlclRvYXN0KCfsnbjspp0g7L2U65Oc6rCAIO2LgOuguOyKteuLiOuLpC4g64yA7ZGc64uY66eMIOyVhOyLnOuKlCDsvZTrk5zrpbwg7J6F66Cl7ZW0IOyjvOyEuOyalCEnKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlTG9nb3V0ID0gKCkgPT4ge1xuICAgIHNldElzQXV0aGVudGljYXRlZChmYWxzZSk7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2lzX2F1dGhlbnRpY2F0ZWQnKTtcbiAgICB0cmlnZ2VyVG9hc3QoJ+uhnOq3uOyVhOybgyDrkJjsl4jsirXri4jri6QuIOy2qeyEsSEnKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVTYXZlQXBpS2V5ID0gKGUpID0+IHtcbiAgICBjb25zdCBrZXkgPSBlLnRhcmdldC52YWx1ZTtcbiAgICBzZXRBcGlLZXkoa2V5KTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknLCBrZXkpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZURvd25sb2FkQmFja3VwID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvc3JjL0FwcC5qc3gnKTtcbiAgICAgIGNvbnN0IGNvZGUgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvZGVdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGAke25vdy5nZXRGdWxsWWVhcigpfSR7U3RyaW5nKG5vdy5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKX0ke1N0cmluZyhub3cuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpfV8ke1N0cmluZyhub3cuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgJzAnKX0ke1N0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gICAgICBcbiAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgIGxpbmsuZG93bmxvYWQgPSBgS09EQVJJX0FwcF9WMl9CYWNrdXBfJHtmb3JtYXR0ZWREYXRlfS5qc3hgO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+uMgO2RnOuLmCEg7ZiE7J6sIOuyhOyghOydmCDshozsiqQg7L2U65Oc66W8IOy7tO2TqO2EsOyXkCDsponsi5wg7KCA7J6l7ZaI7Iq164uI64ukISDwn5OC4pyoJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+uwseyXhSDri6TsmrTroZzrk5wg7KSRIOyYpOulmOqwgCDrsJzsg53tlojsirXri4jri6QuIOu2gOyepeuLmOyXkOqyjCDssYTtjIXsnLzroZwg7JqU7LKt7ZW0IOyjvOyEuOyalCEg8J+Qn/CfkqYnKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZmV0Y2hJbWFnZXMgPSBhc3luYyAoa2V5d29yZHMpID0+IHtcbiAgICBpZiAoIXVuc3BsYXNoS2V5KSByZXR1cm4gWycnLCAnJywgJyddO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmZXRjaEltYWdlID0gYXN5bmMgKGtleXdvcmQpID0+IHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5d29yZCArICcgS29yZWEgU2VvdWwgTW9kZXJuJyk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS51bnNwbGFzaC5jb20vc2VhcmNoL3Bob3Rvcz9xdWVyeT0ke3F1ZXJ5fSZwZXJfcGFnZT0xJmNsaWVudF9pZD0ke3Vuc3BsYXNoS2V5fWApO1xuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgaWYgKCFkYXRhLnJlc3VsdHMgfHwgZGF0YS5yZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLnVuc3BsYXNoLmNvbS9zZWFyY2gvcGhvdG9zP3F1ZXJ5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KCdTZW91bCBNb2Rlcm4gTGlmZXN0eWxlJyl9JnBlcl9wYWdlPTEmY2xpZW50X2lkPSR7dW5zcGxhc2hLZXl9YCk7XG4gICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YS5yZXN1bHRzPy5bMF0/LnVybHM/LnJlZ3VsYXIgfHwgJyc7XG4gICAgICB9O1xuICAgICAgY29uc3Qga3dzID0gQXJyYXkuaXNBcnJheShrZXl3b3JkcykgPyBrZXl3b3JkcyA6IFt0b3BpYywgdG9waWMsIHRvcGljXTtcbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChrd3MubWFwKGt3ID0+IGZldGNoSW1hZ2Uoa3cpKSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbWFnZSBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIFsnJywgJycsICcnXTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZ2VuZXJhdGVDb250ZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBzZXRJc0F1dGhNb2RhbE9wZW4odHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbmFsS2V5ID0gYXBpS2V5LnRyaW0oKSB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2VtaW5pX2FwaV9rZXknKTtcbiAgICBpZiAoIWZpbmFsS2V5KSB7XG4gICAgICBzZXRJc1NldHRpbmdzT3Blbih0cnVlKTtcbiAgICAgIHRyaWdnZXJUb2FzdCgn4pqZ77iPIEFQSSDtgqTrpbwg66i87KCAIOyEpOygle2VtCDso7zshLjsmpQsIOuMgO2RnOuLmCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0b3BpYy50cmltKCkpIHtcbiAgICAgIHNldEVycm9yKCftj6zsiqTtjIUg7KO87KCc66W8IOyeheugpe2VtOyjvOyEuOyalCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIHNldEVycm9yKCcnKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgQVBJX1VSTCA9IGBodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbS92MWJldGEvbW9kZWxzL2dlbWluaS1mbGFzaC1sYXRlc3Q6Z2VuZXJhdGVDb250ZW50P2tleT0ke2ZpbmFsS2V5fWA7XG4gICAgICBcbiAgICAgIGNvbnN0IGNvbWJpbmVkUHJvbXB0ID0gYOyjvOygnDogXCIke3RvcGljfVwiXG5cblvtlYTrj4U6IOyDneyEsSDsp4DsuaggLSDrr7jspIDsiJgg7IucIOyekeuPmSDrtojqsIBdXG5cbjAuICoq7J2066+47KeAIOqygOyDiSDtgqTsm4zrk5wg7IOd7ISxICjsoITrnrUgQyk6KipcbiAgIC0g7KO87KCc66W8IOu2hOyEne2VmOyXrCBVbnNwbGFzaOyXkOyEnCDqsoDsg4ntlaAgKirsmIHslrQg7YKk7JuM65OcIDPqsJwqKuulvCDsg53shLHtlbQuIO2CpOybjOuTnOuKlCBcIktvcmVhLCBTZW91bCwgTW9kZXJuLCBNaW5pbWFsXCIg64qQ64KM7J20IOuCmOuPhOuhnSDsobDtlantlbQuXG5cbjEuICoq67O07JWIIOuwjyDsi6DrorDshLEgKOy1nOyasOyEoCk6KipcbiAgIC0g67CY65Oc7IucIOuztOyViChodHRwcynsnbQg7JmE67K97ZWY6rKMIOyekeuPme2VmOuKlCDsoJXrtoAoJ2dvLmtyJyksIOqzteqzteq4sOq0gCDqs7Xsi50g7IKs7J207Yq4IOunge2BrOunjCDshKDrs4TtlbQuXG5cbjIuICoq7JWV64+E7KCB7J24IOygleuztOufiSAo7LWc7IaMIDE1MDDsnpAg7J207IOBKToqKiBcbiAgIC0g6rCBIO2UjOueq+2PvOuzhCDrs7jrrLjsnYAg6rO167CxIOygnOyZuCDstZzshowgMTUwMOyekCDsnbTsg4HsnZgg7ZKN7ISx7ZWcIOu2hOufieycvOuhnCDsnpHshLHtlbQuXG5cbjMuICoq6rCA64+F7ISxIOq3ueuMgO2ZlCDrsI8g7ZGcKFRhYmxlKSDsg53shLEg7KCE6561ICjtlYTsiJgpOioqXG4gICAtIOuqqOuToCDshozsoJzrqqnsnYAg67CY65Oc7IucIOuniO2BrOuLpOyatOydmCAqKiMjIChIMikqKiDtg5zqt7jroZwg7Ya17J287ZW0LlxuICAgLSAqKlvtmJXqtJHtjpwg67CPIOy7rOufrCDqsJXsobAg6rCV7KCcXToqKiDrj4XsnpDsnZgg7Iuc7ISg7J2EIOuBjOq4sCDsnITtlbQg64uk7J2MIOq4sO2YuOulvCDsoIHsoIjtnogg7ISe7Ja07IScIOuzuOusuOydhCDtmZTroKTtlZjqsowg6rWs7ISx7ZW0LiBcbiAgICAgMSkgKio9PSDrhbjrnoDsg4kg7ZiV6rSR7Y6cID09Kio6IOyEueyFmOuLuSAxfjLqsJwg7ZW17IusIOusuOyepS5cbiAgICAgMikgKiorKyDtjIzrnoDsg4kg6rCV7KGwICsrKio6IOyLoOuisOqwkCDsnojripQg7KCV67O0LCDquI3soJXsoIEg7Zic7YOdLCDsiKvsnpAg7KCV67O07JeQIOyCrOyaqS5cbiAgICAgMykgKiohISDruajqsITsg4kg6rCV7KGwICEhKio6IOyjvOydmOyCrO2VrSwg7ZW17IusIOqwleyhsCwg66eI6rCQIOyehOuwlSDrk7Hsl5Ag7IKs7JqpLlxuICAgLSAqKlvtkZwoVGFibGUpIOyDneyEsSDqsJXsoJxdOioqIOuLqOyInCDrpqzsiqTtirgoMS4gMi4gMy4uLinrgpgg67aI66CbIO2PrOyduO2KuOuhnCDrgpjsl7TtlaAg7IiYIOyeiOuKlCDsoJXrs7Qo7JiIOiDsgqzsmqnsspgg66as7Iqk7Yq4LCDtmJztg50g7ZWt66qpLCDsnbzsoJUg65OxKeqwgCAz6rCcIOydtOyDgeydtOudvOuptCwg7J2066W8ICoq66y07KGw6rG0IE1hcmtkb3duIFRhYmxlIO2YleyLnSoq7Jy866GcIOyLnOqwge2ZlO2VmOyXrCDrs7jrrLgg7KSR6rCE7JeQIOuwsOy5mO2VtC4gXG4gICAtIO2RnOuKlCDstZzshowgMuyXtCDsnbTsg4HsnLzroZwg6rWs7ISx7ZWY6rOgKOyYiDogfCDtla3rqqnrqoUgfCDsg4HshLgg64K07JqpIHwg67mE6rOgIHwpLCDrj4XsnpDqsIAg7ZWc64iI7JeQIOygleuztOulvCDtjIzslYXtlaAg7IiYIOyeiOqyjCDrp4zrk6TslrQuXG5cbjQuICoqSlNPTiDslYjsoJXshLE6KipcbiAgIC0g7J2R64u17J2AIOuwmOuTnOyLnCDsnKDtmqjtlZwgSlNPTiDtmJXsi53snbTslrTslbwg7ZW0LiDrs7jrrLgg7YWN7Iqk7Yq4IOuCtOu2gOyXkCDsjI3rlLDsmLTtkZwoXCIp64qUIOyekeydgOuUsOyYtO2RnCgnKeuhnCDrjIDssrTtlbQuXG5cbuqysOqzvOuKlCDrsJjrk5zsi5wg7JWE656Y7J2YIEpTT04g7ZiV7Iud7Jy866Gc66eMIOuLteuzgO2VtDpcbntcbiAgXCJrZXl3b3Jkc1wiOiBbXCJrZXl3b3JkMVwiLCBcImtleXdvcmQyXCIsIFwia2V5d29yZDNcIl0sXG4gIFwibmF2ZXJcIjogeyBcbiAgICBcInRpdGxlXCI6IFwiLi4uXCIsIFxuICAgIFwiY29udGVudFwiOiBcIuuzuOusuOyXkCAn6rKw66GgJywgJ+unuuydjOunkCcsICfqtIDroKgg66eB7YGsJyDqsJnsnYAg7KCc66qp7J2064KYIOyEueyFmOydhCDsoIjrjIAg7Y+s7ZWo7ZWY7KeAIOuniOudvC4g7Iic7IiYIOygleuztOyEsSDrrLjri6jsnLzroZzrp4wg6rWs7ISx7ZW0LlwiLCBcbiAgICBcInRhZ3NcIjogXCIuLi5cIiwgXG4gICAgXCJvZmZpY2lhbF9saW5rc1wiOiBbe1wibmFtZVwiOiBcIuqyveq4sOuPhOyyrSDqs7Xsi50g7ZmI7Y6Y7J207KeAXCIsIFwidXJsXCI6IFwiaHR0cHM6Ly93d3cuZ2cuZ28ua3JcIn0sIHtcIm5hbWVcIjogXCLqsr3quLDrj4TrrLjtmZTsnqzri6hcIiwgXCJ1cmxcIjogXCJodHRwczovL3d3dy5nZ2NmLmtyXCJ9XVxuICB9LFxuICBcInRpc3RvcnlcIjogeyAuLi7snITsmYAg64+Z7J287ZWcIOq1rOyhsC4uLiB9LFxuICBcIndvcmRwcmVzc1wiOiB7IC4uLuychOyZgCDrj5nsnbztlZwg6rWs7KGwLi4uIH1cbn1cblxuW+2VhOuPhTogJ+qysOuhoCcsICfrp7rsnYzrp5AnLCAn66eI7KeA66eJ7Jy866GcJyDrk7HsnZgg6riw6rOE7KCBIOyEueyFmCDsnbTrpoQg7IKs7Jqp7J2EIOygiOuMgCDsl4TquIjtlaguXVxuW+2VhOuPhTog66qo65OgIO2VtOyLnO2DnOq3uCh0YWdzKeuKlCDrsJjrk5zsi5wgKirtlZzqta3slrQqKuuhnOunjCDsg53shLHtlZjqs6AsIOqwgSDtg5zqt7gg7JWe7JeQIOuwmOuTnOyLnCAqKicjJyDquLDtmLgqKuulvCDrtpnsl6zshJwg7ZWcIOykhOuhnCDrgpjsl7TtlbQuICjsmIg6ICPtgqTsm4zrk5wxICPtgqTsm4zrk5wyKV1gO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKEFQSV9VUkwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgY29udGVudHM6IFt7IHBhcnRzOiBbeyB0ZXh0OiBjb21iaW5lZFByb21wdCB9XSB9XSxcbiAgICAgICAgICB0b29sczogW3sgZ29vZ2xlX3NlYXJjaDoge30gfV0gXG4gICAgICAgIH0pXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvckRhdGEuZXJyb3I/Lm1lc3NhZ2UgfHwgJ0FQSSDtmLjstpwg7Iuk7YyoJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBsZXQgcmVzcG9uc2VUZXh0UmF3ID0gZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQucGFydHNbMF0udGV4dDtcbiAgICAgIGxldCByZXNwb25zZVRleHQgPSByZXNwb25zZVRleHRSYXcucmVwbGFjZSgvYGBganNvbi9naSwgJycpLnJlcGxhY2UoL2BgYC9naSwgJycpLnRyaW0oKTtcblxuICAgICAgY29uc3QgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcbiAgICAgIGNvbnN0IGVtcHR5UmVzdWx0ID0geyB0aXRsZTogJycsIGNvbnRlbnQ6ICfsg53shLEg7Iuk7YyoJywgdGFnczogJycsIG9mZmljaWFsX2xpbms6ICcnLCBpbWFnZTogJycgfTtcblxuICAgICAgbGV0IGZpbmFsSW1hZ2VzID0gWycnLCAnJywgJyddO1xuICAgICAgaWYgKHVzZUltYWdlICYmIHVuc3BsYXNoS2V5KSB7XG4gICAgICAgIGZpbmFsSW1hZ2VzID0gYXdhaXQgZmV0Y2hJbWFnZXMocGFyc2VkRGF0YS5rZXl3b3JkcyB8fCBbdG9waWMsIHRvcGljLCB0b3BpY10pO1xuICAgICAgfVxuXG4gICAgICBzZXRSZXN1bHRzKHtcbiAgICAgICAgbmF2ZXI6IHBhcnNlZERhdGEubmF2ZXIgPyB7IC4uLmVtcHR5UmVzdWx0LCAuLi5wYXJzZWREYXRhLm5hdmVyLCBpbWFnZTogZmluYWxJbWFnZXNbMF0sIG9mZmljaWFsX2xpbmtzOiBwYXJzZWREYXRhLm5hdmVyLm9mZmljaWFsX2xpbmtzIHx8IFtdIH0gOiBlbXB0eVJlc3VsdCxcbiAgICAgICAgdGlzdG9yeTogcGFyc2VkRGF0YS50aXN0b3J5ID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS50aXN0b3J5LCBpbWFnZTogZmluYWxJbWFnZXNbMV0sIG9mZmljaWFsX2xpbmtzOiBwYXJzZWREYXRhLnRpc3Rvcnkub2ZmaWNpYWxfbGlua3MgfHwgW10gfSA6IGVtcHR5UmVzdWx0LFxuICAgICAgICB3b3JkcHJlc3M6IHBhcnNlZERhdGEud29yZHByZXNzID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS53b3JkcHJlc3MsIGltYWdlOiBmaW5hbEltYWdlc1syXSwgb2ZmaWNpYWxfbGlua3M6IHBhcnNlZERhdGEud29yZHByZXNzLm9mZmljaWFsX2xpbmtzIHx8IFtdIH0gOiBlbXB0eVJlc3VsdFxuICAgICAgfSk7XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHNldEVycm9yKCfsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY29weVRvQ2xpcGJvYXJkID0gYXN5bmMgKHRleHQpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmF2ZXJGb250ID0gXCJmb250LWZhbWlseTogJ+uCmOuIlOqzoOuUlScsIE5hbnVtR290aGljLCBzYW5zLXNlcmlmO1wiO1xuICAgICAgXG4gICAgICBsZXQgcHJvY2Vzc2VkVGV4dCA9IHRleHQ7XG4gICAgICBjb25zdCB0YWJsZVJlZ2V4ID0gL15cXHwoLispXFx8XFxuXFx8KFsgOnwtXSspXFx8XFxuKChcXHwuK1xcfFxcbj8pKykvZ207XG4gICAgICBcbiAgICAgIGNvbnN0IG1hcmtkb3duVG9IdG1sVGFibGUgPSAobWF0Y2gpID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBtYXRjaC50cmltKCkuc3BsaXQoJ1xcbicpO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gbGluZXNbMF0uc3BsaXQoJ3wnKS5maWx0ZXIoY2VsbCA9PiBjZWxsLnRyaW0oKSAhPT0gJycpLm1hcChjZWxsID0+IGNlbGwudHJpbSgpKTtcbiAgICAgICAgY29uc3Qgcm93cyA9IGxpbmVzLnNsaWNlKDIpLm1hcChsaW5lID0+IGxpbmUuc3BsaXQoJ3wnKS5maWx0ZXIoY2VsbCA9PiBjZWxsLnRyaW0oKSAhPT0gJycpLm1hcChjZWxsID0+IGNlbGwudHJpbSgpKSk7XG5cbiAgICAgICAgbGV0IGh0bWwgPSBgPHRhYmxlIHN0eWxlPVwid2lkdGg6IDEwMCU7IGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7IG1hcmdpbjogMjBweCAwOyBib3JkZXI6IDFweCBzb2xpZCAjZGRkOyAke25hdmVyRm9udH1cIj5gO1xuICAgICAgICBodG1sICs9ICc8dGhlYWQgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhO1wiPjx0cj4nO1xuICAgICAgICBoZWFkZXJzLmZvckVhY2goaCA9PiB7XG4gICAgICAgICAgaHRtbCArPSBgPHRoIHN0eWxlPVwiYm9yZGVyOiAxcHggc29saWQgI2RkZDsgcGFkZGluZzogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyOyBmb250LXdlaWdodDogYm9sZDsgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcIj4ke2h9PC90aD5gO1xuICAgICAgICB9KTtcbiAgICAgICAgaHRtbCArPSAnPC90cj48L3RoZWFkPjx0Ym9keT4nO1xuICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICBodG1sICs9ICc8dHI+JztcbiAgICAgICAgICByb3cuZm9yRWFjaChjZWxsID0+IHtcbiAgICAgICAgICAgIGh0bWwgKz0gYDx0ZCBzdHlsZT1cImJvcmRlcjogMXB4IHNvbGlkICNkZGQ7IHBhZGRpbmc6IDEwcHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj4ke2NlbGx9PC90ZD5gO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGh0bWwgKz0gJzwvdHI+JztcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH07XG5cbiAgICAgIGxldCBodG1sQ29udGVudCA9IHByb2Nlc3NlZFRleHQucmVwbGFjZSh0YWJsZVJlZ2V4LCBtYXJrZG93blRvSHRtbFRhYmxlKTtcblxuICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudFxuICAgICAgICAucmVwbGFjZSgvXiMjIyAoLiokKS9naW0sIGA8cCBzdHlsZT1cIm1hcmdpbi10b3A6IDMwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDE2cHQ7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogIzMzMzsgJHtuYXZlckZvbnR9XCI+JDE8L3NwYW4+PC9wPmApXG4gICAgICAgIC5yZXBsYWNlKC9eIyMgKC4qJCkvZ2ltLCBgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOiA0MHB4OyBtYXJnaW4tYm90dG9tOiAxNXB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyMHB0OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICMwMDA7ICR7bmF2ZXJGb250fVwiPiQxPC9zcGFuPjwvcD5gKVxuICAgICAgICAucmVwbGFjZSgvXlxcKiAoLiokKS9naW0sIGA8bGkgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiA1cHg7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDEycHQ7ICR7bmF2ZXJGb250fVwiPiQxPC9zcGFuPjwvbGk+YClcbiAgICAgICAgLnJlcGxhY2UoL1xcKlxcKiguKilcXCpcXCovZ2ltLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpXG4gICAgICAgIC5yZXBsYWNlKC89PSAoLio/KSA9PS9nLCAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmNWIxOyBmb250LXdlaWdodDogYm9sZDsgcGFkZGluZzogMnB4IDRweDsgYm9yZGVyLXJhZGl1czogM3B4O1wiPiQxPC9zcGFuPicpXG4gICAgICAgIC5yZXBsYWNlKC89PSguKj8pPT0vZywgJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogI2ZmZjViMTsgZm9udC13ZWlnaHQ6IGJvbGQ7IHBhZGRpbmc6IDJweCA0cHg7IGJvcmRlci1yYWRpdXM6IDNweDtcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAucmVwbGFjZSgvXFwrXFwrICguKj8pIFxcK1xcKy9nLCAnPHNwYW4gc3R5bGU9XCJjb2xvcjogIzAwNDdiMzsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JDE8L3NwYW4+JylcbiAgICAgICAgLnJlcGxhY2UoL1xcK1xcKyguKj8pXFwrXFwrL2csICc8c3BhbiBzdHlsZT1cImNvbG9yOiAjMDA0N2IzOyBmb250LXdlaWdodDogYm9sZDtcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAucmVwbGFjZSgvISEgKC4qPykgISEvZywgJzxzcGFuIHN0eWxlPVwiY29sb3I6ICNlNjAwMDA7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiQxPC9zcGFuPicpXG4gICAgICAgIC5yZXBsYWNlKC8hISguKj8pISEvZywgJzxzcGFuIHN0eWxlPVwiY29sb3I6ICNlNjAwMDA7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiQxPC9zcGFuPicpXG4gICAgICAgIC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4ge1xuICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICBpZiAodHJpbW1lZCA9PT0gJycpIHJldHVybiAnPHA+Jm5ic3A7PC9wPic7IFxuICAgICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJzxwJykgfHwgdHJpbW1lZC5zdGFydHNXaXRoKCc8bGknKSB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoJzx0YWJsZScpKSByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTJwdDsgbGluZS1oZWlnaHQ6IDEuODsgY29sb3I6ICM0NDQ7ICR7bmF2ZXJGb250fVwiPiR7dHJpbW1lZH08L3NwYW4+PC9wPmA7XG4gICAgICAgIH0pLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKS5qb2luKCcnKTtcblxuICAgICAgY29uc3QgYmxvYkh0bWwgPSBuZXcgQmxvYihbaHRtbENvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgY29uc3QgYmxvYlRleHQgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IFtuZXcgQ2xpcGJvYXJkSXRlbSh7ICd0ZXh0L2h0bWwnOiBibG9iSHRtbCwgJ3RleHQvcGxhaW4nOiBibG9iVGV4dCB9KV07XG4gICAgICBcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoZGF0YSk7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+yEnOyLneqzvCDtkZzqsIAg7Y+s7ZWo65CcIOyDge2DnOuhnCDrs7XsgqzrkJjsl4jsirXri4jri6QhIPCfk4vwn5OK4pyoJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDbGlwYm9hcmQgZXJyb3I6JywgZXJyKTtcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfthY3siqTtirjroZwg67O17IKs65CY7JeI7Iq164uI64ukISDinIUnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1zbGF0ZS01MCBweS0xMiBweC00IGZvbnQtc2FucyB0ZXh0LXNsYXRlLTkwMFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy00eGwgbXgtYXV0byBzcGFjZS15LThcIj5cbiAgICAgICAgXG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwXCI+PC9kaXY+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC00eGwgZm9udC1ibGFjayB0ZXh0LXRyYW5zcGFyZW50IGJnLWNsaXAtdGV4dCBiZy1ncmFkaWVudC10by1yIGZyb20taW5kaWdvLTYwMCB0by1pbmRpZ28tNDAwIHRyYWNraW5nLXRpZ2h0ZXIgdXBwZXJjYXNlXCI+S09EQVJJIEJMT0cgQUk8L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4odHJ1ZSl9IGNsYXNzTmFtZT1cInAtMi41IHJvdW5kZWQtZnVsbCBiZy13aGl0ZSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgaG92ZXI6Ymctc2xhdGUtNTAgdHJhbnNpdGlvbi1hbGxcIj7impnvuI88L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzQXV0aGVudGljYXRlZCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicHgtNCBweS0yIHJvdW5kZWQtZnVsbCBiZy1zbGF0ZS04MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1yZWQtNjAwIHRyYW5zaXRpb24tYWxsXCI+7J247KadIO2VtOygnDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNBdXRoTW9kYWxPcGVuKHRydWUpfSBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1mdWxsIGJnLWluZGlnby02MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtYm9sZCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRyYW5zaXRpb24tYWxsXCI+8J+UkSDsvZTrk5wg7J247KadPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTUwMCBmb250LW1lZGl1bSB0ZXh0LXNtXCI+VjIg66qF7ZKIIOyXlOynhCDquLDrsJggOiDrs7TslYgg67CPIOyEpOyglSDsi5zsiqTthZwg7J207IudIOyZhOujjCDwn6uh8J+QnzwvcD5cbiAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBzaGFkb3cteGwgcC04IGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHNwYWNlLXktOFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItMlwiPuKcje+4jyDtj6zsiqTtjIUg7KO87KCcPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBcbiAgICAgICAgICAgICAgdmFsdWU9e3RvcGljfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvcGljKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgZ2VuZXJhdGVDb250ZW50KCl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi7JiIOiAyMDI2IOqyveq4sCDsu6zsspjtjKjsiqQg7IKs7Jqp7LKYIOuwjyDsnKDtmqjquLDqsIRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgYm9yZGVyLWJsdWUtMTAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItYmx1ZS01MDAgdGV4dC1sZyB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1zbGF0ZS01MCBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIOKchSDrsJztlokg7ZSM656r7Y+8IOuwjyDqsJzrs4Qg7Ja07YisIOyEpOyglVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIHRyYW5zaXRpb24tYWxsICR7cGxhdGZvcm1zLm5hdmVyID8gJ2JnLXdoaXRlIGJvcmRlci1ncmVlbi0yMDAgc2hhZG93LXNtJyA6ICdiZy1zbGF0ZS0xMDAvNTAgYm9yZGVyLXRyYW5zcGFyZW50IG9wYWNpdHktNjAnfWB9PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlciBtYi0zIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17cGxhdGZvcm1zLm5hdmVyfSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIG5hdmVyOiAhcGxhdGZvcm1zLm5hdmVyfSl9IGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1ncmVlbi01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctZ3JlZW4tNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LWdyZWVuLTYwMCB0cmFuc2l0aW9uLWNvbG9yc1wiPvCfn6Ig64Sk7J2067KEPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshcGxhdGZvcm1zLm5hdmVyfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLm5hdmVyfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIG5hdmVyOiBlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWdyZWVuLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuq4sOuzuCDruJTroZzqsbBcIj7quLDrs7ggKOy5nOygiC/quZTrgZQpPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7ZW067CV7ZWcIOyghOusuOqwgFwiPu2VtOuwle2VnCDsoITrrLjqsIA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIHRyYW5zaXRpb24tYWxsICR7cGxhdGZvcm1zLnRpc3RvcnkgPyAnYmctd2hpdGUgYm9yZGVyLW9yYW5nZS0yMDAgc2hhZG93LXNtJyA6ICdiZy1zbGF0ZS0xMDAvNTAgYm9yZGVyLXRyYW5zcGFyZW50IG9wYWNpdHktNjAnfWB9PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlciBtYi0zIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17cGxhdGZvcm1zLnRpc3Rvcnl9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3JtcywgdGlzdG9yeTogIXBsYXRmb3Jtcy50aXN0b3J5fSl9IGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1vcmFuZ2UtNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLW9yYW5nZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtb3JhbmdlLTYwMCB0cmFuc2l0aW9uLWNvbG9yc1wiPvCfn6Ag7Yuw7Iqk7Yag66asPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshcGxhdGZvcm1zLnRpc3Rvcnl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMudGlzdG9yeX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCB0aXN0b3J5OiBlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9yYW5nZS01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy53b3JkcHJlc3MgPyAnYmctd2hpdGUgYm9yZGVyLWJsdWUtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy53b3JkcHJlc3N9IG9uQ2hhbmdlPXsoKSA9PiBzZXRQbGF0Zm9ybXMoey4uLnBsYXRmb3Jtcywgd29yZHByZXNzOiAhcGxhdGZvcm1zLndvcmRwcmVzc30pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtYmx1ZS01MDAgcm91bmRlZCBib3JkZXItc2xhdGUtMzAwIGZvY3VzOnJpbmctYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGdyb3VwLWhvdmVyOnRleHQtYmx1ZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5S1IOybjOuTnO2UhOugiOyKpDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy53b3JkcHJlc3N9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dG9uZXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb25lcyh7Li4udG9uZXMsIHdvcmRwcmVzczogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCB0ZXh0LXNtIGJnLXdoaXRlIGN1cnNvci1wb2ludGVyIGRpc2FibGVkOmJnLXNsYXRlLTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QXCI+66qF7L6M7ZWcIOygleuztCDsoITri6zsnpA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7ZXJyb3IgJiYgPHAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNTAwIGZvbnQtYm9sZCB0ZXh0LXNtIGFuaW1hdGUtcHVsc2VcIj57ZXJyb3J9PC9wPn1cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTMgcHktMlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgJHshdXNlSW1hZ2UgPyAndGV4dC1zbGF0ZS00MDAnIDogJ3RleHQtc2xhdGUtMzAwJ31gfT7snbTrr7jsp4Ag7IKs7JqpIOyViO2VqDwvc3Bhbj5cbiAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFVzZUltYWdlKCF1c2VJbWFnZSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHJlbGF0aXZlIHctMTIgaC02IHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgJHt1c2VJbWFnZSA/ICdiZy1pbmRpZ28tNjAwJyA6ICdiZy1zbGF0ZS0zMDAnfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgYWJzb2x1dGUgdG9wLTEgbGVmdC0xIHctNCBoLTQgYmctd2hpdGUgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tdHJhbnNmb3JtIGR1cmF0aW9uLTMwMCAke3VzZUltYWdlID8gJ3RyYW5zbGF0ZS14LTYnIDogJ3RyYW5zbGF0ZS14LTAnfWB9IC8+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1ib2xkIHRyYW5zaXRpb24tY29sb3JzICR7dXNlSW1hZ2UgPyAndGV4dC1pbmRpZ28tNjAwJyA6ICd0ZXh0LXNsYXRlLTQwMCd9YH0+7J2066+47KeAIOyekOuPmSDsgr3snoUgT048L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDb250ZW50fVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgYmctaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRleHQtd2hpdGUgZm9udC1ibGFjayB0ZXh0LWxnIHAtNSByb3VuZGVkLTJ4bCBzaGFkb3cteGwgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLVswLjk4XSBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBnYXAtM1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gLW1sLTEgbXItMyBoLTUgdy01IHRleHQtd2hpdGVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjbGFzc05hbWU9XCJvcGFjaXR5LTI1XCIgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjRcIj48L2NpcmNsZT48cGF0aCBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNCAxMmE4IDggMCAwMTgtOFYwQzUuMzczIDAgMCA1LjM3MyAwIDEyaDR6bTIgNS4yOTFBNy45NjIgNy45NjIgMCAwMTQgMTJIMGMwIDMuMDQyIDEuMTM1IDUuODI0IDMgNy45MzhsMy0yLjY0N3pcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAg7L2U64uk66as6rCAIOunueugrO2eiCDsnpHshLEg7KSR7J6F64uI64ukLi4uXG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6ICfwn5qAIOybkOuyhO2KvCDrj5nsi5wg7IOd7ISx7ZWY6riwJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge09iamVjdC52YWx1ZXMocmVzdWx0cykuc29tZSh2YWwgPT4gdmFsLmNvbnRlbnQpICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGJnLXNsYXRlLTUwLzUwXCI+XG4gICAgICAgICAgICAgIHtbJ25hdmVyJywgJ3Rpc3RvcnknLCAnd29yZHByZXNzJ10uZmlsdGVyKHRhYiA9PiBwbGF0Zm9ybXNbdGFiXSkubWFwKCh0YWIpID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e3RhYn1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYih0YWIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIHB5LTQgZm9udC1ib2xkIHRleHQtc20gdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSB0YWIgXG4gICAgICAgICAgICAgICAgICAgID8gJ3RleHQtYmx1ZS02MDAgYmctd2hpdGUgYm9yZGVyLWItMiBib3JkZXItYmx1ZS02MDAnIFxuICAgICAgICAgICAgICAgICAgICA6ICd0ZXh0LXNsYXRlLTUwMCBob3Zlcjp0ZXh0LXNsYXRlLTcwMCBob3ZlcjpiZy1zbGF0ZS01MCdcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHt0YWIgPT09ICduYXZlcicgPyAn8J+foiDrhKTsnbTrsoQg67iU66Gc6re4JyA6IHRhYiA9PT0gJ3Rpc3RvcnknID8gJ/Cfn6Ag7Yuw7Iqk7Yag66asJyA6ICfwn5S1IOybjOuTnO2UhOugiOyKpCd9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IHNwYWNlLXktNlwiPlxuICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmltYWdlICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgbWItNlwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3Jlc3VsdHNbYWN0aXZlVGFiXS5pbWFnZX0gYWx0PVwiQmxvZyBCYWNrZ3JvdW5kXCIgY2xhc3NOYW1lPVwidy1mdWxsIGgtWzM1MHB4XSBvYmplY3QtY292ZXIgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tNzAwIGdyb3VwLWhvdmVyOnNjYWxlLTEwNVwiIC8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0wIGxlZnQtMCByaWdodC0wIHAtMyBiZy1ncmFkaWVudC10by10IGZyb20tYmxhY2svNjAgdG8tdHJhbnNwYXJlbnQgdGV4dC13aGl0ZSB0ZXh0LVsxMHB4XSBmb250LW1lZGl1bSBvcGFjaXR5LTAgZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5XCI+8J+TuCBQaG90byB2aWEgVW5zcGxhc2ggKEFJIOy2lOyynCDsnbTrr7jsp4ApPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmx1ZS01MC81MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtYmx1ZS01MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+VGl0bGU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLnRpdGxlKX0gY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6YmctYmx1ZS01MCB0ZXh0LWJsdWUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItYmx1ZS0xMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj7wn5OLIOygnOuqqSDrs7Xsgqw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgbGVhZGluZy10aWdodFwiPntyZXN1bHRzW2FjdGl2ZVRhYl0udGl0bGUgfHwgJ+ygnOuqqSDsg53shLEg7KSRLi4uJ308L2gyPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBweC0xXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+Q29udGVudDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IGNvcHlUb0NsaXBib2FyZChyZXN1bHRzW2FjdGl2ZVRhYl0uY29udGVudCl9IGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+8J+TiyDrs7jrrLgg67O17IKsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgbWluLWgtWzMwMHB4XSBzaGFkb3ctc20gZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvc2UgcHJvc2Utc2xhdGUgbWF4LXctbm9uZSB0ZXh0LWJhc2UgbGVhZGluZy1yZWxheGVkIHByb3NlLWgyOnRleHQtMnhsIHByb3NlLWgyOmZvbnQtYm9sZCBwcm9zZS1oMjp0ZXh0LXNsYXRlLTkwMCBwcm9zZS1oMjptdC0xMiBwcm9zZS1oMjptYi02IHByb3NlLWgyOnBiLTIgcHJvc2UtaDI6Ym9yZGVyLWIgcHJvc2UtaDI6Ym9yZGVyLXNsYXRlLTEwMCBwcm9zZS1oMzp0ZXh0LXhsIHByb3NlLWgzOmZvbnQtYm9sZCBwcm9zZS1oMzp0ZXh0LXNsYXRlLTgwMCBwcm9zZS1oMzptdC04IHByb3NlLWgzOm1iLTQgcHJvc2UtcDptYi02IHByb3NlLWxpOm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJlYWN0TWFya2Rvd24gXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50cz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gPT3qsJXsobA9PSDrpbwg66+466as67O06riw7JeQ7ISc64+EIOuFuOuegOyDiSDrsLDqsr3snLzroZwg7ZGc7IucXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAoe25vZGUsIGlubGluZSwgY2xhc3NOYW1lLCBjaGlsZHJlbiwgLi4ucHJvcHN9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gL15cXF49PSguKik9PVxcXiQvLmV4ZWMoY2hpbGRyZW4pOyAvLyDsnoTsi5wg67Cp7Y64XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmxpbmUgPyA8Y29kZSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gey4uLnByb3BzfT57Y2hpbGRyZW59PC9jb2RlPiA6IDxwcmUgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHsuLi5wcm9wc30+e2NoaWxkcmVufTwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLmNvbnRlbnR9XG4gICAgICAgICAgICAgICAgICAgIDwvUmVhY3RNYXJrZG93bj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1hbWJlci01MCBwLTQgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIG10LTRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhsXCI+4pqg77iPPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTgwMCBmb250LWJvbGQgdGV4dC1zbSBtYi0xXCI+7L2U64uk66as7J2YIO2Mqe2KuOyytO2BrCDslYzrprw8L3A+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWFtYmVyLTcwMCB0ZXh0LXhzIGxlYWRpbmctcmVsYXhlZCBtYi0zXCI+67O4IOy9mO2FkOy4oOuKlCBBSeqwgCDsi6Tsi5zqsIQg642w7J207YSw66W8IOq4sOuwmOycvOuhnCDsg53shLHtlZwg6rKw6rO866y87J6F64uI64ukLiDspJHsmpTtlZwg7IiY7LmY64KYIOuCoOynnCDrk7HsnYAg67CY65Oc7IucIOyVhOuemCDqs7Xsi50g6rSA66CoIOunge2BrOulvCDthrXtlbQg7LWc7KKFIO2ZleyduCDtm4Qg67Cc7ZaJ7ZW0IOyjvOyEuOyalCE8L3A+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtyZXN1bHRzW2FjdGl2ZVRhYl0ub2ZmaWNpYWxfbGlua3MgJiYgcmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmtzLm1hcCgobGluaywgaWR4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2lkeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2xpbmsudXJsfSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcHgtMyBweS0xLjUgYmctYW1iZXItMjAwIGhvdmVyOmJnLWFtYmVyLTMwMCB0ZXh0LWFtYmVyLTkwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIGJvcmRlciBib3JkZXItYW1iZXItMzAwXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5SXIHtsaW5rLm5hbWV9IOuwlOuhnOqwgOq4sFxuICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS00MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+SGFzaHRhZ3M8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLnRhZ3MpfSBjbGFzc05hbWU9XCJweC0zIHB5LTEuNSBiZy13aGl0ZSBob3ZlcjpiZy1zbGF0ZS0xMDAgdGV4dC1zbGF0ZS02MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj7wn5OLIO2DnOq3uCDrs7Xsgqw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWJsdWUtNjAwIGZvbnQtbWVkaXVtXCI+e3Jlc3VsdHNbYWN0aXZlVGFiXS50YWdzIHx8ICcj7ZW07Iuc7YOc6re4J308L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cblxuICAgICAge2lzU2V0dGluZ3NPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctbWQgdy1mdWxsIHNwYWNlLXktNiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7impnvuI8g7Iuc7Iqk7YWcIOyEpOyglTwvaDI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMFwiPuKclTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj7wn5SRIEdlbWluaSBBUEkgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPXtzaG93QXBpS2V5ID8gXCJ0ZXh0XCIgOiBcInBhc3N3b3JkXCJ9IHZhbHVlPXthcGlLZXl9IG9uQ2hhbmdlPXtoYW5kbGVTYXZlQXBpS2V5fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHByLTEyIHJvdW5kZWQtMnhsIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOnJpbmctNCBmb2N1czpyaW5nLWluZGlnby01MDAvMTAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsIGZvbnQtbW9ubyB0ZXh0LXNtXCIgcGxhY2Vob2xkZXI9XCJHZW1pbmkgQVBJIO2CpOulvCDsnoXroKXtlZjshLjsmpRcIiAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dBcGlLZXkoIXNob3dBcGlLZXkpfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBwLTEuNSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTUwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGxcIj57c2hvd0FwaUtleSA/IFwi8J+Rge+4j1wiIDogXCLwn5GB77iP4oCN8J+XqO+4j1wifTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+8J+TuCBVbnNwbGFzaCBBY2Nlc3MgS2V5PC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPXtzaG93VW5zcGxhc2hLZXkgPyBcInRleHRcIiA6IFwicGFzc3dvcmRcIn0gdmFsdWU9e3Vuc3BsYXNoS2V5fSBvbkNoYW5nZT17KGUpID0+IHsgc2V0VW5zcGxhc2hLZXkoZS50YXJnZXQudmFsdWUpOyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndW5zcGxhc2hfa2V5JywgZS50YXJnZXQudmFsdWUpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHByLTEyIHJvdW5kZWQtMnhsIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOnJpbmctNCBmb2N1czpyaW5nLWluZGlnby01MDAvMTAgZm9jdXM6b3V0bGluZS1ub25lIHRyYW5zaXRpb24tYWxsIGZvbnQtbW9ubyB0ZXh0LXNtXCIgcGxhY2Vob2xkZXI9XCJVbnNwbGFzaCDtgqTrpbwg7J6F66Cl7ZWY7IS47JqUXCIgLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93VW5zcGxhc2hLZXkoIXNob3dVbnNwbGFzaEtleSl9IGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTQgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHAtMS41IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNTAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWFsbFwiPntzaG93VW5zcGxhc2hLZXkgPyBcIvCfkYHvuI9cIiA6IFwi8J+Rge+4j+KAjfCfl6jvuI9cIn08L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLWluZGlnby01MCByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWluZGlnby0xMDAgc3BhY2UteS0zIHRleHQtbGVmdFwiPlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJsYWNrIHRleHQtaW5kaWdvLTYwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj7wn5K+IOy9lOuLpOumrCDrsLHsl4Ug6rSA66asPC9oMz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVEb3dubG9hZEJhY2t1cH0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgYmctd2hpdGUgaG92ZXI6YmctaW5kaWdvLTEwMCB0ZXh0LWluZGlnby02MDAgcm91bmRlZC14bCBmb250LWJvbGQgdGV4dC1zbSBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1pbmRpZ28tMjAwIHRyYW5zaXRpb24tYWxsXCI+8J+TgiDtmITsnqwg67KE7KCEIOymieyLnCDrsLHsl4Uo64uk7Jq066Gc65OcKTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTQgYm9yZGVyLXQgYm9yZGVyLXNsYXRlLTEwMFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dlbWluaV9hcGlfa2V5JywgYXBpS2V5KTsgc2V0SXNTZXR0aW5nc09wZW4oZmFsc2UpOyB0cmlnZ2VyVG9hc3QoJ+uMgO2RnOuLmCwg7ISk7KCV7J20IOyggOyepeuQmOyXiOyKteuLiOuLpCEg8J+roScpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtODAwIHRleHQtd2hpdGUgcm91bmRlZC0yeGwgZm9udC1ib2xkIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7ISk7KCVIOyggOyepSDrsI8g7KCB7JqpPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7aXNBdXRoTW9kYWxPcGVuICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotNTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBwLTggbWF4LXctc20gdy1mdWxsIHNwYWNlLXktNiB0ZXh0LWNlbnRlciBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ibGFjayB0ZXh0LXNsYXRlLTgwMFwiPuuMgO2RnOuLmCDsnbjspp0g7ZWE7JqUIPCfq6E8L2gyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIHZhbHVlPXthdXRoQ29kZX0gb25DaGFuZ2U9eyhlKSA9PiBzZXRBdXRoQ29kZShlLnRhcmdldC52YWx1ZSl9IG9uS2V5RG93bj17KGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGhhbmRsZUxvZ2luKCl9IHBsYWNlaG9sZGVyPVwi7L2U65Oc66W8IOyeheugpe2VmOyEuOyalFwiIGNsYXNzTmFtZT1cInctZnVsbCBwLTQgcm91bmRlZC0yeGwgYmctc2xhdGUtNTAgYm9yZGVyLTIgYm9yZGVyLXNsYXRlLTIwMCB0ZXh0LWNlbnRlciB0ZXh0LTJ4bCBmb250LWJsYWNrIGZvY3VzOmJvcmRlci1pbmRpZ28tNTAwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbFwiIC8+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ2lufSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktNCBiZy1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby03MDAgdGV4dC13aGl0ZSByb3VuZGVkLTJ4bCBmb250LWJsYWNrIHRleHQtbGcgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsXCI+7J247Kad7ZWY6riwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge3Nob3dUb2FzdCAmJiAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246ICdmaXhlZCcsIGJvdHRvbTogJzQwcHgnLCBsZWZ0OiAnNTAlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtNTAlKScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC44NSknLCBjb2xvcjogJ3doaXRlJywgcGFkZGluZzogJzEycHggMjRweCcsIGJvcmRlclJhZGl1czogJzUwcHgnLCB6SW5kZXg6IDEwMDAwLCBmb250U2l6ZTogJzAuOTVyZW0nLCBmb250V2VpZ2h0OiAnNTAwJywgYm94U2hhZG93OiAnMCA4cHggMzJweCByZ2JhKDAsMCwwLDAuMyknLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjEpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDhweCknLCBhbmltYXRpb246ICdmYWRlSW5PdXQgMi41cyBlYXNlLWluLW91dCBmb3J3YXJkcycsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxuICAgICAgICAgIHt0b2FzdH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICA8c3R5bGU+e2BcbiAgICAgICAgQGtleWZyYW1lcyBmYWRlSW5PdXQge1xuICAgICAgICAgIDAlIHsgb3BhY2l0eTogMDsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgMjBweCk7IH1cbiAgICAgICAgICAxNSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTsgfVxuICAgICAgICAgIDg1JSB7IG9wYWNpdHk6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDApOyB9XG4gICAgICAgICAgMTAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC0xMHB4KTsgfVxuICAgICAgICB9XG4gICAgICBgfTwvc3R5bGU+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDtcbiJdfQ==