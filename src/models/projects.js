import db from './db.js';

/**
 * Retrieves every service project along with the name of the organization
 * that sponsors it.
 *
 * The project table only stores organization_id, so the organization's name
 * lives in a different table. An INNER JOIN follows that foreign key and pulls
 * the matching organization row alongside each project, letting one query
 * return columns from both tables.
 *
 * organization.name is aliased to organization_name so it does not collide with
 * project.title and is unambiguous in the returned row objects.
 */
const getAllProjects = async () => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.project_date,
               o.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON o.organization_id = p.organization_id
        ORDER BY p.project_date;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllProjects };
