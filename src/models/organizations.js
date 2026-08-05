import db from './db.js';

/**
 * Retrieves every organization for the list page.
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
 * Retrieves a single organization by its id (parameterized to prevent injection).
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
 * Retrieves all service projects sponsored by a given organization.
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

/**
 * Creates a new organization and returns the new organization_id.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id;
    `;
    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }
    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization by id. Throws if no row was updated
 * (i.e. the id did not exist).
 */
const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE organization
        SET name = $1, description = $2, contact_email = $3, logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id;
    `;
    const queryParams = [name, description, contactEmail, logoFilename, id];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error(`Failed to update organization with id ${id}`);
    }
    return result.rows[0].organization_id;
};

export {
    getAllOrganizations,
    getOrganizationDetails,
    getProjectsByOrganization,
    createOrganization,
    updateOrganization
};
