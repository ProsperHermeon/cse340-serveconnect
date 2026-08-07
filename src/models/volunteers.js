import db from './db.js';

/**
 * Signs a user up as a volunteer for a project by inserting into the volunteer
 * junction table. ON CONFLICT DO NOTHING makes it safe to call twice - a
 * duplicate signup is silently ignored rather than throwing on the composite
 * primary key.
 */
const addVolunteer = async (userId, projectId) => {
    const query = `
        INSERT INTO volunteer (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING;
    `;
    await db.query(query, [userId, projectId]);
};

/**
 * Removes a user's volunteer signup for a project.
 */
const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM volunteer
        WHERE user_id = $1 AND project_id = $2;
    `;
    await db.query(query, [userId, projectId]);
};

/**
 * Retrieves every project a given user has volunteered for, with the sponsoring
 * organization's name, for display on the dashboard. Walks the volunteer
 * junction table and joins project and organization.
 */
const getProjectsByVolunteer = async (userId) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.location,
               p.project_date AS date,
               o.organization_id,
               o.name AS organization_name
        FROM volunteer v
        JOIN project p      ON p.project_id = v.project_id
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE v.user_id = $1
        ORDER BY p.project_date;
    `;
    const result = await db.query(query, [userId]);

    return result.rows;
};

/**
 * Returns true if the given user is already volunteering for the given project.
 * Used by the project details page to decide which link to show.
 */
const isUserVolunteering = async (userId, projectId) => {
    const query = `
        SELECT 1
        FROM volunteer
        WHERE user_id = $1 AND project_id = $2;
    `;
    const result = await db.query(query, [userId, projectId]);

    return result.rows.length > 0;
};

export { addVolunteer, removeVolunteer, getProjectsByVolunteer, isUserVolunteering };
