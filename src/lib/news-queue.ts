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
    private loadingPromise: Promise<void> | null = null;

    constructor() {
        console.log('NewsQueue: Initializing...');
        this.loadingPromise = this.loadNews();
    }

    private async loadNews() {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log('NewsQueue: Starting to load news from:', this.filePath);
        try {
            console.log('NewsQueue: Attempting to fetch CSV file...');
            const response = await fetch(this.filePath);
            console.log('NewsQueue: Fetch response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            console.log('NewsQueue: CSV content length:', csvText.length);
            console.log('NewsQueue: First 100 chars of CSV:', csvText.substring(0, 100));

            console.log('NewsQueue: Converting CSV to JSON...');
            const jsonArray = await csvtojson({
                noheader: true,
                headers: ['title', 'description']
            }).fromString(csvText);
            console.log('NewsQueue: JSON array length:', jsonArray.length);
            console.log('NewsQueue: First JSON item:', JSON.stringify(jsonArray[0]));

            this.queue = jsonArray.map((item, index) => {
                console.log('NewsQueue: Processing item:', item);
                return {
                    id: index + 1,
                    title: item.title.replace(/^"|"$/g, ''),
                    description: item.description.replace(/^"|"$/g, '')
                };
            });
            console.log('NewsQueue: Successfully loaded news items:', this.queue.length);
        } catch (error) {
            console.error('NewsQueue: Error loading news:', error);
            console.error('NewsQueue: Error stack:', error.stack);
            this.queue = [
                {
                    id: 1,
                    title: "Breaking: AI Makes Breakthrough in Renewable Energy",
                    description: "Scientists announce revolutionary advancement in solar power efficiency."
                }
            ];
            console.log('NewsQueue: Loaded fallback news items');
        } finally {
            this.isLoading = false;
        }
    }

    public async getCurrentNews(): Promise<NewsItem | null> {
        if (this.loadingPromise) {
            await this.loadingPromise;
        }
        const currentNews = this.queue.length > 0 ? this.queue[0] : null;
        console.log('NewsQueue: Getting current news:', currentNews);
        return currentNews;
    }

    public removeCurrentNews() {
        if (this.queue.length > 0) {
            console.log('NewsQueue: Removing current news:', this.queue[0]);
            this.queue.shift();
        }
    }
}

export const newsQueue = new NewsQueue(); 