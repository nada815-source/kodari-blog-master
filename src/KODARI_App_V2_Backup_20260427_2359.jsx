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
    "content": "본문에 '결론', '맺음말', '관련 링크', '해시태그(tags)' 같은 섹션을 절대 포함하지 마라. 순수 정보성 문단으로만 구성해.", 
    "tags": "...", 
    "official_links": [{"name": "경기도청 공식 홈페이지", "url": "https://www.gg.go.kr"}, {"name": "경기도문화재단", "url": "https://www.ggcf.kr"}]
  },
  "tistory": { ...위와 동일한 구조... },
  "wordpress": { ...위와 동일한 구조... }
}

[필독: '결론', '맺음말', '마지막으로' 등의 기계적 섹션 이름 사용을 절대 엄금함.]
[필독: 모든 해시태그(tags)는 반드시 **한국어**로만 생성하고, 각 태그 앞에 반드시 **'#' 기호**를 붙여서 한 줄로 나열해. (예: #키워드1 #키워드2)]
[말투 가이드: 독자와 직접 대화하듯 다정하고 친근한 블로거의 말투를 사용해. 문장 곳곳에 주제와 어울리는 이모지(🌸, ✨, 📍, ✅ 등)를 적절히 섞어서 글에 생동감과 리듬감을 불어넣어줘. 정보는 날카롭게, 말투는 따뜻하게!]`;
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
			htmlContent = htmlContent.replace(/^### (.*$)/gim, `<p style="margin-top: 30px; margin-bottom: 10px;"><span style="font-size: 16pt; font-weight: bold; color: #333; ${naverFont}">$1</span></p>`).replace(/^## (.*$)/gim, `<p style="margin-top: 40px; margin-bottom: 15px;"><span style="font-size: 20pt; font-weight: bold; color: #000; ${naverFont}">$1</span></p>`).replace(/^\* (.*$)/gim, `<li style="margin-bottom: 5px;"><span style="font-size: 12pt; ${naverFont}">$1</span></li>`).replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>").replace(/==\s*([\s\S]*?)\s*==/g, "<span style=\"background-color: #fff5b1; font-weight: bold; padding: 2px 4px; border-radius: 3px;\">$1</span>").replace(/\+\+\s*([\s\S]*?)\s*\+\+/g, "<span style=\"color: #0047b3; font-weight: bold;\">$1</span>").replace(/!!\s*([\s\S]*?)\s*!!/g, "<span style=\"color: #e60000; font-weight: bold;\">$1</span>").split("\n").map((line) => {
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
									lineNumber: 276,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ _jsxDEV("h1", {
									className: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tighter uppercase",
									children: "KODARI BLOG AI"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 277,
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
										lineNumber: 279,
										columnNumber: 15
									}, this), isAuthenticated ? /* @__PURE__ */ _jsxDEV("button", {
										onClick: handleLogout,
										className: "px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-red-600 transition-all",
										children: "인증 해제"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 281,
										columnNumber: 17
									}, this) : /* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setIsAuthModalOpen(true),
										className: "px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all",
										children: "🔑 코드 인증"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 283,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 278,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 275,
							columnNumber: 11
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							className: "text-slate-500 font-medium text-sm",
							children: "V2 명품 엔진 기반 : 보안 및 설정 시스템 이식 완료 🫡🐟"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 287,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 274,
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
									lineNumber: 292,
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
									lineNumber: 293,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 291,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "bg-slate-50 p-6 rounded-2xl border border-slate-200",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									className: "block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2",
									children: "✅ 발행 플랫폼 및 개별 어투 설정"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 304,
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
													lineNumber: 310,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-green-600 transition-colors",
													children: "🟢 네이버"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 311,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 309,
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
														lineNumber: 319,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 320,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 321,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 322,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 313,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 308,
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
													lineNumber: 328,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-orange-600 transition-colors",
													children: "🟠 티스토리"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 329,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 327,
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
														lineNumber: 337,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "해박한 전문가",
														children: "해박한 전문가"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 338,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 339,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 340,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 331,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 326,
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
													lineNumber: 346,
													columnNumber: 19
												}, this), /* @__PURE__ */ _jsxDEV("span", {
													className: "font-bold text-slate-700 group-hover:text-blue-600 transition-colors",
													children: "🔵 워드프레스"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 347,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 345,
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
														lineNumber: 355,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "기본 블로거",
														children: "기본 (친절/깔끔)"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 356,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "MZ세대 유행어",
														children: "MZ세대 유행어"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 357,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ _jsxDEV("option", {
														value: "감성적인 에세이",
														children: "감성적인 에세이"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 358,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 349,
												columnNumber: 17
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 344,
											columnNumber: 15
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 307,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 303,
								columnNumber: 11
							}, this),
							error && /* @__PURE__ */ _jsxDEV("p", {
								className: "text-red-500 font-bold text-sm animate-pulse",
								children: error
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 364,
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
										lineNumber: 367,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("button", {
										onClick: () => setUseImage(!useImage),
										className: `relative w-12 h-6 rounded-full transition-all duration-300 ${useImage ? "bg-indigo-600" : "bg-slate-300"}`,
										children: /* @__PURE__ */ _jsxDEV("div", { className: `absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useImage ? "translate-x-6" : "translate-x-0"}` }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 372,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 368,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ _jsxDEV("span", {
										className: `text-xs font-bold transition-colors ${useImage ? "text-indigo-600" : "text-slate-400"}`,
										children: "이미지 자동 삽입 ON"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 374,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 366,
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
										lineNumber: 384,
										columnNumber: 144
									}, this), /* @__PURE__ */ _jsxDEV("path", {
										className: "opacity-75",
										fill: "currentColor",
										d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 384,
										columnNumber: 245
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 384,
									columnNumber: 17
								}, this), "코다리가 맹렬히 작성 중입니다..."] }, void 0, true) : "🚀 원버튼 동시 생성하기"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 377,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 290,
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
								lineNumber: 395,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 393,
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
										lineNumber: 412,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
										children: "📸 Photo via Unsplash (AI 추천 이미지)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 413,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 411,
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
											lineNumber: 418,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].title),
											className: "px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-100 flex items-center gap-1",
											children: "📋 제목 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 419,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 417,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("h2", {
										className: "text-xl font-bold text-slate-800 leading-tight",
										children: results[activeTab].title || "제목 생성 중..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 421,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 416,
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
											lineNumber: 425,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].content),
											className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 본문 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 426,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 424,
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
														lineNumber: 435,
														columnNumber: 43
													}, this) : /* @__PURE__ */ _jsxDEV("pre", {
														className,
														...props,
														children
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 435,
														columnNumber: 102
													}, this);
												} },
												children: results[activeTab].content
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 430,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 429,
											columnNumber: 19
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 428,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 423,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4",
									children: [/* @__PURE__ */ _jsxDEV("span", {
										className: "text-xl",
										children: "⚠️"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 445,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-800 font-bold text-sm mb-1",
												children: "코다리의 팩트체크 알림"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 447,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ _jsxDEV("p", {
												className: "text-amber-700 text-xs leading-relaxed mb-3",
												children: "본 콘텐츠는 AI가 실시간 데이터를 기반으로 생성한 결과물입니다. 중요한 수치나 날짜 등은 반드시 아래 공식 관련 링크를 통해 최종 확인 후 발행해 주세요!"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 448,
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
													lineNumber: 451,
													columnNumber: 23
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 449,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 446,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 444,
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
											lineNumber: 466,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("button", {
											onClick: () => copyToClipboard(results[activeTab].tags),
											className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-sm border border-slate-200 flex items-center gap-1",
											children: "📋 태그 복사"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 467,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 465,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("p", {
										className: "text-blue-600 font-medium",
										children: results[activeTab].tags || "#해시태그"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 469,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 464,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 409,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 392,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 272,
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
								lineNumber: 480,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: () => setIsSettingsOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: "✕"
							}, void 0, false, {
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
								children: "🔑 Gemini API Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 484,
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
									lineNumber: 486,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowApiKey(!showApiKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showApiKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 487,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 485,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 483,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ _jsxDEV("label", {
								className: "text-sm font-bold text-slate-700 flex items-center gap-2",
								children: "📸 Unsplash Access Key"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 491,
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
									lineNumber: 493,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									type: "button",
									onClick: () => setShowUnsplashKey(!showUnsplashKey),
									className: "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all",
									children: showUnsplashKey ? "👁️" : "👁️‍🗨️"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 494,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 492,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 490,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							className: "p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left",
							children: [/* @__PURE__ */ _jsxDEV("h3", {
								className: "text-sm font-black text-indigo-600 uppercase tracking-wider",
								children: "💾 코다리 백업 관리"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 498,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("button", {
								onClick: handleDownloadBackup,
								className: "w-full py-3 bg-white hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-200 transition-all",
								children: "📂 현재 버전 즉시 백업(다운로드)"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 499,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 497,
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
								lineNumber: 502,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 501,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 478,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 477,
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
							lineNumber: 511,
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
							lineNumber: 512,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("button", {
							onClick: handleLogin,
							className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all",
							children: "인증하기"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 513,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 510,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 509,
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
				lineNumber: 519,
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
				lineNumber: 524,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 271,
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
import * as __vite_react_currentExports from "/src/App.jsx?t=1777301610675";
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

//# sourceMappingURL=data:application/json;base64,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TyxVQUFVO0tBQVcsWUFBWTtLQUFPLFdBQVc7S0FBOEIsUUFBUTtLQUFtQyxnQkFBZ0I7S0FBYSxXQUFXO0tBQXVDLFlBQVk7S0FBVSxTQUFTO0tBQVEsWUFBWTtLQUFVLEtBQUs7S0FBTztjQUNqZTtJQUNHOzs7OztHQUdSLHdCQUFDLFNBQUQsWUFBUTs7Ozs7OztTQU9FOzs7OztHQUNOOzs7Ozs7O3VDQUVUOztBQUVELGVBQWUiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiQXBwLmpzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEdvb2dsZUdlbkFJIH0gZnJvbSAnQGdvb2dsZS9nZW5haSc7XG5pbXBvcnQgUmVhY3RNYXJrZG93biBmcm9tICdyZWFjdC1tYXJrZG93bic7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcbiAgY29uc3QgW3RvcGljLCBzZXRUb3BpY10gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFt0b25lcywgc2V0VG9uZXNdID0gdXNlU3RhdGUoe1xuICAgIG5hdmVyOiAn6riw67O4IOu4lOuhnOqxsCcsXG4gICAgdGlzdG9yeTogJ+q4sOuzuCDruJTroZzqsbAnLFxuICAgIHdvcmRwcmVzczogJ+uqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QJ1xuICB9KTtcbiAgY29uc3QgW3BsYXRmb3Jtcywgc2V0UGxhdGZvcm1zXSA9IHVzZVN0YXRlKHsgbmF2ZXI6IHRydWUsIHRpc3Rvcnk6IHRydWUsIHdvcmRwcmVzczogdHJ1ZSB9KTtcbiAgY29uc3QgW2FwaUtleSwgc2V0QXBpS2V5XSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpIHx8ICcnKTtcbiAgY29uc3QgW3Vuc3BsYXNoS2V5LCBzZXRVbnNwbGFzaEtleV0gPSB1c2VTdGF0ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndW5zcGxhc2hfa2V5JykgfHwgJycpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZXN1bHRzLCBzZXRSZXN1bHRzXSA9IHVzZVN0YXRlKHtcbiAgICBuYXZlcjogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGlua3M6IFtdLCBpbWFnZTogJycgfSxcbiAgICB0aXN0b3J5OiB7IHRpdGxlOiAnJywgY29udGVudDogJycsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rczogW10sIGltYWdlOiAnJyB9LFxuICAgIHdvcmRwcmVzczogeyB0aXRsZTogJycsIGNvbnRlbnQ6ICcnLCB0YWdzOiAnJywgb2ZmaWNpYWxfbGlua3M6IFtdLCBpbWFnZTogJycgfVxuICB9KTtcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCduYXZlcicpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3dBcGlLZXksIHNldFNob3dBcGlLZXldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd1Vuc3BsYXNoS2V5LCBzZXRTaG93VW5zcGxhc2hLZXldID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbdXNlSW1hZ2UsIHNldFVzZUltYWdlXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbaXNTZXR0aW5nc09wZW4sIHNldElzU2V0dGluZ3NPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQXV0aGVudGljYXRlZCwgc2V0SXNBdXRoZW50aWNhdGVkXSA9IHVzZVN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpc19hdXRoZW50aWNhdGVkJykgPT09ICd0cnVlJyk7XG4gIGNvbnN0IFtpc0F1dGhNb2RhbE9wZW4sIHNldElzQXV0aE1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFthdXRoQ29kZSwgc2V0QXV0aENvZGVdID0gdXNlU3RhdGUoJycpO1xuICBjb25zdCBbdG9hc3QsIHNldFRvYXN0XSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3dUb2FzdCwgc2V0U2hvd1RvYXN0XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCB0cmlnZ2VyVG9hc3QgPSAobXNnKSA9PiB7XG4gICAgc2V0VG9hc3QobXNnKTtcbiAgICBzZXRTaG93VG9hc3QodHJ1ZSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTaG93VG9hc3QoZmFsc2UpO1xuICAgIH0sIDI1MDApO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ2luID0gKCkgPT4ge1xuICAgIGlmIChhdXRoQ29kZSA9PT0gJ2tvZGFyaTEnKSB7XG4gICAgICBzZXRJc0F1dGhlbnRpY2F0ZWQodHJ1ZSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaXNfYXV0aGVudGljYXRlZCcsICd0cnVlJyk7XG4gICAgICBzZXRJc0F1dGhNb2RhbE9wZW4oZmFsc2UpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfrsJjqsJHsirXri4jri6QsIOuMgO2RnOuLmCEgS09EQVJJIEJMT0cgQUnqsIAg7Zmc7ISx7ZmU65CY7JeI7Iq164uI64ukLiDwn6uh8J+QnycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmlnZ2VyVG9hc3QoJ+yduOymnSDsvZTrk5zqsIAg7YuA66C47Iq164uI64ukLiDrjIDtkZzri5jrp4wg7JWE7Iuc64qUIOy9lOuTnOulvCDsnoXroKXtlbQg7KO87IS47JqUIScpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVMb2dvdXQgPSAoKSA9PiB7XG4gICAgc2V0SXNBdXRoZW50aWNhdGVkKGZhbHNlKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnaXNfYXV0aGVudGljYXRlZCcpO1xuICAgIHRyaWdnZXJUb2FzdCgn66Gc6re47JWE7JuDIOuQmOyXiOyKteuLiOuLpC4g7Lap7ISxIScpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVNhdmVBcGlLZXkgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgIHNldEFwaUtleShrZXkpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnZW1pbmlfYXBpX2tleScsIGtleSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRG93bmxvYWRCYWNrdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9zcmMvQXBwLmpzeCcpO1xuICAgICAgY29uc3QgY29kZSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29kZV0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gYCR7bm93LmdldEZ1bGxZZWFyKCl9JHtTdHJpbmcobm93LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9XyR7U3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgICAgIFxuICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgbGluay5kb3dubG9hZCA9IGBLT0RBUklfQXBwX1YyX0JhY2t1cF8ke2Zvcm1hdHRlZERhdGV9LmpzeGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5jbGljaygpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgIHRyaWdnZXJUb2FzdCgn64yA7ZGc64uYISDtmITsnqwg67KE7KCE7J2YIOyGjOyKpCDsvZTrk5zrpbwg7Lu07ZOo7YSw7JeQIOymieyLnCDsoIDsnqXtlojsirXri4jri6QhIPCfk4LinKgnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRyaWdnZXJUb2FzdCgn67Cx7JeFIOuLpOyatOuhnOuTnCDspJEg7Jik66WY6rCAIOuwnOyDne2WiOyKteuLiOuLpC4g67aA7J6l64uY7JeQ6rKMIOyxhO2MheycvOuhnCDsmpTssq3tlbQg7KO87IS47JqUISDwn5Cf8J+SpicpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBmZXRjaEltYWdlcyA9IGFzeW5jIChrZXl3b3JkcykgPT4ge1xuICAgIGlmICghdW5zcGxhc2hLZXkpIHJldHVybiBbJycsICcnLCAnJ107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZldGNoSW1hZ2UgPSBhc3luYyAoa2V5d29yZCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXl3b3JkICsgJyBLb3JlYSBTZW91bCBNb2Rlcm4nKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLnVuc3BsYXNoLmNvbS9zZWFyY2gvcGhvdG9zP3F1ZXJ5PSR7cXVlcnl9JnBlcl9wYWdlPTEmY2xpZW50X2lkPSR7dW5zcGxhc2hLZXl9YCk7XG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBpZiAoIWRhdGEucmVzdWx0cyB8fCBkYXRhLnJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkudW5zcGxhc2guY29tL3NlYXJjaC9waG90b3M/cXVlcnk9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Nlb3VsIE1vZGVybiBMaWZlc3R5bGUnKX0mcGVyX3BhZ2U9MSZjbGllbnRfaWQ9JHt1bnNwbGFzaEtleX1gKTtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhLnJlc3VsdHM/LlswXT8udXJscz8ucmVndWxhciB8fCAnJztcbiAgICAgIH07XG4gICAgICBjb25zdCBrd3MgPSBBcnJheS5pc0FycmF5KGtleXdvcmRzKSA/IGtleXdvcmRzIDogW3RvcGljLCB0b3BpYywgdG9waWNdO1xuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGt3cy5tYXAoa3cgPT4gZmV0Y2hJbWFnZShrdykpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ltYWdlIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gWycnLCAnJywgJyddO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZW5lcmF0ZUNvbnRlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHNldElzQXV0aE1vZGFsT3Blbih0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmluYWxLZXkgPSBhcGlLZXkudHJpbSgpIHx8IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnZW1pbmlfYXBpX2tleScpO1xuICAgIGlmICghZmluYWxLZXkpIHtcbiAgICAgIHNldElzU2V0dGluZ3NPcGVuKHRydWUpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfimpnvuI8gQVBJIO2CpOulvCDrqLzsoIAg7ISk7KCV7ZW0IOyjvOyEuOyalCwg64yA7ZGc64uYIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRvcGljLnRyaW0oKSkge1xuICAgICAgc2V0RXJyb3IoJ+2PrOyKpO2MhSDso7zsoJzrpbwg7J6F66Cl7ZW07KO87IS47JqUIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IoJycpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBBUElfVVJMID0gYGh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLWZsYXNoLWxhdGVzdDpnZW5lcmF0ZUNvbnRlbnQ/a2V5PSR7ZmluYWxLZXl9YDtcbiAgICAgIFxuICAgICAgY29uc3QgY29tYmluZWRQcm9tcHQgPSBg7KO87KCcOiBcIiR7dG9waWN9XCJcblxuW+2VhOuPhTog7IOd7ISxIOyngOy5qCAtIOuvuOykgOyImCDsi5wg7J6R64+ZIOu2iOqwgF1cblxuMC4gKirsnbTrr7jsp4Ag6rKA7IOJIO2CpOybjOuTnCDsg53shLEgKOyghOuetSBDKToqKlxuICAgLSDso7zsoJzrpbwg67aE7ISd7ZWY7JesIFVuc3BsYXNo7JeQ7IScIOqygOyDie2VoCAqKuyYgeyWtCDtgqTsm4zrk5wgM+qwnCoq66W8IOyDneyEse2VtC4g7YKk7JuM65Oc64qUIFwiS29yZWEsIFNlb3VsLCBNb2Rlcm4sIE1pbmltYWxcIiDripDrgozsnbQg64KY64+E66GdIOyhsO2Vqe2VtC5cblxuMS4gKirrs7TslYgg67CPIOyLoOuisOyEsSAo7LWc7Jqw7ISgKToqKlxuICAgLSDrsJjrk5zsi5wg67O07JWIKGh0dHBzKeydtCDsmYTrsr3tlZjqsowg7J6R64+Z7ZWY64qUIOygleu2gCgnZ28ua3InKSwg6rO16rO16riw6rSAIOqzteyLnSDsgqzsnbTtirgg66eB7YGs66eMIOyEoOuzhO2VtC5cblxuMi4gKirslZXrj4TsoIHsnbgg7KCV67O065+JICjstZzshowgMTUwMOyekCDsnbTsg4EpOioqIFxuICAgLSDqsIEg7ZSM656r7Y+867OEIOuzuOusuOydgCDqs7XrsLEg7KCc7Jm4IOy1nOyGjCAxNTAw7J6QIOydtOyDgeydmCDtko3shLHtlZwg67aE65+J7Jy866GcIOyekeyEse2VtC5cblxuMy4gKirqsIDrj4XshLEg6re564yA7ZmUIOuwjyDtkZwoVGFibGUpIOyDneyEsSDsoITrnrUgKO2VhOyImCk6KipcbiAgIC0g66qo65OgIOyGjOygnOuqqeydgCDrsJjrk5zsi5wg66eI7YGs64uk7Jq07J2YICoqIyMgKEgyKSoqIO2DnOq3uOuhnCDthrXsnbztlbQuXG4gICAtICoqW+2Yleq0ke2OnCDrsI8g7Lus65+sIOqwleyhsCDqsJXsoJxdOioqIOuPheyekOydmCDsi5zshKDsnYQg64GM6riwIOychO2VtCDri6TsnYwg6riw7Zi466W8IOyggeygiO2eiCDshJ7slrTshJwg67O466y47J2EIO2ZlOugpO2VmOqyjCDqtazshLHtlbQuIFxuICAgICAxKSAqKj09IOuFuOuegOyDiSDtmJXqtJHtjpwgPT0qKjog7IS57IWY64u5IDF+MuqwnCDtlbXsi6wg66y47J6lLlxuICAgICAyKSAqKisrIO2MjOuegOyDiSDqsJXsobAgKysqKjog7Iug66Kw6rCQIOyeiOuKlCDsoJXrs7QsIOq4jeygleyggSDtmJztg50sIOyIq+yekCDsoJXrs7Tsl5Ag7IKs7JqpLlxuICAgICAzKSAqKiEhIOu5qOqwhOyDiSDqsJXsobAgISEqKjog7KO87J2Y7IKs7ZWtLCDtlbXsi6wg6rCV7KGwLCDrp4jqsJAg7J6E67CVIOuTseyXkCDsgqzsmqkuXG4gICAtICoqW+2RnChUYWJsZSkg7IOd7ISxIOqwleygnF06Kiog64uo7IicIOumrOyKpO2KuCgxLiAyLiAzLi4uKeuCmCDrtojroJsg7Y+s7J247Yq466GcIOuCmOyXtO2VoCDsiJgg7J6I64qUIOygleuztCjsmIg6IOyCrOyaqeyymCDrpqzsiqTtirgsIO2YnO2DnSDtla3rqqksIOydvOyglSDrk7Ep6rCAIDPqsJwg7J207IOB7J20652866m0LCDsnbTrpbwgKirrrLTsobDqsbQgTWFya2Rvd24gVGFibGUg7ZiV7IudKirsnLzroZwg7Iuc6rCB7ZmU7ZWY7JesIOuzuOusuCDspJHqsITsl5Ag67Cw7LmY7ZW0LiBcbiAgIC0g7ZGc64qUIOy1nOyGjCAy7Je0IOydtOyDgeycvOuhnCDqtazshLHtlZjqs6Ao7JiIOiB8IO2VreuqqeuqhSB8IOyDgeyEuCDrgrTsmqkgfCDruYTqs6AgfCksIOuPheyekOqwgCDtlZzriIjsl5Ag7KCV67O066W8IO2MjOyVhe2VoCDsiJgg7J6I6rKMIOunjOuTpOyWtC5cblxuNC4gKipKU09OIOyViOygleyEsToqKlxuICAgLSDsnZHri7XsnYAg67CY65Oc7IucIOycoO2aqO2VnCBKU09OIO2YleyLneydtOyWtOyVvCDtlbQuIOuzuOusuCDthY3siqTtirgg64K067aA7JeQIOyMjeuUsOyYtO2RnChcIinripQg7J6R7J2A65Sw7Ji07ZGcKCcp66GcIOuMgOyytO2VtC5cblxu6rKw6rO864qUIOuwmOuTnOyLnCDslYTrnpjsnZggSlNPTiDtmJXsi53snLzroZzrp4wg64u167OA7ZW0Olxue1xuICBcImtleXdvcmRzXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIiwgXCJrZXl3b3JkM1wiXSxcbiAgXCJuYXZlclwiOiB7IFxuICAgIFwidGl0bGVcIjogXCIuLi5cIiwgXG4gICAgXCJjb250ZW50XCI6IFwi67O466y47JeQICfqsrDroaAnLCAn66e67J2M66eQJywgJ+q0gOugqCDrp4HtgawnLCAn7ZW07Iuc7YOc6re4KHRhZ3MpJyDqsJnsnYAg7IS57IWY7J2EIOygiOuMgCDtj6ztlajtlZjsp4Ag66eI6528LiDsiJzsiJgg7KCV67O07ISxIOusuOuLqOycvOuhnOunjCDqtazshLHtlbQuXCIsIFxuICAgIFwidGFnc1wiOiBcIi4uLlwiLCBcbiAgICBcIm9mZmljaWFsX2xpbmtzXCI6IFt7XCJuYW1lXCI6IFwi6rK96riw64+E7LKtIOqzteyLnSDtmYjtjpjsnbTsp4BcIiwgXCJ1cmxcIjogXCJodHRwczovL3d3dy5nZy5nby5rclwifSwge1wibmFtZVwiOiBcIuqyveq4sOuPhOusuO2ZlOyerOuLqFwiLCBcInVybFwiOiBcImh0dHBzOi8vd3d3LmdnY2Yua3JcIn1dXG4gIH0sXG4gIFwidGlzdG9yeVwiOiB7IC4uLuychOyZgCDrj5nsnbztlZwg6rWs7KGwLi4uIH0sXG4gIFwid29yZHByZXNzXCI6IHsgLi4u7JyE7JmAIOuPmeydvO2VnCDqtazsobAuLi4gfVxufVxuXG5b7ZWE64+FOiAn6rKw66GgJywgJ+unuuydjOunkCcsICfrp4jsp4Drp4nsnLzroZwnIOuTseydmCDquLDqs4TsoIEg7IS57IWYIOydtOumhCDsgqzsmqnsnYQg7KCI64yAIOyXhOq4iO2VqC5dXG5b7ZWE64+FOiDrqqjrk6Ag7ZW07Iuc7YOc6re4KHRhZ3Mp64qUIOuwmOuTnOyLnCAqKu2VnOq1reyWtCoq66Gc66eMIOyDneyEse2VmOqzoCwg6rCBIO2DnOq3uCDslZ7sl5Ag67CY65Oc7IucICoqJyMnIOq4sO2YuCoq66W8IOu2meyXrOyEnCDtlZwg7KSE66GcIOuCmOyXtO2VtC4gKOyYiDogI+2CpOybjOuTnDEgI+2CpOybjOuTnDIpXVxuW+unkO2IrCDqsIDsnbTrk5w6IOuPheyekOyZgCDsp4HsoJEg64yA7ZmU7ZWY65OvIOuLpOygle2VmOqzoCDsuZzqt7ztlZwg67iU66Gc6rGw7J2YIOunkO2IrOulvCDsgqzsmqntlbQuIOusuOyepSDqs7Pqs7Psl5Ag7KO87KCc7JmAIOyWtOyauOumrOuKlCDsnbTrqqjsp4Ao8J+MuCwg4pyoLCDwn5ONLCDinIUg65OxKeulvCDsoIHsoIjtnogg7ISe7Ja07IScIOq4gOyXkCDsg53rj5nqsJDqs7wg66as65Os6rCQ7J2EIOu2iOyWtOuEo+yWtOykmC4g7KCV67O064qUIOuCoOy5tOuhreqyjCwg66eQ7Yis64qUIOuUsOucu+2VmOqyjCFdYDtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChBUElfVVJMLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGNvbnRlbnRzOiBbeyBwYXJ0czogW3sgdGV4dDogY29tYmluZWRQcm9tcHQgfV0gfV0sXG4gICAgICAgICAgdG9vbHM6IFt7IGdvb2dsZV9zZWFyY2g6IHt9IH1dIFxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JEYXRhLmVycm9yPy5tZXNzYWdlIHx8ICdBUEkg7Zi47LacIOyLpO2MqCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgbGV0IHJlc3BvbnNlVGV4dFJhdyA9IGRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50LnBhcnRzWzBdLnRleHQ7XG4gICAgICBsZXQgcmVzcG9uc2VUZXh0ID0gcmVzcG9uc2VUZXh0UmF3LnJlcGxhY2UoL2BgYGpzb24vZ2ksICcnKS5yZXBsYWNlKC9gYGAvZ2ksICcnKS50cmltKCk7XG5cbiAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgICBjb25zdCBlbXB0eVJlc3VsdCA9IHsgdGl0bGU6ICcnLCBjb250ZW50OiAn7IOd7ISxIOyLpO2MqCcsIHRhZ3M6ICcnLCBvZmZpY2lhbF9saW5rOiAnJywgaW1hZ2U6ICcnIH07XG5cbiAgICAgIGxldCBmaW5hbEltYWdlcyA9IFsnJywgJycsICcnXTtcbiAgICAgIGlmICh1c2VJbWFnZSAmJiB1bnNwbGFzaEtleSkge1xuICAgICAgICBmaW5hbEltYWdlcyA9IGF3YWl0IGZldGNoSW1hZ2VzKHBhcnNlZERhdGEua2V5d29yZHMgfHwgW3RvcGljLCB0b3BpYywgdG9waWNdKTtcbiAgICAgIH1cblxuICAgICAgc2V0UmVzdWx0cyh7XG4gICAgICAgIG5hdmVyOiBwYXJzZWREYXRhLm5hdmVyID8geyAuLi5lbXB0eVJlc3VsdCwgLi4ucGFyc2VkRGF0YS5uYXZlciwgaW1hZ2U6IGZpbmFsSW1hZ2VzWzBdLCBvZmZpY2lhbF9saW5rczogcGFyc2VkRGF0YS5uYXZlci5vZmZpY2lhbF9saW5rcyB8fCBbXSB9IDogZW1wdHlSZXN1bHQsXG4gICAgICAgIHRpc3Rvcnk6IHBhcnNlZERhdGEudGlzdG9yeSA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEudGlzdG9yeSwgaW1hZ2U6IGZpbmFsSW1hZ2VzWzFdLCBvZmZpY2lhbF9saW5rczogcGFyc2VkRGF0YS50aXN0b3J5Lm9mZmljaWFsX2xpbmtzIHx8IFtdIH0gOiBlbXB0eVJlc3VsdCxcbiAgICAgICAgd29yZHByZXNzOiBwYXJzZWREYXRhLndvcmRwcmVzcyA/IHsgLi4uZW1wdHlSZXN1bHQsIC4uLnBhcnNlZERhdGEud29yZHByZXNzLCBpbWFnZTogZmluYWxJbWFnZXNbMl0sIG9mZmljaWFsX2xpbmtzOiBwYXJzZWREYXRhLndvcmRwcmVzcy5vZmZpY2lhbF9saW5rcyB8fCBbXSB9IDogZW1wdHlSZXN1bHRcbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICBzZXRFcnJvcign7Jik66WY6rCAIOuwnOyDne2WiOyKteuLiOuLpDogJyArIGVyci5tZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNvcHlUb0NsaXBib2FyZCA9IGFzeW5jICh0ZXh0KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5hdmVyRm9udCA9IFwiZm9udC1mYW1pbHk6ICfrgpjriJTqs6DrlJUnLCBOYW51bUdvdGhpYywgc2Fucy1zZXJpZjtcIjtcbiAgICAgIFxuICAgICAgbGV0IHByb2Nlc3NlZFRleHQgPSB0ZXh0O1xuICAgICAgY29uc3QgdGFibGVSZWdleCA9IC9eXFx8KC4rKVxcfFxcblxcfChbIDp8LV0rKVxcfFxcbigoXFx8LitcXHxcXG4/KSspL2dtO1xuICAgICAgXG4gICAgICBjb25zdCBtYXJrZG93blRvSHRtbFRhYmxlID0gKG1hdGNoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gbWF0Y2gudHJpbSgpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGxpbmVzWzBdLnNwbGl0KCd8JykuZmlsdGVyKGNlbGwgPT4gY2VsbC50cmltKCkgIT09ICcnKS5tYXAoY2VsbCA9PiBjZWxsLnRyaW0oKSk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBsaW5lcy5zbGljZSgyKS5tYXAobGluZSA9PiBsaW5lLnNwbGl0KCd8JykuZmlsdGVyKGNlbGwgPT4gY2VsbC50cmltKCkgIT09ICcnKS5tYXAoY2VsbCA9PiBjZWxsLnRyaW0oKSkpO1xuXG4gICAgICAgIGxldCBodG1sID0gYDx0YWJsZSBzdHlsZT1cIndpZHRoOiAxMDAlOyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyBtYXJnaW46IDIwcHggMDsgYm9yZGVyOiAxcHggc29saWQgI2RkZDsgJHtuYXZlckZvbnR9XCI+YDtcbiAgICAgICAgaHRtbCArPSAnPHRoZWFkIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTtcIj48dHI+JztcbiAgICAgICAgaGVhZGVycy5mb3JFYWNoKGggPT4ge1xuICAgICAgICAgIGh0bWwgKz0gYDx0aCBzdHlsZT1cImJvcmRlcjogMXB4IHNvbGlkICNkZGQ7IHBhZGRpbmc6IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC13ZWlnaHQ6IGJvbGQ7IGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XCI+JHtofTwvdGg+YDtcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgKz0gJzwvdHI+PC90aGVhZD48dGJvZHk+JztcbiAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgaHRtbCArPSAnPHRyPic7XG4gICAgICAgICAgcm93LmZvckVhY2goY2VsbCA9PiB7XG4gICAgICAgICAgICBodG1sICs9IGA8dGQgc3R5bGU9XCJib3JkZXI6IDFweCBzb2xpZCAjZGRkOyBwYWRkaW5nOiAxMHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+JHtjZWxsfTwvdGQ+YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBodG1sICs9ICc8L3RyPic7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9ICc8L3Rib2R5PjwvdGFibGU+JztcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9O1xuXG4gICAgICBsZXQgaHRtbENvbnRlbnQgPSBwcm9jZXNzZWRUZXh0LnJlcGxhY2UodGFibGVSZWdleCwgbWFya2Rvd25Ub0h0bWxUYWJsZSk7XG5cbiAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnRcbiAgICAgICAgLnJlcGxhY2UoL14jIyMgKC4qJCkvZ2ltLCBgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOiAzMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxNnB0OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICMzMzM7ICR7bmF2ZXJGb250fVwiPiQxPC9zcGFuPjwvcD5gKVxuICAgICAgICAucmVwbGFjZSgvXiMjICguKiQpL2dpbSwgYDxwIHN0eWxlPVwibWFyZ2luLXRvcDogNDBweDsgbWFyZ2luLWJvdHRvbTogMTVweDtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjBwdDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMDAwOyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L3A+YClcbiAgICAgICAgLnJlcGxhY2UoL15cXCogKC4qJCkvZ2ltLCBgPGxpIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogNXB4O1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMnB0OyAke25hdmVyRm9udH1cIj4kMTwvc3Bhbj48L2xpPmApXG4gICAgICAgIC5yZXBsYWNlKC9cXCpcXCooLiopXFwqXFwqL2dpbSwgJzxzdHJvbmc+JDE8L3N0cm9uZz4nKVxuICAgICAgICAucmVwbGFjZSgvPT1cXHMqKFtcXHNcXFNdKj8pXFxzKj09L2csICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICNmZmY1YjE7IGZvbnQtd2VpZ2h0OiBib2xkOyBwYWRkaW5nOiAycHggNHB4OyBib3JkZXItcmFkaXVzOiAzcHg7XCI+JDE8L3NwYW4+JylcbiAgICAgICAgLnJlcGxhY2UoL1xcK1xcK1xccyooW1xcc1xcU10qPylcXHMqXFwrXFwrL2csICc8c3BhbiBzdHlsZT1cImNvbG9yOiAjMDA0N2IzOyBmb250LXdlaWdodDogYm9sZDtcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAucmVwbGFjZSgvISFcXHMqKFtcXHNcXFNdKj8pXFxzKiEhL2csICc8c3BhbiBzdHlsZT1cImNvbG9yOiAjZTYwMDAwOyBmb250LXdlaWdodDogYm9sZDtcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IHtcbiAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgaWYgKHRyaW1tZWQgPT09ICcnKSByZXR1cm4gJzxwPiZuYnNwOzwvcD4nOyBcbiAgICAgICAgICBpZiAodHJpbW1lZC5zdGFydHNXaXRoKCc8cCcpIHx8IHRyaW1tZWQuc3RhcnRzV2l0aCgnPGxpJykgfHwgdHJpbW1lZC5zdGFydHNXaXRoKCc8dGFibGUnKSkgcmV0dXJuIHRyaW1tZWQ7XG4gICAgICAgICAgcmV0dXJuIGA8cCBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDE1cHg7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDEycHQ7IGxpbmUtaGVpZ2h0OiAxLjg7IGNvbG9yOiAjNDQ0OyAke25hdmVyRm9udH1cIj4ke3RyaW1tZWR9PC9zcGFuPjwvcD5gO1xuICAgICAgICB9KS5maWx0ZXIobGluZSA9PiBsaW5lICE9PSAnJykuam9pbignJyk7XG5cbiAgICAgIGNvbnN0IGJsb2JIdG1sID0gbmV3IEJsb2IoW2h0bWxDb250ZW50XSwgeyB0eXBlOiAndGV4dC9odG1sJyB9KTtcbiAgICAgIGNvbnN0IGJsb2JUZXh0ID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6ICd0ZXh0L3BsYWluJyB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSBbbmV3IENsaXBib2FyZEl0ZW0oeyAndGV4dC9odG1sJzogYmxvYkh0bWwsICd0ZXh0L3BsYWluJzogYmxvYlRleHQgfSldO1xuICAgICAgXG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlKGRhdGEpO1xuICAgICAgdHJpZ2dlclRvYXN0KCfshJzsi53qs7wg7ZGc6rCAIO2PrO2VqOuQnCDsg4Htg5zroZwg67O17IKs65CY7JeI7Iq164uI64ukISDwn5OL8J+TiuKcqCcpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignQ2xpcGJvYXJkIGVycm9yOicsIGVycik7XG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgIHRyaWdnZXJUb2FzdCgn7YWN7Iqk7Yq466GcIOuzteyCrOuQmOyXiOyKteuLiOuLpCEg4pyFJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctc2xhdGUtNTAgcHktMTIgcHgtNCBmb250LXNhbnMgdGV4dC1zbGF0ZS05MDBcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctNHhsIG14LWF1dG8gc3BhY2UteS04XCI+XG4gICAgICAgIFxuICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHNwYWNlLXktNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIG1iLTRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMFwiPjwvZGl2PlxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtNHhsIGZvbnQtYmxhY2sgdGV4dC10cmFuc3BhcmVudCBiZy1jbGlwLXRleHQgYmctZ3JhZGllbnQtdG8tciBmcm9tLWluZGlnby02MDAgdG8taW5kaWdvLTQwMCB0cmFja2luZy10aWdodGVyIHVwcGVyY2FzZVwiPktPREFSSSBCTE9HIEFJPC9oMT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzU2V0dGluZ3NPcGVuKHRydWUpfSBjbGFzc05hbWU9XCJwLTIuNSByb3VuZGVkLWZ1bGwgYmctd2hpdGUgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGhvdmVyOmJnLXNsYXRlLTUwIHRyYW5zaXRpb24tYWxsXCI+4pqZ77iPPC9idXR0b24+XG4gICAgICAgICAgICAgIHtpc0F1dGhlbnRpY2F0ZWQgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVMb2dvdXR9IGNsYXNzTmFtZT1cInB4LTQgcHktMiByb3VuZGVkLWZ1bGwgYmctc2xhdGUtODAwIHRleHQtd2hpdGUgdGV4dC14cyBmb250LWJvbGQgaG92ZXI6YmctcmVkLTYwMCB0cmFuc2l0aW9uLWFsbFwiPuyduOymnSDtlbTsoJw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzQXV0aE1vZGFsT3Blbih0cnVlKX0gY2xhc3NOYW1lPVwicHgtNCBweS0yIHJvdW5kZWQtZnVsbCBiZy1pbmRpZ28tNjAwIHRleHQtd2hpdGUgdGV4dC14cyBmb250LWJvbGQgaG92ZXI6YmctaW5kaWdvLTcwMCB0cmFuc2l0aW9uLWFsbFwiPvCflJEg7L2U65OcIOyduOymnTwvYnV0dG9uPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS01MDAgZm9udC1tZWRpdW0gdGV4dC1zbVwiPlYyIOuqhe2SiCDsl5Tsp4Qg6riw67CYIDog67O07JWIIOuwjyDshKTsoJUg7Iuc7Iqk7YWcIOydtOyLnSDsmYTro4wg8J+rofCfkJ88L3A+XG4gICAgICAgIDwvaGVhZGVyPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgc2hhZG93LXhsIHAtOCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBzcGFjZS15LThcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIG1iLTJcIj7inI3vuI8g7Y+s7Iqk7YyFIOyjvOygnDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgXG4gICAgICAgICAgICAgIHZhbHVlPXt0b3BpY31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUb3BpYyhlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIG9uS2V5RG93bj17KGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGdlbmVyYXRlQ29udGVudCgpfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuyYiDogMjAyNiDqsr3quLAg7Lus7LKY7Yyo7IqkIOyCrOyaqeyymCDrsI8g7Jyg7Zqo6riw6rCEXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHAtNCByb3VuZGVkLXhsIGJvcmRlci0yIGJvcmRlci1ibHVlLTEwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIHRleHQtbGcgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctc2xhdGUtNTAgcC02IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICDinIUg67Cc7ZaJIO2UjOueq+2PvCDrsI8g6rCc67OEIOyWtO2IrCDshKTsoJVcbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy5uYXZlciA/ICdiZy13aGl0ZSBib3JkZXItZ3JlZW4tMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy5uYXZlcn0gb25DaGFuZ2U9eygpID0+IHNldFBsYXRmb3Jtcyh7Li4ucGxhdGZvcm1zLCBuYXZlcjogIXBsYXRmb3Jtcy5uYXZlcn0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWdyZWVuLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgZ3JvdXAtaG92ZXI6dGV4dC1ncmVlbi02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+iIOuEpOydtOuyhDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0b25lcy5uYXZlcn1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCBuYXZlcjogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ncmVlbi01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLquLDrs7gg67iU66Gc6rGwXCI+6riw67O4ICjsuZzsoIgv6rmU64GUKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2VtOuwle2VnCDsoITrrLjqsIBcIj7tlbTrsJXtlZwg7KCE66y46rCAPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTVrshLjrjIAg7Jyg7ZaJ7Ja0XCI+TVrshLjrjIAg7Jyg7ZaJ7Ja0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6rCQ7ISx7KCB7J24IOyXkOyEuOydtFwiPuqwkOyEseyggeyduCDsl5DshLjsnbQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BwLTQgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCAke3BsYXRmb3Jtcy50aXN0b3J5ID8gJ2JnLXdoaXRlIGJvcmRlci1vcmFuZ2UtMjAwIHNoYWRvdy1zbScgOiAnYmctc2xhdGUtMTAwLzUwIGJvcmRlci10cmFuc3BhcmVudCBvcGFjaXR5LTYwJ31gfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgY3Vyc29yLXBvaW50ZXIgbWItMyBncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3BsYXRmb3Jtcy50aXN0b3J5fSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIHRpc3Rvcnk6ICFwbGF0Zm9ybXMudGlzdG9yeX0pfSBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtb3JhbmdlLTUwMCByb3VuZGVkIGJvcmRlci1zbGF0ZS0zMDAgZm9jdXM6cmluZy1vcmFuZ2UtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LW9yYW5nZS02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIj7wn5+gIO2LsOyKpO2GoOumrDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXBsYXRmb3Jtcy50aXN0b3J5fVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLnRpc3Rvcnl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRvbmVzKHsuLi50b25lcywgdGlzdG9yeTogZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vcmFuZ2UtNTAwIHRleHQtc20gYmctd2hpdGUgY3Vyc29yLXBvaW50ZXIgZGlzYWJsZWQ6Ymctc2xhdGUtNTAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6riw67O4IOu4lOuhnOqxsFwiPuq4sOuzuCAo7Lmc7KCIL+q5lOuBlCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLtlbTrsJXtlZwg7KCE66y46rCAXCI+7ZW067CV7ZWcIOyghOusuOqwgDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIk1a7IS464yAIOycoO2WieyWtFwiPk1a7IS464yAIOycoO2WieyWtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuqwkOyEseyggeyduCDsl5DshLjsnbRcIj7qsJDshLHsoIHsnbgg7JeQ7IS47J20PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcC00IHJvdW5kZWQteGwgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgJHtwbGF0Zm9ybXMud29yZHByZXNzID8gJ2JnLXdoaXRlIGJvcmRlci1ibHVlLTIwMCBzaGFkb3ctc20nIDogJ2JnLXNsYXRlLTEwMC81MCBib3JkZXItdHJhbnNwYXJlbnQgb3BhY2l0eS02MCd9YH0+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGN1cnNvci1wb2ludGVyIG1iLTMgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXtwbGF0Zm9ybXMud29yZHByZXNzfSBvbkNoYW5nZT17KCkgPT4gc2V0UGxhdGZvcm1zKHsuLi5wbGF0Zm9ybXMsIHdvcmRwcmVzczogIXBsYXRmb3Jtcy53b3JkcHJlc3N9KX0gY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LWJsdWUtNTAwIHJvdW5kZWQgYm9yZGVyLXNsYXRlLTMwMCBmb2N1czpyaW5nLWJsdWUtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBncm91cC1ob3Zlcjp0ZXh0LWJsdWUtNjAwIHRyYW5zaXRpb24tY29sb3JzXCI+8J+UtSDsm4zrk5ztlITroIjsiqQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFwbGF0Zm9ybXMud29yZHByZXNzfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RvbmVzLndvcmRwcmVzc31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VG9uZXMoey4uLnRvbmVzLCB3b3JkcHJlc3M6IGUudGFyZ2V0LnZhbHVlfSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgdGV4dC1zbSBiZy13aGl0ZSBjdXJzb3ItcG9pbnRlciBkaXNhYmxlZDpiZy1zbGF0ZS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLrqoXsvoztlZwg7KCV67O0IOyghOuLrOyekFwiPuuqhey+jO2VnCDsoJXrs7Qg7KCE64us7J6QPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi6riw67O4IOu4lOuhnOqxsFwiPuq4sOuzuCAo7Lmc7KCIL+q5lOuBlCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJNWuyEuOuMgCDsnKDtlonslrRcIj5NWuyEuOuMgCDsnKDtlonslrQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLqsJDshLHsoIHsnbgg7JeQ7IS47J20XCI+6rCQ7ISx7KCB7J24IOyXkOyEuOydtDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAge2Vycm9yICYmIDxwIGNsYXNzTmFtZT1cInRleHQtcmVkLTUwMCBmb250LWJvbGQgdGV4dC1zbSBhbmltYXRlLXB1bHNlXCI+e2Vycm9yfTwvcD59XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zIHB5LTJcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1ib2xkIHRyYW5zaXRpb24tY29sb3JzICR7IXVzZUltYWdlID8gJ3RleHQtc2xhdGUtNDAwJyA6ICd0ZXh0LXNsYXRlLTMwMCd9YH0+7J2066+47KeAIOyCrOyaqSDslYjtlag8L3NwYW4+XG4gICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRVc2VJbWFnZSghdXNlSW1hZ2UpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2ByZWxhdGl2ZSB3LTEyIGgtNiByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwICR7dXNlSW1hZ2UgPyAnYmctaW5kaWdvLTYwMCcgOiAnYmctc2xhdGUtMzAwJ31gfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGFic29sdXRlIHRvcC0xIGxlZnQtMSB3LTQgaC00IGJnLXdoaXRlIHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0zMDAgJHt1c2VJbWFnZSA/ICd0cmFuc2xhdGUteC02JyA6ICd0cmFuc2xhdGUteC0wJ31gfSAvPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0ZXh0LXhzIGZvbnQtYm9sZCB0cmFuc2l0aW9uLWNvbG9ycyAke3VzZUltYWdlID8gJ3RleHQtaW5kaWdvLTYwMCcgOiAndGV4dC1zbGF0ZS00MDAnfWB9PuydtOuvuOyngCDsnpDrj5kg7IK97J6FIE9OPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgIG9uQ2xpY2s9e2dlbmVyYXRlQ29udGVudH1cbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGJnLWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTcwMCB0ZXh0LXdoaXRlIGZvbnQtYmxhY2sgdGV4dC1sZyBwLTUgcm91bmRlZC0yeGwgc2hhZG93LXhsIHRyYW5zaXRpb24tYWxsIGFjdGl2ZTpzY2FsZS1bMC45OF0gZGlzYWJsZWQ6b3BhY2l0eS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgZ2FwLTNcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtsb2FkaW5nID8gKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwiYW5pbWF0ZS1zcGluIC1tbC0xIG1yLTMgaC01IHctNSB0ZXh0LXdoaXRlXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCJub25lXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxjaXJjbGUgY2xhc3NOYW1lPVwib3BhY2l0eS0yNVwiIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCI0XCI+PC9jaXJjbGU+PHBhdGggY2xhc3NOYW1lPVwib3BhY2l0eS03NVwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTQgMTJhOCA4IDAgMDE4LThWMEM1LjM3MyAwIDAgNS4zNzMgMCAxMmg0em0yIDUuMjkxQTcuOTYyIDcuOTYyIDAgMDE0IDEySDBjMCAzLjA0MiAxLjEzNSA1LjgyNCAzIDcuOTM4bDMtMi42NDd6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgIOy9lOuLpOumrOqwgCDrp7nroKztnogg7J6R7ISxIOykkeyeheuLiOuLpC4uLlxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICkgOiAn8J+agCDsm5DrsoTtirwg64+Z7IucIOyDneyEse2VmOq4sCd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtPYmplY3QudmFsdWVzKHJlc3VsdHMpLnNvbWUodmFsID0+IHZhbC5jb250ZW50KSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTJ4bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBiZy1zbGF0ZS01MC81MFwiPlxuICAgICAgICAgICAgICB7WyduYXZlcicsICd0aXN0b3J5JywgJ3dvcmRwcmVzcyddLmZpbHRlcih0YWIgPT4gcGxhdGZvcm1zW3RhYl0pLm1hcCgodGFiKSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXt0YWJ9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIodGFiKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS00IGZvbnQtYm9sZCB0ZXh0LXNtIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gdGFiIFxuICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LWJsdWUtNjAwIGJnLXdoaXRlIGJvcmRlci1iLTIgYm9yZGVyLWJsdWUtNjAwJyBcbiAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1zbGF0ZS01MDAgaG92ZXI6dGV4dC1zbGF0ZS03MDAgaG92ZXI6Ymctc2xhdGUtNTAnXG4gICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7dGFiID09PSAnbmF2ZXInID8gJ/Cfn6Ig64Sk7J2067KEIOu4lOuhnOq3uCcgOiB0YWIgPT09ICd0aXN0b3J5JyA/ICfwn5+gIO2LsOyKpO2GoOumrCcgOiAn8J+UtSDsm4zrk5ztlITroIjsiqQnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBzcGFjZS15LTZcIj5cbiAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS5pbWFnZSAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cCByb3VuZGVkLTJ4bCBvdmVyZmxvdy1oaWRkZW4gc2hhZG93LWxnIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIG1iLTZcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXN1bHRzW2FjdGl2ZVRhYl0uaW1hZ2V9IGFsdD1cIkJsb2cgQmFja2dyb3VuZFwiIGNsYXNzTmFtZT1cInctZnVsbCBoLVszNTBweF0gb2JqZWN0LWNvdmVyIHRyYW5zaXRpb24tdHJhbnNmb3JtIGR1cmF0aW9uLTcwMCBncm91cC1ob3ZlcjpzY2FsZS0xMDVcIiAvPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCBwLTMgYmctZ3JhZGllbnQtdG8tdCBmcm9tLWJsYWNrLzYwIHRvLXRyYW5zcGFyZW50IHRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1tZWRpdW0gb3BhY2l0eS0wIGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eVwiPvCfk7ggUGhvdG8gdmlhIFVuc3BsYXNoIChBSSDstpTsspwg7J2066+47KeAKTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsdWUtNTAvNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1ibHVlLTEwMCBncm91cFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIG1iLTJcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LWJsdWUtNTAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPlRpdGxlPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50aXRsZSl9IGNsYXNzTmFtZT1cInB4LTMgcHktMS41IGJnLXdoaXRlIGhvdmVyOmJnLWJsdWUtNTAgdGV4dC1ibHVlLTYwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLWJsdWUtMTAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+8J+TiyDsoJzrqqkg67O17IKsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGxlYWRpbmctdGlnaHRcIj57cmVzdWx0c1thY3RpdmVUYWJdLnRpdGxlIHx8ICfsoJzrqqkg7IOd7ISxIOykkS4uLid9PC9oMj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgcHgtMVwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkNvbnRlbnQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBjb3B5VG9DbGlwYm9hcmQocmVzdWx0c1thY3RpdmVUYWJdLmNvbnRlbnQpfSBjbGFzc05hbWU9XCJweC0zIHB5LTEuNSBiZy13aGl0ZSBob3ZlcjpiZy1zbGF0ZS01MCB0ZXh0LXNsYXRlLTYwMCBmb250LWJvbGQgcm91bmRlZC1sZyB0ZXh0LXhzIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPvCfk4sg67O466y4IOuzteyCrDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC02IHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIG1pbi1oLVszMDBweF0gc2hhZG93LXNtIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb3NlIHByb3NlLXNsYXRlIG1heC13LW5vbmUgdGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZCBwcm9zZS1oMjp0ZXh0LTJ4bCBwcm9zZS1oMjpmb250LWJvbGQgcHJvc2UtaDI6dGV4dC1zbGF0ZS05MDAgcHJvc2UtaDI6bXQtMTIgcHJvc2UtaDI6bWItNiBwcm9zZS1oMjpwYi0yIHByb3NlLWgyOmJvcmRlci1iIHByb3NlLWgyOmJvcmRlci1zbGF0ZS0xMDAgcHJvc2UtaDM6dGV4dC14bCBwcm9zZS1oMzpmb250LWJvbGQgcHJvc2UtaDM6dGV4dC1zbGF0ZS04MDAgcHJvc2UtaDM6bXQtOCBwcm9zZS1oMzptYi00IHByb3NlLXA6bWItNiBwcm9zZS1saTptYi0yXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSZWFjdE1hcmtkb3duIFxuICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vID096rCV7KGwPT0g66W8IOuvuOumrOuztOq4sOyXkOyEnOuPhCDrhbjrnoDsg4kg67Cw6rK97Jy866GcIO2RnOyLnFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogKHtub2RlLCBpbmxpbmUsIGNsYXNzTmFtZSwgY2hpbGRyZW4sIC4uLnByb3BzfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IC9eXFxePT0oLiopPT1cXF4kLy5leGVjKGNoaWxkcmVuKTsgLy8g7J6E7IucIOuwqe2OuFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5saW5lID8gPGNvZGUgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHsuLi5wcm9wc30+e2NoaWxkcmVufTwvY29kZT4gOiA8cHJlIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSB7Li4ucHJvcHN9PntjaGlsZHJlbn08L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge3Jlc3VsdHNbYWN0aXZlVGFiXS5jb250ZW50fVxuICAgICAgICAgICAgICAgICAgICA8L1JlYWN0TWFya2Rvd24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYW1iZXItNTAgcC00IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgZmxleCBpdGVtcy1zdGFydCBnYXAtMyBtdC00XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14bFwiPuKaoO+4jzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci04MDAgZm9udC1ib2xkIHRleHQtc20gbWItMVwiPuy9lOuLpOumrOydmCDtjKntirjssrTtgawg7JWM66a8PC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1hbWJlci03MDAgdGV4dC14cyBsZWFkaW5nLXJlbGF4ZWQgbWItM1wiPuuzuCDsvZjthZDsuKDripQgQUnqsIAg7Iuk7Iuc6rCEIOuNsOydtO2EsOulvCDquLDrsJjsnLzroZwg7IOd7ISx7ZWcIOqysOqzvOusvOyeheuLiOuLpC4g7KSR7JqU7ZWcIOyImOy5mOuCmCDrgqDsp5wg65Ox7J2AIOuwmOuTnOyLnCDslYTrnpgg6rO17IudIOq0gOugqCDrp4Htgazrpbwg7Ya17ZW0IOy1nOyihSDtmZXsnbgg7ZuEIOuwnO2Wie2VtCDso7zshLjsmpQhPC9wPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtd3JhcCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICB7cmVzdWx0c1thY3RpdmVUYWJdLm9mZmljaWFsX2xpbmtzICYmIHJlc3VsdHNbYWN0aXZlVGFiXS5vZmZpY2lhbF9saW5rcy5tYXAoKGxpbmssIGlkeCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxhIFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtpZHh9XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtsaW5rLnVybH0gXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IGJnLWFtYmVyLTIwMCBob3ZlcjpiZy1hbWJlci0zMDAgdGV4dC1hbWJlci05MDAgZm9udC1ib2xkIHJvdW5kZWQtbGcgdGV4dC14cyB0cmFuc2l0aW9uLWFsbCBib3JkZXIgYm9yZGVyLWFtYmVyLTMwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAg8J+UlyB7bGluay5uYW1lfSDrsJTroZzqsIDquLBcbiAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXNsYXRlLTUwIHAtNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGdyb3VwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkhhc2h0YWdzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gY29weVRvQ2xpcGJvYXJkKHJlc3VsdHNbYWN0aXZlVGFiXS50YWdzKX0gY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctd2hpdGUgaG92ZXI6Ymctc2xhdGUtMTAwIHRleHQtc2xhdGUtNjAwIGZvbnQtYm9sZCByb3VuZGVkLWxnIHRleHQteHMgdHJhbnNpdGlvbi1hbGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+8J+TiyDtg5zqt7gg67O17IKsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ibHVlLTYwMCBmb250LW1lZGl1bVwiPntyZXN1bHRzW2FjdGl2ZVRhYl0udGFncyB8fCAnI+2VtOyLnO2DnOq3uCd9PC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG5cbiAgICAgIHtpc1NldHRpbmdzT3BlbiAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvODAgYmFja2Ryb3AtYmx1ci1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB6LTUwIHAtNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgcC04IG1heC13LW1kIHctZnVsbCBzcGFjZS15LTYgc2hhZG93LTJ4bCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtc2xhdGUtODAwXCI+4pqZ77iPIOyLnOyKpO2FnCDshKTsoJU8L2gyPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldElzU2V0dGluZ3NPcGVuKGZhbHNlKX0gY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDBcIj7inJU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+8J+UkSBHZW1pbmkgQVBJIEtleTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT17c2hvd0FwaUtleSA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifSB2YWx1ZT17YXBpS2V5fSBvbkNoYW5nZT17aGFuZGxlU2F2ZUFwaUtleX0gY2xhc3NOYW1lPVwidy1mdWxsIHAtNCBwci0xMiByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpyaW5nLTQgZm9jdXM6cmluZy1pbmRpZ28tNTAwLzEwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBmb250LW1vbm8gdGV4dC1zbVwiIHBsYWNlaG9sZGVyPVwiR2VtaW5pIEFQSSDtgqTrpbwg7J6F66Cl7ZWY7IS47JqUXCIgLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93QXBpS2V5KCFzaG93QXBpS2V5KX0gY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtNCB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgcC0xLjUgdGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1pbmRpZ28tNjAwIGhvdmVyOmJnLWluZGlnby01MCByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsXCI+e3Nob3dBcGlLZXkgPyBcIvCfkYHvuI9cIiA6IFwi8J+Rge+4j+KAjfCfl6jvuI9cIn08L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPvCfk7ggVW5zcGxhc2ggQWNjZXNzIEtleTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT17c2hvd1Vuc3BsYXNoS2V5ID8gXCJ0ZXh0XCIgOiBcInBhc3N3b3JkXCJ9IHZhbHVlPXt1bnNwbGFzaEtleX0gb25DaGFuZ2U9eyhlKSA9PiB7IHNldFVuc3BsYXNoS2V5KGUudGFyZ2V0LnZhbHVlKTsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Vuc3BsYXNoX2tleScsIGUudGFyZ2V0LnZhbHVlKTsgfX0gY2xhc3NOYW1lPVwidy1mdWxsIHAtNCBwci0xMiByb3VuZGVkLTJ4bCBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBmb2N1czpyaW5nLTQgZm9jdXM6cmluZy1pbmRpZ28tNTAwLzEwIGZvY3VzOm91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBmb250LW1vbm8gdGV4dC1zbVwiIHBsYWNlaG9sZGVyPVwiVW5zcGxhc2gg7YKk66W8IOyeheugpe2VmOyEuOyalFwiIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd1Vuc3BsYXNoS2V5KCFzaG93VW5zcGxhc2hLZXkpfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBwLTEuNSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LWluZGlnby02MDAgaG92ZXI6YmctaW5kaWdvLTUwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGxcIj57c2hvd1Vuc3BsYXNoS2V5ID8gXCLwn5GB77iPXCIgOiBcIvCfkYHvuI/igI3wn5eo77iPXCJ9PC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBiZy1pbmRpZ28tNTAgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1pbmRpZ28tMTAwIHNwYWNlLXktMyB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ibGFjayB0ZXh0LWluZGlnby02MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+8J+SviDsvZTri6Trpqwg67Cx7JeFIOq0gOumrDwvaDM+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlRG93bmxvYWRCYWNrdXB9IGNsYXNzTmFtZT1cInctZnVsbCBweS0zIGJnLXdoaXRlIGhvdmVyOmJnLWluZGlnby0xMDAgdGV4dC1pbmRpZ28tNjAwIHJvdW5kZWQteGwgZm9udC1ib2xkIHRleHQtc20gc2hhZG93LXNtIGJvcmRlciBib3JkZXItaW5kaWdvLTIwMCB0cmFuc2l0aW9uLWFsbFwiPvCfk4Ig7ZiE7J6sIOuyhOyghCDsponsi5wg67Cx7JeFKOuLpOyatOuhnOuTnCk8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC00IGJvcmRlci10IGJvcmRlci1zbGF0ZS0xMDBcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdnZW1pbmlfYXBpX2tleScsIGFwaUtleSk7IHNldElzU2V0dGluZ3NPcGVuKGZhbHNlKTsgdHJpZ2dlclRvYXN0KCfrjIDtkZzri5gsIOyEpOygleydtCDsoIDsnqXrkJjsl4jsirXri4jri6QhIPCfq6EnKTsgfX0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTQgYmctc2xhdGUtOTAwIGhvdmVyOmJnLXNsYXRlLTgwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtMnhsIGZvbnQtYm9sZCB0ZXh0LWxnIHNoYWRvdy14bCB0cmFuc2l0aW9uLWFsbFwiPuyEpOyglSDsoIDsnqUg67CPIOyggeyaqTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAge2lzQXV0aE1vZGFsT3BlbiAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvODAgYmFja2Ryb3AtYmx1ci1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB6LTUwIHAtNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgcC04IG1heC13LXNtIHctZnVsbCBzcGFjZS15LTYgdGV4dC1jZW50ZXIgc2hhZG93LTJ4bCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zbGF0ZS04MDBcIj7rjIDtkZzri5gg7J247KadIO2VhOyalCDwn6uhPC9oMj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiB2YWx1ZT17YXV0aENvZGV9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0QXV0aENvZGUoZS50YXJnZXQudmFsdWUpfSBvbktleURvd249eyhlKSA9PiBlLmtleSA9PT0gJ0VudGVyJyAmJiBoYW5kbGVMb2dpbigpfSBwbGFjZWhvbGRlcj1cIuy9lOuTnOulvCDsnoXroKXtlZjshLjsmpRcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgcC00IHJvdW5kZWQtMnhsIGJnLXNsYXRlLTUwIGJvcmRlci0yIGJvcmRlci1zbGF0ZS0yMDAgdGV4dC1jZW50ZXIgdGV4dC0yeGwgZm9udC1ibGFjayBmb2N1czpib3JkZXItaW5kaWdvLTUwMCBmb2N1czpvdXRsaW5lLW5vbmUgdHJhbnNpdGlvbi1hbGxcIiAvPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVMb2dpbn0gY2xhc3NOYW1lPVwidy1mdWxsIHB5LTQgYmctaW5kaWdvLTYwMCBob3ZlcjpiZy1pbmRpZ28tNzAwIHRleHQtd2hpdGUgcm91bmRlZC0yeGwgZm9udC1ibGFjayB0ZXh0LWxnIHNoYWRvdy14bCB0cmFuc2l0aW9uLWFsbFwiPuyduOymne2VmOq4sDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG5cbiAgICAgIHtzaG93VG9hc3QgJiYgKFxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiAnZml4ZWQnLCBib3R0b206ICc0MHB4JywgbGVmdDogJzUwJScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoLTUwJSknLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuODUpJywgY29sb3I6ICd3aGl0ZScsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBib3JkZXJSYWRpdXM6ICc1MHB4JywgekluZGV4OiAxMDAwMCwgZm9udFNpemU6ICcwLjk1cmVtJywgZm9udFdlaWdodDogJzUwMCcsIGJveFNoYWRvdzogJzAgOHB4IDMycHggcmdiYSgwLDAsMCwwLjMpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKScsIGJhY2tkcm9wRmlsdGVyOiAnYmx1cig4cHgpJywgYW5pbWF0aW9uOiAnZmFkZUluT3V0IDIuNXMgZWFzZS1pbi1vdXQgZm9yd2FyZHMnLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cbiAgICAgICAgICB7dG9hc3R9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAgPHN0eWxlPntgXG4gICAgICAgIEBrZXlmcmFtZXMgZmFkZUluT3V0IHtcbiAgICAgICAgICAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDIwcHgpOyB9XG4gICAgICAgICAgMTUlIHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgMCk7IH1cbiAgICAgICAgICA4NSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTsgfVxuICAgICAgICAgIDEwMCUgeyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtMTBweCk7IH1cbiAgICAgICAgfVxuICAgICAgYH08L3N0eWxlPlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iXX0=