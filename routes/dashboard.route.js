import { app } from "../server"
import { dashboard } from "../controllers/dashboard.controller"
export const dashboardAPI = (app)=>{
    app.get('/dashboard', dashboard)
}