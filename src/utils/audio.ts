
export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        reject(error);
      };

      // Start playing the audio
      audio.play().catch((error) => {
        console.error('Audio play error:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Audio setup error:', error);
      reject(error);
    }
  });
};
