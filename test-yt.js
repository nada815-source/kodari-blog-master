import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript('https://youtu.be/Dc0RNHvU3HA?si=et6PLLMqobBDdjrD');
    console.log(transcript.slice(0, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
