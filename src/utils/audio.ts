
export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting audio playback...');
      // Create audio blob from base64
      const byteCharacters = atob(base64Audio);
      console.log('Decoded base64 string');

      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      console.log('Created byte array');
      
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      console.log('Created audio URL:', audioUrl);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        console.log('Audio playback completed');
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.oncanplay = () => {
        console.log('Audio is ready to play');
      };

      // Start playing the audio
      console.log('Attempting to play audio...');
      audio.play().catch((error) => {
        console.error('Audio play error:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });
    } catch (error) {
      console.error('Audio setup error:', error);
      reject(error);
    }
  });
};
