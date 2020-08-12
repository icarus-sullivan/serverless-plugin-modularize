import path from 'path';
import { resolve } from '../src/utils/fs';

const fileTests = [
  {
    label: 'loads js file',
    filename: './samples/example.js',
  },
  {
    label: 'loads json file',
    filename: './samples/example.json',
  },
  {
    label: 'loads yml file',
    filename: './samples/example.yml',
  },
  {
    label: 'loads yaml file',
    filename: './samples/example.yaml',
  },
];

describe('utils/fs', () => {
  fileTests.forEach(({ label, filename }) => {
    it(label, () => {
      expect(resolve(path.resolve(__dirname, filename))).toMatchSnapshot();
    });
  });

  it('throws invalid file', () => {
    const load = () => resolve(path.resolve(__dirname, './sample/example.txt'));
    expect(load).toThrow();
  });
});
