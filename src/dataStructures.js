export class Node {
  constructor(letter) {
    this.letter = letter;
    this.children = {};
    this.terminal = false;
  }
}
