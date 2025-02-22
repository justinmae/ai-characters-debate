
export const playAudioFromBase64 = (base64Audio: string) => {
  const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
  return audio.play();
};
