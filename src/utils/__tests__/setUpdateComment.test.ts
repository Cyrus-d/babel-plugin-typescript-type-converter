import * as fs from 'fs';
import { setUpdateComment } from '../setUpdateComment';

jest.mock('fs');

describe('setUpdateComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add update comment to the line if found', () => {
    const filePath = 'testFile.js';
    const timestamp = 1624351200000;

    const mockReadFileSync = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(
        `transformTypeToKeys\nconsole.log("Hello, world!");\ntransformTypeToPropTypes`,
      );

    const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();

    setUpdateComment(filePath, timestamp);

    expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(mockWriteFileSync).toHaveBeenCalled();

    const updatedContent = mockWriteFileSync.mock.calls[0][1] as string;
    const updatedLines = updatedContent.split('\n');

    expect(updatedLines[0]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[1]).toBe('transformTypeToKeys');
    expect(updatedLines[2]).toBe('console.log("Hello, world!");');
    expect(updatedLines[3]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[4]).toBe('transformTypeToPropTypes');

    jest.unmock('fs');
  });

  it('should replace existing comment and timestamp if found', () => {
    const filePath = 'testFile.js';
    const timestamp = 1624351200000;

    const mockReadFileSync = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(
        `// typescript-type-transformer:update=123456\ntransformTypeToKeys\nconsole.log("Hello, world!");\ntransformTypeToPropTypes`,
      );

    const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();

    setUpdateComment(filePath, timestamp);

    expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf8');

    const updatedContent = mockWriteFileSync.mock.calls[0][1] as string;
    const updatedLines = updatedContent.split('\n');

    expect(updatedLines[0]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[1]).toBe('transformTypeToKeys');
    expect(updatedLines[2]).toBe('console.log("Hello, world!");');
    expect(updatedLines[3]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[4]).toBe('transformTypeToPropTypes');

    jest.unmock('fs');
  });

  it('should remove lines following existing comment and timestamp', () => {
    const filePath = 'testFile.js';
    const timestamp = 1624351200000;

    const mockReadFileSync = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(
        `transformTypeToKeys\n// typescript-type-transformer:update=123456\nconsole.log("Hello, world!");\ntransformTypeToPropTypes`,
      );

    const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();

    setUpdateComment(filePath, timestamp);

    expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf8');

    const updatedContent = mockWriteFileSync.mock.calls[0][1] as string;
    const updatedLines = updatedContent.split('\n');

    expect(updatedLines[0]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[1]).toBe('transformTypeToKeys');
    expect(updatedLines[2]).toBe('console.log("Hello, world!");');
    expect(updatedLines[3]).toBe(`// typescript-type-transformer:update=${timestamp}`);
    expect(updatedLines[4]).toBe('transformTypeToPropTypes');

    jest.unmock('fs');
  });
});
