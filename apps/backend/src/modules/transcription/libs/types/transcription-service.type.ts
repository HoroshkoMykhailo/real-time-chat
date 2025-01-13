type TranscriptionService = {
  transcribe: (audioFilePath: string) => Promise<string>;
};

export { type TranscriptionService };
