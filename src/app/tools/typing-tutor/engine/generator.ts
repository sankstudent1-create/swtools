// Mock Generator for SSC CGL and typing lessons
export const HOME_ROW_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
export const TOP_ROW_KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
export const BOTTOM_ROW_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
export const NUMBER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

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
