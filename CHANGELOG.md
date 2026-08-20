# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-20

### Added
- Initial derivation from the [EPAM template](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper) for Lateral Group (LATERAL SRL, CIF 23067611)
- RSS-based job scraping from `careers.lateralgroup.com/jobs.rss`, replacing the template's paginated JSON API scraper
- ANAF company validation, Peviitor API cross-validation, ANOFM supplementary job search
- `docs/jobs.md` auto-generated documentation for GitHub Pages
- Full test suite (unit, integration, e2e, consistency) adapted for the RSS scraping method
