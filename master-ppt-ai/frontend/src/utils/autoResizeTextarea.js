/**
 * Auto-resize textarea height to fit content without scrollbars
 * @param {HTMLTextAreaElement} element 
 */
export function autoResizeTextarea(element) {
  if (!element) return;
  // Reset height to auto to compute the proper scrollHeight
  element.style.height = 'auto';
  // Set height to scrollHeight
  element.style.height = `${element.scrollHeight}px`;
}
