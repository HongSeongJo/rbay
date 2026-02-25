import { client } from "$services/redis";
import { itemsKey, itemsByViewsKey } from "$services/keys";
import { deserialize } from "./deserialize";

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    let results: any = await client.sort(
        itemsByViewsKey(),
        {
            GET: [
                '#',
                `${itemsKey('*')}->name`,
                `${itemsKey('*')}->views`,
                `${itemsKey('*')}->endingAt`,
                `${itemsKey('*')}->imageUrl`,
                `${itemsKey('*')}->price`
            ],
            BY: 'score', // 이미 정렬되어 있으니 없는 키 대입하여 정렬X. 'nosort' 입력해도 무방
            DIRECTION: order,
            LIMIT: {
                offset, count
            }
        }
    );
    
    const items = [];
    while (results.length) {
        const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
        const item = deserialize(id, { name, views, endingAt, imageUrl, price });
        items.push(item);
        results = rest;
    }

    return items;
};
