import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Juice Shop E2E',
  output: 'allure-report',
  // Persisted (and cached in CI) so the report keeps its trend and flaky
  // history across runs.
  historyPath: 'allure-history/history.jsonl',
  plugins: {
    awesome: {
      options: {
        reportName: 'Juice Shop E2E',
        groupBy: ['epic', 'category'],
      },
    },
  },
});
