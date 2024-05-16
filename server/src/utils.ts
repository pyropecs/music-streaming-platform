import bcrypt from "bcrypt";

export const encryptPassword = async (password: string) => {
	const SALT_ROUNDS = 10;
	const hash = await bcrypt.hash(password, SALT_ROUNDS);
	return hash;
};

export const checkUser = async (
	username: string,
	password: string,
	hash: string,
	dbUser: string,
) => {
		
		const isPasswordValid = await bcrypt.compare(password, hash);
		if (isPasswordValid) {
			return true;
		} else {
			return false;
		}
	
};
