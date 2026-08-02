import {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory
} from '../models/categories.js';

/**
 * Renders the list of all categories. Each category links to its details page.
 * The category ids needed for those links already come from getAllCategories,
 * so no controller change was needed beyond what the list already provided.
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';

        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders the details page for a single category, listing every service project
 * that belongs to it. Each project links to its own details page.
 *
 * The id comes from req.params.id. If no category matches, a 404 is served.
 */
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

export { showCategoriesPage, showCategoryDetailsPage };
