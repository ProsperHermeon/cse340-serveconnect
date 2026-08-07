-- ============================================================================
-- ServeConnect - Database Setup Script
-- CSE 340 | Prosper Opara
--
-- Re-creates the entire database from scratch: schema + sample data.
-- Project dates are relative to CURRENT_DATE so the upcoming-projects list
-- always has data. The dedicated admin grader account
-- (admin@example.com / cse340!) is seeded with a real bcrypt hash so it is
-- always present after a rebuild.
-- ============================================================================

DROP TABLE IF EXISTS volunteer CASCADE;
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS organization CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- roles (parent of users: one role -> many users)
CREATE TABLE roles (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- users. password_hash stores a bcrypt hash, never a plain-text password.
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER      NOT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
);

CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT         NOT NULL,
    contact_email   VARCHAR(255) NOT NULL,
    logo_filename   VARCHAR(255) NOT NULL
);

CREATE TABLE project (
    project_id      SERIAL PRIMARY KEY,
    organization_id INTEGER      NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     TEXT         NOT NULL,
    location        VARCHAR(255) NOT NULL,
    project_date    DATE         NOT NULL,
    CONSTRAINT fk_project_organization
        FOREIGN KEY (organization_id) REFERENCES organization (organization_id) ON DELETE CASCADE
);

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE project_category (
    project_id  INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT pk_project_category PRIMARY KEY (project_id, category_id),
    CONSTRAINT fk_project_category_project
        FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    CONSTRAINT fk_project_category_category
        FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE
);

-- volunteer (JUNCTION TABLE: many-to-many between users and project)
-- A user can volunteer for many projects; a project can have many volunteers.
-- The composite primary key (user_id, project_id) makes each signup unique, so
-- the same user cannot volunteer for the same project twice.
CREATE TABLE volunteer (
    user_id      INTEGER   NOT NULL,
    project_id   INTEGER   NOT NULL,
    signed_up_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_volunteer PRIMARY KEY (user_id, project_id),
    CONSTRAINT fk_volunteer_user
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_volunteer_project
        FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE
);

-- ===========================================================================
-- SAMPLE DATA
-- ===========================================================================

INSERT INTO roles (role_name) VALUES ('user'), ('admin');

-- Real bcrypt hashes (salt rounds 10):
--   admin@example.com  -> cse340!    (admin) - grader test account
--   jordan@example.com -> volunteer1 (user)
--   riley@example.com  -> volunteer1 (user)
INSERT INTO users (name, email, password_hash, role_id) VALUES
('admin', 'admin@example.com',
 '$2b$10$FvYeLpSEKBghKBihekrMu.Wt/CEjag2rttYAu1phuVDKE/GWDmNkK',
 (SELECT role_id FROM roles WHERE role_name = 'admin')),
('Jordan Lee', 'jordan@example.com',
 '$2b$10$5KAmYXAJV2uN6XijBoZPCeZvnSq84ic.JqlN.stsXLHWeI4HgM1oG',
 (SELECT role_id FROM roles WHERE role_name = 'user')),
('Riley Chen', 'riley@example.com',
 '$2b$10$5KAmYXAJV2uN6XijBoZPCeZvnSq84ic.JqlN.stsXLHWeI4HgM1oG',
 (SELECT role_id FROM roles WHERE role_name = 'user'));

INSERT INTO organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders',
 'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers',
 'An urban farming collective promoting food sustainability and education in local neighborhoods.',
 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers',
 'A volunteer coordination group supporting local charities and service initiatives.',
 'hello@unityserve.org', 'unityserve-logo.png');

INSERT INTO category (name) VALUES
('Environmental'), ('Educational'), ('Community Service'), ('Health and Wellness');

INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Riverside Ramp Build', 'Construct wheelchair ramps for six homes so residents can safely reach the street.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '4 days'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Community Center Roof Repair', 'Replace worn shingles and seal leaks before the winter season sets in.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '18 days'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Playground Restoration', 'Sand, repaint, and re-anchor playground equipment at Lincoln Park.',
 'Idaho Falls, ID', CURRENT_DATE + INTERVAL '32 days'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Shelter Bunk Assembly', 'Build and install forty bunk frames for the expanded family shelter wing.',
 'Pocatello, ID', CURRENT_DATE + INTERVAL '46 days'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
 'Weatherization Weekend', 'Install insulation and weather stripping for low-income households.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '60 days');

INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Community Garden Planting', 'Prepare beds and plant a fall crop of greens, carrots, and garlic.',
 'Idaho Falls, ID', CURRENT_DATE + INTERVAL '7 days'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Riverbank Cleanup', 'Remove trash and invasive weeds along a two-mile stretch of the river.',
 'Idaho Falls, ID', CURRENT_DATE + INTERVAL '21 days'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Composting Workshop', 'Teach neighborhood families how to build and maintain a home compost system.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '35 days'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Orchard Tree Planting', 'Plant sixty fruit trees to establish a free-harvest community orchard.',
 'Pocatello, ID', CURRENT_DATE + INTERVAL '49 days'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
 'Farmers Market Nutrition Booth', 'Run a booth offering free produce samples and healthy-eating guidance.',
 'Idaho Falls, ID', CURRENT_DATE + INTERVAL '70 days');

INSERT INTO project (organization_id, title, description, location, project_date) VALUES
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Food Pantry Sorting Day', 'Sort, date-check, and shelve donations ahead of the weekly distribution.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '2 days'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'After-School Reading Buddies', 'Read one-on-one with elementary students who need extra practice.',
 'Pocatello, ID', CURRENT_DATE + INTERVAL '14 days'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Senior Center Tech Help', 'Help seniors set up phones, video calls, and online appointment portals.',
 'Idaho Falls, ID', CURRENT_DATE + INTERVAL '28 days'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Community Blood Drive', 'Staff registration, refreshments, and donor check-out at the mobile clinic.',
 'Rexburg, ID', CURRENT_DATE + INTERVAL '42 days'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
 'Winter Coat Distribution', 'Sort donated coats by size and hand them out to families before the cold hits.',
 'Pocatello, ID', CURRENT_DATE + INTERVAL '85 days');

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM (VALUES
    ('Riverside Ramp Build','Community Service'),
    ('Riverside Ramp Build','Health and Wellness'),
    ('Community Center Roof Repair','Community Service'),
    ('Playground Restoration','Community Service'),
    ('Playground Restoration','Health and Wellness'),
    ('Shelter Bunk Assembly','Community Service'),
    ('Weatherization Weekend','Environmental'),
    ('Weatherization Weekend','Community Service'),
    ('Community Garden Planting','Environmental'),
    ('Riverbank Cleanup','Environmental'),
    ('Composting Workshop','Educational'),
    ('Composting Workshop','Environmental'),
    ('Orchard Tree Planting','Environmental'),
    ('Farmers Market Nutrition Booth','Health and Wellness'),
    ('Farmers Market Nutrition Booth','Educational'),
    ('Food Pantry Sorting Day','Community Service'),
    ('After-School Reading Buddies','Educational'),
    ('Senior Center Tech Help','Educational'),
    ('Senior Center Tech Help','Community Service'),
    ('Community Blood Drive','Health and Wellness'),
    ('Winter Coat Distribution','Community Service')
) AS v(project_title, category_name)
JOIN project  p ON p.title = v.project_title
JOIN category c ON c.name  = v.category_name;


-- --- Volunteer signups (demo data) -----------------------------------------
INSERT INTO volunteer (user_id, project_id)
SELECT u.user_id, p.project_id
FROM (VALUES
    ('jordan@example.com', 'Riverside Ramp Build'),
    ('jordan@example.com', 'Community Garden Planting'),
    ('riley@example.com',  'Food Pantry Sorting Day')
) AS v(email, title)
JOIN users   u ON u.email = v.email
JOIN project p ON p.title = v.title;
