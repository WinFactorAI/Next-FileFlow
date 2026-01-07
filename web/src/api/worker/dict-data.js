import request from "../../common/request";
import Api from "../api";

class WorkDistDataApi extends Api{
    constructor() {
        super("worker/dict-data");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    list = async (type) => {
        let result = await request.get(`/${this.group}/${type}/list`);
        return result['data'];
    }
}

let workDistDataApi = new WorkDistDataApi();
export default workDistDataApi;