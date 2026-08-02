import express from 'express';

import {
    showOrganizationsPage,
    showOrganizationDetailsPage
} from './controllers/organizations.js';
import {
    showProjectsPage,
    showProjectDetailsPage
} from './controllers/projects.js';
import {
    showCategoriesPage,
    showCategoryDetailsPage
} from './controllers/categories.js';

const router = express.Router();

// Home
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Organizations
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// Projects
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

// Categories
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

export default router;
