# Warsaw Model Trainers Hackathon 2026 — zespół 100d2exam, historia rozszerzona

Prezentacja o wszystkim, co działo się w repo zespołu
[`Endote/WarsawModelTrainersHackathon`](https://github.com/Endote/WarsawModelTrainersHackathon)
podczas Warsaw Model Trainers Hackathon (25–27.09.2026): dane egzaminacyjne, benchmark, harness, trening LoRA,
dane syntetyczne, serwer zgłoszeniowy.

- **Strona (GitHub Pages):** https://julianvolodia.github.io/WarsawModelTrainersHackathon-100d2examhistory-presentation/
  - slajdy (reveal.js): strzałki / spacja, `S` = notatki prelegenta, `?print-pdf` w adresie = wersja do PDF,
  - `?doc=1` w adresie = ta sama treść jako zwykły dokument do czytania.
- **Źródło slajdów:** `index.md` — czysty Markdown, slajd = fragment między liniami `---`.
- **Jak to powstało:** `build/` (metoda, skrypty workflow agentów, arkusze faktów ze źródłami, kopie notatek zespołu).

## Uruchomienie lokalne

```bash
bundle install
bundle exec jekyll serve      # http://127.0.0.1:4000/WarsawModelTrainersHackathon-100d2examhistory-presentation/
```

Publikacja: każdy push na `main` uruchamia `.github/workflows/pages.yml` (Jekyll 4.4 → GitHub Pages przez Actions).
