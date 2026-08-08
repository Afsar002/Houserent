export function numberToWords(num: number | null | undefined): string {
  if (num === 0 || num == null) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function inWords(n: number): string {
    const padded = ('000000000' + n.toString()).substr(-9);
    const match = padded.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return '';
    const crore = parseInt(match[1], 10);
    const lakh = parseInt(match[2], 10);
    const thousand = parseInt(match[3], 10);
    const hundred = parseInt(match[4], 10);
    const rest = parseInt(match[5], 10);
    let str = '';
    if (crore !== 0) {
      str += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + ' ' + a[crore % 10]) + 'Crore ';
    }
    if (lakh !== 0) {
      str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10]) + 'Lakh ';
    }
    if (thousand !== 0) {
      str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10]) + 'Thousand ';
    }
    if (hundred !== 0) {
      str += (hundred < 20 ? a[hundred] : b[Math.floor(hundred / 10)] + ' ' + a[hundred % 10]) + 'Hundred ';
    }
    if (rest !== 0) {
      str += (str !== '' ? 'and ' : '') + (rest < 20 ? a[rest] : b[Math.floor(rest / 10)] + ' ' + a[rest % 10]);
    }
    return str;
  }

  // Handle decimal/paise values
  const numStr = Number(num).toFixed(2);
  const [wholeStr, decimalStr] = numStr.split('.');
  const whole = parseInt(wholeStr, 10) || 0;
  const paise = parseInt(decimalStr, 10) || 0;

  let result = '';
  if (whole > 0) {
    result = inWords(whole).trim() + ' Rupees';
  } else {
    result = 'Zero Rupees';
  }

  // Append paise if present
  if (paise > 0) {
    result += ' and ' + inWords(paise).trim() + ' Paise';
  }

  return result + ' Only';
}

// Compress/resize uploaded images to avoid huge data URLs
export function compressImage(dataUrl: string, maxWidth = 300, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function formatDateForInput(d: Date): string {
  return d.toISOString().split('T')[0];
}