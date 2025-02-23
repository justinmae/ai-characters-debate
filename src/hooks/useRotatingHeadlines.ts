import { useState, useEffect } from 'react';
import csvtojson from 'csvtojson';

export const useRotatingHeadlines = () => {
    const [headlines, setHeadlines] = useState<string>('');

    useEffect(() => {
        const loadHeadlines = async () => {
            try {
                const response = await fetch('/news_database.csv');
                const csvText = await response.text();
                const jsonArray = await csvtojson({
                    noheader: true,
                    headers: ['title', 'description']
                }).fromString(csvText);

                const titles = jsonArray.map(item => item.title.replace(/^"|"$/g, ''));
                const concatenatedHeadlines = titles.join(' • BREAKING NEWS • ');
                setHeadlines(concatenatedHeadlines);
            } catch (error) {
                console.error('Error loading headlines:', error);
                setHeadlines('Loading headlines...');
            }
        };

        loadHeadlines();
    }, []);

    return headlines;
}; 