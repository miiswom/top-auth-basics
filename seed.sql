\c authorised

DROP TABLE IF EXISTS top_users;

CREATE TABLE top_users( id SERIAL PRIMARY KEY,
                        username VARCHAR (255), 
                        password VARCHAR (255));