--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: decks; Type: TABLE; Schema: public; Owner: rivcom; Tablespace: 
--

CREATE TABLE decks (
    id integer NOT NULL,
    "user" character varying(256),
    permissions integer,
    allowedusers json,
    file json
);


ALTER TABLE public.decks OWNER TO rivcom;

--
-- Name: decks_id_seq; Type: SEQUENCE; Schema: public; Owner: rivcom
--

CREATE SEQUENCE decks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.decks_id_seq OWNER TO rivcom;

--
-- Name: decks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rivcom
--

ALTER SEQUENCE decks_id_seq OWNED BY decks.id;


--
-- Name: userlinks; Type: TABLE; Schema: public; Owner: rivcom; Tablespace: 
--

CREATE TABLE userlinks (
    id integer NOT NULL,
    userid integer,
    followedby integer
);


ALTER TABLE public.userlinks OWNER TO rivcom;

--
-- Name: userlinks_id_seq; Type: SEQUENCE; Schema: public; Owner: rivcom
--

CREATE SEQUENCE userlinks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.userlinks_id_seq OWNER TO rivcom;

--
-- Name: userlinks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rivcom
--

ALTER SEQUENCE userlinks_id_seq OWNED BY userlinks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: rivcom; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    username character varying(256),
    displayname character varying(256),
    email character varying(256),
    passhash character varying(256),
    privileges integer
);


ALTER TABLE public.users OWNER TO rivcom;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: rivcom
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO rivcom;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rivcom
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: rivcom
--

ALTER TABLE ONLY decks ALTER COLUMN id SET DEFAULT nextval('decks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: rivcom
--

ALTER TABLE ONLY userlinks ALTER COLUMN id SET DEFAULT nextval('userlinks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: rivcom
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: decks_pkey; Type: CONSTRAINT; Schema: public; Owner: rivcom; Tablespace: 
--

ALTER TABLE ONLY decks
    ADD CONSTRAINT decks_pkey PRIMARY KEY (id);


--
-- Name: userlinks_pkey; Type: CONSTRAINT; Schema: public; Owner: rivcom; Tablespace: 
--

ALTER TABLE ONLY userlinks
    ADD CONSTRAINT userlinks_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: rivcom; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_username_key; Type: CONSTRAINT; Schema: public; Owner: rivcom; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

