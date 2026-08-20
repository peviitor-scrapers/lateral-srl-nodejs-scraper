# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile Lateral Group din România.

Extrage anunțurile din [Lateral Group Careers](https://careers.lateralgroup.com) (feed RSS) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul Peviitor.

> **🌱 Scraper derivat.** Acest repo a fost derivat din [templateul EPAM](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper), implementarea de referință pentru scraper-ele Node.js din ecosistemul peviitor.ro.

## Identificare

Toate request-urile HTTP folosesc User-Agent-ul:

```
job_seeker_ro_spider
```

## Ce face

1. **Validează compania** — interoghează API-ul public ANAF ([demoanaf.ro](https://demoanaf.ro)) după CIF-ul Lateral (23067611) și verifică:
   - Denumirea oficială: LATERAL SRL
   - Status: activ/inactiv/radiat
   - Adresa completă din registrul comerțului
2. **Cross-validează cu Peviitor** — verifică existența companiei în API-ul Peviitor
3. **Scrape-uiește job-urile** — extrage feed-ul RSS public de la Lateral Group Careers, filtrat pe România
4. **Transformă datele** — normalizează locațiile (doar orașe românești), tag-urile (lowercase), workmode-ul (remote/on-site/hybrid)
5. **Stochează în Peviitor** — upsert prin API-ul Peviitor (job-uri și date companie)
6. **Generează jobs.md** — fișier markdown cu informații companie + toate job-urile curente

## API-uri folosite

| API | URL | Autentificare |
|---|---|---|
| Lateral Group Careers RSS | `https://careers.lateralgroup.com/jobs.rss` | Public |
| ANAF (demoanaf) | `https://demoanaf.ro/api/...` | Public |
| Peviitor | `https://api.peviitor.ro/v1/company/` | Public |

## Robots.txt

Lateral Group Careers [robots.txt](https://careers.lateralgroup.com/robots.txt) permite explicit indexarea (`Content-Signal: search=yes`) și nu blochează feed-ul RSS (`/jobs.rss`) sau paginile individuale de job. Zonele restricționate (`/app/`, `/messages/`, `/messenger/`, `/facebook/tab/`, `/jobs/internal/`) nu sunt atinse de scraper.

Scraper-ul face o singură cerere HTTP la feed-ul RSS per rulare, cu retry limitat (max 3 încercări, 2s delay), și un singur User-Agent identificabil.

Pentru analiza completă, vezi [ai/ROBOTS.md](../ai/ROBOTS.md).

## Testare

```bash
# Toate testele
npm test

# Doar unitare
npm run test:unit

# Doar integrare (necesită ANAF live, Peviitor API conditional)
npm run test:integration

# Doar E2E (feed RSS real + ANAF + Peviitor)
npm run test:e2e
```

Testele Peviitor API folosesc `itIfApi` — se auto-skip dacă API-ul Peviitor nu e disponibil.
