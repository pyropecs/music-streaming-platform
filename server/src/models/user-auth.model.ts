import sql from "../db";
import bcrypt from "bcrypt";
type createUserType = {
	username: string;
	password: string;
	email: string;
	role: string;
};

export const createUser = async ({
	username,
	password,
	email,
	role,
}: createUserType) => {
	try {
		const result = await sql.begin(async (sql) => {
			const response = await sql`
insert into users (username,password,email,role)
values(${username},${password},${email},${role})
returning *;
`;
			return response;
		});

		return result;
	} catch (err) {
		console.log(err);
		throw err;
	}
};

export const getUser = async ({
	username,
	password,
}: {
	username: string;
	password: string;
}) => {
	try {
		const response =
			await sql`select * from users where username = ${username}`;
		return response;
	} catch (err) {
		console.log(err);
		throw err;
	}
};

export const updateUser = async (userDetails: any, id: number) => {
	const columns = Object.keys(userDetails);

	const result = sql.begin(async (sql) => {
		try {
			const response = await sql`
update users set ${sql(userDetails, columns)} where user_id = ${id} returning *;
commit;
`;

			return response;
		} catch (err) {
			console.log(err);
			throw err;
		}
	});
};

export const deleteUser = async (username: string) => {
	try {
		const result = await sql.begin(async (sql) => {
			try {
				const response = await sql`

delete from users where username = ${username} returning * ;

`;

				return response;
			} catch (err) {
				console.log(err);
				throw err;
			}
		});
	} catch (err) {
		console.log(err);
		throw err;
	}
};
