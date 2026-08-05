import { body, validationResult } from 'express-validator';

import {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory,
    getCategoriesByProject,
    createCategory,
    updateCategory,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

// Server-side validation for the category form (create and edit).
// Minimum length of 3 is enforced here on the server only (the client-side
// form deliberately omits it so server-side validation can be demonstrated).
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await getCategoryDetails(id);

        if (!category) {
            return res.status(404).render('404', { title: 'Category Not Found' });
        }

        const projects = await getProjectsByCategory(id);
        const title = category.name;
        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-category');
        }

        const { name } = req.body;

        await createCategory(name);
        req.flash('success', 'Category added successfully!');
        res.redirect('/categories');
    } catch (error) {
        next(error);
    }
};

const showEditCategoryForm = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await getCategoryDetails(id);

        if (!category) {
            return res.status(404).render('404', { title: 'Category Not Found' });
        }

        const title = `Edit ${category.name}`;
        res.render('edit-category', { title, category });
    } catch (error) {
        next(error);
    }
};

const processEditCategoryForm = async (req, res, next) => {
    try {
        const id = req.params.id;

        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-category/${id}`);
        }

        const { name } = req.body;

        await updateCategory(id, name);
        req.flash('success', 'Category updated successfully!');
        res.redirect('/categories');
    } catch (error) {
        next(error);
    }
};

// --- Assigning categories to a project -----------------------------------

const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProject(projectId);
        const title = 'Assign Categories to Project';

        res.render('assign-categories', { title, project, categories, assignedCategories });
    } catch (error) {
        next(error);
    }
};

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        // Checkboxes submit an array under `categoryIds`. If none are checked
        // the field is absent; if one is checked it may be a single value.
        let categoryIds = req.body.categoryIds || [];
        if (!Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }

        await updateCategoryAssignments(projectId, categoryIds);
        req.flash('success', 'Categories updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation
};
