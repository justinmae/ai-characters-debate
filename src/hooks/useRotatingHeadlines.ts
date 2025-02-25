import { useState, useEffect } from 'react';
import { NEWS_DATA } from '../data/news-data';

export const useRotatingHeadlines = () => {
    const [headlines, setHeadlines] = useState<string>('');

    useEffect(() => {
        // Use the imported NEWS_DATA instead of fetching from CSV
        try {
            // Create a longer string to ensure proper scrolling
            const titles = NEWS_DATA.map(item => item.title.trim());
            
            // Use the original format without additional prefix
            const concatenatedHeadlines = titles.join(' • BREAKING NEWS • ');
            
            // Make sure we have enough content for the animation to work
            // Repeat the headlines if necessary to ensure sufficient length
            if (concatenatedHeadlines.length < 500) {
                setHeadlines(concatenatedHeadlines + ' • BREAKING NEWS • ' + concatenatedHeadlines);
            } else {
                setHeadlines(concatenatedHeadlines);
            }
            
            console.log('Headlines length:', concatenatedHeadlines.length);
        } catch (error) {
            console.error('Error processing headlines:', error);
            setHeadlines('BREAKING NEWS • Technical Difficulties at AI News Network • BREAKING NEWS');
        }
    }, []);

    return headlines;
}; 