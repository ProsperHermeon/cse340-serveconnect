import {
    getAllOrganizations,
    getOrganizationDetails,
    getProjectsByOrganization
} from '../models/organizations.js';

/**
 * Renders the list of all partner organizations. Each one links to its
 * details page.
 */
const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';

        res.render('organizations', { title, organizations });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders the details page for a single organization, including the list of
 * service projects it sponsors.
 *
 * The id comes from the URL as a route parameter (req.params.id). If no
 * organization matches that id, a 404 page is served rather than rendering an
 * empty page.
 */
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        const organization = await getOrganizationDetails(id);

        if (!organization) {
            return res.status(404).render('404', { title: 'Organization Not Found' });
        }

        const projects = await getProjectsByOrganization(id);
        const title = organization.name;

        res.render('organization', { title, organization, projects });
    } catch (error) {
        next(error);
    }
};

export { showOrganizationsPage, showOrganizationDetailsPage };
