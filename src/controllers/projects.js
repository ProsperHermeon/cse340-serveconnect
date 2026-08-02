import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';
import { getCategoriesByProject } from '../models/categories.js';

// How many upcoming projects the main projects page shows. Kept as a named
// constant so the number lives in one place and the model stays reusable.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Renders the main service projects page: the next few upcoming projects.
 * The view simply displays whatever projects it is given - the limiting to
 * five happens here in the controller/model, not in the view.
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';

        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders the details page for a single service project, including the category
 * tags for that project.
 *
 * The id comes from req.params.id. If no project matches, a 404 page is served.
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        const categories = await getCategoriesByProject(id);
        const title = project.title;

        res.render('project', { title, project, categories });
    } catch (error) {
        next(error);
    }
};

export { showProjectsPage, showProjectDetailsPage };
