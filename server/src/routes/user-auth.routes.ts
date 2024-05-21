import { Router } from "express";
import { createUser, getUser } from "../models/user-auth.model";
import { encryptPassword, checkUser } from "../utils";
import jwt from "jsonwebtoken";

const router = Router();
router.post("/register", async (req, res) => {
	try {
		const { username, password, email, role } = await req.body;
		const SECRET = process.env.SECRET;
		if (username && password && email && role) {
			const hash = await encryptPassword(password);
			try {
				const query = await createUser({
					username,
					password: hash,
					email,
					role,
				});
				if (SECRET) {
					const token = jwt.sign({ username }, SECRET, {
						expiresIn: "48h",
					});
					res.status(200).send({
						message: "user created successfully",
						results: { query, token },
					});
				} else {
					console.log("there is no secret key in the environment");
					res.status(500).send({ message: "internal server error" });
				}
			} catch (err: any) {
				res.status(409).send({ message: err.detail });
			}
		} else {
			console.log(
				"body has no value or missing the requirements ",
				req.originalUrl,
				req.body,
			);
			res.status(400).send({
				message:
					"body has no value or missing the required valuees please ensure that these values username,email,password,role",
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: "internal server error" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { username, password } = await req.body;
		const SECRET = process.env.SECRET;
		const query = await getUser({ username, password });
		const hash = query[0].password;
		const dbUser = query[0].username;
		try {
			const checkUserisValid: boolean = await checkUser(
				username,
				password,
				hash,
				dbUser,
			);

			if (checkUserisValid && SECRET) {
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
			res.status(400).send({ message: err });
		}
	} catch (err) {
		res.status(500).send({ message: "internal server error" });
	}
});

export default router;
