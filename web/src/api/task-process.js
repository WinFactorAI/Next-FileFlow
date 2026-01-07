import request from "../common/request";
import Api from "./api";

class TaskProcessApi extends Api{
    constructor() {
        super("task-process");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
}

let taskProcessApi = new TaskProcessApi();
export default taskProcessApi;