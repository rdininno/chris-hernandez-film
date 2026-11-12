export function preloadImages(urls, onProgress) {
  if (urls.length === 0) {
    onProgress(1);
    return Promise.resolve();
  }

  let loaded = 0;

  const tasks = urls.map(
    (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded += 1;
          onProgress(loaded / urls.length);
          resolve();
        };
        img.src = url;
      }),
  );

  return Promise.all(tasks);
}
