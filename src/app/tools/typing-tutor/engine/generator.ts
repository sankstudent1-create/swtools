export const HOME_ROW_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
export const TOP_ROW_KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
export const BOTTOM_ROW_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
export const NUMBER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export const TUTOR_LEVELS = [
  { id: 'home-1', name: 'Home Row: Basic', keys: ['f', 'j', 'd', 'k'], description: 'Index and middle fingers of both hands.' },
  { id: 'home-2', name: 'Home Row: Complete', keys: ['a', 's', 'l', ';', 'g', 'h'], description: 'All home row keys including pinky and center keys.' },
  { id: 'top-1', name: 'Top Row: Index/Middle', keys: ['r', 'u', 'e', 'i'], description: 'Moving upwards from home row.' },
  { id: 'top-2', name: 'Top Row: Complete', keys: ['q', 'w', 't', 'y', 'o', 'p'], description: 'All top row keys.' },
  { id: 'bottom-1', name: 'Bottom Row: Index/Middle', keys: ['v', 'n', 'c', 'm'], description: 'Moving downwards from home row.' },
  { id: 'bottom-2', name: 'Bottom Row: Complete', keys: ['z', 'x', 'b', ',', '.', '/'], description: 'All bottom row keys.' },
  { id: 'numbers-1', name: 'Numbers: Basic', keys: ['4', '7', '3', '8'], description: 'Introduction to the number row.' },
  { id: 'numbers-2', name: 'Numbers: Complete', keys: ['1', '2', '5', '6', '9', '0'], description: 'Full numeric row practice.' },
  { id: 'symbols', name: 'Common Symbols', keys: ['!', '@', '#', '$', '%', '&', '*', '(', ')'], description: 'Shift-key combinations.' },
  { id: 'sentences-easy', name: 'Easy Sentences', type: 'sentence', description: 'Simple words and phrases.' },
  { id: 'sentences-hard', name: 'Advanced Paragraphs', type: 'paragraph', description: 'Complex vocabulary and punctuation.' }
];

export function generateTutorLesson(levelId: string, length: number = 100): string {
  const level = TUTOR_LEVELS.find(l => l.id === levelId);
  if (!level) return generateKeyCombinations(['home'], length);

  if (level.type === 'sentence') {
    return SSC_MOCK_PARAGRAPHS[Math.floor(Math.random() * SSC_MOCK_PARAGRAPHS.length)].substring(0, length);
  }

  if (level.type === 'paragraph') {
    return generateSSCCGLPassage(length);
  }

  let result = '';
  const pool = level.keys || HOME_ROW_KEYS;
  for (let i = 0; i < length / 4; i++) {
    const k1 = pool[Math.floor(Math.random() * pool.length)];
    const k2 = pool[Math.floor(Math.random() * pool.length)];
    const k3 = pool[Math.floor(Math.random() * pool.length)];
    result += `${k1}${k2}${k3} `;
  }
  return result.trim().substring(0, length);
}

// Generates an isolated character sequence for given rows
export function generateKeyCombinations(rows: ('home' | 'top' | 'bottom' | 'numbers')[], length: number = 100): string {
  let validKeys: string[] = [];
  if (rows.includes('home')) validKeys.push(...HOME_ROW_KEYS);
  if (rows.includes('top')) validKeys.push(...TOP_ROW_KEYS);
  if (rows.includes('bottom')) validKeys.push(...BOTTOM_ROW_KEYS);
  if (rows.includes('numbers')) validKeys.push(...NUMBER_KEYS);

  if (validKeys.length === 0) validKeys = HOME_ROW_KEYS;

  let result = '';
  // Generate random combinations like "ffd", "jkj" etc to simulate learning
  for (let i = 0; i < length / 4; i++) {
    const k1 = validKeys[Math.floor(Math.random() * validKeys.length)];
    const k2 = validKeys[Math.floor(Math.random() * validKeys.length)];
    const k3 = validKeys[Math.floor(Math.random() * validKeys.length)];
    result += `${k1}${k2}${k3} `;
  }
  return result.trim().substring(0, length);
}

const SSC_MOCK_PARAGRAPHS = [
  "The examination system is a fundamental part of the recruitment process for government services. It tests not only the knowledge but also the speed and accuracy of the candidates under pressure.",
  "Computer proficiency is essential for modern administrative roles. A candidate must demonstrate exceptional capability in data entry, typing speed, and flawless transcription of official documents.",
  "Economic policies dictate the progression of a nation. They define the fiscal responsibility of the governing bodies and ensure that revenue is distributed equitably across all developing sector programs.",
  "Environmental protection laws have become increasingly stringent over the past decade. It is mandatory for corporations and individuals alike to adhere to proper waste management and carbon footprint reduction protocols.",
  "Public administration requires meticulous attention to detail and a high degree of transparency. Officials are expected to manage public resources with efficiency and accountability to foster trust in governance.",
  "Technological advancements are reshaping the landscape of global industry. Innovation in artificial intelligence and automation is creating new opportunities while demanding a highly skilled workforce.",
  "Constitutional provisions safeguard the rights of every citizen in a democracy. It is the responsibility of the judiciary to interpret these laws and ensure that justice is accessible to all individuals.",
  "International trade agreements play a pivotal role in the global economy. By reducing tariffs and fostering cooperation, these treaties enable nations to exchange goods and services more effectively.",
  "Education is the cornerstone of a progressive society. Investing in quality learning and skill development is vital for empowering the next generation to tackle future challenges and drive growth.",
  "Healthcare accessibility remains a critical challenge for many developing nations. Strengthening infrastructure and ensuring the availability of essential medicines are key priorities for global health organizations."
];

// Generates a mock passage that resembles the standard SSC CGL exam texts (~1500 to 2000 keystrokes)
export function generateSSCCGLPassage(targetLength: number = 2000): string {
  let passage = "";
  while (passage.length < targetLength) {
    const p = SSC_MOCK_PARAGRAPHS[Math.floor(Math.random() * SSC_MOCK_PARAGRAPHS.length)];
    passage += p + " ";
  }
  return passage.substring(0, targetLength).trim();
}

/**
 * Generates specifically targeted words/combinations based on heavily missed keys.
 */
export function generateShortfallPractice(weakKeys: string[], length: number = 150): string {
  if (!weakKeys || weakKeys.length === 0) return generateKeyCombinations(['home'], length);
  
  // Combine weak keys with some anchor keys from home row
  const anchors = ['a', 'e', 't', 's', 'n']; // common english letters
  const pool = [...weakKeys, ...weakKeys, ...weakKeys, ...anchors]; // weight weak keys heavier

  let result = '';
  for(let i=0; i< length/4; i++) {
    const k1 = pool[Math.floor(Math.random() * pool.length)];
    const k2 = pool[Math.floor(Math.random() * pool.length)];
    const k3 = weakKeys[Math.floor(Math.random() * weakKeys.length)]; // force a weak key
    result += `${k1}${k2}${k3} `;
  }
  return result.trim().substring(0, length);
}
