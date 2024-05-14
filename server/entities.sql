

create table users(
	user_id serial not null primary key,
	username varchar unique not null,
	email varchar unique not null,
	password varchar not null,
	role varchar not null
);

create table genre(
	genre_id serial not null primary key,
	title varchar not null
);

create table songs(
	song_id serial not null primary key,
	title varchar not null,
	link varchar not null,
	created_by bigint references users(user_id),
	created_at timestamp not null,
	genre bigint references genre(genre_id),
	song_photo varchar

);

create table playlist(
	playlist_id serial not null primary key,
	title varchar not null,
	created_by bigint references users(user_id),
	created_at timestamp not null 
);

create table songs_playlist(
	song_id bigint references songs(song_id),
	playlist_id bigint references playlist(playlist_id)
);
