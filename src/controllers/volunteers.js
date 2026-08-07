import { addVolunteer, removeVolunteer } from '../models/volunteers.js';

/**
 * Signs the logged-in user up as a volunteer for a project, then returns them to
 * that project's details page. The user id comes from the session (set at
 * login), never from the request body, so a user can only volunteer as
 * themselves.
 */
const volunteerForProject = async (req, res, next) => {
    try {
        const userId = req.session.user.user_id;
        const projectId = req.params.projectId;

        await addVolunteer(userId, projectId);

        req.flash('success', 'You are now volunteering for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Removes the logged-in user's volunteer signup for a project. The form supplies
 * a redirectTo so this works from both the project page and the dashboard; it is
 * only honored when it is an internal path, otherwise we fall back to the
 * dashboard.
 */
const removeVolunteerFromProject = async (req, res, next) => {
    try {
        const userId = req.session.user.user_id;
        const projectId = req.params.projectId;

        await removeVolunteer(userId, projectId);

        const redirectTo =
            typeof req.body.redirectTo === 'string' && req.body.redirectTo.startsWith('/')
                ? req.body.redirectTo
                : '/dashboard';

        req.flash('success', 'You have been removed as a volunteer for this project.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

export { volunteerForProject, removeVolunteerFromProject };
