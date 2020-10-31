DROP TABLE IF EXISTS location;

CREATE TABLE location(
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    display_name VARCHAR(255),
    lat NUMERIC(10, 7),
    lon NUMERIC(10, 7)
);