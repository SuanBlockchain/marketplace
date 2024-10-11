export default function textToHex(text: string) {
  const buffer = Buffer.from(text, 'utf-8');
  
  const hex = buffer.toString('hex');
  
  return hex;
}
