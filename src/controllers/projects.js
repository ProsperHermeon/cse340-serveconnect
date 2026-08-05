import { body, validationResult } from 'express-validator';

import {
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject
} from '../models/projects.js';
import { getCategoriesByProject } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Validation rules for the service project form (create and edit).
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ max: 200 })
        .withMessage('Location cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('organizationId')
        .notEmpty()
        .withMessage('An organization is required')
        .isInt()
        .withMessage('Please select a valid organization')
];

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

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

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        next(error);
    }
};

const processNewProjectForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-project');
        }

        const { title, description, location, date, organizationId } = req.body;

        await createProject(title, description, location, date, organizationId);
        req.flash('success', 'Service project added successfully!');
        res.redirect('/projects');
    } catch (error) {
        next(error);
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const id = req.params.id;
        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        const organizations = await getAllOrganizations();
        const title = `Edit ${project.title}`;
        res.render('edit-project', { title, project, organizations });
    } catch (error) {
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    try {
        const id = req.params.id;

        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${id}`);
        }

        const { title, description, location, date, organizationId } = req.body;

        await updateProject(id, title, description, location, date, organizationId);
        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${id}`);
    } catch (error) {
        next(error);
    }
};

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};
