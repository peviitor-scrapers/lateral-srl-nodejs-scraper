# Robots.txt Analysis — Lateral Group Careers

Sursa: https://careers.lateralgroup.com/robots.txt

## Reguli

```
User-Agent: aihitdata
Disallow: /

User-Agent: *
Disallow: /app/
Disallow: /messages/
Disallow: /messenger/
Disallow: /facebook/tab/
Disallow: /jobs/internal/
Content-Signal: search=yes, ai-train=no, ai-input=yes

Sitemap: https://careers.lateralgroup.com/sitemap.xml
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/app/`, `/messages/`, `/messenger/`, `/facebook/tab/`, `/jobs/internal/` | ❌ Disallowed | Zone interne / mesagerie, nu sunt atinse de scraper |
| `/jobs.rss` | ✅ Allowed | Feed-ul RSS public de la care scraper-ul extrage datele |
| Paginile individuale de job (`/jobs/...`) | ✅ Allowed | Nu sunt în lista disallow — scraper-ul le verifică accesibilitatea (HEAD) în teste |

## Diferență față de EPAM template

Spre deosebire de EPAM (`Disallow: /` pe tot site-ul, inclusiv API-ul JSON), Lateral Group (platformă Teamtailor) permite explicit indexarea (`Content-Signal: search=yes`) și nu blochează feed-ul RSS sau paginile de job. Scraper-ul citește exclusiv feed-ul RSS public (`/jobs.rss`), care nu apare deloc în lista de directoare disallowed.

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- Feed-ul RSS `/jobs.rss` este public, gândit pentru consum automatizat (RSS = format făcut pentru agregatoare).
- Scraper-ul face o singură cerere HTTP per rulare (fără paginare, fără polling agresiv), cu retry limitat (max 3 încercări, 2s delay).

**Concluzie**: Risc minim. Feed-ul RSS e public și explicit destinat consumului automatizat, iar scraperul e politicos (o singură cerere, User-Agent standard, retry limitat).
