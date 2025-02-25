import csvtojson from 'csvtojson';

export interface NewsItem {
    id: number;
    title: string;
    description: string;
}

export class NewsQueue {
    private queue: NewsItem[] = [];
    private filePath: string = '/news_database.csv';
    private isLoading: boolean = false;
    public loadingPromise: Promise<void> | null = null;
    private usedNewsIds: Set<number>;
    private readonly STORAGE_KEY = 'newsQueue_usedIds';

    constructor() {
        console.log('NewsQueue: Initializing...');
        // Load used IDs from localStorage
        const savedIds = localStorage.getItem(this.STORAGE_KEY);
        this.usedNewsIds = new Set(savedIds ? JSON.parse(savedIds) : []);
        this.loadingPromise = this.loadNews();
    }

    private saveUsedIds() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.usedNewsIds]));
    }

    private clearUsedIds() {
        this.usedNewsIds.clear();
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private async loadNews() {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log('NewsQueue: Starting to load news from:', this.filePath);
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            const jsonArray = await csvtojson({
                noheader: true,
                headers: ['title', 'description']
            }).fromString(csvText);

            const newsItems = jsonArray
                .filter(item => item && typeof item.title === 'string' && typeof item.description === 'string')
                .map((item, index) => ({
                    id: index + 1,
                    title: item.title.replace(/^"|"$/g, ''),
                    description: item.description.replace(/^"|"$/g, '')
                }))
                .filter(item => !this.usedNewsIds.has(item.id));

            if (newsItems.length === 0) {
                this.clearUsedIds();
                this.queue = this.shuffleArray(jsonArray
                    .filter(item => item && typeof item.title === 'string' && typeof item.description === 'string')
                    .map((item, index) => ({
                        id: index + 1,
                        title: item.title.replace(/^"|"$/g, ''),
                        description: item.description.replace(/^"|"$/g, '')
                    })));
            } else {
                this.queue = this.shuffleArray(newsItems);
            }

            console.log('NewsQueue: Successfully loaded news items:', this.queue.length);
        } catch (error) {
            console.error('NewsQueue: Error loading news:', error);
            this.queue = [
                {
                    id: 1,
                    title: "Breaking: AI Makes Breakthrough in Renewable Energy",
                    description: "Scientists announce revolutionary advancement in solar power efficiency."
                }
            ];
        } finally {
            this.isLoading = false;
        }
    }

    getCurrentNews = async (): Promise<NewsItem | null> => {
        // If queue is empty, wait for news to load
        if (this.queue.length === 0) {
            await this.loadNews();
        }

        if (this.queue.length === 0) {
            return null;
        }

        const currentNews = this.queue.shift() || null;
        if (currentNews) {
            this.usedNewsIds.add(currentNews.id);
            this.saveUsedIds();
        }

        // Don't start loading new news here since we want to use all items first
        return currentNews;
    };

    public removeCurrentNews() {
        if (this.queue.length > 0) {
            console.log('NewsQueue: Removing current news:', this.queue[0]);
            this.queue.shift();
        }
    }
}

export const newsQueue = new NewsQueue(); 