import db from './db.js';

/**
 * Retrieves the next `numberOfProjects` upcoming service projects (date today or
 * later), soonest first, capped with a parameterized LIMIT. The JOIN brings in
 * the sponsoring organization's name.
 */
const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location,
               p.project_date AS date, o.organization_id, o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;
    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

/**
 * Retrieves a single service project by id, with the organization name.
 * Returns one project object, or undefined if no row matches.
 */
const getProjectDetails = async (id) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location,
               p.project_date AS date, o.organization_id, o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE p.project_id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

/**
 * Creates a new service project and returns the new project_id.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO project (organization_id, title, description, location, project_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;
    const queryParams = [organizationId, title, description, location, date];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }
    return result.rows[0].project_id;
};

/**
 * Updates an existing service project by id, including its organization
 * assignment. Throws if no row was updated.
 */
const updateProject = async (id, title, description, location, date, organizationId) => {
    const query = `
        UPDATE project
        SET title = $1, description = $2, location = $3, project_date = $4, organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;
    `;
    const queryParams = [title, description, location, date, organizationId, id];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error(`Failed to update project with id ${id}`);
    }
    return result.rows[0].project_id;
};

export { getUpcomingProjects, getProjectDetails, createProject, updateProject };
