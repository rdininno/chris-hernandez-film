export function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

export function loadFont(spec) {
  return document.fonts.load(spec).catch(() => {});
}

export function track(tasks, onProgress) {
  if (tasks.length === 0) {
    onProgress(1);
    return Promise.resolve();
  }

  let done = 0;

  return Promise.all(
    tasks.map((task) =>
      task.then(() => {
        done += 1;
        onProgress(done / tasks.length);
      }),
    ),
  );
}
