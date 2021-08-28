export type Nullable<T> = T | null;

export const safetyGetElementById = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }
  return element;
};

export const display = (
  text?: string,
  option?: {
    strict?: boolean;
    alternative?: string;
  }
): string => {
  if (option?.strict) {
    // Show alternative text if text is null or undefined or N/A
    return text ?? option?.alternative ?? "-";
  } else {
    // Show alternative text if text is null or undefined or N/A or '' or 0
    return text || (option?.alternative ?? "-");
  }
};
