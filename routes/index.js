import { authRouter } from "./auth.router.js";  


export function routerLogin(app){
    app.use("/auth", authRouter)
}
