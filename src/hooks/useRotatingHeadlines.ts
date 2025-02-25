import { useState, useEffect } from 'react';
import { NEWS_DATA } from '../data/news-data';

export const useRotatingHeadlines = () => {
    const [headlines, setHeadlines] = useState<string>('');

    useEffect(() => {
        // Use the imported NEWS_DATA instead of fetching from CSV
        try {
            const titles = NEWS_DATA.map(item => item.title);
            const concatenatedHeadlines = titles.join(' • BREAKING NEWS • ');
            setHeadlines('BREAKING NEWS • ' + concatenatedHeadlines);
        } catch (error) {
            console.error('Error processing headlines:', error);
            setHeadlines('Loading headlines...');
        }
    }, []);

    return headlines;
}; 