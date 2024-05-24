import { Request, Router } from "express";
import {
	createUser,
	deleteUser,
	getUser,
	updateUser,
} from "../models/user-auth.model";
import { encryptPassword, checkUser } from "../utils";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/user-auth.middlewares";
import { body, validationResult, query } from "express-validator";
const router = Router();

router.post(
	"/register",
	body("username").isLength({ min: 3 }),
	body("email").isEmail(),
	body("password").isLength({ min: 8 }),
	async (req, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

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
						console.log(
							"there is no secret key in the environment",
						);
						res.status(500).send({
							message: "internal server error",
						});
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
	},
);

router.post(
	"/login",
	body("usernmae").notEmpty(),
	body("passworrd").notEmpty(),
	verifyToken,
	async (req, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

		try {
			const { username, password } = await req.body;
			const SECRET = process.env.SECRET;
			const query = await getUser({ username });
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
					res.status(401).send({
						message: "please check the password",
					});
				}
			} catch (err) {
				res.status(400).send({ message: err });
			}
		} catch (err) {
			res.status(500).send({ message: "internal server error" });
		}
	},
);

router.patch(
	"/role-switch",
	body("username").notEmpty(),
	body("role").isIn(["user", "creator"]),
	verifyToken,
	async (req, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

		const { username, role } = await req.body;
		try {
			const queries = await getUser({ username });
			const query = queries[0];
			const userId = query.user_id;
			const newRole = role;
			delete query.role;
			await updateUser({ ...query, role: newRole }, userId);
			res.status(200).send({
				message: `role changed successfully to ${newRole}`,
			});
		} catch (err) {
			console.log(err);
			res.status(500).send({ message: "internal server error" });
		}
	},
);

router.patch(
	"/username-change",
	body("oldUsername").notEmpty(),
	body("newUsername").notEmpty(),
	verifyToken,
	async (req, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

		const { oldUsername, newUsernme } = await req.body;
		try {
			const queries = await getUser({ username: oldUsername });
			const query = queries[0];
			const userId = query.user_id;

			delete query.username;
			await updateUser({ ...query, username: newUsernme }, userId);
			res.status(200).send({
				message: `role changed successfully to ${newUsernme}`,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({ message: "internal server error" });
		}
	},
);

type ReqQuery = { username?: string };
type SomeHandlerRequest = Request<{}, any, any, ReqQuery>;
router.get(
	"get-user",
	query("username").notEmpty(),
	verifyToken,
	async (req: SomeHandlerRequest, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

		const { username } = req.query;
		if (username) {
			try {
				const queries = await getUser({ username });
				const query = queries[0];
				delete query.password;
				res.status(200).send({ results: query });
			} catch (err) {
				console.log(err);
				res.status(500).send({ message: "internal server error" });
			}
		}
	},
);

router.delete(
	"/delete-user",
	body("username").notEmpty(),
	body("password").notEmpty(),
	verifyToken,
	async (req, res) => {
		const validationErrors = validationResult(req).array();
		if (validationErrors.length !== 0) {
			res.status(401).send({
				message: validationErrors,
			});
		}

		const { username, password } = req.body;
		try {
			const query = await getUser({ username });
			const hash = query[0].password;
			const dbUser = query[0].username;
			const checkUserisValid: boolean = await checkUser(
				username,
				password,
				hash,
				dbUser,
			);

			if (checkUserisValid) {
				const response = await deleteUser(username);
				res.status(200).send({ message: "user deleted sucessfully" });
			} else {
				res.status(400).send({ message: "password is incorrect" });
			}
		} catch (err) {
			console.log(err);
			res.status(500).send({ message: "internal server error" });
		}
	},
);

export default router;
