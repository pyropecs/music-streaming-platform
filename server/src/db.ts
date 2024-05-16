import postgres from "postgres"

const sql = postgres({
	username:"postgres",
	password:"12345",
	database:"music_streaming_app",
	host:"localhost"
})


export default sql;