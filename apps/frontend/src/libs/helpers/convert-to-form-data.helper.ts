const convertToFormData = <T extends Record<string, unknown>>(
  payload: T
): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      if (value instanceof Blob || value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          formData.append(key, item as Blob | string);
        }
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        formData.append(key, value.toString());
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }
  }

  return formData;
};

export { convertToFormData };
