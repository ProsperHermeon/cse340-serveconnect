-- ============================================================================
-- ServeConnect - Database Setup Script
-- CSE 340 | Prosper Opara
--
-- Re-creates the entire database from scratch: schema + sample data.
-- Run this against a fresh PostgreSQL database (for example, after the Render
-- free-tier database expires and has to be rebuilt).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Clean slate.
-- Dropped in reverse dependency order: the child tables that hold foreign keys
-- must go before the parent tables they point at. CASCADE removes any dependent
-- objects so the script can be re-run safely at any time.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS organization CASCADE;


-- ---------------------------------------------------------------------------
-- organization
-- The sponsoring nonprofits. Parent of project (one organization : many projects).
-- ---------------------------------------------------------------------------
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT         NOT NULL,
    contact_email   VARCHAR(255) NOT NULL,
    logo_filename   VARCHAR(255) NOT NULL
);


-- ---------------------------------------------------------------------------
-- project
-- A service project sponsored by exactly one organization.
--
-- organization_id is the FOREIGN KEY back to organization. It is NOT NULL
-- because every project must have a sponsor, and ON DELETE CASCADE means that
-- deleting an organization also removes its projects rather than leaving
-- orphaned rows behind.
--
-- The column is named project_date rather than "date" because DATE is a
-- PostgreSQL type name, and using it as a bare column name invites confusion.
-- ---------------------------------------------------------------------------
CREATE TABLE project (
    project_id      SERIAL PRIMARY KEY,
    organization_id INTEGER      NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     TEXT         NOT NULL,
    location        VARCHAR(255) NOT NULL,
    project_date    DATE         NOT NULL,
    CONSTRAINT fk_project_organization
        FOREIGN KEY (organization_id)
        REFERENCES organization (organization_id)
        ON DELETE CASCADE
);


-- ---------------------------------------------------------------------------
-- category
-- A service project category. name is UNIQUE so the same category cannot be
-- entered twice under two different ids.
-- ---------------------------------------------------------------------------
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);


-- ---------------------------------------------------------------------------
-- project_category  (JUNCTION / BRIDGE TABLE)
--
-- A project can belong to many categories, and a category can hold many
-- projects. A relational database cannot express many-to-many directly, so it
-- is resolved into two one-to-many relationships through this bridge table.
--
-- The primary key is COMPOSITE (project_id, category_id): the pair is what must
-- be unique. That single constraint makes it impossible to link the same
-- project to the same category twice.
-- ---------------------------------------------------------------------------
CREATE TABLE project_category (
    project_id  INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT pk_project_category
        PRIMARY KEY (project_id, category_id),
    CONSTRAINT fk_project_category_project
        FOREIGN KEY (project_id)
        REFERENCES project (project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_project_category_category
        FOREIGN KEY (category_id)
        REFERENCES category (category_id)
        ON DELETE CASCADE
);


-- ===========================================================================
-- SAMPLE DATA
-- ===========================================================================

-- --- Organizations ---------------------------------------------------------
INSERT INTO organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders',
 'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
 'info@brightfuturebuilders.org',
 'brightfuture-logo.png'),
('GreenHarvest Growers',
 'An urban farming collective promoting food sustainability and education in local neighborhoods.',
 'contact@greenharvest.org',
 'greenharvest-logo.png'),
('UnityServe Volunteers',
 'A volunteer coordination group supporting local charities and service initiatives.',
 'hello@unityserve.org',
 'unityserve-logo.png');


-- --- Categories ------------------------------------------------------------
INSERT INTO category (name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');


-- --- Projects (5 per organization = 15 total) ------------------------------
-- organization_id is looked up by name with a subquery rather than hard-coding
-- 1, 2, 3. If the SERIAL sequence ever starts somewhere else, this still works.

-- BrightFuture Builders
INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Riverside Ramp Build',
 'Construct wheelchair ramps for six homes so residents can safely reach the street.',
 'Rexburg, ID', '2026-08-08'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Community Center Roof Repair',
 'Replace worn shingles and seal leaks before the winter season sets in.',
 'Rexburg, ID', '2026-08-22'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Playground Restoration',
 'Sand, repaint, and re-anchor playground equipment at Lincoln Park.',
 'Idaho Falls, ID', '2026-09-05'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Shelter Bunk Assembly',
 'Build and install forty bunk frames for the expanded family shelter wing.',
 'Pocatello, ID', '2026-09-19'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Weatherization Weekend',
 'Install insulation and weather stripping for low-income households.',
 'Rexburg, ID', '2026-10-03');

-- GreenHarvest Growers
INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Community Garden Planting',
 'Prepare beds and plant a fall crop of greens, carrots, and garlic.',
 'Idaho Falls, ID', '2026-08-15'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Riverbank Cleanup',
 'Remove trash and invasive weeds along a two-mile stretch of the river.',
 'Idaho Falls, ID', '2026-08-29'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Composting Workshop',
 'Teach neighborhood families how to build and maintain a home compost system.',
 'Rexburg, ID', '2026-09-12'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Orchard Tree Planting',
 'Plant sixty fruit trees to establish a free-harvest community orchard.',
 'Pocatello, ID', '2026-09-26'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Farmers Market Nutrition Booth',
 'Run a booth offering free produce samples and healthy-eating guidance.',
 'Idaho Falls, ID', '2026-10-10');

-- UnityServe Volunteers
INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Food Pantry Sorting Day',
 'Sort, date-check, and shelve donations ahead of the weekly distribution.',
 'Rexburg, ID', '2026-08-01'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'After-School Reading Buddies',
 'Read one-on-one with elementary students who need extra practice.',
 'Pocatello, ID', '2026-08-18'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Senior Center Tech Help',
 'Help seniors set up phones, video calls, and online appointment portals.',
 'Idaho Falls, ID', '2026-09-08'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Community Blood Drive',
 'Staff registration, refreshments, and donor check-out at the mobile clinic.',
 'Rexburg, ID', '2026-09-22'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Winter Coat Distribution',
 'Sort donated coats by size and hand them out to families before the cold hits.',
 'Pocatello, ID', '2026-10-17');


-- --- Project / Category associations ---------------------------------------
-- Every project is linked to at least one category; several carry two, which is
-- the whole point of a many-to-many design.
INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM (VALUES
    ('Riverside Ramp Build',              'Community Service'),
    ('Riverside Ramp Build',              'Health and Wellness'),
    ('Community Center Roof Repair',      'Community Service'),
    ('Playground Restoration',            'Community Service'),
    ('Playground Restoration',            'Health and Wellness'),
    ('Shelter Bunk Assembly',             'Community Service'),
    ('Weatherization Weekend',            'Environmental'),
    ('Weatherization Weekend',            'Community Service'),
    ('Community Garden Planting',         'Environmental'),
    ('Riverbank Cleanup',                 'Environmental'),
    ('Composting Workshop',               'Educational'),
    ('Composting Workshop',               'Environmental'),
    ('Orchard Tree Planting',             'Environmental'),
    ('Farmers Market Nutrition Booth',    'Health and Wellness'),
    ('Farmers Market Nutrition Booth',    'Educational'),
    ('Food Pantry Sorting Day',           'Community Service'),
    ('After-School Reading Buddies',      'Educational'),
    ('Senior Center Tech Help',           'Educational'),
    ('Senior Center Tech Help',           'Community Service'),
    ('Community Blood Drive',             'Health and Wellness'),
    ('Winter Coat Distribution',          'Community Service')
) AS v(project_title, category_name)
JOIN project  p ON p.title = v.project_title
JOIN category c ON c.name  = v.category_name;


-- ===========================================================================
-- VERIFICATION QUERIES
-- ===========================================================================
-- SELECT * FROM organization;
-- SELECT * FROM project;
-- SELECT * FROM category;
-- SELECT * FROM project_category;
