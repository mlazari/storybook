import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { dedent } from 'ts-dedent';

const ignoreList = [
  (error: any) => error.message.includes('":nth-child" is potentially unsafe'),
  (error: any) => error.message.includes('":first-child" is potentially unsafe'),
  (error: any) => error.message.match(/Browserslist: .* is outdated. Please run:/),
  (error: any) =>
    error.message.includes('react-async-component-lifecycle-hooks') &&
    error.stack.includes('addons/knobs/src/components/__tests__/Options.js'),
];

const throwMessage = (type: any, message: any) => {
  // eslint-disable-next-line local-rules/no-uncategorized-errors
  const error = new Error(`${type}${message}`);
  if (!ignoreList.reduce((acc, item) => acc || item(error), false)) {
    throw error;
  }
};
const throwWarning = (message: any) => throwMessage('warn: ', message);
const throwError = (message: any) => throwMessage('error: ', message);

vi.spyOn(console, 'warn').mockImplementation(throwWarning);
vi.spyOn(console, 'error').mockImplementation(throwError);

expect.extend({
  toMatchPaths(regex: RegExp, paths: string[]) {
    const matched = paths.map((p) => !!p.match(regex));

    const pass = matched.every(Boolean);
    const failures = paths.filter((_, i) => (pass ? matched[i] : !matched[i]));
    const message = () => dedent`Expected ${regex} to ${pass ? 'not ' : ''}match all strings.
    
    Failures:${['', ...failures].join('\n - ')}`;
    return {
      pass,
      message,
    };
  },
});
