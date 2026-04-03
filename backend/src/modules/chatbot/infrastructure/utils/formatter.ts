export const markdownToWhatsappText = (markdown: string): string => {
    let whatsappText = markdown.replace(/\n/g, '\n');
    return whatsappText
    .replace(/\*\*(.*?)\*\*/g, '*$1*')      // **bold** → *bold*
    .replace(/__(.*?)__/g, '_$1_')           // __italic__ → _italic_
    .replace(/`(.*?)`/g, '```$1```')         // `code` → ```code```
    .replace(/#{1,6} (.*)/g, '*$1*')         // # Título → *Título*
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1: $2') // links
    .trim();
}
