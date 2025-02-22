
export const playAudioFromBase64 = (base64Audio: string, onProgress?: (progress: number) => void): Promise<void> => {
  let audioElement: HTMLAudioElement | null = null;

  const promise = new Promise<void>((resolve, reject) => {
    try {
      if (!base64Audio) {
        console.error('Invalid base64 audio data received');
        reject(new Error('Invalid audio data'));
        return;
      }

      console.log('Starting audio playback process...');
      
      // Create audio blob from base64
      const byteCharacters = atob(base64Audio);
      console.log('Decoded base64 string, length:', byteCharacters.length);

      // Handle empty audio data
      if (byteCharacters.length === 0) {
        console.error('Decoded audio data is empty');
        reject(new Error('Empty audio data'));
        return;
      }

      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      console.log('Created byte array, size:', byteArray.length);
      
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      console.log('Created audio blob, size:', blob.size);
      
      if (blob.size === 0) {
        console.error('Created blob is empty');
        reject(new Error('Empty audio blob'));
        return;
      }
      
      const audioUrl = URL.createObjectURL(blob);
      console.log('Created audio URL:', audioUrl);
      
      const audio = new Audio();
      audioElement = audio;
      
      // Set up event listeners before setting the source
      audio.oncanplay = () => {
        console.log('Audio is ready to play');
      };
      
      audio.onended = () => {
        console.log('Audio playback completed successfully');
        URL.revokeObjectURL(audioUrl);
        audioElement = null;
        resolve();
      };
      
      audio.onerror = (event) => {
        if (event instanceof Event && event.target instanceof HTMLAudioElement) {
          console.error('Audio playback error:', event.target.error);
          URL.revokeObjectURL(audioUrl);
          reject(new Error(`Audio playback failed: ${event.target.error?.message || 'Unknown error'}`));
        } else {
          // Handle case where error is a string or other type
          console.error('Audio playback error:', event);
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed: Unknown error'));
        }
      };

      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
      };

      // Add timeupdate event for progress tracking
      if (onProgress) {
        audio.ontimeupdate = () => {
          const progress = (audio.currentTime / audio.duration) * 100;
          onProgress(progress);
        };
      }

      // Set the source and load the audio
      audio.src = audioUrl;
      console.log('Set audio source, attempting to play...');
      
      // Attempt to play
      audio.play().catch((error) => {
        console.error('Failed to start audio playback:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });
      
    } catch (error) {
      console.error('Audio setup error:', error);
      reject(error);
    }
  });

  return promise;
};

export const stopAudio = (fadeOutDuration: number = 500): Promise<void> => {
  return new Promise((resolve) => {
    const audioElements = document.getElementsByTagName('audio');
    let completedCount = 0;
    const totalElements = audioElements.length;

    if (totalElements === 0) {
      resolve();
      return;
    }

    Array.from(audioElements).forEach((audio) => {
      const originalVolume = audio.volume;
      let startTime = performance.now();
      
      const fadeOut = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const percentage = 1 - (elapsed / fadeOutDuration);
        
        if (percentage > 0) {
          audio.volume = originalVolume * percentage;
          requestAnimationFrame(fadeOut);
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
          URL.revokeObjectURL(audio.src);
          
          completedCount++;
          if (completedCount === totalElements) {
            resolve();
          }
        }
      };
      
      requestAnimationFrame(fadeOut);
    });
  });
};

