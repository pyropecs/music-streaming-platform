import { Router } from "express";
import { createUser, getUser } from "../models/user-auth.model";
import { encryptPassword, checkUser } from "../utils";
import jwt from "jsonwebtoken";
const SECRET = String(process.env.SECRET);
const router = Router();

router.post("/register", async (req, res) => {
	try {
		const { username, password, email, role } = await req.body;
		const hash = await encryptPassword(password);

		const query = await createUser({
			username,
			password: hash,
			email,
			role,
		});
		res.status(200).send({
			message: "user created successfully",
			results: query,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: "internal server error" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { username, password } = await req.body;

		const query = await getUser({ username, password });
		const hash = query[0].password;
		const dbUser = query[0].username;
		const checkUserisValid: boolean = await checkUser(
			username,
			password,
			hash,
			dbUser,
		);

		if (checkUserisValid) {
			const token = jwt.sign({ username }, SECRET, {
				expiresIn: "48h",
			});

			res.status(200).send({
				message: "user logged in successfully",
				token: token,
			});
		} else {
			res.status(401).send({ message: "please check the password" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: "internal server error" });
	}
});



export default router;