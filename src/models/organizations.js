import db from './db.js';

/**
 * Retrieves every organization for the list page.
 * Columns are listed explicitly rather than using SELECT *.
 */
const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

/**
 * Retrieves a single organization by its id.
 *
 * The id arrives from the URL, so it is passed as a parameter ($1) rather than
 * concatenated into the query string. The pg driver sends the SQL and the value
 * separately, so the value can never be interpreted as SQL - this is the
 * defense against SQL injection.
 *
 * Returns one organization object, or undefined if no row matches.
 */
const getOrganizationDetails = async (id) => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
};

/**
 * Retrieves all service projects sponsored by a given organization, so the
 * organization details page can list them.
 */
const getProjectsByOrganization = async (id) => {
    const query = `
        SELECT project_id, title, description, location, project_date AS date, organization_id
        FROM public.project
        WHERE organization_id = $1
        ORDER BY project_date;
    `;

    const result = await db.query(query, [id]);

    return result.rows;
};

export { getAllOrganizations, getOrganizationDetails, getProjectsByOrganization };
