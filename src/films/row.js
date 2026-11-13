import "./row.css";

export function createFilmRow(root, films) {
  const track = document.createElement("ul");
  track.className = "films__track";

  const cards = films.map((film, i) => {
    const card = document.createElement("li");
    card.className = "film-card";
    card.dataset.slug = film.slug;

    const frame = document.createElement("div");
    frame.className = "film-card__frame";

    const image = document.createElement("img");
    image.className = "film-card__image";
    image.loading = i < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.alt = `Still from ${film.title}`;
    image.src = film.image;

    frame.append(image);
    card.append(frame);
    return card;
  });

  track.append(...cards);
  root.append(track);

  return { root, track, cards };
}
