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
 * Retrieves a single category by id (parameterized). Returns one category
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
 * Retrieves all service projects that belong to a given category (walks the
 * junction table and joins organization for the sponsor name).
 */
const getProjectsByCategory = async (id) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location,
               p.project_date AS date, o.organization_id, o.name AS organization_name
        FROM public.project p
        JOIN public.project_category pc ON pc.project_id = p.project_id
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date;
    `;
    const result = await db.query(query, [id]);
    return result.rows;
};

/**
 * Retrieves all categories a given project belongs to (for its tag list).
 */
const getCategoriesByProject = async (id) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.category c
        JOIN public.project_category pc ON pc.category_id = c.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    const result = await db.query(query, [id]);
    return result.rows;
};

/**
 * Creates a new category and returns the new category_id.
 */
const createCategory = async (name) => {
    const query = `
        INSERT INTO category (name)
        VALUES ($1)
        RETURNING category_id;
    `;
    const result = await db.query(query, [name]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }
    return result.rows[0].category_id;
};

/**
 * Updates an existing category by id. Throws if no row was updated.
 */
const updateCategory = async (id, name) => {
    const query = `
        UPDATE category
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id;
    `;
    const result = await db.query(query, [name, id]);

    if (result.rows.length === 0) {
        throw new Error(`Failed to update category with id ${id}`);
    }
    return result.rows[0].category_id;
};

/**
 * Assigns a single category to a project by inserting into the junction table.
 * Not exported - used only by updateCategoryAssignments below.
 */
const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_category (project_id, category_id)
        VALUES ($1, $2);
    `;
    await db.query(query, [projectId, categoryId]);
};

/**
 * Replaces a project's category assignments with a new set. Removes all
 * existing assignments for the project, then inserts one row per selected
 * category id.
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const deleteQuery = `DELETE FROM project_category WHERE project_id = $1;`;
    await db.query(deleteQuery, [projectId]);

    for (const categoryId of categoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
};

export {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory,
    getCategoriesByProject,
    createCategory,
    updateCategory,
    updateCategoryAssignments
};
