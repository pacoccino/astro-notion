import config from '../../config'
import { queryDatabase, getPage, getPageContent, renderProperty } from '../notion'

export interface PartialArticle {
	id: string;
	slug: string;
	title: string;
}
export interface Article extends PartialArticle {
    content: string
    page: any;
    pageContent: any;
}

export async function queryArticles(): Promise<PartialArticle[]> {
	const databaseResults = await queryDatabase(config.DATABASE_ID)
	return databaseResults.map(page => ({
		id: page.id,
		slug: renderProperty(page, 'slug'),
		title: renderProperty(page, 'Name'),
	}))
}

export async function queryArticle(articleId: string): Promise<Article> {
    const page = await getPage(articleId)
    const pageContent = await getPageContent(articleId)
    const article = {
		id: page.id,
		slug: renderProperty(page, 'slug'),
		title: renderProperty(page, 'Name'),
        content: '',
        page,
        pageContent,
    }

    return article;
}
