import request from "../common/request";
import Api from "./api";

class TaskApi extends Api{
    constructor() {
        super("task");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    approval = async (id, data) => {
        let result = await request.post(`/${this.group}/${id}/approval`,data);
        return result['code'] === 1;
    }
    revoke = async (id) => {
        let result = await request.post(`/${this.group}/${id}/revoke`);
        return result['code'] === 1;
   }
}

let taskApi = new TaskApi();
export default taskApi;