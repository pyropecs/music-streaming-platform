import sql from "../db"
import bcrypt from "bcrypt"
type createUserType = {
	username:string;
	password:string;
	email:string;
	role:string;
}


export  const createUser =async ({username,password,email,role}:createUserType)=>{
try{


const response = await sql`
begin;
insert into users (username,password,email,role)
values(${username},${password},${email},${role})
returning username,role;
commit;
`
return response
}
catch(err){
	console.log(err)
}
}


export const getUser = async ({username,password}:{username:string,password:string})=>{
try{


const response = await sql`select username,password from users where username = ${username}`
return response
}catch(err){
	console.log(err)
}

}



export const updateUser = async (userDetails:any,id:number)=>{
const columns = Object.keys(userDetails);
try{


const response = await sql`
begin;
update users set ${sql(userDetails,columns)} where user_id = ${id} returning username;
commit;
`

return response;
}catch(err){
	console.log(err)
}

}

export const deleteUser = async (username:string)=>{
const response = await sql`
begin;
delete from users where username = ${username} returning ;
commit;
`



}
