import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../scraper/index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Bucharest'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Bucharest']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'lateralgroup.com',
        company: 'lateral srl',
        cif: '23067611',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'lateral group', cif: '23067611' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('LATERAL SRL');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://careers.lateralgroup.com/jobs/123',
        title: 'Senior Developer',
        location: ['Bucharest'],
        tags: ['Java', 'Spring'],
        workmode: 'hybrid'
      };

      const COMPANY_NAME = 'LATERAL SRL';
      const COMPANY_CIF = '23067611';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.tags).toEqual(rawJob.tags);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should remove undefined fields', () => {
      const rawJob = {
        url: 'https://test.com/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '23067611');

      expect(result.location).toBeUndefined();
      expect(result.tags).toBeUndefined();
      expect(result.workmode).toBeUndefined();
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://test.com/1' };

      const result = index.mapToJobModel(rawJob, '23067611');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://test.com/1');
    });
  });

  describe('parseRSSJobs', () => {
    const rssFixture = (items) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Lateral Group Careers</title>
${items}
</channel>
</rss>`;

    it('should parse a Teamtailor-style RSS item with Romanian location', () => {
      const xml = rssFixture(`
<item>
<title>Senior Backend Developer</title>
<link>https://careers.lateralgroup.com/jobs/senior-backend-developer</link>
<guid>abc123</guid>
<department>Engineering</department>
<remoteStatus>hybrid</remoteStatus>
<location><city>Bucharest</city><country>Romania</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Senior Backend Developer');
      expect(result[0].uid).toBe('abc123');
      expect(result[0].url).toBe('https://careers.lateralgroup.com/jobs/senior-backend-developer');
      expect(result[0].workmode).toBe('hybrid');
      expect(result[0].location).toEqual(['Bucharest']);
      expect(result[0].tags).toEqual(['engineering']);
    });

    it('should skip items with no Romanian location', () => {
      const xml = rssFixture(`
<item>
<title>Remote Developer</title>
<link>https://careers.lateralgroup.com/jobs/remote-dev</link>
<guid>xyz789</guid>
<location><city>Warsaw</city><country>Poland</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result).toHaveLength(0);
    });

    it('should skip items missing title or guid', () => {
      const xml = rssFixture(`
<item>
<link>https://careers.lateralgroup.com/jobs/no-title</link>
<guid>missing-title</guid>
<location><city>Bucharest</city><country>Romania</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result).toHaveLength(0);
    });

    it('should map remoteStatus to workmode correctly', () => {
      const xml = rssFixture(`
<item>
<title>Fully Remote Role</title>
<link>https://careers.lateralgroup.com/jobs/remote-role</link>
<guid>rem001</guid>
<remoteStatus>fully</remoteStatus>
<location><city>Cluj-Napoca</city><country>Romania</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result[0].workmode).toBe('remote');
    });

    it('should default to on-site when remoteStatus is absent', () => {
      const xml = rssFixture(`
<item>
<title>Office Role</title>
<link>https://careers.lateralgroup.com/jobs/office-role</link>
<guid>off001</guid>
<location><city>București</city><country>Romania</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result[0].workmode).toBe('on-site');
    });

    it('should handle empty feed', () => {
      const xml = rssFixture('');

      const result = index.parseRSSJobs(xml);

      expect(result).toEqual([]);
    });

    it('should handle malformed XML gracefully', () => {
      const result = index.parseRSSJobs('not xml at all');

      expect(result).toEqual([]);
    });

    it('should fall back to a generated URL when link is missing', () => {
      const xml = rssFixture(`
<item>
<title>No Link Job</title>
<guid>nolink001</guid>
<location><city>Iași</city><country>Romania</country></location>
</item>`);

      const result = index.parseRSSJobs(xml);

      expect(result[0].url).toBe('https://careers.lateralgroup.com/jobs/nolink001');
    });
  });
});
