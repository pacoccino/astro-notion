import { Client, isFullBlock, isFullPage, isFullPageOrDatabase } from "@notionhq/client"
import type { PageObjectResponse, RichTextItemResponse, DatabaseObjectResponse, BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import config from '../config'

const notion = new Client({ auth: config.NOTION_API_KEY })

export async function queryDatabase(databaseId: string): Promise<Array<PageObjectResponse | DatabaseObjectResponse>> {
    const databaseContent = await notion.databases.query({
      database_id: databaseId,
    })
  
    // When does results are of DatabaseObject type ?
    const fullObjects: Array<PageObjectResponse | DatabaseObjectResponse> = databaseContent.results.filter(isFullPageOrDatabase);
    return fullObjects;
}

export async function getPage(pageId: string): Promise<PageObjectResponse> {
    const page = await notion.pages.retrieve({page_id: pageId});
    if(!isFullPage(page)) {
        throw new Error('didnot receive full page')
    }
    return page;
}
export async function getPageContent(pageId: string): Promise<Array<BlockObjectResponse>> {
    const blockList = await notion.blocks.children.list({block_id: pageId});
    return blockList.results.filter(isFullBlock);
}

export function renderProperty(page: PageObjectResponse | DatabaseObjectResponse, propertyKey: string): string {
    const pageForced = page as PageObjectResponse;
    const property = pageForced.properties[propertyKey]
   
    function reduceRichText(richText: Array<RichTextItemResponse>) {
        return richText.reduce((str: string, item: RichTextItemResponse) => str += item.plain_text, '')
    }
    
    switch (property.type) {
        case "rich_text": {
            return reduceRichText(property.rich_text)
        }
        case "title": {
            return reduceRichText(property.title)
        }
        default: {
            throw new Error('unsupported property type')
        }
    }
}