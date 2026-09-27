# Jak powstała ta prezentacja (metoda)

Prezentacja została zbudowana 27.09.2026 ze **stanu repo zespołu** `Endote/WarsawModelTrainersHackathon`
(gałąź `main`, commit `6d8d52d7`) oraz z lokalnych notatek i kopii wyników z serwera L40S (`003B-hackaton/`,
`l40s-results/`). Zrobił to Claude Code (model orkiestrujący: Claude Fable 5.1) z użyciem subagentów **Sonnet**
(czytanie i weryfikacja) i **Opus** (pisanie i redakcja). Poniżej dokładny przebieg; skrypty i wszystkie
pośrednie wyniki są w tym katalogu, więc każdą liczbę na slajdzie da się prześledzić do pliku lub commita.

## Zasady, które obowiązywały wszystkich agentów

- **Tylko odczyt** repo zespołu: żadnych zmian stanu git (`checkout`, `pull` przez agentów), żadnego ssh na serwery,
  żadnych wywołań API. Pull repo zespołu robił tylko orkiestrator na prośbę użytkownika.
- **Każdy fakt ma źródło**: ścieżka pliku (z numerem linii, gdzie to możliwe) albo hash commita. Daty bezwzględne,
  liczby dokładnie tak, jak w źródle; przy rozbieżnościach zapisane są obie wersje i która jest nowsza.
- **Rozróżnienie zrobione / w toku / planowane / nieudane** — bez upiększania.
- Ludzie tylko po nazwach autorów z historii git (JulianVolodia, endote, Pawel Cyrta, Szymon Hajderek,
  Olaf Serafin, hiderr); **żadnych adresów e-mail** ani sekretów (dwa adresy, które wkradły się do arkuszy,
  usunięto przed publikacją).
- Wyniki oceniane przez modele (Claude, DeepSeek, Gemma) są oznaczane jako takie — nie ma oficjalnego klucza CKE
  do części pakietów.

## Etap 1 — fakty (workflow `01-hackathon-facts.js`, 10 czytelników Sonnet + krytyk)

1. Orkiestrator sam zrobił „mapę” repo: `git log` (135 commitów na `main`, 7 autorów, 25.09 21:14 → 27.09),
   gałęzie, nagłówki dokumentów, wielkości katalogów.
2. Podzielił repo na **10 obszarów** i dla każdego uruchomił równolegle jednego subagenta **Sonnet**
   (skrypt: `workflows/01-hackathon-facts.js`), który czytał tylko swój obszar i pisał arkusz faktów
   w stałym formacie (Podsumowanie, Oś czasu, Kluczowe liczby, Komponenty, Decyzje i incydenty, Ludzie,
   Otwarte problemy, Cytaty, Źródła). Obszary: historia git i zespół, dane egzaminacyjne i ekstrakcja,
   benchmark, harness/serwer zgłoszeniowy/usługi, LoRA Gemma na L40S (2 części), dane syntetyczne,
   pozostałe pipeline'y treningowe zespołu, ocenianie i ewaluacja, praca z agentami.
3. Osobny czytelnik Sonnet opracował **notatki zespołu** (`sources/notes_*.md`, `note_*.md`) i commity
   z ostatniego pulla (`facts/notes-and-latest-pull.md`). Tytuł artykułu z arXiv orkiestrator sprawdził
   bezpośrednio na arxiv.org (`facts/arxiv-check.md`).
4. **Krytyk pokrycia** (Sonnet) przeczytał wszystkie arkusze i porównał z listą commitów i katalogów:
   czego żaden arkusz nie opisał i gdzie arkusze sobie przeczą; luki dostały dodatkowych czytelników
   (`facts/gaps-*.md`, jeśli są).

Wynik: `facts/*.md` — ok. 3 300 linii faktów ze źródłami.

## Etap 2 — pierwsza wersja slajdów (1 pisarz Opus)

Jeden subagent **Opus** dostał wszystkie arkusze i notatki zespołu oraz twarde ograniczenia: **maksymalnie
2 minuty** mówienia (9–10 slajdów głównych, skrypt w notatkach prelegenta ≤ 270 słów), jedna myśl na slajd,
szczegóły do aneksu, **każda liczba z komentarzem HTML wskazującym źródło** (widoczne w `index.md`).
Ta wersja trafiła na stronę od razu, żeby była do obejrzenia.

## Etap 3 — weryfikacja i poprawki (workflow `02-verify-revise.js`)

- Fact-checkerzy **Sonnet**: deck podzielony na części, każda liczba i twierdzenie sprawdzone przeciwko repo
  (nastawienie: „obal to”), raporty w `review/`.
- Redaktor **Opus** nanosi poprawki; krytycy **Opus** oceniają kompletność (czy nie pominięto ważnego wątku),
  czas (czy skrypt mieści się w 2 minutach) i język.
- Orkiestrator buduje stronę lokalnie tym samym poleceniem co GitHub Actions i pushuje.

Szczegóły tego etapu (liczba agentów, ile poprawek) — patrz `review/README.md` po jego zakończeniu.

## Zawartość katalogu

| Ścieżka | Co |
|---|---|
| `workflows/*.js` | skrypty workflow (Claude Code `Workflow`), dokładnie te, które uruchomiono |
| `facts/*.md` | arkusze faktów ze źródłami, po jednym na obszar |
| `sources/` | kopie notatek zespołu z repo (autorzy wg git) |
| `review/` | raporty fact-checkerów i krytyków |

## Jak to odtworzyć

W Claude Code (tryb `ultracode`, narzędzie `Workflow`) uruchomić skrypty z `workflows/` po kolei, podając
ścieżki do repo zespołu i katalogu na arkusze; wynik pisarza (`index.md`) zbudować przez `bundle exec jekyll build`.
