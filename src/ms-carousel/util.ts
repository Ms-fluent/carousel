export function isChild(parent: HTMLElement, element: HTMLElement): boolean {
  let node = element.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
