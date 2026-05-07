import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  // CORS 처리 (필요시)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: '유튜브 URL이 필요합니다.' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map(t => t.text).join(' ');
    
    // 텍스트가 너무 길면 자름 (약 15000자, Gemini 처리 한도 고려)
    const truncatedText = text.length > 15000 ? text.substring(0, 15000) + '... (이하 생략)' : text;

    res.status(200).json({ text: truncatedText });
  } catch (error) {
    console.error('Transcript fetch error:', error);
    res.status(500).json({ error: '자막 추출 실패: ' + error.message });
  }
}
