import readline from 'readline';

export function updateTerminalLine(text: string) {
  // Clear the current line
  readline.clearLine(process.stdout, 0);
  // Move the cursor to the beginning of the line
  readline.cursorTo(process.stdout, 0);
  // Write the new text
  process.stdout.write(text);
}
