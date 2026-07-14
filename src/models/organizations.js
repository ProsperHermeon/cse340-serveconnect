import db from './db.js';

/**
 * Retrieves every organization.
 *
 * Columns are listed explicitly rather than using SELECT *, so that a column
 * added to the table later is not accidentally exposed to the application.
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

export { getAllOrganizations };
