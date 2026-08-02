import db from './db.js';

/**
 * Retrieves every category for the list page.
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

/**
 * Retrieves a single category by its id (parameterized). Returns one category
 * object, or undefined if no row matches.
 */
const getCategoryDetails = async (id) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
};

/**
 * Retrieves all service projects that belong to a given category.
 *
 * This walks the many-to-many relationship: it joins project to the junction
 * table (project_category) to find which projects carry this category, and
 * joins organization to bring in the sponsor's name for display.
 */
const getProjectsByCategory = async (id) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.project_date AS date,
               o.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.project_category pc
            ON pc.project_id = p.project_id
        JOIN public.organization o
            ON o.organization_id = p.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date;
    `;

    const result = await db.query(query, [id]);

    return result.rows;
};

/**
 * Retrieves all categories that a given service project belongs to, so the
 * project details page can show its category tags. Walks the junction table
 * from the project side.
 */
const getCategoriesByProject = async (id) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.category c
        JOIN public.project_category pc
            ON pc.category_id = c.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;

    const result = await db.query(query, [id]);

    return result.rows;
};

export {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory,
    getCategoriesByProject
};
