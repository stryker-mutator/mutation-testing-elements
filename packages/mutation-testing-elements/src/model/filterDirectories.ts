function filterDirectories(previousDirectories: string[], currentDirectories: string[]) {
  for (let i = 0; i < previousDirectories.length; i++) {
    if (previousDirectories[i] !== currentDirectories[i]) {
      return previousDirectories.splice(0, i);
    }
  }
  return previousDirectories;
}
