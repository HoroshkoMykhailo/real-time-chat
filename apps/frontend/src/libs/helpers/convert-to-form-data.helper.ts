const convertToFormData = <T extends Record<string, unknown>>(
  payload: T
): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      if (value instanceof Blob || value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          formData.append(`${key}[${index}]`, item as Blob | string);
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
