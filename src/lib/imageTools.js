// Procesamiento de fotos 100% en el dispositivo (no se sube nada a ningún servidor)

const loadBitmap = async (blob) => {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    // Navegadores viejos: usar <img>, que ya respeta la orientación EXIF
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

const canvasToBlob = (canvas, quality) =>
  new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));

// Achica la foto original (12 MP del celular) a máx. 1600 px para guardar en el borrador
export const prepareSourcePhoto = async (file, maxSide = 1600) => {
  const bmp = await loadBitmap(file);
  const w = bmp.width, h = bmp.height;
  const s = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * s);
  canvas.height = Math.round(h * s);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  if (bmp.close) bmp.close();
  return canvasToBlob(canvas, 0.85);
};

// Arma la foto final en marco 4:3: 'contain' (completa, fondo gris) o 'cover' (llena el marco)
export const renderFramedPhoto = async (blob, mode = 'contain', W = 1200, H = 900) => {
  const bmp = await loadBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = 'high';
  const s = mode === 'cover'
    ? Math.max(W / bmp.width, H / bmp.height)
    : Math.min(W / bmp.width, H / bmp.height);
  const dw = bmp.width * s, dh = bmp.height * s;
  ctx.drawImage(bmp, (W - dw) / 2, (H - dh) / 2, dw, dh);
  if (bmp.close) bmp.close();
  return canvas.toDataURL('image/jpeg', 0.8);
};

export const blobToDataURL = (blob) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(blob);
});
