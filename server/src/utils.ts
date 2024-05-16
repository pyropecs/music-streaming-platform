import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
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

export const verifyToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.header("Authorization");
	const SECRET = String(process.env.SECRET);
	if (!token) return res.status(401).json({ error: "Access denied" });
	try {
		const decoded = verify(token, SECRET);
		if (decoded) {
			next();
		}

		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
};
