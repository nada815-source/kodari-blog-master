# ⚓ KODARI BLOG AI V3.6.6 'True-Visual' 항해 기록 (2026-05-07)

## 💎 1. 오늘의 승전 요약
- **목표**: V3.5.9의 비주얼/정찰 엔진 복구 및 V3.6.1 'Compact' 본체와의 완벽한 융합
- **결과**: V3.6.6 'True-Visual' 엔진 탄생 - 강조 무결성, 정찰 선명도, 시스템 안정성 모두 확보

## 🛠️ 2. 주요 기술적 수술 기록 (Phase 1-4)

### Phase 1: 비주얼 엔진 3.3 복구 (V3.6.2)
- **증상**: V3.6.1에서 이미지 생성 프롬프트(Section Prompts) 로직 소실
- **처치**: V3.5.9의 고정밀 프롬프트 생성 지침을 벤치마킹하여 `combinedPrompt`에 이식 성공
- **성과**: 화려한 이미지 묘사와 지침 노출 복구

### Phase 2: 정찰 레이더 무결성 복구 (V3.6.3)
- **증상**: 팩트체크 리포트에서 구글 검색 쿼리가 "분석 중..."으로만 뜨고 노출되지 않음
- **처치**: 복잡한 데이터 경로(`sdkBlob`) 대신 구글 공식 통로인 `renderedContent`를 1순위로 복구
- **성과**: 실시간 정찰 키워드의 완벽한 시각화 성공

### Phase 3: 철벽 파싱(Iron-Parser) 도입 (V3.6.4)
- **증상**: 대용량 생성 시 AI의 '사족(Closing remarks)'으로 인한 JSON 파싱 에러 발생
- **처치**: 정규표현식을 활용하여 `{ }` 블록만 정밀 추출하는 '강철 파싱' 로직 탑재
- **성과**: 어떤 데이터 폭풍 속에서도 흔들림 없는 시스템 안정성 확보

### Phase 4: True-Visual 강조 시스템 완성 (V3.6.5 ~ V3.6.6)
- **증상**: 별표(`**`) 볼드처리가 씹히거나, 형광펜(`==`)이 문장 중간에 끊기는 가독성 저하
- **처치**: 
    1. 강조 지침을 별표 2개(`**`)로 최적화 (V3.6.5)
    2. ReactMarkdown 렌더링 전 전용 HTML 태그(`<strong>`, `<mark>`, `<span>`)로 강제 변환하는 커스텀 렌더러 도입 (V3.6.6)
- **성과**: 시각적 오차 0mm의 완벽한 3중 하이브리드 강조 시스템 구축

## 🚩 3. 박제된 항로 (Vercel Aliases)
- **V3.6.2 (Visual)**: [https://kodari-v362.vercel.app](https://kodari-v362.vercel.app)
- **V3.6.3 (Grounding)**: [https://kodari-v363.vercel.app](https://kodari-v363.vercel.app)
- **V3.6.4 (Iron-Parser)**: [https://kodari-v364.vercel.app](https://kodari-v364.vercel.app)
- **V3.6.5 (Clean-Bold)**: [https://kodari-v365.vercel.app](https://kodari-v365.vercel.app)
- **V3.6.6 (Final True-Visual)**: [https://kodari-v366.vercel.app](https://kodari-v366.vercel.app)

---

**"기록은 힘이고, 백업은 생명이다."**
**코다리 개발부장 배상 🫡🐟**
