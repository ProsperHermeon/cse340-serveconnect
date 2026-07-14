import db from './db.js';

/**
 * Retrieves every service project category.
 *
 * The assignment only requires the category names at this stage; the projects
 * associated with each category are added in a later week.
 */
const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM public.category
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllCategories };
