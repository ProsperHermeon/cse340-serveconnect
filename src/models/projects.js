import db from './db.js';

/**
 * Retrieves the next `numberOfProjects` upcoming service projects.
 *
 * "Upcoming" means the project date is today or later (project_date >=
 * CURRENT_DATE), ordered soonest-first, and capped with LIMIT. The limit is a
 * parameter ($1) rather than hard-coded, so the same function can return any
 * number of projects - the controller decides how many.
 *
 * The JOIN is required because the project table only stores organization_id;
 * the organization's name lives in a different table. o.name is aliased to
 * organization_name to avoid colliding with the project's own columns.
 */
const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.project_date AS date,
               o.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);

    return result.rows;
};

/**
 * Retrieves a single service project by its id, along with the sponsoring
 * organization's name (via the JOIN). The id is parameterized ($1) to prevent
 * SQL injection.
 *
 * Returns one project object, or undefined if no row matches.
 */
const getProjectDetails = async (id) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.project_date AS date,
               o.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON o.organization_id = p.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
};

export { getUpcomingProjects, getProjectDetails };
